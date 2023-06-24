import { v4 } from "uuid";
class CommonHandler {
  public static generateServiceId(): string {
    return v4();
  }
}

export { CommonHandler };
