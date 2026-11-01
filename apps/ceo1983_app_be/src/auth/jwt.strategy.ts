import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key',
    });
  }

  async validate(payload: any) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!payload.sub || !uuidRegex.test(payload.sub)) {
      throw new UnauthorizedException('Invalid user ID format in token');
    }
    const id = payload.sub;
    return {
      id,
      userId: id,
      username: payload.username,
      email: payload.email,
      roles: Array.isArray(payload.roles) ? payload.roles : (payload.role ? [payload.role] : []),
      role: payload.role,
      srsRole: payload.srsRole,
      ...payload,
    };
  }
}

