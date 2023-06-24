import { ChooseFormatQuality, Filter, downloadOptions } from "ytdl-core";
import path from "path";
import fs from "fs";
import { rimraf } from "rimraf";
import {
  IYoutubeDownloadQuality,
  VideoInfoWithServiceId,
} from "@youtube/interfaces/IYoutubeDownload";

class YoutubeCommonHandler {
  public static buildDownloadOptions(
    audioOnly: boolean | undefined,
    quality: ChooseFormatQuality | undefined
  ): downloadOptions | { filter: Filter } | Filter {
    if (audioOnly) {
      return { quality: "highestaudio" };
    }

    // "quality" in filter function have different purpose and type with "quality" from audioOnly
    if (quality) {
      return {
        filter: (format) => {
          return format.quality === quality;
        },
      };
    }

    return {};
  }

  public static createStorage(serviceId: string) {
    const storagePath = path.join(__dirname, "../storage", serviceId);

    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  public static cleanupStorage(serviceId: string) {
    const storagePath = path.join(__dirname, "../storage", serviceId);
    rimraf(storagePath);
  }

  public static buildStoragePath = (
    quality: IYoutubeDownloadQuality,
    serviceId: string
  ) => {
    const prefix = this.getDownloadPrefix(quality);
    return `storage/${serviceId}/${serviceId}${prefix}.mp4`;
  };

  public static getDownloadPrefix(quality: IYoutubeDownloadQuality) {
    switch (quality) {
      case IYoutubeDownloadQuality.HIGHEST_VIDEO:
        return "_vid";
      case IYoutubeDownloadQuality.HIGHEST_AUDIO:
        return "_aud";
      default:
        return "";
    }
  }

  public static extractVideoTitle(info: VideoInfoWithServiceId) {
    const origin_video_title = info.player_response.videoDetails.title;

    const videoTitle = origin_video_title
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .join("-");

    return videoTitle;
  }
}

export { YoutubeCommonHandler };
