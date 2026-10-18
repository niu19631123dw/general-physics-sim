/* 热学卷核对 */
global.window = global;
require('./js/gp.js');
var G = GP;
var pass = 0, fail = 0;
function check(n, c, d) { if (c) pass++; else { fail++; console.log('FAIL: ' + n + (d === undefined ? '' : '   → ' + d)); } }
function approx(a, b, t) { if (!isFinite(a) || !isFinite(b)) return false; var tol = t === undefined ? 1e-9 : t; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
function section(t) { console.log('\n— ' + t); }
var R = G.const.R;

section('7. 理想气体与第一定律');
check('pV=nRT', approx(G.thermo.p(1, 300, 0.01), R * 300 / 0.01));
check('等温功 W=nRT ln(V₂/V₁)', approx(G.thermo.wIsothermal(1, 300, 0.01, 0.02), R * 300 * Math.log(2)));
check('绝热 p₂=p₁(V₁/V₂)^γ', approx(G.thermo.pAdiabatic(100, 1, 2, 5 / 3), 100 * Math.pow(0.5, 5 / 3)));
check('等压功 W=pΔV', approx(G.thermo.wIsobaric(1000, 0.01, 0.03), 20));
check('内能 U=(f/2)nRT', approx(G.thermo.U(3, 1, 300), 1.5 * R * 300));
check('卡诺效率 η=1−Tc/Th', approx(G.thermo.carnotEta(300, 600), 0.5));
check('等温熵变 ΔS=Q/T', approx(G.thermo.entropy(1000, 500), 2));

section('8. 麦克斯韦速率分布');
var m = 4.65e-26, T = 300;
var vp = G.thermo.vp(m, T), va = G.thermo.vavg(m, T), vr = G.thermo.vrms(m, T);
check('v_p = √(2kT/m)', approx(vp, Math.sqrt(2 * G.const.kB * T / m)));
check('v̄ = √(8kT/πm)', approx(va, Math.sqrt(8 * G.const.kB * T / (Math.PI * m))));
check('v_rms = √(3kT/m)', approx(vr, Math.sqrt(3 * G.const.kB * T / m)));
check('v_p < v̄ < v_rms', vp < va && va < vr);
var norm = G.num.trapezoid(function (v) { return G.thermo.maxwellF(v, m, T); }, 0, 5 * vr, 2000);
check('分布归一化 ∫f dv = 1', approx(norm, 1, 1e-3));

section('9. 能量均分');
check('U = (f/2)nRT', approx(G.thermo.equipU(5, 1, 300), 2.5 * R * 300));
check('C_V = (f/2)R', approx(G.thermo.cv(3), 1.5 * R));
check('单原子 γ=5/3', approx(G.thermo.gammaFromDOF(3), 5 / 3));
check('双原子 γ=7/5', approx(G.thermo.gammaFromDOF(5), 7 / 5));

module.exports = { pass: pass, fail: fail };
