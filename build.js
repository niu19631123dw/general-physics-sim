// build.js — 由模块化 index.html 生成单文件 standalone.html（CSS/JS 全内联）
const fs = require('fs'), path = require('path');
const root = __dirname;
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');

if (!html.includes('css/style.css')) { console.error('index.html 不是模块化版本（缺少 css 链接）'); process.exit(1); }
html = html.replace(/<link rel="stylesheet" href="css\/style\.css">/, '<style>\n' + css + '\n</style>');

let count = 0;
html = html.replace(/<script src="js\/([^"]+)"><\/script>/g, function (m, p) {
  count++;
  const code = fs.readFileSync(path.join(root, 'js', p), 'utf8');
  if (code.indexOf('</scr' + 'ipt>') >= 0) throw new Error('script contains closing tag: ' + p);
  return '<script>\n' + code + '\n</script>';
});

fs.writeFileSync(path.join(root, 'standalone.html'), html);
console.log('standalone.html 已生成：scripts=' + count + '，大小=' + Buffer.byteLength(html) + ' bytes');
