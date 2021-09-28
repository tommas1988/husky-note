import { Context, ContextManager } from '@/context';
import { MonacoEditor } from './monaco';

export const EDITOR_CONTEXT_NAME = 'editor';

export interface EditorOptions {
    theme: string;
}

export interface Dimension {
    width: number,
    height: number,
}

export interface EditorInterface {
    attatchOnDom(dom: HTMLElement, options: EditorOptions): void;
    resize(dimension: Dimension): void;
    getEngine(): any;
    getContext(): Context;
}

export const instance = new MonacoEditor();
ContextManager.INSTANCE.registerContext(instance.getContext());
