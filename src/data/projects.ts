export type ProjectCategory = "IRAM OS" | "AI & agents" | "Linux" | "Web & apps" | "Finance";

export interface Project {
  name: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  highlights: string[];
  stack: string[];
  githubUrl: string;
}

const repo = (name: string) => `https://github.com/apravint/${name}`;

export const PROJECTS: Project[] = [
  {
    name: "iram-os",
    title: "IRAM OS",
    category: "IRAM OS",
    summary: "A turnkey agentic Linux distribution unifying the Storytold apps, FastMCP control and ALPORA theming.",
    highlights: [
      "Ubuntu 26.10, Hyprland 0.56 and PipeWire studio audio",
      "Zero-restart theming across 49 desktop palettes",
      "Hybrid live ISO builder with a headless QEMU boot check",
    ],
    stack: ["Ubuntu 26.10", "Hyprland", "PipeWire", "Rust", "Python"],
    githubUrl: repo("iram-os"),
  },
  {
    name: "fastmcp-linux-desktop",
    title: "FastMCP Linux Desktop",
    category: "IRAM OS",
    summary: "An MCP server with 28 tools that gives AI agents access to windows, audio, hardware and memory.",
    highlights: [
      "Published on PyPI and listed on Glama with an A grade",
      "Covers Hyprland, PipeWire, systemd health and memory recall",
      "Native MCP annotations for read-only and destructive tools",
    ],
    stack: ["Python", "FastMCP", "MCP", "PipeWire", "Hyprland"],
    githubUrl: repo("fastmcp-linux-desktop"),
  },
  {
    name: "video-gen",
    title: "Universal Film & Video Studio",
    category: "IRAM OS",
    summary: "Generates 1080p and 4K documentaries, with 12 OpenMontage pipelines and Remotion motion graphics.",
    highlights: [
      "Documentaries built from stock footage, photography and a score",
      "12 agent-directed production pipelines",
      "Backlot, a visual storyboard inspector",
    ],
    stack: ["Python", "FFmpeg", "Remotion", "React", "OpenMontage"],
    githubUrl: repo("video-gen"),
  },
  {
    name: "storytold-craft-linux",
    title: "Storytold Craft Suite",
    category: "IRAM OS",
    summary: "11 native, GPU-accelerated Rust apps for photo, vector, film, audio, CAD, design and office work.",
    highlights: [
      "Open alternatives to Adobe and Microsoft desktop apps",
      "Native Wayland with GPU acceleration",
      "One launcher: iram craft",
    ],
    stack: ["Rust", "Vulkan", "Wayland", "GTK4"],
    githubUrl: repo("storytold-craft-linux"),
  },
  {
    name: "iram-docs",
    title: "IRAM OS Documentation",
    category: "IRAM OS",
    summary: "The docs portal, with a live theme switcher, FastMCP tool reference and keybinding catalogue.",
    highlights: [
      "Live switcher for 7 curated palettes",
      "FastMCP JSON-RPC playground",
      "Filterable OpenMontage pipeline directory",
    ],
    stack: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    githubUrl: repo("iram-docs"),
  },
  {
    name: "BookGeneratorAI",
    title: "BookGenerator AI",
    category: "AI & agents",
    summary: "A multi-agent engine that drafts 80,000-word manuscripts using local Ollama models.",
    highlights: [
      "Hierarchical state isolation across long manuscripts",
      "Beat-by-beat scene drafting",
      "Critic agents for continuity and AI clichés",
    ],
    stack: ["Python", "Pydantic", "Ollama", "SQLite"],
    githubUrl: repo("BookGeneratorAI"),
  },
  {
    name: "context-condenser",
    title: "context-condenser",
    category: "AI & agents",
    summary: "Shrinks logs, diffs and tool output with SQLite FTS5 BM25 ranking before they reach a model.",
    highlights: ["Up to 98% smaller context", "BM25 relevance ranking", "Pipeable command-line interface"],
    stack: ["Python", "SQLite FTS5", "CLI"],
    githubUrl: repo("context-condenser"),
  },
  {
    name: "agent-hindsight",
    title: "agent-hindsight",
    category: "AI & agents",
    summary: "Long-term episodic memory for coding agents, with half-life recency decay.",
    highlights: ["Half-life recency decay", "Semantic reflection and categorised recall", "Runs entirely on local storage"],
    stack: ["Python", "SQLite", "Vector store"],
    githubUrl: repo("agent-hindsight"),
  },
  {
    name: "hypr-doctor",
    title: "hypr-doctor",
    category: "Linux",
    summary: "A zero-dependency linter for Hyprland configs that finds duplicate keybindings and audits autostart.",
    highlights: ["Detects duplicates across nested includes", "Safe reloads with exit-code checks", "systemd sanity checks"],
    stack: ["Python", "Hyprland", "CLI"],
    githubUrl: repo("hypr-doctor"),
  },
  {
    name: "adversarial-pre-push",
    title: "adversarial-pre-push",
    category: "Linux",
    summary: "A six-phase git pre-push audit that catches secrets, eval leaks and shell injection.",
    highlights: ["Separate Hunter and Verifier stages", "Local heuristic secret scanning", "Blocks unverified pushes"],
    stack: ["Python", "Bash", "Git hooks"],
    githubUrl: repo("adversarial-pre-push"),
  },
  {
    name: "linux-dual-wifi",
    title: "linux-dual-wifi",
    category: "Linux",
    summary: "Combines internal and USB Wi-Fi adapters using kernel equal-cost multipath routing.",
    highlights: ["Layer 4 flow hashing", "ARP flux mitigation", "Automatic failover"],
    stack: ["Linux", "iproute2", "Bash"],
    githubUrl: repo("linux-dual-wifi"),
  },
  {
    name: "website",
    title: "This website",
    category: "Web & apps",
    summary: "A Next.js site with in-browser AI, Three.js games, IPTV and Tamil literature archives.",
    highlights: ["WebGPU inference with web-llm", "Three.js arcade games", "Static export on GitHub Pages"],
    stack: ["Next.js", "React", "Three.js", "Tailwind CSS"],
    githubUrl: repo("website"),
  },
  {
    name: "Gold-And-Silver-Price-Tracker",
    title: "Gold & Silver Price Tracker",
    category: "Finance",
    summary: "Tracks gold and silver prices, percentage moves and history.",
    highlights: ["Price polling connector", "Trend indicators", "24K, 22K and silver rates"],
    stack: ["TypeScript", "React", "Tailwind CSS"],
    githubUrl: repo("Gold-And-Silver-Price-Tracker"),
  },
];
