import fs from "fs";
import { rimraf } from "rimraf";

abstract class BaseController {
  private _serviceId: string;
  private _storagePath: string = "storage";

  constructor(serviceId: string) {
    this._serviceId = serviceId;
    this._storagePath = `./storage/${serviceId}`;
  }

  protected abstract buildStoragePath(...params: any[]): string;

  public setStoragePath(storagePath: string): void {
    this._storagePath = storagePath;
  }

  public getStoragePath(): string {
    return this._storagePath;
  }

  public setServiceId(serviceId: string): void {
    this._serviceId = serviceId;
  }

  public getServiceId(): string {
    return this._serviceId;
  }

  public isServiceIdValid(): boolean {
    return !!this._serviceId;
  }

  protected abstract preDownload(...params: any[]): void;

  public createStorage(): void {
    const storagePath = this.getStoragePath();
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  public cleanupStorage(): void {
    const storagePath = this.getStoragePath();
    rimraf(storagePath);
  }
}

export { BaseController };
