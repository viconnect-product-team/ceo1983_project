import { app_role } from '@vibe/db';

export class UpdateAccountProfileDto {
  name?: string;
  email?: string;
  avatar_url?: string;
  professional_title?: string;
  company_name?: string;
  industry?: string;
  region?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}

export class ChangePasswordDto {
  currentPassword?: string;
  newPassword!: string;
}

export class DeactivateAccountDto {
  password?: string;
}

export class ListUsersQueryDto {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class AdminCreateUserDto {
  username!: string;
  email?: string;
  password?: string;
  name?: string;
  role?: app_role;
  account_status?: string;
}

export class AdminUpdateUserDto {
  name?: string;
  email?: string;
  role?: app_role;
  account_status?: string;
}

export class AdminResetPasswordDto {
  newPassword!: string;
}

export class AdminToggleStatusDto {
  status?: string;
}
