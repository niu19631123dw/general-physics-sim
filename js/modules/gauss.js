/* =============================================================================
 * modules/gauss.js — 高斯定理
 * 左：E(r) 曲线（点/球 ∝1/r²，线 ∝1/r，面 =常数）。
 * 右：对应的高斯面示意。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var ke = GP.const.ke;
  var plt = null;

  function init() {
    var cv = document.getElementById('gau-canvas');
    if (cv) plt = new SR.Plot(cv);
  }

  function mode() { var el = document.getElementById('gau-mode'); return el ? el.value : 'point'; }

  function EofR(m, r) {
    var q = 1e-9, R = 1;
    if (m === 'point') return E.pointE(q, r);
    if (m === 'line') return E.lineE(1e-9, r);      // λ = 1 nC/m
    if (m === 'plane') return E.plateE(1e-9);       // 常数
    if (m === 'sphere') return r < R ? ke * q * r / (R * R * R) : E.pointE(q, r);
    return 0;
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var m = mode();
    var pad = 56, mid = w * 0.5, top = 42, bot = h - 40;

    /* ---------- 左：E(r) 曲线 ---------- */
    var rmin = 0.3, rmax = 5;
    var rs = [], es = [], Emax = 0;
    for (var i = 0; i <= 200; i++) {
      var r = rmin + (rmax - rmin) * i / 200;
      var ev = EofR(m, r);
      if (ev > Emax) Emax = ev;
      rs.push(r); es.push(ev);
    }
    Emax *= 1.15;
    var x0 = pad, x1 = mid - 16;
    function X(r) { return x0 + (r - rmin) / (rmax - rmin) * (x1 - x0); }
    function Y(ev) { return bot - ev / Emax * (bot - top); }
    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('r / m', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('E', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    var q = [];
    for (i = 0; i < rs.length; i++) q.push([X(rs[i]), Y(es[i])]);
    plt.path(q, { stroke: '#4cc9f0', width: 2 });
    if (m === 'sphere') plt.line(X(1), top, X(1), bot, { stroke: '#f9c74f', width: 1, dash: [4, 4] });
    plt.label('E(r) 曲线', x0, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    /* ---------- 右：高斯面示意 ---------- */
    var gx = mid + 16, gx1 = w - pad, gcy = (top + bot) / 2;
    var gw = gx1 - gx, gh = bot - top;
    if (m === 'point') {
      plt.dot(gx + gw / 2, gcy, 7, { fill: '#34d399' });
      plt.label('+q', gx + gw / 2, gcy - 18, { align: 'center', fill: '#34d399', font: '11px ' + SR.FONT });
      plt.ring(gx + gw / 2, gcy, Math.min(gw, gh) * 0.34, { stroke: '#c084fc', width: 1.6 });
      plt.label('高斯球面', gx + gw / 2, gcy + Math.min(gw, gh) * 0.34 + 16, { align: 'center', fill: '#c084fc', font: '10.5px ' + SR.FONT });
    } else if (m === 'line') {
      plt.line(gx + gw / 2, gcy - gh * 0.3, gx + gw / 2, gcy + gh * 0.3, { stroke: '#34d399', width: 3 });
      plt.rect(gx + gw / 2 - gw * 0.24, gcy - gh * 0.3, gw * 0.48, gh * 0.6, { stroke: '#c084fc', width: 1.6 });
      plt.label('同轴圆柱高斯面', gx + gw / 2, gcy - gh * 0.3 - 12, { align: 'center', fill: '#c084fc', font: '10.5px ' + SR.FONT });
    } else if (m === 'plane') {
      plt.line(gx + 4, gcy, gx1 - 4, gcy, { stroke: '#34d399', width: 3 });
      plt.rect(gx + gw / 2 - gw * 0.18, gcy - gh * 0.22, gw * 0.36, gh * 0.44, { stroke: '#c084fc', width: 1.6 });
      plt.label('扁圆柱（pillbox）', gx + gw / 2, gcy - gh * 0.22 - 12, { align: 'center', fill: '#c084fc', font: '10.5px ' + SR.FONT });
    } else {
      plt.dot(gx + gw / 2, gcy, Math.min(gw, gh) * 0.18, { fill: '#34d399' });
      plt.ring(gx + gw / 2, gcy, Math.min(gw, gh) * 0.18, { stroke: '#34d399', width: 1 });
      plt.ring(gx + gw / 2, gcy, Math.min(gw, gh) * 0.38, { stroke: '#c084fc', width: 1.6, dash: [4, 3] });
      plt.label('均匀带电球（R=1）', gx + gw / 2, gcy + Math.min(gw, gh) * 0.38 + 16, { align: 'center', fill: '#c084fc', font: '10.5px ' + SR.FONT });
    }

    /* ---------- 读数 ---------- */
    var E1 = EofR(m, 1);
    SR.setText('gau-E', E1.toExponential(2) + ' N/C（r=1 m）');
    SR.setText('gau-flux', E.flux(1e-9).toFixed(1) + ' V·m（Q=1 nC）');
  }

  LAB.modules.gauss = { init: init, render: render };
})();
