import fs from "fs";
import { exec } from "child_process";
import ytdl from "ytdl-core";
import pick from "lodash/pick";

import {
  IYoutubeDownloadQuality,
  IYoutubeVideoInfo,
} from "@interfaces/IYoutubeDownload";
import { YoutubeCommonHandler } from "@common/YoutubeCommonHandler";
import { CommonHandler } from "@common/CommonHandler";

class YoutubeDownloadController {
  private _serviceId!: string;

  constructor(serviceId: string) {
    this._serviceId = serviceId;
  }

  public getServiceId(): string {
    return this._serviceId;
  }

  public async getInfo(url: string): Promise<IYoutubeVideoInfo> {
    const info = await ytdl.getInfo(url);
    const parsedInfo = pick(info, [
      "formats",
      "full",
      "html5player",
      "videoDetails",
      "player_response",
    ]);

    Object.assign(parsedInfo, { _serviceId: this._serviceId });
    return parsedInfo as IYoutubeVideoInfo;
  }

  private async executeDownloadJob(
    info: IYoutubeVideoInfo,
    quality: IYoutubeDownloadQuality
  ): Promise<any> {
    const storagePath = YoutubeCommonHandler.buildStoragePath(
      quality,
      this._serviceId
    );
    console.log(quality);
    return new Promise((resolve) => {
      const vidStream = ytdl
        .downloadFromInfo(info as any, { quality })
        .pipe(fs.createWriteStream(storagePath));

      vidStream.on("finish", () => {
        resolve(true);
      });
    });
  }

  private async mergeHighestQuality(): Promise<string> {
    const ffmpegPath = CommonHandler.getFfmpegPath();
    const videoPath = `./storage/${this._serviceId}/${this._serviceId}_vid.mp4`;
    const audioPath = `./storage/${this._serviceId}/${this._serviceId}_aud.mp4`;
    const mergedPath = `./storage/${this._serviceId}/${this._serviceId}_mixed.mp4`;

    await new Promise((resolve) => {
      exec(
        `${ffmpegPath} -i ${videoPath} -i ${audioPath} -map 0:v -map 1:a -c:v copy ${mergedPath}`,
        { shell: "powershell.exe" },
        (error, sdtout, sdterr) => {
          console.log(sdtout);
          console.log(sdterr);
          if (!error) {
            resolve(true);
          }
        }
      );
    });

    return mergedPath;
  }

  private preDownload(info: IYoutubeVideoInfo): void {
    if (!this._serviceId) {
      if (info._serviceId) this._serviceId = info._serviceId;
      else throw new Error("serviceId not found");
    }

    YoutubeCommonHandler.createStorage(this._serviceId);
  }

  public async downloadVideo(info: IYoutubeVideoInfo): Promise<string> {
    this.preDownload(info);

    await Promise.allSettled([
      this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_VIDEO),
      this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_AUDIO),
    ]);

    const downloadPath = await this.mergeHighestQuality();
    return downloadPath;
  }

  public async downloadAudio(info: IYoutubeVideoInfo) {
    this.preDownload(info);

    const downloadPath = YoutubeCommonHandler.buildStoragePath(
      IYoutubeDownloadQuality.HIGHEST_AUDIO,
      this._serviceId
    );

    await this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_AUDIO);

    return downloadPath;
  }
}

export { YoutubeDownloadController };
