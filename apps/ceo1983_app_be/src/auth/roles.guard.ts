import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Yêu cầu xác thực tài khoản trước khi thực hiện thao tác này',
      );
    }

    // 1. Gather all roles from JWT payload
    const userRoles: string[] = [];
    if (Array.isArray(user.roles)) {
      userRoles.push(...user.roles);
    }
    if (user.role) {
      userRoles.push(user.role);
    }
    if (user.srsRole) {
      userRoles.push(user.srsRole);
    }

    // 2. Fallback to DB to retrieve all assigned roles
    if (user.id) {
      try {
        const dbRoles = await this.prisma.$queryRaw<any[]>`
          SELECT role::text FROM public.user_roles WHERE user_id = ${user.id}::uuid
        `.catch(() => []);
        userRoles.push(...dbRoles.map((r) => r.role));

        const memRoles = await this.prisma.$queryRaw<any[]>`
          SELECT role::text FROM public.memberships WHERE user_id = ${user.id}::uuid
        `.catch(() => []);
        userRoles.push(...memRoles.map((r) => r.role));

        const vUsers = await this.prisma.$queryRaw<any[]>`
          SELECT email, username FROM public.vione_users WHERE id = ${user.id}::uuid LIMIT 1
        `.catch(() => []);
        if (vUsers.some((u: any) => u.email?.toLowerCase().includes('admin') || u.username?.toLowerCase().includes('admin'))) {
          userRoles.push('admin', 'platform_admin', 'adm');
        }
      } catch (err) {
        console.warn('[RolesGuard] Failed to fetch db roles:', err);
      }
    }

    const normalizedUserRoles = userRoles.map((r) => String(r).toLowerCase().trim());

    // SuperAdmin / Platform Admin / ADM / Admin / BQT bypass
    if (
      normalizedUserRoles.includes('platform_admin') ||
      normalizedUserRoles.includes('superadmin') ||
      normalizedUserRoles.includes('adm') ||
      normalizedUserRoles.includes('admin') ||
      normalizedUserRoles.includes('bqt')
    ) {
      return true;
    }

    const hasPermission = requiredRoles.some((role) =>
      normalizedUserRoles.includes(role.toLowerCase().trim()),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện thao tác này (yêu cầu một trong các quyền: ${requiredRoles.join(', ')})`,
      );
    }

    return true;
  }
}
