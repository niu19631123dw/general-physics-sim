/* =============================================================================
 * modules/photoelectric.js — 光电效应
 * U_s–ν 直线（斜率 h/e），粉点标出截距 −W₀/e，绿竖线为截止频率 ν₀，
 * 黄点标出当前入射频率对应的 U_s（ν<ν₀ 时无光电子，钳到 0）。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var M = GP.modern;
  var e = GP.const.e, h = GP.const.h;
  var plt = null;
  var gW, gnu;

  function init() {
    var cv = document.getElementById('pho-canvas');
    if (cv) plt = new SR.Plot(cv);
    gW = LAB.bindRange('pho-W', 'pho-W-val', function (v) { return v.toFixed(1) + ' eV'; });
    gnu = LAB.bindRange('pho-nu', 'pho-nu-val', function (v) { return v.toFixed(2) + ' ×10¹⁵ Hz'; });
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var W = gW() * e;             // 逸出功（J）
    var nu = gnu() * 1e15;        // 当前入射频率（Hz）
    var nu0 = M.threshold(W, h);  // 截止频率（Hz）
    var Us = M.stopping(h, nu, W);// 当前截止电压（V，可能为负）

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var nmin = 0.5e15, nmax = 1.5e15;
    function X(n) { return x0 + (n - nmin) / (nmax - nmin) * (x1 - x0); }
    var Umin = -W / e;                            // ν=0 截距
    var Umax = Math.max(1.5, (h * nmax - W) / e); // 上沿
    function Y(u) { return bot - (u - Umin) / (Umax - Umin) * (bot - top); }

    plt.line(x0, bot, x1, bot, { stroke: '#45506b', width: 1.2 });
    plt.line(x0, top, x0, bot, { stroke: '#45506b', width: 1.2 });
    plt.label('频率 ν / ×10¹⁵ Hz', x1 - 4, bot + 8, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });
    plt.label('U_s / V', x0 - 8, top + 2, { align: 'right', fill: '#7f8ea8', font: '10.5px ' + SR.FONT });

    // U_s–ν 直线
    plt.line(X(nmin), Y((h * nmin - W) / e), X(nmax), Y((h * nmax - W) / e), { stroke: '#c084fc', width: 2 });

    // 截距 −W₀/e
    plt.dot(X(nmin), Y(Umin), 4, { fill: '#f472b6' });
    plt.label('−W₀/e = ' + Umin.toFixed(2) + ' V', X(nmin) + 6, Y(Umin) + 12, { fill: '#f472b6', font: '11px ' + SR.FONT });

    // 截止频率 ν₀
    if (nu0 >= nmin && nu0 <= nmax) {
      plt.line(X(nu0), Y(0), X(nu0), bot, { stroke: '#34d399', width: 1, dash: [4, 3] });
      plt.label('ν₀', X(nu0), bot + 20, { align: 'center', fill: '#34d399', font: '11px ' + SR.FONT });
    }

    // 当前频率点
    if (nu >= nmin && nu <= nmax) {
      var uNow = Us > 0 ? Us : 0;
      plt.dot(X(nu), Y(uNow), 5, { fill: '#f9c74f' });
      plt.line(X(nu), Y(0), X(nu), Y(uNow), { stroke: '#f9c74f', width: 1, dash: [4, 3] });
    }

    plt.label('光电效应 U_s–ν（斜率 = h/e）', pad, 24, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('pho-Us', Us >= 0 ? Us.toFixed(2) + ' V' : '无光电子');
    SR.setText('pho-nu0', (nu0 / 1e15).toFixed(2) + ' ×10¹⁵ Hz');
  }

  LAB.modules.photoelectric = { init: init, render: render };
})();
