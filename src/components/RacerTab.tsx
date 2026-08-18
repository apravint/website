"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Heart, Zap } from 'lucide-react';

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
  type: 'tree' | 'billboard' | 'rock' | 'palm';
  scale: number;
}

interface Car {
  z: number;
  x: number;
  speed: number;
  color: string;
  width: number;
  driftDirection: number;
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
}

export default function RacerTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const requestRef = useRef<number | null>(null);

  // Constants
  const FPS = 60;
  const STEP = 1 / FPS;
  const ROAD_WIDTH = 2000;
  const SEGMENT_LENGTH = 200;
  const RUMBLE_LENGTH = 3;
  const CAMERA_DEPTH = 0.8;
  const DRAW_DISTANCE = 300;
  const BASE_MAX_SPEED = 280;
  const NITRO_MAX_SPEED = 350;
  const totalCars = 15;

  // Track & Geometry
  const [segments, setSegments] = useState<Segment[]>([]);
  const roadLengthRef = useRef(0);

  // HUD stats
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitro, setNitro] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'crashed' | 'gameover'>('start');

  // Animation/physics refs
  const positionRef = useRef(0);
  const playerXRef = useRef(0);
  const playerYRef = useRef(0);
  const speedRef = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const nitroRef = useRef(100);
  const isNitroActiveRef = useRef(false);
  const gameStateRef = useRef<'start' | 'playing' | 'crashed' | 'gameover'>('start');
  const crashTimerRef = useRef(0);
  const screenShakeRef = useRef(0);
  const lastMilestoneRef = useRef(0);

  // Background sky offsets
  const skyOffsetRef = useRef(0);

  // Controls state refs
  const keyLeftRef = useRef(false);
  const keyRightRef = useRef(false);
  const keyFasterRef = useRef(false);
  const keySlowerRef = useRef(false);
  const keyNitroRef = useRef(false);

  // Sprite / Car refs
  const carsRef = useRef<Car[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Colors
  const colors = {
    sky: '#070b19',
    sunsetGlow: '#fd227c',
    gridLines: '#00f0ff',
    lightGrass: '#0d2818',
    darkGrass: '#051f0e',
    lightRumble: '#00f0ff',
    darkRumble: '#ff007f',
    lightRoad: '#111424',
    darkRoad: '#0b0c16',
    laneMarker: '#ffffff'
  };

  useEffect(() => {
    // Load highscore
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('racer-highscore');
      if (saved) setHighScore(Number(saved));
    }

    // Init Stars
    const tempStars: Star[] = [];
    for (let i = 0; i < 80; i++) {
      tempStars.push({
        x: Math.random() * 800,
        y: Math.random() * 200,
        size: 0.5 + Math.random() * 1.5,
        brightness: Math.random()
      });
    }
    starsRef.current = tempStars;

    // Build road segments
    buildRoad();
    resetCars();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const buildRoad = () => {
    const tempSegments: Segment[] = [];
    const RUMBLE_L = 3;

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
      if (n % 10 === 0 && n > 50) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const type = Math.random() > 0.5 ? 'tree' : (Math.random() > 0.5 ? 'billboard' : 'palm');
        sprites.push({ x: side * (1.5 + Math.random() * 0.8), type, scale: 1.0 });
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

    const addStraight = (num: number) => {
      for (let i = 0; i < num; i++) addSegment(0, 0);
    };

    const addHill = (num: number, height: number) => {
      for (let i = 0; i < num; i++) addSegment(0, Math.sin((i / num) * Math.PI) * height);
    };

    const addCurve = (num: number, curve: number, height: number) => {
      for (let i = 0; i < num; i++) addSegment(curve, Math.sin((i / num) * Math.PI) * height);
    };

    addStraight(100);
    addCurve(80, 2, 0);
    addHill(100, 40);
    addCurve(120, -3, -20);
    addStraight(80);
    addHill(120, -50);
    addCurve(100, 4, 30);
    addStraight(100);
    addCurve(80, -2, 0);

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
    for (let i = 0; i < totalCars; i++) {
      tempCars.push({
        z: 2000 + i * (roadLength / totalCars) * 0.8,
        x: (Math.random() * 1.6) - 0.8,
        speed: 90 + Math.random() * 80,
        color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#a78bfa' : '#ef4444'),
        width: 0.5,
        driftDirection: Math.random() > 0.5 ? 1 : -1
      });
    }
    carsRef.current = tempCars;
  };

  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Audio Context unsupported.');
    }
  };

  const playEngineSound = (speedVal: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const isNitro = isNitroActiveRef.current;
    const maxLimit = isNitro ? NITRO_MAX_SPEED : BASE_MAX_SPEED;
    const baseFreq = isNitro ? 80 : 60;
    const multiplier = isNitro ? 140 : 110;

    osc.frequency.setValueAtTime(baseFreq + (speedVal / maxLimit) * multiplier, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  const playCrashSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.8);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noiseNode.start();
  };

  const playMilestoneSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.06, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.25);
    });
  };

  const spawnSparks = (x: number, y: number, z: number, isNitro: boolean) => {
    const count = isNitro ? 5 : 2;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 50,
        z: z,
        vx: (Math.random() - 0.5) * 400,
        vy: -100 - Math.random() * 200,
        vz: -300 - Math.random() * 400,
        color: isNitro ? '#00f0ff' : '#fd227c',
        size: 2 + Math.random() * 3
      });
    }
  };

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
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keyLeftRef.current = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        keyRightRef.current = true;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        keyFasterRef.current = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        keySlowerRef.current = true;
        break;
      case 'Shift':
      case 'x':
      case 'X':
        keyNitroRef.current = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keyLeftRef.current = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        keyRightRef.current = false;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        keyFasterRef.current = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        keySlowerRef.current = false;
        break;
      case 'Shift':
      case 'x':
      case 'X':
        keyNitroRef.current = false;
        break;
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

    setScore(0);
    scoreRef.current = 0;

    setLives(3);
    livesRef.current = 3;

    speedRef.current = 0;
    positionRef.current = 0;
    playerXRef.current = 0;

    setNitro(100);
    nitroRef.current = 100;

    setIsNitroActive(false);
    isNitroActiveRef.current = false;

    screenShakeRef.current = 0;
    lastMilestoneRef.current = 0;
    particlesRef.current = [];

    resetCars();
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

    // Incremental Score
    scoreRef.current += Math.round(speedRef.current * dt * 0.05);
    setScore(scoreRef.current);

    // Milestone Check
    const milestone = Math.floor(scoreRef.current / 1000);
    if (milestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = milestone;
      playMilestoneSound();
    }

    // Twinkle Stars
    starsRef.current.forEach(s => {
      s.brightness += (Math.random() - 0.5) * 0.2;
      s.brightness = Math.max(0.1, Math.min(1.0, s.brightness));
    });

    // Particle exhaust sparks
    if (speedRef.current > 50 && gameStateRef.current === 'playing') {
      const zOffset = positionRef.current + 200;
      spawnSparks(playerXRef.current * ROAD_WIDTH, playerYRef.current + 200, zOffset, isNitroActiveRef.current);
    }

    // Update particles
    particlesRef.current.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    });
    particlesRef.current = particlesRef.current.filter(p => p.z > positionRef.current);

    // Decay shake
    if (screenShakeRef.current > 0) {
      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
    }

    const currentSegment = findSegment(positionRef.current + 200, segments);
    if (!currentSegment) return;
    playerYRef.current = currentSegment.y;

    const maxSpeedLimit = isNitroActiveRef.current ? NITRO_MAX_SPEED : BASE_MAX_SPEED;

    if (gameStateRef.current === 'playing') {
      // Nitro Boost Math
      if (keyNitroRef.current && nitroRef.current > 0 && speedRef.current > 80) {
        isNitroActiveRef.current = true;
        setIsNitroActive(true);
        nitroRef.current = Math.max(0, nitroRef.current - dt * 45);
        setNitro(nitroRef.current);
        speedRef.current = accelerate(speedRef.current, 5.0, dt, maxSpeedLimit);
      } else {
        isNitroActiveRef.current = false;
        setIsNitroActive(false);
        nitroRef.current = Math.min(100, nitroRef.current + dt * 8);
        setNitro(nitroRef.current);

        if (keyFasterRef.current) {
          speedRef.current = accelerate(speedRef.current, 2.5, dt, maxSpeedLimit);
        } else if (keySlowerRef.current) {
          speedRef.current = accelerate(speedRef.current, -8.0, dt, maxSpeedLimit);
        } else {
          speedRef.current = accelerate(speedRef.current, -1.5, dt, maxSpeedLimit);
        }
      }

      setSpeed(speedRef.current);
      playEngineSound(speedRef.current);

      // Steer factor
      const steerFactor = isNitroActiveRef.current ? 1.7 : 2.2;
      if (keyLeftRef.current) {
        playerXRef.current -= dt * steerFactor * (speedRef.current / maxSpeedLimit);
      } else if (keyRightRef.current) {
        playerXRef.current += dt * steerFactor * (speedRef.current / maxSpeedLimit);
      }

      // Curve force
      const speedRatio = speedRef.current / maxSpeedLimit;
      playerXRef.current = playerXRef.current - (currentSegment.curve * 0.0035 * speedRatio);

      // Decelerate off-road
      if (Math.abs(playerXRef.current) > 1.0 && speedRef.current > 80) {
        speedRef.current = accelerate(speedRef.current, -15.0, dt, maxSpeedLimit);
      }

      playerXRef.current = Math.max(-2.0, Math.min(2.0, playerXRef.current));
    } else if (gameStateRef.current === 'crashed') {
      isNitroActiveRef.current = false;
      setIsNitroActive(false);
      speedRef.current = accelerate(speedRef.current, -25.0, dt, maxSpeedLimit);
      setSpeed(speedRef.current);

      crashTimerRef.current += dt;
      if (crashTimerRef.current > 1.5) {
        crashTimerRef.current = 0;
        setGameState('playing');
        gameStateRef.current = 'playing';
        playerXRef.current = 0;
      }
    }

    // Scroll
    positionRef.current += speedRef.current * 10 * dt;
    const roadLength = roadLengthRef.current;
    if (positionRef.current >= roadLength) positionRef.current -= roadLength;

    skyOffsetRef.current += currentSegment.curve * 0.04 * (speedRef.current / maxSpeedLimit);

    // AI Cars
    carsRef.current.forEach(car => {
      car.x += car.driftDirection * 0.15 * dt;
      if (Math.abs(car.x) > 0.8) car.driftDirection *= -1;

      car.z += car.speed * 8 * dt;
      if (car.z >= roadLength) car.z -= roadLength;

      // Collsion check
      if (gameStateRef.current === 'playing' && Math.abs(car.z - (positionRef.current + 200)) < 150) {
        if (Math.abs(playerXRef.current - car.x) < 0.6) {
          triggerCrash('car');
        }
      }
    });

    // Obstacles collision
    currentSegment.sprites.forEach(sprite => {
      if (gameStateRef.current === 'playing' && Math.abs(playerXRef.current - sprite.x) < 0.6) {
        triggerCrash('obstacle');
      }
    });
  };

  const accelerate = (v: number, accel: number, dt: number, maxLimit: number) => {
    let target = v + accel * 40 * dt;
    if (target > maxLimit) {
      target = Math.max(maxLimit, v - 100 * dt);
    }
    return Math.max(0, Math.min(maxLimit, target));
  };

  const triggerCrash = (type: 'car' | 'obstacle') => {
    speedRef.current = 20;
    setSpeed(20);
    
    livesRef.current = Math.max(0, livesRef.current - 1);
    setLives(livesRef.current);

    screenShakeRef.current = 18;
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

  const renderGraphics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Shake
    if (screenShakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * screenShakeRef.current;
      const dy = (Math.random() - 0.5) * screenShakeRef.current;
      ctx.translate(dx, dy);
    }

    // 1. Sky & Sun
    drawSky(ctx, w, h);

    // 2. Mountains
    drawMountains(ctx, w, h);

    // 3. Road Segments
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

    // 4. Sparks
    drawParticles(ctx, w, h);

    // 5. Cars & Obstacles
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

    // 6. Headlight
    drawHeadlight(ctx, w, h);

    // 7. Player
    drawPlayer(ctx, w, h);

    ctx.restore();

    // 8. Menu overlay
    if (gameStateRef.current === 'start') {
      drawMenuOverlay(ctx, w, h, 'NEON RACER 2026', 'PRESS SPACE / ENTER TO RUN');
    } else if (gameStateRef.current === 'gameover') {
      drawMenuOverlay(ctx, w, h, 'GAME OVER', 'PRESS SPACE / ENTER TO RETRY');
    }
  };

  const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const hue = (240 + (scoreRef.current / 150)) % 360;
    const skyTop = `hsl(${hue}, 65%, 7%)`;
    const skyBottom = `hsl(${(hue + 50) % 360}, 65%, 15%)`;

    const grad = ctx.createLinearGradient(0, 0, 0, h / 2);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.save();
    starsRef.current.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.restore();

    // Sun
    const sunRadius = 70;
    const sunX = (w / 2) - (skyOffsetRef.current * 100) % w;
    const sunY = (h / 2) - 20;

    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#f59e0b');
    sunGrad.addColorStop(1, colors.sunsetGlow);

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skyBottom;
    for (let i = 0; i < 6; i++) {
      const lineY = sunY + 15 + i * 8;
      ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, 2 + i * 0.8);
    }
  };

  const drawMountains = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const horizon = h / 2;

    ctx.fillStyle = '#1e113a';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const count1 = 6;
    const step1 = w / count1;
    for (let i = 0; i <= count1 + 1; i++) {
      const x = (i * step1) - (skyOffsetRef.current * 40) % step1;
      const height = (i % 2 === 0) ? 35 : 15;
      ctx.lineTo(x, horizon - height);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f0822';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const count2 = 8;
    const step2 = w / count2;
    for (let i = 0; i <= count2 + 1; i++) {
      const x = (i * step2) - (skyOffsetRef.current * 70) % step2;
      const height = (i % 3 === 0) ? 22 : ((i % 3 === 1) ? 12 : 30);
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

    const r1 = p1.w * 0.07;
    const r2 = p2.w * 0.07;
    ctx.fillStyle = segment.color.rumble;
    drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    drawPolygon(ctx, p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y);

    ctx.fillStyle = segment.color.road;
    drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    if (segment.color.lane) {
      ctx.fillStyle = segment.color.lane;
      const l1 = p1.w * 0.02;
      const l2 = p2.w * 0.02;
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

  const drawParticles = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    particlesRef.current.forEach(p => {
      const worldZ = p.z - positionRef.current;
      if (worldZ <= 0) return;

      const scale = CAMERA_DEPTH / worldZ;
      const screenX = (w / 2) + scale * (p.x - playerXRef.current * ROAD_WIDTH) * (w / 2);
      const screenY = (h / 2) - scale * (p.y - playerYRef.current - 1200) * (h / 2);
      const size = scale * p.size * (w / 2);

      if (screenX >= 0 && screenX <= w && screenY >= 0 && screenY <= h) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, sprite: GameSprite, segment: Segment) => {
    const screen = segment.p1.screen;
    const size = screen.w * 0.35 * sprite.scale;
    const destX = screen.x + (sprite.x * screen.w);
    const destY = screen.y;

    if (sprite.type === 'tree') {
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(destX, destY);
      ctx.lineTo(destX - size * 0.5, destY);
      ctx.lineTo(destX, destY - size * 1.5);
      ctx.lineTo(destX + size * 0.5, destY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.moveTo(destX, destY - size * 0.5);
      ctx.lineTo(destX - size * 0.35, destY - size * 0.5);
      ctx.lineTo(destX, destY - size * 1.4);
      ctx.lineTo(destX + size * 0.35, destY - size * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (sprite.type === 'palm') {
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
        ctx.arc(destX - size * 0.1 + Math.cos(leafAngle) * size * 0.25, destY - size * 1.2 + Math.sin(leafAngle) * size * 0.15, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const bw = size * 1.4;
      const bh = size * 0.7;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      ctx.strokeStyle = colors.darkRumble;
      ctx.lineWidth = 2;
      ctx.strokeRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      ctx.fillStyle = '#475569';
      ctx.fillRect(destX - 3, destY - size * 0.5, 6, size * 0.5);

      ctx.fillStyle = '#00f0ff';
      ctx.font = `bold ${Math.max(6, Math.floor(size * 0.25))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('OUTRUN', destX, destY - bh / 2 - size * 0.4);
    }
  };

  const drawCar = (ctx: CanvasRenderingContext2D, car: Car, segment: Segment) => {
    const screen = segment.p1.screen;
    const w = screen.w * car.width;
    const destX = screen.x + (car.x * screen.w);
    const destY = segment.p1.screen.y;

    ctx.fillStyle = car.color;
    ctx.fillRect(destX - w / 2, destY - w * 0.4, w, w * 0.35);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(destX - w * 0.35, destY - w * 0.7, w * 0.7, w * 0.3);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(destX - w * 0.45, destY - w * 0.35, w * 0.15, w * 0.1);
    ctx.fillRect(destX + w * 0.3, destY - w * 0.35, w * 0.15, w * 0.1);
  };

  const drawHeadlight = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (gameStateRef.current !== 'playing') return;

    const screenX = w / 2;
    const screenY = h - 40;
    const beamWidth = 220;
    const beamHeight = 150;

    ctx.save();
    const grad = ctx.createLinearGradient(0, screenY - beamHeight, 0, screenY);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.0)');
    grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.18)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - 20);
    ctx.lineTo(screenX - beamWidth / 2, screenY - beamHeight);
    ctx.lineTo(screenX + beamWidth / 2, screenY - beamHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const screenX = w / 2;
    const screenY = h - 40;
    const size = 65;

    ctx.save();
    if (keyLeftRef.current) {
      ctx.translate(screenX, screenY);
      ctx.rotate(-0.07);
      ctx.translate(-screenX, -screenY);
    } else if (keyRightRef.current) {
      ctx.translate(screenX, screenY);
      ctx.rotate(0.07);
      ctx.translate(-screenX, -screenY);
    }

    if (gameStateRef.current === 'crashed') {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(screenX, screenY - size / 2, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX + 10, screenY - size / 2 + 10, size * 0.4, 0, Math.PI * 2);
      ctx.arc(screenX - 12, screenY - size / 2 - 8, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (isNitroActiveRef.current) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(screenX, screenY - size * 0.5, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isNitroActiveRef.current ? '#ff007f' : colors.gridLines;
      ctx.fillRect(screenX - size * 0.15, screenY - size * 0.65, size * 0.3, size * 0.6);

      ctx.strokeStyle = isNitroActiveRef.current ? colors.gridLines : colors.darkRumble;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(screenX, screenY - size * 0.15, size * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screenX - size * 0.22, screenY - size * 0.55, size * 0.44, size * 0.15);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(screenX, screenY - size * 0.75, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isNitroActiveRef.current ? '#facc15' : colors.gridLines;
      ctx.fillRect(screenX - size * 0.14, screenY - size * 0.85, size * 0.28, size * 0.08);

      if ((keyFasterRef.current || isNitroActiveRef.current) && speedRef.current > 50) {
        ctx.fillStyle = isNitroActiveRef.current ? '#00f0ff' : '#f97316';
        ctx.beginPath();
        ctx.moveTo(screenX - 10, screenY - 12);
        ctx.lineTo(screenX, screenY + 18 + Math.random() * 15);
        ctx.lineTo(screenX + 10, screenY - 12);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawMenuOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle: string) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, h / 2 - 20);

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 16px monospace';
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
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 glass-card">
      <div className="flex justify-between items-center w-full max-w-2xl mb-4">
        <h3 className="text-xl font-bold text-cyber-pink neon-glow-text flex items-center gap-2">
          <span>🏍️</span> NEON ROAD RACER
        </h3>
        <div className="text-sm text-zinc-400">
          HIGH SCORE: <span className="text-gradient font-bold">{highScore}</span>
        </div>
      </div>

      {/* Stats HUD Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">SPEED</span>
          <span className={`text-xl font-extrabold ${isNitroActive ? 'text-cyber-pink shadow-text' : 'text-cyber-cyan'}`}>
            {Math.round(speed)} <small className="text-xs font-normal text-zinc-500">KM/H</small>
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">SCORE</span>
          <span className="text-xl font-extrabold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-cyan" /> NITRO
          </span>
          <div className="w-24 h-2.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5 border border-zinc-700">
            <div 
              className={`h-full rounded-full transition-all duration-75 ${
                isNitroActive ? 'bg-gradient-to-r from-cyber-pink to-red-500 animate-pulse' : 'bg-gradient-to-r from-cyber-cyan to-blue-500'
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">LIVES</span>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-5 h-5 ${idx < lives ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative w-full max-w-2xl border-2 border-cyber-cyan/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.05)] bg-black">
        <canvas ref={canvasRef} width={640} height={380} className="w-full h-auto block" />
        
        {/* Play Overlay */}
        {(gameState === 'start' || gameState === 'gameover') && (
          <div 
            onClick={startGame} 
            className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center cursor-pointer z-10"
          >
            <h1 className="text-4xl font-extrabold tracking-widest text-cyber-cyan mb-4 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
              NEON RACER
            </h1>
            <button className="flex items-center gap-2 px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-cyber-pink to-violet-600 text-white shadow-lg shadow-cyber-pink/20 hover:scale-105 transition-transform">
              <Play className="w-5 h-5 fill-white" />
              <span>{gameState === 'start' ? 'START RUN' : 'PLAY AGAIN'}</span>
            </button>
            <p className="text-xs text-zinc-500 mt-4">Press Space / Enter or Click to Play</p>
          </div>
        )}
      </div>

      {/* Mobile Controllers */}
      <div className="flex justify-between w-full max-w-2xl mt-4 md:hidden gap-4">
        <div className="flex gap-2">
          <button 
            onTouchStart={() => setMobileAction('left', true)}
            onTouchEnd={() => setMobileAction('left', false)}
            onMouseDown={() => setMobileAction('left', true)}
            onMouseUp={() => setMobileAction('left', false)}
            className="w-14 h-14 rounded-full border border-zinc-800 bg-zinc-900/60 text-white font-bold flex items-center justify-center active:bg-cyber-cyan/20 select-none touch-manipulation"
          >
            ◀
          </button>
          <button 
            onTouchStart={() => setMobileAction('right', true)}
            onTouchEnd={() => setMobileAction('right', false)}
            onMouseDown={() => setMobileAction('right', true)}
            onMouseUp={() => setMobileAction('right', false)}
            className="w-14 h-14 rounded-full border border-zinc-800 bg-zinc-900/60 text-white font-bold flex items-center justify-center active:bg-cyber-cyan/20 select-none touch-manipulation"
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
            className="w-14 h-14 rounded-full border border-red-900/30 bg-red-950/20 text-red-400 font-bold text-xs flex items-center justify-center active:bg-red-900/30 select-none touch-manipulation"
          >
            STOP
          </button>
          <button 
            onTouchStart={() => setMobileAction('nitro', true)}
            onTouchEnd={() => setMobileAction('nitro', false)}
            onMouseDown={() => setMobileAction('nitro', true)}
            onMouseUp={() => setMobileAction('nitro', false)}
            disabled={nitro <= 0}
            className={`w-14 h-14 rounded-full border border-cyber-pink/30 bg-cyber-pink/10 text-cyber-pink font-extrabold text-[10px] flex items-center justify-center active:bg-cyber-pink/30 select-none touch-manipulation ${
              nitro <= 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            BOOST
          </button>
          <button 
            onTouchStart={() => setMobileAction('go', true)}
            onTouchEnd={() => setMobileAction('go', false)}
            onMouseDown={() => setMobileAction('go', true)}
            onMouseUp={() => setMobileAction('go', false)}
            className="w-14 h-14 rounded-full border border-emerald-900/30 bg-emerald-950/20 text-emerald-400 font-bold flex items-center justify-center active:bg-emerald-900/30 select-none touch-manipulation"
          >
            GO!
          </button>
        </div>
      </div>

      {/* Help Instructions panel */}
      <div className="w-full max-w-2xl mt-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/40 text-xs text-zinc-500 leading-relaxed">
        <p className="mb-1">💻 <strong>Desktop controls:</strong> Keyboard <strong>Arrow Keys</strong> (Up to accelerate, Left/Right to steer, Down to brake, <strong>Shift Key</strong> to activate Nitro boost).</p>
        <p>📱 <strong>Mobile controls:</strong> Hold <strong>GO!</strong> to accelerate, tap Left/Right arrows to steer, and hold <strong>BOOST</strong> for Nitro speeds.</p>
      </div>
    </div>
  );
}
