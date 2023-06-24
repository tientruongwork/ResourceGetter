import { Router, Request, Response } from "express";
import { YoutubeDownloadController } from "@controller/YoutubeDownloadController";
import { YoutubeCommonHandler } from "@common/YoutubeCommonHandler";
import {
  IYoutubeGetInfoRequestBody,
  IYoutubeDownloadRequestBody,
  VideoInfoWithServiceId,
} from "@interfaces/IYoutubeDownload";

const youtubeRoute = Router();

youtubeRoute.post(
  "/get-info",
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
  "/download",
  async (
    request: Request<{}, {}, IYoutubeDownloadRequestBody>,
    response: Response
  ) => {
    try {
      const { info, audioOnly } = request.body;
      const youtubeDownloadController = new YoutubeDownloadController();

      const parsedInfo: VideoInfoWithServiceId = JSON.parse(info);
      const videoTitle = YoutubeCommonHandler.extractVideoTitle(parsedInfo);

      let downloadPath;
      if (audioOnly) {
        downloadPath = await youtubeDownloadController.downloadAudio(
          parsedInfo
        );
      } else {
        downloadPath = await youtubeDownloadController.downloadVideo(
          parsedInfo
        );
      }

      if (!downloadPath) {
        response.sendStatus(400);
      }

      response.download(downloadPath, videoTitle, () =>
        YoutubeCommonHandler.cleanupStorage(parsedInfo.serviceId)
      );
    } catch (error) {
      console.log(error);
      response.sendStatus(400);
    }
  }
);

export { youtubeRoute };
