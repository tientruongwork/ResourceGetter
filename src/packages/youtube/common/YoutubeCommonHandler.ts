import { ChooseFormatQuality, Filter, downloadOptions } from "ytdl-core";
import path from "path";
import fs from "fs";
import { rimraf } from "rimraf";

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

  public static reformatVideoTitle(videoTitle: string) {
    return videoTitle
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .join("-");
  }

  public static cleanupStorage(serviceId: string) {
    const storagePath = path.join(__dirname, "../storage", serviceId);
    rimraf(storagePath);
  }
}

export { YoutubeCommonHandler };
