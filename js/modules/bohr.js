/* =============================================================================
 * modules/bohr.js — 玻尔氢原子
 * 左：能级图（n=1..6，E_n=−13.6/n² eV），高亮当前 n，青箭头标出 n→1 跃迁。
 * 右：n→1 谱线在波长轴（对数）上的位置。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var R = GP.const.rydberg;
  var a0 = 0.0529;    // 玻尔半径 nm
  var plt = null;
  var gn;

  function init() {
    var cv = document.getElementById('boh-canvas');
    if (cv) plt = new SR.Plot(cv);
    gn = LAB.bindRange('boh-n', 'boh-n-val', function (v) { return v.toFixed(0); });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var n = Math.max(1, Math.round(gn()));

    var pad = 56, mid = w * 0.42, top = 40, bot = h - 40;

    /* ---------- 左：能级图 ---------- */
    var ex = pad + 30, ex1 = mid - 20;
    var emax = 13.606;
    function Ey(E) { return bot - (E + emax) / emax * (bot - top); }   // E∈[−13.6,0]
    plt.line(ex, top, ex, bot, { stroke: '#45506b', width: 1.2 });
    for (var i = 1; i <= 6; i++) {
      var E = M.level(i);
      var y = Ey(E);
      var hl = (i === n);
      plt.line(ex, y, ex1, y, { stroke: hl ? '#f9c74f' : '#45506b', width: hl ? 2.5 : 1.2 });
      plt.label('n=' + i, ex - 26, y, { align: 'right', fill: hl ? '#f9c74f' : '#7f8ea8', font: '11px ' + SR.FONT });
      plt.label(E.toFixed(2) + ' eV', ex1 + 6, y - 6, { fill: '#5c6b85', font: '9.5px ' + SR.FONT });
    }
    if (n > 1) {
      var y2 = Ey(M.level(n)), y1 = Ey(M.level(1));
      plt.arrow(ex1 - 14, y2, ex1 - 14, y1, { stroke: '#4cc9f0', width: 2.5 });
      plt.label('n→1', ex1 - 6, (y2 + y1) / 2, { fill: '#4cc9f0', font: '10.5px ' + SR.FONT });
    }
    plt.label('玻尔能级', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    /* ---------- 右：谱线位置（波长对数轴） ---------- */
    var rx0 = mid + 22, rx1 = w - pad, ry = (top + bot) / 2;
    var lmin = 90, lmax = 2000;
    function Lx(nm) { return rx0 + (Math.log(nm) - Math.log(lmin)) / (Math.log(lmax) - Math.log(lmin)) * (rx1 - rx0); }
    var segs = [[380, 450, '#5b7cff'], [450, 495, '#4cc9f0'], [495, 570, '#34d399'], [570, 590, '#f9c74f'], [590, 620, '#fb923c'], [620, 750, '#f87171']];
    for (var s = 0; s < segs.length; s++) {
      plt.rect(Lx(segs[s][0]), ry - 12, Lx(segs[s][1]) - Lx(segs[s][0]), 24, { fill: segs[s][2] });
    }
    plt.rect(rx0, ry - 12, rx1 - rx0, 24, { stroke: '#2c3a52', width: 1 });
    if (n > 1) {
      var lnm = M.wavelength(1, n, R) * 1e9;
      if (lnm > lmin && lnm < lmax) {
        var lx = Lx(lnm);
        plt.line(lx, ry - 20, lx, ry + 20, { stroke: '#f472b6', width: 3 });
        plt.label(lnm.toFixed(1) + ' nm', lx, ry + 32, { align: 'center', fill: '#f472b6', font: '11px ' + SR.FONT });
      }
    }
    plt.label('n→1 谱线（波长对数轴，可见光着色）', rx0, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('boh-E', M.level(n).toFixed(2) + ' eV');
    SR.setText('boh-r', (n * n * a0).toFixed(2) + ' nm');
    SR.setText('boh-lambda', n > 1 ? (M.wavelength(1, n, R) * 1e9).toFixed(1) + ' nm' : '—');
  }

  LAB.modules.bohr = { init: init, render: render };
})();
