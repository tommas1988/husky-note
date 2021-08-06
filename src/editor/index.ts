import { Command } from '../command';
import { MonacoEditor } from './monaco-editor';

export interface EditorOptions {
    theme: string;
}

export interface Dimension {
    width: number,
    height: number,
}

interface EditorInterface {
    attatchOnDom(dom: HTMLElement, options: EditorOptions): void;
    resize(dimension: Dimension): void;
    getEngine(): any;
    revealCommands(): Command[];
}

export const instance = new MonacoEditor();
