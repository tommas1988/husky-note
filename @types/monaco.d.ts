declare module 'monaco-editor/esm/vs/platform/registry/common/platform' {
    export interface IRegistry {

        /**
         * Adds the extension functions and properties defined by data to the
         * platform. The provided id must be unique.
         * @param id a unique identifier
         * @param data a contribution
         */
        add(id: string, data: any): void;

        /**
         * Returns true iff there is an extension with the provided id.
         * @param id an extension identifier
         */
        knows(id: string): boolean;

        /**
         * Returns the extension functions and properties defined by the specified key or null.
         * @param id an extension identifier
         */
        as<T>(id: string): T;
    }

    export const Registry: IRegistry;
}

declare module 'monaco-editor/esm/vs/base/browser/dom' {
    export class DomListener {
        _type: string;
    }
}