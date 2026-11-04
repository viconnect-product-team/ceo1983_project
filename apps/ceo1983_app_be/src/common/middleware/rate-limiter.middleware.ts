import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate-limiter caches
const generalIpLimits = new Map<string, RateLimitRecord>();
const loginIpFailures = new Map<string, RateLimitRecord>();

const GENERAL_MAX_REQUESTS = 600; // 600 reqs / 60 seconds
const GENERAL_WINDOW_MS = 60 * 1000;

const LOGIN_MAX_FAILS = 15; // 15 failed logins / 60 seconds
const LOGIN_WINDOW_MS = 60 * 1000;

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const existing = loginIpFailures.get(ip);
  if (!existing || now > existing.resetTime) {
    loginIpFailures.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW_MS });
  } else {
    existing.count += 1;
  }
}

export function resetLoginFailures(ip: string): void {
  loginIpFailures.delete(ip);
}

export function isLoginBlocked(ip: string): { blocked: boolean; retryAfter: number } {
  const now = Date.now();
  const existing = loginIpFailures.get(ip);
  if (existing && now <= existing.resetTime && existing.count >= LOGIN_MAX_FAILS) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
    return { blocked: true, retryAfter: Math.max(1, retryAfter) };
  }
  return { blocked: false, retryAfter: 0 };
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const clientIp = rawIp.replace(/^.*:/, '') || '127.0.0.1';

    const now = Date.now();

    // 1. Check Login Brute-force block on /auth/login
    if (req.path.includes('/auth/login') && req.method === 'POST') {
      const { blocked, retryAfter } = isLoginBlocked(clientIp);
      if (blocked) {
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Tài khoản tạm thời bị khóa do đăng nhập sai quá ${LOGIN_MAX_FAILS} lần. Vui lòng thử lại sau ${retryAfter} giây (Zero-Trust Security Gate Lớp 3).`,
          retryAfter,
        });
      }
    }

    // 2. Check General API rate limit (600 requests / 60 seconds / IP)
    let generalRecord = generalIpLimits.get(clientIp);
    if (!generalRecord || now > generalRecord.resetTime) {
      generalRecord = { count: 1, resetTime: now + GENERAL_WINDOW_MS };
      generalIpLimits.set(clientIp, generalRecord);
    } else {
      generalRecord.count += 1;
      if (generalRecord.count > GENERAL_MAX_REQUESTS) {
        const retryAfter = Math.ceil((generalRecord.resetTime - now) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Lưu lượng truy cập vượt quá giới hạn an toàn (${GENERAL_MAX_REQUESTS} req/phút). Vui lòng thử lại sau ${retryAfter} giây (Zero-Trust Security Gate Lớp 3).`,
          retryAfter,
        });
      }
    }

    next();
  }
}

