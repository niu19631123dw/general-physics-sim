/* =============================================================================
 * modules/projectile.js — 抛体运动（参考模板）
 * 蓝线=无空气阻力抛物线；粉虚线=有空气阻力（RK4）；黄点=运动中球体动画。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.mech;
  var plt = null;
  var gv0, gangle, gdrag;

  function init() {
    var cv = document.getElementById('proj-canvas');
    if (cv) plt = new SR.Plot(cv);
    gv0 = LAB.bindRange('proj-v0', 'proj-v0-val', function (v) { return v.toFixed(0) + ' m/s'; });
    gangle = LAB.bindRange('proj-angle', 'proj-angle-val', function (v) { return v.toFixed(0) + '°'; });
    gdrag = LAB.bindRange('proj-drag', 'proj-drag-val', function (v) { return v.toFixed(3); });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var v0 = gv0(), th = gangle() * Math.PI / 180, drag = gdrag(), g = 9.8;
    var R = M.range(v0, th, g), H = M.maxHeight(v0, th, g), T = M.flightTime(v0, th, g);

    var pad = 56, top = 40, bot = h - 40, x0 = pad, x1 = w - pad;
    function X(x) { return x0 + x / (R * 1.15) * (x1 - x0); }
    function Y(y) { return bot - y / (H * 1.3) * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    var pts = [];
    for (var i = 0; i <= 200; i++) {
      var t = T * i / 200;
      var x = v0 * Math.cos(th) * t;
      var y = v0 * Math.sin(th) * t - 0.5 * g * t * t;
      pts.push([X(x), Y(Math.max(0, y))]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });

    if (drag > 0) {
      var f = function (t, s) { return [s[2], s[3], -drag * s[2], -g - drag * s[3]]; };
      var s = [0, 0, v0 * Math.cos(th), v0 * Math.sin(th)];
      var dt = 0.01, tt = 0, pts2 = [[X(0), Y(0)]];
      while (tt < 30 && s[1] >= 0) {
        s = GP.num.rk4Step(f, tt, s, dt);
        tt += dt;
        pts2.push([X(s[0]), Y(Math.max(0, s[1]))]);
      }
      plt.path(pts2, { stroke: '#f472b6', width: 1.6, dash: [5, 4] });
    }

    var tNow = (time || 0) % T;
    var bx = v0 * Math.cos(th) * tNow;
    var by = Math.max(0, v0 * Math.sin(th) * tNow - 0.5 * g * tNow * tNow);
    plt.dot(X(bx), Y(by), 6, { fill: '#f9c74f' });

    plt.line(X(R), Y(0), X(R), Y(H), { stroke: '#34d399', width: 1, dash: [3, 3] });
    plt.label('R', X(R) + 4, Y(H / 2), { fill: '#34d399', font: '11px ' + SR.FONT });
    plt.label('抛体轨迹（蓝=无阻力，粉虚线=有阻力）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('proj-range', R.toFixed(1) + ' m');
    SR.setText('proj-height', H.toFixed(1) + ' m');
    SR.setText('proj-time', T.toFixed(2) + ' s');
  }

  LAB.modules.projectile = { init: init, render: render };
})();
