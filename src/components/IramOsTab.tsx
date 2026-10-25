"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Cpu, Film, Palette, Terminal, Shield, Wifi, 
  ExternalLink, Sparkles, CheckCircle2, ChevronRight, BookOpen, 
  Star, Radio, Music, Volume2, Monitor, Box, Activity, Flame,
  FileCode, Play, Award, Zap
} from 'lucide-react';

interface IramOsTabProps {
  onTabChange?: (tabId: string) => void;
}

export default function IramOsTab({ onTabChange }: IramOsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'craft' | 'video' | 'themes' | 'fastmcp' | 'agents'>('overview');
  const [selectedTheme, setSelectedTheme] = useState('tokyo-storm');
  const [selectedCraftApp, setSelectedCraftApp] = useState('photo');
  const [selectedPipelineFilter, setSelectedPipelineFilter] = useState('all');

  const THEMES = [
    { id: 'tokyo-storm', name: 'Tokyo Storm', color: '#38bdf8', bg: '#090d16', accent: '#6366f1', desc: 'OLED midnight blue with neon cyan & violet glow' },
    { id: 'alpora-alpine', name: 'Alpora Alpine', color: '#38bdf8', bg: '#07131e', accent: '#0284c7', desc: 'Glacial cobalt and ice-blue for maximum daylight acuity' },
    { id: 'cyber-neon', name: 'Cyber Neon', color: '#06b6d4', bg: '#080612', accent: '#f43f5e', desc: 'High-voltage electric magenta, cyan, and deep obsidian' },
    { id: 'rose-pine', name: 'Rosé Pine', color: '#9ccfd8', bg: '#191724', accent: '#eb6f92', desc: 'Nordic dusk with warm muted rose, pine, and gold' },
    { id: 'catppuccin', name: 'Catppuccin Mocha', color: '#89dceb', bg: '#1e1e2e', accent: '#cba6f7', desc: 'Soothing pastel lavender, mauve, and soft sky' },
    { id: 'nord', name: 'Nord Frost', color: '#88c0d0', bg: '#242933', accent: '#81a1c1', desc: 'Arctic deep slate with cool aurora green and frost' },
    { id: 'gruvbox', name: 'Gruvbox Retro', color: '#83a598', bg: '#1d2021', accent: '#fe8019', desc: 'Warm retro charcoal, burnt amber, and forest green' },
  ];

  const CRAFT_APPS: Record<string, { name: string; role: string; replaces: string; desc: string; formats: string; cmd: string; icon: string }> = {
    photo: {
      name: "PhotoCraft",
      role: "Raster Image & Retouching Studio",
      replaces: "Adobe Photoshop",
      desc: "GPU-accelerated raster graphics editor supporting PSD multi-layer compositing, non-destructive adjustment layers, neural inpainting, and RAW image import.",
      formats: "PSD, PSB, TIFF, PNG, EXR, WebP, JPEG-XL",
      cmd: "iram craft photo",
      icon: "🖼️"
    },
    vector: {
      name: "VectorCraft",
      role: "Vector Graphics & Typography Studio",
      replaces: "Adobe Illustrator",
      desc: "Precision vector design workspace with infinite canvas, boolean path geometry, typography on path, SVG glyph editing, and AI vector tracing.",
      formats: "SVG, AI, EPS, PDF, DXF, GeoJSON",
      cmd: "iram craft vector",
      icon: "✏️"
    },
    film: {
      name: "FilmCraft",
      role: "Non-Linear 4K Video Editor",
      replaces: "Adobe Premiere Pro",
      desc: "High-throughput magnetic timeline editor supporting 4K/8K multi-track footage, hardware NVENC/VA-API rendering, 3D LUT grading, and optical flow transitions.",
      formats: "MP4, MOV, ProRes, MKV, WebM, XML, EDL",
      cmd: "iram craft film",
      icon: "🎬"
    },
    sound: {
      name: "SoundCraft",
      role: "Digital Audio Workstation & DSP",
      replaces: "Avid Pro Tools / Logic Pro",
      desc: "PipeWire low-latency multi-track audio workstation with VST3/LV2 plugin hosts, spectral audio repair, MIDI sequencing, and hardware DSP calibration.",
      formats: "WAV, FLAC, AIFF, OGG, MIDI, PipeWire Raw",
      cmd: "iram craft sound",
      icon: "🎚️"
    },
    cad: {
      name: "CADCraft",
      role: "Parametric 2D/3D CAD Modeler",
      replaces: "AutoCAD / Fusion 360",
      desc: "Parametric CAD modeling and 2D architectural drafting with geometric constraint solvers, STEP/IGES import, and direct 3D-printing slicer export.",
      formats: "STEP, IGES, STL, OBJ, DXF, DWG",
      cmd: "iram craft cad",
      icon: "📐"
    },
    fig: {
      name: "FigCraft",
      role: "UI/UX Design & Prototyping",
      replaces: "Figma",
      desc: "Collaborative design canvas with design token variables, auto-layout flex engines, interactive state machines, and direct CSS/Tailwind export.",
      formats: "FIG, JSON Tokens, HTML/CSS, React TSX",
      cmd: "iram craft fig",
      icon: "💎"
    },
    light: {
      name: "LightCraft",
      role: "RAW Photo Processing & Grading",
      replaces: "Adobe Lightroom",
      desc: "Non-destructive RAW photo development with lens calibration, chromatic aberration correction, tone curve split-toning, and high-speed batch export.",
      formats: "DNG, CR3, NEF, ARW, RAF, TIFF",
      cmd: "iram craft light",
      icon: "☀️"
    },
    word: {
      name: "WordCraft",
      role: "Typographic Word Processor",
      replaces: "Microsoft Word",
      desc: "Distraction-free typographic word processor with real-time markdown split view, citation management, and exact DOCX/PDF export.",
      formats: "DOCX, ODT, Markdown, PDF, LaTeX",
      cmd: "iram craft word",
      icon: "📝"
    },
    grid: {
      name: "GridCraft",
      role: "High-Speed Spreadsheet Engine",
      replaces: "Microsoft Excel",
      desc: "High-throughput spreadsheet engine rendering 1,000,000 rows at 60 FPS, multi-dimensional pivot tables, and formula solvers.",
      formats: "XLSX, CSV, TSV, Parquet, Arrow",
      cmd: "iram craft grid",
      icon: "📊"
    },
    deck: {
      name: "DeckCraft",
      role: "Presentation Slide Designer",
      replaces: "Microsoft PowerPoint",
      desc: "Presentation slide designer with WebGL 3D transitions, animated Chart.js data visuals, code syntax blocks, and export to PDF/HTML5.",
      formats: "PPTX, HTML Slides, PDF, Video MP4",
      cmd: "iram craft deck",
      icon: "📽️"
    },
    pdf: {
      name: "PdfCraft",
      role: "PDF Markup & Cryptographic Signer",
      replaces: "Adobe Acrobat Pro",
      desc: "Fast vector PDF editor for text editing, form completion, cryptographic certificate signing, redaction, and multi-document page merging.",
      formats: "PDF, PDF/A, FDF, XFDF",
      cmd: "iram craft pdf",
      icon: "📑"
    }
  };

  const PIPELINES = [
    { id: "documentary-montage", cat: "documentary", title: "Documentary Montage", desc: "Thematic montage from NASA, Archive.org & Pexels with music sync and color grading." },
    { id: "animated-explainer", cat: "animation", title: "Animated Explainer", desc: "Remotion React motion graphics explainer with KPIs, charts, and comparison cards." },
    { id: "character-animation", cat: "animation", title: "Character Animation", desc: "Character animation pipeline for local SVG & diffusers generative assets." },
    { id: "cinematic", cat: "animation", title: "Cinematic Trailer", desc: "Mood-led cinematic trailer with dramatic tension curve and orchestral score." },
    { id: "talking-head", cat: "speech", title: "Talking Head", desc: "End-to-end presenter-led talking-head video pipeline." },
    { id: "avatar-spokesperson", cat: "speech", title: "Avatar Spokesperson", desc: "Digital twin avatar pipeline with speech sync and lip animation." },
    { id: "localization-dub", cat: "speech", title: "Localization & Dubbing", desc: "Transcript-first multi-language dubbing and subtitle sync (English & தமிழ்)." },
    { id: "clip-factory", cat: "social", title: "Clip Factory", desc: "Multi-clip vertical extraction pipeline for YouTube Shorts, Reels, and TikTok." },
    { id: "podcast-repurpose", cat: "social", title: "Podcast Repurpose", desc: "Long-form podcast to video pipeline with animated waveforms and captions." },
    { id: "screen-demo", cat: "social", title: "Screen Demo", desc: "Interactive developer screen recording pipeline with kinetic zoom callouts." },
    { id: "hybrid", cat: "animation", title: "Hybrid Production", desc: "Multi-modal video combining AI video, archive footage, and Remotion graphics." },
    { id: "framework-smoke", cat: "custom", title: "Framework Smoke", desc: "Minimal pipeline manifest for verification and smoke testing." },
  ];

  const currentTheme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];
  const currentApp = CRAFT_APPS[selectedCraftApp] || CRAFT_APPS['photo'];

  const filteredPipelines = selectedPipelineFilter === 'all' 
    ? PIPELINES 
    : PIPELINES.filter(p => p.cat === selectedPipelineFilter);

  return (
    <div className="w-full max-w-[1700px] flex flex-col gap-6">
      
      {/* Flagship Hero Bento Card */}
      <div 
        className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border"
        style={{ borderColor: currentTheme.color + '40', background: `radial-gradient(ellipse at top left, ${currentTheme.accent}20, transparent 60%)` }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs font-semibold text-cyber-cyan mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ubuntu 26.10 Sovereign Distribution · Hyprland 0.56 · PipeWire</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            IRAM <span className="text-gradient">OS</span> v26.10
          </h1>
          
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl">
            A turnkey 64-bit autonomous agentic Linux operating system engineered for AI coding swarms, 
            the 11-app <b>Storytold Craft Suite</b>, the <b>Universal Film & Video Studio</b>, 
            and sub-100ms zero-restart <b>ALPORA</b> circadian theming.
          </p>

          <div className="flex flex-wrap gap-3 mt-6 items-center">
            <a 
              href="https://apravint.github.io/iram-docs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyber-cyan text-zinc-950 hover:bg-cyber-cyan/90 transition-all shadow-lg shadow-cyber-cyan/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Live Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a 
              href="https://github.com/apravint/iram-os" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white transition-all"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>GitHub (apravint/iram-os)</span>
            </a>

            <a 
              href="https://pypi.org/project/fastmcp-linux-desktop/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all"
            >
              <Award className="w-4 h-4 text-green-400" />
              <span>PyPI v0.1.0 (Glama Grade A)</span>
            </a>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto min-w-[280px] z-10">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center">
            <div className="text-2xl font-black text-cyber-cyan font-mono">49</div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Curated Themes</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center">
            <div className="text-2xl font-black text-green-400 font-mono">11</div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Creative Apps</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center">
            <div className="text-2xl font-black text-purple-400 font-mono">12</div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Video Pipelines</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center">
            <div className="text-2xl font-black text-amber-400 font-mono">28+</div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">FastMCP Tools</div>
          </div>
        </div>
      </div>

      {/* Subsystem Navigation Bar */}
      <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Ecosystem Architecture', icon: Layers },
          { id: 'craft', label: 'Storytold Craft Suite (11 Apps)', icon: Palette },
          { id: 'video', label: 'Film & OpenMontage (iram-video)', icon: Film },
          { id: 'themes', label: 'ALPORA Dynamic Theming (49)', icon: Sparkles },
          { id: 'fastmcp', label: 'FastMCP Desktop Control', icon: Cpu },
          { id: 'agents', label: 'AI Swarm & Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-zinc-800 text-white border border-zinc-600 shadow-md scale-102' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subsystem Content Panels */}
      <AnimatePresence mode="wait">

        {/* 1. OVERVIEW PANEL */}
        {activeSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyber-cyan" />
                  <span>The Unified `iram` Command Dispatcher</span>
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Every layer of IRAM OS—from compositors and AI agents to audio DSP and video generation—is managed via the unified <code>iram</code> CLI dispatcher:
                </p>

                <div className="bg-[#03060c] border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                  <div className="text-zinc-500 mb-2"># Core Command Groups</div>
                  <div><span className="text-cyber-cyan font-bold">iram video</span> [prompt] [opts]   <span className="text-zinc-500"># Real 1080p/4K YouTube documentaries & OpenMontage</span></div>
                  <div><span className="text-green-400 font-bold">iram craft</span> [app]             <span className="text-zinc-500"># Launch PhotoCraft, VectorCraft, FilmCraft, etc.</span></div>
                  <div><span className="text-amber-400 font-bold">iram theme</span> [set|timeline]     <span className="text-zinc-500"># Sub-100ms live retheming across 49 curated palettes</span></div>
                  <div><span className="text-purple-400 font-bold">iram voice</span> [speak|clone]     <span className="text-zinc-500"># Neural voice cloning, PipeWire studio routing & dubbing</span></div>
                  <div><span className="text-cyber-pink font-bold">iram sidecar</span>                 <span className="text-zinc-500"># Toggle native WebKitGTK floating Wayland AI assistant</span></div>
                  <div><span className="text-blue-400 font-bold">iram quant</span> [us|in]           <span className="text-zinc-500"># Cross-market algorithmic stock leader scanner</span></div>
                  <div><span className="text-rose-400 font-bold">iram audit</span>                   <span className="text-zinc-500"># 6-phase Hunter/Verifier pre-push security audit</span></div>
                </div>
              </div>

              {/* Subsystems Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 text-cyber-cyan font-bold text-sm mb-1.5">
                    <Monitor className="w-4 h-4" /> Hyprland 0.56 & hypr-doctor
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    0px geometric tiling, acrylic blur, zero-restart theming, and an automated static analysis linter purging duplicate keybindings.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1.5">
                    <Wifi className="w-4 h-4" /> ECMP Multi-WAN Dual Wi-Fi
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Aggregates internal PCIe and external USB Wi-Fi interfaces via kernel Equal-Cost Multi-Path policy routing and L4 flow hashing.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1.5">
                    <Cpu className="w-4 h-4" /> 98% BM25 Context Condenser
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Local SQLite FTS5 BM25 token ranker shrinking voluminous logs, diffs, and tool outputs prior to prompting to stop context exhaustion.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                    <Shield className="w-4 h-4" /> Adversarial Pre-Push Gate
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    6-phase Hunter and Verifier security audit catching secrets, eval leaks, and shell injection seams before git push.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Quick Link & Live Demo Card */}
            <div className="flex flex-col gap-4">
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-cyber-cyan mb-2">Live Portal</div>
                  <h4 className="text-base font-bold text-white mb-2">Interactive Documentation</h4>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    Includes a live browser-based theme switcher, full FastMCP playground simulator, and keybinding catalogs.
                  </p>
                </div>
                <a 
                  href="https://apravint.github.io/iram-docs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-cyber-cyan text-white text-xs font-bold transition-all"
                >
                  <span>apravint.github.io/iram-docs</span>
                  <ExternalLink className="w-4 h-4 text-cyber-cyan" />
                </a>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">Distribution Mastering</div>
                <h4 className="text-base font-bold text-white mb-2">Live Hybrid ISO Builder</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  Automated Ubuntu 26.10 hybrid live ISO toolchain with automated headless QEMU sanity boot verification.
                </p>
                <div className="font-mono text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  iram package iso
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. STORYTOLD CRAFT SUITE PANEL */}
        {activeSubTab === 'craft' && (
          <motion.div
            key="craft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Storytold Craft Suite — 11 Sovereign Open-Source Creative Apps
              </h3>
              <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
                Engineered in Rust with GPU acceleration to replace subscription suites (Adobe Creative Cloud, Microsoft 365, Figma). 
                Select an application below to view features, supported formats, and execution commands:
              </p>

              {/* App Pills */}
              <div className="flex gap-2 overflow-x-auto py-4 scrollbar-none">
                {Object.keys(CRAFT_APPS).map((key) => {
                  const app = CRAFT_APPS[key];
                  const isSelected = selectedCraftApp === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCraftApp(key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isSelected 
                          ? 'bg-cyber-cyan text-zinc-950 shadow-lg shadow-cyber-cyan/20 scale-105' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span>{app.icon}</span>
                      <span>{app.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected App Card */}
              <div className="p-6 rounded-xl bg-zinc-950/70 border border-zinc-800 mt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentApp.icon}</span>
                      <h4 className="text-xl font-black text-white">{currentApp.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                        Replaces {currentApp.replaces}
                      </span>
                    </div>
                    <div className="text-xs text-cyber-cyan font-semibold mt-1">{currentApp.role}</div>
                  </div>

                  <div className="font-mono text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {currentApp.cmd}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {currentApp.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Native File Formats</span>
                    <span className="text-zinc-200">{currentApp.formats}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Architecture</span>
                    <span className="text-green-400">Pure Rust + GPU Hardware Accelerated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. FILM & VIDEO PANEL */}
        {activeSubTab === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Universal Film Studio (`iram-video`) & OpenMontage
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Generates real YouTube documentaries, motion graphics, and cinema trailers with zero hallucinations.
                  </p>
                </div>

                <div className="font-mono text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-cyber-cyan">
                  iram video [prompt] --real
                </div>
              </div>

              {/* Pipeline Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none my-3">
                {[
                  { id: 'all', label: 'All Pipelines (12)' },
                  { id: 'documentary', label: 'Documentary' },
                  { id: 'animation', label: 'Animation & Motion' },
                  { id: 'speech', label: 'Speech & Avatar' },
                  { id: 'social', label: 'Social & Shorts' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedPipelineFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedPipelineFilter === f.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Pipelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {filteredPipelines.map((pipe) => (
                  <div key={pipe.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-sm text-white">{pipe.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {pipe.cat}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{pipe.desc}</p>
                    </div>
                    <div className="font-mono text-[11px] text-cyber-cyan bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
                      iram video montage "..." --pipeline {pipe.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. ALPORA THEMES PANEL */}
        {activeSubTab === 'themes' && (
          <motion.div
            key="themes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                ALPORA Theme Studio — Sub-100ms Zero-Restart Dynamic Theming
              </h3>
              <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed mb-6">
                49 curated palettes with an integrated 24-hour Circadian Sun/Sky timeline engine. 
                Click any palette below to preview its color harmony:
              </p>

              {/* Theme Swatches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-cyber-cyan bg-zinc-900/80 shadow-lg scale-102' 
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{theme.name}</span>
                        <div className="flex gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: theme.color }}></span>
                          <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: theme.accent }}></span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">{theme.desc}</p>
                      <div className="font-mono text-[11px] text-zinc-500">
                        iram theme set {theme.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. FASTMCP PANEL */}
        {activeSubTab === 'fastmcp' && (
          <motion.div
            key="fastmcp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    <span>FastMCP Linux Desktop — Model Context Protocol Server</span>
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Published on PyPI as <code>fastmcp-linux-desktop v0.1.0</code> with verified Glama Grade-A TDQS standard.
                  </p>
                </div>

                <div className="flex gap-2">
                  <a 
                    href="https://pypi.org/project/fastmcp-linux-desktop/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold"
                  >
                    PyPI Package
                  </a>
                  <a 
                    href="https://glama.ai/mcp/servers/apravint/fastmcp-linux-desktop" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold"
                  >
                    Glama Registry
                  </a>
                </div>
              </div>

              <div className="bg-[#03060c] border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 mb-6">
                <div className="text-zinc-500 mb-1"># Run locally or as systemd user daemon</div>
                <div>pip install fastmcp-linux-desktop</div>
                <div>fastmcp-linux-desktop --sse --port 8991</div>
              </div>

              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-zinc-400">
                Core Native Tool Categories (28 Tools)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <div className="text-xs font-bold text-cyber-cyan mb-1.5">Window Management</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    get_windows, focus_window, dispatch_hyprland, move_window, close_window
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <div className="text-xs font-bold text-green-400 mb-1.5">Audio & Hardware DSP</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    get_audio_status, toggle_audio_sink, set_volume, audit_media, heal_system
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <div className="text-xs font-bold text-purple-400 mb-1.5">Memory & Theming</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    set_theme, launch_craft, condense_context, memory_retain, memory_recall
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. AI SWARM & SECURITY */}
        {activeSubTab === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" />
                  <span>Agent Jail & ToolGate Confinement</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Autonomous agents execute within rootless Bubblewrap sandboxes with strict capability confinement and human-in-the-loop unskippable desktop authorization dialogs.
                </p>
                <div className="font-mono text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-rose-300">
                  iram-toolgate --isolate agent-swarm
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyber-cyan" />
                  <span>OpenRig Swarm Software Factory</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Multi-agent collaborative topologies running autonomous software engineering teams with review gates, verification loops, and role specialization.
                </p>
                <div className="font-mono text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-cyber-cyan">
                  iram openrig team --manifest factory.yaml
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
