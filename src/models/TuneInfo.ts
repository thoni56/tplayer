import { IPicture } from 'music-metadata/lib/type';
import { IAudioMetadata } from 'music-metadata';

function pictureToHTML(picture: IPicture) {
    return 'data:' + picture.format + ';base64,' + picture.data.toString('base64');
}

export class TuneInfo {
    public file: string;
    public title?: string;
    public artist?: string;
    public album?: string;
    public track?: number;
    public genre?: string[];
    public bpm?: number;
    public duration?: number;
    public cover?: string;
    public coverLoaded?: boolean; // Flag to indicate if real cover has been loaded

    constructor(file: string);
    constructor(
        file: string,
        title?: string,
        artist?: string,
        album?: string,
        genre?: string[],
        bpm?: number,
        cover?: IPicture
    ) {
        this.file = file;
        this.title = title ? title : '';
        this.artist = artist ? artist : '';
        this.album = album ? album : '';
        this.genre = genre ? this.genresToGenres(genre) : [];
        this.bpm = bpm ? Math.round(bpm) : undefined;
        this.cover = ''; // Will be set by the application after construction
        this.coverLoaded = false; // Real cover not loaded yet
    }

    public fillFromCommonTags(metadata: IAudioMetadata) {
        this.title = metadata.common.title ? metadata.common.title : '';
        this.album = metadata.common.album ? metadata.common.album : '';
        this.track = metadata.common.track.no ? metadata.common.track.no : undefined;
        this.artist = metadata.common.artist ? metadata.common.artist : '';
        this.bpm = metadata.common.bpm ? Math.round(metadata.common.bpm) : undefined;
        this.genre = metadata.common.genre ? this.genresToGenres(metadata.common.genre) : undefined;
        this.duration = metadata.format.duration ? Math.round(metadata.format.duration) : undefined;
        // Note: .cover is set in constructor and only changed when real cover is loaded
        // Note: .coverLoaded remains false until real cover is loaded
    }

    private genresToGenres(genre: string[]) {
        let newGenres: string[] = [];
        genre.forEach((element) => {
            newGenres = newGenres.concat(element.split('+'));
        });
        return newGenres;
    }
}
