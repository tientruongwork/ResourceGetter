import { Router, Request, Response } from "express";
import { IPinterestDownloadRequestBody } from "@interfaces/IPinterestDownload";
import { PinterestDownloadController } from "@controller/PinterestDownloadController";
import { Common } from "@common/Common";

const pinterestRoute = Router();

pinterestRoute.post(
  "/download",
  async (
    request: Request<{}, {}, IPinterestDownloadRequestBody>,
    response: Response
  ) => {
    const { url, videoType } = request.body;
    const serviceId = Common.generateServiceId();

    const pinterestDownloadController = new PinterestDownloadController(
      serviceId,
      url
    );

    const downloadPath = await pinterestDownloadController.download(videoType);

    response.download(
      downloadPath,
      pinterestDownloadController.getPinterestId(),
      () => pinterestDownloadController.cleanupStorage()
    );
  }
);

export { pinterestRoute };
