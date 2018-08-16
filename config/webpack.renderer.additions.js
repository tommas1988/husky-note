//const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

//require('console').log('==============================');

module.exports = {
    entry: {
        "monaco-loader": './src/renderer/monaco-loader.js',
        "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
		"json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
		"css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
		"html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
		"ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },

    module: {
        rules: [
            {
                test: /monaco-loader.js$/,
            },
            {
                test: /monaco-editor*.js$/,
            }
        ]
    },
    resolve: {
        mainFields: ["module", "main"]
    },
}