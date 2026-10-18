/* =============================================================================
 * main.js — 普通物理·课本仿真 外壳：导航 + 统一动画主循环
 * 所有主题模块（LAB.modules.*）均为实时模块，由主循环每帧传入 (time, dt)。
 * ============================================================================= */
window.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var state = LAB.state = { time: 0, playing: true, rate: 1 };
  var speedEl = document.getElementById('g-speed'), speedOut = document.getElementById('g-speed-val');
  if (speedEl) {
    state.rate = parseFloat(speedEl.value) || 1;
    speedEl.addEventListener('input', function () { state.rate = parseFloat(this.value) || 1; if (speedOut) speedOut.textContent = state.rate.toFixed(2) + '×'; });
    if (speedOut) speedOut.textContent = state.rate.toFixed(2) + '×';
  }

  LAB.bindRange = function (id, valId, fmt) {
    var el = document.getElementById(id);
    var out = document.getElementById(valId);
    function read() { return el ? parseFloat(el.value) : 0; }
    function sync() { if (out) out.textContent = fmt ? fmt(read()) : read(); }
    if (el) el.addEventListener('input', sync);
    sync();
    return read;
  };

  /* 每个主题的演示时间缩放（按人眼舒适度校准：约 2~4 秒一个周期） */
  var TIME_SCALE = {
    shm: 0.35, resonance: 0.35, wave: 0.3, doppler: 0.4, collision: 0.6, projectile: 0.4,
    idealgas: 0.4, firstlaw: 0.3, carnot: 0.3, maxwell: 0.3, equipartition: 0.3,
    efield: 0.3, gauss: 0.3, potential: 0.3, bfield: 0.3, lorentz: 0.4, faraday: 0.4, emwave: 0.5,
    optics: 0.3, lens: 0.3, young: 0.3, film: 0.3, diffraction: 0.3, grating: 0.3, polarization: 0.3,
    blackbody: 0.3, photoelectric: 0.3, compton: 0.3, bohr: 0.3, debroglie: 0.3, well: 0.3,
    rigid: 0.2, gyro: 0.35, energy: 0.4, rigidlaw: 0.1, rolling: 0.35, ppendulum: 0.35,
    michelson: 0.3
  };

  var NAV = [
    ['overview', null, 'home'],
    ['projectile', 'projectile', 'lab'],
    ['shm', 'shm', 'lab'],
    ['resonance', 'resonance', 'lab'],
    ['wave', 'wave', 'lab'],
    ['doppler', 'doppler', 'lab'],
    ['collision', 'collision', 'lab'],
    ['rigid', 'rigid', 'lab'],
    ['gyro', 'gyro', 'lab'],
    ['energy', 'energy', 'lab'],
    ['rigidlaw', 'rigidlaw', 'lab'],
    ['rolling', 'rolling', 'lab'],
    ['ppendulum', 'ppendulum', 'lab'],
    ['idealgas', 'idealgas', 'lab'],
    ['firstlaw', 'firstlaw', 'lab'],
    ['carnot', 'carnot', 'lab'],
    ['maxwell', 'maxwell', 'lab'],
    ['equipartition', 'equipartition', 'lab'],
    ['efield', 'efield', 'lab'],
    ['gauss', 'gauss', 'lab'],
    ['potential', 'potential', 'lab'],
    ['bfield', 'bfield', 'lab'],
    ['lorentz', 'lorentz', 'lab'],
    ['faraday', 'faraday', 'lab'],
    ['emwave', 'emwave', 'lab'],
    ['optics', 'optics', 'lab'],
    ['lens', 'lens', 'lab'],
    ['young', 'young', 'lab'],
    ['film', 'film', 'lab'],
    ['diffraction', 'diffraction', 'lab'],
    ['grating', 'grating', 'lab'],
    ['polarization', 'polarization', 'lab'],
    ['blackbody', 'blackbody', 'lab'],
    ['photoelectric', 'photoelectric', 'lab'],
    ['compton', 'compton', 'lab'],
    ['bohr', 'bohr', 'lab'],
    ['debroglie', 'debroglie', 'lab'],
    ['well', 'well', 'lab']
  ];

  var info = {};
  NAV.forEach(function (row) {
    var mod = row[2] === 'lab' ? (LAB.modules && LAB.modules[row[1]]) : null;
    info[row[0]] = { key: row[1], kind: row[2], mod: mod, live: row[2] === 'lab' };
  });

  NAV.forEach(function (row) {
    var it = info[row[0]];
    if (it.mod && it.mod.init) { try { it.mod.init(); } catch (e) { console.error('[init]', row[0], e); } }
  });

  var sections = document.querySelectorAll('.module');
  var navItems = document.querySelectorAll('.nav-item');
  var current = 'overview';

  function show(target) {
    if (!info[target]) target = 'overview';
    current = target;
    Array.prototype.forEach.call(sections, function (s) { s.classList.toggle('active', s.id === target); });
    Array.prototype.forEach.call(navItems, function (n) { n.classList.toggle('active', n.getAttribute('data-target') === target); });
    if (history.replaceState) history.replaceState(null, '', '#' + target);
    var it = info[target];
    requestAnimationFrame(function () {
      if (it.mod && it.mod.render) { try { it.mod.render(state.time * (TIME_SCALE[it.key] || 0.3), 0); } catch (e) { console.error('[render]', target, e); } }
    });
  }

  Array.prototype.forEach.call(navItems, function (ni) {
    ni.addEventListener('click', function (e) { e.preventDefault(); show(this.getAttribute('data-target')); });
  });

  var last = performance.now();
  var broken = {};
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.playing) state.time += dt * state.rate;
    var it = info[current];
    if (it && it.live && it.mod && it.mod.render && !broken[current]) {
      try { it.mod.render(state.time * (TIME_SCALE[it.key] || 0.3), dt); } catch (e) { broken[current] = true; console.error('[render]', current, e); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); show(this.getAttribute('data-goto')); });
  });

  var initHash = location.hash.replace('#', '');
  show(info[initHash] ? initHash : 'overview');
});
