const { listenerCount } = require('cluster');

module.exports = {
    configureWebpack: {
        devtool: 'source-map',
    },
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                artifactName: "${name}-Setup-${version}.${ext}",
                publish: [{
                    provider: 'github',
                    owner: 'thoni56',
                    repo: 'tplayer',
                    releaseType: 'release'
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
