import { v4 } from "uuid";
import path from "path";

class CommonHandler {
  public static generateServiceId(): string {
    return v4();
  }

  public static getFfmpegPath(): string {
    return path.resolve(__dirname, "../dependencies/ffmpeg.exe");
  }
}

export { CommonHandler };
