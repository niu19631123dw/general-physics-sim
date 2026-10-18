/* 电磁学卷核对 */
global.window = global;
require('./js/gp.js');
var G = GP;
var pass = 0, fail = 0;
function check(n, c, d) { if (c) pass++; else { fail++; console.log('FAIL: ' + n + (d === undefined ? '' : '   → ' + d)); } }
function approx(a, b, t) { if (!isFinite(a) || !isFinite(b)) return false; var tol = t === undefined ? 1e-9 : t; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
function section(t) { console.log('\n— ' + t); }

section('10. 静电场与高斯定理');
check('点电荷 E=kq/r²', approx(G.em.pointE(1e-9, 1), 8.9875517923));
check('点电荷 V=kq/r', approx(G.em.pointV(1e-9, 1), 8.9875517923));
check('平行板 E=σ/ε₀', approx(G.em.plateE(8.8541878128e-12), 1, 1e-6));
check('无限长线 E=λ/(2πε₀r)', approx(G.em.lineE(1e-9, 1), 1e-9 / (2 * Math.PI * 8.8541878128e-12)));
check('高斯通量 Φ=Q/ε₀', approx(G.em.flux(1e-9), 1e-9 / 8.8541878128e-12, 1e-6));

section('11. 磁场（毕奥-萨伐尔/安培）');
check('长直导线 B=μ₀I/2πr', approx(G.em.wireB(2, 0.5), 4e-7 * Math.PI * 2 / (2 * Math.PI * 0.5), 1e-9));
check('圆环中心 B=μ₀I/2R', approx(G.em.loopB(1, 0.1), 4e-7 * Math.PI * 1 / (2 * 0.1), 1e-9));
check('螺线管 B=μ₀nI', approx(G.em.solenoidB(1000, 2), 4e-7 * Math.PI * 1000 * 2, 1e-9));

section('12. 洛伦兹力');
check('回旋半径 r=mv/qB', approx(G.em.cyclotronRadius(1, 2, 1, 1), 2));
check('回旋频率 ω=qB/m', approx(G.em.cyclotronOmega(1, 1, 1), 1));
check('E×B 漂移 v=E/B', approx(G.em.exbDrift(3, 1.5), 2));

section('13. 电磁感应');
check('磁通 Φ=BAcosθ', approx(G.em.flux_(2, 3, 0), 6) && approx(G.em.flux_(2, 3, Math.PI / 2), 0, 1e-12));
check('峰值电动势 ε₀=NBAω', approx(G.em.peakEmf(100, 0.5, 0.01, 100), 50));
check('动生电动势 ε=BLv', approx(G.em.motionalEmf(0.5, 1, 2), 1));

section('14. 电磁波');
check('c = 1/√(μ₀ε₀)', approx(G.em.c(), 2.99792458e8, 1e-4));
check('E = cB', approx(G.em.emE(1), 2.99792458e8));
check('坡印廷矢量 S=EB/μ₀', approx(G.em.poynting(3, 1), 3 / (4e-7 * Math.PI)));

module.exports = { pass: pass, fail: fail };
