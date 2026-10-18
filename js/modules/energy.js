/* modules/energy.js — 功与能 / 机械能守恒 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var plt = null, gE;

  function init() {
    var cv = document.getElementById('energy-canvas');
    if (cv) plt = new SR.Plot(cv);
    gE = LAB.bindRange('energy-E', 'energy-E-val', function (v) { return v.toFixed(1) + ' J'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var E = gE(), k = 1;
    var xTurn = Math.sqrt(2 * E / k);
    var pad = 56, x0 = pad, x1 = w - pad, y0 = h - 40, y1 = 40;
    var xmax = Math.sqrt(2 * 6 / k) * 1.1;
    function X(x) { return x0 + (x + xmax) / (2 * xmax) * (x1 - x0); }
    function Y(U) { return y0 - Math.min(U, 6) / 6 * (y0 - y1); }
    function U(x) { return 0.5 * k * x * x; }

    plt.line(x0, Y(0), x1, Y(0), { stroke: '#45506b', width: 1.2 });
    plt.line(X(0), y1, X(0), y0, { stroke: '#3a4763', width: 1, dash: [3, 3] });
    plt.label('x', x1 - 6, Y(0) + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('U', X(0) - 8, y1 + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    // 势能曲线 U(x)=½kx²
    var pts = [];
    for (var i = 0; i <= 200; i++) {
      var x = -xmax + 2 * xmax * i / 200;
      pts.push([X(x), Y(U(x))]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });
    // 总能量线
    plt.line(x0, Y(E), x1, Y(E), { stroke: '#f9c74f', width: 1.5, dash: [6, 4] });
    plt.label('E = KE + U', x1 - 6, Y(E) - 8, { align: 'right', fill: '#f9c74f', font: '11px ' + SR.FONT });

    // 粒子在势能井中往返（能量守恒 → 在转折点之间振荡）
    var period = 2 * Math.PI;
    var xp = xTurn * Math.cos((time || 0) / period * 2 * Math.PI);
    plt.dot(X(xp), Y(U(xp)), 8, { fill: '#f472b6' });
    plt.label('粒子在转折点之间振荡（动能 = E − U）', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('energy-ke', (E - U(xp)).toFixed(2) + ' J');
    SR.setText('energy-x1', (-xTurn).toFixed(3));
    SR.setText('energy-x2', xTurn.toFixed(3));
    SR.setText('energy-check', 'E = ½kx² + ½mv² ✓');
  }
  LAB.modules.energy = { init: init, render: render };
})();
