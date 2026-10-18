/* =============================================================================
 * modules/maxwell.js — 麦克斯韦速率分布
 * f(v) 曲线，并在曲线上用竖线 + 点标出三个特征速率：v_p < v̄ < v_rms。
 * 气体种类决定分子质量 m = M/NA（h2=0.002 / n2=0.028 / o2=0.032 kg/mol）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var T = GP.thermo;
  var plt = null;
  var gT;
  var NA = 6.022e23;

  function init() {
    var cv = document.getElementById('max-canvas');
    if (cv) plt = new SR.Plot(cv);
    gT = LAB.bindRange('max-T', 'max-T-val', function (v) { return v.toFixed(0) + ' K'; });
  }

  function molarMass() {
    var el = document.getElementById('max-gas');
    var v = el ? el.value : 'n2';
    return v === 'h2' ? 0.002 : (v === 'o2' ? 0.032 : 0.028);
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var Temp = gT(), m = molarMass() / NA;
    var vp = T.vp(m, Temp), vavg = T.vavg(m, Temp), vrms = T.vrms(m, Temp);

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var vmax = 3 * vrms;
    var fmax = T.maxwellF(vp, m, Temp) * 1.15;
    function X(v) { return x0 + v / vmax * (x1 - x0); }
    function Y(f) { return bot - f / fmax * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('速率 v / m·s⁻¹', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('f(v)', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    var pts = [];
    for (var i = 0; i <= 300; i++) {
      var v = vmax * i / 300;
      pts.push([X(v), Y(T.maxwellF(v, m, Temp))]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });

    function mark(v, color, label) {
      var fv = T.maxwellF(v, m, Temp);
      plt.line(X(v), bot, X(v), Y(fv), { stroke: color, width: 1.2, dash: [4, 3] });
      plt.dot(X(v), Y(fv), 5, { fill: color });
      plt.label(label, X(v) + 5, bot - 12, { fill: color, font: '10.5px ' + SR.FONT });
    }
    mark(vp, '#f9c74f', 'v_p');
    mark(vavg, '#34d399', 'v̄');
    mark(vrms, '#f472b6', 'v_rms');

    plt.label('麦克斯韦速率分布（v_p < v̄ < v_rms）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('max-vp', vp.toFixed(0) + ' m/s');
    SR.setText('max-vavg', vavg.toFixed(0) + ' m/s');
    SR.setText('max-vrms', vrms.toFixed(0) + ' m/s');
  }

  LAB.modules.maxwell = { init: init, render: render };
})();
