import { ChooseFormatQuality, videoInfo } from "ytdl-core";

export interface IYoutubeGetInfoRequestBody {
  url: string;
}

export interface IYoutubeDownloadRequestBody {
  info: videoInfo;
  audioOnly?: boolean;
  quality?: ChooseFormatQuality;
}
