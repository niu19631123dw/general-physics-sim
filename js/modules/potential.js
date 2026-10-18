/* =============================================================================
 * modules/potential.js — 电势与电场梯度
 * 同屏画 V(r)=kq/r（青）与 E(r)=kq/r²（紫）两条曲线，E 是 V 的斜率（负梯度）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var plt = null;
  var gq;

  function init() {
    var cv = document.getElementById('pot-canvas');
    if (cv) plt = new SR.Plot(cv);
    gq = LAB.bindRange('pot-q', 'pot-q-val', function (v) { return v.toFixed(1) + ' nC'; });
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var q = gq() * 1e-9;
    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var rmin = 0.5, rmax = 5;
    var Emax = E.pointE(q, rmin);   // 最大场强（r=0.5）
    function X(r) { return x0 + (r - rmin) / (rmax - rmin) * (x1 - x0); }
    function Y(val) { return bot - val / Emax * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    for (var r = 1; r <= 5; r++) {
      plt.line(X(r), bot, X(r), bot + 5, { stroke: '#45506b' });
      plt.label(r + '', X(r), bot + 8, { align: 'center', fill: '#7f8ea8', font: '10px ' + SR.FONT });
    }
    plt.label('r / m', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    var vp = [], ep = [];
    for (var i = 0; i <= 200; i++) {
      var rr = rmin + (rmax - rmin) * i / 200;
      vp.push([X(rr), Y(E.pointV(q, rr))]);
      ep.push([X(rr), Y(E.pointE(q, rr))]);
    }
    plt.path(vp, { stroke: '#4cc9f0', width: 2 });
    plt.path(ep, { stroke: '#c084fc', width: 2 });

    plt.line(X(1), top, X(1), bot, { stroke: '#f9c74f', width: 1, dash: [4, 4] });
    plt.dot(X(1), Y(E.pointV(q, 1)), 4, { fill: '#4cc9f0' });
    plt.dot(X(1), Y(E.pointE(q, 1)), 4, { fill: '#c084fc' });

    plt.label('V(r)（青）与 E(r)（紫）', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
    plt.label('E = −dV/dr（E 衰减更快）', x0 + 8, top + 14, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    SR.setText('pot-E', E.pointE(q, 1).toFixed(2) + ' N/C');
    SR.setText('pot-V', E.pointV(q, 1).toFixed(2) + ' V');
  }

  LAB.modules.potential = { init: init, render: render };
})();
