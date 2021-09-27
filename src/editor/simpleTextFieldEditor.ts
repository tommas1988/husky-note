export class SimpleTextFieldEditor {
    private el: HTMLInputElement|HTMLTextAreaElement;

    constructor(el: HTMLInputElement|HTMLTextAreaElement) {
        if (el instanceof HTMLInputElement) {
            if (el.getAttribute('type') != 'text') {
                throw new Error('Only textarea and text input element is allowed');
            }
        }

        this.el = el;
    }

    private getSelection(): Selection {
        this.el.focus();
        const s = window.getSelection();
        if (s == null) {
            throw new Error('Cannot get Selection object');
        }
        
        return s;
    }

    movePointer(pos: number) {

    }

    copy(): string {

    }

    paste(): void {

    }
}