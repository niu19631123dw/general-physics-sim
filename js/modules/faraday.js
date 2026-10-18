/* =============================================================================
 * modules/faraday.js — 电磁感应（法拉第与楞次定律）
 * 上：磁铁在线圈轴线上往返运动（time 动画）。
 * 下：磁通量 Φ(t)（青）与感应电动势 ε(t)=−dΦ/dt（紫）两条曲线。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var plt = null;
  var gv;

  function init() {
    var cv = document.getElementById('far-canvas');
    if (cv) plt = new SR.Plot(cv);
    gv = LAB.bindRange('far-v', 'far-v-val', function (v) { return v.toFixed(1); });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var w0 = gv();            // 磁铁往返角频率（rad/s）
    var A = 1, sig = 0.35;    // 振幅、线圈有效半宽
    var t = (time || 0);
    var x = A * Math.sin(w0 * t);
    var Phi = Math.exp(-x * x / (2 * sig * sig));
    var dxdt = A * w0 * Math.cos(w0 * t);
    var dPhidt = -Phi * x * dxdt / (sig * sig);
    var eps = -dPhidt;

    var pad = 56, top = 44, mid = h * 0.42, bot = h - 36, x0 = pad, x1 = w - pad;

    /* ---------- 上：磁铁往返 + 线圈 ---------- */
    var cx = (x0 + x1) / 2, cTop = top + 18, cBot = mid - 6;
    var cyc = (cTop + cBot) / 2;
    var cw = 22;
    plt.rect(cx - cw / 2, cTop, cw, cBot - cTop, { stroke: '#4cc9f0', width: 2 });
    plt.line(cx - cw / 2, cTop + 8, cx + cw / 2, cTop + 8, { stroke: '#4cc9f0', width: 1 });
    plt.line(cx - cw / 2, cBot - 8, cx + cw / 2, cBot - 8, { stroke: '#4cc9f0', width: 1 });
    var ampPix = (x1 - x0) / 2 - 46;
    var mx = cx + x * ampPix;
    var mw2 = 40, mh2 = 30;
    plt.rect(mx - mw2 / 2, cyc - mh2 / 2, mw2, mh2, { fill: '#f9c74f' });
    plt.label('N', mx - mw2 / 2, cyc, { align: 'center', fill: '#0d1220', font: '11px ' + SR.FONT });
    plt.label('S', mx + mw2 / 2, cyc, { align: 'center', fill: '#0d1220', font: '11px ' + SR.FONT });
    plt.line(x0, cyc, x1, cyc, { stroke: '#3a4763', width: 1, dash: [4, 4] });
    plt.label('磁铁在线圈轴线上往返', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    /* ---------- 下：Φ(t) 与 ε(t) ---------- */
    var bTop = mid + 8, bBot = bot;
    var T = 2 * Math.PI / w0;
    function Tx(t) { return x0 + t / T * (x1 - x0); }
    function Fy(ph) { return bBot - (ph + 1) / 2.4 * (bBot - bTop); }   // Φ ∈ [0,1]
    function Ey(ep) { return (bTop + bBot) / 2 - ep / 2.2 * (bBot - bTop) / 2; }
    plt.line(x0, (bTop + bBot) / 2, x1, (bTop + bBot) / 2, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, bTop, x0, bBot, { stroke: '#45506b', width: 1.2 });

    var fq = [], eq = [];
    for (var i = 0; i <= 240; i++) {
      var tt = T * i / 240;
      var xx = A * Math.sin(w0 * tt);
      var ph = Math.exp(-xx * xx / (2 * sig * sig));
      var dph = -ph * xx * A * w0 * Math.cos(w0 * tt) / (sig * sig);
      fq.push([Tx(tt), Fy(ph)]);
      eq.push([Tx(tt), Ey(-dph)]);
    }
    plt.path(fq, { stroke: '#4cc9f0', width: 2 });
    plt.path(eq, { stroke: '#c084fc', width: 2 });

    var ttNow = t % T;
    plt.dot(Tx(ttNow), Fy(Phi), 4, { fill: '#4cc9f0' });
    plt.dot(Tx(ttNow), Ey(eps), 4, { fill: '#c084fc' });
    plt.label('Φ（青）· ε（紫）', x0, bTop + 14, { fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    SR.setText('far-emf', eps.toFixed(2) + '（ε=−dΦ/dt）');
    SR.setText('far-flux', Phi.toFixed(2));
    SR.setText('far-dir', dPhidt > 0.01 ? '靠近 → 反抗增强' : (dPhidt < -0.01 ? '远离 → 反抗减弱' : 'Φ 极值处'));
  }

  LAB.modules.faraday = { init: init, render: render };
})();
