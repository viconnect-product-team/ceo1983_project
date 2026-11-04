import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { recordLoginFailure, resetLoginFailures } from '../common/middleware/rate-limiter.middleware';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(req: any, username: string, password: string): Promise<any> {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const clientIp = rawIp.replace(/^.*:/, '') || '127.0.0.1';

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      recordLoginFailure(clientIp);
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác hoặc đã bị xóa');
    }
    resetLoginFailures(clientIp);
    return user;
  }
}
