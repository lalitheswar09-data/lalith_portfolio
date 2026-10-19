import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const aborter = new AbortController();
const signal = aborter.signal;
let lenis = null;
let introContext = null;
let renderer = null;
let rafTicker = null;
let timeline = null;
let disposed = false;

function initSmoothScroll() {
  if (reduced.matches) return;
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
    anchors: false,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
  });
  lenis.on('scroll', ScrollTrigger.update);
  rafTicker = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(rafTicker);
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      const hash = link.getAttribute('href');
      history.pushState(null, '', hash);
      lenis.scrollTo(target, { duration: 1.1 });
    }, { signal });
  });
  window.addEventListener('popstate', () => {
    const target = location.hash && document.querySelector(location.hash);
    if (target) lenis?.scrollTo(target, { immediate: true });
  }, { signal });
}

function phoneScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const c = canvas.getContext('2d');
  const gradient = c.createLinearGradient(0, 0, 512, 1024);
  gradient.addColorStop(0, '#d9c8aa');
  gradient.addColorStop(1, '#a9b09a');
  c.fillStyle = gradient;
  c.fillRect(0, 0, 512, 1024);
  c.fillStyle = '#201d17';
  c.font = '500 28px Arial';
  c.fillText('LALITH ESWAR', 52, 92);
  c.font = '600 68px Arial';
  c.fillText('Ideas into', 48, 410);
  c.fillText('products.', 48, 492);
  c.fillStyle = 'rgba(32,29,23,.65)';
  c.font = '24px Arial';
  c.fillText('AI · ML · GENAI ENGINEERING', 52, 548);
  c.fillStyle = '#687a5a';
  c.beginPath();
  c.arc(360, 790, 112, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#f6f1e8';
  c.font = '24px Arial';
  c.fillText('SCROLL TO EXPLORE', 52, 900);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedMesh(w, h, d, radius, material, segments = 5) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, segments, radius), material);
}

function makePhoneScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0b0e');
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 80);
  camera.position.set(0, 0, 10.6);
  const rendererInstance = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'high-performance' });
  rendererInstance.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.6));
  rendererInstance.setSize(innerWidth, innerHeight, false);
  rendererInstance.outputColorSpace = THREE.SRGBColorSpace;
  rendererInstance.toneMapping = THREE.ACESFilmicToneMapping;
  rendererInstance.toneMappingExposure = 1.13;

  scene.add(new THREE.HemisphereLight('#dce7f2', '#171410', 2.1));
  const key = new THREE.DirectionalLight('#fff0d7', 4.5);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight('#b8d8ff', 42, 18);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const warm = new THREE.PointLight('#e4b88b', 20, 14);
  warm.position.set(-4, -3, 3);
  scene.add(warm);

  const metal = new THREE.MeshPhysicalMaterial({ color: '#b8bcc0', metalness: .92, roughness: .22, clearcoat: .85 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: '#25282c', metalness: .78, roughness: .3, clearcoat: .8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#b8cbd1', metalness: .18, roughness: .12, transmission: .13, thickness: .08, clearcoat: 1, clearcoatRoughness: .06 });
  const darkGlass = new THREE.MeshPhysicalMaterial({ color: '#101317', metalness: .2, roughness: .12, clearcoat: 1 });
  const pcb = new THREE.MeshStandardMaterial({ color: '#293c35', metalness: .42, roughness: .48 });
  const chip = new THREE.MeshStandardMaterial({ color: '#24272a', metalness: .48, roughness: .36 });
  const copper = new THREE.MeshStandardMaterial({ color: '#9c6745', metalness: .82, roughness: .32 });
  const white = new THREE.MeshStandardMaterial({ color: '#d5d9d8', metalness: .32, roughness: .35 });

  const phone = new THREE.Group();
  phone.scale.setScalar(.72);
  phone.rotation.set(-.11, -.32, -.09);
  scene.add(phone);

  const body = new THREE.Group(); phone.add(body);
  const frame = roundedMesh(2.62, 5.28, .3, .26, metal);
  body.add(frame);
  const back = roundedMesh(2.55, 5.2, .085, .24, graphite);
  back.position.z = -.18; body.add(back);
  const cameraIsland = roundedMesh(.92, 1.18, .16, .16, graphite);
  cameraIsland.position.set(-.68, 1.75, -.29); body.add(cameraIsland);
  for (const [x, y] of [[-.93, 2.03], [-.46, 2.03], [-.93, 1.56]]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .12, 32), metal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(x, y, -.4); body.add(barrel);
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(.138, .025, 8, 32), graphite);
    rimRing.position.set(x, y, -.47); body.add(rimRing);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.108, 32), darkGlass);
    lens.position.set(x, y, -.486); body.add(lens);
    const glint = new THREE.Mesh(new THREE.CircleGeometry(.03, 20), new THREE.MeshBasicMaterial({ color: '#91c7d6' }));
    glint.position.set(x - .033, y + .035, -.493); body.add(glint);
  }

  const screenLayer = new THREE.Group(); phone.add(screenLayer);
  const screenFrame = roundedMesh(2.55, 5.2, .105, .23, graphite);
  screenFrame.position.z = .28; screenLayer.add(screenFrame);
  const display = roundedMesh(2.42, 5.05, .026, .2, darkGlass);
  display.position.z = .35; screenLayer.add(display);
  const screen = roundedMesh(2.31, 4.89, .012, .18, new THREE.MeshBasicMaterial({ map: phoneScreenTexture() }));
  screen.position.z = .37; screenLayer.add(screen);
  const notch = roundedMesh(.68, .14, .025, .065, darkGlass);
  notch.position.set(0, 2.27, .39); screenLayer.add(notch);
  const speaker = roundedMesh(.24, .025, .008, .012, graphite, 3);
  speaker.position.set(0, 2.27, .41); screenLayer.add(speaker);

  const internals = new THREE.Group(); phone.add(internals);
  const shield = roundedMesh(2.42, 4.98, .055, .19, new THREE.MeshStandardMaterial({ color: '#777b7d', metalness: .8, roughness: .4 }));
  shield.position.z = -.02; internals.add(shield);
  const board = roundedMesh(1.48, 2.82, .1, .12, pcb);
  board.position.set(.33, .92, .065); internals.add(board);
  const boardUpper = roundedMesh(.75, 1.35, .11, .08, pcb);
  boardUpper.position.set(-.59, 1.48, .08); internals.add(boardUpper);

  const parts = [];
  const addChip = (parent, x, y, w, h, material = chip, z = .15) => {
    const m = roundedMesh(w, h, .095, .035, material, 3);
    m.position.set(x, y, z); parent.add(m); parts.push(m); return m;
  };
  addChip(internals, .3, 1.2, .7, .62, graphite, .15);
  addChip(internals, .34, .25, .56, .53, chip, .15);
  addChip(internals, -.64, 1.65, .48, .5, graphite, .17);
  addChip(internals, -.63, .9, .36, .48, chip, .17);
  const addChipLabel = (text, x, y) => {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 320; labelCanvas.height = 96;
    const labelContext = labelCanvas.getContext('2d');
    labelContext.fillStyle = '#1a241f'; labelContext.fillRect(0, 0, 320, 96);
    labelContext.strokeStyle = '#a1ab82'; labelContext.lineWidth = 5; labelContext.strokeRect(3, 3, 314, 90);
    labelContext.fillStyle = '#f1ebdb'; labelContext.font = '600 48px Arial';
    labelContext.fillText(text, 20, 66);
    const map = new THREE.CanvasTexture(labelCanvas); map.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(.68, .2), new THREE.MeshBasicMaterial({ map, depthTest: false, depthWrite: false }));
    label.position.set(x, y, .27); label.renderOrder = 10; internals.add(label);
  };
  addChipLabel('RAM', .3, .77);
  addChipLabel('NAND', .34, -.12);
  for (let i = 0; i < 9; i++) addChip(internals, .92 + (i % 2) * .12, 1.55 - Math.floor(i / 2) * .3, .12, .2, i % 3 === 0 ? copper : white, .14);
  for (let i = 0; i < 8; i++) {
    const pin = roundedMesh(.1, .16, .025, .02, copper, 2);
    pin.position.set(-.92 + (i % 2) * 1.87, -.1 + Math.floor(i / 2) * .23, .14); internals.add(pin); parts.push(pin);
  }

  const battery = new THREE.Group(); phone.add(battery);
  const cell = roundedMesh(1.85, 2.45, .17, .13, new THREE.MeshPhysicalMaterial({ color: '#c8c9c6', metalness: .65, roughness: .28, clearcoat: .7 }));
  cell.position.set(-.18, -1.32, -.04); battery.add(cell);
  const batteryLabel = roundedMesh(1.66, 2.18, .012, .1, new THREE.MeshBasicMaterial({ color: '#dfe0dc' }));
  batteryLabel.position.set(-.18, -1.32, .054); battery.add(batteryLabel);
  const batteryStripe = roundedMesh(.13, 1.8, .016, .04, copper, 3);
  batteryStripe.position.set(-.18, -1.32, .066); battery.add(batteryStripe);

  const cameraModule = new THREE.Group(); phone.add(cameraModule);
  for (const [x, y] of [[-.68, 1.75], [-.96, 2.03], [-.4, 2.03]]) {
    const lensBody = new THREE.Mesh(new THREE.CylinderGeometry(.21, .2, .19, 32), graphite);
    lensBody.rotation.x = Math.PI / 2; lensBody.position.set(x, y, -.06); cameraModule.add(lensBody);
    const lensEdge = new THREE.Mesh(new THREE.TorusGeometry(.155, .027, 8, 32), metal);
    lensEdge.position.set(x, y, -.16); cameraModule.add(lensEdge);
    const optic = new THREE.Mesh(new THREE.CircleGeometry(.125, 32), new THREE.MeshPhysicalMaterial({ color: '#172b39', metalness: .55, roughness: .12, clearcoat: 1 }));
    optic.position.set(x, y, -.177); cameraModule.add(optic);
  }
  const flash = new THREE.Mesh(new THREE.CircleGeometry(.08, 24), new THREE.MeshBasicMaterial({ color: '#f5e6c6' }));
  flash.position.set(-.4, 1.48, -.1); cameraModule.add(flash);

  const flex = new THREE.Group(); phone.add(flex);
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(.34, .045, 8, 36, Math.PI * 1.6), copper);
  ribbon.rotation.set(Math.PI / 2, 0, .2); ribbon.position.set(.5, -.95, .02); flex.add(ribbon);
  const connector = roundedMesh(.42, .34, .07, .05, copper, 3);
  connector.position.set(.48, -1.4, .04); flex.add(connector);

  const cameraBlock = new THREE.Group(); phone.add(cameraBlock);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(.78, .09, 12, 64), copper);
  coil.position.set(.12, -.88, -.16); cameraBlock.add(coil);
  const coilCore = new THREE.Mesh(new THREE.CircleGeometry(.68, 64), graphite);
  coilCore.position.set(.12, -.88, -.15); cameraBlock.add(coilCore);
  const speakerBlock = roundedMesh(.72, .35, .16, .1, graphite);
  speakerBlock.position.set(.55, -2.1, -.08); cameraBlock.add(speakerBlock);
  for (let i = 0; i < 5; i++) {
    const hole = new THREE.Mesh(new THREE.CircleGeometry(.045, 16), darkGlass);
    hole.position.set(.31 + i * .12, -2.1, .01); cameraBlock.add(hole);
  }

  const home = new THREE.Vector3(0, 0, 0);
  const exploded = [screenLayer, cameraModule, internals, battery, flex, cameraBlock, body];
  const offsets = [1.85, -1.34, .42, -1.75, .98, -1.02, -2.22];
  const positions = exploded.map((g) => g.position.clone());
  const render = () => { rendererInstance.render(scene, camera); };
  const resize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.position.z = innerWidth < 600 ? 12.8 : innerWidth < 900 ? 11.5 : 10.6;
    camera.updateProjectionMatrix();
    rendererInstance.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.6));
    rendererInstance.setSize(innerWidth, innerHeight, false);
    render();
  };
  window.addEventListener('resize', resize, { passive: true, signal });
  const spin = { y: phone.rotation.y, x: phone.rotation.x, z: phone.rotation.z };
  return {
    scene, camera, renderer: rendererInstance, phone, exploded, offsets, positions, spin,
    render,
    cleanup() {
      if (disposed) return;
      disposed = true;
      window.removeEventListener('resize', resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          for (const value of Object.values(object.material)) if (value?.isTexture) value.dispose();
          object.material.dispose();
        }
      });
      rendererInstance.dispose();
      rendererInstance.forceContextLoss();
      canvas.remove();
    },
  };
}

function finishIntro(skip = false) {
  const overlay = document.getElementById('phone-intro');
  const skipButton = document.getElementById('intro-skip');
  if (!overlay || overlay.hidden) return;
  timeline?.kill();
  timeline = null;
  if (skip) gsap.set(overlay, { autoAlpha: 0 });
  gsap.to(overlay, { autoAlpha: 0, duration: skip ? .28 : .5, ease: 'power2.inOut', onComplete: () => {
    overlay.hidden = true;
    document.body.classList.remove('intro-active');
    skipButton.hidden = true;
    introContext?.cleanup();
    introContext = null;
  } });
}

function initPhoneIntro() {
  const overlay = document.getElementById('phone-intro');
  const canvas = document.getElementById('phone-stage');
  const skip = document.getElementById('intro-skip');
  if (!overlay || !canvas || reduced.matches) return;
  try {
    if (!('WebGLRenderingContext' in window)) return;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'true');
    skip.hidden = false;
    document.body.classList.add('intro-active');
    introContext = makePhoneScene(canvas);
  } catch (error) {
    console.warn('3D phone intro unavailable; showing the portfolio directly.', error);
    overlay.hidden = true;
    skip.hidden = true;
    document.body.classList.remove('intro-active');
    return;
  }
  const rig = introContext;
  const setPositions = (amount) => rig.exploded.forEach((group, i) => {
    const home = rig.positions[i];
    group.position.set(home.x + (i % 2 ? .05 : -.04) * amount, home.y + (i % 3 - 1) * .045 * amount, home.z + rig.offsets[i] * amount);
  });
  skip.addEventListener('click', () => {
    finishIntro(true);
  }, { signal, once: true });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) finishIntro(true); }, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !overlay.hidden) finishIntro(true); }, { signal });
  const spin = { y: rig.spin.y, x: rig.spin.x, z: rig.spin.z };
  timeline = gsap.timeline({ onUpdate: rig.render, onComplete: () => {
    finishIntro(false);
  } });
  timeline.set(overlay, { autoAlpha: 1 });
  timeline.fromTo(rig.phone.scale, { x: .66, y: .66, z: .66 }, { x: .72, y: .72, z: .72, duration: .55, ease: 'power3.out' }, 0);
  timeline.to(spin, { y: spin.y + Math.PI * 2, x: -.23, z: -.14, duration: 1.25, ease: 'power2.inOut', onUpdate: () => rig.phone.rotation.set(spin.x, spin.y, spin.z) }, .18);
  timeline.to({}, { duration: .16 }, 1.12);
  timeline.to({ value: 0 }, { value: 1, duration: .62, ease: 'power3.out', onUpdate() { setPositions(this.targets()[0].value); } }, 1.25);
  timeline.to(spin, { y: spin.y + Math.PI * 2.5, x: -.14, z: -.06, duration: 1.1, ease: 'power2.inOut', onUpdate: () => rig.phone.rotation.set(spin.x, spin.y, spin.z) }, 1.3);
  timeline.fromTo('.phone-callout', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .32, stagger: .12, ease: 'power2.out' }, 1.4);
  timeline.to({ value: 1 }, { value: 0, duration: .72, ease: 'power3.inOut', onUpdate() { setPositions(this.targets()[0].value); } }, 2.55);
  timeline.to('.phone-callout', { autoAlpha: 0, y: -5, duration: .24, stagger: .06, ease: 'power1.in' }, 2.56);
  timeline.to(rig.camera.position, { z: 4.4, duration: .9, ease: 'power3.in' }, 3.17);
  timeline.to(overlay, { autoAlpha: 0, duration: .52, ease: 'power2.in' }, 3.75);
  timeline.to({}, { duration: .1 });
}

function initPageMotion() {
  const context = gsap.context(() => {
    if (reduced.matches) {
      gsap.set('[data-reveal], .capability, .pj, .stop', { clearProps: 'all' });
      document.querySelectorAll('.map-link').forEach((path) => path.classList.add('is-visible'));
      document.querySelectorAll('.pj, .stop, [data-reveal]').forEach((node) => node.classList.add('is-visible'));
      document.querySelector('#timeline')?.style.setProperty('--timeline-progress', '1');
      return;
    }
    gsap.utils.toArray('[data-reveal="heading"]').forEach((heading) => {
      gsap.from(heading, { yPercent: 35, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('#exp .stop').forEach((stop, i) => {
      gsap.from(stop, { x: 32, opacity: 0, duration: .7, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: stop, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('#work .pj').forEach((project, i) => {
      gsap.from(project, { y: 50, opacity: 0, scale: .985, duration: .8, delay: i * .06, ease: 'power3.out', scrollTrigger: { trigger: project, start: 'top 90%', once: true } });
    });
    gsap.from('#contact .contact-portrait', { y: 42, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#contact', start: 'top 78%', once: true } });
    gsap.from('#contact .stats > div', { y: 20, opacity: 0, stagger: .08, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: '#contact .stats', start: 'top 88%', once: true } });
    const timelineEl = document.querySelector('#timeline');
    if (timelineEl) gsap.to(timelineEl, { '--timeline-progress': 1, ease: 'none', scrollTrigger: { trigger: timelineEl, start: 'top 68%', end: 'bottom 56%', scrub: .7 } });
    if (finePointer.matches) gsap.to('#contact .contact-portrait img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  window.addEventListener('pagehide', () => context.revert(), { once: true, signal });
}

function initSkillsStack() {
  const skills = document.querySelector('#skills.skills-approved');
  if (!skills) return;
  const diagram = skills.querySelector('.skills-diagram');
  const svg = diagram?.querySelector('svg');
  if (!diagram || !svg) return;
  const layers = [...svg.querySelectorAll('.skills-layer')];
  const panels = [...skills.querySelectorAll('.skills-annotation')];
  const labels = [...svg.querySelectorAll('.skills-label')];
  const beamClip = svg.querySelector('#skills-beam-clip rect');
  const marquee = skills.querySelector('.skills-marquee > div');
  if (!reduced.matches && marquee) marquee.innerHTML += marquee.innerHTML;

  const setActive = (index) => {
    hover = index;
    layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index));
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
    if (typeof requestDraw === 'function') requestDraw();
  };
  layers.forEach((layer, index) => {
    const title = panels[index]?.querySelector('h3')?.textContent?.trim() || `Skill layer ${index + 1}`;
    layer.setAttribute('role', 'group');
    layer.setAttribute('aria-label', `${title} skills; focus to highlight details`);
    layer.addEventListener('pointerenter', () => setActive(index), { signal });
    layer.addEventListener('pointerleave', () => setActive(-1), { signal });
    layer.addEventListener('focus', () => setActive(index), { signal });
    layer.addEventListener('blur', () => setActive(-1), { signal });
  });
  panels.forEach((panel, index) => {
    panel.addEventListener('pointerenter', () => setActive(index), { signal });
    panel.addEventListener('pointerleave', () => setActive(-1), { signal });
    panel.addEventListener('focus', () => setActive(index), { signal });
    panel.addEventListener('blur', () => setActive(-1), { signal });
  });

  const setViewBox = () => svg.setAttribute('viewBox', innerWidth >= 1280 ? '0 0 1000 940' : '0 0 600 940');
  setViewBox();
  window.addEventListener('resize', setViewBox, { passive: true, signal });
  let progress = reduced.matches ? 1 : 0;
  let targetProgress = progress;
  let hover = -1;
  const lift = layers.map(() => 0);
  const dim = layers.map(() => 1);
  const easeInOut = (value) => value < .5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
  const applyStatic = () => {
    layers.forEach((layer) => {
      layer.setAttribute('transform', 'translate(0 0)');
      layer.style.opacity = '1';
      layer.style.setProperty('--skills-leader-opacity', '1');
    });
    if (beamClip) { beamClip.setAttribute('y', '115'); beamClip.setAttribute('height', '800'); }
    labels.forEach((label) => { label.style.opacity = '1'; });
    panels.forEach((panel) => { panel.style.opacity = '1'; panel.style.transform = 'none'; });
  };
  if (reduced.matches) { applyStatic(); return; }

  let frame = 0;
  let visible = false;
  const draw = (now) => {
    frame = 0;
    if (!visible || document.hidden) return;
    const rect = diagram.getBoundingClientRect();
    targetProgress = Math.min(1, Math.max(0, (innerHeight * .95 - rect.top) / (innerHeight * .75)));
    progress += (targetProgress - progress) * .085;
    const eased = easeInOut(progress);
    const spacing = 34 + 156 * eased;
    const time = now / 1000;
    layers.forEach((layer, index) => {
      lift[index] += ((hover === index ? -26 : 0) - lift[index]) * .13;
      dim[index] += ((hover >= 0 && hover !== index ? .5 : 1) - dim[index]) * .13;
      const float = Math.sin(time * 1.3 + index * 1.1) * 4 * eased;
      const parallax = (hover === index ? 2 : 0);
      const y = (190 - spacing) * index + lift[index] + float;
      layer.setAttribute('transform', `translate(${parallax.toFixed(1)} ${y.toFixed(1)})`);
      layer.style.opacity = dim[index].toFixed(2);
      layer.style.setProperty('--skills-leader-opacity', eased.toFixed(2));
    });
    if (beamClip) { beamClip.setAttribute('y', String(905 - 790 * eased)); beamClip.setAttribute('height', String(790 * eased + 10)); }
    labels.forEach((label) => { label.style.opacity = eased.toFixed(2); });
    if (innerWidth >= 1280) panels.forEach((panel, index) => {
      const reveal = Math.min(1, Math.max(0, (eased - .5 - index * .1) / .2));
      panel.style.opacity = String(reveal * (hover >= 0 && hover !== index ? .45 : 1));
      panel.style.transform = `translateX(${(1 - reveal) * 40}px)`;
    });
    else panels.forEach((panel) => { panel.style.opacity = '1'; panel.style.transform = 'none'; });
    frame = requestAnimationFrame(draw);
  };
  const requestDraw = () => { if (visible && !frame) frame = requestAnimationFrame(draw); };
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: '180px 0px' });
  visibility.observe(skills);
  const scrollTrigger = ScrollTrigger.create({
    trigger: skills,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: requestDraw,
    onRefresh: requestDraw,
  });
  document.addEventListener('visibilitychange', requestDraw, { signal });
  window.addEventListener('pagehide', () => {
    visibility.disconnect();
    scrollTrigger.kill();
    if (frame) cancelAnimationFrame(frame);
  }, { once: true, signal });
}

function initHeroWaves() {
  const canvas = document.querySelector('#dunes');
  const hero = canvas?.closest('.hero');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !hero || !ctx) return;
  let width = 0, height = 0, phase = 0, frame = 0, visible = false;
  const pointer = { x: -1000, y: -1000 };
  const draw = () => {
    frame = 0;
    if (document.hidden || !visible) return;
    ctx.clearRect(0, 0, width, height);
    const color = getComputedStyle(root).getPropertyValue('--ink').trim() || '#17150f';
    const lines = 12, top = height * .48, gap = Math.max(12, height * .037);
    for (let row = 0; row < lines; row++) {
      ctx.beginPath();
      for (let x = 0; x <= width + 3; x += 10) {
        const base = top + row * gap;
        const broad = Math.sin(x * .0031 + row * .34 + phase) * Math.min(15, height * .018);
        const fine = Math.sin(x * .0078 - row * .22 + phase * .72) * Math.min(3, height * .004);
        const dx = x - pointer.x, dy = base - pointer.y;
        const weight = Math.exp(-(dx * dx + dy * dy) / (2 * 210 * 210));
        const y = base + broad + fine - weight * 19;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.globalAlpha = .09 + row * .009; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (!reduced.matches && !document.hidden && visible) { phase += .006; frame = requestAnimationFrame(draw); }
  };
  const request = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };
  const resize = () => {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.4);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); request();
  };
  const observer = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) request(); else if (frame) { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .01 });
  observer.observe(hero);
  canvas.addEventListener('pointermove', (event) => { const rect = canvas.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; request(); }, { passive: true, signal });
  window.addEventListener('resize', resize, { passive: true, signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else request(); }, { signal });
  window.addEventListener('pagehide', () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); }, { once: true, signal });
  resize();
}

function initProjectDemos() {
  const clock = document.querySelector('#clk');
  if (clock) {
    const updateClock = () => { clock.textContent = `Raipur · ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`; };
    updateClock(); const timer = setInterval(updateClock, 30000);
    window.addEventListener('pagehide', () => clearInterval(timer), { once: true, signal });
  }
  const strategies = {
    Dense: [['Refund policy, section 2', '.82'], ['Returns FAQ', '.64'], ['Shipping terms', '.51']],
    BM25: [['Refund policy, section 2', '.77'], ['Billing FAQ', '.58'], ['Returns FAQ', '.49']],
    Hybrid: [['Refund policy, section 2', '.88'], ['Returns FAQ', '.71'], ['Billing FAQ', '.52']],
    'Hybrid + rerank': [['Refund policy, section 2', '.96'], ['Returns FAQ', '.83'], ['Refund policy, section 5', '.62']],
  };
  const chunks = document.querySelector('#chs');
  const showRag = (name) => { if (chunks) chunks.innerHTML = (strategies[name] || strategies.Dense).map((row, i) => `<div style="animation-delay:${i * .08}s"><b>[${i + 1}]</b><span>${row[0]}</span><em>${row[1]}</em></div>`).join(''); };
  document.querySelectorAll('#seg button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('#seg button').forEach((item) => item.classList.toggle('on', item === button));
    showRag(button.textContent.trim());
  }, { signal }));
  showRag('Dense');
  document.querySelector('#pr')?.addEventListener('click', () => {
    const win = Math.round(30 + Math.random() * 30);
    const draw = Math.round(15 + Math.random() * (100 - win - 15) * .5);
    [win, draw, 100 - win - draw].forEach((value, index) => {
      const row = document.querySelectorAll('#cl .bars>div')[index];
      if (row) { row.querySelector('s')?.style.setProperty('--w', `${value}%`); const label = row.querySelector('em'); if (label) label.textContent = `${value}%`; }
    });
  }, { signal });
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'today', '.'];
  const tokenRoot = document.querySelector('#tk'), heatmap = document.querySelector('#hm');
  if (tokenRoot && heatmap) {
    tokenRoot.innerHTML = tokens.map((word) => `<span>${word}</span>`).join('');
    const cells = [];
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const opacity = Math.min(1, Math.max(.08, Math.exp(-Math.abs(row - col) * .5) * .7 + Math.random() * .3));
      const cell = document.createElement('span'); cell.style.opacity = opacity; cell.dataset.opacity = opacity; cell.dataset.row = row; heatmap.appendChild(cell); cells.push(cell);
    }
    [...tokenRoot.children].forEach((token, index) => {
      token.addEventListener('pointerenter', () => cells.forEach((cell) => { cell.style.opacity = Number(cell.dataset.row) === index ? 1 : cell.dataset.opacity * .18; }), { signal });
      token.addEventListener('pointerleave', () => cells.forEach((cell) => { cell.style.opacity = cell.dataset.opacity; }), { signal });
    });
  }
  if (finePointer.matches) document.querySelectorAll('.bw').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
      gsap.to(card, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 900, duration: .45, overwrite: true });
    }, { signal });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: .6, ease: 'power3.out' }), { signal });
  });
}

function init() {
  initSmoothScroll();
  initSkillsStack();
  initHeroWaves();
  initProjectDemos();
  initPageMotion();
  if (!reduced.matches) initPhoneIntro();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
window.addEventListener('pagehide', () => {
  aborter.abort();
  timeline?.kill();
  lenis?.destroy();
  if (rafTicker) gsap.ticker.remove(rafTicker);
}, { once: true });
