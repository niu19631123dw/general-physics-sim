/* =============================================================================
 * modules/grating.js — 光栅衍射
 * 主极大（sinθ = kλ/d 处竖亮线，k=0,±1,±2…）受单缝衍射包络（sinc²）调制。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var O = GP.optics;
  var plt = null;
  var gd, glam;

  function init() {
    var cv = document.getElementById('gra-canvas');
    if (cv) plt = new SR.Plot(cv);
    gd = LAB.bindRange('gra-d', 'gra-d-val', function (v) { return v.toFixed(1) + ' µm'; });
    glam = LAB.bindRange('gra-lambda', 'gra-lambda-val', function (v) { return v.toFixed(0) + ' nm'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var d = gd() * 1e-6, lam = glam() * 1e-9;
    var a = d / 3;                                  // 缝宽 = 光栅常数的 1/3
    var kmax = Math.max(1, Math.floor(d / lam - 1e-9));

    var pad = 56, top = 42, bot = h - 40;
    function X(s) { return pad + (s + 1) / 2 * (w - 2 * pad); }   // sinθ ∈ [-1,1]
    function Y(v) { return bot - v * (bot - top) * 0.92; }

    plt.line(pad, bot, w - pad, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(pad, top, pad, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('sinθ', w - pad - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('相对光强', pad - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    // 单缝衍射包络
    function env(s) { return O.singleSlit(a, lam, Math.asin(s)); }
    var q = [];
    for (var i = 0; i <= 240; i++) {
      var s = -1 + 2 * i / 240;
      q.push([X(s), Y(env(s))]);
    }
    plt.path(q, { stroke: '#7f8ea8', width: 1.6 });

    // 主极大
    for (var k = -kmax; k <= kmax; k++) {
      var sk = k * lam / d;
      plt.line(X(sk), bot, X(sk), Y(env(sk)), { stroke: '#4cc9f0', width: 3 });
    }

    plt.label('光栅衍射：主极大 × 单缝包络', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('gra-k1', GP.deg(Math.asin(lam / d)).toFixed(2) + '°');
    SR.setText('gra-kmax', kmax);
  }

  LAB.modules.grating = { init: init, render: render };
})();
