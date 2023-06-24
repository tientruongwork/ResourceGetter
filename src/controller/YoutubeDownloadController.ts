import fs from "fs";
import { exec } from "child_process";
import ytdl from "ytdl-core";
import pick from "lodash/pick";

import {
  IYoutubeDownloadQuality,
  IYoutubeVideoInfo,
} from "@interfaces/IYoutubeDownload";
import { BaseController } from "@controller/BaseController";
import { Common } from "@common/Common";

class YoutubeDownloadController extends BaseController {
  public extractVideoTitle(info: IYoutubeVideoInfo): string {
    const origin_video_title = info.player_response.videoDetails.title;

    const videoTitle = origin_video_title
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .join("-");

    return videoTitle;
  }

  private getDownloadPrefix(quality: IYoutubeDownloadQuality): string {
    switch (quality) {
      case IYoutubeDownloadQuality.HIGHEST_VIDEO:
        return "_vid";
      case IYoutubeDownloadQuality.HIGHEST_AUDIO:
        return "_aud";
      default:
        return "";
    }
  }

  public buildStoragePath = (
    quality: IYoutubeDownloadQuality,
    serviceId: string
  ): string => {
    const prefix = this.getDownloadPrefix(quality);
    return `storage/${serviceId}/${serviceId}${prefix}.mp4`;
  };

  public async getInfo(url: string): Promise<IYoutubeVideoInfo> {
    const info = await ytdl.getInfo(url);
    const parsedInfo = pick(info, [
      "formats",
      "full",
      "html5player",
      "videoDetails",
      "player_response",
    ]);

    Object.assign(parsedInfo, { _serviceId: this.getServiceId() });
    return parsedInfo as IYoutubeVideoInfo;
  }

  private async executeDownloadJob(
    info: IYoutubeVideoInfo,
    quality: IYoutubeDownloadQuality
  ): Promise<any> {
    const storagePath = this.buildStoragePath(quality, this.getServiceId());

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
    const ffmpegPath = Common.getFfmpegPath();
    const serviceId = this.getServiceId();

    const videoPath = `${this.getStoragePath()}/${serviceId}_vid.mp4`;
    const audioPath = `${this.getStoragePath()}/${serviceId}_aud.mp4`;
    const mergedPath = `${this.getStoragePath()}/${serviceId}_mixed.mp4`;

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

  protected preDownload(info: IYoutubeVideoInfo): void {
    if (!this.isServiceIdValid()) {
      if (info._serviceId) {
        this.setServiceId(info._serviceId);
      } else {
        throw new Error("serviceId not found");
      }
    }

    this.createStorage();
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

    const downloadPath = this.buildStoragePath(
      IYoutubeDownloadQuality.HIGHEST_AUDIO,
      this.getServiceId()
    );

    await this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_AUDIO);

    return downloadPath;
  }
}

export { YoutubeDownloadController };
