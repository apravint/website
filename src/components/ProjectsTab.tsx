"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderGit2, ExternalLink, Star, Cpu, Terminal, 
  BookOpen, Bot, Sparkles, Code2, Globe, RefreshCw,
  Plane, Sun, Film, Image as ImageIcon, DollarSign, Brain,
  Layers, Shield, Wifi, Award, Palette
} from 'lucide-react';

interface VerifiedRepo {
  name: string;
  title: string;
  category: 'Flagship IRAM OS' | 'AI & Multi-Agent' | 'Linux & Compositor' | 'Web & Apps' | 'Finance & Tools' | 'Media & Machine Learning';
  description: string;
  architecturalHighlights: string[];
  techStack: string[];
  githubUrl: string;
  featured?: boolean;
  icon: any;
  gradient: string;
  badgeText?: string;
  stars?: number;
}

export default function ProjectsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [liveRepos, setLiveRepos] = useState<VerifiedRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Exact Verified Public Repositories on https://github.com/apravint
  const curatedProjects: VerifiedRepo[] = [
    {
      name: 'iram-os',
      title: 'IRAM OS v26.10',
      category: 'Flagship IRAM OS',
      description: 'Turnkey 64-bit sovereign autonomous agentic Linux distribution unifying the 11-app Storytold Creative Suite, FastMCP 28-tool control daemon, Universal Video Engine, and ALPORA 49-palette circadian theming.',
      architecturalHighlights: [
        'Ubuntu 26.10 + Hyprland 0.56 + PipeWire studio audio with 0px geometric tiling',
        'Storytold Craft Suite: 11 native open-source Rust creative apps replacing Adobe & Microsoft',
        'Sub-100ms zero-restart ALPORA theming across 49 curated desktop palettes',
        'Automated live hybrid ISO builder with headless QEMU sanity boot verification'
      ],
      techStack: ['Ubuntu 26.10', 'Hyprland 0.56', 'PipeWire', 'Rust', 'Python', 'Linux Kernel 7.3'],
      githubUrl: 'https://github.com/apravint/iram-os',
      featured: true,
      icon: Layers,
      gradient: 'from-cyber-cyan via-blue-600 to-indigo-700',
      badgeText: '🌌 Flagship Sovereign OS'
    },
    {
      name: 'fastmcp-linux-desktop',
      title: 'FastMCP Linux Desktop (PyPI v0.1.0)',
      category: 'Flagship IRAM OS',
      description: '28-Tool high-performance JSON-RPC Model Context Protocol server exposing hardware, window management, audio DSP, and memory recall to AI coding agents (Claude, Cursor, Antigravity, OpenRig).',
      architecturalHighlights: [
        'Published to PyPI as fastmcp-linux-desktop 0.1.0 with verified Glama Grade-A TDQS standard',
        '28 native system tools covering Hyprland geometry, PipeWire audio, systemd health, and memory',
        'Interactive JSON-RPC playground simulator and sub-10ms execution latency',
        'Native MCP annotations (readOnlyHint, destructiveHint, idempotentHint)'
      ],
      techStack: ['Python 3.12/3.14', 'FastMCP', 'MCP Protocol', 'PyPI', 'PipeWire', 'Hyprland'],
      githubUrl: 'https://github.com/apravint/fastmcp-linux-desktop',
      featured: true,
      icon: Award,
      gradient: 'from-purple-500 via-violet-600 to-cyan-500',
      badgeText: '⭐ PyPI v0.1.0 · Glama Grade A'
    },
    {
      name: 'video-gen',
      title: 'Universal Film & Video Studio Engine',
      category: 'Flagship IRAM OS',
      description: 'Sovereign film directing and compilation engine generating real 1080p/4K YouTube documentaries, OpenMontage 12-pipeline agentic directing, and Remotion React motion graphics.',
      architecturalHighlights: [
        'Real YouTube documentary generator with stock B-roll, photography, and acoustic score (--real)',
        'OpenMontage 12-pipeline agentic production directory (documentary-montage, animated-explainer, etc.)',
        'Headless Remotion React motion graphics renders via Chrome Headless Shell',
        'Backlot living storyboard visual inspector on http://localhost:8080'
      ],
      techStack: ['Python 3.12', 'FFmpeg', 'Remotion', 'React 18', 'Node.js', 'OpenMontage'],
      githubUrl: 'https://github.com/apravint/video-gen',
      featured: true,
      icon: Film,
      gradient: 'from-rose-500 via-pink-600 to-purple-600',
      badgeText: '🎬 Real 4K Documentary & Remotion'
    },
    {
      name: 'storytold-craft-linux',
      title: 'Storytold Craft Suite (11 Native Apps)',
      category: 'Flagship IRAM OS',
      description: '11 native, GPU-accelerated open-source Rust applications replacing Adobe Creative Cloud and Microsoft Office (PhotoCraft, VectorCraft, FilmCraft, SoundCraft, CADCraft, FigCraft).',
      architecturalHighlights: [
        'Direct replacements for Photoshop, Illustrator, Premiere, Pro Tools, Figma, and Fusion 360',
        'High-speed Rust graphics engine with GPU acceleration and native Wayland protocol',
        'Unified ArtCraft launcher (artcraft-launcher / iram craft)',
        'Native file format support: PSD, SVG, STEP, RAW, DOCX, XLSX, FIG'
      ],
      techStack: ['Rust', 'Vulkan/GPU', 'Wayland', 'PipeWire', 'GTK4'],
      githubUrl: 'https://github.com/apravint/storytold-craft-linux',
      featured: true,
      icon: Palette,
      gradient: 'from-amber-400 via-orange-500 to-rose-600',
      badgeText: '🎨 11 Sovereign Creative Apps'
    },
    {
      name: 'iram-docs',
      title: 'IRAM OS Documentation & Technical Portal',
      category: 'Flagship IRAM OS',
      description: 'Official interactive documentation portal for IRAM OS with live zero-restart theme switcher, FastMCP 28-tool reference, Storytold Craft explorer, and Hyprland keybinding catalogs.',
      architecturalHighlights: [
        'Live theme switcher supporting 7 curated IRAM OS palettes with dynamic CSS variables',
        'Interactive FastMCP JSON-RPC tool simulation playground',
        'OpenMontage 12-pipeline filterable directory with stage breakdowns',
        'Automated GitHub Pages CI/CD deploy at apravint.github.io/iram-docs'
      ],
      techStack: ['HTML5', 'CSS Custom Properties', 'JavaScript', 'GitHub Pages CI/CD'],
      githubUrl: 'https://github.com/apravint/iram-docs',
      featured: true,
      icon: BookOpen,
      gradient: 'from-cyber-cyan via-emerald-500 to-teal-600',
      badgeText: '📚 Official Live Portal'
    },
    {
      name: 'hypr-doctor',
      title: 'hypr-doctor (Hyprland Static Linter)',
      category: 'Linux & Compositor',
      description: 'Zero-dependency static analysis linter, duplicate keybinding detector, and autostart auditor for Hyprland 0.56.',
      architecturalHighlights: [
        'AST parser detecting duplicate binds across nested includes',
        'Checks dedicated AI shortcut modifier space ($mainMod CTRL ALT)',
        'Safe reload hooks with exit code verification and systemd sanity checks'
      ],
      techStack: ['Python 3', 'Hyprland 0.56', 'Static Analysis', 'CLI'],
      githubUrl: 'https://github.com/apravint/hypr-doctor',
      icon: Terminal,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      badgeText: '🪟 Hyprland 0.56 Linter'
    },
    {
      name: 'context-condenser',
      title: 'context-condenser (98% BM25 Compressor)',
      category: 'AI & Multi-Agent',
      description: 'Local SQLite FTS5 BM25 token frequency compression engine shrinking massive logs, diffs, and tool outputs prior to prompting.',
      architecturalHighlights: [
        'Eliminates LLM context window exhaustion up to 98%',
        'SQLite FTS5 BM25 relevance ranking token prioritization',
        'Streaming pipeable CLI interface for agent tool outputs'
      ],
      techStack: ['Python 3', 'SQLite FTS5', 'BM25 Tokenizer', 'CLI'],
      githubUrl: 'https://github.com/apravint/context-condenser',
      icon: Cpu,
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
      badgeText: '⚡ 98% BM25 Compressor'
    },
    {
      name: 'agent-hindsight',
      title: 'agent-hindsight (Temporal Memory)',
      category: 'AI & Multi-Agent',
      description: 'Temporal episodic long-term memory engine with half-life recency decay and semantic reflection for AI coding agents.',
      architecturalHighlights: [
        'Episodic fact retention with mathematical half-life recency decay',
        'Semantic reflection and categorized recall for persistent coding pairs',
        'Zero cloud dependency: runs completely on local storage'
      ],
      techStack: ['Python 3', 'Vector Store', 'Episodic Memory', 'SQLite'],
      githubUrl: 'https://github.com/apravint/agent-hindsight',
      icon: Brain,
      gradient: 'from-purple-400 via-pink-500 to-rose-500',
      badgeText: '🧠 Episodic Memory'
    },
    {
      name: 'adversarial-pre-push',
      title: 'adversarial-pre-push (Security Gate)',
      category: 'Linux & Compositor',
      description: '6-phase Hunter and Verifier git pre-push security auditing gate catching secrets, eval leaks, and shell injection seams.',
      architecturalHighlights: [
        'Separated Hunter and Verifier adversarial testing stages',
        'Zero-token local heuristic pattern analysis and secret hunting',
        'Blocks unverified git pushes automatically in CI/CD and local repos'
      ],
      techStack: ['Python 3', 'Bash', 'Git Hooks', 'Security Auditing'],
      githubUrl: 'https://github.com/apravint/adversarial-pre-push',
      icon: Shield,
      gradient: 'from-rose-500 via-red-600 to-amber-500',
      badgeText: '🛡️ 6-Phase Security Gate'
    },
    {
      name: 'linux-dual-wifi',
      title: 'linux-dual-wifi (ECMP Multi-WAN)',
      category: 'Linux & Compositor',
      description: 'Aggregates internal PCIe and external USB Wi-Fi interfaces via Linux kernel Equal-Cost Multi-Path policy routing.',
      architecturalHighlights: [
        'Multipath packet balancing with Layer 4 flow hashing',
        'ARP flux mitigation across multiple local subnet gateways',
        'Automated failover and bandwidth aggregation'
      ],
      techStack: ['Linux Kernel', 'iproute2', 'Bash', 'ECMP Routing'],
      githubUrl: 'https://github.com/apravint/linux-dual-wifi',
      icon: Wifi,
      gradient: 'from-blue-500 via-indigo-600 to-cyan-500',
      badgeText: '📡 ECMP Multi-WAN'
    },
    {
      name: 'BookGeneratorAI',
      title: 'BookGenerator AI',
      category: 'AI & Multi-Agent',
      description: 'Executive-grade multi-agent engine designed to autonomously generate publication-ready 300-page commercial manuscripts (80,000+ words) using local Ollama & open models.',
      architecturalHighlights: [
        'Hierarchical state isolation preventing context collapse over 80k words',
        'Beat-by-beat scene drafter (6 sub-beats per chapter)',
        'Adversarial Anti-Slop & Continuity Critics purging AI clichés',
        'Direct local Ollama REST client with 600s timeouts & 16k context'
      ],
      techStack: ['Python 3.12', 'Pydantic v2', 'Local Ollama', 'DeepSeek-R1', 'SQLite', 'python-docx'],
      githubUrl: 'https://github.com/apravint/BookGeneratorAI',
      featured: true,
      icon: Cpu,
      gradient: 'from-purple-500 via-indigo-500 to-cyber-cyan',
      badgeText: '🔥 Multi-Agent AI'
    },
    {
      name: 'website',
      title: 'Pravin Tamilan Web Portal',
      category: 'Web & Apps',
      description: 'Full-screen Next.js 16 portal featuring local in-browser Web-LLM inference (@mlc-ai), IRAM OS Flagship Dashboard, 3D arcade games, live stock market monitor, and IPTV decoder.',
      architecturalHighlights: [
        'In-browser WebGPU LLM execution using @mlc-ai/web-llm',
        'IRAM OS Flagship Desktop Hub with live theme previewer',
        'Programmatic 3D Three.js rendering loops for arcade games',
        'Real-time Indian, US, and Global stock market monitor ticker'
      ],
      techStack: ['Next.js 16', 'React 19', 'Three.js', 'Web-LLM', 'TailwindCSS v4'],
      githubUrl: 'https://github.com/apravint/website',
      featured: true,
      icon: Globe,
      gradient: 'from-cyber-pink via-rose-500 to-purple-600',
      badgeText: '🌐 Live Web Platform'
    },
    {
      name: 'Gold-And-Silver-Price-Tracker',
      title: 'Gold & Silver Price Tracker',
      category: 'Finance & Tools',
      description: 'Real-time precious metals rate tracking application for monitoring live gold and silver spot prices, percentage movements, and historical charts.',
      architecturalHighlights: [
        'Live financial market price polling API connector',
        'TypeScript price delta calculations and trend indicators',
        'Clean tabular layout for 24K, 22K gold & silver rates',
        'Fast client-side state hydration'
      ],
      techStack: ['TypeScript', 'React', 'Financial API', 'TailwindCSS'],
      githubUrl: 'https://github.com/apravint/Gold-And-Silver-Price-Tracker',
      icon: DollarSign,
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      badgeText: '💰 Bullion & Metals'
    }
  ];

  // Fetch real-time public repositories directly from GitHub API
  useEffect(() => {
    async function fetchGitHubRepos() {
      try {
        const res = await fetch('https://api.github.com/users/apravint/repos?per_page=100&sort=updated');
        if (!res.ok) throw new Error('Failed to fetch repos');
        const data = await res.json();
        
        // Filter non-forked repos
        const reposMap = new Map();
        data.forEach((r: any) => {
          if (!r.fork) {
            reposMap.set(r.name.toLowerCase(), r);
          }
        });

        // Attach live star count to curated projects
        const updatedCurated = curatedProjects.map(p => {
          const matched = reposMap.get(p.name.toLowerCase());
          return {
            ...p,
            stars: matched ? matched.stargazers_count : 0
          };
        });

        setLiveRepos(updatedCurated);
      } catch (e) {
        setLiveRepos(curatedProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubRepos();
  }, []);

  const categories = [
    'All', 
    'Flagship IRAM OS', 
    'AI & Multi-Agent', 
    'Linux & Compositor', 
    'Web & Apps', 
    'Finance & Tools'
  ];

  const filteredProjects = selectedCategory === 'All' 
    ? liveRepos 
    : liveRepos.filter(p => p.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="w-full max-w-[1700px] flex flex-col gap-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-cyber-cyan" />
            <span>Open-Source Repositories & Engineering Systems</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Verified public architectures developed and maintained by Pravin Tamilan on GitHub.
          </p>
        </div>

        {/* Live Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-cyber-cyan text-zinc-950 shadow-md shadow-cyber-cyan/20 scale-102' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project, idx) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.name}
              variants={itemVariants}
              className="glass-card rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="flex flex-col gap-3">
                
                {/* Header & Badges */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyber-cyan group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-cyber-cyan transition-colors">
                        {project.title}
                      </h3>
                      <div className="text-[10px] font-mono text-zinc-500">{project.name}</div>
                    </div>
                  </div>

                  {project.badgeText && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyber-cyan whitespace-nowrap">
                      {project.badgeText}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Architectural Highlights */}
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 flex flex-col gap-1.5 my-1">
                  <span className="text-[9.5px] uppercase font-bold text-zinc-500 tracking-wider">Key Highlights</span>
                  {project.architecturalHighlights.slice(0, 2).map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                      <span className="text-cyber-cyan text-xs">▹</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800/80">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-xs">{project.stars || 0} stars</span>
                </div>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all border border-zinc-800 hover:border-zinc-700"
                >
                  <span>View Repository</span>
                  <ExternalLink className="w-3 h-3 text-cyber-cyan" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
