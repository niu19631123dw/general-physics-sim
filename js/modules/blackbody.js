/* =============================================================================
 * modules/blackbody.js — 黑体辐射
 * 青=当前 T 的 M(λ,T)（归一化到峰值 1）；紫虚线=T+1000 K（同样归一化），
 * 峰值蓝移体现维恩位移；黄竖线标出当前 T 的峰值波长 λ_max。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var plt = null;
  var gT;

  function init() {
    var cv = document.getElementById('bb-canvas');
    if (cv) plt = new SR.Plot(cv);
    gT = LAB.bindRange('bb-T', 'bb-T-val', function (v) { return v.toFixed(0) + ' K'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var T = gT(), T2 = T + 1000;
    var lmin = 100e-9, lmax = 4000e-9;

    // 分别求两条曲线的峰值（各自归一化到 1，突出形状与峰值位置）
    var max1 = 0, max2 = 0, i;
    for (i = 0; i <= 400; i++) {
      var l = lmin + (lmax - lmin) * i / 400;
      var m1 = M.planck(l, T);
      var m2 = M.planck(l, T2);
      if (m1 > max1) max1 = m1;
      if (m2 > max2) max2 = m2;
    }
    if (max1 < 1e-300) max1 = 1;
    if (max2 < 1e-300) max2 = 1;

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    function X(l) { return x0 + (l - lmin) / (lmax - lmin) * (x1 - x0); }
    function Y(m, mx) { return bot - m / mx * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('波长 λ / nm', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('M(λ)（归一化）', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    // T+1000 虚线（紫）
    var q2 = [];
    for (i = 0; i <= 400; i++) {
      var l2 = lmin + (lmax - lmin) * i / 400;
      q2.push([X(l2), Y(M.planck(l2, T2), max2)]);
    }
    plt.path(q2, { stroke: '#c084fc', width: 1.8, dash: [5, 4] });

    // 当前 T 实线（青）
    var q1 = [];
    for (i = 0; i <= 400; i++) {
      var l1 = lmin + (lmax - lmin) * i / 400;
      q1.push([X(l1), Y(M.planck(l1, T), max1)]);
    }
    plt.path(q1, { stroke: '#4cc9f0', width: 2.2 });

    // 峰值波长黄竖线
    var lmaxT = M.wien(T);
    if (lmaxT >= lmin && lmaxT <= lmax) {
      plt.line(X(lmaxT), top, X(lmaxT), bot, { stroke: '#f9c74f', width: 1.2, dash: [4, 3] });
      plt.label('λ_max = ' + (lmaxT * 1e9).toFixed(0) + ' nm', X(lmaxT) + 6, top + 12, { fill: '#f9c74f', font: '11px ' + SR.FONT });
    }

    plt.label('黑体辐射 M(λ,T)：青 = ' + T + ' K，紫虚线 = ' + T2 + ' K', pad, 24, { fill: '#dbe4f5', font: '12px ' + SR.FONT });

    SR.setText('bb-lambda', (M.wien(T) * 1e9).toFixed(0) + ' nm');
    SR.setText('bb-M', (M.stefanBoltzmann(T) / 1000).toFixed(1) + ' kW/m²');
  }

  LAB.modules.blackbody = { init: init, render: render };
})();
