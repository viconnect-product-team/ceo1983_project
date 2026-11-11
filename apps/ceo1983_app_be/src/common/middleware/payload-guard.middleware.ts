import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB (10,485,760 bytes)

@Injectable()
export class PayloadGuardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message:
          'Kích thước tải trọng vượt quá giới hạn tối đa cho phép (10MB) (Zero-Trust Security Gate Lớp 4).',
      });
    }

    // Cho phép multipart/form-data (upload file) đi tiếp mà không gắn listener 'data'
    // để tránh làm stream chuyển sang flowing mode khiến Multer/Busboy không đọc được file
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return next();
    }

    // Stream byte counter guard cho các payload JSON / urlencoded thông thường
    let receivedBytes = 0;
    const onData = (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_PAYLOAD_BYTES) {
        req.pause();
        req.removeListener('data', onData);
        if (!res.headersSent) {
          res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
            statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
            error: 'Payload Too Large',
            message:
              'Dung lượng luồng tải trọng vượt quá 10MB. Yêu cầu đã bị hủy để bảo vệ tài nguyên máy chủ (Zero-Trust Security Gate Lớp 4).',
          });
        }
      }
    };

    req.on('data', onData);
    next();
  }
}
