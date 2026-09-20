"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Play, RotateCcw, Heart, Zap, Volume2, VolumeX, Shield, Award, Camera, 
  CloudRain, Sun, Flame, Sparkles, Trophy, Settings, Gauge, Compass, Eye 
} from 'lucide-react';

type CarModelType = 'supercar' | 'roadster' | 'titan';
type TrackThemeType = 'tokyo' | 'rain' | 'canyon';
type CameraViewType = 'chase' | 'cockpit' | 'hood' | 'topdown';

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
  const [trackTheme, setTrackTheme] = useState<TrackThemeType>('tokyo');
  const [cameraView, setCameraView] = useState<CameraViewType>('chase');

  // Stats HUD State
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(1000);
  const [gear, setGear] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitro, setNitro] = useState(100);
  const [hasShield, setHasShield] = useState(false);
  const [driftMultiplier, setDriftMultiplier] = useState(1);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [orbitalCooldown, setOrbitalCooldown] = useState(0);
  const [gameState, setGameState] = useState<'garage' | 'start' | 'playing' | 'crashed' | 'gameover'>('garage');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hallOfFame, setHallOfFame] = useState<HighScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState('PRA');

  // Physics & Game Loop State Refs
  const speedRef = useRef(0);
  const playerXRef = useRef(0);
  const playerRollRef = useRef(0);
  const playerPitchRef = useRef(0);
  const wheelRotationRef = useRef(0);
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
  const frontWheelsRef = useRef<THREE.Group[]>([]);
  const rearWheelsRef = useRef<THREE.Group[]>([]);
  const underglowLightRef = useRef<THREE.PointLight | null>(null);
  const playerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const playerFlameLightRef = useRef<THREE.PointLight | null>(null);
  const roadLinesMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);

  // Entities Pools
  const trafficCarsRef = useRef<{ group: THREE.Group; lane: number; z: number; speed: number }[]>([]);
  const pickupsRef = useRef<{ mesh: THREE.Mesh; type: 'coin' | 'nitro' | 'shield'; lane: number; z: number; collected: boolean }[]>([]);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { cameraViewRef.current = cameraView; }, [cameraView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHigh = localStorage.getItem('racer-highscore');
      if (savedHigh) setHighScore(Number(savedHigh));

      const savedHof = localStorage.getItem('racer-hof');
      if (savedHof) {
        try { setHallOfFame(JSON.parse(savedHof)); } catch (e) {}
      } else {
        setHallOfFame([
          { name: 'PRA', score: 32400 },
          { name: 'NEO', score: 24800 },
          { name: 'CYB', score: 18200 }
        ]);
      }
    }

    initThreeJS();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      if (!w || w === 0) return;
      const h = Math.min(720, Math.max(480, Math.round(w * 0.48)));
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const timer = setTimeout(handleResize, 150);

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
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

  // Web Audio Synthesizer for Realistic V8 Engine & Sound FX
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

    // Calculate gear (1 - 6) and RPM (1000 - 8000)
    let currentGear = 1;
    let gearMax = 60;
    if (speedVal > 280) { currentGear = 6; gearMax = 380; }
    else if (speedVal > 220) { currentGear = 5; gearMax = 280; }
    else if (speedVal > 160) { currentGear = 4; gearMax = 220; }
    else if (speedVal > 100) { currentGear = 3; gearMax = 160; }
    else if (speedVal > 45) { currentGear = 2; gearMax = 100; }
    setGear(currentGear);

    const gearRatio = (speedVal % gearMax) / gearMax;
    const calculatedRpm = Math.floor(1200 + gearRatio * 6800);
    setRpm(calculatedRpm);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    const isNitro = isNitroActiveRef.current;
    const freq = 60 + (calculatedRpm / 8000) * 160 + (isNitro ? 80 : 0);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.003, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playSoundEffect = (type: 'coin' | 'nitro' | 'shield' | 'crash' | 'drift' | 'orbital') => {
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
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.25);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'orbital') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'crash') {
      const bufferSize = ctx.sampleRate * 0.7;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + 0.7);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    }
  };

  // Three.js WebGL 3D Engine Initialization
  const initThreeJS = () => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const width = containerRef.current.clientWidth || 1200;
    const height = Math.min(720, Math.max(480, Math.round(width * 0.48)));

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.2, -15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.5);
    dirLight.position.set(25, 50, -25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    applyTrackTheme(scene, trackTheme);
    rebuildPlayerCar(scene, selectedCar, underglowColor);
    create3DRoad(scene);
    create3DCity(scene);
    create3DTrafficCars(scene);
    create3DPickups(scene);
  };

  // Track Theme Switcher (Tokyo Night / Monaco Rain / Red Canyon)
  const applyTrackTheme = (scene: THREE.Scene, theme: TrackThemeType) => {
    if (theme === 'rain') {
      scene.background = new THREE.Color('#030712');
      scene.fog = new THREE.FogExp2('#030712', 0.007);

      if (!rainParticlesRef.current) {
        const rainGeo = new THREE.BufferGeometry();
        const rainCount = 1400;
        const pos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount * 3; i += 3) {
          pos[i] = (Math.random() - 0.5) * 60;
          pos[i + 1] = Math.random() * 40;
          pos[i + 2] = (Math.random() - 0.5) * 300;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const rainMat = new THREE.PointsMaterial({ color: '#38bdf8', size: 0.25, transparent: true, opacity: 0.65 });
        const rain = new THREE.Points(rainGeo, rainMat);
        scene.add(rain);
        rainParticlesRef.current = rain;
      }
    } else if (theme === 'canyon') {
      scene.background = new THREE.Color('#1f0804');
      scene.fog = new THREE.FogExp2('#1f0804', 0.006);
      if (rainParticlesRef.current) { scene.remove(rainParticlesRef.current); rainParticlesRef.current = null; }
    } else {
      scene.background = new THREE.Color('#020617');
      scene.fog = new THREE.FogExp2('#020617', 0.005);
      if (rainParticlesRef.current) { scene.remove(rainParticlesRef.current); rainParticlesRef.current = null; }
    }
  };

  // Rebuild High-Detail Realistic 3D Sports Supercar Model
  const rebuildPlayerCar = (scene: THREE.Scene, model: CarModelType, glowColor: string) => {
    if (playerCarGroupRef.current) scene.remove(playerCarGroupRef.current);

    const carGroup = new THREE.Group();
    frontWheelsRef.current = [];
    rearWheelsRef.current = [];

    // Metallic Car Paint Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      metalness: 0.9,
      roughness: 0.12,
      emissive: glowColor,
      emissiveIntensity: 0.15
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: '#090d16',
      metalness: 0.95,
      roughness: 0.25
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.98,
      roughness: 0.05
    });

    const brakeMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      metalness: 0.6,
      roughness: 0.3
    });

    let bodyWidth = 2.05, bodyHeight = 0.52, bodyLength = 4.4;
    if (model === 'roadster') { bodyWidth = 1.95; bodyHeight = 0.46; bodyLength = 4.1; }
    if (model === 'titan') { bodyWidth = 2.35; bodyHeight = 0.82; bodyLength = 4.7; }

    // 1. Lower Main Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight * 0.6, bodyLength);
    const chassisMesh = new THREE.Mesh(chassisGeo, bodyMat);
    chassisMesh.position.y = bodyHeight * 0.3 + 0.22;
    chassisMesh.castShadow = true;
    carGroup.add(chassisMesh);

    // 2. Slanted Front Nose Bonnet / Hood
    const hoodGeo = new THREE.BoxGeometry(bodyWidth * 0.94, bodyHeight * 0.45, bodyLength * 0.35);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.position.set(0, bodyHeight * 0.48 + 0.2, -bodyLength * 0.25);
    hoodMesh.rotation.x = 0.08; // Slanted aerodynamic hood angle
    carGroup.add(hoodMesh);

    // Front Aerodynamic Carbon Splitter Bumper
    const splitterGeo = new THREE.BoxGeometry(bodyWidth * 1.02, 0.08, 0.5);
    const splitterMesh = new THREE.Mesh(splitterGeo, carbonMat);
    splitterMesh.position.set(0, 0.15, -bodyLength / 2 - 0.1);
    carGroup.add(splitterMesh);

    // 3. Aerodynamic Teardrop Cabin & Curved Tinted Glass
    const glassMat = new THREE.MeshStandardMaterial({ 
      color: '#020617', 
      metalness: 0.98, 
      roughness: 0.02, 
      opacity: 0.88, 
      transparent: true 
    });
    const cabinGeo = new THREE.BoxGeometry(bodyWidth * 0.8, bodyHeight * 0.75, bodyLength * 0.42);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, bodyHeight + 0.22, 0.1);
    carGroup.add(cabinMesh);

    // Carbon Roof Top
    const roofGeo = new THREE.BoxGeometry(bodyWidth * 0.76, 0.06, bodyLength * 0.38);
    const roofMesh = new THREE.Mesh(roofGeo, carbonMat);
    roofMesh.position.set(0, bodyHeight + 0.6, 0.1);
    carGroup.add(roofMesh);

    // Side Mirrors (Left & Right)
    const mirrorGeo = new THREE.BoxGeometry(0.22, 0.12, 0.18);
    const mirrorLeft = new THREE.Mesh(mirrorGeo, carbonMat);
    mirrorLeft.position.set(-bodyWidth / 2 - 0.12, bodyHeight + 0.25, -bodyLength * 0.1);
    carGroup.add(mirrorLeft);

    const mirrorRight = new THREE.Mesh(mirrorGeo, carbonMat);
    mirrorRight.position.set(bodyWidth / 2 + 0.12, bodyHeight + 0.25, -bodyLength * 0.1);
    carGroup.add(mirrorRight);

    // 4. Rear Carbon Diffuser & Quad Exhaust Tips
    const diffuserGeo = new THREE.BoxGeometry(bodyWidth * 0.96, 0.15, 0.4);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuserMesh.position.set(0, 0.2, bodyLength / 2 + 0.1);
    carGroup.add(diffuserMesh);

    // Quad Chrome Exhaust Pipe Outlets
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 16);
    [-0.5, -0.3, 0.3, 0.5].forEach((offset) => {
      const exhaustMesh = new THREE.Mesh(exhaustGeo, chromeMat);
      exhaustMesh.rotation.x = Math.PI / 2;
      exhaustMesh.position.set(offset, 0.22, bodyLength / 2 + 0.2);
      carGroup.add(exhaustMesh);
    });

    // 5. Active GT Spoiler Wing with Dual Upright Mounts
    const stanchionGeo = new THREE.BoxGeometry(0.06, 0.35, 0.12);
    const stanchionLeft = new THREE.Mesh(stanchionGeo, carbonMat);
    stanchionLeft.position.set(-bodyWidth * 0.3, bodyHeight + 0.35, bodyLength / 2 - 0.3);
    carGroup.add(stanchionLeft);

    const stanchionRight = new THREE.Mesh(stanchionGeo, carbonMat);
    stanchionRight.position.set(bodyWidth * 0.3, bodyHeight + 0.35, bodyLength / 2 - 0.3);
    carGroup.add(stanchionRight);

    const spoilerWingGeo = new THREE.BoxGeometry(bodyWidth * 1.08, 0.05, 0.42);
    const spoilerMesh = new THREE.Mesh(spoilerWingGeo, carbonMat);
    spoilerMesh.position.set(0, bodyHeight + 0.52, bodyLength / 2 - 0.3);
    carGroup.add(spoilerMesh);

    // 6. Detailed 3D Alloy Wheels & Red Brake Calipers Helper
    const createRealisticWheel = (x: number, y: number, z: number, isFront: boolean) => {
      const wheelGroup = new THREE.Group();
      
      // Outer Rubber Treaded Tire
      const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 32);
      const tireMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });
      const tireMesh = new THREE.Mesh(tireGeo, tireMat);
      tireMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(tireMesh);

      // Inner Metallic Star Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.29, 16);
      const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
      rimMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(rimMesh);

      // Red Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.12, 0.18, 0.18);
      const caliperMesh = new THREE.Mesh(caliperGeo, brakeMat);
      caliperMesh.position.set(x > 0 ? -0.05 : 0.05, 0.12, 0);
      wheelGroup.add(caliperMesh);

      wheelGroup.position.set(x, y, z);
      carGroup.add(wheelGroup);

      if (isFront) frontWheelsRef.current.push(wheelGroup);
      else rearWheelsRef.current.push(wheelGroup);
    };

    createRealisticWheel(-bodyWidth / 2 - 0.05, 0.38, -bodyLength * 0.28, true);  // Front Left
    createRealisticWheel(bodyWidth / 2 + 0.05, 0.38, -bodyLength * 0.28, true);   // Front Right
    createRealisticWheel(-bodyWidth / 2 - 0.05, 0.38, bodyLength * 0.28, false);  // Rear Left
    createRealisticWheel(bodyWidth / 2 + 0.05, 0.38, bodyLength * 0.28, false);   // Rear Right

    // 7. Headlights (Projected Xenon LED Spotlights)
    const headlightLeft = new THREE.SpotLight('#ffffff', 6, 60, Math.PI / 5, 0.3);
    headlightLeft.position.set(-0.85, 0.55, -bodyLength / 2);
    headlightLeft.target.position.set(-0.85, 0, -35);
    carGroup.add(headlightLeft);
    carGroup.add(headlightLeft.target);

    const headlightRight = new THREE.SpotLight('#ffffff', 6, 60, Math.PI / 5, 0.3);
    headlightRight.position.set(0.85, 0.55, -bodyLength / 2);
    headlightRight.target.position.set(0.85, 0, -35);
    carGroup.add(headlightRight);
    carGroup.add(headlightRight.target);

    // 8. 3D LED Taillight Light Bar
    const tailMat = new THREE.MeshStandardMaterial({ color: '#ff0055', emissive: '#ff0055', emissiveIntensity: 4.0 });
    const tailGeo = new THREE.BoxGeometry(bodyWidth * 0.94, 0.08, 0.05);
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.position.set(0, bodyHeight * 0.7, bodyLength / 2 + 0.02);
    carGroup.add(tailMesh);

    // 9. Underglow Neon Light
    const underglowLight = new THREE.PointLight(glowColor, 4.0, 14);
    underglowLight.position.set(0, 0.1, 0);
    carGroup.add(underglowLight);
    underglowLightRef.current = underglowLight;

    // 10. Exhaust Nitro Flame Cone
    const flameGeo = new THREE.ConeGeometry(0.38, 1.6, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0 });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.rotation.x = Math.PI / 2;
    flameMesh.position.set(0, 0.35, bodyLength / 2 + 0.8);
    carGroup.add(flameMesh);
    playerFlameMeshRef.current = flameMesh;

    const flameLight = new THREE.PointLight(glowColor, 0, 15);
    flameLight.position.set(0, 0.35, bodyLength / 2 + 0.8);
    carGroup.position.set(0, 0, 0);
    scene.add(carGroup);
    playerCarGroupRef.current = carGroup;
  };

  const create3DRoad = (scene: THREE.Scene) => {
    const roadGeo = new THREE.PlaneGeometry(16, 400);
    const roadMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.35, metalness: 0.4 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -180);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Highway Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.9, roughness: 0.2 });
    const railGeo = new THREE.BoxGeometry(0.4, 0.6, 400);

    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(-8.2, 0.4, -180);
    scene.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(8.2, 0.4, -180);
    scene.add(railRight);

    // Center Dashed Lines
    const lineGeo = new THREE.PlaneGeometry(0.3, 4.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
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
    const buildingMat = new THREE.MeshStandardMaterial({ color: '#050b1a', metalness: 0.85, roughness: 0.2, emissive: '#02132b', emissiveIntensity: 0.4 });

    for (let i = 0; i < 60; i++) {
      const bMesh = new THREE.Mesh(boxGeo, buildingMat);
      const height = 18 + Math.random() * 50;
      const width = 9 + Math.random() * 14;
      const depth = 9 + Math.random() * 14;
      const side = (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 25);
      bMesh.scale.set(width, height, depth);
      bMesh.position.set(side, height / 2, -i * 12);
      buildingsGroup.add(bMesh);
    }
    scene.add(buildingsGroup);
  };

  const create3DTrafficCars = (scene: THREE.Scene) => {
    const cars: { group: THREE.Group; lane: number; z: number; speed: number }[] = [];
    const carColors = ['#ff0055', '#facc15', '#a855f7', '#10b981', '#38bdf8'];
    const lanes = [-4.5, 0, 4.5];

    for (let i = 0; i < 15; i++) {
      const carGroup = new THREE.Group();
      const color = carColors[i % carColors.length];

      const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 });
      const bodyGeo = new THREE.BoxGeometry(1.9, 0.6, 3.8);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 0.5;
      carGroup.add(bodyMesh);

      const tailMat = new THREE.MeshBasicMaterial({ color: '#ff0055' });
      const tailGeo = new THREE.BoxGeometry(1.7, 0.1, 0.05);
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      tailMesh.position.set(0, 0.55, 1.91);
      carGroup.add(tailMesh);

      const lane = lanes[i % lanes.length];
      const z = -40 - i * 25;
      carGroup.position.set(lane, 0, z);

      scene.add(carGroup);
      cars.push({ group: carGroup, lane, z, speed: 30 + Math.random() * 20 });
    }
    trafficCarsRef.current = cars;
  };

  const create3DPickups = (scene: THREE.Scene) => {
    const pickups: { mesh: THREE.Mesh; type: 'coin' | 'nitro' | 'shield'; lane: number; z: number; collected: boolean }[] = [];
    const lanes = [-4.5, 0, 4.5];

    const coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16);
    const coinMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.1 });

    const nitroGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const nitroMat = new THREE.MeshStandardMaterial({ color: '#00f0ff', emissive: '#00f0ff', emissiveIntensity: 0.9 });

    const shieldGeo = new THREE.OctahedronGeometry(0.75);
    const shieldMat = new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#a855f7', emissiveIntensity: 0.9 });

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

  // Keyboard Event Handlers
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
    const views: CameraViewType[] = ['chase', 'cockpit', 'hood', 'topdown'];
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
    playerRollRef.current = 0;

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

  const triggerOrbitalStrike = () => {
    if (orbitalCooldown > 0 || gameStateRef.current !== 'playing') return;

    setOrbitalCooldown(12);
    screenShakeRef.current = 20;
    playSoundEffect('orbital');
    addFloatingText('SATELLITE ORBITAL STRIKE! +1000', '#10b981');
    scoreRef.current += 1000;
    setScore(scoreRef.current);

    // Clear traffic in current lane
    trafficCarsRef.current.forEach(car => {
      if (Math.abs(car.group.position.x - playerXRef.current) < 2.2 && car.z < 0 && car.z > -120) {
        car.z -= 220;
        car.group.position.z = car.z;
      }
    });
  };

  const lastTimeRef = useRef(0);

  // Main Physics Loop with Vehicle Handling Dynamics
  const gameLoop = (now: number) => {
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover' || gameStateRef.current === 'garage') return;

    const dt = Math.min(0.08, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    setOrbitalCooldown(prev => Math.max(0, prev - dt));

    update3DPhysics(dt);
    render3DScene();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const update3DPhysics = (dt: number) => {
    const maxSpeedLimit = isNitroActiveRef.current ? 390 : (selectedCar === 'roadster' ? 320 : (selectedCar === 'titan' ? 280 : 300));

    if (gameStateRef.current === 'playing') {
      // Drift & Steering Physics
      const isSteering = keyLeftRef.current || keyRightRef.current;
      if (isSteering && speedRef.current > 160) {
        driftComboRef.current += dt * 2.8;
        const mult = Math.min(5, Math.floor(driftComboRef.current) + 1);
        setDriftMultiplier(mult);
      } else {
        driftComboRef.current = Math.max(0, driftComboRef.current - dt * 2.5);
        if (driftComboRef.current === 0) setDriftMultiplier(1);
      }

      scoreRef.current += Math.round(speedRef.current * dt * 0.1 * (1 + (driftComboRef.current * 0.4)));
      setScore(scoreRef.current);

      if (keyNitroRef.current && nitroRef.current > 0 && speedRef.current > 60) {
        isNitroActiveRef.current = true;
        setIsNitroActive(true);
        nitroRef.current = Math.max(0, nitroRef.current - dt * 45);
        setNitro(nitroRef.current);
        speedRef.current = Math.min(maxSpeedLimit, speedRef.current + 250 * dt);
      } else {
        isNitroActiveRef.current = false;
        setIsNitroActive(false);
        nitroRef.current = Math.min(100, nitroRef.current + dt * 8);
        setNitro(nitroRef.current);

        if (keyFasterRef.current) speedRef.current = Math.min(maxSpeedLimit, speedRef.current + 125 * dt);
        else if (keySlowerRef.current) speedRef.current = Math.max(0, speedRef.current - 350 * dt);
        else speedRef.current = Math.max(0, speedRef.current - 70 * dt);
      }

      setSpeed(speedRef.current);
      playEngineSound(speedRef.current);

      const steerFactor = isNitroActiveRef.current ? 8.0 : (selectedCar === 'roadster' ? 11.0 : 9.5);
      if (keyLeftRef.current) playerXRef.current = Math.max(-5.5, playerXRef.current - dt * steerFactor);
      else if (keyRightRef.current) playerXRef.current = Math.min(5.5, playerXRef.current + dt * steerFactor);
    } else if (gameStateRef.current === 'crashed') {
      isNitroActiveRef.current = false;
      setIsNitroActive(false);
      speedRef.current = Math.max(0, speedRef.current - 420 * dt);
      setSpeed(speedRef.current);
    }

    // Realistic Car Suspension Pitch & Steering Wheel Rotation
    if (playerCarGroupRef.current) {
      playerCarGroupRef.current.position.x = playerXRef.current;

      // Body roll into corners
      const targetRoll = keyLeftRef.current ? 0.16 : (keyRightRef.current ? -0.16 : 0);
      playerRollRef.current += (targetRoll - playerRollRef.current) * 0.15;
      playerCarGroupRef.current.rotation.z = playerRollRef.current;

      // Wheel rotation on axle
      wheelRotationRef.current += (speedRef.current * dt * 0.2);
      frontWheelsRef.current.forEach(w => {
        w.rotation.x = wheelRotationRef.current;
        w.rotation.y = keyLeftRef.current ? 0.35 : (keyRightRef.current ? -0.35 : 0);
      });
      rearWheelsRef.current.forEach(w => {
        w.rotation.x = wheelRotationRef.current;
      });

      if (playerFlameMeshRef.current && playerFlameLightRef.current) {
        if (isNitroActiveRef.current) {
          (playerFlameMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
          playerFlameLightRef.current.intensity = 4.5;
        } else {
          (playerFlameMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
          playerFlameLightRef.current.intensity = 0;
        }
      }
    }

    // Dynamic Camera Angles (Chase / Cockpit / Hood / Topdown)
    if (cameraRef.current) {
      if (cameraViewRef.current === 'cockpit') {
        cameraRef.current.position.set(playerXRef.current, 1.25, 0.1);
        cameraRef.current.lookAt(playerXRef.current, 1.05, -25);
      } else if (cameraViewRef.current === 'hood') {
        cameraRef.current.position.set(playerXRef.current, 1.1, -1.2);
        cameraRef.current.lookAt(playerXRef.current, 1.0, -25);
      } else if (cameraViewRef.current === 'topdown') {
        cameraRef.current.position.set(playerXRef.current * 0.5, 19, -4);
        cameraRef.current.lookAt(playerXRef.current * 0.5, 0, -18);
      } else {
        // Realistic Dynamic Chase Cam with inertia follow
        const targetFOV = isNitroActiveRef.current ? 82 : (62 + (speedRef.current / 300) * 10);
        cameraRef.current.fov += (targetFOV - cameraRef.current.fov) * 0.1;
        cameraRef.current.updateProjectionMatrix();

        if (screenShakeRef.current > 0) {
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
          cameraRef.current.position.x = (Math.random() - 0.5) * screenShakeRef.current * 0.2;
          cameraRef.current.position.y = 3.2 + (Math.random() - 0.5) * screenShakeRef.current * 0.2;
        } else {
          cameraRef.current.position.x = playerXRef.current * 0.25;
          cameraRef.current.position.y = 3.2;
        }
      }
    }

    // Move Rain particles
    if (rainParticlesRef.current) {
      const pos = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= dt * 50;
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
      if (p.z > 10) { p.z -= 420; p.collected = false; p.mesh.visible = true; p.lane = [-4.5, 0, 4.5][Math.floor(Math.random() * 3)]; p.mesh.position.x = p.lane; }
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
      if (car.z > 15) { car.z -= 380; car.lane = [-4.5, 0, 4.5][Math.floor(Math.random() * 3)]; car.group.position.x = car.lane; }
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
      addFloatingText('SHIELD ABSORBED IMPACT!', '#38bdf8');
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
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 glass-card w-full max-w-[1700px] font-sans">
      {/* Top Controls Bar */}
      <div className="flex justify-between items-center w-full mb-4 px-2 font-mono">
        <h3 className="text-xl md:text-2xl font-black text-cyber-pink tracking-wider neon-glow-text flex items-center gap-2">
          <span>🏎️</span> REALISTIC 3D RACER
        </h3>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={cycleCameraView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-cyber-cyan hover:text-white transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="uppercase">{cameraView}</span>
          </button>

          <button 
            onClick={() => setGameState(gameState === 'garage' ? 'start' : 'garage')}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Garage Customizer"
          >
            <Settings className="w-4 h-4 text-cyber-pink" />
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Audio Synthesizer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>
          
          <div className="text-xs md:text-sm text-zinc-400 font-bold ml-2">
            RECORD: <span className="text-gradient text-base font-extrabold ml-1">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Realistic Telemetry Dashboard Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full mb-4 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono">
        {/* Speedometer */}
        <div className="flex flex-col items-center justify-center border-r border-zinc-800/80 pr-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyber-cyan" /> SPEED
          </span>
          <span className={`text-xl md:text-2xl font-black ${isNitroActive ? 'text-cyber-pink animate-pulse' : 'text-cyber-cyan'}`}>
            {Math.round(speed)} <small className="text-[10px] font-normal text-zinc-400">KM/H</small>
          </span>
        </div>

        {/* Tachometer RPM & Gear */}
        <div className="flex flex-col items-center justify-center border-r border-zinc-800/80 pr-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">TACH / GEAR</span>
          <span className="text-sm font-black text-amber-400 flex items-center gap-1">
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">G{gear}</span>
            <span>{rpm} RPM</span>
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center border-r border-zinc-800/80 pr-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">SCORE</span>
          <span className="text-xl md:text-2xl font-black text-white">
            {score} {driftMultiplier > 1 && <small className="text-xs text-cyber-pink font-bold ml-1">x{driftMultiplier}</small>}
          </span>
        </div>

        {/* Coins */}
        <div className="flex flex-col items-center justify-center border-r border-zinc-800/80 pr-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span>🪙</span> COINS
          </span>
          <span className="text-xl md:text-2xl font-black text-amber-400">{coins}</span>
        </div>

        {/* Nitro Meter */}
        <div className="flex flex-col items-center justify-center border-r border-zinc-800/80 pr-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-cyan" /> NITRO
          </span>
          <div className="w-16 md:w-20 h-2.5 bg-zinc-950 rounded-full overflow-hidden mt-1 border border-zinc-700">
            <div 
              className={`h-full rounded-full transition-all duration-75 ${
                isNitroActive ? 'bg-gradient-to-r from-cyber-pink to-amber-500 animate-pulse' : 'bg-gradient-to-r from-cyber-cyan to-blue-500'
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>
        </div>

        {/* Lives */}
        <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">VEHICLE LIVES</span>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-4 h-4 ${idx < lives ? 'text-red-500 fill-red-500 animate-bounce' : 'text-zinc-800'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D WebGL Viewport Container */}
      <div className="relative w-full min-h-[480px] md:min-h-[660px] border-2 border-cyber-cyan/40 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] bg-black font-sans">
        <div ref={containerRef} className="w-full h-full min-h-[480px] md:min-h-[660px] flex items-center justify-center overflow-hidden block" />

        {/* God's Eye View Tactical Satellite Overlay */}
        {cameraView === 'topdown' && gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-mono select-none">
            {/* Top Satellite Telemetry Bar */}
            <div className="flex justify-between items-start bg-black/60 backdrop-blur-md p-3 rounded-xl border border-emerald-500/40 text-[10px] text-emerald-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="font-extrabold uppercase tracking-widest text-emerald-300">
                  📡 GOD'S EYE SATELLITE RADAR - LAT 35.67° N / LON 139.65° E
                </span>
              </div>
              <div className="text-right">
                <span className="block text-zinc-400">TARGET LOCK: ACTIVE</span>
                <span className="text-cyber-cyan font-bold">ALT: 450M | SCAN: 60Hz</span>
              </div>
            </div>

            {/* Center Reticle Scanning Grid Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-full animate-spin-slow flex items-center justify-center">
                <div className="w-48 h-48 border border-emerald-500/50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </div>
            </div>

            {/* Bottom Orbital Laser Strike Action Control */}
            <div className="flex justify-center pointer-events-auto pb-4">
              <button
                onClick={triggerOrbitalStrike}
                disabled={orbitalCooldown > 0}
                className={`px-6 py-3 rounded-2xl font-black text-xs md:text-sm tracking-widest uppercase transition-all flex items-center gap-2 shadow-2xl backdrop-blur-md ${
                  orbitalCooldown > 0
                    ? 'bg-zinc-900/80 text-zinc-500 border border-zinc-800 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyber-cyan text-zinc-950 border border-emerald-400 shadow-emerald-500/50 hover:scale-105 active:scale-95 animate-pulse'
                }`}
              >
                <span>📡⚡</span>
                <span>
                  {orbitalCooldown > 0 
                    ? `ORBITAL RECHARGE (${Math.ceil(orbitalCooldown)}s)` 
                    : 'ORBITAL LASER STRIKE [READY]'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Garage Customization Screen */}
        {gameState === 'garage' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center space-y-6">
            <h2 className="text-2xl font-black text-cyber-cyan flex items-center gap-2 font-mono">
              <span>🏎️</span> REALISTIC 3D RACING GARAGE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl font-mono text-xs">
              {/* Select Supercar Model */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Car Chassis Model</span>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'supercar', label: '🏎️ Gran Turismo GT' },
                    { id: 'roadster', label: '🏎️ Le Mans GT' },
                    { id: 'titan', label: '🛻 V8 Muscle Titan' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedCar(m.id as CarModelType)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedCar === m.id ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan' : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Underglow Color */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Neon Paint & Underglow</span>
                <div className="grid grid-cols-4 gap-2">
                  {['#00f0ff', '#ff007f', '#facc15', '#10b981', '#a855f7', '#ef4444', '#ffffff', '#3b82f6'].map(color => (
                    <button
                      key={color}
                      onClick={() => setUnderglowColor(color)}
                      className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${
                        underglowColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Select Real-World Track Theme */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Race Environment</span>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'tokyo', label: '🌃 Tokyo Night Highway' },
                    { id: 'rain', label: '🌧️ Monaco Rain Circuit' },
                    { id: 'canyon', label: '🏜️ Red Canyon Grand Prix' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTrackTheme(t.id as TrackThemeType)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        trackTheme === t.id ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink' : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan via-blue-500 to-cyber-pink text-zinc-950 font-black text-sm tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyber-cyan/30 flex items-center gap-2 font-mono"
            >
              <Play className="w-5 h-5 fill-zinc-950" /> ENTER REAL-WORLD RACE
            </button>
          </div>
        )}

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center space-y-4 font-mono">
            <h3 className="text-2xl font-black text-white">READY TO RACE?</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              Steer with <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-white">A / D</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-white">← / →</kbd>. Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-white">SHIFT</kbd> for Nitro!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-cyber-cyan text-zinc-950 font-black text-xs hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-cyber-cyan/30"
            >
              <Play className="w-4 h-4 fill-zinc-950" /> START RACE
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center space-y-4 font-mono">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-2xl font-black text-white">RACE FINISHED!</h3>
            <p className="text-xs text-zinc-400">Final Score: {score} | Coins: {coins}</p>

            {/* Hall of Fame Leaderboard */}
            <div className="w-full max-w-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="font-bold text-cyber-cyan block mb-2 uppercase">🏆 Hall of Fame Top Racers</span>
              <div className="space-y-1">
                {hallOfFame.map((entry, idx) => (
                  <div key={idx} className="flex justify-between font-bold text-zinc-300">
                    <span>{idx + 1}. {entry.name}</span>
                    <span className="text-amber-400">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-cyber-cyan text-zinc-950 font-black text-xs hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-cyber-cyan/30"
            >
              <RotateCcw className="w-4 h-4" /> RETRY RACE
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controllers */}
      <div className="grid grid-cols-6 gap-1.5 w-full mt-3 font-mono select-none touch-none">
        <button
          onMouseDown={() => setMobileAction('left', true)} onMouseUp={() => setMobileAction('left', false)}
          onTouchStart={(e) => { e.preventDefault(); setMobileAction('left', true); }} onTouchEnd={(e) => { e.preventDefault(); setMobileAction('left', false); }}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-black text-center text-lg active:bg-zinc-800 touch-none select-none"
        >
          ◀
        </button>
        <button
          onMouseDown={() => setMobileAction('right', true)} onMouseUp={() => setMobileAction('right', false)}
          onTouchStart={(e) => { e.preventDefault(); setMobileAction('right', true); }} onTouchEnd={(e) => { e.preventDefault(); setMobileAction('right', false); }}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-black text-center text-lg active:bg-zinc-800 touch-none select-none"
        >
          ▶
        </button>
        <button
          onMouseDown={() => setMobileAction('go', true)} onMouseUp={() => setMobileAction('go', false)}
          onTouchStart={(e) => { e.preventDefault(); setMobileAction('go', true); }} onTouchEnd={(e) => { e.preventDefault(); setMobileAction('go', false); }}
          className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs text-center active:bg-emerald-500/40 touch-none select-none"
        >
          GAS
        </button>
        <button
          onMouseDown={() => setMobileAction('stop', true)} onMouseUp={() => setMobileAction('stop', false)}
          onTouchStart={(e) => { e.preventDefault(); setMobileAction('stop', true); }} onTouchEnd={(e) => { e.preventDefault(); setMobileAction('stop', false); }}
          className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-xs text-center active:bg-red-500/40 touch-none select-none"
        >
          BRAKE
        </button>
        <button
          onMouseDown={() => setMobileAction('nitro', true)} onMouseUp={() => setMobileAction('nitro', false)}
          onTouchStart={(e) => { e.preventDefault(); setMobileAction('nitro', true); }} onTouchEnd={(e) => { e.preventDefault(); setMobileAction('nitro', false); }}
          className="p-3 rounded-xl bg-cyber-pink/20 border border-cyber-pink/40 text-cyber-pink font-bold text-xs text-center active:bg-cyber-pink/40 touch-none select-none"
        >
          NITRO
        </button>
        <button
          onClick={cycleCameraView}
          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all touch-none select-none ${
            cameraView === 'topdown' 
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-black animate-pulse'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
          title="Toggle Camera View (Chase / Hood / Cockpit / God's Eye Topdown)"
        >
          {cameraView === 'topdown' ? '📡 RADAR' : '🎥 CAM'}
        </button>
      </div>
    </div>
  );
}
