# Pravin Tamilan - Personal Website

A modern Angular 19 personal website featuring a portfolio, Tamil poetry (Kavithai) collection, client-side IPTV player, and a powerful Card Creator tool for designing social media graphics.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/apravint?style=social)](https://x.com/apravint)
[![Build Status](https://github.com/apravint/website/actions/workflows/angular.yml/badge.svg)](https://github.com/apravint/website/actions)

---

## ✨ Key Features

### 🎨 Card Creator
A professional-grade graphic design tool for creating social media cards, poetry posts, and posters:
- **Canvas Presets**: Optimized formats for Instagram Post/Story, WhatsApp Status, Facebook, X/Twitter, and YouTube Thumbnail.
- **Advanced Text Editing**:
  - 20+ Google Fonts (including premium Tamil fonts).
  - Font size, color, alignment, styling (Bold, Italic, Underline, Strikethrough).
  - Customizable letter spacing, line height, text opacity, and text transforms.
  - Shadows (offset, blur, color) and text outlines/strokes.
- **Presets & Backdrops**: 25+ pre-designed templates, 30+ gradient backgrounds, and solid color palettes.
- **Exporting Options**: PNG, JPEG, SVG format options, customizable export multipliers (1x, 2x, 4x), WebP export, 300 DPI print marks, and size indicators.

### 📺 client-side IPTV Player
A completely serverless IPTV player built directly into the client:
- **M3U Parser**: Parses local or custom playlists entirely on the client side.
- **HLS Playback**: Integrates `Hls.js` dynamically via CDN for adaptive bitrate streaming of live channels.
- **User Interface**: Volume, mute, fullscreen controls, search filtering, and playback state indicators.
- **Legal Preloads**: Comes preloaded with verified public broadcasters (NASA TV, DW News, NHK World, France 24, Red Bull TV).

### 📜 Tamil Poetry (Kavithai)
- **Poem Browser**: Dynamic display of Tamil poems, backed by a robust Firestore integration.
- **AI Poetry Assistant**: Interactive assistant to help explore poetry and generate custom compositions.
- **Flexible Reading Toolbar**: Toggle themes (Parchment, Onyx, Serif, Sans-serif) and adjust text sizes for optimal legibility.
- **Social Sharing**: One-click sharing of formatted verses to WhatsApp, X (Twitter), and clipboard.

### 📰 News Feed
- Aggregates trending Tamil news from Google News RSS feeds.
- Responsive bento-style card design with clean layout settings.

### 🏆 World Cup 2026 Hub
- A dedicated sports dashboard for the 48-team tournament hosted in North America.
- Live standings tables for all 12 groups (A to L) showing qualified zone indicators, played matches, goal difference, and points.
- Dynamic match schedules, scores, and venues with live status badges.
- Real-time tournament news and updates parsed client-side using a public Google News RSS reader.

---

### 💻 Interactive Terminal Simulator
- A browser-based Termux emulator that lets visitors interact with your portfolio using commands.
- Custom actions: `neofetch` (system info ASCII), `cowsay` (talking ASCII cow), `kavithai` (poem printer), and `about`/`skills`/`projects` commands.
- Canvas-rendered `cmatrix` falling code screensaver effect (exitable on click or ESC).
- Command history memory navigating with arrow keys.

### 📚 Termux & Antigravity Guides
- Bilingual developer tutorials (English & Tamil) detailing mobile website construction.
- Step-by-step setup walkthrough for F-Droid Termux packages, git config, dev server running, automated testing, and code deploying with Antigravity AI.

---

## 💅 Modern Design System

The application has been upgraded with a sleek, premium, and interactive user interface:
- **Obsidian Theme**: A deep obsidian-dark background (`#05070f`) with subtle, glowing blue accent fields.
- **Aurora Glow Effect**: Custom CSS keyframe-animated glow spheres drifting in the background.
- **Glassmorphic Floating Navbar**: A responsive glass pill navigation navbar with blur backdrops and active state highlights.
- **Micro-Animations**: Hover-triggered translations, bento card elevation offsets, and interactive status markers.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Angular 19 (Signals, Control Flow, and Standalone Components)
- **Styling**: SCSS (utilizing CSS Custom Properties & responsive utility grids)
- **Canvas engine**: Fabric.js 6.x (locked to maintain stable object-editor behavior)
- **Database**: Firebase / Firestore (designed with resilient fallback logic for offline/misconfigured setups)
- **Hosting/Deployment**: GitHub Pages (staged build output inside `docs/` directory)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ or v22+
- Angular CLI

### Installation & Run
```bash
npm install
ng serve
```
Open `http://localhost:4200/` to test changes interactively.

### Firebase Setup
If you want to configure your own poetry database:
1. Edit `src/environments/environment.ts` and paste your Firebase Web API config.
2. Avoid committing local credentials by running:
   ```bash
   git update-index --assume-unchanged src/environments/environment.ts
   ```

### Running Tests
```bash
# Run unit specs in watch mode
ng test

# CI Headless testing
npm test -- --watch=false
```

---

## 📂 Codebase Structure

```
src/app/
├── card-creator/       # Graphics canvas designer (Fabric.js 6)
├── iptv/               # Client-side IPTV & HLS player
├── kavithai/           # Tamil poetry collection & reader options
├── news/               # Google News RSS aggregator
├── navbar/             # Floating pill glassmorphic navbar
├── footer/             # Social links & contact panel
└── shared/             # SEO metadata & share integration services
```

---

## 📄 License & Credits

- © Pravin Tamilan. All rights reserved.
- Twitter profile: [@apravint](https://x.com/apravint)
