module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/ipc.js'
    }
  }
}
