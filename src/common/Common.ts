import { v4 } from "uuid";
import path from "path";

class Common {
  public static generateServiceId(): string {
    return v4();
  }

  public static getFfmpegPath(): string {
    return path.resolve(__dirname, "../dependencies/ffmpeg.exe");
  }
}

export { Common };
