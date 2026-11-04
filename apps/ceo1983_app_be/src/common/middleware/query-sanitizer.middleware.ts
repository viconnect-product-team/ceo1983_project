import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const DANGEROUS_SQL_PATTERN = /(--|;|--|\/\*|\*\/|DROP\s|UNION\s|INSERT\s|UPDATE\s|DELETE\s|EXEC\s|SELECT\s)/i;
const VALID_IDENTIFIER_REGEX = /^[a-zA-Z0-9_]+$/;

@Injectable()
export class QuerySanitizerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        // Check if query parameter key contains SQL injection or invalid identifier characters
        if (DANGEROUS_SQL_PATTERN.test(key) || (!VALID_IDENTIFIER_REGEX.test(key) && !key.includes('[') && !key.includes(']'))) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: `Phát hiện tham số truy vấn không an toàn hoặc chứa ký tự đặc biệt không hợp lệ: "${key}" (Zero-Trust Security Gate Lớp 6).`,
          });
        }

        // If key is a column filter like ?id;DROP TABLE...
        if (typeof value === 'string' && DANGEROUS_SQL_PATTERN.test(value)) {
          // If the query value looks like raw SQL injection
          if (value.toLowerCase().includes('drop table') || value.includes(';') || value.toLowerCase().includes('union select')) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              statusCode: HttpStatus.BAD_REQUEST,
              error: 'Bad Request',
              message: `Giá trị lọc chứa biểu thức SQL bị cấm (Zero-Trust Security Gate Lớp 6).`,
            });
          }
        }
      }
    }
    next();
  }
}

