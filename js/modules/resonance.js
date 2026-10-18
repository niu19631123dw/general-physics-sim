/* modules/resonance.js — 阻尼振动与受迫共振 */
LAB.modules = LAB.modules || {};
(function () {
  'use strict';
  var M = GP.mech;
  var plt = null;
  var ggamma, gw;

  function init() {
    var cv = document.getElementById('res-canvas');
    if (cv) plt = new SR.Plot(cv);
    ggamma = LAB.bindRange('res-gamma', 'res-gamma-val', function (v) { return v.toFixed(2); });
    gw = LAB.bindRange('res-w', 'res-w-val', function (v) { return v.toFixed(2); });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var gamma = ggamma(), wRatio = gw(), w0 = 2, wDrive = wRatio * w0;
    var A = M.forcedAmp(1, 1, w0, gamma, wDrive);
    var wRes = M.resonanceOmega(w0, gamma);
    var Q = gamma < 1e-9 ? Infinity : M.Q(w0, gamma);
    var wd = M.dampedOmega(w0, gamma);

    var mid = w * 0.46, top = 42, bot = h - 34, pad = 46;

    /* 左：A(ω) 共振曲线 */
    var rx0 = pad, rx1 = mid - 16, ryTop = top, ryBot = bot;
    var wmax = 2.5 * w0;
    var cap = 8 * M.forcedAmp(1, 1, w0, gamma, 0);
    var aw = [], aa = [], Amax = 0;
    for (var i = 0; i <= 200; i++) {
      var wv = wmax * i / 200;
      var a = M.forcedAmp(1, 1, w0, gamma, wv);
      if (a > cap) a = cap;
      if (a > Amax) Amax = a;
      aw.push(wv); aa.push(a);
    }
    if (Amax < 1e-12) Amax = 1;
    function Wx(wv) { return rx0 + wv / wmax * (rx1 - rx0); }
    function Ay(a) { return ryBot - a / Amax * (ryBot - ryTop); }
    plt.line(rx0, ryBot, rx1, ryBot, { stroke: '#45506b', width: 1.2 });
    plt.line(rx0, ryTop, rx0, ryBot, { stroke: '#45506b', width: 1.2 });
    var q = [];
    for (i = 0; i < aw.length; i++) q.push([Wx(aw[i]), Ay(aa[i])]);
    plt.path(q, { stroke: '#c084fc', width: 2 });
    if (wRes > 0) plt.line(Wx(wRes), ryTop, Wx(wRes), ryBot, { stroke: '#f9c74f', width: 1.2, dash: [5, 4] });
    plt.dot(Wx(wDrive), Ay(Math.min(A, Amax)), 5, { fill: '#34d399' });
    plt.label('A(ω) 共振曲线', rx0, 24, { fill: '#dbe4f5', font: '12px ' + SR.FONT });

    /* 右：阻尼振动时域 */
    var x0 = mid + 22, x1 = w - pad, y0 = bot, ampPix = (bot - top) * 0.32;
    var tmax = gamma > 1e-9 ? 6 / gamma : 6;
    function Xt(t) { return x0 + t / tmax * (x1 - x0); }
    function Yx(x) { return y0 - x * ampPix; }
    plt.line(x0, y0, x1, y0, { stroke: '#45506b', width: 1.2 });
    var p1 = [], p2 = [], p3 = [];
    for (i = 0; i <= 200; i++) {
      var t = tmax * i / 200;
      var env = Math.exp(-0.5 * gamma * t);
      var xx = env * Math.cos(wd * t);
      p1.push([Xt(t), Yx(xx)]); p2.push([Xt(t), Yx(env)]); p3.push([Xt(t), Yx(-env)]);
    }
    plt.path(p2, { stroke: '#f9c74f', width: 1.2, dash: [5, 4] });
    plt.path(p3, { stroke: '#f9c74f', width: 1.2, dash: [5, 4] });
    plt.path(p1, { stroke: '#4cc9f0', width: 2 });
    plt.label('阻尼振动 x(t)', x0, 24, { fill: '#dbe4f5', font: '12px ' + SR.FONT });

    SR.setText('res-A', A.toFixed(3));
    SR.setText('res-wres', wRes > 0 ? wRes.toFixed(3) : '不存在');
    SR.setText('res-Q', isFinite(Q) ? Q.toFixed(1) : '∞');
  }

  LAB.modules.resonance = { init: init, render: render };
})();
