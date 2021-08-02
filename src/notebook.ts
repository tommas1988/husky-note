// TODO: move this service into main process?
// or is there a way to auto add node module to window
// or create a proxy to run in main process and delegate all node module call from renderer process

export enum NoteType {
    File = 'file',
    Group = 'group',
};

interface NoteMeta {
    name: string;
    type: string;

    notes?: NoteMeta[];
}

export interface NoteInterface {
    name: string;

    rename(name: string): boolean;
    remove(): boolean;
}

export interface NoteFileInterface extends NoteInterface {
    edit(): void;
    save(): boolean;
}

export interface NoteGroupInterface extends NoteInterface {
    add(note: NoteInterface): boolean;
    removeNote(note: NoteInterface): boolean;
}

abstract class AbstractNote implements NoteInterface {
    name: string;

    constructor(meta: NoteMeta) {
        this.name = meta.name;
    }

    rename(name: string): boolean {
        return true;
    }

    remove(): boolean {
        return true;
    }
}

class NoteFile extends AbstractNote implements NoteFileInterface {
    constructor(meta: NoteMeta) {
        super(meta);
    }

    edit() {

    }

    save() {
        return true;
    }
}

class NoteGroup extends AbstractNote implements NoteGroupInterface {
    private notes: NoteInterface[] = [];

    constructor(meta: NoteMeta) {
        super(meta);
    }

    add(note: NoteInterface) {
        this.notes.push(note);
        return true;
    }

    removeNote(note: NoteInterface): boolean {
        return true;
    }
}

const note_meta_filename = '.husky.json';

class Notebook {
    rootNote: NoteGroupInterface;

    private baseDir: string;

    constructor(dir: string) {
        this.baseDir = dir;
        this.rootNote = new NoteGroup({ name: 'root_note_group', type: NoteType.Group});
    }

    load(): boolean {
        debugger;
        let content = window.readFileSync(`${this.baseDir}/${note_meta_filename}`, {
            encoding: 'utf8'
        });
        let config = JSON.parse(content);
        let meta = config.notes;
        this.build(meta);
        return true;

    }

    private build(noteMetas: NoteMeta[]) {
        for (let i = 0; i < noteMetas.length; i++) {
            buildNoteTree(this.rootNote, noteMetas[i]);
        }
    }
}

function buildNoteTree(root: NoteGroupInterface, meta: NoteMeta) {
    let note: NoteInterface;

    if (meta.type == NoteType.File) {
        note = new NoteFile(meta);
    } else if (meta.type == NoteType.Group) {
        note = new NoteGroup(meta);
        let noteMetas = meta.notes || [];
        for (let i = 0; i < noteMetas.length; i++) {
            buildNoteTree(note as NoteGroup, noteMetas[i]);
        }
    } else {
        console.log(meta);
        throw 'Unknown meta item';
    }

    root.add(note);
}

const testDir = './test/notebook/';
export const instance = new Notebook(testDir);
