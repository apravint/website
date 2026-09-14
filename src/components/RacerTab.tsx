"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Heart, Zap, Award, Flame, Shield, Volume2, VolumeX } from 'lucide-react';

interface ScreenPoint {
  x: number;
  y: number;
  w: number;
}

interface WorldPoint {
  x: number;
  y: number;
  z: number;
}

interface RoadPoint {
  world: WorldPoint;
  screen: ScreenPoint;
}

interface GameSprite {
  x: number;
  type: 'tree' | 'billboard' | 'palm' | 'cyberpost' | 'neonSign';
  scale: number;
}

interface Pickup {
  id: number;
  z: number;
  x: number;
  type: 'nitro' | 'coin' | 'shield';
  collected: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

interface Car {
  z: number;
  x: number;
  speed: number;
  color: string;
  width: number;
  driftDirection: number;
  model: 'sedan' | 'sports' | 'truck';
}

interface Segment {
  index: number;
  p1: RoadPoint;
  p2: RoadPoint;
  curve: number;
  y: number;
  color: {
    road: string;
    grass: string;
    rumble: string;
    lane?: string;
  };
  sprites: GameSprite[];
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
}

export default function RacerTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const requestRef = useRef<number | null>(null);

  // Game Parameters & Constants
  const FPS = 60;
  const STEP = 1 / FPS;
  const ROAD_WIDTH = 2000;
  const SEGMENT_LENGTH = 200;
  const RUMBLE_LENGTH = 3;
  const CAMERA_DEPTH = 0.84;
  const DRAW_DISTANCE = 320;
  const BASE_MAX_SPEED = 290;
  const NITRO_MAX_SPEED = 380;
  const totalCars = 18;

  // Track State
  const [segments, setSegments] = useState<Segment[]>([]);
  const roadLengthRef = useRef(0);

  // Stats HUD State
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitro, setNitro] = useState(100);
  const [hasShield, setHasShield] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'crashed' | 'gameover'>('start');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Physics & Animation Refs
  const positionRef = useRef(0);
  const playerXRef = useRef(0);
  const playerYRef = useRef(0);
  const speedRef = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const nitroRef = useRef(100);
  const shieldRef = useRef(false);
  const isNitroActiveRef = useRef(false);
  const gameStateRef = useRef<'start' | 'playing' | 'crashed' | 'gameover'>('start');
  const crashTimerRef = useRef(0);
  const screenShakeRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const skyOffsetRef = useRef(0);
  const soundEnabledRef = useRef(true);

  // Controls Refs
  const keyLeftRef = useRef(false);
  const keyRightRef = useRef(false);
  const keyFasterRef = useRef(false);
  const keySlowerRef = useRef(false);
  const keyNitroRef = useRef(false);

  // Game Entities Refs
  const carsRef = useRef<Car[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextPickupIdRef = useRef(1);

  // Color Palette
  const colors = {
    sky: '#040714',
    sunsetGlow: '#ff007f',
    gridLines: '#00f0ff',
    lightGrass: '#081726',
    darkGrass: '#040d17',
    lightRumble: '#00f0ff',
    darkRumble: '#ff007f',
    lightRoad: '#111728',
    darkRoad: '#0b0f1b',
    laneMarker: '#38bdf8'
  };

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('racer-highscore');
      if (saved) setHighScore(Number(saved));
    }

    // Init Synthwave Stars
    const tempStars: Star[] = [];
    for (let i = 0; i < 110; i++) {
      tempStars.push({
        x: Math.random() * 800,
        y: Math.random() * 220,
        size: 0.6 + Math.random() * 2.0,
        brightness: Math.random()
      });
    }
    starsRef.current = tempStars;

    buildTrack();
    resetCars();
    spawnPickups();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const buildTrack = () => {
    const tempSegments: Segment[] = [];
    const RUMBLE_L = RUMBLE_LENGTH;

    const addSegment = (curve: number, y: number) => {
      const n = tempSegments.length;
      const lastY = n > 0 ? tempSegments[n - 1].y : 0;
      const isEven = Math.floor(n / RUMBLE_L) % 2 === 0;

      const segmentColors = {
        road: isEven ? colors.lightRoad : colors.darkRoad,
        grass: isEven ? colors.lightGrass : colors.darkGrass,
        rumble: isEven ? colors.lightRumble : colors.darkRumble,
        lane: isEven ? colors.laneMarker : undefined
      };

      const sprites: GameSprite[] = [];
      if (n % 8 === 0 && n > 40) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const rand = Math.random();
        const type = rand > 0.6 ? 'neonSign' : (rand > 0.3 ? 'cyberpost' : 'palm');
        sprites.push({ x: side * (1.6 + Math.random() * 0.7), type, scale: 1.1 });
      }

      tempSegments.push({
        index: n,
        p1: { world: { x: 0, y: lastY, z: n * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        p2: { world: { x: 0, y: lastY + y, z: (n + 1) * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        curve: curve,
        y: lastY + y,
        color: segmentColors,
        sprites: sprites
      });
    };

    const addStraight = (num: number) => { for (let i = 0; i < num; i++) addSegment(0, 0); };
    const addHill = (num: number, height: number) => { for (let i = 0; i < num; i++) addSegment(0, Math.sin((i / num) * Math.PI) * height); };
    const addCurve = (num: number, curve: number, height: number) => { for (let i = 0; i < num; i++) addSegment(curve, Math.sin((i / num) * Math.PI) * height); };

    addStraight(80);
    addCurve(70, 2.5, 0);
    addHill(90, 50);
    addCurve(110, -3.5, -25);
    addStraight(70);
    addHill(110, -60);
    addCurve(90, 4.5, 35);
    addStraight(80);
    addCurve(70, -2.5, 0);

    const totalSegments = tempSegments.length;
    for (let i = 0; i < totalSegments; i++) {
      const cloned = JSON.parse(JSON.stringify(tempSegments[i]));
      cloned.index = totalSegments + i;
      tempSegments.push(cloned);
    }

    setSegments(tempSegments);
    roadLengthRef.current = tempSegments.length * SEGMENT_LENGTH;
  };

  const resetCars = () => {
    const tempCars: Car[] = [];
    const roadLength = roadLengthRef.current || 40000;
    const carColors = ['#00f0ff', '#ff007f', '#facc15', '#a855f7', '#10b981', '#ef4444'];
    const carModels: ('sedan' | 'sports' | 'truck')[] = ['sports', 'sedan', 'truck'];

    for (let i = 0; i < totalCars; i++) {
      tempCars.push({
        z: 2500 + i * (roadLength / totalCars) * 0.85,
        x: (Math.random() * 1.5) - 0.75,
        speed: 100 + Math.random() * 90,
        color: carColors[i % carColors.length],
        width: 0.52,
        driftDirection: Math.random() > 0.5 ? 1 : -1,
        model: carModels[i % carModels.length]
      });
    }
    carsRef.current = tempCars;
  };

  const spawnPickups = () => {
    const tempPickups: Pickup[] = [];
    const roadLength = roadLengthRef.current || 40000;
    const count = 45;

    for (let i = 0; i < count; i++) {
      const randType = Math.random();
      const type: 'nitro' | 'coin' | 'shield' = randType > 0.65 ? 'coin' : (randType > 0.2 ? 'nitro' : 'shield');
      tempPickups.push({
        id: nextPickupIdRef.current++,
        z: 1500 + i * (roadLength / count) + Math.random() * 300,
        x: (Math.random() * 1.4) - 0.7,
        type,
        collected: false
      });
    }
    pickupsRef.current = tempPickups;
  };

  // Web Audio Synthesizer
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext init error');
    }
  };

  const playEngineSound = (speedVal: number) => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    const isNitro = isNitroActiveRef.current;
    const maxLimit = isNitro ? NITRO_MAX_SPEED : BASE_MAX_SPEED;
    const baseFreq = isNitro ? 95 : 65;
    const freqMult = isNitro ? 160 : 120;

    osc.frequency.setValueAtTime(baseFreq + (speedVal / maxLimit) * freqMult, ctx.currentTime);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.003, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playPickupSound = (type: 'nitro' | 'coin' | 'shield') => {
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
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else if (type === 'nitro') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playCrashSound = () => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.7);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1.0
    });
  };

  const spawnExhaustParticles = (x: number, y: number, z: number, isNitro: boolean) => {
    const count = isNitro ? 6 : 2;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        z: z,
        vx: (Math.random() - 0.5) * 350,
        vy: -80 - Math.random() * 150,
        vz: -250 - Math.random() * 350,
        color: isNitro ? (Math.random() > 0.5 ? '#00f0ff' : '#ff007f') : '#f97316',
        size: 2.5 + Math.random() * 3.5,
        life: 1.0
      });
    }
  };

  // Keyboard Handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    initAudio();
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover') {
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    initAudio();
    setGameState('playing');
    gameStateRef.current = 'playing';

    setScore(0); scoreRef.current = 0;
    setCoins(0); coinsRef.current = 0;
    setLives(3); livesRef.current = 3;
    speedRef.current = 0;
    positionRef.current = 0;
    playerXRef.current = 0;

    setNitro(100); nitroRef.current = 100;
    setHasShield(false); shieldRef.current = false;
    setIsNitroActive(false); isNitroActiveRef.current = false;

    screenShakeRef.current = 0;
    lastMilestoneRef.current = 0;
    particlesRef.current = [];
    floatingTextsRef.current = [];

    resetCars();
    spawnPickups();

    lastTimeRef.current = performance.now();
    accumRef.current = 0;

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const lastTimeRef = useRef(0);
  const accumRef = useRef(0);

  const gameLoop = () => {
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover') return;

    const now = performance.now();
    const dt = Math.min(1.0, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    accumRef.current += dt;
    while (accumRef.current >= STEP) {
      updatePhysics(STEP);
      accumRef.current -= STEP;
    }

    renderGraphics();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const findSegment = (z: number, segList: Segment[]) => {
    if (segList.length === 0) return null;
    const index = Math.floor(z / SEGMENT_LENGTH) % segList.length;
    return segList[index];
  };

  const updatePhysics = (dt: number) => {
    if (segments.length === 0) return;

    // Score accumulation
    scoreRef.current += Math.round(speedRef.current * dt * 0.07);
    setScore(scoreRef.current);

    // Stars twinkle animation
    starsRef.current.forEach(s => {
      s.brightness += (Math.random() - 0.5) * 0.18;
      s.brightness = Math.max(0.15, Math.min(1.0, s.brightness));
    });

    // Particle Exhaust
    if (speedRef.current > 40 && gameStateRef.current === 'playing') {
      const zOffset = positionRef.current + 200;
      spawnExhaustParticles(playerXRef.current * ROAD_WIDTH, playerYRef.current + 200, zOffset, isNitroActiveRef.current);
    }

    // Particle Physics
    particlesRef.current.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt * 1.5;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0 && p.z > positionRef.current);

    // Floating text decay
    floatingTextsRef.current.forEach(ft => {
      ft.y -= dt * 40;
      ft.alpha -= dt * 1.2;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.alpha > 0);

    // Screen Shake decay
    if (screenShakeRef.current > 0) {
      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 28);
    }

    const currentSegment = findSegment(positionRef.current + 200, segments);
    if (!currentSegment) return;
    playerYRef.current = currentSegment.y;

    const maxSpeedLimit = isNitroActiveRef.current ? NITRO_MAX_SPEED : BASE_MAX_SPEED;

    if (gameStateRef.current === 'playing') {
      // Nitro Logic
      if (keyNitroRef.current && nitroRef.current > 0 && speedRef.current > 60) {
        isNitroActiveRef.current = true;
        setIsNitroActive(true);
        nitroRef.current = Math.max(0, nitroRef.current - dt * 42);
        setNitro(nitroRef.current);
        speedRef.current = accelerate(speedRef.current, 5.5, dt, maxSpeedLimit);
      } else {
        isNitroActiveRef.current = false;
        setIsNitroActive(false);
        nitroRef.current = Math.min(100, nitroRef.current + dt * 6.5);
        setNitro(nitroRef.current);

        if (keyFasterRef.current) {
          speedRef.current = accelerate(speedRef.current, 2.8, dt, maxSpeedLimit);
        } else if (keySlowerRef.current) {
          speedRef.current = accelerate(speedRef.current, -9.0, dt, maxSpeedLimit);
        } else {
          speedRef.current = accelerate(speedRef.current, -1.8, dt, maxSpeedLimit);
        }
      }

      setSpeed(speedRef.current);
      playEngineSound(speedRef.current);

      // Steering
      const steerFactor = isNitroActiveRef.current ? 1.8 : 2.3;
      if (keyLeftRef.current) playerXRef.current -= dt * steerFactor * (speedRef.current / maxSpeedLimit);
      else if (keyRightRef.current) playerXRef.current += dt * steerFactor * (speedRef.current / maxSpeedLimit);

      // Curve centrifugal force
      const speedRatio = speedRef.current / maxSpeedLimit;
      playerXRef.current -= (currentSegment.curve * 0.0038 * speedRatio);

      // Off-road slowdown
      if (Math.abs(playerXRef.current) > 1.0 && speedRef.current > 70) {
        speedRef.current = accelerate(speedRef.current, -16.0, dt, maxSpeedLimit);
      }

      playerXRef.current = Math.max(-2.1, Math.min(2.1, playerXRef.current));
    } else if (gameStateRef.current === 'crashed') {
      isNitroActiveRef.current = false;
      setIsNitroActive(false);
      speedRef.current = accelerate(speedRef.current, -28.0, dt, maxSpeedLimit);
      setSpeed(speedRef.current);

      crashTimerRef.current += dt;
      if (crashTimerRef.current > 1.4) {
        crashTimerRef.current = 0;
        setGameState('playing');
        gameStateRef.current = 'playing';
        playerXRef.current = 0;
      }
    }

    // Road scrolling position
    positionRef.current += speedRef.current * 10 * dt;
    const roadLength = roadLengthRef.current;
    if (positionRef.current >= roadLength) positionRef.current -= roadLength;

    skyOffsetRef.current += currentSegment.curve * 0.045 * (speedRef.current / maxSpeedLimit);

    // Pickups collision logic
    const playerZ = positionRef.current + 200;
    pickupsRef.current.forEach(p => {
      if (!p.collected && Math.abs(p.z - playerZ) < 180 && Math.abs(playerXRef.current - p.x) < 0.55) {
        p.collected = true;
        if (p.type === 'coin') {
          coinsRef.current += 1;
          scoreRef.current += 500;
          setCoins(coinsRef.current);
          setScore(scoreRef.current);
          playPickupSound('coin');
          addFloatingText('+500 COIN!', 320, 160, '#facc15');
        } else if (p.type === 'nitro') {
          nitroRef.current = Math.min(100, nitroRef.current + 35);
          setNitro(nitroRef.current);
          playPickupSound('nitro');
          addFloatingText('+NITRO BOOST!', 320, 160, '#00f0ff');
        } else if (p.type === 'shield') {
          shieldRef.current = true;
          setHasShield(true);
          playPickupSound('shield');
          addFloatingText('SHIELD ACTIVE!', 320, 160, '#a855f7');
        }
      }

      // Respawn pickups behind player
      if (p.z < positionRef.current) {
        p.z += roadLength;
        p.collected = false;
        p.x = (Math.random() * 1.4) - 0.7;
      }
    });

    // AI Cars & Near-Miss Collision Logic
    carsRef.current.forEach(car => {
      car.x += car.driftDirection * 0.16 * dt;
      if (Math.abs(car.x) > 0.82) car.driftDirection *= -1;

      car.z += car.speed * 8.2 * dt;
      if (car.z >= roadLength) car.z -= roadLength;

      if (gameStateRef.current === 'playing' && Math.abs(car.z - playerZ) < 140) {
        const dx = Math.abs(playerXRef.current - car.x);
        if (dx < 0.55) {
          triggerCrash();
        } else if (dx >= 0.55 && dx < 0.95 && speedRef.current > 200) {
          // Near Miss combo!
          scoreRef.current += 200;
          setScore(scoreRef.current);
          addFloatingText('NEAR MISS! +200', 320, 140, '#ff007f');
        }
      }
    });

    // Obstacles collision
    currentSegment.sprites.forEach(sprite => {
      if (gameStateRef.current === 'playing' && Math.abs(playerXRef.current - sprite.x) < 0.55) {
        triggerCrash();
      }
    });
  };

  const accelerate = (v: number, accel: number, dt: number, maxLimit: number) => {
    let target = v + accel * 42 * dt;
    if (target > maxLimit) target = Math.max(maxLimit, v - 100 * dt);
    return Math.max(0, Math.min(maxLimit, target));
  };

  const triggerCrash = () => {
    if (shieldRef.current) {
      shieldRef.current = false;
      setHasShield(false);
      screenShakeRef.current = 10;
      addFloatingText('SHIELD ABSORBED CRASH!', 320, 160, '#38bdf8');
      playPickupSound('shield');
      return;
    }

    speedRef.current = 20;
    setSpeed(20);

    livesRef.current = Math.max(0, livesRef.current - 1);
    setLives(livesRef.current);

    screenShakeRef.current = 20;
    playCrashSound();

    if (livesRef.current <= 0) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('racer-highscore', String(scoreRef.current));
        }
      }
    } else {
      setGameState('crashed');
      gameStateRef.current = 'crashed';
      crashTimerRef.current = 0;
    }
  };

  const projectPoint = (point: RoadPoint, cameraX: number, cameraY: number, cameraZ: number, width: number, height: number) => {
    const worldZ = point.world.z - cameraZ;
    if (worldZ <= 0) {
      point.screen.y = 0;
      return;
    }
    const scale = CAMERA_DEPTH / worldZ;
    point.screen.x = Math.round((width / 2) + (scale * (point.world.x - cameraX) * width / 2));
    point.screen.y = Math.round((height / 2) - (scale * (point.world.y - cameraY) * height / 2));
    point.screen.w = Math.round(scale * ROAD_WIDTH * width / 2);
  };

  // Rendering Engine
  const renderGraphics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Screen Shake Effect
    if (screenShakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * screenShakeRef.current;
      const dy = (Math.random() - 0.5) * screenShakeRef.current;
      ctx.translate(dx, dy);
    }

    // 1. Synthwave Horizon & Sun
    drawSky(ctx, w, h);

    // 2. Neon Mountains & City Line
    drawMountains(ctx, w, h);

    // 3. Pseudo-3D Road Segments
    if (segments.length > 0) {
      const baseSegment = findSegment(positionRef.current, segments);
      if (baseSegment) {
        let maxy = h;
        let xOffset = 0;
        let dx = -(baseSegment.curve * (positionRef.current % SEGMENT_LENGTH) / SEGMENT_LENGTH);

        for (let i = 0; i < DRAW_DISTANCE; i++) {
          const segmentIndex = (baseSegment.index + i) % segments.length;
          const segment = segments[segmentIndex];
          const loopOffset = (segmentIndex < baseSegment.index) ? roadLengthRef.current : 0;

          projectPoint(segment.p1, playerXRef.current * ROAD_WIDTH, playerYRef.current + 1200, positionRef.current - loopOffset, w, h);
          projectPoint(segment.p2, playerXRef.current * ROAD_WIDTH, playerYRef.current + 1200, positionRef.current - loopOffset, w, h);

          xOffset += dx;
          dx += segment.curve;

          if (segment.p1.screen.y >= maxy || segment.p1.screen.y < 0) continue;

          drawSegment(ctx, segment, w);
          maxy = segment.p1.screen.y;
        }
      }
    }

    // 4. Floating Pickups & Orbs
    drawPickups(ctx, w, h);

    // 5. Particles & Exhaust
    drawParticles(ctx, w, h);

    // 6. Traffic Cars & Sprites
    if (segments.length > 0) {
      const baseSegment = findSegment(positionRef.current, segments);
      if (baseSegment) {
        for (let i = DRAW_DISTANCE - 1; i >= 0; i--) {
          const segmentIndex = (baseSegment.index + i) % segments.length;
          const segment = segments[segmentIndex];

          carsRef.current.forEach(car => {
            const carSeg = findSegment(car.z, segments);
            if (carSeg && carSeg.index === segmentIndex) {
              drawCar(ctx, car, segment);
            }
          });

          segment.sprites.forEach(sprite => {
            drawObstacle(ctx, sprite, segment);
          });
        }
      }
    }

    // 7. Headlight & Player Supercar
    drawHeadlights(ctx, w, h);
    drawPlayerSupercar(ctx, w, h);

    // 8. Floating Combo Texts
    drawFloatingTexts(ctx);

    ctx.restore();

    // 9. Start / Gameover Overlays
    if (gameStateRef.current === 'start') {
      drawMenuOverlay(ctx, w, h, 'CYBER RACER 2026', 'TAP OR PRESS SPACE / ENTER TO DRIVE');
    } else if (gameStateRef.current === 'gameover') {
      drawMenuOverlay(ctx, w, h, 'GAME OVER', 'TAP OR PRESS SPACE TO RETRY');
    }
  };

  const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h / 2);
    grad.addColorStop(0, '#040714');
    grad.addColorStop(0.7, '#130a2a');
    grad.addColorStop(1, '#2c0b38');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.save();
    starsRef.current.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.restore();

    // Retro Sun
    const sunRadius = 75;
    const sunX = (w / 2) - (skyOffsetRef.current * 90) % w;
    const sunY = (h / 2) - 15;

    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#facc15');
    sunGrad.addColorStop(0.5, '#f97316');
    sunGrad.addColorStop(1, '#ff007f');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Retro Sun horizontal scanlines
    ctx.fillStyle = '#2c0b38';
    for (let i = 0; i < 7; i++) {
      const lineY = sunY + 10 + i * 9;
      ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, 2.5 + i * 0.9);
    }
  };

  const drawMountains = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const horizon = h / 2;

    ctx.fillStyle = '#1e0c36';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const count1 = 7;
    const step1 = w / count1;
    for (let i = 0; i <= count1 + 1; i++) {
      const x = (i * step1) - (skyOffsetRef.current * 45) % step1;
      const height = (i % 2 === 0) ? 38 : 16;
      ctx.lineTo(x, horizon - height);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f051d';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const count2 = 9;
    const step2 = w / count2;
    for (let i = 0; i <= count2 + 1; i++) {
      const x = (i * step2) - (skyOffsetRef.current * 75) % step2;
      const height = (i % 3 === 0) ? 24 : ((i % 3 === 1) ? 14 : 32);
      ctx.lineTo(x, horizon - height);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();
  };

  const drawSegment = (ctx: CanvasRenderingContext2D, segment: Segment, w: number) => {
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;

    ctx.fillStyle = segment.color.grass;
    ctx.fillRect(0, p2.y, w, p1.y - p2.y);

    const r1 = p1.w * 0.08;
    const r2 = p2.w * 0.08;
    ctx.fillStyle = segment.color.rumble;
    drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    drawPolygon(ctx, p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y);

    ctx.fillStyle = segment.color.road;
    drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    if (segment.color.lane) {
      ctx.fillStyle = segment.color.lane;
      const l1 = p1.w * 0.022;
      const l2 = p2.w * 0.022;
      drawPolygon(ctx, p1.x - l1, p1.y, p1.x + l1, p1.y, p2.x + l2, p2.y, p2.x - l2, p2.y);
    }
  };

  const drawPolygon = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  };

  const drawPickups = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    pickupsRef.current.forEach(p => {
      if (p.collected) return;
      const worldZ = p.z - positionRef.current;
      if (worldZ <= 0 || worldZ > 3000) return;

      const scale = CAMERA_DEPTH / worldZ;
      const screenX = (w / 2) + scale * (p.x * ROAD_WIDTH - playerXRef.current * ROAD_WIDTH) * (w / 2);
      const screenY = (h / 2) - scale * (playerYRef.current + 800) * (h / 2);
      const size = Math.max(4, scale * 60 * (w / 2));

      if (screenX >= 0 && screenX <= w && screenY >= 0 && screenY <= h) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        
        if (p.type === 'coin') {
          ctx.fillStyle = '#facc15';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = size * 0.2;
          ctx.stroke();
        } else if (p.type === 'nitro') {
          ctx.fillStyle = '#00f0ff';
          ctx.fill();
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 12;
        }
        ctx.restore();
      }
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    particlesRef.current.forEach(p => {
      const worldZ = p.z - positionRef.current;
      if (worldZ <= 0) return;

      const scale = CAMERA_DEPTH / worldZ;
      const screenX = (w / 2) + scale * (p.x - playerXRef.current * ROAD_WIDTH) * (w / 2);
      const screenY = (h / 2) - scale * (p.y - playerYRef.current - 1200) * (h / 2);
      const size = scale * p.size * (w / 2);

      if (screenX >= 0 && screenX <= w && screenY >= 0 && screenY <= h) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  };

  const drawFloatingTexts = (ctx: CanvasRenderingContext2D) => {
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, sprite: GameSprite, segment: Segment) => {
    const screen = segment.p1.screen;
    const size = screen.w * 0.38 * sprite.scale;
    const destX = screen.x + (sprite.x * screen.w);
    const destY = screen.y;

    if (sprite.type === 'palm') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = size * 0.12;
      ctx.beginPath();
      ctx.moveTo(destX, destY);
      ctx.quadraticCurveTo(destX - size * 0.2, destY - size * 0.6, destX - size * 0.1, destY - size * 1.2);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 5; i++) {
        const leafAngle = (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.arc(destX - size * 0.1 + Math.cos(leafAngle) * size * 0.25, destY - size * 1.2 + Math.sin(leafAngle) * size * 0.15, size * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (sprite.type === 'cyberpost') {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(destX - 2, destY - size * 1.2, 4, size * 1.2);
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(destX, destY - size * 1.2, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const bw = size * 1.5;
      const bh = size * 0.75;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      ctx.fillStyle = '#475569';
      ctx.fillRect(destX - 3, destY - size * 0.5, 6, size * 0.5);

      ctx.fillStyle = '#ff007f';
      ctx.font = `bold ${Math.max(7, Math.floor(size * 0.26))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('CYBER RACER', destX, destY - bh / 2 - size * 0.4);
    }
  };

  const drawCar = (ctx: CanvasRenderingContext2D, car: Car, segment: Segment) => {
    const screen = segment.p1.screen;
    const w = screen.w * car.width;
    const destX = screen.x + (car.x * screen.w);
    const destY = segment.p1.screen.y;

    // Chassis Body
    ctx.fillStyle = car.color;
    ctx.fillRect(destX - w / 2, destY - w * 0.42, w, w * 0.36);

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(destX - w * 0.36, destY - w * 0.72, w * 0.72, w * 0.32);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(destX - w * 0.46, destY - w * 0.36, w * 0.16, w * 0.1);
    ctx.fillRect(destX + w * 0.3, destY - w * 0.36, w * 0.16, w * 0.1);
  };

  const drawHeadlights = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (gameStateRef.current !== 'playing') return;

    const screenX = w / 2;
    const screenY = h - 35;
    const beamWidth = 240;
    const beamHeight = 160;

    ctx.save();
    const grad = ctx.createLinearGradient(0, screenY - beamHeight, 0, screenY);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.0)');
    grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.25)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - 20);
    ctx.lineTo(screenX - beamWidth / 2, screenY - beamHeight);
    ctx.lineTo(screenX + beamWidth / 2, screenY - beamHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Sleek Cyberpunk Supercar Player Rendering
  const drawPlayerSupercar = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const screenX = w / 2;
    const screenY = h - 35;
    const carW = 74;
    const carH = 46;

    ctx.save();

    // Steering tilt & transform
    if (keyLeftRef.current) {
      ctx.translate(screenX, screenY);
      ctx.rotate(-0.08);
      ctx.translate(-screenX, -screenY);
    } else if (keyRightRef.current) {
      ctx.translate(screenX, screenY);
      ctx.rotate(0.08);
      ctx.translate(-screenX, -screenY);
    }

    if (gameStateRef.current === 'crashed') {
      // Explosion geometry
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(screenX, screenY - carH / 2, carW * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX + 12, screenY - carH / 2 + 8, carW * 0.45, 0, Math.PI * 2);
      ctx.arc(screenX - 14, screenY - carH / 2 - 10, carW * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shield Aura
      if (shieldRef.current) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY - carH * 0.4, carW * 0.7, carH * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 4, carW * 0.48, carH * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Supercar Metallic Chassis
      const bodyGrad = ctx.createLinearGradient(screenX - carW / 2, 0, screenX + carW / 2, 0);
      if (isNitroActiveRef.current) {
        bodyGrad.addColorStop(0, '#ff007f');
        bodyGrad.addColorStop(0.5, '#7c3aed');
        bodyGrad.addColorStop(1, '#00f0ff');
      } else {
        bodyGrad.addColorStop(0, '#00f0ff');
        bodyGrad.addColorStop(0.5, '#0284c7');
        bodyGrad.addColorStop(1, '#0369a1');
      }

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(screenX - carW / 2, screenY - carH, carW, carH, [10, 10, 4, 4]);
      ctx.fill();

      // Side Air Intakes / Fenders
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX - carW * 0.48, screenY - carH * 0.65, carW * 0.12, carH * 0.45);
      ctx.fillRect(screenX + carW * 0.36, screenY - carH * 0.65, carW * 0.12, carH * 0.45);

      // Windshield & Canopy
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(screenX - carW * 0.3, screenY - carH * 0.9, carW * 0.6, carH * 0.35, 6);
      ctx.fill();

      // Carbon Fiber Rear Wing / Spoiler
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(screenX - carW * 0.52, screenY - carH * 1.05, carW * 1.04, 6);
      ctx.fillRect(screenX - carW * 0.3, screenY - carH * 1.02, 6, 8);
      ctx.fillRect(screenX + carW * 0.3 - 6, screenY - carH * 1.02, 6, 8);

      // Neon LED Taillight Bar
      ctx.fillStyle = isNitroActiveRef.current ? '#facc15' : '#ff007f';
      ctx.shadowColor = isNitroActiveRef.current ? '#facc15' : '#ff007f';
      ctx.shadowBlur = 10;
      ctx.fillRect(screenX - carW * 0.4, screenY - carH * 0.22, carW * 0.8, 5);

      // Exhaust Flame Plumes
      if ((keyFasterRef.current || isNitroActiveRef.current) && speedRef.current > 40) {
        ctx.fillStyle = isNitroActiveRef.current ? '#00f0ff' : '#f97316';
        ctx.shadowColor = isNitroActiveRef.current ? '#00f0ff' : '#f97316';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(screenX - 12, screenY);
        ctx.lineTo(screenX - 6, screenY + 22 + Math.random() * 16);
        ctx.lineTo(screenX, screenY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + 6, screenY + 22 + Math.random() * 16);
        ctx.lineTo(screenX + 12, screenY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawMenuOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle: string) => {
    ctx.fillStyle = 'rgba(2, 4, 10, 0.82)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.fillText(title, w / 2, h / 2 - 20);

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 15px monospace';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.fillText(subtitle, w / 2, h / 2 + 30);
  };

  // Mobile Controller Actions
  const setMobileAction = (action: 'left' | 'right' | 'go' | 'stop' | 'nitro', isPressed: boolean) => {
    initAudio();
    if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover') {
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
      {/* Header Bar */}
      <div className="flex justify-between items-center w-full mb-4 px-2">
        <h3 className="text-xl md:text-2xl font-black text-cyber-pink tracking-wider neon-glow-text flex items-center gap-2">
          <span>🏎️</span> CYBER RACER 2026
        </h3>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>
          
          <div className="text-xs md:text-sm text-zinc-400 font-bold">
            HIGH SCORE: <span className="text-gradient text-base font-extrabold ml-1">{highScore}</span>
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
          <span className="text-xl md:text-2xl font-black text-white">{score}</span>
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

      {/* Main Canvas Viewport */}
      <div className="relative w-full border-2 border-cyber-cyan/30 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.1)] bg-black">
        <canvas ref={canvasRef} width={640} height={380} className="w-full h-auto block" />

        {/* Start / Gameover Overlay Modal */}
        {(gameState === 'start' || gameState === 'gameover') && (
          <div 
            onClick={startGame} 
            className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer z-10 p-6 text-center"
          >
            <h1 className="text-3xl md:text-5xl font-black tracking-widest text-cyber-cyan mb-2 drop-shadow-[0_0_20px_rgba(0,240,255,0.7)]">
              CYBER RACER
            </h1>
            <p className="text-xs text-zinc-400 max-w-sm mb-6">
              Dodge traffic, collect Nitro Orbs & Gold Coins, and pass near cars closely for Near-Miss combo bonuses!
            </p>

            <button className="flex items-center gap-2 px-8 py-3.5 font-black text-sm rounded-xl bg-gradient-to-r from-cyber-pink via-purple-600 to-cyber-cyan text-white shadow-xl shadow-cyber-pink/30 hover:scale-105 active:scale-95 transition-all">
              <Play className="w-5 h-5 fill-white" />
              <span>{gameState === 'start' ? 'START DRIVING' : 'PLAY AGAIN'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controller Layout */}
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

      {/* Game Instruction Info Box */}
      <div className="w-full mt-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 leading-relaxed">
        <p className="mb-1">💻 <strong>Desktop controls:</strong> Arrow Keys / WASD (Up to accelerate, Left/Right to steer, Down to brake, <strong>Shift</strong> for Nitro Boost).</p>
        <p>📱 <strong>Mobile controls:</strong> Hold <strong>GAS!</strong>, tap ◀ / ▶ to steer, and hold <strong>BOOST</strong> for Nitro acceleration!</p>
      </div>
    </div>
  );
}
