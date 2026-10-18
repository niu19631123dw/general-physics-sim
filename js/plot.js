/* =============================================================================
 * plot.js — 轻量 Canvas 2D 绘图工具（坐标轴、曲线、填充、辅助线）
 * -----------------------------------------------------------------------------
 * QM.Plot：封装一个 <canvas>，负责：
 *   - 高 DPI 适配（devicePixelRatio）与响应式尺寸（ResizeObserver）
 *   - 数据坐标 → 像素坐标的映射（px/py）
 *   - 坐标轴 + 网格 + 刻度（axes）、曲线（curve）、填充（fill）
 * 注意：尺寸变化只读不写 style，避免与 ResizeObserver 形成反馈死循环。
 * ============================================================================= */
window.QM = window.QM || {};

QM.Plot = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.margin = { left: 54, right: 20, top: 16, bottom: 40 };
    this.xMin = -1; this.xMax = 1;
    this.yMin = 0; this.yMax = 1;
    this.xLabel = ''; this.yLabel = '';
    this.logY = false;
    this.onResize = null;
    this._cw = 0; this._ch = 0;
    this._resize();
    const ro = new ResizeObserver(() => this._resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    this._ro = ro;
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    // 只读取布局尺寸，绝不写回 style（写回会因边框差触发 ResizeObserver 死循环）
    const cw = Math.max(1, Math.round(this.canvas.clientWidth));
    const ch = Math.max(1, Math.round(this.canvas.clientHeight));
    // 尺寸未变化时不重设画布（重设 width/height 会清空已绘制内容）
    if (cw === this._cw && ch === this._ch) return;
    this._cw = cw; this._ch = ch;
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = cw; this.height = ch;
    this.w = cw; this.h = ch;          // 相对论模块使用的别名
    if (this.onResize) this.onResize();
  }

  px(x) { return this.margin.left + (x - this.xMin) / (this.xMax - this.xMin) * (this.width - this.margin.left - this.margin.right); }
  py(y) {
    if (this.logY) {
      if (y <= 0) return this.height - this.margin.bottom; // 非正值钳到底部
      const lyMin = Math.log10(this.yMin);
      const lyMax = Math.log10(this.yMax);
      const ly = Math.log10(Math.max(y, this.yMin));
      return this.height - this.margin.bottom - (ly - lyMin) / (lyMax - lyMin) * (this.height - this.margin.top - this.margin.bottom);
    }
    return this.height - this.margin.bottom - (y - this.yMin) / (this.yMax - this.yMin) * (this.height - this.margin.top - this.margin.bottom);
  }

  setRange(xMin, xMax, yMin, yMax) {
    this.xMin = xMin; this.xMax = xMax;
    this.yMin = yMin; this.yMax = yMax;
  }

  /* 切换 y 轴为对数刻度（用于费米/玻色占据数对比） */
  setLogY(v) { this.logY = v; }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  _niceStep(range, target) {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let step;
    if (norm < 1.5) step = 1;
    else if (norm < 3.5) step = 2;
    else if (norm < 7.5) step = 5;
    else step = 10;
    return step * mag;
  }

  axes(opts = {}) {
    const c = this.ctx;
    c.save();
    c.font = '11px "Segoe UI", system-ui, sans-serif';

    // 网格 + 刻度
    c.textAlign = 'right'; c.textBaseline = 'middle';
    if (this.logY) {
      // 对数 y：按数量级（10^k）画网格线
      const kLo = Math.ceil(Math.log10(this.yMin));
      const kHi = Math.floor(Math.log10(this.yMax));
      for (let k = kLo; k <= kHi; k++) {
        const y = Math.pow(10, k);
        const py = this.py(y);
        c.strokeStyle = '#1c2538'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(this.margin.left, py); c.lineTo(this.width - this.margin.right, py); c.stroke();
        c.fillStyle = '#7b89a6';
        c.fillText(this._fmt(y), this.margin.left - 6, py);
      }
    } else {
      const yStep = this._niceStep(this.yMax - this.yMin, 5);
      let y0 = Math.ceil(this.yMin / yStep) * yStep;
      for (let y = y0; y <= this.yMax + 1e-12; y += yStep) {
        const py = this.py(y);
        c.strokeStyle = '#1c2538'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(this.margin.left, py); c.lineTo(this.width - this.margin.right, py); c.stroke();
        c.fillStyle = '#7b89a6';
        c.fillText(this._fmt(y), this.margin.left - 6, py);
      }
    }

    const xStep = this._niceStep(this.xMax - this.xMin, 6);
    let x0 = Math.ceil(this.xMin / xStep) * xStep;
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (let x = x0; x <= this.xMax + 1e-12; x += xStep) {
      const px = this.px(x);
      c.strokeStyle = '#1c2538';
      c.beginPath(); c.moveTo(px, this.margin.top); c.lineTo(px, this.height - this.margin.bottom); c.stroke();
      c.fillStyle = '#7b89a6';
      c.fillText(this._fmt(x), px, this.height - this.margin.bottom + 6);
    }

    // 坐标轴（若 0 在范围内则加粗轴线）
    c.strokeStyle = '#45506b'; c.lineWidth = 1.2;
    if (this.yMin <= 0 && this.yMax >= 0) {
      c.beginPath(); c.moveTo(this.margin.left, this.py(0)); c.lineTo(this.width - this.margin.right, this.py(0)); c.stroke();
    }
    if (this.xMin <= 0 && this.xMax >= 0) {
      c.beginPath(); c.moveTo(this.px(0), this.margin.top); c.lineTo(this.px(0), this.height - this.margin.bottom); c.stroke();
    }

    // 轴标签
    c.fillStyle = '#9aa8c4';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    if (this.xLabel) c.fillText(this.xLabel, (this.margin.left + this.width - this.margin.right) / 2, this.height - 8);
    if (this.yLabel) {
      c.save();
      c.translate(14, (this.margin.top + this.height - this.margin.bottom) / 2);
      c.rotate(-Math.PI / 2);
      c.fillText(this.yLabel, 0, 0);
      c.restore();
    }
    c.restore();
  }

  _fmt(v) {
    const a = Math.abs(v);
    if (a !== 0 && (a >= 10000 || a < 0.001)) return v.toExponential(1);
    return parseFloat(v.toPrecision(4)).toString();
  }

  /* 绘制曲线 */
  curve(xs, ys, color, width = 2, dash = null) {
    const c = this.ctx;
    c.save();
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineJoin = 'round';
    if (dash) c.setLineDash(dash);
    c.beginPath();
    let started = false;
    for (let i = 0; i < xs.length; i++) {
      const x = this.px(xs[i]);
      const y = this.py(ys[i]);
      if (!isFinite(x) || !isFinite(y)) { started = false; continue; }
      if (!started) { c.moveTo(x, y); started = true; }
      else c.lineTo(x, y);
    }
    c.stroke();
    c.restore();
  }

  /* 填充到基线 yBase（默认 0） */
  fill(xs, ys, color, yBase = 0, alpha = 0.28) {
    const c = this.ctx;
    c.save();
    c.beginPath();
    const baseY = this.py(yBase);
    let started = false;
    for (let i = 0; i < xs.length; i++) {
      const x = this.px(xs[i]);
      const y = this.py(ys[i]);
      if (!isFinite(x) || !isFinite(y)) { started = false; continue; }
      if (!started) { c.moveTo(x, y); started = true; }
      else c.lineTo(x, y);
    }
    // 反向回到基线
    for (let i = xs.length - 1; i >= 0; i--) {
      const x = this.px(xs[i]);
      if (isFinite(x)) c.lineTo(x, baseY);
    }
    c.closePath();
    c.fillStyle = this._rgba(color, alpha);
    c.fill();
    c.restore();
  }

  hline(y, color, width = 1.2, dash = [5, 4]) {
    const c = this.ctx;
    c.save();
    c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash);
    c.beginPath();
    c.moveTo(this.margin.left, this.py(y));
    c.lineTo(this.width - this.margin.right, this.py(y));
    c.stroke();
    c.restore();
  }

  vline(x, color, width = 1.2, dash = [5, 4]) {
    const c = this.ctx;
    c.save();
    c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash);
    c.beginPath();
    c.moveTo(this.px(x), this.margin.top);
    c.lineTo(this.px(x), this.height - this.margin.bottom);
    c.stroke();
    c.restore();
  }

  text(x, y, str, color = '#dbe4f5', size = 13, align = 'left') {
    const c = this.ctx;
    c.save();
    c.fillStyle = color;
    c.font = size + 'px "Segoe UI", system-ui, sans-serif';
    c.textAlign = align; c.textBaseline = 'middle';
    c.fillText(str, x, y);
    c.restore();
  }

  /* =====================================================================
   * 以下图元供相对论 / 电动力学 / 广义相对论模块使用（SR.Plot === QM.Plot）。
   * 注意 label(str, x, y, style) 与上面的 text(x, y, str, ...) 参数顺序不同：
   * 两套模块各自独立开发，保留两个名字以免互相破坏。
   * ===================================================================== */
  resize() { this._resize(); }

  style(st) {
    const c = this.ctx;
    st = st || {};
    c.setLineDash(st.dash || []);
    c.strokeStyle = st.stroke || '#8fb8ff';
    c.fillStyle = st.fill || st.stroke || '#8fb8ff';
    c.lineWidth = st.width == null ? 1 : st.width;
    c.font = st.font || ('13px "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif');
    c.textAlign = st.align || 'left';
    c.textBaseline = st.baseline || 'alphabetic';
    c.globalAlpha = st.alpha == null ? 1 : st.alpha;
    c.lineCap = 'round';
    c.lineJoin = 'round';
  }

  line(x1, y1, x2, y2, st) {
    const c = this.ctx;
    this.style(st);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }

  path(pts, st, close) {
    if (!pts || pts.length < 2) return;
    const c = this.ctx;
    this.style(st);
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    if (close) c.closePath();
    if (st && st.fill) c.fill();
    c.stroke();
  }

  arrow(x1, y1, x2, y2, st) {
    const c = this.ctx;
    this.style(st);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    const head = (st && st.head) || 8;
    const a = Math.atan2(y2 - y1, x2 - x1);
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
    c.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
    c.closePath();
    c.fill();
  }

  dot(x, y, r, st) {
    const c = this.ctx;
    this.style(st);
    c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); c.fill();
  }

  ring(x, y, r, st) {
    const c = this.ctx;
    this.style(st);
    c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); c.stroke();
  }

  label(str, x, y, st) {
    const c = this.ctx;
    this.style(st);
    c.fillText(str, x, y);
  }

  rect(x, y, w, h, st) {
    const c = this.ctx;
    this.style(st);
    c.beginPath();
    if (st && st.radius) {
      const r = Math.min(st.radius, Math.abs(w) / 2, Math.abs(h) / 2);
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    } else {
      c.rect(x, y, w, h);
    }
    if (st && st.fill) { c.fill(); if (st.stroke) c.stroke(); }
    else c.stroke();
  }

  _rgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
};
