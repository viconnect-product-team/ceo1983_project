import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

function loadEnvFile(envPath: string) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
}

// Load root .env
loadEnvFile(path.join(__dirname, '../../../../.env'));
loadEnvFile(path.join(process.cwd(), '.env'));

function probeTcp(host: string, port: number, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const cleanup = (result: boolean) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(result);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => cleanup(true));
    socket.once('timeout', () => cleanup(false));
    socket.once('error', () => cleanup(false));
    try {
      socket.connect(port, host);
    } catch {
      cleanup(false);
    }
  });
}

async function resolveDatabaseConfig() {
  // 1. Nếu DATABASE_URL đã được chỉ định rõ ràng từ môi trường Docker và không phải IP/cổng cũ đã đóng
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('113.20.107.184') &&
    !process.env.DATABASE_URL.includes('127.0.0.1:6432')
  ) {
    console.log('\x1b[32m%s\x1b[0m', '================================================================');
    console.log('\x1b[32m%s\x1b[0m', `✅ [Database Config] Sử dụng DATABASE_URL từ môi trường: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
    console.log('\x1b[32m%s\x1b[0m', '================================================================');
    return;
  }

  // 2. Tự động kiểm tra kết nối CSDL nội bộ container (ceo1983-postgres-prod:5432)
  const isDockerInternal = await probeTcp('ceo1983-postgres-prod', 5432, 1000);

  if (isDockerInternal) {
    process.env.DATABASE_URL =
      process.env.LOCAL_DATABASE_URL ||
      'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@ceo1983-postgres-prod:5432/vione_app?schema=public';
    console.log('\x1b[32m%s\x1b[0m', '================================================================');
    console.log('\x1b[32m%s\x1b[0m', '🐳 [Database Auto-Config] MÔI TRƯỜNG DOCKER: Kết nối qua mạng ceo1983-network');
    console.log('\x1b[32m%s\x1b[0m', '   Target: ceo1983-postgres-prod:5432/vione_app');
    console.log('\x1b[32m%s\x1b[0m', '================================================================');
  } else {
    process.env.DATABASE_URL =
      process.env.REMOTE_DATABASE_URL ||
      'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';
    console.log('\x1b[33m%s\x1b[0m', '================================================================');
    console.log('\x1b[33m%s\x1b[0m', '💻 [Database Auto-Config] MÁY CỤC BỘ / HOST: Kết nối server 14.225.217.232');
    console.log('\x1b[33m%s\x1b[0m', '   Target: 14.225.217.232:5436/vione_app');
    console.log('\x1b[33m%s\x1b[0m', '================================================================');
  }
}

import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { createVietnameseValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  await resolveDatabaseConfig();
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Security Headers Middleware (OWASP Standard)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=*, microphone=(), geolocation=*');
    next();
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Đăng ký bộ chuẩn hóa Validate và Bắt lỗi tiếng Việt toàn cục
  app.useGlobalPipes(createVietnameseValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
void bootstrap();

