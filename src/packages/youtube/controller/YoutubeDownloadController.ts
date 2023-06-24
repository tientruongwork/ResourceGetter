import { videoInfo } from "ytdl-core";

class YoutubeDownloadController {
  constructor() {
    console.log("Init");
  }

  public async getInfo(url: string): Promise<videoInfo> {
    const response = new Promise<videoInfo>((resolve, reject) => {
      try {
        resolve(url as unknown as videoInfo);
      } catch (error) {
        reject(JSON.stringify(error));
      }
    });

    return response;
  }
}

export { YoutubeDownloadController };
