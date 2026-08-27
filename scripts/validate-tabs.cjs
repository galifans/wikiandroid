// 验证：所有 java/kotlin 围栏都在 code-tabs 内；code-tabs 配对完整
const fs = require('fs'), path = require('path');
const F = String.fromCharCode(96).repeat(3);
// 豁免：Kotlin DSL 构建脚本（build.gradle.kts 配置，非程序示例代码，无需 Java/Kotlin 切换）
// 格式: { '相对路径': [行号, ...] } 或 { '相对路径': null } 表示整文件豁免
const EXEMPT = {
  'src/engineering/gradle/custom-gradle-plugin.md': [119, 194],
  'src/engineering/testing/test-pyramid.md': [105],
  'src/engineering/testing/unit-testing.md': [45],
};
function walk(d) {
  let o = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'wikiStatic') o = o.concat(walk(p)); }
    else if (p.endsWith('.md')) o.push(p);
  }
  return o;
}
let issues = 0;
for (const f of walk('src')) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  let inTabs = false;
  let tabDepth = 0; // 嵌套 code-tabs 计数
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i];
    // 追踪 :::
    if (/^\s*:::\s*code-tabs\s*$/.test(t)) { inTabs = true; tabDepth++; continue; }
    if (inTabs && /^\s*:::\s*$/.test(t)) { tabDepth--; if (tabDepth <= 0) { inTabs = false; tabDepth = 0; } continue; }
    if (inTabs) {
      // 围栏检查：java/kotlin 围栏必须在 code-tabs 内且 lang 合法
      const fm = t.match(/^```([a-zA-Z0-9_+-]+)/);
      if (fm && (fm[1] === 'java' || fm[1] === 'kotlin')) {
        // 需要检查前一非空行是否为 @tab
        let j = i - 1;
        while (j >= 0 && lines[j].trim() === '') j--;
        if (!/^\s*@tab/.test(lines[j] || '')) {
          console.log('BAD: java/kotlin fence without @tab before:', f.replace(/\\/g, '/'), 'line', i + 1);
          issues++;
        }
      }
      // @tab 检查
      if (/^\s*@tab/.test(t)) {
        if (!/^\s*@tab(?::active)?\s+[^\s]+/.test(t)) {
          console.log('BAD @tab format:', f.replace(/\\/g, '/'), 'line', i + 1, JSON.stringify(t));
          issues++;
        }
      }
    } else {
      const fm = t.match(/^```([a-zA-Z0-9_+-]+)/);
      if (fm && (fm[1] === 'java' || fm[1] === 'kotlin')) {
        const rel = f.replace(/\\/g, '/');
        const exemptLines = EXEMPT[rel];
        if (!exemptLines || !exemptLines.includes(i + 1)) {
          console.log('ORPHAN ' + fm[1] + ' fence outside code-tabs:', rel, 'line', i + 1);
          issues++;
        }
      }
      if (/^\s*@tab/.test(t)) {
        console.log('ORPHAN @tab outside code-tabs:', f.replace(/\\/g, '/'), 'line', i + 1);
        issues++;
      }
    }
  }
  if (tabDepth !== 0) {
    console.log('UNBALANCED code-tabs:', f.replace(/\\/g, '/'), 'depth=' + tabDepth);
    issues++;
  }
}
console.log(issues === 0 ? 'ALL OK' : issues + ' ISSUES');
