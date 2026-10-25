# Pravin Tamilan - IRAM OS 26.10, Autonomous Agentic Swarms & Web Portal

A high-performance Next.js flagship web portal and Android application showcasing the **IRAM OS** autonomous agentic operating system ecosystem, **Storytold Craft Suite** (11 creative applications), **FastMCP Linux Desktop** (28 system automation tools), **OpenMontage** video pipelines, **ALPORA Dynamic Theming** (49 themes), client-side **Local LLM** AI assistant (`@mlc-ai/web-llm`), 3D arcade games, live IPTV player, and Tamil literature archives.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/apravint?style=social)](https://x.com/apravint)
[![Deploy Status](https://github.com/apravint/website/actions/workflows/deploy.yml/badge.svg)](https://github.com/apravint/website/actions/workflows/deploy.yml)
[![fastmcp-linux-desktop PyPI](https://img.shields.io/pypi/v/fastmcp-linux-desktop.svg)](https://pypi.org/project/fastmcp-linux-desktop/)
[![fastmcp-linux-desktop Glama Badge](https://glama.ai/mcp/servers/apravint/fastmcp-linux-desktop/badges/score.svg)](https://glama.ai/mcp/servers/apravint/fastmcp-linux-desktop)
[![IRAM OS Documentation](https://img.shields.io/badge/Docs-IRAM%20OS%20v26.10-06b6d4)](https://apravint.github.io/iram-docs/)

---

## ✨ Key Features

### 🌌 IRAM OS 26.10 Flagship Ecosystem Dashboard
- **Autonomous Agentic OS Architecture**: Interactive explorer for Ubuntu 26.10 + Hyprland 0.56 + Waybar + System AI Bridge + LiteRT GPU/NPU acceleration.
- **Storytold Craft Suite (11 Applications)**: Native Linux multi-format creative workstation suite including Storyboarder, CanvasCraft, AudioCraft, PromptCraft, FontCraft, MotionCraft, ArtCraft, ColorCraft, ModelCraft, VectorCraft, and Archify.
- **FastMCP Linux Desktop Control**: 28 native system automation tools, dual transport (stdio + SSE/streamable HTTP on port 8000), audited and published on PyPI (`fastmcp-linux-desktop` v0.1.0) with Glama Grade-A verification.
- **ALPORA Dynamic Theming**: Instant zero-restart CSS theme engine spanning 49 cohesive palettes (Tokyo Storm, Alpora Alpine, Cyber Neon, Rose Pine, Gruvbox, etc.) synchronizing Waybar, Hyprland, Rofi, Kitty, and web portals.
- **OpenMontage & Video Generation Engine**: 12 modular video pipelines (`text2video`, `remotion-render`, `tts-dubbing`, `b-roll-agent`, `hyperframes`, `face-sync`, `auto-captions`, etc.) with copyable CLI execution commands.
- **Direct Interactive Documentation Link**: One-click jump to the standalone technical docs portal at [apravint.github.io/iram-docs](https://apravint.github.io/iram-docs/).

### 🤖 Local LLM AI Assistant (`@mlc-ai/web-llm`)
- **Browser-Native Inferencing**: Runs AI models directly in the user's browser powered by WebGPU via `@mlc-ai/web-llm`.
- **Zero-Server Overhead**: Completely serverless client-side AI processing with privacy-focused offline capabilities.
- **Interactive Portal Integration**: Integrated assistant tab providing quick access, custom prompts, and natural language assistance.

### 🏎️ 3D Arcade: Cyber Racer & Neon Pong
- **3D Cyber Racer**:
  - Realistic supercar model rendered with Three.js (slanted hood, GT wing spoiler, carbon diffuser, alloy wheels).
  - Telemetry HUD display, cockpit camera perspective, vehicle roll/pitch suspension physics.
  - Synthesized V8 engine audio and dynamic viewport height scaling with `ResizeObserver`.
- **3D Neon Pong**: Retro cyber-neon table tennis game with custom paddle controls and physics.
- **Arcade Companion Widget**: Floating AI companion providing real-time in-game hints, commentary, and user interactions.

### 📺 Client-Side Live IPTV Player
- **Multi-Language Channel Selector**: Supports streams in Tamil, English, Hindi, Telugu, Malayalam, Kannada, French, German, Japanese, and Spanish.
- **Adaptive Bitrate HLS Playback**: Integrated `Hls.js` engine for smooth, adaptive live video streaming.
- **Serverless Architecture**: Parses M3U playlists directly on the client side with legal preloaded channels (NASA TV, DW News, NHK World, France 24, Red Bull TV).

### 📜 Tamil Poetry (Kavithai) & Thirukkural
- **Kavithai Collection**: Interactive Tamil poetry reader with custom reading themes (Onyx, Parchment), font adjustments, and social sharing options.
- **Thirukkural Explorer**: Complete 1330 Thirukkural chapter browser with Tamil & English translations (`thirukkural.json`, i18n support).

### 📅 Calendar & News Hub
- **Event Tracker**: Interactive calendar interface for managing events and key dates.
- **News Aggregator**: Bento-style news feed displaying dynamic updates.

### 📱 Cross-Platform Mobile App (Android)
- **Capacitor Integration**: Native Android wrapper configured with Capacitor (`@capacitor/android`), packaging the Next.js static bundle for Android deployment.
- **Automated CI Build**: GitHub Actions workflow (`.github/workflows/android.yml`) builds `.aab` release bundles and `.apk` binaries automatically.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4, Framer Motion animations, Lucide React icons
- **3D Graphics & Media**: Three.js, Canvas Confetti, `Hls.js`
- **Local AI Engine**: `@mlc-ai/web-llm`
- **Native Runtime**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)
- **Hosting & Deployment**: GitHub Pages (served from `docs/` or via GitHub Actions deployment workflow)

---

## 📂 Codebase Structure

```
src/
├── app/                      # Next.js App Router root layout & main page
│   ├── layout.tsx            # Global metadata & body wrapper
│   ├── page.tsx              # Main portal layout with tab navbar navigation
│   └── globals.css           # Global Tailwind CSS styles & cyber grid themes
└── components/               # Portal feature tab components
    ├── IramOsTab.tsx         # IRAM OS 26.10 Flagship Ecosystem Dashboard
    ├── HomeTab.tsx           # Home hub portal overview & quick telemetry
    ├── ProjectsTab.tsx       # 12-project filtered portfolio matrix
    ├── AIAssistantTab.tsx    # Local WebLLM AI Assistant interface
    ├── RacerTab.tsx          # 3D Cyber Racer supercar game (Three.js)
    ├── CyberPongTab.tsx      # 3D Neon Pong arcade game
    ├── ArcadeCompanionWidget.tsx # Floating game AI companion widget
    ├── IPTVTab.tsx           # Multi-language HLS IPTV player
    ├── ThirukkuralTab.tsx    # Thirukkural literature browser
    ├── KavithaiTab.tsx       # Tamil poetry collection viewer
    ├── CalendarTab.tsx       # Event calendar tab
    ├── NewsTab.tsx           # News aggregator feed
    └── MarketTab.tsx         # Showcase & product view
android/                      # Capacitor Android native project configuration
docs/                         # GitHub Pages static export deployment output
deploy.sh                     # Local deployment & docs/ build copy script
capacitor.config.ts           # Capacitor mobile app configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production & GitHub Pages

```bash
# Compile static export to /out
npm run build

# Or run the local deployment script (builds Next.js and copies to /docs)
bash deploy.sh
```

### Android App Build

```bash
# Sync web build with Capacitor Android project
npx cap sync android

# Build debug APK using Gradle
cd android
./gradlew assembleDebug
```

---

## 📄 License & Credits

- © Pravin Tamilan. All rights reserved.
- Twitter profile: [@apravint](https://x.com/apravint)
