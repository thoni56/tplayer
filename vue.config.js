const { listenerCount } = require("cluster")

module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        linux: {
          target: [
            'deb',
            'AppImage',
            'deb',
          ]
        }
      }
    }
  },
}
