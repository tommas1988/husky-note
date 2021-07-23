const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['markdown']
      })
    ]
  },
  transpileDependencies: [
    'vuetify'
  ]
}
