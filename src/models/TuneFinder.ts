import walk from 'walkdir';
import { TuneInfo } from './TuneInfo';

export default class TuneFinder {
    private tunes: TuneInfo[] = [];

    public findTunesFrom(directory: string) {
        const emitter = walk('C:/Users/Thomas/Music/iTunes/iTunes Media/Music', {});
        emitter.on('file', (path, stat) => {
            this.tunes.push(new TuneInfo(path))
        });
        emitter.on('end', () => {
            return this.tunes;
        })
        emitter.on('error', (path: string, error: string) => {
            console.log('ERROR: ', error)
        })
    }
}