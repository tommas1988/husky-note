import * as marked from 'marked';
import { highlightAuto } from 'highlight.js';
import { Note } from './note';

export interface IOutlineHeader {
    id: string;
    level: number;
    content: string;
}

export interface IRenderResult {
    content: string;
    outlineHeaders: IOutlineHeader[];
}

export class NoteRenderer {
    private _outlineHeaders: IOutlineHeader[];
    private _outlineHeaderPrefix: string;

    constructor() {
        let renderer = new marked.Renderer();
        renderer.heading = this._renderHeader.bind(this);

        marked.setOptions({
            renderer: renderer,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            highlight: this._codeHighlight.bind(this),
        });
    }

    render(note: Note): IRenderResult {
        // reset outline header prefix and containers
        this._outlineHeaderPrefix = note.notebook ? `${note.notebook.name}-${note.name}-` : 'orphan-note-';
        this._outlineHeaders = [];

        return {
            content: marked(note.content),
            outlineHeaders: this._outlineHeaders
        };
    }

    private _renderHeader(text: string, level: number, raw: string): string {
        const START_OUTLINE_HEADER_LEVEL = 2;

        let html = `<h${level}`;

        if (level <= START_OUTLINE_HEADER_LEVEL) {
            let id = this._outlineHeaderPrefix + text;
            this._outlineHeaders.push({ id, level, content: text });
            html += ` id="${id}"`;
        }

        html += `>${text}</h${level}>`;

        return html;
    }

    private _codeHighlight(code: string, lang: string): string {
        return highlightAuto(code, [lang]).value;
    }
}