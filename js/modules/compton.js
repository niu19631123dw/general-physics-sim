/* =============================================================================
 * modules/compton.js — 康普顿散射
 * 入射光子（青）打到静止电子（黄点）上，散射光子（紫）以角度 θ 飞出，
 * 电子反冲（绿箭头）。波长偏移 Δλ = (h/mₑc)(1−cosθ)。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var plt = null;
  var gth;

  function init() {
    var cv = document.getElementById('com-canvas');
    if (cv) plt = new SR.Plot(cv);
    gth = LAB.bindRange('com-theta', 'com-theta-val', function (v) { return v.toFixed(0) + '°'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var th = gth() * Math.PI / 180;
    var lam0 = 70.8e-12;              // X 射线 λ₀ = 70.8 pm
    var dlam = M.comptonShift(th);    // Δλ（米）
    var lamP = lam0 + dlam;           // λ′（米）

    var pad = 40, top = 40, bot = h - 40;
    var cx = w / 2, cy = (top + bot) / 2;
    var L = Math.min((w - 2 * pad) / 2, (bot - top) / 2) * 0.88;

    // 入射光子（沿 x 轴射向电子）
    var ex = cx - L;
    plt.arrow(ex, cy, cx - 14, cy, { stroke: '#4cc9f0', width: 2.5 });
    plt.label('入射光子 λ₀ = ' + (lam0 * 1e12).toFixed(1) + ' pm', ex, cy - 14, { fill: '#4cc9f0', font: '11px ' + SR.FONT });

    // 静止电子
    plt.dot(cx, cy, 7, { fill: '#f9c74f' });
    plt.label('e⁻', cx + 12, cy - 12, { fill: '#f9c74f', font: '12px ' + SR.FONT });

    // 散射光子（角度 θ）
    var sx = cx + L * Math.cos(th), sy = cy - L * Math.sin(th);
    plt.arrow(cx + 14, cy, sx, sy, { stroke: '#c084fc', width: 2.5 });
    plt.label('散射光子 λ′ = ' + (lamP * 1e12).toFixed(1) + ' pm', sx, sy - 14, { fill: '#c084fc', font: '11px ' + SR.FONT });

    // 反冲电子（下偏右，示意）
    var rx = cx + L * 0.6, ry = cy + L * 0.45;
    plt.arrow(cx + 10, cy + 4, rx, ry, { stroke: '#34d399', width: 2 });
    plt.label('反冲电子', rx + 8, ry + 4, { fill: '#34d399', font: '11px ' + SR.FONT });

    // 散射角弧
    var arc = [];
    for (var i = 0; i <= 20; i++) {
      var a = th * i / 20;
      arc.push([cx + 40 * Math.cos(a), cy - 40 * Math.sin(a)]);
    }
    plt.path(arc, { stroke: '#f9c74f', width: 1.2 });
    plt.label('θ', cx + 50 * Math.cos(th / 2), cy - 50 * Math.sin(th / 2), { fill: '#f9c74f', font: '12px ' + SR.FONT });

    plt.label('康普顿散射（θ = ' + gth() + '°）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('com-dlambda', (dlam * 1e12).toFixed(3) + ' pm');
    SR.setText('com-lambda', (lamP * 1e12).toFixed(3) + ' pm');
  }

  LAB.modules.compton = { init: init, render: render };
})();
