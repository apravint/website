"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Trophy, Users, Bot, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type GameMode = 'ai' | 'pvp';
type AIDifficulty = 'rookie' | 'pro' | 'cyberboss';

export default function CyberPongTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game Settings State
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('pro');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');

  // Scores
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState<'Player 1' | 'Player 2' | 'AI' | null>(null);
  const [highScore, setHighScore] = useState(0);

  // Active PowerUp Display
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);

  // Refs for animation loop
  const animFrameRef = useRef<number | null>(null);
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover'>('menu');
  const soundEnabledRef = useRef(true);

  // Input Control Refs
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Audio Synth Helper
  const playSynthSound = (type: 'paddle' | 'wall' | 'score' | 'powerup' | 'victory') => {
    if (!soundEnabledRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'paddle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'wall') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'score') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'powerup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.1);
          g.gain.setValueAtTime(0.3, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.2);
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('cyber-pong-highscore');
    if (savedHighScore) setHighScore(Number(savedHighScore));
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Game Loop
  const startGame = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
    setGameState('playing');
    gameStateRef.current = 'playing';

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Paddle specs
    const paddleWidth = 14;
    const paddleHeight = 90;

    let p1Y = height / 2 - paddleHeight / 2;
    let p2Y = height / 2 - paddleHeight / 2;

    // Ball specs
    let ballX = width / 2;
    let ballY = height / 2;
    let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    let ballSpeedY = (Math.random() * 4 - 2);
    let ballRadius = 9;

    // Particle Trail Pool
    let particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];

    // PowerUp item
    let powerUp: { x: number; y: number; type: 'speed' | 'shield' | 'bigpaddle'; duration: number } | null = null;
    let powerUpTimer = 0;

    let p1Shield = false;
    let p2Shield = false;
    let p1SizeMultiplier = 1;

    let p1Score = 0;
    let p2Score = 0;

    const resetBall = (direction: number) => {
      ballX = width / 2;
      ballY = height / 2;
      ballSpeedX = 6 * direction;
      ballSpeedY = (Math.random() * 4 - 2);
    };

    const loop = () => {
      if (gameStateRef.current !== 'playing') return;

      // --- 1. UPDATE PADDLES ---
      // Player 1 controls: W / S or ArrowUp / ArrowDown (in AI mode)
      const p1Speed = 7;
      if (keysRef.current['KeyW'] || (gameMode === 'ai' && keysRef.current['ArrowUp'])) {
        p1Y = Math.max(10, p1Y - p1Speed);
      }
      if (keysRef.current['KeyS'] || (gameMode === 'ai' && keysRef.current['ArrowDown'])) {
        p1Y = Math.min(height - (paddleHeight * p1SizeMultiplier) - 10, p1Y + p1Speed);
      }

      // Player 2 / AI controls
      const p2Height = paddleHeight;
      if (gameMode === 'pvp') {
        if (keysRef.current['ArrowUp']) p2Y = Math.max(10, p2Y - p1Speed);
        if (keysRef.current['ArrowDown']) p2Y = Math.min(height - p2Height - 10, p2Y + p1Speed);
      } else {
        // AI Logic based on difficulty
        const p2Center = p2Y + p2Height / 2;
        let aiSpeed = difficulty === 'rookie' ? 3.5 : difficulty === 'pro' ? 5.5 : 7.2;
        const aiMargin = difficulty === 'rookie' ? 25 : difficulty === 'pro' ? 12 : 5;

        if (ballSpeedX > 0) { // Only track when ball coming towards AI
          if (p2Center < ballY - aiMargin) {
            p2Y = Math.min(height - p2Height - 10, p2Y + aiSpeed);
          } else if (p2Center > ballY + aiMargin) {
            p2Y = Math.max(10, p2Y - aiSpeed);
          }
        }
      }

      // --- 2. UPDATE BALL PHYSICS ---
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Top / Bottom Wall Collision
      if (ballY - ballRadius <= 0 || ballY + ballRadius >= height) {
        ballSpeedY = -ballSpeedY;
        playSynthSound('wall');
        // Spawn particle splash
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: ballX,
            y: ballY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#00f0ff',
            life: 1.0
          });
        }
      }

      // Left Paddle Collision (P1)
      const currentP1Height = paddleHeight * p1SizeMultiplier;
      if (
        ballX - ballRadius <= 25 + paddleWidth &&
        ballX + ballRadius >= 25 &&
        ballY >= p1Y &&
        ballY <= p1Y + currentP1Height
      ) {
        ballSpeedX = Math.abs(ballSpeedX) * 1.05; // accelerate speed slightly
        // Change angle depending on where hit on paddle
        const deltaY = ballY - (p1Y + currentP1Height / 2);
        ballSpeedY = deltaY * 0.15;
        ballX = 25 + paddleWidth + ballRadius;
        playSynthSound('paddle');

        for (let i = 0; i < 10; i++) {
          particles.push({
            x: ballX,
            y: ballY,
            vx: Math.random() * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#00f0ff',
            life: 1.0
          });
        }
      }

      // Right Paddle Collision (P2)
      if (
        ballX + ballRadius >= width - 25 - paddleWidth &&
        ballX - ballRadius <= width - 25 &&
        ballY >= p2Y &&
        ballY <= p2Y + p2Height
      ) {
        ballSpeedX = -Math.abs(ballSpeedX) * 1.05;
        const deltaY = ballY - (p2Y + p2Height / 2);
        ballSpeedY = deltaY * 0.15;
        ballX = width - 25 - paddleWidth - ballRadius;
        playSynthSound('paddle');

        for (let i = 0; i < 10; i++) {
          particles.push({
            x: ballX,
            y: ballY,
            vx: -Math.random() * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#ff007f',
            life: 1.0
          });
        }
      }

      // PowerUp Collision
      powerUpTimer++;
      if (powerUpTimer > 400 && !powerUp) {
        powerUpTimer = 0;
        const types: ('speed' | 'shield' | 'bigpaddle')[] = ['speed', 'shield', 'bigpaddle'];
        powerUp = {
          x: width / 2 + (Math.random() * 200 - 100),
          y: Math.random() * (height - 100) + 50,
          type: types[Math.floor(Math.random() * types.length)],
          duration: 300
        };
      }

      if (powerUp) {
        const dist = Math.hypot(ballX - powerUp.x, ballY - powerUp.y);
        if (dist < ballRadius + 18) {
          playSynthSound('powerup');
          setActivePowerUp(powerUp.type.toUpperCase());
          if (ballSpeedX > 0) {
            // P1 got it
            if (powerUp.type === 'shield') p1Shield = true;
            if (powerUp.type === 'bigpaddle') p1SizeMultiplier = 1.4;
            if (powerUp.type === 'speed') ballSpeedX *= 1.3;
          } else {
            // P2 got it
            if (powerUp.type === 'shield') p2Shield = true;
          }
          powerUp = null;
        }
      }

      // --- 3. SCORING & GOALS ---
      if (ballX < 0) {
        if (p1Shield) {
          p1Shield = false;
          ballSpeedX = Math.abs(ballSpeedX);
          playSynthSound('wall');
        } else {
          p2Score += 1;
          setOpponentScore(p2Score);
          playSynthSound('score');
          resetBall(1);
        }
      } else if (ballX > width) {
        if (p2Shield) {
          p2Shield = false;
          ballSpeedX = -Math.abs(ballSpeedX);
          playSynthSound('wall');
        } else {
          p1Score += 1;
          setPlayerScore(p1Score);
          playSynthSound('score');
          resetBall(-1);
        }
      }

      // Check Winner (First to 7)
      if (p1Score >= 7 || p2Score >= 7) {
        const wName = p1Score >= 7 ? 'Player 1' : (gameMode === 'pvp' ? 'Player 2' : 'AI');
        setWinner(wName);
        setGameState('gameover');
        gameStateRef.current = 'gameover';

        if (p1Score >= 7) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          playSynthSound('victory');
          if (p1Score > highScore) {
            setHighScore(p1Score);
            localStorage.setItem('cyber-pong-highscore', String(p1Score));
          }
        }
        return;
      }

      // Add Ball Trail Particle
      particles.push({
        x: ballX,
        y: ballY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: ballSpeedX > 0 ? '#00f0ff' : '#ff007f',
        life: 0.8
      });

      // --- 4. DRAWING CANVAS ---
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Court Line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Draw PowerUp
      if (powerUp) {
        ctx.save();
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerUp.type[0].toUpperCase(), powerUp.x, powerUp.y);
        ctx.restore();
      }

      // Draw Player 1 Paddle
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(25, p1Y, paddleWidth, currentP1Height);
      if (p1Shield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 0, 10, height);
      }
      ctx.restore();

      // Draw Player 2 / AI Paddle
      ctx.save();
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(width - 25 - paddleWidth, p2Y, paddleWidth, p2Height);
      if (p2Shield) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.strokeRect(width - 15, 0, 10, height);
      }
      ctx.restore();

      // Draw Ball
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-[1700px] flex flex-col items-center gap-4 font-sans">
      {/* Top Cyber HUD Bar */}
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl glass-card flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyber-pink/20 border border-cyber-pink/40 text-cyber-pink">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wider">3D NEON CYBER PONG</h2>
            <p className="text-[10px] text-zinc-400">RETRO ARCADE PHYSX VS LOCAL AI</p>
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="flex items-center gap-6 bg-zinc-900/90 px-6 py-2 rounded-xl border border-zinc-800">
          <div className="text-center">
            <span className="text-[9px] text-cyber-cyan font-bold block uppercase">PLAYER 1</span>
            <span className="text-2xl font-black text-white">{playerScore}</span>
          </div>
          <span className="text-zinc-600 font-bold text-lg">:</span>
          <div className="text-center">
            <span className="text-[9px] text-cyber-pink font-bold block uppercase">
              {gameMode === 'pvp' ? 'PLAYER 2' : `AI (${difficulty.toUpperCase()})`}
            </span>
            <span className="text-2xl font-black text-white">{opponentScore}</span>
          </div>
        </div>

        {/* Controls & Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setGameMode('ai')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                gameMode === 'ai' ? 'bg-cyber-cyan text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> VS AI
            </button>
            <button
              onClick={() => setGameMode('pvp')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                gameMode === 'pvp' ? 'bg-cyber-pink text-white font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 2-PLAYER
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport container */}
      <div className="relative w-full max-w-[1700px] h-[650px] aspect-video rounded-2xl border border-zinc-800 bg-zinc-950/90 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full object-contain cursor-crosshair" />

        {/* Overlay Overlay Menu */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="flex items-center gap-2 text-cyber-cyan font-black text-2xl tracking-wider animate-bounce">
              <Sparkles className="w-6 h-6" /> NEON PONG ARENA
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Control your neon paddle with <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 font-mono">W / S</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 font-mono">↑ / ↓</kbd>. Score 7 goals to claim victory!
            </p>

            {gameMode === 'ai' && (
              <div className="flex gap-2">
                {(['rookie', 'pro', 'cyberboss'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      difficulty === d ? 'bg-cyber-pink text-white border border-cyber-pink shadow-lg shadow-cyber-pink/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan via-blue-500 to-cyber-pink text-zinc-950 font-black text-sm tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyber-cyan/30 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-zinc-950" /> START MATCH
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-2xl font-black text-white">{winner} WINS THE MATCH!</h3>
            <p className="text-xs text-zinc-400">Final Score: {playerScore} - {opponentScore}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-cyber-cyan text-zinc-950 font-black text-xs hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-cyber-cyan/30"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Control Tips & PowerUp Legend */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-400 flex items-center gap-2">
          <span className="p-1.5 rounded bg-zinc-900 text-cyber-cyan font-bold">P1</span>
          <span>Controls: <strong className="text-white">W / S</strong> Keys</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-400 flex items-center gap-2">
          <span className="p-1.5 rounded bg-zinc-900 text-cyber-pink font-bold">P2</span>
          <span>Controls: <strong className="text-white">Up / Down</strong> Keys</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-amber-400 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Active PowerUp: <strong className="text-white">{activePowerUp || 'NONE'}</strong></span>
        </div>
      </div>
    </div>
  );
}
