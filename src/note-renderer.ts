import { MarkdownIt, Ruler } from 'markdown-it';
import { getLanguage, highlight } from 'highlight.js';
import { Note } from './note';

export interface IOutlineHeader {
    level: number;
    line: number;
    title: string;
}

export interface IRenderResult {
    content: string;
    outlineHeaders: IOutlineHeader[];
    blockCodeLines: number[];
}

export class NoteRenderer {
    private _engine: MarkdownIt;

    private _outlineHeaders: IOutlineHeader[];
    private _blockCodeLines: number[];

    constructor() {
        this._initMarkdownEngine();
    }

    private _initMarkdownEngine() {
        const MarkdownIt = require('markdown-it');
        let engine: MarkdownIt;

        this._engine = engine = new MarkdownIt('commonmark');

        engine.set({
            highlight: (str: string, lang: string) => {
                if (lang && getLanguage(lang)) {
                    try {
                        return highlight(lang, str).value;
                    } catch (error) { }
                }
                return '';
            }
        });

        engine.renderer.rules.heading_open = (tokens: any, idx: number, options: any, env: any, self: any) => {
            let headingOpenToken = tokens[idx];
            let headingInlineToken = tokens[idx + 1];

            this._parseOutlineHeader(headingInlineToken.content,
                headingOpenToken.markup.length,
                headingOpenToken.attrGet('data-line'));

            return self.renderToken(tokens, idx, options, env, self);
        };

        for (const ruleName of ['paragraph_open',
            'heading_open',
            'image',
            'code_block',
            'blockquote_open',
            'list_item_open'
        ]) {
            this._addLineNumberRenderer(ruleName);
        }
    }

    render(note: Note): IRenderResult {
        // reset outline header containers and block code lines
        this._outlineHeaders = [];
        this._blockCodeLines = [];

        return {
            content: this._engine.render(note.content),
            outlineHeaders: this._outlineHeaders,
            blockCodeLines: this._blockCodeLines,
        };
    }

    private _parseOutlineHeader(title: string, level: number, line: number) {
        const START_OUTLINE_HEADER_LEVEL = 2;
        if (level <= START_OUTLINE_HEADER_LEVEL) {
            this._outlineHeaders.push({ level, line, title });
        }
    }

    private _addLineNumberRenderer(ruleName: string): void {
        const engine = this._engine;
        const original = engine.renderer.rules[ruleName];

        engine.renderer.rules[ruleName] = (tokens: any, idx: number, options: any, env: any, self: any) => {
            const token = tokens[idx];
            if (token.map && token.map.length) {
                let codeLine = token.map[0] + 1;
                token.attrSet('data-line', codeLine);
                this._blockCodeLines.push(codeLine);
            }

            if (original) {
                return original(tokens, idx, options, env, self);
            } else {
                return self.renderToken(tokens, idx, options, env, self);
            }
        };
    };
}