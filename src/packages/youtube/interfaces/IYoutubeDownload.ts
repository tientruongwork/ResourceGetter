import { ChooseFormatQuality, videoInfo } from "ytdl-core";

export interface IYoutubeGetInfoRequestBody {
  url: string;
}

export interface IYoutubeDownloadRequestBody {
  info: string;
  audioOnly?: boolean;
  quality?: ChooseFormatQuality;
}

export enum IYoutubeDownloadQuality {
  HIGHEST_AUDIO = "highestaudio",
  HIGHEST_VIDEO = "highestvideo",
}

export type VideoInfoWithServiceId = videoInfo & {
  serviceId: string;
};
