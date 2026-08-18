import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { AnalyticsService } from '../shared/services/analytics.service';

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
  x: number; // offset from center (-1 to 1)
  type: 'tree' | 'billboard' | 'rock' | 'palm';
  scale: number;
}

interface Car {
  z: number;
  x: number; // offset (-1 to 1)
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

@Component({
  selector: 'app-retro-racer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './retro-racer.component.html',
  styleUrls: ['./retro-racer.component.scss']
})
export class RetroRacerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private seo = inject(SeoService);
  private translation = inject(TranslationService);
  private analytics = inject(AnalyticsService);

  // Audio Context for programmatically generated retro synth sound effects
  private audioCtx: AudioContext | null = null;

  // Game Engine Constants
  readonly FPS = 60;
  readonly STEP = 1 / this.FPS;
  readonly ROAD_WIDTH = 2000;
  readonly SEGMENT_LENGTH = 200;
  readonly RUMBLE_LENGTH = 3;
  readonly CAMERA_DEPTH = 0.8; // Perspective factor
  readonly DRAW_DISTANCE = 300;
  readonly BASE_MAX_SPEED = 280; // km/h limit
  readonly NITRO_MAX_SPEED = 350; // Boost speed limit

  // Road geometry parameters
  segments: Segment[] = [];
  roadLength = 0;

  // Game Loop State Variables
  canvasWidth = 640;
  canvasHeight = 480;
  ctx!: CanvasRenderingContext2D;

  position = 0; // camera Z position
  playerX = 0; // center of road offset (-1 to 1)
  playerY = 0;
  speed = 0; // km/h

  // Input states
  keyLeft = false;
  keyRight = false;
  keyFaster = false;
  keySlower = false;
  keyNitro = false;

  // Nitro Mechanic
  nitro = 100; // 0 to 100 charge
  isNitroActive = false;

  // Screen shake on crash
  screenShake = 0;

  // Twinkling Starfield and Speed Particle Lists
  stars: Star[] = [];
  particles: Particle[] = [];

  // Obstacles and Cars
  cars: Car[] = [];
  totalCars = 15;

  // Game loop cycle handlers
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private timeStepAccumulator = 0;

  // High Score and Stats
  score = 0;
  highScore = 0;
  lives = 3;
  gameState: 'start' | 'playing' | 'crashed' | 'gameover' = 'start';
  crashTimer = 0;
  lastMilestone = 0;

  // Graphics Colors
  colors = {
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

  // Background Parallax scrolling offsets
  skyOffset = 0;
  hillOffset = 0;

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Neon Outrun Racer | Pravin Tamilan Gaming',
      description: 'Play an enhanced pseudo-3D retro highway arcade racing game with scrolling parallax mountain ranges, starfield systems, and audio.',
      url: 'https://pravintamilan.com/racer'
    });

    if (typeof window !== 'undefined') {
      this.highScore = Number(localStorage.getItem('racer-highscore') || '0');
    }

    this.initStars();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());

    this.resetRoad();
    this.resetCars();

    // Trigger initial render in 'start' menu state
    this.render();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  // Generate Twinkling Star Coordinates
  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 200,
        size: 0.5 + Math.random() * 1.5,
        brightness: Math.random()
      });
    }
  }

  // Spawn Speed Spark Particles
  private spawnSparks(x: number, y: number, z: number, isNitro: boolean): void {
    const count = isNitro ? 5 : 2;
    for (let i = 0; i < count; i++) {
      this.particles.push({
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
  }

  // Bind Keyboard Listeners for Desktop Gameplay
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    this.initAudio();

    if (this.gameState === 'start' || this.gameState === 'gameover') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.startGame();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keyLeft = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keyRight = true;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keyFaster = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keySlower = true;
        break;
      case 'Shift':
      case 'x':
      case 'X':
        this.keyNitro = true;
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keyLeft = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keyRight = false;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keyFaster = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keySlower = false;
        break;
      case 'Shift':
      case 'x':
      case 'X':
        this.keyNitro = false;
        break;
    }
  }

  // Handle canvas scaling
  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) {
      const w = parent.clientWidth;
      canvas.width = w > 800 ? 800 : w;
      canvas.height = canvas.width * 0.6; // Maintain 5:3 ratio
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
    }
  }

  // Generate track segments mathematically
  private resetRoad(): void {
    this.segments = [];

    // 1. Initial flat straight segment
    this.addStraight(100);

    // 2. Winding curves and hills
    this.addCurve(80, 2, 0);       // easy curve
    this.addHill(100, 40);         // uphill straight
    this.addCurve(120, -3, -20);   // hard downhill left
    this.addStraight(80);
    this.addHill(120, -50);        // hard downhill straight
    this.addCurve(100, 4, 30);     // steep curvy hill right
    this.addStraight(100);
    this.addCurve(80, -2, 0);      // slight left

    // 3. Repeat to make loop
    const totalSegments = this.segments.length;
    for (let i = 0; i < totalSegments; i++) {
      const cloned = JSON.parse(JSON.stringify(this.segments[i]));
      cloned.index = totalSegments + i;
      this.segments.push(cloned);
    }

    this.roadLength = this.segments.length * this.SEGMENT_LENGTH;
  }

  private addSegment(curve: number, y: number): void {
    const n = this.segments.length;
    const lastY = n > 0 ? this.segments[n - 1].y : 0;
    
    // Choose alternate colors
    const isEven = Math.floor(n / this.RUMBLE_LENGTH) % 2 === 0;

    const segmentColors = {
      road: isEven ? this.colors.lightRoad : this.colors.darkRoad,
      grass: isEven ? this.colors.lightGrass : this.colors.darkGrass,
      rumble: isEven ? this.colors.lightRumble : this.colors.darkRumble,
      lane: isEven ? this.colors.laneMarker : undefined
    };

    // Spawn random billboards/trees on track border sides
    const sprites: GameSprite[] = [];
    if (n % 10 === 0 && n > 50) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const type = Math.random() > 0.5 ? 'tree' : (Math.random() > 0.5 ? 'billboard' : 'palm');
      sprites.push({ x: side * (1.5 + Math.random() * 0.8), type, scale: 1.0 });
    }

    this.segments.push({
      index: n,
      p1: { world: { x: 0, y: lastY, z: n * this.SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
      p2: { world: { x: 0, y: lastY + y, z: (n + 1) * this.SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
      curve: curve,
      y: lastY + y,
      color: segmentColors,
      sprites: sprites
    });
  }

  private addStraight(num: number): void {
    for (let i = 0; i < num; i++) {
      this.addSegment(0, 0);
    }
  }

  private addHill(num: number, height: number): void {
    for (let i = 0; i < num; i++) {
      // Sine wave hill slope interpolation
      this.addSegment(0, Math.sin((i / num) * Math.PI) * height);
    }
  }

  private addCurve(num: number, curve: number, height: number): void {
    for (let i = 0; i < num; i++) {
      this.addSegment(curve, Math.sin((i / num) * Math.PI) * height);
    }
  }

  // Spawn dynamic AI cars
  private resetCars(): void {
    this.cars = [];
    for (let i = 0; i < this.totalCars; i++) {
      this.cars.push({
        z: 2000 + i * (this.roadLength / this.totalCars) * 0.8,
        x: (Math.random() * 1.6) - 0.8,
        speed: 90 + Math.random() * 80,
        color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#a78bfa' : '#ef4444'),
        width: 0.5,
        driftDirection: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  // --- Core Game Engine Control Methods ---

  startGame(): void {
    if (this.gameState !== 'start' && this.gameState !== 'gameover') return;

    this.initAudio();
    this.analytics.logCustomEvent('racer_game_started');

    this.gameState = 'playing';
    this.score = 0;
    this.lives = 3;
    this.speed = 0;
    this.position = 0;
    this.playerX = 0;
    this.nitro = 100;
    this.isNitroActive = false;
    this.screenShake = 0;
    this.lastMilestone = 0;
    this.particles = [];
    this.resetCars();

    this.lastTime = performance.now();
    this.timeStepAccumulator = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop();
  }

  private loop(): void {
    if (this.gameState === 'start' || this.gameState === 'gameover') return;

    const now = performance.now();
    const dt = Math.min(1.0, (now - this.lastTime) / 1000); // Caps lag spikes
    this.lastTime = now;

    this.timeStepAccumulator += dt;

    // Fixed timestep update to ensure stable physics behavior
    while (this.timeStepAccumulator >= this.STEP) {
      this.update(this.STEP);
      this.timeStepAccumulator -= this.STEP;
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  // Core update cycle
  private update(dt: number): void {
    this.score += Math.round(this.speed * dt * 0.05);

    // Score Milestone sound trigger
    const milestone = Math.floor(this.score / 1000);
    if (milestone > this.lastMilestone) {
      this.lastMilestone = milestone;
      this.playMilestoneSound();
    }

    // Twinkle Stars
    this.stars.forEach(s => {
      s.brightness += (Math.random() - 0.5) * 0.2;
      s.brightness = Math.max(0.1, Math.min(1.0, s.brightness));
    });

    // Spawn exhaust speed sparks when driving fast
    if (this.speed > 50 && this.gameState === 'playing') {
      const zOffset = this.position + 200;
      this.spawnSparks(this.playerX * this.ROAD_WIDTH, this.playerY + 200, zOffset, this.isNitroActive);
    }

    // Update Particles
    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    });

    // Remove distant particles
    this.particles = this.particles.filter(p => p.z > this.position);

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Dynamic camera height changes on hills
    const currentSegment = this.findSegment(this.position + 200);
    this.playerY = currentSegment.y;

    const maxSpeedLimit = this.isNitroActive ? this.NITRO_MAX_SPEED : this.BASE_MAX_SPEED;

    // Accelerate / Brake logic
    if (this.gameState === 'playing') {
      // Nitro Boost calculations
      if (this.keyNitro && this.nitro > 0 && this.speed > 80) {
        this.isNitroActive = true;
        this.nitro = Math.max(0, this.nitro - dt * 45); // drains in ~2.2s
        this.speed = this.accelerate(this.speed, 5.0, dt, maxSpeedLimit);
        this.playEngineSound(this.speed);
      } else {
        this.isNitroActive = false;
        // Slowly recharge nitro when not active
        this.nitro = Math.min(100, this.nitro + dt * 8); // recharges in ~12.5s

        if (this.keyFaster) {
          this.speed = this.accelerate(this.speed, 2.5, dt, maxSpeedLimit);
          this.playEngineSound(this.speed);
        } else if (this.keySlower) {
          this.speed = this.accelerate(this.speed, -8.0, dt, maxSpeedLimit);
        } else {
          this.speed = this.accelerate(this.speed, -1.5, dt, maxSpeedLimit); // Deceleration friction
        }
      }

      // Left / Right steering logic (Nitro reduces steer control slightly due to high speed)
      const steerFactor = this.isNitroActive ? 1.7 : 2.2;
      if (this.keyLeft) {
        this.playerX -= dt * steerFactor * (this.speed / maxSpeedLimit);
      } else if (this.keyRight) {
        this.playerX += dt * steerFactor * (this.speed / maxSpeedLimit);
      }

      // Road curving centripetal forces
      const speedRatio = this.speed / maxSpeedLimit;
      this.playerX = this.playerX - (currentSegment.curve * 0.0035 * speedRatio);

      // Decelerate heavily if driving off road on grass sides
      if (Math.abs(this.playerX) > 1.0) {
        if (this.speed > 80) {
          this.speed = this.accelerate(this.speed, -15.0, dt, maxSpeedLimit);
        }
      }

      // Boundary clamp
      this.playerX = Math.max(-2.0, Math.min(2.0, this.playerX));
    } else if (this.gameState === 'crashed') {
      // In crash recovery animation state
      this.isNitroActive = false;
      this.speed = this.accelerate(this.speed, -25.0, dt, maxSpeedLimit);
      this.crashTimer += dt;
      if (this.crashTimer > 1.5) {
        this.crashTimer = 0;
        this.gameState = 'playing';
        this.playerX = 0;
      }
    }

    // Scroll highway position
    this.position += this.speed * 10 * dt;
    if (this.position >= this.roadLength) {
      this.position -= this.roadLength;
    }

    // Parallax scrolling calculation
    this.skyOffset += currentSegment.curve * 0.04 * (this.speed / maxSpeedLimit);

    // AI Cars updates with lane drifting behavior
    this.cars.forEach(car => {
      // AI car steering/lane drifting simulation
      car.x += car.driftDirection * 0.15 * dt;
      if (Math.abs(car.x) > 0.8) {
        car.driftDirection *= -1; // bounce off sides
      }

      car.z += car.speed * 8 * dt;
      if (car.z >= this.roadLength) {
        car.z -= this.roadLength;
      }

      // Check collision
      if (this.gameState === 'playing' && Math.abs(car.z - (this.position + 200)) < 150) {
        if (Math.abs(this.playerX - car.x) < 0.6) {
          this.triggerCrash('car');
        }
      }
    });

    // Check collision with roadside obstacles
    currentSegment.sprites.forEach(sprite => {
      if (this.gameState === 'playing' && Math.abs(this.playerX - sprite.x) < 0.6) {
        this.triggerCrash('obstacle');
      }
    });
  }

  private accelerate(v: number, accel: number, dt: number, maxLimit: number): number {
    let target = v + accel * 40 * dt;
    // Decelerate down if nitro turned off and speed exceeds base limit
    if (target > maxLimit) {
      target = Math.max(maxLimit, v - 100 * dt);
    }
    return Math.max(0, Math.min(maxLimit, target));
  }

  private findSegment(z: number): Segment {
    const index = Math.floor(z / this.SEGMENT_LENGTH) % this.segments.length;
    return this.segments[index];
  }

  private triggerCrash(type: 'car' | 'obstacle'): void {
    this.speed = 20; // reset speed
    this.lives--;
    this.screenShake = 18; // Trigger screen shake offset
    this.playCrashSound();
    this.analytics.logCustomEvent('racer_crashed', { obstacle_type: type, remaining_lives: this.lives });

    if (this.lives <= 0) {
      this.gameState = 'gameover';
      this.analytics.logCustomEvent('racer_game_over', { score: this.score, max_speed: this.speed });
      if (this.score > this.highScore) {
        this.highScore = this.score;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('racer-highscore', String(this.highScore));
        }
      }
    } else {
      this.gameState = 'crashed';
      this.crashTimer = 0;
    }
  }

  // --- Rendering Functions ---

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.save();

    // Apply Screen Shake if active
    if (this.screenShake > 0) {
      const dx = (Math.random() - 0.5) * this.screenShake;
      const dy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(dx, dy);
    }

    // 1. Draw Sky Backdrop, Stars & Retro Wave Grid Sun
    this.drawSky();

    // 2. Draw Parallax Mountain Ranges
    this.drawMountains();

    // 3. Draw Road Segments (Back-to-Front painter's projection algorithm)
    const baseSegment = this.findSegment(this.position);
    let maxy = this.canvasHeight;
    let x = 0;
    let dx = -(baseSegment.curve * (this.position % this.SEGMENT_LENGTH) / this.SEGMENT_LENGTH);

    // Projection loop
    for (let i = 0; i < this.DRAW_DISTANCE; i++) {
      const segmentIndex = (baseSegment.index + i) % this.segments.length;
      const segment = this.segments[segmentIndex];

      const loopOffset = (segmentIndex < baseSegment.index) ? this.roadLength : 0;
      this.project(segment.p1, this.playerX * this.ROAD_WIDTH, this.playerY + 1200, this.position - loopOffset);
      this.project(segment.p2, this.playerX * this.ROAD_WIDTH, this.playerY + 1200, this.position - loopOffset);

      x += dx;
      dx += segment.curve;

      // Cull segments behind camera
      if (segment.p1.screen.y >= maxy || segment.p1.screen.y < 0) continue;

      this.drawSegment(segment);
      maxy = segment.p1.screen.y;
    }

    // 4. Render Particle Sparks
    this.drawParticles();

    // 5. Render Cars and Obstacles
    for (let i = this.DRAW_DISTANCE - 1; i >= 0; i--) {
      const segmentIndex = (baseSegment.index + i) % this.segments.length;
      const segment = this.segments[segmentIndex];

      // Draw cars on segment
      this.cars.forEach(car => {
        if (this.findSegment(car.z).index === segmentIndex) {
          this.drawCar(car, segment);
        }
      });

      // Draw obstacles/trees on segment
      segment.sprites.forEach(sprite => {
        this.drawObstacle(sprite, segment);
      });
    }

    // 6. Render Player Headlight projection cone (night effect)
    this.drawHeadlight();

    // 7. Render Player Bike
    this.drawPlayer();

    this.ctx.restore(); // Restore context to avoid shaking text HUD overlay

    // 8. If start screen or gameover, overlay menu
    if (this.gameState === 'start') {
      this.drawMenuOverlay('NEON RACER 2026', 'PRESS SPACE OR ENTER TO RUN');
    } else if (this.gameState === 'gameover') {
      this.drawMenuOverlay('GAME OVER', 'PRESS SPACE OR ENTER TO RETRY');
    }
  }

  // Math Projection Formula
  private project(point: RoadPoint, cameraX: number, cameraY: number, cameraZ: number): void {
    const worldZ = point.world.z - cameraZ;
    if (worldZ <= 0) {
      point.screen.y = 0;
      return;
    }

    const scale = this.CAMERA_DEPTH / worldZ;
    point.screen.x = Math.round((this.canvasWidth / 2) + (scale * (point.world.x - cameraX) * this.canvasWidth / 2));
    point.screen.y = Math.round((this.canvasHeight / 2) - (scale * (point.world.y - cameraY) * this.canvasHeight / 2));
    point.screen.w = Math.round(scale * this.ROAD_WIDTH * this.canvasWidth / 2);
  }

  private drawSky(): void {
    // Dynamic sky colors shifting using HSL based on current score
    const hue = (240 + (this.score / 150)) % 360;
    const skyTop = `hsl(${hue}, 65%, 7%)`;
    const skyBottom = `hsl(${(hue + 50) % 360}, 65%, 15%)`;

    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight / 2);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBottom);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw Twinkling Stars
    this.ctx.save();
    this.stars.forEach(s => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.restore();

    // Parallax Synthwave Sunset Sun
    const sunRadius = 70;
    const sunX = (this.canvasWidth / 2) - (this.skyOffset * 100) % this.canvasWidth;
    const sunY = (this.canvasHeight / 2) - 20;

    const sunGrad = this.ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#f59e0b'); // Yellow
    sunGrad.addColorStop(1, this.colors.sunsetGlow); // Red-pink

    this.ctx.fillStyle = sunGrad;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Outrun horizontal scanlines on the sun
    this.ctx.fillStyle = skyBottom;
    for (let i = 0; i < 6; i++) {
      const lineY = sunY + 15 + i * 8;
      this.ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, 2 + i * 0.8);
    }
  }

  // Draw two layers of scrolling parallax mountains
  private drawMountains(): void {
    const horizon = this.canvasHeight / 2;

    // Layer 1: Distant Mountains (Dark Purple)
    this.ctx.fillStyle = '#1e113a';
    this.ctx.beginPath();
    this.ctx.moveTo(0, horizon);
    
    const count1 = 6;
    const step1 = this.canvasWidth / count1;
    for (let i = 0; i <= count1 + 1; i++) {
      const x = (i * step1) - (this.skyOffset * 40) % step1;
      const height = (i % 2 === 0) ? 35 : 15;
      this.ctx.lineTo(x, horizon - height);
    }
    this.ctx.lineTo(this.canvasWidth, horizon);
    this.ctx.closePath();
    this.ctx.fill();

    // Layer 2: Closer Mountains (Matte Indigo)
    this.ctx.fillStyle = '#0f0822';
    this.ctx.beginPath();
    this.ctx.moveTo(0, horizon);
    
    const count2 = 8;
    const step2 = this.canvasWidth / count2;
    for (let i = 0; i <= count2 + 1; i++) {
      const x = (i * step2) - (this.skyOffset * 70) % step2;
      const height = (i % 3 === 0) ? 22 : ((i % 3 === 1) ? 12 : 30);
      this.ctx.lineTo(x, horizon - height);
    }
    this.ctx.lineTo(this.canvasWidth, horizon);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawSegment(segment: Segment): void {
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;

    // Grass sides
    this.ctx.fillStyle = segment.color.grass;
    this.ctx.fillRect(0, p2.y, this.canvasWidth, p1.y - p2.y);

    // Rumble strips
    const r1 = p1.w * 0.07;
    const r2 = p2.w * 0.07;
    this.ctx.fillStyle = segment.color.rumble;
    // Left rumble
    this.drawPolygon(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    // Right rumble
    this.drawPolygon(p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y);

    // Road surface
    this.ctx.fillStyle = segment.color.road;
    this.drawPolygon(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    // Center dividing lines
    if (segment.color.lane) {
      this.ctx.fillStyle = segment.color.lane;
      const l1 = p1.w * 0.02;
      const l2 = p2.w * 0.02;
      this.drawPolygon(p1.x - l1, p1.y, p1.x + l1, p1.y, p2.x + l2, p2.y, p2.x - l2, p2.y);
    }
  }

  private drawPolygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
    this.ctx.closePath();
    this.ctx.fill();
  }

  // Render projected 3D particles on screen
  private drawParticles(): void {
    this.particles.forEach(p => {
      const worldZ = p.z - this.position;
      if (worldZ <= 0) return;

      const scale = this.CAMERA_DEPTH / worldZ;
      const screenX = (this.canvasWidth / 2) + scale * (p.x - this.playerX * this.ROAD_WIDTH) * (this.canvasWidth / 2);
      const screenY = (this.canvasHeight / 2) - scale * (p.y - this.playerY - 1200) * (this.canvasHeight / 2);
      const size = scale * p.size * (this.canvasWidth / 2);

      if (screenX >= 0 && screenX <= this.canvasWidth && screenY >= 0 && screenY <= this.canvasHeight) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  // Draw programmatic roadside items (trees, rocks, billboards)
  private drawObstacle(sprite: GameSprite, segment: Segment): void {
    const screen = segment.p1.screen;
    const size = screen.w * 0.35 * sprite.scale;
    const destX = screen.x + (sprite.x * screen.w);
    const destY = screen.y;

    if (sprite.type === 'tree') {
      // Draw polygonal pine tree
      this.ctx.fillStyle = '#064e3b'; // dark green pine
      this.ctx.beginPath();
      this.ctx.moveTo(destX, destY);
      this.ctx.lineTo(destX - size * 0.5, destY);
      this.ctx.lineTo(destX, destY - size * 1.5);
      this.ctx.lineTo(destX + size * 0.5, destY);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.fillStyle = '#047857'; // lighter branch cap
      this.ctx.beginPath();
      this.ctx.moveTo(destX, destY - size * 0.5);
      this.ctx.lineTo(destX - size * 0.35, destY - size * 0.5);
      this.ctx.lineTo(destX, destY - size * 1.4);
      this.ctx.lineTo(destX + size * 0.35, destY - size * 0.5);
      this.ctx.closePath();
      this.ctx.fill();
    } else if (sprite.type === 'palm') {
      // Draw palm tree trunk
      this.ctx.strokeStyle = '#78350f'; // brown trunk
      this.ctx.lineWidth = size * 0.12;
      this.ctx.beginPath();
      this.ctx.moveTo(destX, destY);
      this.ctx.quadraticCurveTo(destX - size * 0.2, destY - size * 0.6, destX - size * 0.1, destY - size * 1.2);
      this.ctx.stroke();

      // Palm fronds leaves
      this.ctx.fillStyle = '#10b981';
      for (let i = 0; i < 5; i++) {
        const leafAngle = (i / 4) * Math.PI;
        this.ctx.beginPath();
        this.ctx.arc(destX - size * 0.1 + Math.cos(leafAngle) * size * 0.25, destY - size * 1.2 + Math.sin(leafAngle) * size * 0.15, size * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // Draw Neon Billboard Ad
      const bw = size * 1.4;
      const bh = size * 0.7;
      this.ctx.fillStyle = '#1e1b4b'; // board background
      this.ctx.fillRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      this.ctx.strokeStyle = this.colors.darkRumble; // Neon pink border frame
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(destX - bw / 2, destY - bh - size * 0.5, bw, bh);

      // Support posts
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(destX - 3, destY - size * 0.5, 6, size * 0.5);

      // Billboard Text glow
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.font = `bold ${Math.max(6, Math.floor(size * 0.25))}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('OUTRUN', destX, destY - bh / 2 - size * 0.4);
    }
  }

  // Draw programmatic AI Cars
  private drawCar(car: Car, segment: Segment): void {
    const screen = segment.p1.screen;
    const w = screen.w * car.width;
    const destX = screen.x + (car.x * screen.w);
    const destY = segment.p1.screen.y;

    // Car Body Shape
    this.ctx.fillStyle = car.color;
    this.ctx.fillRect(destX - w / 2, destY - w * 0.4, w, w * 0.35);

    // Car cabin canopy glass
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(destX - w * 0.35, destY - w * 0.7, w * 0.7, w * 0.3);

    // Neon taillights
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(destX - w * 0.45, destY - w * 0.35, w * 0.15, w * 0.1);
    this.ctx.fillRect(destX + w * 0.3, destY - w * 0.35, w * 0.15, w * 0.1);
  }

  // Draw player headlight light cone ahead of bike
  private drawHeadlight(): void {
    if (this.gameState !== 'playing') return;

    const screenX = this.canvasWidth / 2;
    const screenY = this.canvasHeight - 40;

    const beamWidth = 220;
    const beamHeight = 150;

    this.ctx.save();
    
    // Light beam gradient cone
    const grad = this.ctx.createLinearGradient(0, screenY - beamHeight, 0, screenY);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.0)');
    grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.18)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY - 20);
    this.ctx.lineTo(screenX - beamWidth / 2, screenY - beamHeight);
    this.ctx.lineTo(screenX + beamWidth / 2, screenY - beamHeight);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  // Draw Programmatic Player (Futuristic Neon Moto-Rider)
  private drawPlayer(): void {
    const screenX = this.canvasWidth / 2;
    const screenY = this.canvasHeight - 40;
    const size = 65; // Base height size of the motorcycle sprite representation

    // Draw simple motorcycle rider facing forward
    this.ctx.save();
    
    // Slight tilt offset when steering
    if (this.keyLeft) {
      this.ctx.translate(screenX, screenY);
      this.ctx.rotate(-0.07);
      this.ctx.translate(-screenX, -screenY);
    } else if (this.keyRight) {
      this.ctx.translate(screenX, screenY);
      this.ctx.rotate(0.07);
      this.ctx.translate(-screenX, -screenY);
    }

    if (this.gameState === 'crashed') {
      // Explosion puff shape
      this.ctx.fillStyle = '#f97316';
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY - size / 2, size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(screenX + 10, screenY - size / 2 + 10, size * 0.4, 0, Math.PI * 2);
      this.ctx.arc(screenX - 12, screenY - size / 2 - 8, size * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Draw nitro speed lines/motion blur wrapper around bike
      if (this.isNitroActive) {
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY - size * 0.5, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Rear tire shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(screenX, screenY, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Futuristic cyan/pink bike frame
      this.ctx.fillStyle = this.isNitroActive ? '#ff007f' : this.colors.gridLines;
      this.ctx.fillRect(screenX - size * 0.15, screenY - size * 0.65, size * 0.3, size * 0.6);

      // Neon Wheel
      this.ctx.strokeStyle = this.isNitroActive ? this.colors.gridLines : this.colors.darkRumble;
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY - size * 0.15, size * 0.15, 0, Math.PI * 2);
      this.ctx.stroke();

      // Bike seat and tail exhaust pipes
      this.ctx.fillStyle = '#1e1b4b';
      this.ctx.fillRect(screenX - size * 0.22, screenY - size * 0.55, size * 0.44, size * 0.15);

      // Rider's body
      this.ctx.fillStyle = '#0f172a'; // black leather jacket
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY - size * 0.75, size * 0.22, 0, Math.PI * 2);
      this.ctx.fill();

      // Helmet visor glow
      this.ctx.fillStyle = this.isNitroActive ? '#facc15' : this.colors.gridLines;
      this.ctx.fillRect(screenX - size * 0.14, screenY - size * 0.85, size * 0.28, size * 0.08);

      // Exhaust jet flame trail (blue for nitro, orange for normal)
      if ((this.keyFaster || this.isNitroActive) && this.speed > 50) {
        this.ctx.fillStyle = this.isNitroActive ? '#00f0ff' : '#f97316';
        this.ctx.beginPath();
        this.ctx.moveTo(screenX - 10, screenY - 12);
        this.ctx.lineTo(screenX, screenY + 18 + Math.random() * 15);
        this.ctx.lineTo(screenX + 10, screenY - 12);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // Draw overlay titles (Start Menu / GameOver)
  private drawMenuOverlay(title: string, subtitle: string): void {
    // Backdrop dark transparent mask
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Neon typography
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    // Shadow glow text overlay
    this.ctx.fillStyle = '#ff007f';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(subtitle, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
  }

  // --- Sound Generation Methods using Web Audio API ---

  private initAudio(): void {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported on this browser.');
    }
  }

  // Dynamic engine hum sound pitch modulation matching speed
  private playEngineSound(speedVal: number): void {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    
    // Engine pitch hum scales with speed, climbs even higher when nitro is active
    const maxLimit = this.isNitroActive ? this.NITRO_MAX_SPEED : this.BASE_MAX_SPEED;
    const baseFreq = this.isNitroActive ? 80 : 60;
    const multiplier = this.isNitroActive ? 140 : 110;
    
    osc.frequency.setValueAtTime(baseFreq + (speedVal / maxLimit) * multiplier, this.audioCtx.currentTime);

    // Keep volume low and fade out quickly to simulate real engine loops
    gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  // Explosion crash sound effect
  private playCrashSound(): void {
    if (!this.audioCtx) return;

    // Create white noise buffer for explosive crashing
    const bufferSize = this.audioCtx.sampleRate * 0.8; // 0.8 seconds duration
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    // Low-pass filter to give weight to crash
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.8);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.8);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noiseNode.start();
  }

  // Synth arpeggio milestone reached sound
  private playMilestoneSound(): void {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    
    // Play quick ascending arpeggio chord (C4 -> E4 -> G4 -> C5)
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.08, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.25);
    });
  }

  // --- Mobile Controls Tap Zones & Handlers ---

  setMobileAction(action: 'left' | 'right' | 'go' | 'stop' | 'nitro', isPressed: boolean): void {
    this.initAudio(); // Resume sound permission on touch
    if (this.gameState === 'start' || this.gameState === 'gameover') {
      this.startGame();
      return;
    }

    if (action === 'left') this.keyLeft = isPressed;
    if (action === 'right') this.keyRight = isPressed;
    if (action === 'go') this.keyFaster = isPressed;
    if (action === 'stop') this.keySlower = isPressed;
    if (action === 'nitro') this.keyNitro = isPressed;
  }
}
