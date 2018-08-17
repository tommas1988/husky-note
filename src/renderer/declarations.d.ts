/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

declare const Monaco: typeof monaco;

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'iview' {
    const iview: any;
    export default iview;
}