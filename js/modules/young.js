/* =============================================================================
 * modules/young.js — 杨氏双缝干涉
 * 上：屏幕上的明暗条纹带（按 I = cos²(πd·sinθ/λ) 计算亮度）。
 * 下：光强 I(y) 曲线。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var O = GP.optics;
  var plt = null;
  var gd, glam;

  function init() {
    var cv = document.getElementById('you-canvas');
    if (cv) plt = new SR.Plot(cv);
    gd = LAB.bindRange('you-d', 'you-d-val', function (v) { return v.toFixed(2) + ' mm'; });
    glam = LAB.bindRange('you-lambda', 'you-lambda-val', function (v) { return v.toFixed(0) + ' nm'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var d = gd() * 1e-3, lam = glam() * 1e-9, L = 1.0;
    var dy = O.fringe(lam, L, d);   // 条纹间距 m

    function I(y) { return O.doubleSlit(d, lam, Math.atan(y / L)); }

    var pad = 56, top = 40, bot = h - 44;
    var stripTop = top + 44, stripH = 62;
    var curveTop = stripTop + stripH + 46, curveBot = bot;
    var yMax = 5 * dy;

    /* 屏幕干涉条纹带 */
    for (var j = 0; j < 400; j++) {
      var y = -yMax + 2 * yMax * j / 400;
      var inten = I(y);
      var v = Math.round(25 + 230 * inten);
      var x = pad + j / 400 * (w - 2 * pad);
      plt.rect(x, stripTop, (w - 2 * pad) / 400 + 1, stripH,
        { fill: 'rgb(' + v + ',' + Math.round(v * 0.86) + ',' + Math.round(v * 0.55) + ')' });
    }
    plt.rect(pad, stripTop, w - 2 * pad, stripH, { stroke: '#2c3a52', width: 1 });
    plt.label('屏幕干涉条纹', pad, stripTop - 10, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    /* 强度曲线 I(y) */
    function X(yy) { return pad + (yy / yMax * 0.5 + 0.5) * (w - 2 * pad); }
    function Y(v) { return curveBot - v * (curveBot - curveTop); }
    plt.line(pad, curveBot, w - pad, curveBot, { stroke: '#45506b', width: 1.2 });
    plt.line(pad, curveTop, pad, curveBot, { stroke: '#45506b', width: 1.2 });
    var q = [];
    for (var i = 0; i <= 400; i++) {
      var yy = -yMax + 2 * yMax * i / 400;
      q.push([X(yy), Y(I(yy))]);
    }
    plt.path(q, { stroke: '#4cc9f0', width: 2 });
    plt.label('光强 I(y)', pad - 8, curveTop + 2, { align: 'right', fill: '#7f8ea8', font: '10px ' + SR.FONT });

    plt.label('杨氏双缝：λ=' + glam() + ' nm，d=' + gd().toFixed(2) + ' mm', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('you-spacing', (dy * 1e3).toFixed(3) + ' mm');
    SR.setText('you-min', (dy / 2 * 1e3).toFixed(3) + ' mm');
  }

  LAB.modules.young = { init: init, render: render };
})();
