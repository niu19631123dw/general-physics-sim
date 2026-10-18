/* =============================================================================
 * gp.js — 普通物理·课本仿真 公式库（本科生普通物理教材五卷）
 * -----------------------------------------------------------------------------
 * 力学 / 热学 / 电磁学 / 光学 / 近代物理。
 * 纯函数、无 DOM 依赖，供各主题模块与 verify-gp-*.js 共用。国际单位制。
 * ============================================================================= */
window.GP = window.GP || {};
window.LAB = window.LAB || {};

(function () {
  'use strict';
  var PI = Math.PI;

  /* ============================ 物理常数 ============================ */
  var G0 = 9.80665;
  var R_GAS = 8.314462618;
  var E_CHARGE = 1.602176634e-19;
  var H_PLANCK = 6.62607015e-34;
  var HBAR = 1.054571817e-34;
  var C_LIGHT = 2.99792458e8;
  var K_BOLTZ = 1.380649e-23;
  var R_RYDBERG = 1.0973731568160e7;
  var K_E = 8.9875517923e9;
  var EPS0 = 8.8541878128e-12;
  var MU0 = 4e-7 * PI;
  var M_ELEC = 9.1093837015e-31;
  var SIGMA_SB = 5.670374419e-8;
  var B_WIEN = 2.897771955e-3;

  /* ============================ 数值方法 ============================ */

  function rk4Step(f, t, y, h) {
    var n = y.length, i;
    var k1 = f(t, y);
    var y2 = new Array(n), y3 = new Array(n), y4 = new Array(n);
    for (i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k1[i];
    var k2 = f(t + 0.5 * h, y2);
    for (i = 0; i < n; i++) y3[i] = y[i] + 0.5 * h * k2[i];
    var k3 = f(t + 0.5 * h, y3);
    for (i = 0; i < n; i++) y4[i] = y[i] + h * k3[i];
    var k4 = f(t + h, y4);
    var out = new Array(n);
    for (i = 0; i < n; i++) out[i] = y[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
  }
  function trapezoid(f, a, b, n) {
    var h = (b - a) / n, s = 0.5 * (f(a) + f(b));
    for (var i = 1; i < n; i++) s += f(a + i * h);
    return s * h;
  }
  function linearFit(xs, ys) {
    var n = xs.length;
    if (n < 2) return { a: NaN, b: NaN, r2: NaN };
    var sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
    for (var i = 0; i < n; i++) {
      sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i];
    }
    var den = n * sxx - sx * sx;
    var b = (n * sxy - sx * sy) / den;
    var a = (sy - b * sx) / n;
    var r2 = Math.pow(n * sxy - sx * sy, 2) / ((n * sxx - sx * sx) * (n * syy - sy * sy));
    return { a: a, b: b, r2: r2 };
  }
  function sinc(x) { return Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x; }
  function deg(r) { return r * 180 / PI; }
  function rad(d) { return d * PI / 180; }

  /* ============================ 第一卷 力学 ============================ */

  /* 抛体运动 */
  function range(v0, th, g) { return v0 * v0 * Math.sin(2 * th) / g; }
  function maxHeight(v0, th, g) { var s = Math.sin(th); return v0 * v0 * s * s / (2 * g); }
  function flightTime(v0, th, g) { return 2 * v0 * Math.sin(th) / g; }

  /* 简谐振动 */
  function shmOmega(k, m) { return Math.sqrt(k / m); }
  function shmPeriod(k, m) { return 2 * PI * Math.sqrt(m / k); }
  function shmPos(A, w, t, ph) { return A * Math.cos(w * t + ph); }
  function shmVel(A, w, t, ph) { return -A * w * Math.sin(w * t + ph); }
  function shmEnergy(k, A) { return 0.5 * k * A * A; }

  /* 阻尼与受迫 */
  function dampedOmega(w0, gamma) { var x = w0 * w0 - gamma * gamma / 4; return x > 0 ? Math.sqrt(x) : 0; }
  function forcedAmp(F0, m, w0, gamma, w) {
    var a = w0 * w0 - w * w;
    return (F0 / m) / Math.sqrt(a * a + gamma * gamma * w * w);
  }
  function resonanceOmega(w0, gamma) { var x = w0 * w0 - gamma * gamma / 2; return x > 0 ? Math.sqrt(x) : 0; }
  function qualityFactor(w0, gamma) { return w0 / gamma; }

  /* 机械波 */
  function stringSpeed(T, mu) { return Math.sqrt(T / mu); }
  function standingWavelength(L, n) { return 2 * L / n; }
  function standingFreq(v, L, n) { return n * v / (2 * L); }
  function doppler(f, v, vObs, vSrc) { return f * (v + vObs) / (v - vSrc); }
  function beat(f1, f2) { return Math.abs(f1 - f2); }

  /* 碰撞（一维弹性） */
  function elasticV1(m1, m2, v1, v2) { return ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2); }
  function elasticV2(m1, m2, v1, v2) { return ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2); }
  function momentum(m, v) { return m * v; }
  function kinetic(m, v) { return 0.5 * m * v * v; }

  /* 角动量守恒（开普勒第二定律） */
  function angularMomentum(I, w) { return I * w; }
  function orbitalArealVelocity(L, m) { return L / (2 * m); }

  /* 刚体 */
  function diskI(m, R) { return 0.5 * m * R * R; }
  function sphereI(m, R) { return 0.4 * m * R * R; }
  function rodI(m, L) { return m * L * L / 12; }
  function rigidI(base, m, r) { return base + 2 * m * r * r; }
  function rotKE(I, w) { return 0.5 * I * w * w; }
  function omegaFromL(L, I) { return L / I; }
  function precession(m, g, R, I, w) { return m * g * R / (I * w); }
  /** 常见刚体定轴转动的转动惯量（rod 取长度 2R、绕中心轴 → mR²/3） */
  function shapeI(shape, m, R) {
    if (shape === 'ring') return m * R * R;
    if (shape === 'sphere') return 0.4 * m * R * R;
    if (shape === 'rod') return m * R * R / 3;
    return 0.5 * m * R * R;          // disk / cylinder
  }
  /** 纯滚动的 k = I/(mR²)：球 0.4、圆柱 0.5、圆环 1 */
  function kRoll(shape) { return shape === 'sphere' ? 0.4 : (shape === 'ring' ? 1 : 0.5); }
  /** 纯滚动沿斜面加速度 a = g sinθ/(1+k) */
  function rollingAccel(theta, k) { return 9.8 * Math.sin(theta) / (1 + k); }
  /** 纯滚动由机械能守恒得末速度 v = √(2gh/(1+k)) */
  function rollingV(h, k) { return Math.sqrt(2 * 9.8 * h / (1 + k)); }
  /** 转动定律 β = M/I */
  function angularAccel(tau, I) { return tau / I; }
  /** 复摆（物理摆）周期 T = 2π√(I/(m g d)) */
  function physicalPendulumPeriod(I, m, g, d) { return 2 * Math.PI * Math.sqrt(I / (m * g * d)); }

  /* ============================ 第二卷 热学 ============================ */

  function idealGasP(n, T, V) { return n * R_GAS * T / V; }
  function isothermalWork(n, T, V1, V2) { return n * R_GAS * T * Math.log(V2 / V1); }
  function adiabaticP(p1, V1, V2, gamma) { return p1 * Math.pow(V1 / V2, gamma); }
  function adiabaticWork(p1, V1, p2, V2, gamma) { return (p1 * V1 - p2 * V2) / (gamma - 1); }
  function isobaricWork(p, V1, V2) { return p * (V2 - V1); }
  function internalEnergy(f, n, T) { return 0.5 * f * n * R_GAS * T; }
  function carnotEta(Tc, Th) { return 1 - Tc / Th; }
  function entropyIsothermal(Q, T) { return Q / T; }

  /* 麦克斯韦速率分布 */
  function maxwellF(v, m, T) {
    var a = m / (2 * K_BOLTZ * T);
    return 4 * PI * Math.pow(a / PI, 1.5) * v * v * Math.exp(-a * v * v);
  }
  function mostProbable(m, T) { return Math.sqrt(2 * K_BOLTZ * T / m); }
  function meanSpeed(m, T) { return Math.sqrt(8 * K_BOLTZ * T / (PI * m)); }
  function rmsSpeed(m, T) { return Math.sqrt(3 * K_BOLTZ * T / m); }

  /* 能量均分 */
  function equipartitionU(f, n, T) { return 0.5 * f * n * R_GAS * T; }
  function cvFromDOF(f) { return 0.5 * f * R_GAS; }
  function gammaFromDOF(f) { return (f + 2) / f; }

  /* ============================ 第三卷 电磁学 ============================ */

  function pointE(q, r) { return K_E * q / (r * r); }
  function pointV(q, r) { return K_E * q / r; }
  function plateE(sigma) { return sigma / EPS0; }
  function lineE(lambda, r) { return lambda / (2 * PI * EPS0 * r); }
  function gaussFlux(Qenc) { return Qenc / EPS0; }

  /* 毕奥-萨伐尔 / 安培 */
  function wireB(I, r) { return MU0 * I / (2 * PI * r); }
  function loopCenterB(I, R) { return MU0 * I / (2 * R); }
  function solenoidB(n, I) { return MU0 * n * I; }

  /* 洛伦兹力 */
  function cyclotronRadius(m, v, q, B) { return m * v / (Math.abs(q) * B); }
  function cyclotronOmega(q, B, m) { return Math.abs(q) * B / m; }
  function exbDrift(E, B) { return E / B; }

  /* 电磁感应 */
  function flux(B, A, th) { return B * A * Math.cos(th); }
  function peakEmf(N, B, A, w) { return N * B * A * w; }
  function motionalEmf(B, L, v) { return B * L * v; }

  /* 电磁波 */
  function emWaveE(B) { return B * C_LIGHT; }
  function emWaveB(E) { return E / C_LIGHT; }
  function cFromConstants() { return 1 / Math.sqrt(MU0 * EPS0); }
  function poynting(E, B) { return E * B / MU0; }

  /* ============================ 第四卷 光学 ============================ */

  function snell(n1, th1, n2) {
    var s = n1 * Math.sin(th1) / n2;
    return Math.abs(s) > 1 ? NaN : Math.asin(s);
  }
  function brewster(n1, n2) { return Math.atan(n2 / n1); }
  function criticalAngle(n1, n2) { var s = n2 / n1; return s >= 1 ? NaN : Math.asin(s); }
  function lensImage(f, u) { if (Math.abs(u - f) < 1e-12) return Infinity; return 1 / (1 / f - 1 / u); }
  function lensMag(f, u) { return -lensImage(f, u) / u; }

  /* 干涉衍射偏振 */
  function doubleSlitI(d, lam, th) { var c = Math.cos(PI * d * Math.sin(th) / lam); return c * c; }
  function singleSlitI(a, lam, th) { var s = sinc(PI * a * Math.sin(th) / lam); return s * s; }
  function fringeSpacing(lam, L, d) { return lam * L / d; }
  function gratingEq(d, th, k) { return d * Math.sin(th) / k; }
  function gratingResolvePower(k, N) { return k * N; }
  function malus(I0, th) { var c = Math.cos(th); return I0 * c * c; }
  function rayleigh(lam, D) { return 1.22 * lam / D; }

  /* 薄膜干涉（等厚/牛顿环） */
  function newtonRingDark(k, lam, R) { return Math.sqrt(k * lam * R); }
  function newtonRingBright(k, lam, R) { return Math.sqrt((k - 0.5) * lam * R); }

  /* ============================ 第五卷 近代物理 ============================ */

  /* 黑体辐射 */
  function planckM(lam, T) {
    var x = H_PLANCK * C_LIGHT / (lam * K_BOLTZ * T);
    if (x > 700) return 0;
    return (2 * PI * H_PLANCK * C_LIGHT * C_LIGHT / Math.pow(lam, 5)) / (Math.exp(x) - 1);
  }
  function wienLambda(T) { return B_WIEN / T; }
  function stefanBoltzmann(T) { return SIGMA_SB * Math.pow(T, 4); }

  /* 光电效应 */
  function stoppingVoltage(h, nu, W) { return (h * nu - W) / E_CHARGE; }
  function thresholdFreq(W, h) { return W / h; }

  /* 康普顿散射 */
  function comptonShift(th) {
    var lc = H_PLANCK / (M_ELEC * C_LIGHT);
    return lc * (1 - Math.cos(th));
  }
  function comptonWavelength() { return H_PLANCK / (M_ELEC * C_LIGHT); }

  /* 玻尔氢原子 */
  function bohrLevel(n) { return -13.605693 / (n * n); }
  function rydbergWavenumber(n1, n2, R) { return R * (1 / (n1 * n1) - 1 / (n2 * n2)); }
  function spectralWavelength(n1, n2, R) { return 1 / rydbergWavenumber(n1, n2, R); }

  /* 德布罗意物质波 */
  function deBroglie(m, v) { return H_PLANCK / (m * v); }
  function deBroglieFromE(KE) { return H_PLANCK / Math.sqrt(2 * M_ELEC * KE); }

  /* 不确定原理 */
  function uncertaintyDeltaP(deltaX) { return HBAR / (2 * deltaX); }

  /* 一维无限深势阱 */
  function wellLevel(n, a, m) { return n * n * PI * PI * HBAR * HBAR / (2 * m * a * a); }
  function wellPsi(n, a, x) { return Math.sqrt(2 / a) * Math.sin(n * PI * x / a); }

  /* ============================ 导出 ============================ */
  GP.const = {
    g: G0, R: R_GAS, e: E_CHARGE, h: H_PLANCK, hbar: HBAR, c: C_LIGHT,
    kB: K_BOLTZ, rydberg: R_RYDBERG, ke: K_E, eps0: EPS0, mu0: MU0,
    me: M_ELEC, sigma: SIGMA_SB, bWien: B_WIEN
  };
  GP.num = { rk4Step: rk4Step, trapezoid: trapezoid, linearFit: linearFit, sinc: sinc };
  GP.deg = deg; GP.rad = rad;

  GP.mech = {
    range: range, maxHeight: maxHeight, flightTime: flightTime,
    omega: shmOmega, period: shmPeriod, pos: shmPos, vel: shmVel, energy: shmEnergy,
    dampedOmega: dampedOmega, forcedAmp: forcedAmp, resonanceOmega: resonanceOmega, Q: qualityFactor,
    waveSpeed: stringSpeed, standingLambda: standingWavelength, standingFreq: standingFreq,
    doppler: doppler, beat: beat,
    elasticV1: elasticV1, elasticV2: elasticV2, momentum: momentum, kinetic: kinetic,
    L: angularMomentum, arealVelocity: orbitalArealVelocity,
    diskI: diskI, sphereI: sphereI, rodI: rodI,
    rigidI: rigidI, rotKE: rotKE, omegaFromL: omegaFromL, precession: precession,
    shapeI: shapeI, kRoll: kRoll, rollingAccel: rollingAccel, rollingV: rollingV, angularAccel: angularAccel,
    physPendulum: physicalPendulumPeriod
  };
  GP.thermo = {
    p: idealGasP, wIsothermal: isothermalWork, pAdiabatic: adiabaticP, wAdiabatic: adiabaticWork,
    wIsobaric: isobaricWork, U: internalEnergy, carnotEta: carnotEta, entropy: entropyIsothermal,
    maxwellF: maxwellF, vp: mostProbable, vavg: meanSpeed, vrms: rmsSpeed,
    equipU: equipartitionU, cv: cvFromDOF, gammaFromDOF: gammaFromDOF
  };
  GP.em = {
    pointE: pointE, pointV: pointV, plateE: plateE, lineE: lineE, flux: gaussFlux,
    wireB: wireB, loopB: loopCenterB, solenoidB: solenoidB,
    cyclotronRadius: cyclotronRadius, cyclotronOmega: cyclotronOmega, exbDrift: exbDrift,
    flux_: flux, peakEmf: peakEmf, motionalEmf: motionalEmf,
    emE: emWaveE, emB: emWaveB, c: cFromConstants, poynting: poynting
  };
  GP.optics = {
    snell: snell, brewster: brewster, critical: criticalAngle, lens: lensImage, mag: lensMag,
    doubleSlit: doubleSlitI, singleSlit: singleSlitI, fringe: fringeSpacing,
    gratingWavelength: gratingEq, resolvePower: gratingResolvePower, malus: malus, rayleigh: rayleigh,
    ringDark: newtonRingDark, ringBright: newtonRingBright
  };
  GP.modern = {
    planck: planckM, wien: wienLambda, stefanBoltzmann: stefanBoltzmann,
    stopping: stoppingVoltage, threshold: thresholdFreq,
    comptonShift: comptonShift, comptonWavelength: comptonWavelength,
    level: bohrLevel, wavenumber: rydbergWavenumber, wavelength: spectralWavelength,
    deBroglie: deBroglie, deBroglieFromE: deBroglieFromE,
    uncertainty: uncertaintyDeltaP, wellLevel: wellLevel, wellPsi: wellPsi
  };
})();
