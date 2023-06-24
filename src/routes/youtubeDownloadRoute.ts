import { Router, Request, Response } from "express";
import { YoutubeDownloadController } from "@controller/YoutubeDownloadController";

import {
  IYoutubeGetInfoRequestBody,
  IYoutubeDownloadRequestBody,
  IYoutubeVideoInfo,
} from "@interfaces/IYoutubeDownload";
import { Common } from "@common/Common";

const youtubeRoute = Router();

youtubeRoute.post(
  "/get-info",
  async (
    request: Request<{}, {}, IYoutubeGetInfoRequestBody>,
    response: Response
  ): Promise<void> => {
    const { url } = request.body;
    const serviceId = Common.generateServiceId();
    const youtubeDownloadController = new YoutubeDownloadController(serviceId);

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
      const parsedInfo: IYoutubeVideoInfo = JSON.parse(info);

      if (!parsedInfo._serviceId) {
        response.status(400).send("Bad request");
      }

      const youtubeDownloadController = new YoutubeDownloadController(
        parsedInfo._serviceId as string
      );

      const videoTitle =
        youtubeDownloadController.extractVideoTitle(parsedInfo);

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
        youtubeDownloadController.cleanupStorage()
      );
    } catch (error) {
      console.log(error);
      response.sendStatus(400);
    }
  }
);

export { youtubeRoute };
