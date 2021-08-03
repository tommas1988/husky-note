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

interface NoteInterface {
    name: string;
}

abstract class AbstractNote implements NoteInterface {
    name: string;

    constructor(meta: NoteMeta) {
        this.name = meta.name;
    }

    abstract rename(name: string): boolean;
    abstract remove(): boolean;
}

export class NoteFile extends AbstractNote {
    constructor(meta: NoteMeta) {
        super(meta);
    }

    rename(name: string): boolean {
        return true;
    }

    remove(): boolean {
        return true;
    }

    edit() {

    }

    save() {
        return true;
    }
}

export class NoteGroup extends AbstractNote {
    private notes: NoteInterface[] = [];

    constructor(meta: NoteMeta) {
        super(meta);
    }

    rename(name: string): boolean {
        return true;
    }

    remove(): boolean {
        return true;
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
    rootNote: NoteGroup;

    private baseDir: string;

    constructor(dir: string) {
        this.baseDir = dir;
        this.rootNote = new NoteGroup({ name: 'root_note_group', type: NoteType.Group});
    }

    load(): boolean {
        let content = window.nodeApi.fs.readFileSync(`${this.baseDir}/${note_meta_filename}`, {
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

function buildNoteTree(root: NoteGroup, meta: NoteMeta) {
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
