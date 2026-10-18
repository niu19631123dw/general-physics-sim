/* =============================================================================
 * modules/debroglie.js — 德布罗意物质波
 * 电子的正弦物质波 ψ，波长 λ = h/mv；速度增大 → 波长变短（屏上波更密）。
 * 黄点为粒子（电子），下方标注粒子与波长。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var me = GP.const.me;
  var plt = null;
  var gv;

  function init() {
    var cv = document.getElementById('db-canvas');
    if (cv) plt = new SR.Plot(cv);
    gv = LAB.bindRange('db-v', 'db-v-val', function (v) { return v.toFixed(1) + ' ×10⁶ m/s'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var v = gv() * 1e6;
    var lam = M.deBroglie(me, v);   // 米
    var p = me * v;

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var cy = (top + bot) / 2;
    var A = (bot - top) / 2 * 0.72;

    plt.line(x0, cy, x1, cy, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });

    // 波长 → 像素波长（参考 v=1×10⁶ 时约 110 px，速度越大波长越短）
    var lamRef = M.deBroglie(me, 1e6);
    var lambdaPx = Math.max(26, lam / lamRef * 110);
    var pts = [];
    for (var i = 0; i <= 400; i++) {
      var xpix = x0 + (x1 - x0) * i / 400;
      pts.push([xpix, cy - A * Math.sin(2 * Math.PI * xpix / lambdaPx)]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });

    // 粒子点（骑在波上）
    var px = (x0 + x1) / 2;
    plt.dot(px, cy, 7, { fill: '#f9c74f' });
    plt.label('电子（粒子）', px, cy - 16, { align: 'center', fill: '#f9c74f', font: '11px ' + SR.FONT });

    plt.label('德布罗意物质波 λ = ' + (lam * 1e9).toFixed(3) + ' nm', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('db-lambda', (lam * 1e9).toFixed(4) + ' nm');
    SR.setText('db-p', p.toExponential(3) + ' kg·m/s');
  }

  LAB.modules.debroglie = { init: init, render: render };
})();
