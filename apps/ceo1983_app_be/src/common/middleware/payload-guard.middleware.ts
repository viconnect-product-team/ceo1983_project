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
        message: 'Kích thước tải trọng vượt quá giới hạn tối đa cho phép (10MB) (Zero-Trust Security Gate Lớp 4).',
      });
    }

    // Stream byte counter guard
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
            message: 'Dung lượng luồng tải trọng vượt quá 10MB. Yêu cầu đã bị hủy để bảo vệ tài nguyên máy chủ (Zero-Trust Security Gate Lớp 4).',
          });
        }
      }
    };

    req.on('data', onData);
    next();
  }
}

