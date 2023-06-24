import { Router, Request } from "express";
import { videoInfo } from "ytdl-core";
import ytdl from "ytdl-core";
import { YoutubeDownloadController } from "@youtube/controller/YoutubeDownloadController";
import { YoutubeCommonHandler } from "@youtube/common/YoutubeCommonHandler";
import {
  IYoutubeGetInfoRequestBody,
  IYoutubeDownloadRequestBody,
} from "@youtube/interfaces/IYoutubeDownload";

const youtubeRoute = Router();

youtubeRoute.post(
  "/get-youtube-info",
  async (
    request: Request<{}, {}, IYoutubeGetInfoRequestBody>
  ): Promise<videoInfo> => {
    const { url } = request.body;
    const youtubeDownloadController = new YoutubeDownloadController();
    const info = await youtubeDownloadController.getInfo(url);
    return info;
  }
);

youtubeRoute.post(
  "/download-youtube-video",
  async (request: Request<{}, {}, IYoutubeDownloadRequestBody>) => {
    const { info, audioOnly, quality } = request.body;
    const downloadOptions = YoutubeCommonHandler.buildDownloadOptions(
      audioOnly,
      quality
    );

    ytdl.downloadFromInfo(info, downloadOptions);
  }
);

export { youtubeRoute };
