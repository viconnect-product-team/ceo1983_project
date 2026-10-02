const fs = require('fs');
const path = require('path');

const targetService = path.resolve('../vione_project/apps/vione_app_be/src/ai/ai.service.ts');
let content = fs.readFileSync(targetService, 'utf8');
content = content.replace("eventsCount[0]?.events", "eventsCount[0]?.count");
fs.writeFileSync(targetService, content, 'utf8');
console.log('Fixed line 160 in ai.service.ts');
