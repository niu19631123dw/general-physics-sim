/* modules/rigid.js — 刚体定轴转动与角动量守恒 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null, gr;

  function init() {
    var cv = document.getElementById('rigid-canvas');
    if (cv) plt = new SR.Plot(cv);
    gr = LAB.bindRange('rigid-r', 'rigid-r-val', function (v) { return (v / 100).toFixed(2) + ' R'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var r = gr() / 100;                    // 质量块离轴距离（单位 R）
    var I0 = 0.5, m = 0.5;                 // 圆盘 I₀=½MR²，两个 m 滑块
    var I = M.rigidI(I0, m, r);            // I = I₀ + 2m r²
    var L = 1.5;                           // 角动量守恒（r=1 时 I=1.5, ω=1）
    var om = M.omegaFromL(L, I);
    var ke = M.rotKE(I, om);

    var cy = h / 2, cx = w / 2, R = Math.min(w, h) / 2 - 70;
    // 圆盘
    plt.ring(cx, cy, R, { stroke: '#45506b', width: 1.5 });
    plt.ring(cx, cy, 6, { stroke: '#45506b', width: 1.2 });
    // 两个质量块，随 ω 旋转
    var ang = (time || 0) * om;
    for (var s = 0; s < 2; s++) {
      var a = ang + s * Math.PI;
      var mx = cx + Math.cos(a) * r * R, my = cy + Math.sin(a) * r * R;
      plt.dot(mx, my, 10, { fill: '#4cc9f0' });
    }
    // 半径导轨
    plt.line(cx, cy, cx + r * R, cy, { stroke: '#3a4763', width: 1, dash: [4, 4] });
    plt.label('角动量守恒：r 减小 → I 减小 → ω 增大 → 动能增大', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
    plt.label('（花样滑冰收臂加速）', 30, 44, { fill: '#7f8ea8', font: '11px ' + SR.FONT });

    SR.setText('rigid-I', I.toFixed(3));
    SR.setText('rigid-w', om.toFixed(3));
    SR.setText('rigid-L', L.toFixed(3));
    SR.setText('rigid-ke', ke.toFixed(3));
  }
  LAB.modules.rigid = { init: init, render: render };
})();
