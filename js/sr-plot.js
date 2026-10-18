/* =============================================================================
 * sr-plot.js — 相对论模块共用的绘图入口与工具函数
 * -----------------------------------------------------------------------------
 * 合并后全站只有一套 Canvas 引擎：SR.Plot 直接复用 QM.Plot（见 js/plot.js），
 * 这样量子力学与相对论模块共享同一个高 DPI / 响应式实现。
 * 另外提供：SR.tri（三角波）、SR.setText（带缓存的文本写入）、SR.fmt。
 * ============================================================================= */
window.SR = window.SR || {};

SR.Plot = QM.Plot;

SR.FONT = '"Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/* 三角波：周期 2，0 → 1 → 0（光钟里光子的位置） */
SR.tri = function (p) {
  p = ((p % 2) + 2) % 2;
  return p < 1 ? p : 2 - p;
};

/* 文本写入（带缓存，避免每帧触发重排） */
SR._txt = {};
SR.setText = function (id, value) {
  if (SR._txt[id] === value) return;
  SR._txt[id] = value;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

SR.fmt = function (v, n) {
  if (!isFinite(v)) return '∞';
  return v.toFixed(n == null ? 3 : n);
};
