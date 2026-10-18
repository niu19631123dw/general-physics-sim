/* =============================================================================
 * modules/diffraction.js — 单缝衍射
 * I = sinc²(πa·sinθ/λ) 强度分布，横轴 sinθ；黄色虚线标出第一暗纹 sinθ = λ/a，
 * 中央亮纹半角宽 ≈ λ/a（转度）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var O = GP.optics;
  var plt = null;
  var ga, glam;

  function init() {
    var cv = document.getElementById('dif-canvas');
    if (cv) plt = new SR.Plot(cv);
    ga = LAB.bindRange('dif-a', 'dif-a-val', function (v) { return v.toFixed(2) + ' mm'; });
    glam = LAB.bindRange('dif-lambda', 'dif-lambda-val', function (v) { return v.toFixed(0) + ' nm'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var a = ga() * 1e-3, lam = glam() * 1e-9;
    var sin1 = lam / a;                       // 第一暗纹 sinθ = λ/a
    var half = Math.min(1, Math.max(0.05, 3 * sin1));  // 画到第三级暗纹附近

    var pad = 56, top = 42, bot = h - 40;
    function X(s) { return pad + (s / half * 0.5 + 0.5) * (w - 2 * pad); }
    function Y(v) { return bot - v * (bot - top) * 0.94; }

    plt.line(pad, bot, w - pad, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(pad, top, pad, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('sinθ', w - pad - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('相对光强', pad - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    var q = [];
    for (var i = 0; i <= 400; i++) {
      var s = -half + 2 * half * i / 400;
      q.push([X(s), Y(O.singleSlit(a, lam, Math.asin(s)))]);
    }
    plt.path(q, { stroke: '#4cc9f0', width: 2 });

    if (sin1 <= 1) {
      plt.line(X(sin1), top, X(sin1), bot, { stroke: '#f9c74f', width: 1, dash: [4, 3] });
      plt.line(X(-sin1), top, X(-sin1), bot, { stroke: '#f9c74f', width: 1, dash: [4, 3] });
      plt.label('第一暗纹', X(sin1) + 4, top + 14, { fill: '#f9c74f', font: '10.5px ' + SR.FONT });
    }

    plt.label('单缝衍射（a=' + ga().toFixed(2) + ' mm，λ=' + glam() + ' nm）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('dif-min1', 'sinθ = λ/a = ' + (lam / a).toFixed(4));
    SR.setText('dif-width', GP.deg(lam / a).toFixed(2) + '°');
  }

  LAB.modules.diffraction = { init: init, render: render };
})();
