/* modules/wave.js — 机械波：行波 / 驻波 / 拍 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var plt = null;
  var gn, gf2;

  function init() {
    var cv = document.getElementById('wave-canvas');
    if (cv) plt = new SR.Plot(cv);
    gn = LAB.bindRange('wave-n', 'wave-n-val', function (v) { return v.toFixed(0); });
    gf2 = LAB.bindRange('wave-f2', 'wave-f2-val', function (v) { return v.toFixed(2); });
  }

  function mode() { var el = document.getElementById('wave-mode'); return el ? el.value : 'travel'; }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var n = Math.round(gn()), f2 = gf2(), m = mode();
    var L = 1, v = 1;
    var pad = 46, top = 50, bot = h - 30;
    function X(x) { return pad + x / L * (w - pad * 2); }
    function Y(y) { return (top + bot) / 2 - y * (bot - top) / 2 * 0.8; }

    plt.line(pad, (top + bot) / 2, w - pad, (top + bot) / 2, { stroke: '#45506b', width: 1.2 });
    plt.line(pad, top, pad, bot, { stroke: '#45506b', width: 1.2 });

    var pts = [];
    for (var i = 0; i <= 240; i++) {
      var x = L * i / 240;
      var y;
      if (m === 'standing') {
        y = Math.sin(n * Math.PI * x) * Math.cos(2 * Math.PI * n * (time || 0));
      } else if (m === 'beat') {
        y = Math.cos(2 * Math.PI * (x - (time || 0))) + Math.cos(2 * Math.PI * f2 * (x - (time || 0)));
      } else {
        y = Math.cos(2 * Math.PI * (x - (time || 0)));
      }
      pts.push([X(x), Y(y)]);
    }
    plt.path(pts, { stroke: '#4cc9f0', width: 2 });

    // 驻波节点标记
    if (m === 'standing') {
      for (var k = 0; k <= n; k++) {
        var xn = k * L / n;
        plt.dot(X(xn), Y(0), 4, { fill: '#f9c74f' });
      }
    }
    var title = m === 'travel' ? '行波' : (m === 'standing' ? '驻波（节点不动）' : '拍（两列频率接近的波叠加）');
    plt.label(title, pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('wave-lambda', (2 * L / n).toFixed(2));
    SR.setText('wave-f', (n * v / (2 * L)).toFixed(2));
    SR.setText('wave-nodes', m === 'standing' ? (n + 1) : 0);
  }

  LAB.modules.wave = { init: init, render: render };
})();
