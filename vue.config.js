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
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      preload: 'src/preload.js',
    }
  }
}
