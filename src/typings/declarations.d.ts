/// <reference path="../renderer/editor/monaco/vs/monaco.d.ts" />

declare const Monaco: typeof monaco;

declare function clearInterval(handle?: number): void;
declare function clearTimeout(handle?: number): void;
declare function setInterval(handler: (...args: any[]) => void, timeout: number): number;
declare function setInterval(handler: any, timeout?: any, ...args: any[]): number;
declare function setTimeout(handler: (...args: any[]) => void, timeout: number): number;
declare function setTimeout(handler: any, timeout?: any, ...args: any[]): number;

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'iview' {
    const iview: any;
    export default iview;
}