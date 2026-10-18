/* modules/rolling.js — 刚体平面运动：纯滚动（滚下斜面） */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null, gang, gh;

  function init() {
    var cv = document.getElementById('rolling-canvas');
    if (cv) plt = new SR.Plot(cv);
    gang = LAB.bindRange('rolling-angle', 'rolling-angle-val', function (v) { return v.toFixed(0) + '°'; });
    gh = LAB.bindRange('rolling-h', 'rolling-h-val', function (v) { return v.toFixed(1) + ' m'; });
  }
  function shape() { var el = document.getElementById('rolling-shape'); return el ? el.value : 'sphere'; }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var th = gang() * Math.PI / 180, dropH = gh(), sh = shape();
    var k = M.kRoll(sh);
    var a = M.rollingAccel(th, k);
    var vEnd = M.rollingV(dropH, k);
    var tEnd = vEnd / a;
    var L = dropH / Math.sin(th);           // 斜面长度（米）

    /* 让斜面在画布内放得下：先定水平跨度，再由高度上限约束 */
    var pad = 60, baseY = h - 50;
    var dx = Math.min(w - 2 * pad, (h - 2 * pad - 20) / Math.tan(th));
    var dy = dx * Math.tan(th);
    var xL = pad, yB = baseY;               // 左下（低端）
    var xR = xL + dx, yT = yB - dy;         // 右上（高端）

    plt.line(xL - 40, baseY + 10, xR + 40, baseY + 10, { stroke: '#45506b', width: 1.5 });
    plt.line(xL, yB, xR, yT, { stroke: '#45506b', width: 2 });
    plt.line(xR, yT, xR, baseY + 10, { stroke: '#3a4763', width: 1, dash: [4, 4] });

    /* 沿斜面位置：s = ½at²，钳制在 L 内；从上端滚向下端 */
    var tt = (time || 0) % (tEnd + 1.0);
    var s = Math.min(0.5 * a * tt * tt, L);
    var frac = s / L;
    var bx = xR - (xR - xL) * frac;
    var by = yT + (yB - yT) * frac;
    /* 法向偏移（垂直于斜面、指向斜面上方） */
    var nx = -Math.sin(th), ny = -Math.cos(th), rpx = 16;
    var ccx = bx + nx * rpx, ccy = by + ny * rpx;

    if (sh === 'ring') plt.ring(ccx, ccy, rpx, { stroke: '#4cc9f0', width: 3 });
    else { plt.dot(ccx, ccy, rpx, { fill: '#16324a' }); plt.ring(ccx, ccy, rpx, { stroke: '#4cc9f0', width: 2 }); }
    /* 自转标记：转角 = s/R */
    var spin = s / 0.1;
    plt.line(ccx, ccy, ccx + Math.cos(spin) * rpx, ccy + Math.sin(spin) * rpx, { stroke: '#f9c74f', width: 2 });
    /* 速度箭头（沿斜面向下） */
    var tx = Math.cos(th), ty = Math.sin(th);
    plt.arrow(ccx, ccy + rpx + 8, ccx + tx * 24, ccy + rpx + 8 + ty * 24, { stroke: '#34d399', width: 1.5 });
    plt.label((sh === 'ring' ? '圆环' : (sh === 'cylinder' ? '圆柱' : '球')) + '纯滚动：a = g·sinθ/(1+k)', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('rolling-a', a.toFixed(2) + ' m/s²');
    SR.setText('rolling-v', vEnd.toFixed(2) + ' m/s');
    SR.setText('rolling-t', tEnd.toFixed(2) + ' s');
  }
  LAB.modules.rolling = { init: init, render: render };
})();
