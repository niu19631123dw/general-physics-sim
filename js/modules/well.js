/* =============================================================================
 * modules/well.js — 一维无限深势阱
 * 上：势阱（两侧 ∞ 势垒）+ 能级 E₁..E₆ 横线（当前 n 高亮）。
 * 下：阱内波函数 ψ_n（青）与概率密度 |ψ|²（紫），粉点标出 n−1 个节点。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var e = GP.const.e, me = GP.const.me;
  var plt = null;
  var gn, ga;

  function init() {
    var cv = document.getElementById('wel-canvas');
    if (cv) plt = new SR.Plot(cv);
    gn = LAB.bindRange('wel-n', 'wel-n-val', function (v) { return v.toFixed(0); });
    ga = LAB.bindRange('wel-a', 'wel-a-val', function (v) { return v.toFixed(1) + ' nm'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var n = Math.max(1, Math.round(gn()));
    var a = ga() * 1e-9;   // 米

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var midY = top + (bot - top) * 0.42;

    /* ---------- 上：势阱 + 能级 ---------- */
    var Emax = M.wellLevel(6, a, me) * 1.2;
    function Ey(E) { return midY - E / Emax * (midY - top); }

    plt.line(x0, midY, x0, top, { stroke: '#45506b', width: 3 });
    plt.line(x1, midY, x1, top, { stroke: '#45506b', width: 3 });
    plt.label('∞', x0 - 4, top + 4, { align: 'center', fill: '#7f8ea8', font: '11px ' + SR.FONT });
    plt.label('∞', x1 - 4, top + 4, { align: 'center', fill: '#7f8ea8', font: '11px ' + SR.FONT });
    plt.label('V=∞', x0 - 4, top + 18, { align: 'center', fill: '#5c6b85', font: '9.5px ' + SR.FONT });

    for (var k = 1; k <= 6; k++) {
      var E = M.wellLevel(k, a, me);
      var y = Ey(E);
      var hl = (k === n);
      plt.line(x0, y, x1, y, { stroke: hl ? '#f9c74f' : '#3a4763', width: hl ? 2 : 1, dash: hl ? [] : [4, 4] });
      plt.label('E' + k, x0 - 22, y, { align: 'right', fill: hl ? '#f9c74f' : '#7f8ea8', font: '10px ' + SR.FONT });
    }
    plt.label('势阱与能级', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    /* ---------- 下：波函数与概率密度 ---------- */
    var ypsi0 = midY + 38;                 // ψ = 0 基线
    var psiA = (bot - ypsi0) * 0.5;
    var psiMax = Math.sqrt(2 / a);
    var rhoMax = 2 / a;
    function Xw(x) { return x0 + x / a * (x1 - x0); }
    function Ypsi(psi) { return ypsi0 - psi / psiMax * psiA; }
    function Yrho(rho) { return ypsi0 - rho / rhoMax * psiA; }

    plt.line(x0, ypsi0, x1, ypsi0, { stroke: '#45506b', width: 1.2 });
    plt.label('0', x0 - 8, ypsi0 + 2, { align: 'right', fill: '#7f8ea8', font: '10px ' + SR.FONT });
    plt.label('a', x1 + 4, ypsi0 + 2, { fill: '#7f8ea8', font: '10px ' + SR.FONT });

    var p1 = [], p2 = [];
    for (var i = 0; i <= 300; i++) {
      var x = a * i / 300;
      var psi = M.wellPsi(n, a, x);
      p1.push([Xw(x), Ypsi(psi)]);
      p2.push([Xw(x), Yrho(psi * psi)]);
    }
    plt.path(p1, { stroke: '#4cc9f0', width: 2 });
    plt.path(p2, { stroke: '#c084fc', width: 1.6 });

    // n−1 个节点
    for (k = 1; k <= n - 1; k++) {
      var xn = k * a / n;
      plt.dot(Xw(xn), ypsi0, 3.5, { fill: '#f472b6' });
    }
    plt.label('ψ_n（青）与 |ψ|²（紫）', x0 + 6, ypsi0 - 12, { fill: '#dbe4f5', font: '11.5px ' + SR.FONT });

    SR.setText('wel-E', (M.wellLevel(n, a, me) / e).toFixed(3) + ' eV');
    SR.setText('wel-lambda', (2 * a / n * 1e9).toFixed(2) + ' nm');
  }

  LAB.modules.well = { init: init, render: render };
})();
