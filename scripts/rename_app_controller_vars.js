const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/ceo1983_app_be/src/app.controller.ts');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  `    @Query('type') queryType?: string,
    @Query('id') queryId?: string,
    @Param('type') paramType?: string,
    @Param('id') paramId?: string,`,
  `    @Query('type') rawQueryType?: string,
    @Query('id') rawQueryId?: string,
    @Param('type') rawParamType?: string,
    @Param('id') rawParamId?: string,`
);

c = c.replace(
  `    const type = (paramType || queryType || '').toLowerCase();
    const id = paramId || queryId || '';`,
  `    const targetType = (rawParamType || rawQueryType || '').toLowerCase();
    const targetId = rawParamId || rawQueryId || '';`
);

c = c.replace(/if \(type === 'opportunity' && id\)/g, "if (targetType === 'opportunity' && targetId)");
c = c.replace(/else if \(type === 'event' && id\)/g, "else if (targetType === 'event' && targetId)");
c = c.replace(/else if \(\(type === 'post' \|\| type === 'feed'\) && id\)/g, "else if ((targetType === 'post' || targetType === 'feed') && targetId)");
c = c.replace(/else if \(type === 'training' && id\)/g, "else if (targetType === 'training' && targetId)");
c = c.replace(/encodeURIComponent\(id\)/g, 'encodeURIComponent(targetId)');
c = c.replace(/id,\n        \)/g, 'targetId,\n        )');

fs.writeFileSync(file, c, 'utf8');
console.log('Successfully renamed variables in app.controller.ts!');

