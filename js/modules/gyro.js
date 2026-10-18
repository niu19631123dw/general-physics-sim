/* modules/gyro.js — 陀螺进动 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null, gw, gR;

  function init() {
    var cv = document.getElementById('gyro-canvas');
    if (cv) plt = new SR.Plot(cv);
    gw = LAB.bindRange('gyro-w', 'gyro-w-val', function (v) { return v.toFixed(0) + ' rad/s'; });
    gR = LAB.bindRange('gyro-R', 'gyro-R-val', function (v) { return v.toFixed(2) + ' m'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var spin = gw(), Rcm = gR(), m = 1, g = 9.8, Rg = 0.05;
    var I = 0.5 * m * Rg * Rg;
    var tau = m * g * Rcm;
    var L = I * spin;
    var omPrec = M.precession(m, g, Rcm, I, spin);
    var ang = (time || 0) * omPrec * 3;      // 进动角度（放大显示）

    var cx = w / 2, cy = h * 0.72;
    plt.line(cx, cy, cx, 40, { stroke: '#45506b', width: 1, dash: [5, 4] });
    // 进动圆（俯视投影）
    var rr = Rcm / 1.2 * (Math.min(w, h) / 2 - 80);
    var px = cx + Math.cos(ang) * rr, py = h * 0.3 + Math.sin(ang) * rr * 0.35;
    plt.line(cx, cy, px, py, { stroke: '#7f8ea8', width: 1.2, dash: [4, 4] });
    // 陀螺（自转轴指向 px,py）
    var dx = px - cx, dy = py - h * 0.3;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    plt.line(px, py, px - ux * 40, py - uy * 40, { stroke: '#4cc9f0', width: 4 });
    plt.dot(px, py, 10, { fill: '#f472b6' });
    plt.dot(cx, cy, 6, { fill: '#f9c74f' });
    plt.label('陀螺进动：重力矩 → 角动量变化 → 绕竖直轴进动', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('gyro-omega', omPrec.toFixed(4) + ' rad/s');
    SR.setText('gyro-tau', tau.toFixed(3) + ' N·m');
    SR.setText('gyro-L', L.toFixed(3) + ' kg·m²/s');
  }
  LAB.modules.gyro = { init: init, render: render };
})();
