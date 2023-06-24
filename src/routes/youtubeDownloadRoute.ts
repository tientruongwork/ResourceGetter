import { Router, Request, Response } from "express";
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
    request: Request<{}, {}, IYoutubeGetInfoRequestBody>,
    response: Response
  ): Promise<void> => {
    const { url } = request.body;
    const youtubeDownloadController = new YoutubeDownloadController();
    try {
      const info = await youtubeDownloadController.getInfo(url);
      response.status(200).send(info);
    } catch (error) {
      response.status(400).send(error);
    }
  }
);

youtubeRoute.post(
  "/download-youtube-video",
  async (
    request: Request<{}, {}, IYoutubeDownloadRequestBody>,
    response: Response
  ) => {
    try {
      const { info, audioOnly, quality } = request.body;
      const youtubeDownloadController = new YoutubeDownloadController();

      const parsedInfo: any = JSON.parse(info);
      const serviceId = parsedInfo.serviceId;
      if (!serviceId) {
        throw new Error("serviceId not found");
      }

      const origin_video_title = parsedInfo.player_response.videoDetails.title;

      const video_title =
        YoutubeCommonHandler.reformatVideoTitle(origin_video_title);

      const downloadOptions = YoutubeCommonHandler.buildDownloadOptions(
        audioOnly,
        quality
      );
      downloadOptions;

      YoutubeCommonHandler.createStorage(serviceId);
      await youtubeDownloadController.downloadHighestVidAndAud(
        parsedInfo,
        serviceId
      );

      const downloadPath = await youtubeDownloadController.mergeHighestQuality(
        serviceId,
        video_title
      );
      response.download(downloadPath, video_title, () =>
        YoutubeCommonHandler.cleanupStorage(serviceId)
      );
    } catch (error) {
      console.log(error);
      response.sendStatus(400);
    }
  }
);

export { youtubeRoute };
