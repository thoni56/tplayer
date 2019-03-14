import walk from 'walkdir';
import { TuneInfo } from './TuneInfo';
import { Vue } from 'vue-property-decorator';
import { EventBus } from '@/EventBus';

export default class TuneFinder extends Vue {
    private tunes: TuneInfo[] = [];

    public findTunesFrom(directory: string) {
        const emitter = walk('C:/Users/Thomas/Music/iTunes/iTunes Media/Music');
        emitter.on('file', (path: string, stat) => {
            this.addTune(path);
        })
        emitter.on('end', () => {
            emitter.end();
        })
        emitter.on('error', (path: string, error: string) => {
            console.log('ERROR: ', error)
        })
    }

    private addTune(path: string) {
        EventBus.$emit('addTune', new TuneInfo(path));
    }
}