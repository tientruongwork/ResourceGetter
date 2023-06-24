import { pipe, compact, last } from "lodash/fp";
import fetch from "node-fetch";
import cheerio from "cheerio";
import { get } from "lodash";
import { exec } from "child_process";

import {
  IPinterestResponse,
  IPinterestVideoType,
} from "@interfaces/IPinterestDownload";
import { Common } from "@common/Common";
import { BaseController } from "./BaseController";

class PinterestDownloadController extends BaseController {
  private _pinterestId: string;
  private _url: string;

  constructor(serviceId: string, url: string) {
    super(serviceId);

    this._url = url;

    const pinterestId = this.getPinterestIdFromUrl(url);
    this._pinterestId = pinterestId;
  }

  protected buildStoragePath(serviceId: string): string {
    return `storage/${serviceId}/${serviceId}.mp4`;
  }

  protected override preDownload(): void {
    if (!this.isServiceIdValid()) {
      throw new Error("serviceId not found");
    }

    this.createStorage();
  }

  public getPinterestId(): string {
    return this._pinterestId;
  }

  private getPinterestIdFromUrl(url: string): string {
    return `${pipe(compact, last)(url.split("/"))}`;
  }

  private getRawM3U8Data(plainHTML: string): any {
    const $pageContent = cheerio.load(plainHTML);
    const rawM3U8Data = $pageContent("#__PWS_DATA__").contents().text();
    return JSON.parse(rawM3U8Data);
  }

  private dropUnnecessaryData(m3u8: any): IPinterestResponse {
    const dataPath = `props.initialReduxState.pins.${this._pinterestId}.videos.video_list`;
    const optimizedM3U8Data: IPinterestResponse = get(m3u8, dataPath);
    return optimizedM3U8Data;
  }

  private async getM3U8Info(url: string): Promise<IPinterestResponse> {
    const parsedUrl = new URL(url);

    const plainHTML = await (await fetch(parsedUrl, { method: "GET" })).text();

    const rawM3U8Data = this.getRawM3U8Data(plainHTML);
    const videoList = this.dropUnnecessaryData(rawM3U8Data);
    if (!videoList) return await this.getM3U8Info(url);

    return videoList;
  }

  private convertM3U8ToMp4(
    m3u8Url: string,
    pinterestId: string
  ): Promise<string> {
    return new Promise((resolve) => {
      const ffmpegPath = Common.getFfmpegPath();

      const output = `${this.getStoragePath()}/${pinterestId}.mp4`;
      exec(
        `${ffmpegPath} -i ${m3u8Url} ${output}`,
        { shell: "powershell.exe" },
        (error) => {
          if (!error) {
            resolve(output);
          }
        }
      );
    });
  }

  public async download(videoType: IPinterestVideoType): Promise<string> {
    this.preDownload();
    const videoList = await this.getM3U8Info(this._url);
    const videoWithTypeData = videoList[videoType];
    const downloadPath = await this.convertM3U8ToMp4(
      videoWithTypeData.url,
      this._pinterestId
    );
    return downloadPath;
  }
}

export { PinterestDownloadController };
