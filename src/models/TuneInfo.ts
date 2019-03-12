export class TuneInfo {
  public title: string;
  public artist: string;
  public album: string;
  public genre: string;
  public bpm: number;
  public art: string;

  constructor(
    title: string,
    artist: string = 'unknown',
    album: string = 'unknown',
    genre: string = 'unknown',
    bpm: number = 0,
    art: string = 'https://picsum.photos/200/?random'
  ) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.genre = genre;
    this.bpm = bpm;
    this.art = art;
  }
}
