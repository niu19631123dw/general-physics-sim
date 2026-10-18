/* =============================================================================
 * modules/polarization.js — 偏振与马吕斯定律
 * 自然光 → 竖直偏振片 P₁ → 线偏振光 → 旋转 θ 的偏振片 P₂ → 透射光（I = I₀cos²θ）。
 * 底部为透射强度指示条。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var O = GP.optics;
  var plt = null;
  var gth;

  function init() {
    var cv = document.getElementById('pol-canvas');
    if (cv) plt = new SR.Plot(cv);
    gth = LAB.bindRange('pol-theta', 'pol-theta-val', function (v) { return v.toFixed(0) + '°'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var th = gth() * Math.PI / 180;
    var I = O.malus(1, th);   // cos²θ

    var pad = 60, top = 64, bot = h - 40;
    var midY = (top + bot) / 2;
    var x1 = pad + 66, x3 = w - pad - 66;
    var x2 = (x1 + x3) / 2;

    function polarizer(cx, angle, label) {
      var r = 42;
      plt.ring(cx, midY, r, { stroke: '#45506b', width: 1.6 });
      var ux = Math.sin(angle), uy = -Math.cos(angle);
      var px = Math.cos(angle), py = Math.sin(angle);
      for (var k = -1; k <= 1; k++) {
        var off = k * 15;
        var bx = cx + off * px, by = midY + off * py;
        var half = r - 8;
        plt.line(bx - half * ux, by - half * uy, bx + half * ux, by + half * uy, { stroke: '#4cc9f0', width: 1.4 });
      }
      plt.label(label, cx, midY + r + 16, { align: 'center', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    }

    polarizer(x1, 0, 'P₁（竖直）');
    polarizer(x3, th, 'P₂（旋转 ' + gth().toFixed(0) + '°）');

    // 入射自然光（左，虚线）
    for (var j = 0; j < 4; j++) {
      var yy = midY + (j - 1.5) * 22;
      plt.line(pad + 4, yy, x1 - 46, yy, { stroke: '#7f8ea8', width: 1.2, dash: [3, 3] });
    }
    // 两偏振片之间（竖直偏振光）
    for (j = 0; j < 4; j++) {
      var yy2 = midY + (j - 1.5) * 22;
      plt.line(x1 + 46, yy2, x2, yy2, { stroke: '#4cc9f0', width: 1.6 });
    }
    // 透射光（沿 θ 方向）
    var ux = Math.sin(th), uy = -Math.cos(th);
    for (j = 0; j < 4; j++) {
      var yy3 = midY + (j - 1.5) * 22;
      var sx = x3 + 46, sy = yy3;
      plt.line(sx, sy, sx + ux * 32, sy + uy * 32, { stroke: '#f9c74f', width: 1.6 });
    }

    plt.label('自然光', pad + 4, midY - 72, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('线偏振光', x2, midY - 72, { align: 'center', fill: '#4cc9f0', font: '10.5px ' + SR.FONT });
    plt.label('透射光', x3 + 46, midY - 72, { fill: '#f9c74f', font: '10.5px ' + SR.FONT });

    // 底部透射强度指示条
    var barX = pad + 60, barW = w - 2 * pad - 120, barY = bot - 24, barH = 15;
    plt.rect(barX, barY, barW, barH, { stroke: '#2c3a52', width: 1 });
    plt.rect(barX, barY, barW * I, barH, { fill: '#f9c74f' });
    plt.label('透射强度 I/I₀ = ' + I.toFixed(2), barX, barY - 8, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    plt.label('偏振与马吕斯定律 I = I₀cos²θ', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('pol-I', 'I/I₀ = ' + I.toFixed(2));
  }

  LAB.modules.polarization = { init: init, render: render };
})();
