const fs = require('fs'), path = require('path');
function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'wikiStatic') out = out.concat(walk(p)); }
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}
const FENCE = String.fromCharCode(96).repeat(3);
const mods = {};
for (const f of walk('src')) {
  const rel = f.replace(/\\/g, '/');
  const m = rel.match(/^src\/([^/]+)/);
  const mod = m ? m[1] : '(root)';
  const src = fs.readFileSync(f, 'utf8');
  const re = new RegExp('^' + FENCE + '([a-zA-Z0-9_+-]+)', 'gm');
  let mk = 0, mj = 0, mo = 0, mc = 0, total = 0;
  let x;
  while ((x = re.exec(src))) {
    total++;
    if (x[1] === 'kotlin') mk++;
    else if (x[1] === 'java') mj++;
    else if (x[1] === 'cpp' || x[1] === 'c') mc++;
    else mo++;
  }
  if (total) {
    if (!mods[mod]) mods[mod] = { files: 0, kotlin: 0, java: 0, c: 0, other: 0, total: 0 };
    mods[mod].files++;
    mods[mod].kotlin += mk; mods[mod].java += mj; mods[mod].c += mc;
    mods[mod].other += mo; mods[mod].total += total;
  }
}
for (const [k, v] of Object.entries(mods).sort((a, b) => (b[1].kotlin + b[1].java) - (a[1].kotlin + a[1].java))) {
  console.log(k.padEnd(12), 'files=' + String(v.files).padStart(3), 'kotlin=' + String(v.kotlin).padStart(4), 'java=' + String(v.java).padStart(4), 'c/cpp=' + String(v.c).padStart(3), 'other=' + String(v.other).padStart(4), 'total=' + v.total);
}
