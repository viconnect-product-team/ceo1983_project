const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filesToValidate = [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/routes/auth.tsx',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/routes/ai.tsx',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_be/src/ai/ai.service.ts',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_be/src/ai/ai.controller.ts'
];

console.log('=== AST & SYNTAX VALIDATION ===');
let hasErrors = false;

for (const f of filesToValidate) {
  if (!fs.existsSync(f)) {
    console.error('File not found:', f);
    hasErrors = true;
    continue;
  }
  const content = fs.readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(
    path.basename(f),
    content,
    ts.ScriptTarget.Latest,
    true,
    f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  // Check parse diagnostics
  const diags = sf.parseDiagnostics || [];
  if (diags.length > 0) {
    hasErrors = true;
    console.error(`❌ Errors in ${path.basename(f)}:`, diags.length);
    for (const d of diags) {
      console.error(`  - ${d.messageText}`);
    }
  } else {
    console.log(`✓ 0 parse/syntax errors in ${path.basename(f)} (${content.length} bytes)`);
  }
}

if (!hasErrors) {
  console.log('🎉 100% of files passed AST & Syntax validation with 0 errors!');
} else {
  process.exit(1);
}
