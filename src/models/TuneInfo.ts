import { IPicture } from 'music-metadata/lib/type';
import { IAudioMetadata } from 'music-metadata';
// import '../../public/vinyl.png';

function pictureToHTML(picture: IPicture) {
  return "data:" + picture.format + ";base64," + picture.data.toString('base64');
}

const defaultCover: string = "/vinyl.png";

export class TuneInfo {
  public file?: string;
  public title?: string;
  public artist?: string;
  public album?: string;
  public track?: number;
  public genre?: string[];
  public bpm?: number;
  public duration?: number;
  public cover?: string;

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
    this.title = title ? title : undefined;
    this.artist = artist ? artist : undefined;
    this.album = album ? album : undefined;
    this.genre = genre ? this.genresToGenres(genre) : undefined;
    this.bpm = bpm ? Math.round(bpm) : undefined;
    this.cover = cover ? pictureToHTML(cover) : defaultCover;
  }

  public fillFromCommonTags(metadata: IAudioMetadata) {
    this.title = metadata.common.title;
    this.album = metadata.common.album;
    this.track = metadata.common.track.no;
    this.artist = metadata.common.artist;
    this.bpm = metadata.common.bpm ? Math.round(metadata.common.bpm) : undefined;
    this.genre = metadata.common.genre ? this.genresToGenres(metadata.common.genre) : undefined;
    this.duration = metadata.format.duration ? Math.round(metadata.format.duration) : undefined;
    this.cover = metadata.common.picture ? pictureToHTML(metadata.common.picture[0]) : defaultCover;
  }

  private genresToGenres(genre: string[]) {
    let newGenres: string[] = [];
    genre.forEach(element => {
      newGenres = newGenres.concat(element.split('+'));
    });
    return newGenres;
  }

}
