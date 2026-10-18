/* =============================================================================
 * modules/idealgas.js — 理想气体（微观模型）
 * 方形容器内若干分子作无规则热运动（随机方向匀速，速度大小 ∝ √T），
 * 碰到器壁反弹（用 time 参数做确定性动画）。温度越高分子越快、撞击越剧烈 → 压强越大。
 * p = n·k_B·T（n = 滑块值 ×10²⁵），v_rms = √(3kT/m)，平均平动动能 (3/2)kT。
 * ============================================================================= */
LAB.modules = LAB.modules || {};

(function () {
  'use strict';
  var T = GP.thermo;
  var C = GP.const;
  var MOL = 4.65e-26;          // 分子质量 kg（氮分子量级）
  var plt = null;
  var gT, gn;
  var mols = [];

  function init() {
    var cv = document.getElementById('gas-canvas');
    if (cv) plt = new SR.Plot(cv);
    gT = LAB.bindRange('gas-T', 'gas-T-val', function (v) { return v.toFixed(0) + ' K'; });
    gn = LAB.bindRange('gas-n', 'gas-n-val', function (v) { return v.toFixed(1) + ' ×10²⁵ m⁻³'; });
  }

  function ensure(count) {
    if (mols.length === count) return;
    mols = [];
    for (var i = 0; i < count; i++) {
      var a = Math.random() * 2 * Math.PI;
      mols.push({ x0: Math.random(), y0: Math.random(), dx: Math.cos(a), dy: Math.sin(a) });
    }
  }

  /* 位置在 [0,1] 内反弹（三角波，周期 2） */
  function reflect(u) {
    var p = u % 2;
    if (p < 0) p += 2;
    return p < 1 ? p : 2 - p;
  }

  function render(time) {
    if (!plt) return;
    plt.resize();
    var w = plt.w, h = plt.h;
    if (!w || !h) return;
    plt.clear();

    var Temp = gT(), n = gn() * 1e25;
    var p = n * C.kB * Temp;                        // p = n k_B T
    var vrms = T.vrms(MOL, Temp);
    var ke = 1.5 * C.kB * Temp;

    var pad = 56, top = 42, bot = h - 40, x0 = pad, x1 = w - pad;
    var bw = x1 - x0, bh = bot - top;

    /* 容器 */
    plt.rect(x0, top, bw, bh, { stroke: '#45506b', width: 2 });

    /* 分子（数量随数密度变化，速度 ∝ √T） */
    var count = Math.max(4, Math.min(24, Math.round(gn() * 5)));
    ensure(count);
    var t = time || 0;
    var speed = 70 * Math.sqrt(Temp / 300);         // px/s
    for (var i = 0; i < mols.length; i++) {
      var mo = mols[i];
      var x = reflect(mo.x0 + mo.dx * speed * t / bw);
      var y = reflect(mo.y0 + mo.dy * speed * t / bh);
      plt.dot(x0 + x * bw, top + y * bh, 3, { fill: '#4cc9f0' });
    }

    plt.label('理想气体分子运动（速度 ∝ √T）', pad, 22, { fill: '#dbe4f5', font: '12.5px ' + SR.FONT });

    SR.setText('gas-p', (p / 1000).toFixed(1) + ' kPa');
    SR.setText('gas-vrms', vrms.toFixed(0) + ' m/s');
    SR.setText('gas-ke', (ke / C.e * 1000).toFixed(2) + ' meV（(3/2)kT）');
  }

  LAB.modules.idealgas = { init: init, render: render };
})();
