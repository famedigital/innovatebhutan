const fs = require('fs');
let content = fs.readFileSync('scripts/import-amc-final.ts', 'utf8');
content = content.replace(/\${ralcodelabCode}/g, '${ralcodelabCode}');
fs.writeFileSync('scripts/import-amc-final.ts', content);
console.log('Fixed!');
