/* =============================================================================
 * modules/film.js — 薄膜干涉
 * 上：薄膜（上、下两个反射面）与两束反射光的光程差 2nd 示意。
 * 下：按当前 λ 与膜厚 d 显示反射光颜色（2nd 接近 kλ 相长=亮，接近 (k+½)λ 相消=暗）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var plt = null;
  var gd, glam;

  function init() {
    var cv = document.getElementById('fil-canvas');
    if (cv) plt = new SR.Plot(cv);
    gd = LAB.bindRange('fil-d', 'fil-d-val', function (v) { return v.toFixed(0) + ' nm'; });
    glam = LAB.bindRange('fil-lambda', 'fil-lambda-val', function (v) { return v.toFixed(0) + ' nm'; });
  }

  function colorOf(nm) {
    if (nm < 450) return '#5b7cff';
    if (nm < 495) return '#4cc9f0';
    if (nm < 570) return '#34d399';
    if (nm < 590) return '#f9c74f';
    if (nm < 620) return '#fb923c';
    if (nm < 750) return '#f87171';
    return '#f472b6';
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var d = gd() * 1e-9, lam = glam() * 1e-9, n = 1.33;
    var delta = 2 * n * d;            // 光程差 2nd（m）
    var deltaNm = delta * 1e9;

    var q = delta / lam;              // 2nd/λ
    var frac = q - Math.round(q);
    var bright = Math.abs(frac) < 0.25;
    var state = bright ? '相长（亮）' : '相消（暗）';
    var lineColor = bright ? colorOf(glam()) : '#333a4d';

    var pad = 56, top = 40, bot = h - 40;
    var yTop = top + 34, yBot = top + 100;
    var xL = pad + 16, xR = w - pad - 16;
    var srcX = xL + 70;

    /* 薄膜（上下两表面） */
    plt.line(xL, yTop, xR, yTop, { stroke: '#45506b', width: 2 });
    plt.line(xL, yBot, xR, yBot, { stroke: '#45506b', width: 2 });
    plt.label('薄膜（n = 1.33）', xL + 6, (yTop + yBot) / 2 + 15, { fill: '#7f8ea8', font: '11px ' + SR.FONT });
    plt.label('d = ' + gd().toFixed(0) + ' nm', xR - 6, (yTop + yBot) / 2 + 15, { align: 'right', fill: '#7f8ea8', font: '11px ' + SR.FONT });

    /* 入射光 */
    plt.line(srcX, yTop - 58, srcX, yTop, { stroke: '#4cc9f0', width: 2 });
    /* 上表面反射 */
    plt.line(srcX, yTop, srcX - 72, yTop - 58, { stroke: '#4cc9f0', width: 1.6 });
    /* 透射到下表面再反射 */
    plt.line(srcX, yTop, srcX, yBot, { stroke: '#c084fc', width: 1.4 });
    plt.line(srcX, yBot, srcX - 72, yBot - 58, { stroke: '#c084fc', width: 1.6 });
    plt.label('两束反射光', srcX - 80, yTop - 76, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    /* 反射光颜色色块 */
    var swTop = yBot + 44, swH = 48, swW = (w - 2 * pad - 24) * 0.5;
    plt.rect(pad + 16, swTop, swW, swH, { fill: lineColor });
    plt.rect(pad + 16, swTop, swW, swH, { stroke: '#2c3a52', width: 1 });
    plt.label('反射光颜色（' + state + '）', pad + 16, swTop + swH + 16, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    plt.label('薄膜干涉：λ=' + glam() + ' nm，n=1.33', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('fil-delta', deltaNm.toFixed(0) + ' nm');
    SR.setText('fil-state', state);
  }

  LAB.modules.film = { init: init, render: render };
})();
