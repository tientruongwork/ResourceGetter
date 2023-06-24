export enum IPinterestVideoType {
  V_720P = "V_720P",
  V_HLSV4 = "V_HLSV4",
  V_HLSV3_WEB = "V_HLSV3_WEB",
  V_HLSV3_MOBILE = "V_HLSV3_MOBILE",
}

export interface IPinterestDownloadRequestBody {
  url: string;
  videoType: IPinterestVideoType;
}

interface IPinterestVideoListDetails {
  url: string;
  width: number;
  height: number;
  duration: number;
  thumbnail: string;
}

export type IPinterestResponse = Record<string, IPinterestVideoListDetails>;
