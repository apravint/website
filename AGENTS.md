# AGENTS.md - Developer & AI Agent Operations Manual for `website` 🤖

This document is the definitive operational guide for autonomous AI coding agents (Antigravity, Claude, Cursor, OpenAI Codex, OpenHands) operating within this repository.

---

## 🎯 1. System Overview & Core Philosophy

**Pravin Tamilan - IRAM OS 26.10, Autonomous Agentic Swarms & Web Portal**
> A high-performance Next.js flagship web portal and Android application showcasing the IRAM OS autonomous agentic operating system ecosystem, Storytold Craft Suite (11 creative applications), FastMCP Linux Desktop (28 system automation tools), OpenMontage video pipelines, ALPORA Dynamic Theming (49 themes), client-side Local LLM AI assistant (@mlc-ai/web-llm), 3D arcade games, live IPTV player, and Tamil literature archives. - Autonomous Agentic OS Architecture: Interactive explorer for Ubuntu 26.10 + Hyprland 0.56 + Waybar + System AI Bridge + LiteRT GPU/NPU acceleration. - Storytold Craft Suite (11 Applications): Native Linux multi-format creative workstation suite including Storyboarder, CanvasCraft, AudioCraft, PromptCraft, FontCraft, MotionCraft, ArtCraft, ColorCraft, ModelCraft, VectorCraft, and Archify.

### Key Architectural Capabilities
- **Autonomous Agentic OS Architecture**: Interactive explorer for Ubuntu 26.10 + Hyprland 0.56 + Waybar + System AI Bridge + LiteRT GPU/NPU acceleration.
- **Storytold Craft Suite (11 Applications)**: Native Linux multi-format creative workstation suite including Storyboarder, CanvasCraft, AudioCraft, PromptCraft, FontCraft, MotionCraft, ArtCraft, ColorCraft,
- **FastMCP Linux Desktop Control**: 28 native system automation tools, dual transport (stdio + SSE/streamable HTTP on port 8000), audited and published on PyPI (`fastmcp-linux-desktop` v0.1.0) wit
- **ALPORA Dynamic Theming**: Instant zero-restart CSS theme engine spanning 49 cohesive palettes (Tokyo Storm, Alpora Alpine, Cyber Neon, Rose Pine, Gruvbox, etc.) synchronizing Waybar, Hyp
- **OpenMontage & Video Generation Engine**: 12 modular video pipelines (`text2video`, `remotion-render`, `tts-dubbing`, `b-roll-agent`, `hyperframes`, `face-sync`, `auto-captions`, etc.) with copyable CLI
- **Direct Interactive Documentation Link**: One-click jump to the standalone technical docs portal at [apravint.github.io/iram-docs](https://apravint.github.io/iram-docs/).

---

## 🏗️ 2. Repository Structure & Directory Map

| Path | Role & Architectural Responsibility |
| :--- | :--- |
| `.github/` | Subsystem directory (.github) |
| `android/` | Native Android Gradle project & wrapper |
| `capacitor.config.ts` | TypeScript / JavaScript source component |
| `deploy.sh` | Shell automation script |
| `docs/` | Extended documentation, architectural diagrams, guides |
| `next-env.d.ts` | TypeScript / JavaScript source component |
| `next.config.ts` | TypeScript / JavaScript source component |
| `out/` | Subsystem directory (out) |
| `package.json` | Node.js dependencies, build scripts, and metadata |
| `public/` | Subsystem directory (public) |
| `src/` | Primary source package and modules |
| `tests/` | Automated test suite (unit, integration, regression) |

---

## ⚙️ 3. Executable Verification Pipeline

Before marking any task complete, an AI agent **must** run the following verification steps sequentially:

### Tier 1: TypeScript Compilation & Type Safety Check
```bash
npx tsc --noEmit
```

### Tier 2: Production Bundle Verification
```bash
npm run build
```

### Tier 3: Automated Test Runner
```bash
npm test --if-present
```

---

## 🛡️ 4. Architectural Invariants & Non-Negotiable Rules

### Strict Invariants ("Never Do" List):
1. **Strict TypeScript (No Implicit Any):** All variables, props, and return types must be explicitly typed.
2. **Clean Component Unmounting:** Always clean up event listeners, timers, and abort controllers in `useEffect` cleanup return functions.
3. **Zero Hardcoded API Endpoints:** Read service URLs from Vite environment variables (`import.meta.env`).

### Security & Environment Variables:
- All API keys and secrets must be loaded strictly from environment variables.
- Never commit `.env`, `.pem`, token files, or private credentials.

---

## 🤖 5. Autonomous Agent Operational Protocol

When dispatched to resolve an issue, implement a feature, or refactor code in this repo:

1. **Phase 1 — Explore & Plan:**
   - Read this `AGENTS.md` and relevant source files.
   - Check existing tests to establish the baseline.
2. **Phase 2 — Act (Surgical Implementation):**
   - Implement changes with minimal blast radius.
   - Adhere to the established code style and existing conventions.
3. **Phase 3 — Verify:**
   - Run the Tier 1, 2, and 3 verification commands listed above.
   - Ensure all existing and new tests pass cleanly.
4. **Phase 4 — Reflect:**
   - Review `git diff` to confirm zero unintended whitespace or collateral changes.
   - Confirm no untracked scratch files remain.

---
*Maintained by Ayyappa Pravin • Engineered for Antigravity, Claude, Cursor & Modern Autonomous AI Agents.*
