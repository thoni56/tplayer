const { listenerCount } = require('cluster');

module.exports = {
    configureWebpack: {
        devtool: 'source-map',
    },
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                publish: [{
                    provider: 'github',
                    owner: 'thoni56',
                    repo: 'tplayer'
                }],
                linux: {
                    target: ['snap', 'AppImage', 'deb'],
                    icon: './public/tplayer.png',
                },
                win: {
                    target: 'nsis',
                    icon: './public/tplayer.ico',
                    certificateSubjectName: "Open Source Developer, Thomas Nilefalk"
                },
            },
        },
    },
};
