/**
 * CEO 1983 Automated Deep System Discovery & Inventory Engine
 * Parses 100% of Backend Controllers, Frontend Routes, Components, and Database Models.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BE_SRC = path.join(ROOT_DIR, 'apps/ceo1983_app_be/src');
const FE_SRC = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/src');
const PRISMA_SCHEMA = path.join(ROOT_DIR, 'packages/db/prisma/schema.prisma');

// 1. DISCOVER DATABASE MODELS
function discoverDatabaseModels() {
  const content = fs.readFileSync(PRISMA_SCHEMA, 'utf-8');
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{([^}]+)\}/g;
  const models = [];
  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const mapMatch = body.match(/@@map\("([^"]+)"\)/);
    const tableName = mapMatch ? mapMatch[1] : modelName.toLowerCase();
    
    // Parse fields
    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'));
    const fields = [];
    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        fields.push({
          name: parts[0],
          type: parts[1],
          isId: line.includes('@id'),
          isUnique: line.includes('@unique'),
          isRelation: line.includes('@relation')
        });
      }
    }
    models.push({
      modelName,
      tableName,
      fieldCount: fields.length,
      fields
    });
  }
  return models;
}

// 2. DISCOVER BACKEND APIS & CONTROLLERS
function discoverBackendAPIs() {
  const apis = [];
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.controller.ts')) {
        parseController(fullPath);
      }
    }
  }

  function parseController(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(ROOT_DIR, filePath);
    
    // Find controller prefix
    const controllerMatch = content.match(/@Controller\s*\(\s*['"`](.*?)['"`]\s*\)/);
    const controllerPrefix = controllerMatch ? controllerMatch[1] : '';

    // Class name
    const classMatch = content.match(/export\s+class\s+([A-Za-z0-9_]+)/);
    const className = classMatch ? classMatch[1] : path.basename(filePath, '.ts');

    // Module name from folder
    const folder = path.basename(path.dirname(filePath));
    const moduleName = folder === 'src' ? 'root' : folder;

    // Class level roles & guards
    const classRolesMatch = content.match(/@Roles\s*\(([^)]+)\)/);
    const classRoles = classRolesMatch ? classRolesMatch[1].replace(/['"\s]/g, '').split(',') : [];
    const hasClassAuth = content.includes('@UseGuards(JwtAuthGuard') || content.includes('@UseGuards(AuthGuard');

    // Method regex
    const methodRegex = /@(Get|Post|Put|Delete|Patch)\s*\(\s*(?:['"`](.*?)['"`])?\s*\)[\s\S]*?(?:@Roles\s*\(([^)]+)\))?[\s\S]*?(?:async\s+)?([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)/g;
    
    let m;
    while ((m = methodRegex.exec(content)) !== null) {
      const httpMethod = m[1].toUpperCase();
      const subPath = m[2] || '';
      const methodRoles = m[3] ? m[3].replace(/['"\s]/g, '').split(',') : classRoles;
      const handlerName = m[4];
      const params = m[5] ? m[5].trim().replace(/\s+/g, ' ') : '';

      // Skip non-handlers
      if (['constructor'].includes(handlerName)) continue;

      let cleanPrefix = controllerPrefix ? (controllerPrefix.startsWith('/') ? controllerPrefix : '/' + controllerPrefix) : '';
      let cleanSub = subPath ? (subPath.startsWith('/') ? subPath : '/' + subPath) : '';
      let fullEndpoint = (cleanPrefix + cleanSub) || '/';
      // Normalize endpoint
      fullEndpoint = fullEndpoint.replace(/\/+/g, '/');

      // Authorization / Auth
      const requiresAuth = hasClassAuth || content.includes(`@UseGuards(JwtAuthGuard`) || methodRoles.length > 0;

      // Extract description from preceding doc comment
      const preSlice = content.slice(Math.max(0, m.index - 300), m.index);
      const commentMatch = preSlice.match(/\/\*\*([\s\S]*?)\*\//);
      let description = '';
      if (commentMatch) {
        description = commentMatch[1].replace(/\s*\*\s*/g, ' ').trim();
      }
      if (!description) {
        description = `${httpMethod} ${fullEndpoint} handler (${handlerName})`;
      }

      apis.push({
        apiId: `API-${String(apis.length + 1).padStart(3, '0')}`,
        httpMethod,
        endpoint: `/api${fullEndpoint}`,
        rawEndpoint: fullEndpoint,
        module: moduleName,
        controller: className,
        handler: handlerName,
        description,
        authRequired: requiresAuth,
        roles: methodRoles,
        params,
        filePath: relPath
      });
    }
  }

  walkDir(BE_SRC);
  return apis;
}

// 3. DISCOVER FRONTEND SCREENS & ROUTES
function discoverFrontendRoutes() {
  const routes = [];
  const routesDir = path.join(FE_SRC, 'routes');

  function walkRoutes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkRoutes(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        parseRouteFile(fullPath);
      }
    }
  }

  function parseRouteFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(routesDir, filePath);
    const fileName = path.basename(filePath);

    // TanStack route pattern
    // e.g. association.renew.pay.tsx -> /association/renew/pay
    let routePath = '/' + relPath.replace(/\.tsx?$|\.ts$/, '').replace(/\\/g, '/');
    routePath = routePath.replace(/\./g, '/').replace(/\/index$/, '') || '/';
    routePath = routePath.replace(/\/+/g, '/');
    if (fileName === '__root.tsx') routePath = '<RootLayout>';

    // Target subsystem
    let subsystem = 'Web Admin';
    if (routePath.startsWith('/association') || routePath.startsWith('/m')) {
      subsystem = 'CEO 1983 PWA';
    } else if (routePath.startsWith('/b/') || routePath.startsWith('/card') || routePath.startsWith('/verify')) {
      subsystem = 'Public Web';
    } else if (routePath.startsWith('/api')) {
      subsystem = 'Nitro Server Function';
    }

    // Interactive elements count
    const buttons = (content.match(/<Button|<button|onClick=/g) || []).length;
    const forms = (content.match(/<form|<Form|onSubmit=/g) || []).length;
    const inputs = (content.match(/<Input|<input|<textarea|<Select/g) || []).length;
    const modals = (content.match(/<Dialog|<Modal|<Drawer|<Sheet/g) || []).length;
    const tables = (content.match(/<Table|<table|<DataTable/g) || []).length;

    // Detect API calls
    const apiCalls = [];
    const apiRegex = /(?:fetchNestApi|fetchNestApiFromServer|fetch|axios|apiClient)\s*(?:\.\w+)?\s*\(\s*['"`](.*?)['"`]/g;
    let am;
    while ((am = apiRegex.exec(content)) !== null) {
      apiCalls.push(am[1]);
    }

    routes.push({
      screenId: `SCR-${String(routes.length + 1).padStart(3, '0')}`,
      routePath,
      subsystem,
      filePath: path.relative(ROOT_DIR, filePath),
      fileName,
      interactiveCounts: { buttons, forms, inputs, modals, tables },
      apiCalls: [...new Set(apiCalls)]
    });
  }

  walkRoutes(routesDir);
  return routes;
}

// 4. DISCOVER FRONTEND COMPONENTS
function discoverComponents() {
  const components = [];
  const compDir = path.join(FE_SRC, 'components');

  function walkComp(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkComp(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const name = path.basename(entry.name, '.tsx');
        const category = path.basename(dir);
        
        const hasInteractive = /onClick|onChange|onSubmit|<button|<input|<select/i.test(content);
        components.push({
          componentId: `CMP-${String(components.length + 1).padStart(3, '0')}`,
          name,
          category,
          path: path.relative(ROOT_DIR, fullPath),
          isInteractive: hasInteractive
        });
      }
    }
  }

  walkComp(compDir);
  return components;
}

// 5. DISCOVER CODE SMELLS, TODOS, MOCKS, INCOMPLETE
function discoverCodeSmells() {
  const smells = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (['node_modules', 'dist', '.output', '.git'].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        scan(full);
      } else if (/\.(ts|tsx|js|json)$/.test(e.name)) {
        const lines = fs.readFileSync(full, 'utf-8').split('\n');
        lines.forEach((line, idx) => {
          if (/\b(TODO|FIXME|XXX|HACK)\b/i.test(line)) {
            smells.push({
              file: path.relative(ROOT_DIR, full),
              line: idx + 1,
              type: 'TODO/FIXME',
              text: line.trim()
            });
          }
        });
      }
    }
  }
  scan(BE_SRC);
  scan(FE_SRC);
  return smells;
}

// RUN ALL
console.log('Starting Deep Discovery...');
const models = discoverDatabaseModels();
const apis = discoverBackendAPIs();
const routes = discoverFrontendRoutes();
const components = discoverComponents();
const smells = discoverCodeSmells();

console.log(`Discovered:`);
console.log(`- Database Models: ${models.length}`);
console.log(`- Backend APIs: ${apis.length}`);
console.log(`- Frontend Screens/Routes: ${routes.length}`);
console.log(`- Frontend Components: ${components.length}`);
console.log(`- Code Comments/Smells: ${smells.length}`);

const discoveryData = {
  summary: {
    timestamp: new Date().toISOString(),
    databaseModelsCount: models.length,
    backendApisCount: apis.length,
    frontendScreensCount: routes.length,
    frontendComponentsCount: components.length,
    codeSmellsCount: smells.length
  },
  models,
  apis,
  routes,
  components,
  smells
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'CEO1983_QA_AUDIT/00_PROJECT_DISCOVERY/discovery_summary.json'),
  JSON.stringify(discoveryData, null, 2)
);

console.log('Discovery completed and saved to discovery_summary.json');

