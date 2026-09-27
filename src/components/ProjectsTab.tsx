"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderGit2, ExternalLink, Star, Cpu, Terminal, 
  BookOpen, Bot, Sparkles, Code2, Globe, RefreshCw,
  Plane, Sun, Film, Image as ImageIcon, DollarSign, Brain
} from 'lucide-react';

interface VerifiedRepo {
  name: string;
  title: string;
  category: 'AI & Multi-Agent' | 'Web & Apps' | 'Finance & Tools' | 'Media & Machine Learning';
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
      badgeText: '🔥 Flagship Multi-Agent AI'
    },
    {
      name: 'website',
      title: 'Pravin Tamilan Web Portal',
      category: 'Web & Apps',
      description: 'Full-screen Next.js 16 portal featuring local in-browser Web-LLM inference (@mlc-ai), 3D arcade games (Three.js), live stock market monitor, and IPTV decoder.',
      architecturalHighlights: [
        'In-browser WebGPU LLM execution using @mlc-ai/web-llm',
        'Programmatic 3D Three.js rendering loops for arcade games',
        'Real-time Indian, US, and Global stock market monitor ticker',
        'TailwindCSS v4 glassmorphic responsive design'
      ],
      techStack: ['Next.js 16', 'React 19', 'Three.js', 'Web-LLM', 'TailwindCSS v4'],
      githubUrl: 'https://github.com/apravint/website',
      featured: true,
      icon: Globe,
      gradient: 'from-cyber-pink via-rose-500 to-purple-600',
      badgeText: '🌐 Live Web Platform'
    },
    {
      name: 'ollamachat',
      title: 'Ollama Chat Application',
      category: 'AI & Multi-Agent',
      description: 'Real-time interactive chat application built with Flask and clean HTML/CSS interfacing directly with local Ollama LLM models.',
      architecturalHighlights: [
        'Flask backend connecting to local Ollama inference server',
        'Real-time message streaming and session history',
        'Responsive dark mode glass UI',
        'Zero API cost local AI chat client'
      ],
      techStack: ['Python', 'Flask', 'Local Ollama', 'HTML5', 'CSS3', 'JavaScript'],
      githubUrl: 'https://github.com/apravint/ollamachat',
      featured: true,
      icon: Bot,
      gradient: 'from-cyber-cyan via-blue-500 to-emerald-400',
      badgeText: '🤖 Local Ollama Chat'
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
    },
    {
      name: 'flight-tracker',
      title: 'Real-Time Flight Tracker',
      category: 'Web & Apps',
      description: 'Live aircraft tracking web application providing real-time flight position data, altitude monitoring, and route visualizer.',
      architecturalHighlights: [
        'Live aviation telemetry data decoder engine',
        'Interactive map view with live aircraft marker updates',
        'Flight status, departure/arrival estimates, and airline info',
        'Asynchronous polling client'
      ],
      techStack: ['TypeScript', 'React', 'Aviation API', 'Leaflet / Mapbox'],
      githubUrl: 'https://github.com/apravint/flight-tracker',
      icon: Plane,
      gradient: 'from-blue-400 via-sky-500 to-cyan-500',
      badgeText: '✈️ Live Telemetry'
    },
    {
      name: 'kavithai',
      title: 'Tamil Kavithai Literature App',
      category: 'Web & Apps',
      description: 'Digital literature application dedicated to classic and modern Tamil poetry, verse breakdown, and regional literature reading.',
      architecturalHighlights: [
        'Custom C++ & TypeScript rendering logic for Tamil scripts',
        'Structured categorization of poems and verse commentary',
        'Lightweight fast rendering engine',
        'Clean responsive layout'
      ],
      techStack: ['C++', 'TypeScript', 'Web Tech'],
      githubUrl: 'https://github.com/apravint/kavithai',
      icon: BookOpen,
      gradient: 'from-rose-400 via-pink-500 to-purple-500',
      badgeText: '✍️ Literature'
    },
    {
      name: 'Weather',
      title: 'Live Weather Forecast Engine',
      category: 'Web & Apps',
      description: 'Clean, real-time weather forecasting application providing current conditions, hourly forecasts, and multi-city weather tracking.',
      architecturalHighlights: [
        'OpenWeather API integration for live temperature & humidity',
        'Dynamic weather background themes based on atmospheric conditions',
        'Geolocation lookup & favorite cities manager',
        'Responsive layout'
      ],
      techStack: ['TypeScript', 'React', 'Weather API', 'CSS3'],
      githubUrl: 'https://github.com/apravint/Weather',
      icon: Sun,
      gradient: 'from-amber-300 via-yellow-400 to-blue-500',
      badgeText: '🌤 Weather API'
    },
    {
      name: 'Video-Editor',
      title: 'Browser Video Editor App',
      category: 'Media & Machine Learning',
      description: 'Web-based video editing tool for trimming video clips, applying filters, adjusting audio tracks, and exporting processed media in-browser.',
      architecturalHighlights: [
        'HTML5 Video Canvas rendering pipeline',
        'Client-side timeline scrubbing & clip manipulation',
        'WebAssembly / Web Codecs video processing',
        'Export pipeline'
      ],
      techStack: ['TypeScript', 'HTML5 Canvas', 'Web Codecs', 'CSS3'],
      githubUrl: 'https://github.com/apravint/Video-Editor',
      icon: Film,
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      badgeText: '🎬 Media Processing'
    },
    {
      name: 'Image-Editor',
      title: 'Interactive Image Editor',
      category: 'Media & Machine Learning',
      description: 'Full-featured web image manipulation tool for cropping, color adjustments, filter applications, and layer management directly in the browser.',
      architecturalHighlights: [
        'HTML5 2D Canvas pixel manipulation filters',
        'Real-time brightness, contrast, saturation adjustments',
        'Lossless image export and scale controls',
        'Zero server dependency'
      ],
      techStack: ['TypeScript', 'HTML5 Canvas', 'React', 'TailwindCSS'],
      githubUrl: 'https://github.com/apravint/Image-Editor',
      icon: ImageIcon,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      badgeText: '🖼 Image Canvas'
    },
    {
      name: 'machinelearning',
      title: 'Machine Learning Models & Notebooks',
      category: 'Media & Machine Learning',
      description: 'Repository containing machine learning models, training scripts, data pipeline notebooks, and predictive analytics implementations.',
      architecturalHighlights: [
        'Supervised and unsupervised model training pipelines',
        'Jupyter Notebook analysis and visualization workflows',
        'Feature engineering and data preprocessing',
        'Model evaluation metrics'
      ],
      techStack: ['Jupyter Notebook', 'Python', 'Scikit-Learn', 'Pandas', 'NumPy'],
      githubUrl: 'https://github.com/apravint/machinelearning',
      icon: Brain,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      badgeText: '🧠 ML & Data Science'
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

  const categories = ['All', 'AI & Multi-Agent', 'Web & Apps', 'Finance & Tools', 'Media & Machine Learning'];

  const filteredProjects = selectedCategory === 'All' 
    ? liveRepos 
    : liveRepos.filter(p => p.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-[1700px] space-y-6"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="aurora-glow-cyan top-0 left-0 -ml-16 -mt-16" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs font-bold text-cyber-cyan">
            <FolderGit2 className="w-4 h-4" /> 100% Verified GitHub Repositories (@apravint)
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Verified Projects & <span className="text-gradient">Code Repositories</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            All projects listed below are live, public open-source repositories hosted directly on Pravin Tamilan's GitHub profile (<code className="text-cyber-cyan font-mono">github.com/apravint</code>).
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <a 
            href="https://github.com/apravint"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:opacity-90 text-zinc-950 text-xs font-extrabold shadow-lg shadow-cyber-cyan/20 transition-all"
          >
            <Code2 className="w-4 h-4" /> Open GitHub Profile (@apravint)
          </a>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyber-cyan text-zinc-950 font-black shadow-lg shadow-cyber-cyan/20 scale-105'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const IconComponent = project.icon;
          return (
            <motion.div
              key={project.name}
              variants={itemVariants}
              className={`p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between border transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-2xl hover:shadow-cyber-cyan/10 ${
                project.featured ? 'border-zinc-700 bg-zinc-900/40' : 'border-zinc-800/80 bg-zinc-950/60'
              }`}
            >
              <div>
                {/* Top Badge & Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-gradient-to-r ${project.gradient} text-white shadow-sm`}>
                    {project.badgeText || project.category}
                  </span>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    title="Open Repository on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Title & Icon */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${project.gradient} p-0.5 flex items-center justify-center text-white shadow-md`}>
                    <div className="w-full h-full bg-zinc-950/90 rounded-[10px] flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-cyber-cyan" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {project.title}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">github.com/apravint/{project.name}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Architectural Highlights */}
                <div className="space-y-1.5 mb-5 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] font-bold text-cyber-cyan uppercase tracking-wider block mb-1">
                    Key Features & Architecture
                  </span>
                  {project.architecturalHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                      <span className="text-cyber-cyan font-bold">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/80">
                  {project.techStack.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Link */}
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-xs font-bold text-white transition-all group"
                >
                  <span>Open github.com/apravint/{project.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyber-cyan group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
