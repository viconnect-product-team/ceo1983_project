import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterDto,
  RefreshTokenDto,
  GoogleLoginDto,
  AppleLoginDto,
} from './dto';
import { ChangePasswordDto } from '../users/dto';

export { ForgotPasswordDto, ResetPasswordDto };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(
    @Body('identityToken') identityToken: string,
    @Body('authorizationCode') authorizationCode?: string,
    @Body('fullName') fullName?: any,
    @Body('email') email?: string,
  ) {
    return this.authService.appleLogin({
      identityToken,
      authorizationCode,
      fullName,
      email,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() body: ChangePasswordDto,
  ) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    return this.authService.changePassword(
      userId,
      body.currentPassword || '',
      body.newPassword,
    );
  }
}

