import * as marked from 'marked';

export class NoteRenderer {
    constructor() {
        marked.setOptions({
            renderer: new marked.Renderer(),
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