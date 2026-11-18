import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, ShieldCheck, Star, Sparkles, Building2, Users, FolderTree } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { useServerFn } from "@tanstack/react-start";
import { useServerData } from "@/hooks/use-server-data";
import { listMyAssociationsFn, type MyAssociation } from "@/lib/associations.functions";
import { useT, type TKey } from "@/lib/i18n";
import { fetchNestApi } from "@/lib/api-client";
import {
  isRouteAllowedByMatrix,
  isActionAllowedByMatrix,
  type SystemRoleKey,
} from "@/lib/rbac-permission-helpers";


interface TreeFeatureAction {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  apiEndpoint?: string;
  [key: string]: any;
}

interface TreeFeature {
  id?: string;
  name: string;
  route: string;
  description?: string;
  actions: TreeFeatureAction[];
  [key: string]: any;
}

interface TreeCategory {
  id?: string;
  name: string;
  features: TreeFeature[];
  [key: string]: any;
}

export const Route = createFileRoute("/my-permissions")({
  head: () => ({
    meta: [
      { title: "Phân quyền của tôi — CEO 1983" },
      {
        name: "description",
        content: "Xem vai trò và những thao tác bạn được phép thực hiện trong hệ thống theo chuẩn RBAC thời gian thực.",
      },
    ],
  }),
  component: MyPermissionsPage,
});

function MyPermissionsPage() {
  const t = useT();
  const roleState = useRole();
  const {
    srsRole,
    userDepartment,
    isPlatformAdmin,
    isAdmin,
    isChuTich,
    isTongThuKy,
    isTruongBanTaiChinh,
    isTruongBanTruyenThong,
    isTruongBanThanhVien,
    isTruongBanXucTien,
    isTruongBanThienNguyen,
    loading,
  } = roleState;

  const fetchMine = useServerFn(listMyAssociationsFn);
  const { data: myAssocs } = useServerData<MyAssociation[]>(() => fetchMine(), []);

  // Tải ma trận phân quyền thực tế từ CSDL PostgreSQL (113.20.107.184:6432)
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNestApi("/admin/permission-matrix")
      .then((res: any) => {
        if (!active || !res) return;
        const incoming = res.categories || res.rows;
        if (Array.isArray(incoming) && incoming.length > 0) {
          setCategories(incoming);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingMatrix(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Xác định Role Key hiển thị chuẩn RBAC
  const effectiveRoleKey: SystemRoleKey = useMemo(() => {
    const rawRole = (srsRole as string) || "";
    if (rawRole.startsWith("thanh_vien_ban_")) return rawRole as SystemRoleKey;
    if (rawRole === "truong_ban_truyen_thong" || isTruongBanTruyenThong) return "truong_ban_truyen_thong";
    if (rawRole === "truong_ban_thanh_vien" || isTruongBanThanhVien) return "truong_ban_thanh_vien";
    if (rawRole === "truong_ban_xuc_tien" || isTruongBanXucTien) return "truong_ban_xuc_tien";
    if (rawRole === "truong_ban_tai_chinh" || isTruongBanTaiChinh) return "truong_ban_tai_chinh";
    if (rawRole === "truong_ban_thien_nguyen" || isTruongBanThienNguyen) return "truong_ban_thien_nguyen";
    if (rawRole === "tong_thu_ky" || isTongThuKy) return "tong_thu_ky";
    if (rawRole === "chu_tich" || isChuTich) return "chu_tich";
    if (rawRole === "quan_tri" || isPlatformAdmin) return "quan_tri";
    if (rawRole === "admin" || isAdmin) return "admin";
    return "member";
  }, [
    srsRole,
    isPlatformAdmin,
    isAdmin,
    isChuTich,
    isTongThuKy,
    isTruongBanTaiChinh,
    isTruongBanTruyenThong,
    isTruongBanThanhVien,
    isTruongBanXucTien,
    isTruongBanThienNguyen,
  ]);

  const roleNameDisplay = useMemo(() => {
    const map: Record<string, string> = {
      quan_tri: "Quản trị Hệ thống Cấp cao (Platform Admin)",
      chu_tich: "Chủ tịch CLB Doanh Nhân CEO 1983",
      admin: "Quản trị viên Hiệp hội (Admin)",
      ban_dieu_hanh: "Ban Điều Hành CEO 1983",
      tong_thu_ky: "Tổng thư ký / Ban Thư ký",
      truong_ban_tai_chinh: "Trưởng ban Tài chính & Quỹ Tương Ái",
      truong_ban_truyen_thong: "Trưởng ban Truyền thông & Báo chí",
      truong_ban_thanh_vien: "Trưởng ban Phát triển Hội viên",
      truong_ban_xuc_tien: "Trưởng ban Xúc tiến Giao thương B2B",
      truong_ban_thien_nguyen: "Trưởng ban Thiện nguyện & Xã hội",
      thanh_vien_ban_tai_chinh: "Thành viên chuyên trách Ban Tài chính",
      thanh_vien_ban_truyen_thong: "Thành viên chuyên trách Ban Truyền thông",
      thanh_vien_ban_thanh_vien: "Thành viên chuyên trách Ban Thành viên",
      thanh_vien_ban_xuc_tien: "Thành viên chuyên trách Ban Xúc tiến",
      thanh_vien_ban_thien_nguyen: "Thành viên chuyên trách Ban Thiện nguyện",
      thanh_vien_ban_su_kien: "Thành viên chuyên trách Ban Sự kiện",
      member: "Hội viên Chính thức CLB Doanh Nhân CEO 1983",
    };
    return map[effectiveRoleKey] || srsRole || "Hội viên";
  }, [effectiveRoleKey, srsRole]);

  return (
    <AppShell>
      <PageHeader
        title="Quyền Hạn & Vai Trò Của Bạn (RBAC Realtime)"
        subtitle="Tra cứu trực tiếp các phân hệ và quyền hạn thao tác được đồng bộ thời gian thực từ CSDL PostgreSQL 113.20.107.184:6432"
      />

      {/* Effective role summary */}
      <Card className="mb-6 p-5 border border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#003B95]/15 text-[#003B95] dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>Vai trò vận hành hệ thống</span>
              </div>
              <div className="text-base sm:text-lg font-black text-foreground mt-0.5">
                {roleNameDisplay}
              </div>
              {userDepartment && (
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  Phòng ban trực thuộc: {userDepartment}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Chuẩn RBAC 100% CSDL
            </span>
          </div>
        </div>
      </Card>

      {/* Hiệp hội trực thuộc */}
      {(myAssocs ?? []).length > 0 && (
        <Card className="mb-6 overflow-hidden border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5 bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-4 text-blue-600" />
              <span>Hiệp Hội &amp; Câu Lạc Bộ Thành Viên</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10.5px] font-bold uppercase text-muted-foreground">
                  <th className="px-5 py-2.5 text-left">Đơn vị</th>
                  <th className="px-5 py-2.5 text-left">Vai trò phân bổ</th>
                  <th className="px-5 py-2.5 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(myAssocs ?? []).map((a: any) => (
                  <tr key={a.associationId} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 font-semibold text-foreground">{a.name}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {a.role || "member"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {a.isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Star className="size-3 fill-current" />
                          Đang hoạt động
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ma trận chi tiết quyền hạn thực tế từ CSDL */}
      <Card className="overflow-hidden border border-border bg-card">
        <div className="border-b border-border px-5 py-4 bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FolderTree className="size-4 text-amber-500" />
              <span>Ma Trận Quyền Hạn Chi Tiết Theo Từng Tính Năng</span>
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Các chức năng bạn có quyền Xem, Thao tác, Thêm mới, Sửa hoặc Duyệt trong toàn bộ hệ thống
            </p>
          </div>
          {loadingMatrix && (
            <span className="text-xs text-muted-foreground animate-pulse">Đang tải ma trận...</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left">Nhóm chức năng &amp; Phân hệ</th>
                <th className="px-5 py-3 text-left">Đường dẫn</th>
                <th className="px-5 py-3 text-center">Truy cập Trang</th>
                <th className="px-5 py-3 text-left">Các thao tác được phép</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.flatMap((cat) =>
                cat.features.map((feat: TreeFeature) => {
                  const canAccessPage = isRouteAllowedByMatrix(feat.route, effectiveRoleKey);
                  const allowedActions = feat.actions.filter((act: TreeFeatureAction) =>
                    isActionAllowedByMatrix(act.code || act.id || act.name || '', effectiveRoleKey)
                  );

                  return (
                    <tr
                      key={feat.id || feat.route}
                      className={`hover:bg-muted/30 transition ${
                        canAccessPage ? "bg-background" : "bg-muted/10 opacity-75"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="font-bold text-foreground">{feat.name}</div>
                        <div className="text-[11px] text-muted-foreground">{feat.description}</div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {feat.route}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {canAccessPage ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            <Check className="size-3.5" /> Có quyền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-medium text-[11px]">
                            <Minus className="size-3.5" /> Giới hạn
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {allowedActions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {allowedActions.map((act: TreeFeatureAction) => (
                              <span
                                key={act.id || act.code}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold text-[10.5px] border border-blue-500/20"
                                title={act.description || act.apiEndpoint}
                              >
                                <Check className="size-3 text-blue-600 dark:text-blue-400" />
                                {act.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Chỉ xem hoặc không có thao tác riêng
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
