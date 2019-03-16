import { IPicture } from 'music-metadata/lib/type';
import '../../public/vinyl.png';

function pictureToHTML(picture: IPicture) {
  return "data:" + picture.format + ";base64," + picture.data.toString('base64');
}

const defaultCover: string = "/vinyl.png";

export class TuneInfo {
  public title: string;
  public artist: string;
  public album: string;
  public genre: string;
  public bpm: number | undefined;
  public cover: string;

  constructor(
    title: string,
    artist: string = 'unknown',
    album: string = 'unknown',
    genre: string = '',         // TODO: allow more genres
    bpm: number = 0,
    cover: IPicture | undefined
  ) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.genre = genre;
    this.bpm = bpm ? Math.round(bpm) : undefined;
    this.cover = cover ? pictureToHTML(cover) : defaultCover;  // TODO: Perhaps pre-load a pic from 'https://picsum.photos
  }

}
