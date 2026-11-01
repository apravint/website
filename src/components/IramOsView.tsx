"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { COMMANDS, CRAFT_APPS, MCP_TOOLS, PIPELINES, SUBSYSTEMS, THEMES } from "@/data/iram";
import { Chips, Command, Page } from "@/components/site/ui";

const LINKS = [
  { href: "https://apravint.github.io/iram-docs/", label: "Documentation" },
  { href: "https://github.com/apravint/iram-os", label: "GitHub" },
  { href: "https://pypi.org/project/fastmcp-linux-desktop/", label: "FastMCP on PyPI" },
];

const ANCHORS = [
  { id: "command", label: "Command" },
  { id: "craft", label: "Craft Suite" },
  { id: "video", label: "Video" },
  { id: "themes", label: "Themes" },
  { id: "fastmcp", label: "FastMCP" },
];

const PIPELINE_FILTERS = [
  { id: "all", label: "All" },
  { id: "documentary", label: "Documentary" },
  { id: "animation", label: "Animation" },
  { id: "speech", label: "Speech and avatar" },
  { id: "social", label: "Social" },
] as const;
type PipelineFilter = (typeof PIPELINE_FILTERS)[number]["id"];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-20 scroll-mt-20">
      <h2 className="font-display text-3xl sm:text-4xl tracking-tight">{title}</h2>
      {intro && <p className="mt-2 text-muted max-w-2xl leading-relaxed">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function IramOsView() {
  const [appName, setAppName] = useState(CRAFT_APPS[0].name);
  const [filter, setFilter] = useState<PipelineFilter>("all");
  const [themeId, setThemeId] = useState(THEMES[0].id);

  const app = CRAFT_APPS.find((a) => a.name === appName)!;
  const theme = THEMES.find((t) => t.id === themeId)!;
  const pipelines = filter === "all" ? PIPELINES : PIPELINES.filter((p) => p.cat === filter);

  return (
    <Page>
      <div className="eyebrow">Ubuntu 26.10 · Hyprland 0.56 · PipeWire</div>
      <h1 className="mt-3 font-display text-5xl sm:text-7xl tracking-tight">IRAM OS 26.10</h1>
      <p className="mt-5 text-lg text-muted max-w-2xl leading-relaxed">
        A turnkey 64-bit Linux operating system built for AI coding agents, with the Storytold Craft
        Suite, a film and video studio, and instant desktop theming.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {LINKS.map((l, i) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`btn ${i === 0 ? "btn-primary" : ""}`}>
            {l.label} <ArrowUpRight className="w-4 h-4" />
          </a>
        ))}
      </div>

      <nav aria-label="On this page" className="mt-12 flex gap-5 overflow-x-auto no-scrollbar border-y border-line py-3 text-sm text-muted">
        {ANCHORS.map((a) => (
          <a key={a.id} href={`#${a.id}`} className="hover:text-ink whitespace-nowrap">{a.label}</a>
        ))}
      </nav>

      <Section id="command" title="One command for everything" intro="Compositor, agents, audio and video are all managed through the iram dispatcher.">
        <div className="panel divide-y divide-line">
          {COMMANDS.map((c) => (
            <div key={c.cmd} className="grid grid-cols-1 sm:grid-cols-[17rem_1fr] gap-x-6 gap-y-1 px-5 py-3">
              <code className="font-mono text-sm text-accent">{c.cmd}</code>
              <span className="text-sm text-muted">{c.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBSYSTEMS.map((s) => (
            <div key={s.title} className="panel p-5">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="craft" title="Storytold Craft Suite" intro="11 open-source creative and office apps, written in Rust with GPU acceleration.">
        <div className="panel grid grid-cols-1 md:grid-cols-[14rem_1fr] overflow-hidden">
          <div role="group" aria-label="Choose an app" className="flex md:flex-col overflow-x-auto no-scrollbar border-b md:border-b-0 md:border-r border-line p-2">
            {CRAFT_APPS.map((a) => (
              <button
                key={a.name}
                onClick={() => setAppName(a.name)}
                aria-pressed={a.name === appName}
                className={`text-left text-sm px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
                  a.name === appName ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
          <div className="p-6 sm:p-8">
            <div className="eyebrow">{app.role}</div>
            <h3 className="mt-1 font-display text-3xl">{app.name}</h3>
            <p className="mt-3 text-muted leading-relaxed max-w-2xl">{app.desc}</p>
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <dt className="eyebrow">An alternative to</dt>
                <dd className="mt-1">{app.replaces}</dd>
              </div>
              <div>
                <dt className="eyebrow">Formats</dt>
                <dd className="mt-1">{app.formats}</dd>
              </div>
            </dl>
            <div className="mt-6 max-w-xs"><Command>{`iram craft ${app.name.replace("Craft", "").toLowerCase()}`}</Command></div>
          </div>
        </div>
      </Section>

      <Section id="video" title="Film and video studio" intro="iram-video and OpenMontage generate documentaries, motion graphics and trailers from a prompt.">
        <div className="panel p-6 sm:p-8">
          <div className="eyebrow">CVPR 2026 · 12 GB VRAM · runs locally</div>
          <h3 className="mt-1 font-display text-2xl">PersonaLive: real-time portrait diffusion</h3>
          <p className="mt-2 text-muted leading-relaxed max-w-2xl">
            Generates expressive talking presenters of any length from one portrait and a driving
            audio or video stream.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Command>iram video --avatar auto -o avatar.mp4</Command>
            <Command>iram video --avatar --face me.png --drive motion.mp4</Command>
            <Command>cd ~/PersonaLive/webcam && bash start.sh</Command>
          </div>
        </div>
        <div className="mt-6">
          <Chips label="Filter pipelines" options={PIPELINE_FILTERS} value={filter} onChange={setFilter} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelines.map((p) => (
            <div key={p.id} className="panel p-5">
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 mb-3 text-sm text-muted">{p.desc}</p>
              <Command>{`iram video montage "..." --pipeline ${p.id}`}</Command>
            </div>
          ))}
        </div>
      </Section>

      <Section id="themes" title="ALPORA themes" intro="49 palettes that change the whole desktop without a restart, plus a 24-hour timeline that follows the sun. Here are seven of them.">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4">
          <div className="panel divide-y divide-line">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                aria-pressed={t.id === themeId}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm cursor-pointer ${t.id === themeId ? "bg-surface-2" : "hover:bg-surface-2"}`}
              >
                {t.name}
                <span className="flex gap-1" aria-hidden>
                  {[t.bg, t.color, t.accent].map((c) => (
                    <span key={c} className="w-3.5 h-3.5 rounded-full border border-line" style={{ background: c }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          <div className="rounded-xl p-6 sm:p-8 flex flex-col justify-between min-h-72" style={{ background: theme.bg, color: "#f4f4f5" }}>
            <div>
              <div className="font-display text-3xl" style={{ color: theme.color }}>{theme.name}</div>
              <p className="mt-2 text-sm opacity-80">{theme.desc}</p>
            </div>
            <div className="mt-8">
              <div className="flex gap-2 mb-4" aria-hidden>
                <span className="h-2 w-16 rounded-full" style={{ background: theme.accent }} />
                <span className="h-2 w-8 rounded-full" style={{ background: theme.color }} />
                <span className="h-2 w-4 rounded-full bg-white/30" />
              </div>
              <code className="font-mono text-sm" style={{ color: theme.color }}>iram theme set {theme.id}</code>
            </div>
          </div>
        </div>
      </Section>

      <Section id="fastmcp" title="FastMCP Linux Desktop" intro="A Model Context Protocol server with 28 tools. Published on PyPI and listed on Glama with an A grade.">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4">
          <div className="panel p-5 space-y-2">
            <Command>pip install fastmcp-linux-desktop</Command>
            <Command>fastmcp-linux-desktop --sse --port 8991</Command>
            <div className="flex gap-4 pt-2 text-sm">
              <a href="https://pypi.org/project/fastmcp-linux-desktop/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">PyPI</a>
              <a href="https://glama.ai/mcp/servers/apravint/fastmcp-linux-desktop" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Glama</a>
            </div>
          </div>
          <div className="panel divide-y divide-line">
            {MCP_TOOLS.map((m) => (
              <div key={m.title} className="px-5 py-4">
                <h3 className="text-sm font-medium">{m.title}</h3>
                <p className="mt-1 font-mono text-xs text-muted leading-relaxed">{m.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Page>
  );
}
