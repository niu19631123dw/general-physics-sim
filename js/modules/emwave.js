/* =============================================================================
 * modules/emwave.js — 电磁波
 * 沿 x 传播的 E 场（竖直正弦，青）与 B 场（垂直纸面，紫 + ⊙/⊗ 方向），
 * 两波同相、相互垂直、都垂直于传播方向，用 time 做传播动画。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var c = GP.const.c;
  var plt = null;
  var gf;

  function init() {
    var cv = document.getElementById('em-canvas');
    if (cv) plt = new SR.Plot(cv);
    gf = LAB.bindRange('em-f', 'em-f-val', function (v) { return v.toFixed(1) + ' ×10⁸ Hz'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var f = gf() * 1e8;
    var lam = c / f;
    var E0 = 1;                  // 电场幅值 1 V/m
    var B0 = E.emB(E0);          // B = E/c

    var pad = 56, top = 40, bot = h - 30, x0 = pad, x1 = w - pad, cy = (top + bot) / 2;
    var lamPix = 110;            // 屏幕上波长的像素
    var AE = (bot - top) * 0.34;
    var phase = (time || 0) * 4; // 传播动画相位

    plt.line(x0, cy, x1, cy, { stroke: '#45506b', width: 1.2 });
    plt.arrow(x1 - 26, cy, x1 - 2, cy, { stroke: '#7f8ea8', width: 1.6 });
    plt.label('传播方向 x', x1 - 60, cy - 12, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    /* E 场（竖直正弦，青） */
    var ep = [];
    for (var x = x0; x <= x1; x += 2) {
      var kx = 2 * Math.PI * (x - x0) / lamPix - phase;
      ep.push([x, cy - AE * Math.sin(kx)]);
    }
    plt.path(ep, { stroke: '#4cc9f0', width: 2 });
    plt.label('E', x0 + 6, cy - AE - 10, { fill: '#4cc9f0', font: '12px ' + SR.FONT });

    /* B 场（垂直纸面，紫）：正弦 + ⊙/⊗ 方向 */
    var AB = AE * 0.6;
    var bp = [];
    for (var x = x0; x <= x1; x += 4) {
      var kx = 2 * Math.PI * (x - x0) / lamPix - phase;
      var s = Math.sin(kx);
      bp.push([x, cy - AB * s]);
      if (x % 22 === 0) {
        plt.label(s >= 0 ? '⊙' : '⊗', x, cy - AB * s + (s >= 0 ? -14 : 14), { align: 'center', fill: '#c084fc', font: '12px ' + SR.FONT });
      }
    }
    plt.path(bp, { stroke: '#c084fc', width: 1.6, dash: [5, 3] });
    plt.label('B（⊥纸面）', x0 + 6, cy + AB + 22, { fill: '#c084fc', font: '11px ' + SR.FONT });

    plt.label('电磁波：E ⊥ B ⊥ x，同相传播', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('em-lambda', lam.toFixed(2) + ' m');
    SR.setText('em-E', E0.toFixed(2) + ' V/m');
    SR.setText('em-B', B0.toExponential(2) + ' T');
  }

  LAB.modules.emwave = { init: init, render: render };
})();
