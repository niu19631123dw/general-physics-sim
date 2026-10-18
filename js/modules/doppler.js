/* modules/doppler.js — 多普勒效应：运动波源 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null;
  var gvs;

  function init() {
    var cv = document.getElementById('dop-canvas');
    if (cv) plt = new SR.Plot(cv);
    gvs = LAB.bindRange('dop-vs', 'dop-vs-val', function (v) { return v.toFixed(2); });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var vs = gvs() / 100;   // v_s/v
    var pad = 40, cx = w / 2, cy = h / 2;
    var t = (time || 0);

    // 源位置：在水平线中心附近往返
    var xs = cx + Math.sin(t * 1.2) * (w / 2 - 60) * Math.abs(vs) / 0.8;
    // 波前：每 0.5s 发一个，半径 = (t - t_emit)
    var N = 8;
    for (var i = 0; i < N; i++) {
      var tEmit = Math.floor(t / 0.5) - i;
      var r = (t - tEmit * 0.5);   // 波速=1，用时间差表示半径
      if (r < 0 || r > 3) continue;
      var rr = r * (w / 6);
      if (rr > w) continue;
      // 圆心 = 发射时刻源的位置（近似用当前源的移动轨迹）
      var xEmit = cx + Math.sin(tEmit * 0.5 * 1.2) * (w / 2 - 60) * Math.abs(vs) / 0.8;
      plt.ring(xEmit, cy, rr, { stroke: '#4cc9f0', width: 1.2 });
    }
    plt.dot(xs, cy, 6, { fill: '#f9c74f' });
    plt.label('波源（向右为 +v_s）', cx, 22, { align: 'center', fill: '#dbe4f5', font: '12px ' + SR.FONT });

    var fPrime = vs < 1 ? M.doppler(1, 1, 0, vs) : Infinity;
    SR.setText('dop-f', isFinite(fPrime) ? fPrime.toFixed(3) : '∞（冲击波）');
    SR.setText('dop-ratio', isFinite(fPrime) ? fPrime.toFixed(3) : '∞');
  }

  LAB.modules.doppler = { init: init, render: render };
})();
