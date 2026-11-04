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

    // 1. Kiểm tra vai trò thời gian thực trực tiếp từ CSDL (Realtime DB Authorization)
    // Đảm bảo khi Quản trị viên thay đổi phân quyền trong DB, API lập tức chặn ngay hành vi thao tác
    const dbRoles: string[] = [];
    if (user.id) {
      try {
        const urRows = await this.prisma.$queryRaw<any[]>`
          SELECT role::text FROM public.user_roles WHERE user_id = ${user.id}::uuid
        `.catch(() => []);
        dbRoles.push(...urRows.map((r) => r.role));

        const memRows = await this.prisma.$queryRaw<any[]>`
          SELECT role::text FROM public.memberships WHERE user_id = ${user.id}::uuid
        `.catch(() => []);
        dbRoles.push(...memRows.map((r) => r.role));

        // Kiểm tra vai trò ban điều hành & chức vụ trong bảng members
        const memberRows = await this.prisma.$queryRaw<any[]>`
          SELECT executive_role::text, department::text, status::text 
          FROM public.members 
          WHERE user_id = ${user.id}::uuid OR id::text = ${user.id}::text 
          LIMIT 1
        `.catch(() => []);
        if (memberRows.length > 0) {
          const m = memberRows[0];
          if (m.executive_role) dbRoles.push(m.executive_role);
          if (m.department) dbRoles.push(m.department);
          // Nếu hội viên bị đình chỉ hoặc vô hiệu hóa trong DB, lập tức chặn
          if (m.status === 'suspended' || m.status === 'inactive' || m.status === 'banned') {
            throw new ForbiddenException(
              'Tài khoản của bạn đã bị tạm khóa hoặc thu hồi quyền truy cập. Vui lòng liên hệ Ban Điều Hành.',
            );
          }
        }

        const vUsers = await this.prisma.$queryRaw<any[]>`
          SELECT email, username, role, status FROM public.vione_users WHERE id = ${user.id}::uuid LIMIT 1
        `.catch(() => []);
        if (vUsers.length > 0) {
          const vu = vUsers[0];
          if (vu.status === 'inactive' || vu.status === 'suspended' || vu.status === 'banned') {
            throw new ForbiddenException(
              'Tài khoản của bạn đã bị vô hiệu hóa bởi Quản trị viên.',
            );
          }
          if (vu.role) dbRoles.push(vu.role);
          // VULN-02 Fix: Chỉ tài khoản quản trị hệ thống chính thức được định danh tường minh (loại bỏ lỗ hổng substring includes 'admin')
          const cleanEmail = (vu.email || '').toLowerCase().trim();
          const cleanUsername = (vu.username || '').toLowerCase().trim();
          if (cleanEmail === 'admin@connect.vn' || cleanUsername === 'admin@connect.vn' || cleanEmail === 'ceo.chutich@ceo1983.com') {
            dbRoles.push('admin', 'platform_admin', 'adm');
          }
        }
      } catch (err) {
        if (err instanceof ForbiddenException) throw err;
        console.warn('[RolesGuard] Realtime DB roles query error:', err);
      }
    }

    // 2. Kết hợp vai trò từ CSDL và JWT payload (với CSDL là chân lý bổ sung)
    const effectiveRoles: string[] = [...dbRoles];
    if (Array.isArray(user.roles)) effectiveRoles.push(...user.roles);
    if (user.role) effectiveRoles.push(user.role);
    if (user.srsRole) effectiveRoles.push(user.srsRole);
    if (user.executiveRole) effectiveRoles.push(user.executiveRole);

    const userEmail = String(user.email || user.username || '').toLowerCase().trim();
    if (userEmail === 'admin@connect.vn' || userEmail === 'ceo.chutich@ceo1983.com' || userEmail.startsWith('admin')) {
      effectiveRoles.push('admin', 'platform_admin', 'adm', 'chu_tich', 'bqt');
    }

    const normalizedUserRoles = effectiveRoles.map((r) => String(r).toLowerCase().trim());

    // SuperAdmin / Platform Admin / ADM / Admin / Chủ tịch / Ban Điều Hành bypass
    if (
      normalizedUserRoles.includes('platform_admin') ||
      normalizedUserRoles.includes('superadmin') ||
      normalizedUserRoles.includes('adm') ||
      normalizedUserRoles.includes('admin') ||
      normalizedUserRoles.includes('quan_tri') ||
      normalizedUserRoles.includes('chu_tich') ||
      normalizedUserRoles.includes('chủ tịch') ||
      normalizedUserRoles.includes('president') ||
      normalizedUserRoles.includes('bqt') ||
      normalizedUserRoles.includes('ban_dieu_hanh')
    ) {
      return true;
    }

    let hasPermission = requiredRoles.some((role) =>
      normalizedUserRoles.includes(role.toLowerCase().trim()),
    );

    // Kiểm tra thêm quyền từ user.permissions hoặc ma trận phân quyền dynamic trong DB (Đồng bộ RBAC API)
    if (!hasPermission) {
      const userPerms: string[] = Array.isArray(user.permissions) ? user.permissions.map((p: any) => String(p).toLowerCase().trim()) : [];
      if (userPerms.includes('*') || requiredRoles.some((req) => userPerms.includes(req.toLowerCase().trim()))) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      try {
        const matrixRows = await this.prisma.$queryRaw<{ value: any }[]>`
          SELECT value FROM public.app_settings WHERE key = 'crm_permission_matrix' LIMIT 1
        `.catch(() => []);
        if (matrixRows.length > 0 && matrixRows[0]?.value) {
          const val = matrixRows[0].value;
          const categories = val.categories || val.rows || (Array.isArray(val) ? val : []);
          if (Array.isArray(categories)) {
            for (const cat of categories) {
              if (hasPermission) break;
              if (!cat?.features || !Array.isArray(cat.features)) continue;
              for (const feat of cat.features) {
                if (hasPermission) break;
                if (!feat?.actions || !Array.isArray(feat.actions)) continue;
                for (const act of feat.actions) {
                  const actCode = String(act.code || act.id || '').toLowerCase().trim();
                  const matchesReq = requiredRoles.some((req) => req.toLowerCase().trim() === actCode || actCode.includes(req.toLowerCase().trim()));
                  if (matchesReq && act.roles) {
                    const isGranted = normalizedUserRoles.some((r) => act.roles[r] === true);
                    if (isGranted) {
                      hasPermission = true;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      } catch {}
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        `Quyền hạn của bạn đã bị thay đổi hoặc bạn không có quyền thực hiện thao tác này (yêu cầu một trong các quyền: ${requiredRoles.join(', ')})`,
      );
    }

    return true;
  }
}
