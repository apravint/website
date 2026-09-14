"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Heart, Zap, Volume2, VolumeX, Shield, Award, Camera, CloudRain, Sun, Flame, Sparkles, Trophy, Settings } from 'lucide-react';

type CarModelType = 'supercar' | 'roadster' | 'titan';
type TrackThemeType = 'synthwave' | 'rain' | 'mars';
type CameraViewType = 'chase' | 'hood' | 'topdown';

interface HighScoreEntry {
  name: string;
  score: number;
}

export default function RacerTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Customization & Garage State
  const [selectedCar, setSelectedCar] = useState<CarModelType>('supercar');
  const [underglowColor, setUnderglowColor] = useState<string>('#00f0ff');
  const [trackTheme, setTrackTheme] = useState<TrackThemeType>('synthwave');
  const [cameraView, setCameraView] = useState<CameraViewType>('chase');

  // Stats HUD State
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitro, setNitro] = useState(100);
  const [hasShield, setHasShield] = useState(false);
  const [driftMultiplier, setDriftMultiplier] = useState(1);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gameState, setGameState] = useState<'garage' | 'start' | 'playing' | 'crashed' | 'gameover'>('garage');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hallOfFame, setHallOfFame] = useState<HighScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState('PRA');

  // Physics & Game Loop State Refs
  const speedRef = useRef(0);
  const playerXRef = useRef(0);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const livesRef = useRef(3);
  const nitroRef = useRef(100);
  const shieldRef = useRef(false);
  const driftComboRef = useRef(0);
  const isNitroActiveRef = useRef(false);
  const gameStateRef = useRef<'garage' | 'start' | 'playing' | 'crashed' | 'gameover'>('garage');
  const soundEnabledRef = useRef(true);
  const cameraViewRef = useRef<CameraViewType>('chase');
  const screenShakeRef = useRef(0);
  const floatingTextsRef = useRef<{ id: number; text: string; x: number; y: number; color: string; alpha: number }[]>([]);

  // Input Control Flags
  const keyLeftRef = useRef(false);
  const keyRightRef = useRef(false);
  const keyFasterRef = useRef(false);
  const keySlowerRef = useRef(false);
  const keyNitroRef = useRef(false);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 3D Objects Refs
  const playerCarGroupRef = useRef<THREE.Group | null>(null);
  const underglowLightRef = useRef<THREE.PointLight | null>(null);
  const playerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const playerFlameLightRef = useRef<THREE.PointLight | null>(null);
  const roadLinesMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);

  // Entities Pools
  const trafficCarsRef = useRef<{ group: THREE.Group; lane: number; z: number; speed: number }[]>([]);
  const pickupsRef = useRef<{ mesh: THREE.Mesh; type: 'coin' | 'nitro' | 'shield'; lane: number; z: number; collected: boolean }[]>([]);
  const skidSmokeRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    cameraViewRef.current = cameraView;
  }, [cameraView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHigh = localStorage.getItem('racer-highscore');
      if (savedHigh) setHighScore(Number(savedHigh));

      const savedHof = localStorage.getItem('racer-hof');
      if (savedHof) {
        try { setHallOfFame(JSON.parse(savedHof)); } catch (e) {}
      } else {
        setHallOfFame([
          { name: 'PRA', score: 25400 },
          { name: 'NEO', score: 18900 },
          { name: 'CYB', score: 14200 }
        ]);
      }
    }

    initThreeJS();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.min(520, Math.max(340, w * 0.56));
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Re-build 3D Scene when track theme or car changes
  useEffect(() => {
    if (sceneRef.current) {
      applyTrackTheme(sceneRef.current, trackTheme);
      rebuildPlayerCar(sceneRef.current, selectedCar, underglowColor);
    }
  }, [selectedCar, underglowColor, trackTheme]);

  // Web Audio Synthesizer
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {}
  };

  const playEngineSound = (speedVal: number) => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    const isNitro = isNitroActiveRef.current;
    const baseFreq = isNitro ? 120 : 75;
    const freqMult = isNitro ? 190 : 135;

    osc.frequency.setValueAtTime(baseFreq + (speedVal / 380) * freqMult, ctx.currentTime);
    gain.gain.setValueAtTime(0.032, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  };

  const playSoundEffect = (type: 'coin' | 'nitro' | 'shield' | 'crash' | 'drift') => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'nitro') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'shield') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(1046.50, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'crash') {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    }
  };

  // Three.js WebGL 3D Engine Initialization
  const initThreeJS = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = Math.min(520, Math.max(340, width * 0.56));

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.2, -15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#00f0ff', 1.3);
    dirLight.position.set(20, 45, -30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    applyTrackTheme(scene, trackTheme);
    rebuildPlayerCar(scene, selectedCar, underglowColor);
    create3DRoad(scene);
    create3DCity(scene);
    create3DTrafficCars(scene);
    create3DPickups(scene);
  };

  // Track Theme Switcher (Synthwave / Rain / Mars)
  const applyTrackTheme = (scene: THREE.Scene, theme: TrackThemeType) => {
    if (theme === 'rain') {
      scene.background = new THREE.Color('#04070d');
      scene.fog = new THREE.FogExp2('#04070d', 0.007);

      // Rain Particle System
      if (!rainParticlesRef.current) {
        const rainGeo = new THREE.BufferGeometry();
        const rainCount = 1200;
        const pos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount * 3; i += 3) {
          pos[i] = (Math.random() - 0.5) * 60;
          pos[i + 1] = Math.random() * 40;
          pos[i + 2] = (Math.random() - 0.5) * 300;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const rainMat = new THREE.PointsMaterial({ color: '#38bdf8', size: 0.25, transparent: true, opacity: 0.6 });
        const rain = new THREE.Points(rainGeo, rainMat);
        scene.add(rain);
        rainParticlesRef.current = rain;
      }
    } else if (theme === 'mars') {
      scene.background = new THREE.Color('#1f0804');
      scene.fog = new THREE.FogExp2('#1f0804', 0.006);
      if (rainParticlesRef.current) { scene.remove(rainParticlesRef.current); rainParticlesRef.current = null; }
    } else {
      scene.background = new THREE.Color('#030511');
      scene.fog = new THREE.FogExp2('#030511', 0.0055);
      if (rainParticlesRef.current) { scene.remove(rainParticlesRef.current); rainParticlesRef.current = null; }
    }
  };

  // Rebuild 3D Supercar based on selected model & underglow
  const rebuildPlayerCar = (scene: THREE.Scene, model: CarModelType, glowColor: string) => {
    if (playerCarGroupRef.current) scene.remove(playerCarGroupRef.current);

    const carGroup = new THREE.Group();

    // Body Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      metalness: 0.9,
      roughness: 0.15,
      emissive: glowColor,
      emissiveIntensity: 0.2
    });

    let bodyWidth = 1.9, bodyHeight = 0.6, bodyLength = 3.8;
    if (model === 'roadster') { bodyWidth = 1.85; bodyHeight = 0.48; bodyLength = 3.6; }
    if (model === 'titan') { bodyWidth = 2.2; bodyHeight = 0.95; bodyLength = 4.2; }

    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = bodyHeight / 2 + 0.2;
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // Glass Windshield
    const glassMat = new THREE.MeshStandardMaterial({ color: '#020617', metalness: 0.95, roughness: 0.05, opacity: 0.85, transparent: true });
    const canopyGeo = new THREE.BoxGeometry(bodyWidth * 0.75, bodyHeight * 0.7, bodyLength * 0.45);
    const canopyMesh = new THREE.Mesh(canopyGeo, glassMat);
    canopyMesh.position.set(0, bodyHeight + 0.25, -0.2);
    carGroup.add(canopyMesh);

    // Dynamic Underglow Light
    const underglowLight = new THREE.PointLight(glowColor, 3.5, 12);
    underglowLight.position.set(0, 0.1, 0);
    carGroup.add(underglowLight);
    underglowLightRef.current = underglowLight;

    // Headlights
    const headlightLeft = new THREE.SpotLight(glowColor, 4, 45, Math.PI / 6, 0.4);
    headlightLeft.position.set(-0.7, 0.5, -1.8);
    headlightLeft.target.position.set(-0.7, 0, -25);
    carGroup.add(headlightLeft);
    carGroup.add(headlightLeft.target);

    const headlightRight = new THREE.SpotLight(glowColor, 4, 45, Math.PI / 6, 0.4);
    headlightRight.position.set(0.7, 0.5, -1.8);
    headlightRight.target.position.set(0.7, 0, -25);
    carGroup.add(headlightRight);
    carGroup.add(headlightRight.target);

    // Taillight
    const tailMat = new THREE.MeshStandardMaterial({ color: '#ff007f', emissive: '#ff007f', emissiveIntensity: 2.5 });
    const tailGeo = new THREE.BoxGeometry(bodyWidth * 0.9, 0.1, 0.05);
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.position.set(0, bodyHeight * 0.8, bodyLength / 2 + 0.01);
    carGroup.add(tailMesh);

    // Exhaust Flame
    const flameGeo = new THREE.ConeGeometry(0.32, 1.3, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0 });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.rotation.x = Math.PI / 2;
    flameMesh.position.set(0, 0.4, bodyLength / 2 + 0.6);
    carGroup.add(flameMesh);
    playerFlameMeshRef.current = flameMesh;

    const flameLight = new THREE.PointLight(glowColor, 0, 12);
    flameLight.position.set(0, 0.4, bodyLength / 2 + 0.6);
    carGroup.add(flameLight);
    playerFlameLightRef.current = flameLight;

    carGroup.position.set(0, 0, 0);
    scene.add(carGroup);
    playerCarGroupRef.current = carGroup;
  };

  const create3DRoad = (scene: THREE.Scene) => {
    const roadGeo = new THREE.PlaneGeometry(14, 400);
    const roadMat = new THREE.MeshStandardMaterial({ color: '#0b0f1b', roughness: 0.4, metalness: 0.3 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -180);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    const lineGeo = new THREE.PlaneGeometry(0.25, 4);
    const lineMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const lineMesh = new THREE.InstancedMesh(lineGeo, lineMat, 40);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 40; i++) {
      dummy.rotation.x = -Math.PI / 2;
      dummy.position.set(0, 0.02, -i * 10);
      dummy.updateMatrix();
      lineMesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(lineMesh);
    roadLinesMeshRef.current = lineMesh;
  };

  const create3DCity = (scene: THREE.Scene) => {
    const buildingsGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({ color: '#080e21', metalness: 0.8, roughness: 0.3, emissive: '#041d3a', emissiveIntensity: 0.3 });

    for (let i = 0; i < 60; i++) {
      const bMesh = new THREE.Mesh(boxGeo, buildingMat);
      const height = 15 + Math.random() * 45;
      const width = 8 + Math.random() * 12;
      const depth = 8 + Math.random() * 12;
      const side = (i % 2 === 0 ? 1 : -1) * (18 + Math.random() * 25);
      bMesh.scale.set(width, height, depth);
      bMesh.position.set(side, height / 2, -i * 12);
      buildingsGroup.add(bMesh);
    }
    scene.add(buildingsGroup);
  };

  const create3DTrafficCars = (scene: THREE.Scene) => {
    const cars: { group: THREE.Group; lane: number; z: number; speed: number }[] = [];
    const carColors = ['#ff007f', '#facc15', '#a855f7', '#10b981', '#ef4444'];
    const lanes = [-4, 0, 4];

    for (let i = 0; i < 15; i++) {
      const carGroup = new THREE.Group();
      const color = carColors[i % carColors.length];

      const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 });
      const bodyGeo = new THREE.BoxGeometry(1.8, 0.55, 3.6);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 0.45;
      carGroup.add(bodyMesh);

      const tailMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
      const tailGeo = new THREE.BoxGeometry(1.6, 0.1, 0.05);
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      tailMesh.position.set(0, 0.5, 1.81);
      carGroup.add(tailMesh);

      const lane = lanes[i % lanes.length];
      const z = -40 - i * 25;
      carGroup.position.set(lane, 0, z);

      scene.add(carGroup);
      cars.push({ group: carGroup, lane, z, speed: 25 + Math.random() * 20 });
    }
    trafficCarsRef.current = cars;
  };

  const create3DPickups = (scene: THREE.Scene) => {
    const pickups: { mesh: THREE.Mesh; type: 'coin' | 'nitro' | 'shield'; lane: number; z: number; collected: boolean }[] = [];
    const lanes = [-4, 0, 4];

    const coinGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16);
    const coinMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.1 });

    const nitroGeo = new THREE.IcosahedronGeometry(0.6, 1);
    const nitroMat = new THREE.MeshStandardMaterial({ color: '#00f0ff', emissive: '#00f0ff', emissiveIntensity: 0.8 });

    const shieldGeo = new THREE.OctahedronGeometry(0.7);
    const shieldMat = new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#a855f7', emissiveIntensity: 0.8 });

    for (let i = 0; i < 24; i++) {
      const rand = Math.random();
      const type: 'coin' | 'nitro' | 'shield' = rand > 0.6 ? 'coin' : (rand > 0.2 ? 'nitro' : 'shield');
      const geo = type === 'coin' ? coinGeo : (type === 'nitro' ? nitroGeo : shieldGeo);
      const mat = type === 'coin' ? coinMat : (type === 'nitro' ? nitroMat : shieldMat);

      const mesh = new THREE.Mesh(geo, mat);
      const lane = lanes[i % lanes.length];
      const z = -30 - i * 18;
      mesh.position.set(lane, 0.8, z);
      if (type === 'coin') mesh.rotation.x = Math.PI / 2;

      scene.add(mesh);
      pickups.push({ mesh, type, lane, z, collected: false });
    }
    pickupsRef.current = pickups;
  };

  // Keyboard Handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    initAudio();
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover' || gameStateRef.current === 'garage') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startGame();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A': keyLeftRef.current = true; break;
      case 'ArrowRight': case 'd': case 'D': keyRightRef.current = true; break;
      case 'ArrowUp': case 'w': case 'W': keyFasterRef.current = true; break;
      case 'ArrowDown': case 's': case 'S': keySlowerRef.current = true; break;
      case 'Shift': case 'x': case 'X': keyNitroRef.current = true; break;
      case 'c': case 'C': cycleCameraView(); break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A': keyLeftRef.current = false; break;
      case 'ArrowRight': case 'd': case 'D': keyRightRef.current = false; break;
      case 'ArrowUp': case 'w': case 'W': keyFasterRef.current = false; break;
      case 'ArrowDown': case 's': case 'S': keySlowerRef.current = false; break;
      case 'Shift': case 'x': case 'X': keyNitroRef.current = false; break;
    }
  };

  const cycleCameraView = () => {
    const views: CameraViewType[] = ['chase', 'hood', 'topdown'];
    const nextIdx = (views.indexOf(cameraViewRef.current) + 1) % views.length;
    setCameraView(views[nextIdx]);
  };

  const startGame = () => {
    initAudio();
    setGameState('playing');
    gameStateRef.current = 'playing';

    setScore(0); scoreRef.current = 0;
    setCoins(0); coinsRef.current = 0;
    setLives(3); livesRef.current = 3;
    speedRef.current = 0;
    playerXRef.current = 0;

    setNitro(100); nitroRef.current = 100;
    setHasShield(false); shieldRef.current = false;
    setIsNitroActive(false); isNitroActiveRef.current = false;
    setDriftMultiplier(1); driftComboRef.current = 0;

    screenShakeRef.current = 0;
    floatingTextsRef.current = [];

    trafficCarsRef.current.forEach((car, i) => { car.z = -40 - i * 25; car.group.position.z = car.z; });
    pickupsRef.current.forEach((p, i) => { p.z = -30 - i * 18; p.mesh.position.z = p.z; p.collected = false; p.mesh.visible = true; });

    lastTimeRef.current = performance.now();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const lastTimeRef = useRef(0);

  // Main Physics & Render Loop
  const gameLoop = (now: number) => {
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover' || gameStateRef.current === 'garage') return;

    const dt = Math.min(0.08, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    update3DPhysics(dt);
    render3DScene();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const update3DPhysics = (dt: number) => {
    const maxSpeedLimit = isNitroActiveRef.current ? 385 : (selectedCar === 'roadster' ? 310 : (selectedCar === 'titan' ? 260 : 290));

    if (gameStateRef.current === 'playing') {
      // Drift Combo Logic
      const isSteering = keyLeftRef.current || keyRightRef.current;
      if (isSteering && speedRef.current > 180) {
        driftComboRef.current += dt * 2.5;
        const mult = Math.min(4, Math.floor(driftComboRef.current) + 1);
        setDriftMultiplier(mult);
      } else {
        driftComboRef.current = Math.max(0, driftComboRef.current - dt * 2);
        if (driftComboRef.current === 0) setDriftMultiplier(1);
      }

      scoreRef.current += Math.round(speedRef.current * dt * 0.08 * (1 + (driftComboRef.current * 0.3)));
      setScore(scoreRef.current);

      if (keyNitroRef.current && nitroRef.current > 0 && speedRef.current > 60) {
        isNitroActiveRef.current = true;
        setIsNitroActive(true);
        nitroRef.current = Math.max(0, nitroRef.current - dt * 42);
        setNitro(nitroRef.current);
        speedRef.current = Math.min(maxSpeedLimit, speedRef.current + 230 * dt);
      } else {
        isNitroActiveRef.current = false;
        setIsNitroActive(false);
        nitroRef.current = Math.min(100, nitroRef.current + dt * 7.5);
        setNitro(nitroRef.current);

        if (keyFasterRef.current) speedRef.current = Math.min(maxSpeedLimit, speedRef.current + 115 * dt);
        else if (keySlowerRef.current) speedRef.current = Math.max(0, speedRef.current - 330 * dt);
        else speedRef.current = Math.max(0, speedRef.current - 65 * dt);
      }

      setSpeed(speedRef.current);
      playEngineSound(speedRef.current);

      const steerFactor = isNitroActiveRef.current ? 7.5 : (selectedCar === 'roadster' ? 10.5 : 9.0);
      if (keyLeftRef.current) playerXRef.current = Math.max(-5.2, playerXRef.current - dt * steerFactor);
      else if (keyRightRef.current) playerXRef.current = Math.min(5.2, playerXRef.current + dt * steerFactor);
    } else if (gameStateRef.current === 'crashed') {
      isNitroActiveRef.current = false;
      setIsNitroActive(false);
      speedRef.current = Math.max(0, speedRef.current - 400 * dt);
      setSpeed(speedRef.current);
    }

    if (playerCarGroupRef.current) {
      playerCarGroupRef.current.position.x = playerXRef.current;
      const targetRoll = keyLeftRef.current ? 0.14 : (keyRightRef.current ? -0.14 : 0);
      playerCarGroupRef.current.rotation.z += (targetRoll - playerCarGroupRef.current.rotation.z) * 0.15;

      if (playerFlameMeshRef.current && playerFlameLightRef.current) {
        if (isNitroActiveRef.current) {
          (playerFlameMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
          playerFlameLightRef.current.intensity = 4.0;
        } else {
          (playerFlameMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
          playerFlameLightRef.current.intensity = 0;
        }
      }
    }

    // Dynamic Camera View Angles (Chase / Hood / Topdown)
    if (cameraRef.current) {
      if (cameraViewRef.current === 'hood') {
        cameraRef.current.position.set(playerXRef.current, 1.2, -0.5);
        cameraRef.current.lookAt(playerXRef.current, 1.0, -25);
      } else if (cameraViewRef.current === 'topdown') {
        cameraRef.current.position.set(playerXRef.current * 0.5, 18, -4);
        cameraRef.current.lookAt(playerXRef.current * 0.5, 0, -18);
      } else {
        // Chase Cam
        const targetFOV = isNitroActiveRef.current ? 80 : (62 + (speedRef.current / 290) * 8);
        cameraRef.current.fov += (targetFOV - cameraRef.current.fov) * 0.1;
        cameraRef.current.updateProjectionMatrix();

        if (screenShakeRef.current > 0) {
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
          cameraRef.current.position.x = (Math.random() - 0.5) * screenShakeRef.current * 0.2;
          cameraRef.current.position.y = 3.2 + (Math.random() - 0.5) * screenShakeRef.current * 0.2;
        } else {
          cameraRef.current.position.x = 0;
          cameraRef.current.position.y = 3.2;
        }
      }
    }

    // Move Rain particles
    if (rainParticlesRef.current) {
      const pos = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= dt * 45;
        if (pos[i] < 0) pos[i] = 40;
      }
      rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Move Road Lines
    const moveDist = speedRef.current * dt * 0.45;
    if (roadLinesMeshRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 40; i++) {
        let z = (-i * 10) + (scoreRef.current * 0.4) % 10;
        dummy.rotation.x = -Math.PI / 2;
        dummy.position.set(0, 0.02, z);
        dummy.updateMatrix();
        roadLinesMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      roadLinesMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Pickups Collision
    pickupsRef.current.forEach(p => {
      p.mesh.rotation.y += dt * 3;
      p.z += moveDist;
      if (p.z > 10) { p.z -= 420; p.collected = false; p.mesh.visible = true; p.lane = [-4, 0, 4][Math.floor(Math.random() * 3)]; p.mesh.position.x = p.lane; }
      p.mesh.position.z = p.z;

      if (!p.collected && gameStateRef.current === 'playing' && Math.abs(p.z) < 2.2 && Math.abs(playerXRef.current - p.lane) < 1.4) {
        p.collected = true;
        p.mesh.visible = false;

        if (p.type === 'coin') {
          coinsRef.current += 1; scoreRef.current += 500; setCoins(coinsRef.current); setScore(scoreRef.current);
          playSoundEffect('coin'); addFloatingText('+500 COIN!', '#facc15');
        } else if (p.type === 'nitro') {
          nitroRef.current = Math.min(100, nitroRef.current + 35); setNitro(nitroRef.current);
          playSoundEffect('nitro'); addFloatingText('+NITRO BOOST!', '#00f0ff');
        } else if (p.type === 'shield') {
          shieldRef.current = true; setHasShield(true);
          playSoundEffect('shield'); addFloatingText('SHIELD ACTIVE!', '#a855f7');
        }
      }
    });

    // Traffic Collision
    trafficCarsRef.current.forEach(car => {
      car.z += moveDist - (car.speed * dt * 0.25);
      if (car.z > 15) { car.z -= 380; car.lane = [-4, 0, 4][Math.floor(Math.random() * 3)]; car.group.position.x = car.lane; }
      car.group.position.z = car.z;

      if (gameStateRef.current === 'playing' && Math.abs(car.z) < 2.4) {
        const dx = Math.abs(playerXRef.current - car.lane);
        if (dx < 1.35) {
          triggerCrash();
        } else if (dx >= 1.35 && dx < 2.3 && speedRef.current > 200) {
          scoreRef.current += 200; setScore(scoreRef.current);
          addFloatingText('NEAR MISS! +200', '#ff007f');
        }
      }
    });
  };

  const triggerCrash = () => {
    if (shieldRef.current) {
      shieldRef.current = false; setHasShield(false);
      screenShakeRef.current = 6; playSoundEffect('shield');
      addFloatingText('SHIELD ABSORBED CRASH!', '#38bdf8');
      return;
    }

    speedRef.current = 30; setSpeed(30);
    livesRef.current = Math.max(0, livesRef.current - 1); setLives(livesRef.current);
    screenShakeRef.current = 14; playSoundEffect('crash');

    if (livesRef.current <= 0) {
      setGameState('gameover'); gameStateRef.current = 'gameover';

      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        if (typeof localStorage !== 'undefined') localStorage.setItem('racer-highscore', String(scoreRef.current));
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

      // Add score to Hall of Fame
      const newHof = [...hallOfFame, { name: playerName, score: scoreRef.current }].sort((a, b) => b.score - a.score).slice(0, 5);
      setHallOfFame(newHof);
      if (typeof localStorage !== 'undefined') localStorage.setItem('racer-hof', JSON.stringify(newHof));
    } else {
      setGameState('crashed'); gameStateRef.current = 'crashed';
      setTimeout(() => {
        if (gameStateRef.current === 'crashed') {
          setGameState('playing'); gameStateRef.current = 'playing';
          playerXRef.current = 0;
        }
      }, 1200);
    }
  };

  const addFloatingText = (text: string, color: string) => {
    floatingTextsRef.current.push({ id: Math.random(), text, x: 320, y: 150, color, alpha: 1.0 });
  };

  const render3DScene = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // Mobile Controller Actions
  const setMobileAction = (action: 'left' | 'right' | 'go' | 'stop' | 'nitro', isPressed: boolean) => {
    initAudio();
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover' || gameStateRef.current === 'garage') {
      startGame();
      return;
    }

    if (action === 'left') keyLeftRef.current = isPressed;
    if (action === 'right') keyRightRef.current = isPressed;
    if (action === 'go') keyFasterRef.current = isPressed;
    if (action === 'stop') keySlowerRef.current = isPressed;
    if (action === 'nitro') keyNitroRef.current = isPressed;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 glass-card w-full max-w-4xl">
      {/* Top Controls Bar */}
      <div className="flex justify-between items-center w-full mb-4 px-2">
        <h3 className="text-xl md:text-2xl font-black text-cyber-pink tracking-wider neon-glow-text flex items-center gap-2">
          <span>🏎️</span> CYBER RACER 3D
        </h3>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={cycleCameraView}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-cyber-cyan hover:text-white transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="uppercase">{cameraView}</span>
          </button>

          <button 
            onClick={() => setGameState(gameState === 'garage' ? 'start' : 'garage')}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-cyber-pink" />
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>
          
          <div className="text-xs md:text-sm text-zinc-400 font-bold">
            HIGH: <span className="text-gradient text-base font-extrabold ml-1">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mb-4 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SPEED</span>
          <span className={`text-xl md:text-2xl font-black ${isNitroActive ? 'text-cyber-pink animate-pulse' : 'text-cyber-cyan'}`}>
            {Math.round(speed)} <small className="text-[10px] font-normal text-zinc-400">KM/H</small>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SCORE</span>
          <span className="text-xl md:text-2xl font-black text-white">
            {score} {driftMultiplier > 1 && <small className="text-xs text-cyber-pink font-bold ml-1">x{driftMultiplier}</small>}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span>🪙</span> COINS
          </span>
          <span className="text-xl md:text-2xl font-black text-amber-400">{coins}</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-cyan" /> NITRO
          </span>
          <div className="w-20 md:w-24 h-2.5 bg-zinc-950 rounded-full overflow-hidden mt-1 border border-zinc-700">
            <div 
              className={`h-full rounded-full transition-all duration-75 ${
                isNitroActive ? 'bg-gradient-to-r from-cyber-pink to-amber-500 animate-pulse' : 'bg-gradient-to-r from-cyber-cyan to-blue-500'
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">LIVES</span>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-5 h-5 ${idx < lives ? 'text-red-500 fill-red-500 animate-bounce' : 'text-zinc-800'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D WebGL Viewport Container */}
      <div className="relative w-full border-2 border-cyber-cyan/40 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] bg-black">
        <div ref={containerRef} className="w-full h-auto block" />

        {/* Garage Customization Screen */}
        {gameState === 'garage' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6">
            <h2 className="text-2xl font-black text-cyber-cyan mb-4 flex items-center gap-2">
              <span>🏎️</span> 3D GARAGE & CUSTOMIZER
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-6">
              {/* Select Supercar Model */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Supercar Model</span>
                <div className="flex flex-col gap-2">
                  {(['supercar', 'roadster', 'titan'] as CarModelType[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedCar(m)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        selectedCar === m ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan' : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Underglow Color */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Neon Underglow</span>
                <div className="flex gap-3 justify-center pt-2">
                  {['#00f0ff', '#ff007f', '#10b981', '#facc15'].map(color => (
                    <button
                      key={color}
                      onClick={() => setUnderglowColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        underglowColor === color ? 'scale-125 border-2 border-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Select Track Environment */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Track Theme</span>
                <div className="flex flex-col gap-2">
                  {(['synthwave', 'rain', 'mars'] as TrackThemeType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTrackTheme(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        trackTheme === t ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink' : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyber-pink via-purple-600 to-cyber-cyan text-white font-black text-sm shadow-xl shadow-cyber-pink/30 hover:scale-105 active:scale-95 transition-all"
            >
              RACE NOW 🚀
            </button>
          </div>
        )}

        {/* Start / Gameover Overlay Modal */}
        {(gameState === 'start' || gameState === 'gameover') && (
          <div 
            onClick={startGame} 
            className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer z-10 p-6 text-center"
          >
            <h1 className="text-3xl md:text-5xl font-black tracking-widest text-cyber-cyan mb-2 drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">
              CYBER RACER 3D
            </h1>

            {/* Hall of Fame Leaderboard */}
            <div className="my-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 max-w-sm w-full">
              <span className="text-xs font-bold text-cyber-pink uppercase tracking-wider flex items-center justify-center gap-1 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Hall of Fame
              </span>
              <div className="space-y-1 text-xs">
                {hallOfFame.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-400">
                    <span>{idx + 1}. {entry.name}</span>
                    <span className="font-extrabold text-amber-400">{entry.score} PTS</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-2 px-8 py-3.5 font-black text-sm rounded-xl bg-gradient-to-r from-cyber-pink via-purple-600 to-cyber-cyan text-white shadow-xl shadow-cyber-pink/30 hover:scale-105 active:scale-95 transition-all">
              <Play className="w-5 h-5 fill-white" />
              <span>{gameState === 'start' ? 'START 3D RACE' : 'PLAY AGAIN'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controllers */}
      <div className="flex justify-between w-full mt-4 gap-4 select-none touch-none">
        <div className="flex gap-2">
          <button 
            onTouchStart={() => setMobileAction('left', true)}
            onTouchEnd={() => setMobileAction('left', false)}
            onMouseDown={() => setMobileAction('left', true)}
            onMouseUp={() => setMobileAction('left', false)}
            className="w-16 h-16 rounded-2xl border-2 border-cyber-cyan/40 bg-zinc-900/80 text-cyber-cyan font-black text-xl flex items-center justify-center active:bg-cyber-cyan/30 active:scale-95 shadow-lg select-none touch-none"
          >
            ◀
          </button>
          <button 
            onTouchStart={() => setMobileAction('right', true)}
            onTouchEnd={() => setMobileAction('right', false)}
            onMouseDown={() => setMobileAction('right', true)}
            onMouseUp={() => setMobileAction('right', false)}
            className="w-16 h-16 rounded-2xl border-2 border-cyber-cyan/40 bg-zinc-900/80 text-cyber-cyan font-black text-xl flex items-center justify-center active:bg-cyber-cyan/30 active:scale-95 shadow-lg select-none touch-none"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onTouchStart={() => setMobileAction('stop', true)}
            onTouchEnd={() => setMobileAction('stop', false)}
            onMouseDown={() => setMobileAction('stop', true)}
            onMouseUp={() => setMobileAction('stop', false)}
            className="w-16 h-16 rounded-2xl border-2 border-red-500/40 bg-red-950/40 text-red-400 font-extrabold text-xs flex items-center justify-center active:bg-red-900/50 active:scale-95 shadow-lg select-none touch-none"
          >
            BRAKE
          </button>
          <button 
            onTouchStart={() => setMobileAction('nitro', true)}
            onTouchEnd={() => setMobileAction('nitro', false)}
            onMouseDown={() => setMobileAction('nitro', true)}
            onMouseUp={() => setMobileAction('nitro', false)}
            disabled={nitro <= 0}
            className={`w-16 h-16 rounded-2xl border-2 border-cyber-pink/50 bg-cyber-pink/20 text-cyber-pink font-black text-xs flex items-center justify-center active:bg-cyber-pink/40 active:scale-95 shadow-lg select-none touch-none ${
              nitro <= 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            BOOST
          </button>
          <button 
            onTouchStart={() => setMobileAction('go', true)}
            onTouchEnd={() => setMobileAction('go', false)}
            onMouseDown={() => setMobileAction('go', true)}
            onMouseUp={() => setMobileAction('go', false)}
            className="w-16 h-16 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-black text-sm flex items-center justify-center active:bg-emerald-900/50 active:scale-95 shadow-lg select-none touch-none"
          >
            GAS!
          </button>
        </div>
      </div>
    </div>
  );
}
