import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    // Check if token jti has been revoked (Lớp 1 Token Revocation Denylist)
    if (payload.jti && this.authService.isTokenRevoked(payload.jti)) {
      throw new UnauthorizedException(
        'Phiên đăng nhập đã bị thu hồi (Token Revoked). Vui lòng đăng nhập lại.',
      );
    }

    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!payload.sub || !uuidRegex.test(payload.sub)) {
      throw new UnauthorizedException('Invalid user ID format in token');
    }
    const id = payload.sub;
    return {
      id,
      userId: id,
      username: payload.username,
      email: payload.email,
      roles: Array.isArray(payload.roles)
        ? payload.roles
        : payload.role
          ? [payload.role]
          : [],
      role: payload.role,
      srsRole: payload.srsRole,
      jti: payload.jti,
      ...payload,
    };
  }
}
