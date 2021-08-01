import { readFile, writeFile } as fs from 'fs/promises';

export enum NoteType = {
    File = 1,
    Group,
};

interface NoteMeta {
    name: string;
    type: string;

    notes?: NoteMeta[];
}

export interface BaseNoteInterface {
    name: string;
    type: string;

    rename(name: string): void;
    remove(): void;
}

export interface NoteFileInterface extends NoteBaseInterface {
    edit(): void;
    save(): void;
}

export interface NoteGroupInterface extends NoteBaseInterface {
    add(note: BaseNoteInterface): void;
    removeItem(note: BaseNoteInterface);
}

class NoteFile implement NoteFileInterface {
    constructor(meta: NoteMeta) {
        this.name = meta.name;
    }
}

class NoteGroup implement NoteGroupInterface {
    constructor(meta: NoteMeta) {
        this.name = meta.name;
        buildNoteTree(this, meta.notes);
    }
}

const note_meta_filename = '.husky.json';

class Notebook {
    private baseDir: string;
    private rootNote: NoteGroupInterface;

    constructor(dir: string) {
        this.baseDir = dir;
        this.rootNote = new NoteGroup();
    }

    sync load(): boolean {
        return readFile(`${this.baseDir}/${note_meta_filename}`)
            .then(function(content) {
                let meta = JSON.parse(content);
                this.build(meta);
                return true;
            }).catch(function(e) {
                return false;
            });
    }

    private build(meta: any) {
        for (let item in meta) {
            let note: BaseNoteInterface;
            if (item.type == NoteType.Note) {
                note = new NoteFile(item);
            } else if (item.type == NoteType.Group) {
                note = new NoteGroup(item);
            } else {
                console.log(item);
                throw 'Unknown meta item';
            }

            this.rootNote.add(note.name, note.type);
        }
    }
}

function buildNoteTree(root: NoteGroupInterface, meta: NoteMeta) {
    let note: BaseNoteInterface;

    if (meta.type == NoteType.Note) {
        note = new NoteFile(meta);
    } else if (meta.type == NoteType.Group) {
        note = new NoteGroup(meta);
    } else {
        console.log(meta);
        throw 'Unknown meta item';
    }

    root.add(note);
}
