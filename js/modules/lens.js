/* modules/lens.js — 薄透镜成像 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var O = GP.optics;
  var plt = null, gu, gf;

  function init() {
    var cv = document.getElementById('lens-canvas');
    if (cv) plt = new SR.Plot(cv);
    gu = LAB.bindRange('lens-u', 'lens-u-val', function (v) { return v.toFixed(2) + ' m'; });
    gf = LAB.bindRange('lens-f', 'lens-f-val', function (v) { return v.toFixed(2) + ' m'; });
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var u = gu(), f = gf();
    var v = O.lens(f, u), mag = O.mag(f, u);
    var real = isFinite(v) && v > 0;

    var cy = h / 2, cx = w / 2, scale = 140;
    // 主光轴
    plt.line(40, cy, w - 40, cy, { stroke: '#45506b', width: 1, dash: [4, 4] });
    // 透镜（两条弧近似）
    plt.line(cx, cy - 90, cx, cy + 90, { stroke: '#4cc9f0', width: 3 });
    plt.label('透镜', cx, cy - 100, { align: 'center', fill: '#4cc9f0', font: '11px ' + SR.FONT });

    // 物（箭头，位于透镜左侧 u 处）
    var ox = cx - u * scale;
    plt.arrow(ox, cy, ox, cy - 50, { stroke: '#f472b6', width: 2.5 });
    plt.label('物', ox, cy + 18, { align: 'center', fill: '#f472b6', font: '11px ' + SR.FONT });

    // 焦点
    plt.dot(cx + f * scale, cy, 4, { fill: '#f9c74f' });
    plt.dot(cx - f * scale, cy, 4, { fill: '#f9c74f' });

    // 像
    if (isFinite(v)) {
      var ix = cx + v * scale;
      var ih = -mag * 50;
      if (ix > 30 && ix < w - 30) {
        plt.arrow(ix, cy, ix, cy + ih, { stroke: '#34d399', width: 2, dash: [5, 4] });
        plt.label((real ? '实像' : '虚像'), ix, cy + (real ? 26 : -16), { align: 'center', fill: '#34d399', font: '11px ' + SR.FONT });
      }
    }
    plt.label('薄透镜成像 1/f = 1/u + 1/v', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('lens-v', isFinite(v) ? (v * 100).toFixed(1) + ' cm' : '无像');
    SR.setText('lens-mag', isFinite(mag) ? mag.toFixed(2) : '—');
    SR.setText('lens-type', !isFinite(v) ? '不成像' : (real ? '实像（倒立）' : '虚像（正立放大）'));
  }
  LAB.modules.lens = { init: init, render: render };
})();
