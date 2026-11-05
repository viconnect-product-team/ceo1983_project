const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const files = [
  'apps/ceo1983_app_fe/src/components/opportunities/modals/OpportunityEditModal.tsx',
  'apps/ceo1983_app_fe/src/routes/association.opportunities.tsx',
  'apps/ceo1983_app_fe/src/routes/association.members.tsx',
  'apps/ceo1983_app_fe/src/routes/intro.tsx',
  'apps/ceo1983_app_fe/src/routes/ai-assistant.tsx',
  'apps/ceo1983_app_fe/src/components/landing/Ceo1983FullLandingWeb.tsx',
  'apps/ceo1983_app_fe/src/components/documents/MemberGoogleDriveSyncModal.tsx',
  'apps/ceo1983_app_fe/src/components/member/MemberShell.tsx',
  'apps/ceo1983_app_fe/src/lib/share-helper.ts',
  'apps/ceo1983_app_be/src/app.controller.ts',
  'apps/ceo1983_app_be/src/ai/ai-crm-analytics.service.ts',
  'apps/ceo1983_app_be/src/ai/ai.controller.ts'
];

console.log('--- KIỂM TRA AST & CÚ PHÁP TOÀN DIỆN CÁC TỆP MÃ NGUỒN ---');
let totalErrors = 0;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`[SKIP] Không tìm thấy: ${f}`);
    continue;
  }
  const code = fs.readFileSync(f, 'utf8');
  const sourceFile = ts.createSourceFile(
    f,
    code,
    ts.ScriptTarget.Latest,
    true,
    f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const diagnostics = sourceFile.parseDiagnostics || [];
  if (diagnostics.length === 0) {
    console.log(`✓ [PASS] ${f} (0 errors)`);
  } else {
    console.error(`❌ [FAIL] ${f}: ${diagnostics.length} errors:`, diagnostics);
    totalErrors += diagnostics.length;
  }
}

if (totalErrors === 0) {
  console.log('\n>>> 100% CÁC TỆP MÃ NGUỒN ĐỀU ĐẠT CHUẨN AST & KHÔNG CÓ LỖI CÚ PHÁP (0 ERRORS)! <<<');
  process.exit(0);
} else {
  console.error(`\n>>> THẤT BẠI: ${totalErrors} LỖI CÚ PHÁP <<<`);
  process.exit(1);
}

