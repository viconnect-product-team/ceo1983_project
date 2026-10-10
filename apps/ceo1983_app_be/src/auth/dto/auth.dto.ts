export class ForgotPasswordDto {
  email!: string;
}

export class ResetPasswordDto {
  email?: string;
  token?: string;
  newPassword!: string;
}

export class LoginDto {
  username!: string;
  password!: string;
}

export class RefreshTokenDto {
  refresh_token!: string;
}

export class RegisterDto {
  username!: string;
  password?: string;
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  title?: string;
  [key: string]: any;
}

export class GoogleLoginDto {
  token!: string;
}

export class AppleLoginDto {
  identityToken!: string;
  authorizationCode?: string;
  fullName?: any;
  email?: string;
}
