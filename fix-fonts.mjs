import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  const files = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory() && !['node_modules', '.next', '.git'].includes(f)) {
      files.push(...walk(full));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('./app');
let count = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated = original
    .replaceAll("font-['Syne']", "font-['Montserrat']")
    .replaceAll("font-['DM_Sans']", "font-['Open_Sans']")
    .replaceAll("'Syne', sans-serif", "'Montserrat', sans-serif")
    .replaceAll("'DM Sans', sans-serif", "'Open Sans', sans-serif")
    .replaceAll('fontFamily="DM Sans"', 'fontFamily="Open Sans"')
    .replaceAll('fontFamily="Syne"', 'fontFamily="Montserrat"');

  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    console.log('Updated:', file);
    count++;
  }
}

console.log(`Done. ${count} files updated.`);
