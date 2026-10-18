/* 总核对入口 */
var groups = [
  ['力学卷', './verify-gp-mechanics.js'],
  ['热学卷', './verify-gp-thermal.js'],
  ['电磁学卷', './verify-gp-em.js'],
  ['光学卷', './verify-gp-optics.js'],
  ['近代物理卷', './verify-gp-modern.js']
];
var tp = 0, tf = 0;
groups.forEach(function (g) {
  var r = require(g[1]);
  tp += r.pass; tf += r.fail;
  console.log('  ' + g[0] + '  : PASS ' + r.pass + '   FAIL ' + r.fail);
});
console.log('\n  合计     : PASS ' + tp + '   FAIL ' + tf);
if (tf > 0) process.exit(1);
