const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/(site)');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('export const revalidate')) {
    content = content.replace(/export const revalidate = 300.*?;/g, 'export const dynamic = "force-dynamic";');
    content = content.replace(/export const revalidate = 300/g, 'export const dynamic = "force-dynamic";');
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
