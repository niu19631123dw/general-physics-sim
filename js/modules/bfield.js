/* =============================================================================
 * modules/bfield.js — 毕奥-萨伐尔定律
 * wire=长直导线（同心圆磁感线）；loop=圆环（轴向磁场）；solenoid=螺线管（内部均匀磁场）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var plt = null;
  var gI;

  function init() {
    var cv = document.getElementById('bf-canvas');
    if (cv) plt = new SR.Plot(cv);
    gI = LAB.bindRange('bf-I', 'bf-I-val', function (v) { return v.toFixed(1) + ' A'; });
  }

  function mode() { var el = document.getElementById('bf-mode'); return el ? el.value : 'wire'; }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var I = gI(), m = mode();
    var pad = 40, top = 42, bot = h - 30, cx = w / 2, cy = (top + bot) / 2;

    if (m === 'wire') {
      /* 长直导线：电流垂直纸面向外 ⊙，同心圆磁感线（右手定则：逆时针） */
      var R = Math.min((w - 2 * pad) / 2, (bot - top) / 2) * 0.85;
      plt.dot(cx, cy, 7, { fill: '#f9c74f' });
      plt.label('⊙', cx, cy - 16, { align: 'center', fill: '#f9c74f', font: '15px ' + SR.FONT });
      plt.label('I（垂直纸面向外）', cx, cy + 22, { align: 'center', fill: '#f9c74f', font: '10.5px ' + SR.FONT });
      var radii = [0.28, 0.5, 0.72, 0.94];
      for (var j = 0; j < radii.length; j++) {
        plt.ring(cx, cy, R * radii[j], { stroke: '#4cc9f0', width: 1.4 });
        var at = -0.9;
        var ax1 = cx + R * radii[j] * Math.cos(at), ay1 = cy + R * radii[j] * Math.sin(at);
        var ax2 = cx + R * radii[j] * Math.cos(at - 0.18), ay2 = cy + R * radii[j] * Math.sin(at - 0.18);
        plt.arrow(ax1, ay1, ax2, ay2, { stroke: '#4cc9f0', width: 1.4 });
      }
      plt.label('长直导线：同心圆磁感线', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      SR.setText('bf-B', E.wireB(I, 0.1).toExponential(2) + ' T（r=0.1 m）');
    } else if (m === 'loop') {
      /* 圆环：侧视（竖直环）+ 轴向磁场 */
      var lx = cx, ly = cy;
      var lr = Math.min((bot - top) * 0.32, w * 0.3);
      var ring = [];
      for (var a = 0; a <= 40; a++) {
        var th = a * 2 * Math.PI / 40;
        ring.push([lx + lr * 0.12 * Math.cos(th), ly + lr * Math.sin(th)]);
      }
      plt.path(ring, { stroke: '#f9c74f', width: 2 });
      plt.dot(lx, ly - lr, 3, { fill: '#f9c74f' });
      plt.dot(lx, ly + lr, 3, { fill: '#f9c74f' });
      plt.label('I', lx + 14, ly - lr + 6, { fill: '#f9c74f', font: '11px ' + SR.FONT });
      var axLen = (w - 2 * pad) * 0.4;
      plt.arrow(lx - axLen, ly, lx - 12, ly, { stroke: '#4cc9f0', width: 1.6 });
      plt.arrow(lx + 12, ly, lx + axLen, ly, { stroke: '#4cc9f0', width: 1.6 });
      plt.label('B', lx + axLen - 14, ly - 16, { fill: '#4cc9f0', font: '12px ' + SR.FONT });
      plt.label('圆环：轴向磁场', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      SR.setText('bf-B', E.loopB(I, 0.1).toExponential(2) + ' T（中心，R=0.1 m）');
    } else {
      /* 螺线管：内部均匀磁场 */
      var sw = Math.min(w * 0.6, 320), sh = (bot - top) * 0.5;
      var sx = cx - sw / 2, sy = cy - sh / 2;
      plt.rect(sx, sy, sw, sh, { stroke: '#f9c74f', width: 2 });
      for (var t = sx + 10; t < sx + sw; t += 16) {
        plt.line(t, sy, t, sy + sh, { stroke: '#f9c74f', width: 1 });
      }
      for (var y = sy + 16; y < sy + sh; y += 20) {
        plt.arrow(sx + 6, y, sx + sw - 14, y, { stroke: '#4cc9f0', width: 1.5 });
      }
      plt.label('B（均匀）', sx + sw / 2, sy - 14, { align: 'center', fill: '#4cc9f0', font: '11px ' + SR.FONT });
      plt.label('螺线管：内部均匀磁场', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      SR.setText('bf-B', E.solenoidB(1000, I).toExponential(2) + ' T（n=1000 匝/m）');
    }
  }

  LAB.modules.bfield = { init: init, render: render };
})();
