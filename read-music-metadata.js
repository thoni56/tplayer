// Simple node.js program to read a lot of files in the testdata directory
// with music-metadata to ensure the metadata can be read
//
//     node read-music-metadata.js
//

const wd = require('walkdir');
const mm = require('music-metadata');
const fs = require('fs');

const files = [];

function discoverTunes(directory) {
    let emitter;
    emitter = wd.walk(directory, { follow_symlinks: true });
    emitter.on('file', (path) => {
        if (path.endsWith('.mp3') || path.endsWith('.m4a') || path.endsWith('.mp4')) {
            files.push(path);
        }
    });
    emitter.on('end', () => {
        readMetadataForAllFiles();
    });
    emitter.on('error', (path) => {
        // tslint:disable-next-line:no-console
        console.log("Error reading file '", path, "'");
    });
}

async function readMetadataForAllFiles() {
    const all = new Array(files.length);
    for (const file of files) {
        mm.parseFile(file).then(
            (metadata) => {
                process.stdout.write('.');
            },
            (error) => {
                // tslint:disable-next-line: no-console
                console.log('\n*** Could not read metadata from ', file);
            }
        );
    }
}

async function main() {
    if (process.argv.length !== 3) {
        const scriptName = process.argv[1].split('\\').pop().split('/').pop();
        console.log('Usage: node ${scriptName} <directory>');
    } else {
        const path = process.argv[2];
        if (fs.lstatSync(path).isDirectory()) {
            discoverTunes(path);
            readMetadataForAllFiles();
        } else {
            mm.parseFile(path).then(
                (metadata) => {
                    console.log(metadata);
                },
                (error) => {
                    console.log('Could not read metadata from ', path);
                }
            );
        }
    }
}

main();
