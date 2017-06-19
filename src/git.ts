import * as nodegit from 'nodegit';
import { GitConfig } from './config';
import ServiceLocator from './service-locator';
import * as moment from 'moment';

const Repository = nodegit.Repository;
const Signature = nodegit.Signature;
const Remote = nodegit.Remote;
const Graph = nodegit.Graph;
const Cred = nodegit.Cred;
const defaultRemote = 'origin';
const defaultBranch = 'master';

const logger = ServiceLocator.logger;

/**
 * Could only be called in main process
 */
export class Git {
    private _repository;

    constructor() {
        let noteDir = ServiceLocator.config.noteDir;

        if (!noteDir) {
            throw new Error('Cannot initialize Git without note directory setted!');
        }

        this._repository = Repository.open(noteDir).catch(() => {
            logger.info(`Creating repository ${noteDir}`);
            return Repository.init(noteDir, 0);
        });
    }

    setConfig(name, value) {
        logger.info(`Setting git config ${name} = ${value}`);

        this._repository.then((repo) => {
            return repo.config().then(((config) => {
                return config.setString(name, value);
            }));
        }).catch((e) => {
            logger.error(e);
        });
    }

    status() {
        return this._repository.then((repo) => {
            return repo.getStatus();
        });
    }

    addAll() {
        logger.info('Adding changes to stage');

        return this._repository.then((repo) => {
            return repo.index().then((index) => {
                return index.removeAll().then(() => {
                    return index.addAll();
                }).then(() => {
                    return index.write();
                }).then(() => {
                    return index.writeTree();
                })
            });
        });
    }

    commit(oid) {
        logger.info('Creating a commit');

        return this._repository.then((repo) => {
            return Promise.all<any, any>([
                repo.getTree(oid),
                repo.getHeadCommit()
            ]).then((result) => {
                let config = ServiceLocator.config.git;
                let signature = Signature.now(config.username, config.userEmail);
                return {
                    tree: result[0],
                    commit: result[1],
                    author: signature,
                    committer: signature,
                    message: `Write notes at ${moment().format('YYYY-MM-DD HH:mm:ss')}` // TODO: read from config
                };
            }).then((data) => {
                return repo.createCommit(
                    'HEAD',
                    data.author,
                    data.committer,
                    data.message,
                    data.tree,
                    data.commit ? [data.commit.id()] : []
                );
            });
        });
    }

    pull() {
        logger.info('Pulling from remote');

        return this._repository.then((repo) => {
            return this._getRemote(repo).then((remote) => {
                return remote.fetch(
                    [`refs/heads/${defaultBranch}:refs/heads/${defaultBranch}`],
                    {
                        callbacks: this._getRemoteCallbacks()
                    }
                );
            }).then(() => {
                return repo.mergeBranches(defaultBranch, `${defaultRemote}/${defaultBranch}`);
            });
        });
    }

    push() {
        logger.info('push method called');

        return this._repository.then((repo) => {
            return Promise.all<any, any>([
                repo.getBranchCommit(defaultBranch),
                repo.getBranchCommit(`${defaultRemote}/${defaultBranch}`)
            ]).then((commits) => {
                return Graph.aheadBehind(repo, commits[0].id(), commits[1].id());
            }).then((result) => {
                if (!result.ahead) {
                    // local branch is not ahead of remote, no need to push
                    return;
                }

                logger.info('Pushing to remote');

                return this._getRemote(repo).then((remote) => {
                    return remote.push(
                        [`refs/heads/${defaultBranch}:refs/heads/${defaultBranch}`],
                        {
                            callbacks: this._getRemoteCallbacks()
                        }
                    );
                });
            });
        });
    }

    private _getRemote(repo) {
        return repo.getRemote(defaultRemote).catch(() => {
            // not remote created yet
            let url = ServiceLocator.config.git.remote;
            if (!url) {
                throw new Error('remote url is not setted');
            }

            return Remote.create(repo, defaultRemote, url);
        });
    }

    private _getRemoteCallbacks() {
        return {
            credentials(url, username) {
                let config = this._config;

                let publicKey = config.sshPubKey;
                let privateKey = config.sshPrivKey;
                if (publicKey && privateKey) {
                    // user ssh key
                    logger.info('git credentials: use ssh key');
                    return Cred.sshKeyNew(username, publicKey, privateKey, '');
                }

                let remoteUsername = config.remoteUsername;
                let remotePassword = config.remotePassword;
                if (remoteUsername) {
                    // user password
                    logger.info('git credentials: use password');
                    return Cred.userpassPlaintextNew(remoteUsername, remotePassword);
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