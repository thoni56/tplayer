import { IPicture } from 'music-metadata/lib/type';
import { ICommonTagsResult } from 'music-metadata';
import '../../public/vinyl.png';

function pictureToHTML(picture: IPicture) {
  return "data:" + picture.format + ";base64," + picture.data.toString('base64');
}

const defaultCover: string = "/vinyl.png";

export class TuneInfo {
  public title?: string;
  public artist?: string;
  public album?: string;
  public genre?: string;
  public bpm?: number;
  public cover?: string;
  public file?: string;

  constructor(file: string);
  constructor(
    file: string,
    title?: string,
    artist?: string,
    album?: string,
    genre?: string,         // TODO: allow more genres
    bpm?: number,
    cover?: IPicture
  ) {
    this.file = file;
    this.title = title && title || undefined;
    this.artist = artist && artist || undefined;
    this.album = album && album || undefined;
    this.genre = genre && genre[0] || '';
    this.bpm = bpm ? Math.round(bpm) : undefined;
    this.cover = cover ? pictureToHTML(cover) : defaultCover;
  }

  public fillFromCommonTags(tags: ICommonTagsResult) {
    this.title = tags.title;
    this.album = tags.album;
    this.artist = tags.artist;
    this.bpm = tags.bpm ? Math.round(tags.bpm) : undefined;
    this.genre = tags.genre ? tags.genre[0] : undefined;
  }

}
