# Pravin Tamilan - Fullscreen Local LLM, 3D Arcade & Live IPTV Portal

A modern, high-performance Next.js web application and native Android app featuring an in-browser Local LLM AI assistant, 3D web games, client-side Live IPTV player, Tamil poetry & Thirukkural literature collection, and interactive event calendar.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/apravint?style=social)](https://x.com/apravint)
[![Deploy Status](https://github.com/apravint/website/actions/workflows/deploy.yml/badge.svg)](https://github.com/apravint/website/actions/workflows/deploy.yml)
[![Android Build Status](https://github.com/apravint/website/actions/workflows/android.yml/badge.svg)](https://github.com/apravint/website/actions/workflows/android.yml)

---

## ✨ Key Features

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
    ├── AIAssistantTab.tsx    # Local WebLLM AI Assistant interface
    ├── RacerTab.tsx          # 3D Cyber Racer supercar game (Three.js)
    ├── CyberPongTab.tsx      # 3D Neon Pong arcade game
    ├── ArcadeCompanionWidget.tsx # Floating game AI companion widget
    ├── IPTVTab.tsx           # Multi-language HLS IPTV player
    ├── ThirukkuralTab.tsx    # Thirukkural literature browser
    ├── KavithaiTab.tsx       # Tamil poetry collection viewer
    ├── CalendarTab.tsx       # Event calendar tab
    ├── HomeTab.tsx           # Home hub portal overview
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
