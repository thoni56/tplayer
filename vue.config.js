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
        },
        win: {
          target: 'nsis',
          icon: './public/tplayer.ico',
          certificateFile: process.env.CERTIFICATE_WINPATH,
          certificatePassword: process.env.CERTIFICATE_PASSWORD,
        }
      }
    }
  },
}
