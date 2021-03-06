import { EventEmitter } from 'events';
import { existsSync } from 'fs';
import { move } from 'fs-promise';
import { app } from 'electron';
import { sep } from 'path';
import * as nodegit from 'nodegit';
import { GitConfig } from './config';
import ServiceLocator from './service-locator';
import * as moment from 'moment';

const Clone = nodegit.Clone;
const CheckoutOptions = nodegit.CheckoutOptions;
const Repository = nodegit.Repository;
const Index = nodegit.Index;
const Signature = nodegit.Signature;
const Remote = nodegit.Remote;
const Graph = nodegit.Graph;
const Cred = nodegit.Cred;
const defaultRemote = 'origin';
const defaultBranch = 'master';

const logger = ServiceLocator.logger;

export const Event = {
    setConfigFailed: 'git:set-config-failed',
    setRemoteFailed: 'git:set-remote-failed',
}

function clone(url, path, options): Promise<any> {
    let tmpdir = `${app.getPath('temp')}${sep}_husk_notes`;
    return Clone(url, tmpdir, options).then(() => {
        return move(tmpdir, path);
    }).then(() => {
        return Repository.open(path);
    });
}

/**
 * Could only be called in main process
 */
export class Git extends EventEmitter {
    private _repository;
    private _remote;

    constructor() {
        let noteDir = ServiceLocator.config.noteDir;
        if (!noteDir) {
            throw new Error('Cannot initialize Git without note directory setted!');
        }

        super();
    }

    hasRepository() {
        return existsSync(`${ServiceLocator.config.noteDir}${sep}.git`);
    }

    setConfig(name, value) {
        this._getRepository().then((repo) => {
            logger.info(`Setting git config ${name} = ${value}`);
            return repo.config().then(((config) => {
                return config.setString(name, value);
            }));
        }).catch((e) => {
            this.emit(Event.setConfigFailed, name, value);
            logger.error(e);
        });
    }

    setRemote(url) {
        logger.info('setRemote method called');

        this._getRepository().then((repo) => {
            this._getRemote(repo).then((remote) => {
                logger.info('set url with exists remote');

                let ret = Remote.setUrl(repo, defaultRemote, url);
                if (ret) {
                    throw ret;
                }
            }, () => {
                logger.info('create remote');
                this._remote = Remote.create(repo, defaultRemote, url);
            });
        }).catch((e) => {
            this.emit(Event.setRemoteFailed, url);
            logger.error(e);
        });
    }

    status() {
        logger.info('status method called');

        return this._getRepository().then((repo) => {
            return repo.getStatus();
        });
    }

    addAll() {
        logger.info('addAll method called');

        return this._getRepository().then((repo) => {
            return repo.index().then((index) => {
                logger.info('removing all...');
                return index.removeAll().then(() => {
                    logger.info('adding all...');
                    return index.addAll();
                }).then(() => {
                    logger.info('writing...');
                    return index.write();
                }).then(() => {
                    logger.info('writing tree...');
                    return index.writeTree();
                })
            });
        });
    }

    commit(oid) {
        logger.info('commit method called');

        return this._getRepository().then((repo) => {
            return repo.getHeadCommit().then((head) => {
                let signature = this._getSignature();
                return {
                    parents: head ? [head] : [],
                    author: signature,
                    committer: signature,
                    message: `Write notes at ${moment().format('YYYY-MM-DD HH:mm:ss')}` // TODO: read from config
                };
            }).then((result) => {
                logger.info('Creating a commit');
                return repo.createCommit(
                    'HEAD',
                    result.author,
                    result.committer,
                    result.message,
                    oid,
                    result.parents
                );
            });
        });
    }

    pull() {
        logger.info('pull method called');

        return this._getRepository().then((repo) => {
            logger.info('Fetching from remote...');

            let fetchOptions = {
                callbacks: this._getRemoteCallbacks()
            };
            return repo.fetch(defaultRemote, fetchOptions).then(() => {
                return Promise.all<any, any>([
                    repo.getBranchCommit(defaultBranch),
                    repo.getBranchCommit(`${defaultRemote}/${defaultBranch}`)
                ]);
            }).then((commits) => {
                return Graph.aheadBehind(repo, commits[0].id(), commits[1].id());
            }).then((result) => {
                let mergePromise = result.behind ? repo.mergeBranches(defaultBranch, `${defaultRemote}/${defaultBranch}`, this._getSignature()) : Promise.resolve();

                return mergePromise.then((mergeResult) => {
                    if (!mergeResult) {
                        return;
                    }

                    if (mergeResult instanceof Index) {
                        throw new Error(`Merge conflicts`);
                    }

                    logger.info('Merged remote to local branch');
                }).then(() => {
                    return {
                        localChanged: result.ahead === 1,
                        localUpdated: result.behind === 1
                    };
                });
            });
        });
    }

    push() {
        logger.info('push method called');

        return this._getRepository().then((repo) => {
            logger.info('Pushing to remote...');

            return this._getRemote(repo).then((remote) => {
                return remote.push(
                    [`refs/heads/${defaultBranch}:refs/heads/${defaultBranch}`],
                    {
                        callbacks: this._getRemoteCallbacks()
                    }
                );
            });
        });
    }

    private _getRepository() {
        if (this._repository) {
            return this._repository;
        }

        let noteDir = ServiceLocator.config.noteDir;
        let config = ServiceLocator.config.git;
        if (!this.hasRepository()) {
            if (config.remote) {
                logger.info(`cloning from remote: ${config.remote}...`);

                let checkoutOpts = new CheckoutOptions();
                checkoutOpts.disableFilters = 1;
                checkoutOpts.checkoutStrategy = 1;

                let fetchOpts = {
                    callbacks: this._getRemoteCallbacks()
                };

                this._repository = clone(config.remote, noteDir, { checkoutOpts, fetchOpts });
            } else {
                logger.info(`Creating repository ${noteDir}`);
                this._repository = Repository.init(noteDir, 0);
            }
        } else {
            this._repository = Repository.open(noteDir);
        }

        return this._repository;
    }

    private _getSignature() {
        let config = ServiceLocator.config.git;
        return Signature.now(config.username, config.userEmail);
    }

    private _getRemote(repo) {
        if (!this._remote) {
            this._remote = repo.getRemote(defaultRemote);
        }
        return this._remote;
    }

    private _getRemoteCallbacks() {
        return {
            credentials(url, username) {
                let config = ServiceLocator.config.git.remoteAuth;

                if (config.type === 'ssh') {
                    // user ssh key
                    logger.info('git credentials: use ssh key');
                    return Cred.sshKeyNew(username, config.publicKey, config.privateKey, '');
                } else if (config.type === 'password') {
                    // user password
                    logger.info('git credentials: use password');
                    return Cred.userpassPlaintextNew(config.username, config.password);
                }

                logger.info('git credentials: use default');
                return Cred.defaultNew();
            },

            certificateCheck() {
                return 1;
            }
        };
    }
}