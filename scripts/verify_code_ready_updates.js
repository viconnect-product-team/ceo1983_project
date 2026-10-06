const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const filesToVerify = [
  'apps/ceo1983_app_be/src/events/events.service.ts',
  'apps/ceo1983_app_be/src/mail/mail.service.ts',
  'apps/ceo1983_app_be/src/meetings/meetings.service.ts',
  'apps/ceo1983_app_fe/src/routes/events.index.tsx',
  'apps/ceo1983_app_fe/src/routes/association.events.tsx',
  'apps/ceo1983_app_fe/src/routes/m.events.tsx',
  'apps/ceo1983_app_fe/src/lib/member-app/events.functions.ts',
  'apps/ceo1983_app_fe/src/lib/meetings.functions.ts',
  'apps/ceo1983_app_fe/src/components/meetings/Create1on1MeetingModal.tsx',
  'apps/ceo1983_app_fe/src/routes/permissions.tsx',
  'apps/ceo1983_app_fe/src/components/dashboard/Sidebar.tsx',
  'apps/ceo1983_app_fe/src/lib/nav-items.ts',
  'scripts/build_all_master_ceo1983_docs.js',
  'scripts/data_ceo1983_brd.js',
  'scripts/data_ceo1983_srs.js',
];

console.log('=== KIỂM TRA AST CÚ PHÁP TẤT CẢ TỆP VỪA CHỈNH SỬA ===\n');

let totalErrors = 0;
const root = path.resolve(__dirname, '..');

for (const rel of filesToVerify) {
  const fullPath = path.join(root, rel);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [NOT FOUND] ${rel}`);
    totalErrors++;
    continue;
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  const isTsx = rel.endsWith('.tsx');
  const isJs = rel.endsWith('.js');
  
  const sourceFile = ts.createSourceFile(
    rel,
    code,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : (isJs ? ts.ScriptKind.JS : ts.ScriptKind.TS)
  );

  const diagnostics = sourceFile.parseDiagnostics || [];
  if (diagnostics.length === 0) {
    console.log(`✅ [PASS] ${rel}: 0 syntax errors`);
  } else {
    console.error(`❌ [FAIL] ${rel}: ${diagnostics.length} syntax errors!`);
    diagnostics.forEach(d => {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start);
      console.error(`   Line ${line + 1}:${character + 1} - ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    });
    totalErrors += diagnostics.length;
  }
}

if (totalErrors === 0) {
  console.log(`\n🎉 TẤT CẢ ${filesToVerify.length} TỆP ĐỀU VƯỢT QUA KIỂM TRA AST VỚI 0 LỖI!`);
  process.exit(0);
} else {
  console.error(`\n❌ PHÁT HIỆN TỔNG CỘNG ${totalErrors} LỖI!`);
  process.exit(1);
}
