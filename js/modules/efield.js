/* =============================================================================
 * modules/efield.js — 库仑定律与电场（电场线 / 等势面）
 * point=单个正点电荷（放射状电场线 + 同心圆等势面）；
 * dipole=电偶极子（场线从 + 到 −）；plate=平行板（板间均匀场线 + 平行等势面）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var E = GP.em;
  var plt = null;

  function init() {
    var cv = document.getElementById('ef-canvas');
    if (cv) plt = new SR.Plot(cv);
  }

  function mode() { var el = document.getElementById('ef-mode'); return el ? el.value : 'point'; }

  function render() {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var m = mode();
    var pad = 40, top = 42, bot = h - 30, cx = w / 2, cy = (top + bot) / 2;

    if (m === 'point') {
      /* 放射状电场线 + 同心圆等势面 */
      var R = Math.min((w - 2 * pad) / 2, (bot - top) / 2) * 0.85;
      for (var a = 0; a < 360; a += 30) {
        var th = a * Math.PI / 180;
        var x1 = cx + R * 0.18 * Math.cos(th), y1 = cy + R * 0.18 * Math.sin(th);
        var x2 = cx + R * Math.cos(th), y2 = cy + R * Math.sin(th);
        plt.arrow(x1, y1, x2, y2, { stroke: '#4cc9f0', width: 1.6 });
      }
      for (var rr = 0.4; rr <= 1.0; rr += 0.3) {
        plt.ring(cx, cy, R * rr, { stroke: '#f9c74f', width: 1 });
      }
      plt.dot(cx, cy, 8, { fill: '#34d399' });
      plt.label('+', cx, cy - 14, { align: 'center', fill: '#34d399', font: '14px ' + SR.FONT });
      plt.label('点电荷：电场线 + 等势面', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      SR.setText('ef-E', E.pointE(1e-9, 1).toFixed(2) + ' N/C（1 nC @ 1 m）');
      SR.setText('ef-V', E.pointV(1e-9, 1).toFixed(2) + ' V（1 nC @ 1 m）');
    } else if (m === 'dipole') {
      /* 电偶极子：场线从 + 到 − */
      var d = Math.min(w, h - top) * 0.22;
      var xp = cx - d, xn = cx + d;
      var bulges = [0, 34, 68, 102, 136];
      for (var b = 0; b < bulges.length; b++) {
        var bg = bulges[b];
        var pts = [], pts2 = [];
        for (var i = 0; i <= 40; i++) {
          var t = i / 40;
          var x = xp + (xn - xp) * t;
          pts.push([x, cy + bg * Math.sin(Math.PI * t)]);
          pts2.push([x, cy - bg * Math.sin(Math.PI * t)]);
        }
        plt.path(pts, { stroke: '#4cc9f0', width: bg === 0 ? 2 : 1.4 });
        plt.path(pts2, { stroke: '#4cc9f0', width: bg === 0 ? 2 : 1.4 });
      }
      var mx = (xp + xn) / 2;
      plt.arrow(mx, cy + 50, mx + 14, cy + 50, { stroke: '#4cc9f0', width: 1.6 });
      plt.arrow(mx, cy - 50, mx + 14, cy - 50, { stroke: '#4cc9f0', width: 1.6 });
      plt.dot(xp, cy, 9, { fill: '#34d399' });
      plt.dot(xn, cy, 9, { fill: '#f472b6' });
      plt.label('+', xp, cy - 16, { align: 'center', fill: '#34d399', font: '14px ' + SR.FONT });
      plt.label('−', xn, cy - 16, { align: 'center', fill: '#f472b6', font: '16px ' + SR.FONT });
      plt.label('电偶极子：场线从 + 到 −', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      SR.setText('ef-E', E.pointE(1e-9, 1).toFixed(2) + ' N/C（单电荷 @ 1 m）');
      SR.setText('ef-V', '0 V（连线中点）');
    } else {
      /* 平行板：板间均匀场线 + 平行等势面 */
      var px1 = cx - 90, px2 = cx + 90;
      var py1 = cy - 130, py2 = cy + 130;
      plt.line(px1, py1, px1, py2, { stroke: '#34d399', width: 4 });
      plt.line(px2, py1, px2, py2, { stroke: '#f472b6', width: 4 });
      plt.label('+', px1, py1 - 12, { align: 'center', fill: '#34d399', font: '14px ' + SR.FONT });
      plt.label('−', px2, py1 - 12, { align: 'center', fill: '#f472b6', font: '16px ' + SR.FONT });
      for (var y = py1 + 20; y <= py2 - 20; y += 22) {
        plt.arrow(px1 + 10, y, px2 - 14, y, { stroke: '#4cc9f0', width: 1.4 });
      }
      for (var xx = px1 + 25; xx < px2; xx += 25) {
        plt.line(xx, py1 + 6, xx, py2 - 6, { stroke: '#f9c74f', width: 1, dash: [4, 4] });
      }
      plt.label('平行板：均匀电场 + 平行等势面', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });
      var pe = E.plateE(1e-9);
      SR.setText('ef-E', pe.toFixed(2) + ' N/C（E=σ/ε₀，σ=1 nC/m²）');
      SR.setText('ef-V', (pe * 1).toFixed(2) + ' V（d=1 m 处）');
    }
  }

  LAB.modules.efield = { init: init, render: render };
})();
