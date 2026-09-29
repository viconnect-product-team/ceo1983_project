import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { DATA_SCOPE_KEY, DataScopeType } from './data-scope.decorator';

@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const scope = this.reflector.getAllAndOverride<DataScopeType>(DATA_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!scope) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRoles: string[] = [];
    if (user?.roles && Array.isArray(user.roles)) {
      userRoles.push(...user.roles);
    }
    if (user?.role) {
      userRoles.push(user.role);
    }
    if (user?.srsRole) {
      userRoles.push(user.srsRole);
    }

    const normRoles = userRoles.map((r) => String(r).toLowerCase().trim());
    const isSuperAdmin =
      normRoles.includes('platform_admin') ||
      normRoles.includes('superadmin') ||
      normRoles.includes('adm');
    const isBQT = isSuperAdmin || normRoles.includes('admin') || normRoles.includes('bqt');
    const isBTC = isBQT || normRoles.includes('btc') || normRoles.includes('truong_ban_tai_chinh');
    const isBTT = isBQT || normRoles.includes('btt') || normRoles.includes('truong_ban_truyen_thong');

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // Apply policy per scope
        switch (scope) {
          case 'sponsor':
            // BQT, BTC, BTT have full access to sponsor details & amounts
            if (isBQT || isBTC || isBTT) {
              return data;
            }
            // Standard members or guest: mask contact info and internal notes
            return this.scopeSponsorData(data);

          case 'event':
            if (isBQT || isBTT) {
              return data;
            }
            return this.scopeEventData(data);

          default:
            return data;
        }
      }),
    );
  }

  private scopeSponsorData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeSponsorItem(item));
    }
    return this.sanitizeSponsorItem(data);
  }

  private sanitizeSponsorItem(item: any): any {
    if (!item || typeof item !== 'object') return item;

    const maskedPhone = item.phone
      ? item.phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2')
      : '';
    const maskedEmail = item.email
      ? item.email.replace(/(.{2})(.*)(?=@)/, (_: any, a: any, b: any) => a + '*'.repeat(b.length))
      : '';

    return {
      ...item,
      // Mask executive direct contact info for non-managers
      phone: maskedPhone,
      email: maskedEmail,
      // Retain public brand visibility & event partnership status
      name: item.name,
      tier: item.tier,
      packageType: item.packageType,
      assignedEvent: item.assignedEvent,
      isAssigned: item.isAssigned,
    };
  }

  private scopeEventData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeEventItem(item));
    }
    return this.sanitizeEventItem(data);
  }

  private sanitizeEventItem(item: any): any {
    if (!item || typeof item !== 'object') return item;
    // Strip internal QR staff notes / checkin secrets for non-staff
    const { qrStaff, ...rest } = item;
    return rest;
  }
}
