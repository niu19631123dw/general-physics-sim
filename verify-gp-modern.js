/* 近代物理卷核对 */
global.window = global;
require('./js/gp.js');
var G = GP;
var pass = 0, fail = 0;
function check(n, c, d) { if (c) pass++; else { fail++; console.log('FAIL: ' + n + (d === undefined ? '' : '   → ' + d)); } }
function approx(a, b, t) { if (!isFinite(a) || !isFinite(b)) return false; var tol = t === undefined ? 1e-9 : t; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
function section(t) { console.log('\n— ' + t); }

section('18. 黑体辐射');
var T = 4000;
var lamMax = G.modern.wien(T);
check('维恩位移 λmax=b/T', approx(lamMax, 2.897771955e-3 / T));
// 数值扫描验证普朗克峰值在维恩位移附近（差值 < 10%）
var peak = 0, peakLam = 0;
for (var i = 0; i <= 2000; i++) {
  var l = 100e-9 + (4000e-9 - 100e-9) * i / 2000;
  var v = G.modern.planck(l, T);
  if (v > peak) { peak = v; peakLam = l; }
}
check('普朗克数值峰值 ≈ 维恩位移', approx(peakLam, lamMax, 0.1));
check('斯特藩-玻尔兹曼 M=σT⁴', approx(G.modern.stefanBoltzmann(1000), 5.670374419e-8 * 1e12));

section('19. 光电效应');
check('U_s=(hν−W)/e', approx(G.modern.stopping(6.62607015e-34, 1e15, 4.3 * 1.602176634e-19), (6.62607015e-34 * 1e15 - 4.3 * 1.602176634e-19) / 1.602176634e-19));
check('截止频率 ν₀=W/h', approx(G.modern.threshold(4.3 * 1.602176634e-19, 6.62607015e-34), 4.3 * 1.602176634e-19 / 6.62607015e-34));

section('20. 康普顿散射');
var lc = 6.62607015e-34 / (9.1093837015e-31 * 2.99792458e8);
check('康普顿波长 λc=h/mc', approx(G.modern.comptonWavelength(), lc));
check('θ=90° 偏移 = λc', approx(G.modern.comptonShift(Math.PI / 2), lc, 1e-9));
check('θ=180° 偏移 = 2λc', approx(G.modern.comptonShift(Math.PI), 2 * lc, 1e-9));

section('21. 玻尔氢原子');
check('能级 E₁=−13.6 eV', approx(G.modern.level(1), -13.605693, 1e-6));
check('能级 E₂=−3.4 eV', approx(G.modern.level(2), -13.605693 / 4, 1e-6));
check('Hα（3→2）≈656.3 nm', approx(G.modern.wavelength(2, 3, 1.0973731568160e7), 656.28e-9, 1e-3));
check('波数 1/λ=R(1/n₁²−1/n₂²)', approx(G.modern.wavenumber(2, 3, 1.0973731568160e7), 1.0973731568160e7 * (1 / 4 - 1 / 9)));

section('22. 德布罗意与不确定原理');
check('λ=h/mv', approx(G.modern.deBroglie(9.1093837015e-31, 1e6), 6.62607015e-34 / (9.1093837015e-31 * 1e6)));
check('Δp=ħ/2Δx', approx(G.modern.uncertainty(1e-10), 1.054571817e-34 / (2e-10)));

section('23. 一维无限深势阱');
var a = 1e-9, m = 9.1093837015e-31;
var E1 = G.modern.wellLevel(1, a, m);
check('E_n ∝ n²', approx(G.modern.wellLevel(2, a, m) / E1, 4));
check('E₁ = π²ħ²/(2ma²)', approx(E1, Math.PI * Math.PI * 1.054571817e-34 * 1.054571817e-34 / (2 * m * a * a)));
check('ψₙ 边界为零 ψ(0)=ψ(a)=0', approx(G.modern.wellPsi(1, a, 0), 0, 1e-9) && Math.abs(G.modern.wellPsi(1, a, a)) < 1e-9);
var nrm = G.num.trapezoid(function (x) { var p = G.modern.wellPsi(1, a, x); return p * p; }, 0, a, 2000);
check('ψ 归一化 ∫|ψ|²dx=1', approx(nrm, 1, 1e-3));

module.exports = { pass: pass, fail: fail };
