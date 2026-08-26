const fs = require('fs'), path = require('path');
const F = String.fromCharCode(96).repeat(3);
function walk(d) {
  let o = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) o = o.concat(walk(p));
    else if (p.endsWith('.md')) o.push(p);
  }
  return o;
}
let indented = 0, detailNest = 0, total = 0, inOtherContainer = 0;
for (const f of walk('src')) {
  if (f.includes('wikiStatic')) continue;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)```([a-zA-Z0-9_+-]+)/);
    if (m) {
      total++;
      if (m[1].length > 0) {
        indented++;
        console.log('INDENTED:', f.replace(/\\/g, '/'), 'line', i + 1, 'lang=' + m[2]);
        continue;
      }
      // 向上看 8 行是否在其他容器内
      let container = null;
      for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
        const cm = lines[j].match(/^\s*(:{3,})\s*([a-zA-Z0-9_-]+)/);
        if (cm && cm[2] !== 'details') { container = cm[2]; break; }
        if (/^\s*:{3,}\s*\S/.test(lines[j])) break;
      }
      if (container) {
        inOtherContainer++;
        console.log('CONTAINER ' + String(container).padEnd(14), f.replace(/\\/g, '/'), 'line ' + (i + 1), 'lang=' + m[2]);
      }
    }
  }
}
console.log('total fences:', total, 'indented:', indented, 'in-details:', detailNest, 'in-other-container:', inOtherContainer);
