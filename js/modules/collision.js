/* modules/collision.js — 碰撞与动量守恒（保证两球在接触点相遇） */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null;
  var gm1, gm2, gv1, gv2;

  function init() {
    var cv = document.getElementById('col-canvas');
    if (cv) plt = new SR.Plot(cv);
    gm1 = LAB.bindRange('col-m1', 'col-m1-val', function (v) { return v.toFixed(1); });
    gm2 = LAB.bindRange('col-m2', 'col-m2-val', function (v) { return v.toFixed(1); });
    gv1 = LAB.bindRange('col-v1', 'col-v1-val', function (v) { return v.toFixed(1); });
    gv2 = LAB.bindRange('col-v2', 'col-v2-val', function (v) { return v.toFixed(1); });
  }

  function mode() { var el = document.getElementById('col-mode'); return el ? el.value : 'elastic'; }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var m1 = gm1(), m2 = gm2(), v1 = gv1(), v2 = gv2(), md = mode();
    var elastic = md === 'elastic';
    var v1p = elastic ? M.elasticV1(m1, m2, v1, v2) : (m1 * v1 + m2 * v2) / (m1 + m2);
    var v2p = elastic ? M.elasticV2(m1, m2, v1, v2) : v1p;
    var p = M.momentum(m1, v1) + M.momentum(m2, v2);
    var ke = M.kinetic(m1, v1) + M.kinetic(m2, v2);

    var cy = h / 2, r = 22, cx = w / 2;
    var gap = w * 0.44 - 2 * r;                 // 初始边缘间距
    /* 接近时间：速度越大越快（夹在 0.6~2.5 秒内，保证一定碰到） */
    var tC = gap / ((Math.abs(v1) + Math.abs(v2) + 0.4) * 60);
    tC = Math.max(0.6, Math.min(2.5, tC));
    var tAfter = 1.3, period = tC + tAfter;
    var ph = (time || 0) % period;

    /* 接触位置与初始位置（对称靠近） */
    var x1c = cx - r, x2c = cx + r;
    var x1_0 = x1c - gap / 2, x2_0 = x2c + gap / 2;

    var x1, x2;
    if (ph < tC) {
      var pRatio = ph / tC;
      x1 = x1_0 + (x1c - x1_0) * pRatio;
      x2 = x2_0 + (x2c - x2_0) * pRatio;
    } else {
      var dt = ph - tC, scale = 60;
      x1 = x1c + v1p * scale * dt;
      x2 = x2c + v2p * scale * dt;
    }

    /* 地面 */
    plt.line(20, cy + r + 10, w - 20, cy + r + 10, { stroke: '#45506b', width: 1.2 });
    /* 碰撞瞬间提示 */
    if (ph >= tC && ph < tC + 0.2) {
      plt.label('碰撞！', cx, cy - 54, { align: 'center', fill: '#f9c74f', font: '15px ' + SR.FONT });
    }
    /* 两球 */
    plt.dot(x1, cy, r, { fill: '#4cc9f0' });
    plt.dot(x2, cy, r, { fill: '#f472b6' });
    plt.label('m₁', x1, cy + 5, { align: 'center', fill: '#0d1220', font: '11px ' + SR.FONT });
    plt.label('m₂', x2, cy + 5, { align: 'center', fill: '#0d1220', font: '11px ' + SR.FONT });
    /* 速度方向小箭头 */
    plt.arrow(x1, cy - 32, x1 + Math.sign(v1 || 1) * 26, cy - 32, { stroke: '#4cc9f0', width: 1.5 });
    plt.arrow(x2, cy - 32, x2 + Math.sign(v2 || 1) * 26, cy - 32, { stroke: '#f472b6', width: 1.5 });
    plt.label((elastic ? '弹性碰撞' : '完全非弹性碰撞（碰后粘连）') + '：蓝 m₁，粉 m₂', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('col-v1p', v1p.toFixed(2));
    SR.setText('col-v2p', v2p.toFixed(2));
    SR.setText('col-p', p.toFixed(2));
    SR.setText('col-ke', ke.toFixed(2));
  }

  LAB.modules.collision = { init: init, render: render };
})();
