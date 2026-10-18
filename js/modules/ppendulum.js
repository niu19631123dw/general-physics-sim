/* modules/ppendulum.js — 复摆（物理摆） */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null, gL;

  function init() {
    var cv = document.getElementById('ppend-canvas');
    if (cv) plt = new SR.Plot(cv);
    gL = LAB.bindRange('ppend-L', 'ppend-L-val', function (v) { return v.toFixed(2) + ' m'; });
  }
  function shape() { var el = document.getElementById('ppend-shape'); return el ? el.value : 'rodEnd'; }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var L = gL(), sh = shape(), m = 1, g = 9.8;
    var I, d;
    if (sh === 'diskEdge') { I = 1.5 * m * L * L; d = L; }
    else { I = m * L * L / 3; d = L / 2; }
    var T = M.physPendulum(I, m, g, d);

    var cx = w / 2, cy = 50, rp = Math.min(w, h) / 2 - 60;
    plt.dot(cx, cy, 6, { fill: '#f9c74f' });
    var th = 0.5 * Math.cos(2 * Math.PI / T * (time || 0));
    var bx = cx + Math.sin(th) * rp, by = cy + Math.cos(th) * rp;
    if (sh === 'diskEdge') {
      plt.line(cx, cy, bx, by, { stroke: '#45506b', width: 2 });
      plt.dot(bx, by, 18, { fill: '#16324a' });
      plt.ring(bx, by, 18, { stroke: '#4cc9f0', width: 2 });
    } else {
      plt.line(cx, cy, cx + Math.sin(th) * rp * 2, cy + Math.cos(th) * rp * 2, { stroke: '#4cc9f0', width: 5 });
    }
    plt.label('复摆（物理摆）：T = 2π√(I/mgd)', 30, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('ppend-I', I.toFixed(4) + ' kg·m²');
    SR.setText('ppend-d', d.toFixed(2) + ' m');
    SR.setText('ppend-T', T.toFixed(3) + ' s');
  }
  LAB.modules.ppendulum = { init: init, render: render };
})();
