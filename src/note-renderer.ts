import * as marked from 'marked';

const renderer = new marked.Renderer();
renderer.heading = (text: string, level: number, raw: string): string => {
    return `<h${level}>${text}</h${level}>`;
};

export class NoteRenderer {
    constructor() {
        marked.setOptions({
            renderer: renderer,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });
    }

    render(stream: string): string {
        return marked(stream);
    }
}