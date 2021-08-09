const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['markdown', 'json']
      })
    ]
  },
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      mainProcessFile: 'src/main.ts',
      rendererProcessFile: 'src/app.ts',
      //preload: 'src/preload.js',
    }
  }
}
