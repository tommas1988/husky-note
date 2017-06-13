import * as nodegit from 'nodegit';
import { GitConfig } from './config';

const Repository = nodegit.Repository;
const Signature = nodegit.Signature;
const Remote = nodegit.Remote;
const Graph = nodegit.Graph;
const Cred = nodegit.Cred;
const Config = nodegit.Config;
const defaultRemote = 'origin';
const defaultBranch = 'master';

/**
 * Could only be called in main process
 */
export class Git {
    private _config: GitConfig;
    private _repository;
    private _addResult;
    private _commitResult;
    private _pulled: boolean;

    constructor(repoPath: string, config: GitConfig) {
        this._config = config;
        this._repository = Repository.open(repoPath).catch(() => {
            return Repository.init(repoPath, 0);
        });
    }

    setConfig(name, value) {
        this._repository.then((repo) => {
            return Config.setString(name, value);
        });
    }

    status() {
        return this._repository.then((repo) => {
            return repo.getStatus();
        });
    }

    addAll() {
        this._addResult = this._repository.then((repo) => {
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

    commit() {
        if (!this._addResult) {
            throw new Error('No changes added to stage yet!');
        }

        this._commitResult = this._repository.then((repo) => {
            return this._addResult.then((oid) => {
                return Promise.all<any, any>([
                    repo.getTree(oid),
                    repo.getHeadCommit()
                ]);
            }).then((result) => {
                let config = this._config;
                let signature = Signature.now(config.username, config.userEmail);
                return {
                    tree: result[0],
                    commit: result[1],
                    author: signature,
                    committer: signature,
                    message: '' // TODO: read from config
                };
            }).then((data) => {
                // reset add result
                this._addResult = null;

                return repo.createCommit(
                    'HEAD',
                    data.author,
                    data.committer,
                    data.message,
                    data.tree,
                    [data.commit.id()]
                );
            });
        });
    }

    pull() {
        this._repository.then((repo) => {
            let commit = this._commitResult ? this._commitResult : Promise.resolve();

            return commit.then(() => {
                return this._getRemote(repo);
            }).then((remote) => {
                return remote.fetch(
                    [`refs/heads/${defaultBranch}:refs/heads/${defaultBranch}`],
                    {
                        callbacks: this._getRemoteCallbacks()
                    }
                );
            }).then(() => {
                this._pulled = true;
                return repo.mergeBranches(defaultBranch, `${defaultRemote}/${defaultBranch}`);
            });
        });
    }

    push() {
        if (!this._pulled) {
            throw new Error('push action should be called after pull action');
        }

        this._repository.then((repo) => {
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

                return this._getRemote(repo).then((remote) => {
                    // reset pulled flag
                    this._pulled = false;

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
            let url = this._config.remote;
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
                    return Cred.sshKeyNew(username, publicKey, privateKey, '');
                }

                let remoteUsername = config.remoteUsername;
                let remotePassword = config.remotePassword;
                if (remoteUsername) {
                    // user password
                    return Cred.userpassPlaintextNew(remoteUsername, remotePassword);
                }

                return Cred.defaultNew();
            },

            certificateCheck() {
                return 1;
            }
        };
    }
}