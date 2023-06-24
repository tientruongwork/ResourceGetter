import ytdl, { videoInfo } from "ytdl-core";
import { IYoutubeDownloadQuality } from "@youtube/interfaces/IYoutubeDownload";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { v4 } from "uuid";

class YoutubeDownloadController {
  constructor() {
    console.log("Init");
  }

  public async getInfo(url: string): Promise<videoInfo> {
    const info = await ytdl.getInfo(url);
    Object.assign(info, { serviceId: v4() });
    return info;
  }

  private getDownloadPrefix(quality: IYoutubeDownloadQuality) {
    switch (quality) {
      case IYoutubeDownloadQuality.HIGHEST_VIDEO:
        return "_vid";
      case IYoutubeDownloadQuality.HIGHEST_AUDIO:
        return "_aud";
      default:
        return "";
    }
  }

  private async executeDownloadJob(
    info: videoInfo,
    serviceId: string,
    quality: IYoutubeDownloadQuality
  ) {
    const prefix = this.getDownloadPrefix(quality);

    return new Promise((resolve) => {
      const vidStream = ytdl
        .downloadFromInfo(info, { quality })
        .pipe(
          fs.createWriteStream(`storage/${serviceId}/${serviceId}${prefix}.mp4`)
        );

      vidStream.on("finish", () => {
        resolve(true);
      });
    });
  }

  public async downloadHighestVidAndAud(info: videoInfo, serviceId: string) {
    await Promise.allSettled([
      this.executeDownloadJob(
        info,
        serviceId,
        IYoutubeDownloadQuality.HIGHEST_VIDEO
      ),
      this.executeDownloadJob(
        info,
        serviceId,
        IYoutubeDownloadQuality.HIGHEST_AUDIO
      ),
    ]);
  }

  public async mergeHighestQuality(
    serviceId: string,
    videoTitle: string
  ): Promise<string> {
    const ffmpegPath = path.resolve(__dirname, "../dependencies/ffmpeg.exe");
    const videoPath = `./storage/${serviceId}/${serviceId}_vid.mp4`;
    const audioPath = `./storage/${serviceId}/${serviceId}_aud.mp4`;
    const mergedPath = `./storage/${serviceId}/${videoTitle}.mp4`;

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
}

export { YoutubeDownloadController };
