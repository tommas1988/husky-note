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

class Notebook {
    rootNote: NoteGroup;

    constructor() {
        this.rootNote = new NoteGroup({ name: 'root_note_group', type: NoteType.Group});
    }

    load(noteMetas: NoteMeta[]): void {
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

export const instance = new Notebook();
