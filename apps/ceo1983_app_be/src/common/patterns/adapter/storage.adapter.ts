/**
 * 46 — Design Pattern Pragmatism: ADAPTER PATTERN
 * Phục vụ Kịch bản 2: Bọc MinIO / Cloud Storage bằng StorageAdapter
 */

export interface StorageUploadOptions {
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface IStorageAdapter {
  uploadFile(path: string, buffer: Buffer, options?: StorageUploadOptions): Promise<string>;
  getFileUrl(path: string, bucket?: string): Promise<string>;
  deleteFile(path: string, bucket?: string): Promise<boolean>;
}

export class MinioStorageAdapter implements IStorageAdapter {
  constructor(private readonly minioServiceInstance?: any) {}

  async uploadFile(filePath: string, buffer: Buffer, options?: StorageUploadOptions): Promise<string> {
    if (this.minioServiceInstance && typeof this.minioServiceInstance.uploadBuffer === 'function') {
      return this.minioServiceInstance.uploadBuffer(filePath, buffer, options?.contentType);
    }
    // Fallback: return file path for serving via static endpoint
    return `/upload/file/${filePath}`;
  }

  async getFileUrl(filePath: string, bucket?: string): Promise<string> {
    if (this.minioServiceInstance && typeof this.minioServiceInstance.getPresignedUrl === 'function') {
      return this.minioServiceInstance.getPresignedUrl(filePath, bucket);
    }
    return `/upload/file/${filePath}`;
  }

  async deleteFile(filePath: string, bucket?: string): Promise<boolean> {
    if (this.minioServiceInstance && typeof this.minioServiceInstance.deleteObject === 'function') {
      return this.minioServiceInstance.deleteObject(filePath, bucket);
    }
    return true;
  }
}

