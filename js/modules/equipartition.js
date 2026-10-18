/* =============================================================================
 * modules/equipartition.js — 能量均分定理
 * 每个自由度平均分摊 (1/2)kT 能量：画 f 个等高的能量方块（每个 = ½kT），
 * 总内能 U = (f/2)nRT；由自由度求 C_V = (f/2)R、C_p = C_V+R、γ = (f+2)/f。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var T = GP.thermo;
  var R = GP.const.R;
  var kB = GP.const.kB;
  var e = GP.const.e;
  var plt = null;
  var gf;

  function init() {
    var cv = document.getElementById('eq-canvas');
    if (cv) plt = new SR.Plot(cv);
    gf = LAB.bindRange('eq-f', 'eq-f-val', function (v) { return v.toFixed(0); });
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var f = Math.max(1, Math.round(gf()));
    var Cv = T.cv(f), Cp = Cv + R, gamma = T.gammaFromDOF(f);
    var U = T.equipU(f, 1, 300);       // n = 1 mol, T = 300 K

    var pad = 56, top = 66, bot = h - 40, x0 = pad, x1 = w - pad;
    var bw = (x1 - x0) / f;
    var hMax = (bot - top) * 0.82;
    var colors = ['#4cc9f0', '#c084fc', '#f9c74f', '#34d399', '#f472b6', '#fb923c', '#7b8cff'];

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });

    for (var i = 0; i < f; i++) {
      var bx = x0 + i * bw + bw * 0.12;
      var bwd = bw * 0.76;
      plt.rect(bx, bot - hMax, bwd, hMax, { fill: colors[i % colors.length], alpha: 0.85 });
      plt.label('½kT', bx + bwd / 2, bot - hMax - 8, { align: 'center', fill: colors[i % colors.length], font: '10px ' + SR.FONT });
      plt.label((i + 1) + '', bx + bwd / 2, bot + 8, { align: 'center', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    }

    var perDOF = 0.5 * kB * 300 / e * 1000;   // 每个自由度能量 (meV)
    plt.label('能量均分：每个自由度 = ½kT = ' + perDOF.toFixed(1) + ' meV（300 K）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
    plt.label('f = ' + f + ' 个自由度，U = (f/2)kT', pad, 40, { fill: '#9aa8c4', font: '11px ' + SR.FONT });

    SR.setText('eq-cv', Cv.toFixed(2) + ' J/(mol·K)');
    SR.setText('eq-cp', Cp.toFixed(2) + ' J/(mol·K)');
    SR.setText('eq-gamma', gamma.toFixed(3));
    SR.setText('eq-U', U.toFixed(1) + ' J');
  }

  LAB.modules.equipartition = { init: init, render: render };
})();
