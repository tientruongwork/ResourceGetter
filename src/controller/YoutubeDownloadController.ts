import path from "path";
import fs from "fs";
import { exec } from "child_process";
import ytdl from "ytdl-core";
import pick from "lodash/pick";

import {
  IYoutubeDownloadQuality,
  IYoutubeVideoInfoWithServiceId,
} from "@interfaces/IYoutubeDownload";
import { YoutubeCommonHandler } from "@common/YoutubeCommonHandler";
import { CommonHandler } from "@common/CommonHandler";

class YoutubeDownloadController {
  public async getInfo(url: string): Promise<IYoutubeVideoInfoWithServiceId> {
    const info = await ytdl.getInfo(url);
    const parsedInfo = pick(info, [
      "formats",
      "full",
      "html5player",
      "videoDetails",
      "player_response",
    ]);
    const serviceId = CommonHandler.generateServiceId();
    Object.assign(parsedInfo, { serviceId });

    return parsedInfo as IYoutubeVideoInfoWithServiceId;
  }

  private async executeDownloadJob(
    info: IYoutubeVideoInfoWithServiceId,
    quality: IYoutubeDownloadQuality
  ): Promise<any> {
    const storagePath = YoutubeCommonHandler.buildStoragePath(
      quality,
      info.serviceId
    );

    return new Promise((resolve) => {
      const vidStream = ytdl
        .downloadFromInfo(info as any, { quality })
        .pipe(fs.createWriteStream(storagePath));

      vidStream.on("finish", () => {
        resolve(true);
      });
    });
  }

  private async mergeHighestQuality(serviceId: string): Promise<string> {
    const ffmpegPath = path.resolve(__dirname, "../dependencies/ffmpeg.exe");
    const videoPath = `./storage/${serviceId}/${serviceId}_vid.mp4`;
    const audioPath = `./storage/${serviceId}/${serviceId}_aud.mp4`;
    const mergedPath = `./storage/${serviceId}/${serviceId}_mixed.mp4`;

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

  private preDownload(info: IYoutubeVideoInfoWithServiceId): {
    serviceId: string;
  } {
    const serviceId = info.serviceId;
    if (!serviceId) {
      throw new Error("serviceId not found");
    }

    YoutubeCommonHandler.createStorage(serviceId);
    return { serviceId };
  }

  public async downloadVideo(
    info: IYoutubeVideoInfoWithServiceId
  ): Promise<string> {
    const { serviceId } = this.preDownload(info);

    await Promise.allSettled([
      this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_VIDEO),
      this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_AUDIO),
    ]);

    const downloadPath = await this.mergeHighestQuality(serviceId);
    return downloadPath;
  }

  public async downloadAudio(info: IYoutubeVideoInfoWithServiceId) {
    const { serviceId } = this.preDownload(info);

    const downloadPath = YoutubeCommonHandler.buildStoragePath(
      IYoutubeDownloadQuality.HIGHEST_AUDIO,
      serviceId
    );

    await this.executeDownloadJob(info, IYoutubeDownloadQuality.HIGHEST_AUDIO);

    return downloadPath;
  }
}

export { YoutubeDownloadController };
