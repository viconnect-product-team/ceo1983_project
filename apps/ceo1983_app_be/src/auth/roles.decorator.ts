import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to enforce required roles for controller classes or handlers.
 * Example: @Roles('admin', 'bqt', 'btt')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
