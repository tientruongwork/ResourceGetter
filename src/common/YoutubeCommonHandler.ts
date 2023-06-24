import path from "path";
import fs from "fs";
import { rimraf } from "rimraf";

import {
  IYoutubeDownloadQuality,
  IYoutubeVideoInfoWithServiceId,
} from "@interfaces/IYoutubeDownload";

class YoutubeCommonHandler {
  public static createStorage(serviceId: string): void {
    const storagePath = path.join(__dirname, "../storage", serviceId);

    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  public static cleanupStorage(serviceId: string): void {
    const storagePath = path.join(__dirname, "../storage", serviceId);
    rimraf(storagePath);
  }

  public static buildStoragePath = (
    quality: IYoutubeDownloadQuality,
    serviceId: string
  ): string => {
    const prefix = this.getDownloadPrefix(quality);
    return `storage/${serviceId}/${serviceId}${prefix}.mp4`;
  };

  public static getDownloadPrefix(quality: IYoutubeDownloadQuality): string {
    switch (quality) {
      case IYoutubeDownloadQuality.HIGHEST_VIDEO:
        return "_vid";
      case IYoutubeDownloadQuality.HIGHEST_AUDIO:
        return "_aud";
      default:
        return "";
    }
  }

  public static extractVideoTitle(info: IYoutubeVideoInfoWithServiceId): string {
    const origin_video_title = info.player_response.videoDetails.title;

    const videoTitle = origin_video_title
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .join("-");

    return videoTitle;
  }
}

export { YoutubeCommonHandler };
