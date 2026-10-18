/* 光学卷核对 */
global.window = global;
require('./js/gp.js');
var G = GP;
var pass = 0, fail = 0;
function check(n, c, d) { if (c) pass++; else { fail++; console.log('FAIL: ' + n + (d === undefined ? '' : '   → ' + d)); } }
function approx(a, b, t) { if (!isFinite(a) || !isFinite(b)) return false; var tol = t === undefined ? 1e-9 : t; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
function section(t) { console.log('\n— ' + t); }

section('15. 几何光学');
check('斯涅尔往返自洽', approx(G.optics.snell(1.5, G.optics.snell(1, 0.5, 1.5), 1), 0.5, 1e-9));
check('布儒斯特角 tanθB=n₂/n₁', approx(Math.tan(G.optics.brewster(1, 1.5)), 1.5));
check('临界角（水→空气）≈48.6°', approx(G.optics.critical(1.33, 1), 0.8508, 1e-3));
check('透镜 1/f=1/u+1/v（u=2f→v=2f）', approx(G.optics.lens(0.1, 0.2), 0.2));
check('放大率 m=−v/u', approx(G.optics.mag(0.1, 1), -G.optics.lens(0.1, 1)));

section('16. 干涉衍射偏振');
check('双缝中心亮纹', approx(G.optics.doubleSlit(0.5e-3, 550e-9, 0), 1));
check('条纹间距 Δy=λL/d', approx(G.optics.fringe(550e-9, 1, 0.5e-3), 550e-9 / 0.5e-3));
check('单缝第一暗纹 sinθ=λ/a', approx(G.optics.singleSlit(0.1e-3, 550e-9, Math.asin(550e-9 / 0.1e-3)), 0, 1e-6));
check('光栅 d sinθ=kλ', approx(G.optics.gratingWavelength(1e-6, Math.asin(0.55), 1), 550e-9));
check('分辨本领 R=kN', approx(G.optics.resolvePower(2, 5000), 10000));
check('马吕斯 θ=45° 半透', approx(G.optics.malus(1, Math.PI / 4), 0.5));
check('瑞利判据 θ=1.22λ/D', approx(G.optics.rayleigh(550e-9, 0.1), 1.22 * 550e-9 / 0.1));

section('17. 薄膜干涉/牛顿环');
check('牛顿环暗环 r_k²=kλR', approx(G.optics.ringDark(5, 589e-9, 1.5), Math.sqrt(5 * 589e-9 * 1.5)));
check('牛顿环亮环 r_k²=(k−½)λR', approx(G.optics.ringBright(5, 589e-9, 1.5), Math.sqrt(4.5 * 589e-9 * 1.5)));

module.exports = { pass: pass, fail: fail };
