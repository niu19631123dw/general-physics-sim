/* =============================================================================
 * modules/lorentz.js — 洛伦兹力
 * 带电粒子在匀强磁场中做圆周运动（动画）：粒子沿圆周运动，标出速度与磁场方向。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var plt = null;
  var gv, gB;

  function init() {
    var cv = document.getElementById('lor-canvas');
    if (cv) plt = new SR.Plot(cv);
    gv = LAB.bindRange('lor-v', 'lor-v-val', function (v) { return v.toFixed(1); });
    gB = LAB.bindRange('lor-B', 'lor-B-val', function (v) { return v.toFixed(1) + ' T'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var v = gv(), B = gB(), m = 1, q = 1;
    var r = E.cyclotronRadius(m, v, q, B);
    var wc = E.cyclotronOmega(q, B, m);
    var T = 2 * Math.PI / wc;

    var pad = 56, top = 42, bot = h - 36, cx = w / 2, cy = (top + bot) / 2;
    var avail = Math.min(w / 2, (bot - top) / 2) - 26;
    var pixelR = Math.min(avail, r / 5 * avail);   // r=5 时铺满

    plt.ring(cx, cy, pixelR, { stroke: '#45506b', width: 1.6 });
    plt.dot(cx, cy, 3, { fill: '#7f8ea8' });

    /* 磁场方向（垂直纸面向里 ×，散布） */
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        var bx = pad + 10 + i * (w - 2 * pad - 20) / 4;
        var by = top + 12 + j * (bot - top - 24) / 4;
        if (Math.hypot(bx - cx, by - cy) > pixelR + 16) {
          plt.label('×', bx, by, { align: 'center', fill: '#f9c74f', font: '11px ' + SR.FONT });
        }
      }
    }

    /* 运动粒子（动画） */
    var th = wc * (time || 0);
    var px = cx + pixelR * Math.cos(th);
    var py = cy + pixelR * Math.sin(th);
    plt.dot(px, py, 7, { fill: '#4cc9f0' });
    var vdx = -Math.sin(th), vdy = Math.cos(th);
    plt.arrow(px, py, px + vdx * 30, py + vdy * 30, { stroke: '#34d399', width: 2 });
    plt.label('v', px + vdx * 38, py + vdy * 38 - 6, { fill: '#34d399', font: '11px ' + SR.FONT });

    plt.label('带电粒子圆周运动（B ⊥ v）', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
    plt.label('q=1, m=1', pad, bot + 20, { fill: '#5c6b85', font: '10.5px ' + SR.FONT });

    SR.setText('lor-r', r.toFixed(2) + ' m');
    SR.setText('lor-w', wc.toFixed(2) + ' rad/s');
    SR.setText('lor-T', T.toFixed(2) + ' s');
  }

  LAB.modules.lorentz = { init: init, render: render };
})();
