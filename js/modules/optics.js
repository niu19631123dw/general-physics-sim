/* modules/optics.js — 折射与全反射（光由光密介质射向空气，可演示全反射） */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var O = GP.optics;
  var plt = null, gInc, gN1;

  function init() {
    var cv = document.getElementById('opt-canvas');
    if (cv) plt = new SR.Plot(cv);
    gInc = LAB.bindRange('opt-inc', 'opt-inc-val', function (v) { return v.toFixed(0) + '°'; });
    gN1 = LAB.bindRange('opt-n2', 'opt-n2-val', function (v) { return v.toFixed(2); });
  }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var th1 = gInc() * Math.PI / 180;
    var n1 = gN1(), n2 = 1;               // 介质 → 空气
    var r = O.snell(n1, th1, n2);
    var b = O.brewster(n1, n2);
    var c = O.critical(n1, n2);

    var top = 60, bot = h - 60;
    var iy = (top + bot) / 2, ix = w * 0.52;
    var L = Math.min(iy - top, bot - iy) - 26;

    plt.line(30, iy, w - 30, iy, { stroke: '#45506b', width: 1.6 });
    plt.label('空气 n₂ = 1', 40, iy - 20, { fill: '#7f8ea8', font: '11px ' + SR.FONT });
    plt.label('介质 n₁ = ' + n1.toFixed(2), 40, iy + 24, { fill: '#7f8ea8', font: '11px ' + SR.FONT });
    plt.line(ix, iy - L, ix, iy + L, { stroke: '#3a4763', width: 1, dash: [4, 4] });

    // 入射光（介质内，从下左上射）
    var ix0 = ix - L * Math.sin(th1), iy0 = iy + L * Math.cos(th1);
    plt.arrow(ix0, iy0, ix, iy, { stroke: '#4cc9f0', width: 2 });
    plt.label('θ₁=' + GP.deg(th1).toFixed(0) + '°', ix0 - 44, iy0 + 8, { fill: '#4cc9f0', font: '11px ' + SR.FONT });

    // 反射光（回介质，下右）
    var rx0 = ix + L * Math.sin(th1), ry0 = iy + L * Math.cos(th1);

    if (isNaN(r)) {
      plt.line(ix, iy, rx0, ry0, { stroke: '#f9c74f', width: 2.5 });
      plt.label('全反射', rx0 - 40, ry0 - 10, { fill: '#f9c74f', font: '12px ' + SR.FONT });
    } else {
      plt.line(ix, iy, rx0, ry0, { stroke: '#7f8ea8', width: 1.2, dash: [5, 4] });
      // 折射光（进入空气，上右）
      var tx0 = ix + L * Math.sin(r), ty0 = iy - L * Math.cos(r);
      plt.arrow(ix, iy, tx0, ty0, { stroke: '#34d399', width: 2 });
      plt.label('θ₂=' + GP.deg(r).toFixed(1) + '°', tx0 + 8, ty0 + 4, { fill: '#34d399', font: '11px ' + SR.FONT });
    }

    // 临界角参考（介质侧）
    if (!isNaN(c)) {
      var cx0 = ix + (L - 14) * Math.sin(c), cy0 = iy + (L - 14) * Math.cos(c);
      plt.line(ix, iy, cx0, cy0, { stroke: '#f472b6', width: 1, dash: [4, 4] });
      plt.label('θ_c=' + GP.deg(c).toFixed(1) + '°', cx0 + 6, cy0 - 4, { fill: '#f472b6', font: '10.5px ' + SR.FONT });
    }

    plt.label('折射与全反射（介质 → 空气，θ₁ 超过 θ_c 即全反射）', 30, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('opt-r', isNaN(r) ? '全反射' : GP.deg(r).toFixed(2) + '°');
    SR.setText('opt-b', GP.deg(b).toFixed(2) + '°');
    SR.setText('opt-c', isNaN(c) ? '无' : GP.deg(c).toFixed(2) + '°');
  }

  LAB.modules.optics = { init: init, render: render };
})();
