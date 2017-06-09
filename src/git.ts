import * as nodegit from 'nodegit';
import ServiceLocator from './service-locator';

const Repository = nodegit.Repository;
const Signature = nodegit.Signature;
const Remote = nodegit.Remote;
const Graph = nodegit.Graph;
const Cred = nodegit.Cred;
const defaultRemote = 'origin';
const defaultBranch = 'master';

export class Git {
    private _repository;
    private _addResult;
    private _commitResult;

    constructor() {
        let path = ServiceLocator.config.noteDir;
        this._repository = Repository.open(path).catch(() => {
            return Repository.init(path, 0);
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
                let config = ServiceLocator.config.git;
                let signature = Signature.now(config.userName, config.userEmail);
                return {
                    tree: result[0],
                    commit: result[1],
                    author: signature,
                    committer: signature,
                    message: '' // TODO: read from config
                };
            }).then((data) => {
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
            return this._getRemote(repo).then((remote) => {
                remote.fetch(
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
        this._repository.then((repo) => {
            return this._getRemote(repo).then((remote) => {
                remote.push(
                    [`refs/heads/${defaultBranch}:refs/heads/${defaultBranch}`],
                    {
                        callbacks: this._getRemoteCallbacks()
                    }
                );
            });
        });
    }

    private _aheadBehind(repo) {
        return Promise.all<any, any>([
            repo.getBranchCommit(defaultBranch),
            repo.getBranchCommit(`${defaultRemote}/${defaultBranch}`)
        ]).then((commits) => {
            return Graph.aheadBehind(repo, commits[0].id(), commits[1].id());
        }).then((result) => {
            return {
                localAhead: result.ahead !== 0,
                remoteAhead: result.behind !== 0
            };
        })
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
                let config = ServiceLocator.config.git;

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