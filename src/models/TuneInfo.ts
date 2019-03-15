import { IPicture } from 'music-metadata/lib/type';

export class TuneInfo {
  public title: string;
  public artist: string;
  public album: string;
  public genre: string;
  public bpm: number;
  public cover: IPicture | undefined;

  constructor(
    title: string,
    artist: string = 'unknown',
    album: string = 'unknown',
    genre: string = 'unknown',
    bpm: number = 0,
    cover: IPicture | undefined  // TODO: Perhaps load a pic from 'https://picsum.photos
  ) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.genre = genre;
    this.bpm = bpm;
    this.cover = cover ? cover : undefined;
  }
}
