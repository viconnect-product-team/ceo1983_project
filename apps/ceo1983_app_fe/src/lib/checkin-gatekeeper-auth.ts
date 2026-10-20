/**
 * Tiện ích xác thực quyền Quét mã QR Check-in Sự kiện (Dùng chung cho cả CRM và App CEO 1983)
 * 
 * QUY TẮC NGHIỆP VỤ BẮT BUỘC (Strict Constraint):
 * 1. Các tài khoản có role Quản trị, Chủ tịch, Admin (hoặc Platform Admin) LUÔN LUÔN có quyền và luôn hiển thị.
 * 2. Ngoài các role trên, CHỈ HIỂN THỊ cho các tài khoản có role "Thành viên Ban Truyền Thông" 
 *    thuộc Ban Truyền Thông VÀ được tick chọn ở popup tạo/sửa sự kiện trên CRM (danh sách qrStaff / qrScanners).
 * 3. Bất kỳ tài khoản nào không thỏa mãn 2 điều kiện trên đều KHÔNG ĐƯỢC PHÉP và KHÔNG HIỂN THỊ chức năng quét mã check-in.
 */

export function isPrivilegedAdminOrPresident(user: any, member?: any): boolean {
  if (!user && !member) return false;
  const role = String(
    user?.role ||
    member?.role ||
    user?.executiveRole ||
    (user as any)?.executive_role ||
    member?.executiveRole ||
    (member as any)?.executive_role ||
    ""
  ).toLowerCase().trim();

  if (
    user?.isAdmin ||
    user?.isPresident ||
    user?.isPlatformAdmin ||
    user?.permissions?.includes("admin:full_access") ||
    user?.permissions?.includes("system:manage") ||
    role === "quan_tri" ||
    role === "admin" ||
    role === "chu_tich" ||
    role === "platform_admin" ||
    role === "superadmin" ||
    role.includes("quản trị") ||
    role.includes("chủ tịch") ||
    role.includes("admin")
  ) {
    return true;
  }
  return false;
}

export function isMediaDepartmentMember(user: any, member?: any): boolean {
  if (!user && !member) return false;
  const role = String(
    user?.role ||
    member?.role ||
    user?.executiveRole ||
    (user as any)?.executive_role ||
    member?.executiveRole ||
    (member as any)?.executive_role ||
    ""
  ).toLowerCase().trim();

  const dept = String(
    user?.department ||
    member?.department ||
    (user as any)?.dept ||
    (member as any)?.dept ||
    ""
  ).toLowerCase().trim();

  // Role thuộc ban truyền thông
  const isRoleMedia =
    role === "thanh_vien_ban_truyen_thong" ||
    role === "truong_ban_truyen_thong" ||
    role.includes("truyen_thong") ||
    role.includes("truyền thông") ||
    role.includes("media");

  // Ban chuyên môn là ban truyền thông
  const isDeptMedia =
    dept.includes("truyền thông") ||
    dept.includes("media") ||
    dept.includes("btt");

  return isRoleMedia || isDeptMedia;
}

export function isUserAssignedToEvent(user: any, event: any, member?: any): boolean {
  if (!event) return false;
  let scanners =
    event.qrStaff ||
    event.qrScanners ||
    event.qr_staff ||
    event.qr_scanners ||
    event.qr_staff_ids ||
    [];

  if (typeof scanners === "string") {
    try {
      scanners = JSON.parse(scanners);
    } catch {
      scanners = scanners.split(",").map((s: string) => s.trim());
    }
  }

  if (!Array.isArray(scanners) || scanners.length === 0) return false;

  const myIdentifiers = [
    user?.id,
    user?.memberCode,
    user?.code,
    user?.phone,
    user?.email,
    user?.name,
    member?.id,
    member?.code,
    member?.phone,
    member?.email,
    member?.name,
    (user as any)?.user_name,
    (user as any)?.user_email,
    (user as any)?.user_phone,
  ]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase().trim());

  return scanners.some((s: any) => {
    if (typeof s === "string") {
      const lower = s.toLowerCase().trim();
      return myIdentifiers.some(
        (id) => id && (lower === id || lower.includes(id) || id.includes(lower))
      );
    }
    if (typeof s === "object" && s !== null) {
      const objVals = [s.id, s.code, s.userId, s.memberCode, s.phone, s.email, s.name]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase().trim());
      return myIdentifiers.some(
        (id) => id && objVals.some((val) => val === id || val.includes(id) || id.includes(val))
      );
    }
    return false;
  });
}

/**
 * Kiểm tra xem người dùng có quyền hiển thị / thực thi tính năng quét mã QR Check-in hay không.
 *
 * @param user Tài khoản người dùng hiện tại
 * @param eventOrEvents Sự kiện cụ thể hoặc danh sách tất cả các sự kiện
 * @param member Hồ sơ hội viên gắn với tài khoản
 */
export function canScanEventQr(user: any, eventOrEvents?: any | any[], member?: any): boolean {
  // 1. Quản trị, Chủ tịch, Admin: Luôn luôn có quyền quét mã check-in
  if (isPrivilegedAdminOrPresident(user, member)) {
    return true;
  }

  // 2. Không phải Quản trị/Chủ tịch/Admin: BẮT BUỘC phải là thành viên Ban Truyền Thông
  if (!isMediaDepartmentMember(user, member)) {
    return false;
  }

  // 3. VÀ BẮT BUỘC phải được tick chọn ở popup tạo/sửa sự kiện trên CRM (nằm trong qrStaff)
  if (!eventOrEvents) return false;

  if (Array.isArray(eventOrEvents)) {
    if (eventOrEvents.length === 0) return false;
    return eventOrEvents.some((ev) => isUserAssignedToEvent(user, ev, member));
  }

  return isUserAssignedToEvent(user, eventOrEvents, member);
}
