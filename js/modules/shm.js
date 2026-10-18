/* modules/shm.js — 简谐振动：旋转矢量投影 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null;
  var gA, gw, gphi;

  function init() {
    var cv = document.getElementById('shm-canvas');
    if (cv) plt = new SR.Plot(cv);
    gA = LAB.bindRange('shm-A', 'shm-A-val', function (v) { return v.toFixed(1); });
    gw = LAB.bindRange('shm-w', 'shm-w-val', function (v) { return v.toFixed(1); });
    gphi = LAB.bindRange('shm-phi', 'shm-phi-val', function (v) { return v.toFixed(0) + '°'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var A = gA(), om = gw(), ph = gphi() * Math.PI / 180;
    var t = (time || 0);
    var th = om * t + ph;
    var x = M.pos(A, om, t, ph);
    var v = M.vel(A, om, t, ph);

    var mid = w * 0.42, top = 40, bot = h - 40;

    /* 左：旋转矢量圆 */
    var cx = mid / 2, cy = (top + bot) / 2;
    var scale = Math.min(mid / 2 - 24, (bot - top) / 2 - 16) / 2;  // 每单位振幅像素（A_max=2 满幅）
    var R = A * scale;                                            // 旋转矢量长度 ∝ 振幅 A
    plt.ring(cx, cy, R, { stroke: '#45506b', width: 1.2 });
    plt.line(cx - R, cy, cx + R, cy, { stroke: '#45506b', width: 1 });
    plt.line(cx, cy - R, cx, cy + R, { stroke: '#3a4763', width: 1, dash: [3, 3] });
    // 旋转矢量
    var vx = Math.cos(th), vy = Math.sin(th);
    plt.arrow(cx, cy, cx + vx * R, cy - vy * R, { stroke: '#4cc9f0', width: 2.5 });
    plt.dot(cx + vx * R, cy - vy * R, 4, { fill: '#4cc9f0' });
    // 投影到 x 轴
    plt.line(cx + vx * R, cy - vy * R, cx + vx * R, cy, { stroke: '#f9c74f', width: 1.2, dash: [4, 3] });
    plt.dot(cx + vx * R, cy, 5, { fill: '#f9c74f' });
    plt.label('旋转矢量', cx, top + 4, { align: 'center', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    /* 右：x(t) 波形 */
    var rx0 = mid + 26, rx1 = w - 40, ry0 = cy;
    var tmax = 2 * Math.PI / om;
    function Tx(tt) { return rx0 + tt / tmax * (rx1 - rx0); }
    function Ty(xx) { return ry0 - xx * scale; }
    plt.line(rx0, ry0, rx1, ry0, { stroke: '#45506b', width: 1.2 });
    var pts = [];
    for (var i = 0; i <= 160; i++) {
      var tt = tmax * i / 160;
      pts.push([Tx(tt), Ty(M.pos(A, om, tt, ph))]);
    }
    plt.path(pts, { stroke: '#c084fc', width: 2 });
    var tcur = t % tmax;
    plt.line(Tx(tcur), ry0, Tx(tcur), Ty(x), { stroke: '#f9c74f', width: 1, dash: [3, 3] });
    plt.dot(Tx(tcur), Ty(x), 5, { fill: '#f9c74f' });
    plt.label('x(t) = A cos(ωt+φ)', rx0, top + 4, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    SR.setText('shm-pos', x.toFixed(3));
    SR.setText('shm-vel', v.toFixed(3));
    SR.setText('shm-period', (2 * Math.PI / om).toFixed(3));
    SR.setText('shm-energy', (0.5 * om * om * A * A).toFixed(3));
  }

  LAB.modules.shm = { init: init, render: render };
})();
