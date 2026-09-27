"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderGit2, ExternalLink, Star, GitFork, Cpu, Terminal, 
  BookOpen, Mic, Sparkles, Code2, Globe, ShieldCheck, Layers, Rocket
} from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  category: 'AI & Multi-Agent' | 'Systems & Linux' | 'Web & Portals' | 'Literature & EdTech';
  description: string;
  architecturalHighlights: string[];
  techStack: string[];
  githubUrl: string;
  featured?: boolean;
  icon: any;
  gradient: string;
  badgeText?: string;
}

export default function ProjectsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const projects: ProjectItem[] = [
    {
      id: 'book-generator-ai',
      title: 'BookGenerator AI',
      category: 'AI & Multi-Agent',
      description: 'Executive-grade multi-agent engine designed to autonomously generate publication-ready 300-page commercial manuscripts (80,000+ words) using local Ollama & open models.',
      architecturalHighlights: [
        'Hierarchical state isolation preventing context collapse over 80k words',
        'Beat-by-beat iterative scene drafter (6 sub-beats per chapter)',
        'Adversarial Anti-Slop & Continuity Critics purging AI clichés',
        'Direct local Ollama REST client with 600s timeouts & 16k context window'
      ],
      techStack: ['Python 3.12', 'Pydantic v2', 'Local Ollama', 'DeepSeek-R1', 'SQLite', 'python-docx'],
      githubUrl: 'https://github.com/apravint/BookGeneratorAI',
      featured: true,
      icon: Cpu,
      gradient: 'from-purple-500 via-indigo-500 to-cyber-cyan',
      badgeText: '🔥 Featured Flagship'
    },
    {
      id: 'aispeaks',
      title: 'AI Speaks',
      category: 'AI & Multi-Agent',
      description: 'Real-time voice intelligence assistant integrating local speech recognition, instant neural text-to-speech synthesis, and streaming conversational LLM reasoning.',
      architecturalHighlights: [
        'Low-latency audio stream processing pipeline',
        'Whisper local speech-to-text recognition',
        'Piper TTS neural speech synthesizer bridge',
        'Context-aware conversational agent fallback'
      ],
      techStack: ['Python', 'WebRTC', 'Whisper', 'Piper TTS', 'Local LLM'],
      githubUrl: 'https://github.com/apravint/aispeaks',
      featured: true,
      icon: Mic,
      gradient: 'from-cyber-cyan via-blue-500 to-emerald-400',
      badgeText: '⚡ Voice Intelligence'
    },
    {
      id: 'pocket-linux',
      title: 'Pocket Linux',
      category: 'Systems & Linux',
      description: 'Portable Linux development environment and automated system toolchain optimized for Termux, mobile nodes, and headless Android developer environments.',
      architecturalHighlights: [
        'Automated Zsh environment bootstrap scripts',
        'Isolated proot chroot Linux container management',
        'Mobile developer toolkit & SSH server automation',
        'Resource-constrained system tuning & memory guards'
      ],
      techStack: ['Shell Scripting', 'Termux', 'Proot Linux', 'Zsh', 'Systemd'],
      githubUrl: 'https://github.com/apravint/pocket_linux',
      icon: Terminal,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      badgeText: '🐧 Systems & Kernel'
    },
    {
      id: 'website-portal',
      title: 'Pravin Tamilan Web Portal',
      category: 'Web & Portals',
      description: 'Full-screen Next.js 16 portal featuring local in-browser Web-LLM inference (@mlc-ai), 3D arcade games (Three.js), live IPTV streaming, and regional tools.',
      architecturalHighlights: [
        'In-browser WebGPU LLM execution using @mlc-ai/web-llm',
        'Programmatic 3D Three.js rendering loops for games',
        'HLS.js live IPTV stream decoder engine',
        'TailwindCSS v4 glassmorphic responsive UI design'
      ],
      techStack: ['Next.js 16', 'React 19', 'Three.js', 'Web-LLM', 'TailwindCSS v4'],
      githubUrl: 'https://github.com/apravint/website',
      featured: true,
      icon: Globe,
      gradient: 'from-cyber-pink via-rose-500 to-purple-600',
      badgeText: '🌐 Web Platform'
    },
    {
      id: 'tamil-kavithai',
      title: 'Tamil Kavithai Literature Portal',
      category: 'Literature & EdTech',
      description: 'Digital literature platform dedicated to classic and contemporary Tamil poetry, Thirukkural commentary, and interactive verse generation.',
      architecturalHighlights: [
        'Dynamic categorization of Thirukkural chapters and couplets',
        'Poetry generation and verse breakdown rendering',
        'Responsive typography optimized for Tamil scripts',
        'SEO-optimized static page hydration'
      ],
      techStack: ['TypeScript', 'Next.js', 'React', 'TailwindCSS'],
      githubUrl: 'https://github.com/apravint/tamilkavithai',
      icon: BookOpen,
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      badgeText: '✍️ Literature'
    },
    {
      id: 'speak-english-ai',
      title: 'Speak English AI Tutor',
      category: 'Literature & EdTech',
      description: 'Conversational AI language tutor helping users master English pronunciation, sentence structure, and vocabulary through interactive voice prompts.',
      architecturalHighlights: [
        'Real-time speech recognition feedback loop',
        'Grammar analysis and instant sentence correction',
        'Adaptive difficulty escalation based on user fluency',
        'Voice prompt response synthesis'
      ],
      techStack: ['TypeScript', 'React', 'Web Speech API', 'OpenAI / Ollama'],
      githubUrl: 'https://github.com/apravint/speak-english',
      icon: Sparkles,
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      badgeText: '🎓 AI EdTech'
    }
  ];

  const categories = ['All', 'AI & Multi-Agent', 'Systems & Linux', 'Web & Portals', 'Literature & EdTech'];

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

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
            <FolderGit2 className="w-4 h-4" /> Open Source Portfolio
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Engineering Projects & <span className="text-gradient">Architectures</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Exploration of multi-agent LLM systems, local inference runtimes, systems engineering, and modern web applications authored by Pravin Tamilan.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <a 
            href="https://github.com/apravint"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:opacity-90 text-zinc-950 text-xs font-extrabold shadow-lg shadow-cyber-cyan/20 transition-all"
          >
            <Code2 className="w-4 h-4" /> View GitHub Profile (@apravint)
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
              key={project.id}
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
                    title="View Source on GitHub"
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
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {project.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Architectural Highlights */}
                <div className="space-y-1.5 mb-5 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] font-bold text-cyber-cyan uppercase tracking-wider block mb-1">
                    Key Architectural Features
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
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-bold text-white transition-all group"
                >
                  <span>Explore Repository</span>
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
