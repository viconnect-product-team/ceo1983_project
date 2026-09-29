import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from './roles.guard';
import { DataScopeInterceptor } from './data-scope.interceptor';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard, DataScopeInterceptor],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, RolesGuard, DataScopeInterceptor],
})
export class AuthModule {}
