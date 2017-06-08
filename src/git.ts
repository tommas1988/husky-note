import * as NoteGit from 'nodegit';
import { sep } from 'path';
import ServiceLocator from './service-locator';
import { existsSync } from 'fs';

export class Git {
    private _repository;

    get hasReopsitory(): boolean {
        return existsSync(`${ServiceLocator.config.noteDir}${sep}.git`);
    }

    constructor() {
    }

    init() {

    }

    addAll() {

    }

    commit() {

    }

    setRemote(url: string) {

    }

    pull() {

    }

    push() {

    }
}