/* =============================================================================
 * modules/carnot.js — 卡诺循环与熵
 * p–V 图（V 用对数轴）上的卡诺循环：两条等温线（青）+ 两条绝热线（紫）围成封闭回路。
 * 效率只取决于两热源温度 η = 1 − T_c/T_h；净功 W = η·Q_h，ΔS = Q_h/T_h。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var T = GP.thermo;
  var R = GP.const.R;
  var plt = null;
  var gTh, gTc;

  function init() {
    var cv = document.getElementById('car-canvas');
    if (cv) plt = new SR.Plot(cv);
    gTh = LAB.bindRange('car-th', 'car-th-val', function (v) { return v.toFixed(0) + ' K'; });
    gTc = LAB.bindRange('car-tc', 'car-tc-val', function (v) { return v.toFixed(0) + ' K'; });
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var Th = gTh(), Tc = gTc();
    if (Tc >= Th) Tc = Th - 1;                    // 保证热机有效（T_c < T_h）
    var eta = T.carnotEta(Tc, Th);
    var gamma = 7 / 5, n = 1;
    var V1 = 1, V2 = 1.8;
    var ratio = Math.pow(Th / Tc, 1 / (gamma - 1));   // (Th/Tc)^2.5
    var V3 = V2 * ratio, V4 = V1 * ratio;
    var p1 = n * R * Th / V1, p2 = n * R * Th / V2, p3 = n * R * Tc / V3, p4 = n * R * Tc / V4;

    var Qh = T.wIsothermal(n, Th, V1, V2);            // 等温膨胀吸热
    var Wnet = Qh * eta;
    var dS = T.entropy(Qh, Th);

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var Vmin = V1 * 0.8, Vmax = V3 * 1.1;
    var pmax = p1 * 1.2;
    function X(V) { return x0 + (Math.log(V) - Math.log(Vmin)) / (Math.log(Vmax) - Math.log(Vmin)) * (x1 - x0); }
    function Y(p) { return bot - p / pmax * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('V（对数轴）', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('p', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    function iso(Va, pa, Vb) {       // 等温段 pV = const
      var q = [];
      for (var i = 0; i <= 80; i++) {
        var V = Va + (Vb - Va) * i / 80;
        q.push([X(V), Y(pa * Va / V)]);
      }
      return q;
    }
    function adi(Va, pa, Vb) {       // 绝热段 pV^γ = const
      var q = [];
      for (var i = 0; i <= 80; i++) {
        var V = Va + (Vb - Va) * i / 80;
        q.push([X(V), Y(pa * Math.pow(Va / V, gamma))]);
      }
      return q;
    }

    plt.path(iso(V1, p1, V2), { stroke: '#4cc9f0', width: 2 });
    plt.path(adi(V2, p2, V3), { stroke: '#c084fc', width: 2 });
    plt.path(iso(V3, p3, V4), { stroke: '#4cc9f0', width: 2 });
    plt.path(adi(V4, p4, V1), { stroke: '#c084fc', width: 2 });

    plt.dot(X(V1), Y(p1), 4, { fill: '#f9c74f' });
    plt.dot(X(V2), Y(p2), 4, { fill: '#f9c74f' });
    plt.dot(X(V3), Y(p3), 4, { fill: '#f9c74f' });
    plt.dot(X(V4), Y(p4), 4, { fill: '#f9c74f' });

    plt.label('卡诺循环（青=等温，紫=绝热）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('car-eta', (eta * 100).toFixed(1) + ' %');
    SR.setText('car-W', Wnet.toFixed(1) + ' J');
    SR.setText('car-dS', dS.toFixed(2) + ' J/K（Q_h/T_h）');
  }

  LAB.modules.carnot = { init: init, render: render };
})();
