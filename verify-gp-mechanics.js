/* 力学卷核对 */
global.window = global;
require('./js/gp.js');
var G = GP;
var pass = 0, fail = 0;
function check(n, c, d) { if (c) pass++; else { fail++; console.log('FAIL: ' + n + (d === undefined ? '' : '   → ' + d)); } }
function approx(a, b, t) { if (!isFinite(a) || !isFinite(b)) return false; var tol = t === undefined ? 1e-9 : t; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
function section(t) { console.log('\n— ' + t); }

section('0. 数值方法');
check('梯形法 ∫₀¹x²dx=1/3', approx(G.num.trapezoid(function (x) { return x * x; }, 0, 1, 10000), 1 / 3, 1e-6));
var fit = G.num.linearFit([0, 1, 2, 3, 4], [0, 2, 4, 6, 8]);
check('最小二乘 y=2x：斜率=2', approx(fit.b, 2));
check('最小二乘 y=2x：截距=0', approx(fit.a, 0));
check('最小二乘 y=2x：r²=1', approx(fit.r2, 1));
check('sinc(0)=1', approx(G.num.sinc(0), 1));

section('1. 抛体运动');
check('射程 R = v₀²sin2θ/g', approx(G.mech.range(20, Math.PI / 4, 10), 40));
check('最大高度 H = v₀²sin²θ/2g', approx(G.mech.maxHeight(20, Math.PI / 6, 10), 5));
check('飞行时间 T = 2v₀sinθ/g', approx(G.mech.flightTime(20, Math.PI / 6, 10), 2));

section('2. 简谐振动');
check('ω = √(k/m)', approx(G.mech.omega(4, 1), 2));
check('T = 2π√(m/k)', approx(G.mech.period(4, 1), Math.PI));
check('x(t) = A cos(ωt+φ)，t=0 → A cosφ', approx(G.mech.pos(1, 2, 0, 0), 1));
check('能量 E = ½kA²', approx(G.mech.energy(4, 2), 8));

section('3. 阻尼与受迫共振');
check('阻尼 ω_d = √(ω₀²−γ²/4)', approx(G.mech.dampedOmega(2, 1), Math.sqrt(3.75)));
check('过阻尼 ω_d=0', G.mech.dampedOmega(1, 5) === 0);
check('受迫 A(0)=F₀/(mω₀²)', approx(G.mech.forcedAmp(1, 1, 2, 0.3, 0), 0.25));
check('共振 ω_res=√(ω₀²−γ²/2)', approx(G.mech.resonanceOmega(2, 0.5), Math.sqrt(3.875)));
check('Q = ω₀/γ', approx(G.mech.Q(2, 0.5), 4));

section('4. 机械波与多普勒');
check('弦速 v=√(T/μ)', approx(G.mech.waveSpeed(100, 0.01), 100));
check('驻波 λ=2L/n', approx(G.mech.standingLambda(1, 2), 1));
check('驻波 f=nv/2L', approx(G.mech.standingFreq(2, 1, 3), 3));
check('多普勒源靠近 f′=fv/(v−vs)', approx(G.mech.doppler(1, 1, 0, 0.5), 2));
check('拍频=|f₁−f₂|', approx(G.mech.beat(440, 442), 2));

section('5. 碰撞与动量');
check('等质量弹性碰撞交换速度', approx(G.mech.elasticV1(1, 1, 2, 0), 0) && approx(G.mech.elasticV2(1, 1, 2, 0), 2));
check('动量守恒 m₁v₁+m₂v₂ = m₁v₁′+m₂v₂′', approx(G.mech.momentum(1, 2) + G.mech.momentum(2, 1), G.mech.momentum(1, G.mech.elasticV1(1, 2, 2, 1)) + G.mech.momentum(2, G.mech.elasticV2(1, 2, 2, 1))));
check('动能 ½mv²', approx(G.mech.kinetic(2, 3), 9));

section('6. 角动量与刚体');
check('L = Iω', approx(G.mech.L(2, 3), 6));
check('圆盘 I=½mR²', approx(G.mech.diskI(2, 0.1), 0.01));
check('球体 I=2/5 mR²', approx(G.mech.sphereI(5, 1), 2));
check('细杆 I=mL²/12', approx(G.mech.rodI(6, 2), 2));
check('I = I₀+2mr²', approx(G.mech.rigidI(0.5, 0.5, 1), 1.5));
check('ω = L/I', approx(G.mech.omegaFromL(1.5, 0.5), 3));
check('转动动能 ½Iω²', approx(G.mech.rotKE(2, 3), 9));
check('陀螺进动 Ω=mgR/(Iω)', approx(G.mech.precession(1, 9.8, 0.2, 0.5, 60), 1 * 9.8 * 0.2 / (0.5 * 60)));

section('6b. 刚体定轴转动与纯滚动');
check('圆盘 I=½mR²', approx(G.mech.shapeI('disk', 2, 0.1), 0.01));
check('圆环 I=mR²', approx(G.mech.shapeI('ring', 2, 0.1), 0.02));
check('球 I=(2/5)mR²', approx(G.mech.shapeI('sphere', 5, 1), 2));
check('细杆（绕中心）I=mR²/3', approx(G.mech.shapeI('rod', 3, 1), 1));
check('转动定律 β=M/I', approx(G.mech.angularAccel(2, 4), 0.5));
check('纯滚动 a=g·sinθ/(1+k)（球）', approx(G.mech.rollingAccel(Math.PI / 6, 0.4), 9.8 * 0.5 / 1.4));
check('纯滚动 v=√(2gh/(1+k))（圆柱）', approx(G.mech.rollingV(1, 0.5), Math.sqrt(2 * 9.8 * 1 / 1.5)));
check('k 值：球 0.4 / 圆柱 0.5 / 圆环 1', G.mech.kRoll('sphere') === 0.4 && G.mech.kRoll('cylinder') === 0.5 && G.mech.kRoll('ring') === 1);
check('复摆 T=2π√(I/mgd)（细杆绕端）', approx(G.mech.physPendulum(0.6 * 0.6 / 3, 1, 9.8, 0.3), 2 * Math.PI * Math.sqrt(2 * 0.6 / 3 / 9.8)));

module.exports = { pass: pass, fail: fail };
