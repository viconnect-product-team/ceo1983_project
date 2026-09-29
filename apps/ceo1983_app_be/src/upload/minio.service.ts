import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private clients: { name: string; client: Minio.Client }[] = [];
  private readonly bucketName = process.env.MINIO_BUCKET || 'ceo1983-bucket';

  async onModuleInit() {
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    const envEndpoint = process.env.MINIO_ENDPOINT;
    const envPort = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined;
    const useSSL = process.env.MINIO_USE_SSL === 'true';

    const candidateConfigs: { name: string; endPoint: string; port: number }[] = [];

    // 1. Env configured endpoint
    if (envEndpoint) {
      candidateConfigs.push({
        name: `env(${envEndpoint}:${envPort || 9000})`,
        endPoint: envEndpoint,
        port: envPort || 9000,
      });
    }

    // 2. Direct server public IP on port 9000 (Primary MinIO for dev and local)
    candidateConfigs.push({
      name: 'server-dev(14.225.217.232:9000)',
      endPoint: '14.225.217.232',
      port: 9000,
    });

    // 3. Localhost on port 9000 or 9050
    candidateConfigs.push({
      name: 'local(127.0.0.1:9000)',
      endPoint: '127.0.0.1',
      port: 9000,
    });
    candidateConfigs.push({
      name: 'local(127.0.0.1:9050)',
      endPoint: '127.0.0.1',
      port: 9050,
    });

    // 4. Docker container aliases only in Linux/Docker environment (never on Windows host to avoid DNS resolution hangs)
    const isInsideDocker = process.platform === 'linux' && (Boolean(process.env.DOCKER_CONTAINER) || Boolean(process.env.KUBERNETES_SERVICE_HOST));
    if (isInsideDocker) {
      candidateConfigs.push({
        name: 'docker-alias(association-minio-prod:9000)',
        endPoint: 'association-minio-prod',
        port: 9000,
      });
      candidateConfigs.push({
        name: 'docker-alias(minio:9000)',
        endPoint: 'minio',
        port: 9000,
      });
    }

    // 5. Docker bridge host gateway
    candidateConfigs.push({
      name: 'docker-bridge(172.17.0.1:9050)',
      endPoint: '172.17.0.1',
      port: 9050,
    });

    // Deduplicate by endPoint:port
    const seen = new Set<string>();
    for (const conf of candidateConfigs) {
      const key = `${conf.endPoint}:${conf.port}`;
      if (seen.has(key)) continue;
      seen.add(key);

      try {
        const client = new Minio.Client({
          endPoint: conf.endPoint,
          port: conf.port,
          useSSL,
          accessKey,
          secretKey,
        });
        this.clients.push({ name: conf.name, client });
      } catch (e: any) {
        console.warn(`MinIO client setup notice for ${conf.name}:`, e?.message);
      }
    }

    // Check bucket existence on active client with fast timeout
    for (const entry of this.clients) {
      try {
        const bucketCheck = entry.client.bucketExists(this.bucketName);
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('MinIO bucketExists timed out')), 1500),
        );
        const exists = await Promise.race([bucketCheck, timeoutPromise]);
        if (!exists) {
          await entry.client.makeBucket(this.bucketName, 'us-east-1');
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              },
            ],
          };
          await entry.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        }
        break;
      } catch {
        // Continue to check next client
      }
    }
  }

  async uploadFile(filename: string, fileBuffer: Buffer, mimeType: string): Promise<string | null> {
    let lastErr: any = null;

    for (let i = 0; i < this.clients.length; i++) {
      const entry = this.clients[i];
      try {
        const putPromise = entry.client.putObject(
          this.bucketName,
          filename,
          fileBuffer,
          fileBuffer.length,
          { 'Content-Type': mimeType },
        );
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`MinIO putObject timeout on ${entry.name}`)), 2000),
        );
        await Promise.race([putPromise, timeoutPromise]);

        // Move successful client to the front of the list for faster subsequent operations
        if (i > 0) {
          this.clients.splice(i, 1);
          this.clients.unshift(entry);
        }
        return `/upload/file/${filename}`;
      } catch (err: any) {
        lastErr = err;
      }
    }

    console.warn(`MinIO upload unreachable or failed across all endpoints (${lastErr?.message || 'Unreachable'}). Falling back to local disk storage.`);
    return null;
  }

  async getFileStream(filename: string): Promise<any> {
    const candidateBuckets = [this.bucketName, 'vione-bucket', 'vione-standalone-bucket'];
    for (const bucket of candidateBuckets) {
      for (let i = 0; i < this.clients.length; i++) {
        const entry = this.clients[i];
        try {
          const getPromise = entry.client.getObject(bucket, filename);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`MinIO getObject timeout on ${entry.name}`)), 3000),
          );
          const stream = await Promise.race([getPromise, timeoutPromise]);
          if (stream) {
            if (i > 0) {
              this.clients.splice(i, 1);
              this.clients.unshift(entry);
            }
            return stream;
          }
        } catch {
          // try next client or bucket
        }
      }
    }
    return null;
  }

  async deleteFile(filename: string): Promise<void> {
    for (const entry of this.clients) {
      try {
        await entry.client.removeObject(this.bucketName, filename);
        return;
      } catch {}
    }
  }
}
