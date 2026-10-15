import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clearServerDataCache } from '@/hooks/use-server-data';

export function clearUserSessionData() {
  if (typeof window === 'undefined') return;
  try {
    // 1. Tokens and cookies
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_refresh_token');
    localStorage.removeItem('vibe_user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    clearSessionCookies();

    // 2. Member profile caches
    localStorage.removeItem('vba_custom_profile');
    localStorage.removeItem('vba_my_member');
    localStorage.removeItem('vba_member_company_logo');
    localStorage.removeItem('vba_member_avatar_photo');
    localStorage.removeItem('vba_member_cover_photo');
    localStorage.removeItem('vba_member_phone');
    localStorage.removeItem('vba_user_email');
    localStorage.removeItem('vibe_user_email');
    localStorage.removeItem('vba_current_role');
    localStorage.removeItem('vba_user_role');
    localStorage.removeItem('vba_is_admin');
    localStorage.removeItem('vba_admin_role_override');
    localStorage.removeItem('vba_crm_role_override');
    localStorage.removeItem('vba_cleared_badges');
    localStorage.removeItem('vba_user_posts');
    localStorage.removeItem('vba_is_media_department_member');
    localStorage.removeItem('vba_assigned_event_scanner');

    // 3. User-scoped and module keys (xoá sạch toàn bộ key vba_, sb-, bc.)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('vba_') ||
          key.startsWith('sb-') ||
          key.startsWith('bc.auth') ||
          key.startsWith('vibe_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 4. Wipe RAM cache
    clearServerDataCache();

    // 5. Broadcast to all open components
    window.dispatchEvent(new Event('vba_auth_changed'));
    window.dispatchEvent(new Event('profile-updated'));
    window.dispatchEvent(new Event('role-changed'));
  } catch (err) {
    console.error('Error clearing user session data:', err);
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  department?: string;
  boardName?: string;
  title?: string;
  phone?: string;
  permissions?: string[];
  /** Alias cho các nơi dùng user.user_metadata.full_name */
  user_metadata?: { full_name?: string; avatar_url?: string; [key: string]: any };
  [key: string]: any;
}

export interface AppSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user: AppUser;
}

type AuthStatus = 'loading' | 'in' | 'out';

type AuthContextType = {
  user: AppUser | null;
  status: AuthStatus;
  session: AppSession | null;
  logout: () => void;
  setAuthData: (session: any) => void;
  hasPermission: (permission: string) => boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── JWT Helpers ───────────────────────────────────────────────────────────────

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c: any) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  // hết hạn trước 30 giây
  return decoded.exp * 1000 > Date.now() + 30_000;
}

function tokenToUser(decoded: Record<string, any>): AppUser {
  const email = decoded.email || decoded.username || '';
  const role = decoded.role || decoded.user_role || decoded.user_metadata?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'member');
  const department = decoded.department || '';
  const roles = decoded.roles || [role];
  const executiveRole = decoded.executive_role || decoded.executiveRole || '';
  const isPresident = Boolean(decoded.isPresident || role === 'chu_tich' || role === 'president');
  const isAdmin = Boolean(decoded.isAdmin || isPresident || role === 'admin' || role === 'quan_tri');
  const isExecutive = Boolean(decoded.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt');
  const isGeneralSecretary = Boolean(decoded.isGeneralSecretary || role === 'tong_thu_ky');
  const isDepartmentLeader = Boolean(decoded.isDepartmentLeader || role.startsWith('truong_ban_'));

  const permissions: string[] = Array.isArray(decoded.permissions)
    ? decoded.permissions
    : Array.isArray(decoded.user_metadata?.permissions)
    ? decoded.user_metadata.permissions
    : isAdmin
    ? ['admin:full_access', 'marketplace:manage', 'event:manage', 'news:manage', 'member:manage', 'event:scan_qr']
    : ['marketplace:view', 'marketplace:post', 'event:view', 'news:view', 'member:view'];

  return {
    id: decoded.sub || decoded.id || '',
    email,
    username: decoded.username,
    name: decoded.name || decoded.full_name || '',
    avatar_url: decoded.avatar_url || '',
    role,
    roles,
    department,
    permissions,
    boardName: decoded.boardName || '',
    title: decoded.title || '',
    phone: decoded.phone || '',
    executiveRole,
    executive_role: executiveRole,
    memberCode: decoded.memberCode || null,
    memberId: decoded.memberId || null,
    isPresident,
    isAdmin,
    isExecutive,
    isGeneralSecretary,
    isDepartmentLeader,
    isBoardOfDirectors: isPresident || isExecutive || decoded.isBoardOfDirectors || Boolean(decoded.boardName) || false,
    user_metadata: {
      full_name: decoded.name || decoded.full_name || '',
      avatar_url: decoded.avatar_url || '',
      role,
      department,
      permissions,
      ...(decoded.user_metadata || {}),
    },
  };
}

function buildSession(accessToken: string, refreshToken: string, user: AppUser): AppSession {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    token_type: 'bearer',
    user,
  };
}

function setSessionCookies(session: AppSession) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = isHttps ? '; secure' : '';
  const maxAge = session.expires_in ?? 3600;
  document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `vibe_token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `access_token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax${secure}`;
}

function clearSessionCookies() {
  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'vibe_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'https:' ||
    window.location.port === '5443' ||
    window.location.port === '5444' ||
    window.location.port === '5445')
    ? ''
    : ((import.meta.env.VITE_API_URL as string | undefined) ?? '');

async function apiRefresh(refreshToken: string): Promise<AppSession | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access_token) return null;
    const user = mapApiUser(data.user, data.access_token);
    return buildSession(data.access_token, data.refresh_token ?? refreshToken, user);
  } catch {
    return null;
  }
}

function mapApiUser(apiUser: any, accessToken: string): AppUser {
  const decoded = decodeJwt(accessToken) || {};
  const email = apiUser?.email || apiUser?.username || decoded.email || decoded.username || '';
  const role = apiUser?.role || decoded.role || decoded.user_role || (email.toLowerCase().includes('admin') ? 'admin' : 'member');
  const department = apiUser?.department || decoded.department || '';
  const roles = apiUser?.roles || decoded.roles || [role];
  const executiveRole = apiUser?.executive_role || apiUser?.executiveRole || decoded.executive_role || decoded.executiveRole || '';
  const isPresident = Boolean(apiUser?.isPresident || decoded.isPresident || role === 'chu_tich' || role === 'president');
  const isAdmin = Boolean(apiUser?.isAdmin || decoded.isAdmin || isPresident || role === 'admin' || role === 'quan_tri');
  const isExecutive = Boolean(apiUser?.isExecutive || decoded.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt');
  const isGeneralSecretary = Boolean(apiUser?.isGeneralSecretary || decoded.isGeneralSecretary || role === 'tong_thu_ky');
  const isDepartmentLeader = Boolean(apiUser?.isDepartmentLeader || decoded.isDepartmentLeader || role.startsWith('truong_ban_'));

  const permissions: string[] = Array.isArray(apiUser?.permissions)
    ? apiUser.permissions
    : Array.isArray(decoded.permissions)
    ? decoded.permissions
    : isAdmin
    ? ['admin:full_access', 'marketplace:manage', 'event:manage', 'news:manage', 'member:manage', 'event:scan_qr']
    : ['marketplace:view', 'marketplace:post', 'event:view', 'news:view', 'member:view'];

  // TUYỆT ĐỐI KHÔNG lưu các cờ bảo mật (isAdmin, role, department) thành các key riêng lẻ ở localStorage
  // Dọn dẹp triệt để các key thừa nếu từng tồn tại để đảm bảo tuân thủ nghiêm ngặt về an toàn thông tin
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('vba_current_role');
      localStorage.removeItem('vba_user_role');
      localStorage.removeItem('vba_user_department');
      localStorage.removeItem('vba_is_admin');
      localStorage.removeItem('vba_is_president');
      localStorage.removeItem('vba_user_email');
      localStorage.removeItem('vba_member_phone');
      localStorage.removeItem('vba_is_event_qr_scanner');
      localStorage.removeItem('vba_is_media_department_member');
    } catch {}
  }

  return {
    id: apiUser?.id || decoded.sub || '',
    email,
    username: apiUser?.username || decoded.username,
    name: apiUser?.name || decoded.name || '',
    avatar_url: apiUser?.avatar_url || decoded.avatar_url || '',
    role,
    roles,
    permissions,
    executiveRole,
    executive_role: executiveRole,
    department,
    boardName: apiUser?.boardName || decoded.boardName || '',
    title: apiUser?.title || decoded.title || '',
    phone: apiUser?.phone || decoded.phone || '',
    memberCode: apiUser?.memberCode || decoded.memberCode || null,
    memberId: apiUser?.memberId || decoded.memberId || null,
    isPresident,
    isAdmin,
    isExecutive,
    isGeneralSecretary,
    isDepartmentLeader,
    isBoardOfDirectors: isPresident || isExecutive || apiUser?.isBoardOfDirectors || decoded.isBoardOfDirectors || Boolean(apiUser?.boardName || decoded.boardName) || false,
    user_metadata: {
      full_name: apiUser?.name || decoded.name || '',
      avatar_url: apiUser?.avatar_url || decoded.avatar_url || '',
      role,
      department,
      permissions,
      ...(apiUser?.user_metadata || decoded.user_metadata || {}),
    },
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);

  // Lên lịch auto-refresh token trước khi hết hạn (với cơ chế cooldown chống nháy màn hình)
  function scheduleRefresh(accessToken: string, refreshToken: string) {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const decoded = decodeJwt(accessToken);
    if (!decoded?.exp) return;
    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    
    // Nếu token đã hết hạn hoặc thời gian còn lại không hợp lệ, không lên lịch ngắn hạn
    if (msUntilExpiry <= 0) return;

    // Refresh 2 phút trước khi hết hạn, nhưng tối thiểu 5 phút (300_000ms) để không bị spam liên tục
    const msUntilRefresh = Math.max(msUntilExpiry - 120_000, 300_000);

    refreshTimerRef.current = setTimeout(async () => {
      // Cooldown guard: không gọi refresh nếu vừa thực hiện trong vòng 2 phút
      if (Date.now() - lastRefreshTimeRef.current < 120_000) {
        return;
      }
      lastRefreshTimeRef.current = Date.now();

      const newSession = await apiRefresh(refreshToken);
      if (newSession) {
        applySession(newSession, true);
      } else {
        // Token refresh thất bại nhưng không logout đột ngột nếu access token hiện tại vẫn chưa hết hạn
        if (!isTokenValid(accessToken)) {
          logout();
        }
      }
    }, msUntilRefresh);
  }

  function applySession(sess: AppSession, isBackgroundRefresh = false) {
    const prevUserId = user?.id;
    const prevUserRole = user?.role;
    const isIdentityChanged = !prevUserId || prevUserId !== sess.user?.id || prevUserRole !== sess.user?.role;

    localStorage.setItem('vibe_token', sess.access_token);
    localStorage.setItem('vibe_refresh_token', sess.refresh_token);
    try {
      localStorage.setItem('vibe_user', JSON.stringify(sess.user));
    } catch {}
    setSession(sess);
    setUser(sess.user);
    setStatus('in');
    setSessionCookies(sess);
    scheduleRefresh(sess.access_token, sess.refresh_token);

    // Chỉ phát sự kiện làm mới giao diện khi có thay đổi danh tính thực sự hoặc đăng nhập mới
    // Tuyệt đối không broadcast trong quá trình refresh token nền định kỳ để tránh nhấp nháy UI
    if (!isBackgroundRefresh || isIdentityChanged) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('vba_auth_changed'));
        window.dispatchEvent(new Event('profile-updated'));
        window.dispatchEvent(new Event('role-changed'));
      }
    }
  }

  useEffect(() => {
    // Dọn dẹp an toàn: Xóa bỏ các key nhạy cảm bị lưu trữ trái phép trước đây
    if (typeof window !== 'undefined') {
      const insecureKeys = [
        'vba_is_admin',
        'vba_is_president',
        'vba_user_role',
        'vba_current_role',
        'vba_user_department',
        'vba_user_email',
        'vba_member_phone',
        'vba_is_event_qr_scanner',
        'vba_is_media_department_member',
        'vba_admin_role_override',
        'vba_crm_role_override',
      ];
      insecureKeys.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
    }

    // Khởi động: đọc token từ localStorage
    const accessToken = localStorage.getItem('vibe_token');
    const refreshToken = localStorage.getItem('vibe_refresh_token');

    if (accessToken && isTokenValid(accessToken)) {
      // Token còn hạn — dùng ngay
      const decoded = decodeJwt(accessToken)!;
      const appUser = tokenToUser(decoded);
      const sess = buildSession(accessToken, refreshToken ?? '', appUser);
      applySession(sess);
    } else if (refreshToken) {
      // Access token hết hạn nhưng còn refresh token — tự động làm mới
      apiRefresh(refreshToken).then((newSession) => {
        if (newSession) {
          applySession(newSession);
        } else {
          localStorage.removeItem('vibe_token');
          localStorage.removeItem('vibe_refresh_token');
          setStatus('out');
        }
      });
    } else {
      setStatus('out');
    }

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearUserSessionData();
    setUser(null);
    setSession(null);
    setStatus('out');
  };

  /** Gọi sau khi login thành công — nhận response từ NestJS /auth/login */
  const setAuthData = (data: any) => {
    if (!data?.access_token) return;
    // Dọn dẹp cache của phiên đăng nhập trước trước khi kích hoạt phiên mới
    clearUserSessionData();

    const appUser = mapApiUser(data.user, data.access_token);
    const sess = buildSession(
      data.access_token,
      data.refresh_token ?? localStorage.getItem('vibe_refresh_token') ?? '',
      appUser,
    );
    applySession(sess);
  };

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.isAdmin || user.permissions?.includes('admin:full_access')) return true;
      return Boolean(user.permissions?.includes(permission));
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, status, session, logout, setAuthData, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
