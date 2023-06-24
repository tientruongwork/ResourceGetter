import { ChooseFormatQuality, Filter, downloadOptions } from "ytdl-core";

class YoutubeCommonHandler {
  public static buildDownloadOptions(
    audioOnly: boolean | undefined,
    quality: ChooseFormatQuality | undefined
  ): downloadOptions | { filter: Filter } {
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
}

export { YoutubeCommonHandler };
