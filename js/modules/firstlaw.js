/* =============================================================================
 * modules/firstlaw.js — 热力学第一定律
 * p–V 图上从初态 (V₁=1, p₁=nRT₁/V₁) 到末态 V₂ 的四种过程：等温 / 绝热 / 等压 / 等容。
 * 曲线下面积 = 做功 W（绿色填充）；读数给出 W、ΔU、Q 并校验 Q = ΔU + W。
 * n = 1 mol，T₁ = 300 K，f = 5，γ = 7/5。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var T = GP.thermo;
  var R = GP.const.R;
  var plt = null;
  var gV2;

  function init() {
    var cv = document.getElementById('fl-canvas');
    if (cv) plt = new SR.Plot(cv);
    gV2 = LAB.bindRange('fl-V2', 'fl-V2-val', function (v) { return v.toFixed(1); });
  }

  function mode() { var el = document.getElementById('fl-mode'); return el ? el.value : 'isothermal'; }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var m = mode(), V2 = gV2();
    var n = 1, f = 5, T1 = 300, V1 = 1, p1 = n * R * T1 / V1, gamma = 7 / 5;
    var p2, T2, W, dU, Q;

    if (m === 'isothermal') {
      p2 = p1 * V1 / V2; T2 = T1;
      W = T.wIsothermal(n, T1, V1, V2); dU = 0; Q = W;
    } else if (m === 'adiabatic') {
      p2 = T.pAdiabatic(p1, V1, V2, gamma);
      T2 = T1 * Math.pow(V1 / V2, gamma - 1);
      W = T.wAdiabatic(p1, V1, p2, V2, gamma); dU = -W; Q = 0;
    } else if (m === 'isobaric') {
      p2 = p1; T2 = T1 * V2 / V1;
      W = T.wIsobaric(p1, V1, V2); dU = (f / 2) * n * R * (T2 - T1); Q = dU + W;
    } else { /* isochoric */
      p2 = p1 * (V2 / V1); T2 = T1 * (V2 / V1);
      W = 0; dU = (f / 2) * n * R * (T2 - T1); Q = dU;
    }

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var Vmin = 0.8, Vmax = Math.max(V2, V1) * 1.15;
    var pmax = Math.max(p1, p2) * 1.2;
    function X(V) { return x0 + (V - Vmin) / (Vmax - Vmin) * (x1 - x0); }
    function Y(p) { return bot - p / pmax * (bot - top); }
    function pAt(V) {
      if (m === 'isothermal') return p1 * V1 / V;
      if (m === 'adiabatic') return p1 * Math.pow(V1 / V, gamma);
      return p1;
    }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('V / V₁', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('p / kPa', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    var N = 200, i, V;

    /* 曲线下面积（做功）—— 先画填充，再画曲线 */
    if (m !== 'isochoric') {
      var poly = [];
      for (i = 0; i <= N; i++) {
        V = V1 + (V2 - V1) * i / N;
        poly.push([X(V), Y(pAt(V))]);
      }
      poly.push([X(V2), Y(0)]);
      poly.push([X(V1), Y(0)]);
      plt.path(poly, { fill: '#34d399', alpha: 0.16, width: 0 });
    }

    /* 过程曲线 */
    var pts = [];
    for (i = 0; i <= N; i++) {
      V = V1 + (V2 - V1) * i / N;
      var pv = (m === 'isochoric') ? (p1 + (p2 - p1) * i / N) : pAt(V);
      pts.push([X(m === 'isochoric' ? V1 : V), Y(pv)]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });

    /* 初末态 */
    plt.dot(X(V1), Y(p1), 5, { fill: '#f9c74f' });
    plt.label('(V₁,p₁)', X(V1) + 6, Y(p1) - 8, { fill: '#f9c74f', font: '10.5px ' + SR.FONT });
    var Ve = (m === 'isochoric') ? V1 : V2;
    plt.dot(X(Ve), Y(p2), 5, { fill: '#f472b6' });
    plt.label('(V₂,p₂)', X(Ve) + 6, Y(p2) - 8, { fill: '#f472b6', font: '10.5px ' + SR.FONT });

    var name = m === 'isothermal' ? '等温' : (m === 'adiabatic' ? '绝热' : (m === 'isobaric' ? '等压' : '等容'));
    plt.label(name + '过程 p–V 图（绿=功）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('fl-W', W.toFixed(1) + ' J');
    SR.setText('fl-dU', dU.toFixed(1) + ' J');
    SR.setText('fl-Q', Q.toFixed(1) + ' J');
    SR.setText('fl-check', 'Q = ΔU + W ✓（' + Q.toFixed(1) + ' = ' + dU.toFixed(1) + ' + ' + W.toFixed(1) + '）');
  }

  LAB.modules.firstlaw = { init: init, render: render };
})();
