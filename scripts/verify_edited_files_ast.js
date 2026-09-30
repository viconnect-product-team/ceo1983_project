const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const filesToVerify = [
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/landing/Ceo1983MemberRegistrationForm.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/marketplace/MarketplaceAdSlider.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/association.members.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/common/QuickProfileEditModal.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/association.index.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/meetings.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/dashboard/RbacPermissionMatrix.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/marketplace/ShopeeProductDetailModal.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/association.products.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/marketplace.index.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/constants/permissions.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/hooks/use-role.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/association.permissions.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/components/dashboard/Sidebar.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/lib/rbac-permission-helpers.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/permissions.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/account-settings.index.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/routes/members.index.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/features/tasks/components/TaskFormModal.tsx'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/src/features/tasks/types.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_be/src/members/members.service.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_be/src/tasks/tasks.module.ts'),
  path.resolve(__dirname, '../apps/ceo1983_app_be/src/tasks/tasks.service.ts'),
];

let hasErrors = false;

console.log('=== KIỂM TRA AST CÚ PHÁP & TRANSPILE CÁC FILE CHỈNH SỬA ===\n');

filesToVerify.forEach(filePath => {
  const relPath = path.relative(path.resolve(__dirname, '..'), filePath);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File không tồn tại: ${relPath}`);
    hasErrors = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const result = ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext
      },
      reportDiagnostics: true
    });

    if (result.diagnostics && result.diagnostics.length > 0) {
      console.error(`[SYNTAX ERROR] ${relPath}:`);
      result.diagnostics.forEach(diag => {
        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        console.error(`  -> Lỗi: ${message}`);
      });
      hasErrors = true;
    } else {
      console.log(`[PASS] ${relPath} (0 syntax errors)`);
    }
  } else if (filePath.endsWith('.js')) {
    try {
      require(filePath);
      console.log(`[PASS] ${relPath} (0 syntax errors)`);
    } catch (err) {
      console.error(`[ERROR] ${relPath}: ${err.message}`);
      hasErrors = true;
    }
  }
});

if (hasErrors) {
  console.error('\n=> PHÁT HIỆN LỖI TRONG FILE CHỈNH SỬA!');
  process.exit(1);
} else {
  console.log('\n=> TẤT CẢ FILE ĐÃ ĐẠT 100% CHUẨN CÚ PHÁP, 0 ERRORS!');
  process.exit(0);
}
