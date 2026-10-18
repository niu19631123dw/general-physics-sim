/* modules/rigidlaw.js — 刚体定轴转动（转动定律 M = Iβ） */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null, gm, gR, gtau;

  function init() {
    var cv = document.getElementById('rigidlaw-canvas');
    if (cv) plt = new SR.Plot(cv);
    gm = LAB.bindRange('rigidlaw-m', 'rigidlaw-m-val', function (v) { return v.toFixed(1) + ' kg'; });
    gR = LAB.bindRange('rigidlaw-R', 'rigidlaw-R-val', function (v) { return v.toFixed(2) + ' m'; });
    gtau = LAB.bindRange('rigidlaw-tau', 'rigidlaw-tau-val', function (v) { return v.toFixed(1) + ' N·m'; });
  }
  function shape() { var el = document.getElementById('rigidlaw-shape'); return el ? el.value : 'disk'; }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var m = gm(), R = gR(), tau = gtau(), sh = shape();
    var I = M.shapeI(sh, m, R);
    var beta = M.angularAccel(tau, I);
    var t = (time || 0);
    var om = beta * t;
    var Ek = M.rotKE(I, om);

    var cx = w / 2, cy = h / 2, Rpx = Math.min(w, h) / 2 - 70;
    // 刚体轮廓
    if (sh === 'ring') { plt.ring(cx, cy, Rpx, { stroke: '#4cc9f0', width: 3 }); plt.ring(cx, cy, Rpx * 0.85, { stroke: '#4cc9f0', width: 1.5 }); }
    else if (sh === 'rod') { var phi = 0.5 * beta * t * t; plt.line(cx - Math.cos(phi) * Rpx, cy - Math.sin(phi) * Rpx, cx + Math.cos(phi) * Rpx, cy + Math.sin(phi) * Rpx, { stroke: '#4cc9f0', width: 5 }); }
    else if (sh === 'sphere') { plt.dot(cx, cy, Rpx, { fill: '#1a2b44' }); plt.ring(cx, cy, Rpx, { stroke: '#4cc9f0', width: 2 }); }
    else { plt.dot(cx, cy, Rpx, { fill: '#16324a' }); plt.ring(cx, cy, Rpx, { stroke: '#4cc9f0', width: 2 }); }

    // 旋转标记（半径线）
    var ang = t * Math.min(beta * 0.6, 2.5);
    var markerLen = sh === 'rod' ? Rpx : Rpx * 0.92;
    plt.line(cx, cy, cx + Math.cos(ang) * markerLen, cy + Math.sin(ang) * markerLen, { stroke: '#f9c74f', width: 2 });
    plt.dot(cx + Math.cos(ang) * markerLen, cy + Math.sin(ang) * markerLen, 5, { fill: '#f9c74f' });
    plt.dot(cx, cy, 5, { fill: '#f472b6' });
    // 力矩箭头
    plt.arrow(cx + Rpx + 10, cy - 24, cx + Rpx + 10, cy + 24, { stroke: '#34d399', width: 2 });
    plt.label('M', cx + Rpx + 18, cy, { fill: '#34d399', font: '11px ' + SR.FONT });
    plt.label('刚体定轴转动：M = Iβ，β = M/I', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('rigidlaw-I', I.toFixed(3) + ' kg·m²');
    SR.setText('rigidlaw-beta', beta.toFixed(2) + ' rad/s²');
    SR.setText('rigidlaw-w', om.toFixed(2) + ' rad/s');
    SR.setText('rigidlaw-ek', Ek.toFixed(2) + ' J');
  }
  LAB.modules.rigidlaw = { init: init, render: render };
})();
