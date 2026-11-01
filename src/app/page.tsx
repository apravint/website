import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/data/projects";

const STATS = [
  { value: "11", label: "creative apps" },
  { value: "28", label: "desktop tools for agents" },
  { value: "12", label: "video pipelines" },
  { value: "49", label: "desktop themes" },
];

const SECTIONS = [
  { href: "/thirukkural/", title: "Thirukkural", ta: "திருக்குறள்", desc: "All 1,330 couplets with four commentaries." },
  { href: "/kavithai/", title: "Kavithai", ta: "கவிதை", desc: "Tamil poems to read and listen to." },
  { href: "/calendar/", title: "Calendar", ta: "நாட்காட்டி", desc: "Tamil dates, holidays and daily timings." },
  { href: "/markets/", title: "Markets", desc: "Which exchanges are open right now." },
  { href: "/arcade/", title: "Arcade", desc: "3D Cyber Racer and Neon Pong." },
  { href: "/tv/", title: "TV", desc: "Open IPTV channels in 11 languages." },
  { href: "/ai/", title: "AI", desc: "Chat with a model that runs in your browser." },
];

export default function Home() {
  const selected = ["fastmcp-linux-desktop", "video-gen", "storytold-craft-linux", "BookGeneratorAI"]
    .map((name) => PROJECTS.find((p) => p.name === name)!);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-16 sm:pt-28 pb-16 sm:pb-24">
        <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[1.05] max-w-4xl">
          I build operating systems for AI agents, and archives for Tamil literature.
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl leading-relaxed">
          I&apos;m Pravin Tamilan, creator of IRAM OS. I work on Linux desktops, agent tooling and
          local-first media software, and most of it is open source.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/iram-os/" className="btn btn-primary">
            Explore IRAM OS <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/projects/" className="btn">All projects</Link>
        </div>
      </section>

      <section className="panel p-6 sm:p-10">
        <div className="eyebrow">Flagship</div>
        <div className="mt-3 grid md:grid-cols-2 gap-8 md:gap-12 items-end">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight">IRAM OS 26.10</h2>
            <p className="mt-3 text-muted leading-relaxed">
              An agentic Linux distribution on Ubuntu 26.10, Hyprland 0.56 and PipeWire. It brings a
              creative suite, a video engine and system tools for agents under a single{" "}
              <code className="font-mono text-sm text-ink">iram</code> command.
            </p>
            <Link href="/iram-os/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              See what&apos;s inside <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
            {STATS.map((s) => (
              <div key={s.label} className="border-t border-line pt-3">
                <dd className="font-display text-4xl">{s.value}</dd>
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-display text-3xl tracking-tight">Selected work</h2>
          <Link href="/projects/" className="text-sm text-muted hover:text-ink">View all</Link>
        </div>
        <ul>
          {selected.map((p) => (
            <li key={p.name} className="border-b border-line">
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid sm:grid-cols-[1fr_1.4fr_auto] gap-x-8 gap-y-1 py-5"
              >
                <span className="font-medium group-hover:text-accent transition-colors">{p.title}</span>
                <span className="text-sm text-muted leading-relaxed">{p.summary}</span>
                <ArrowUpRight className="hidden sm:block w-4 h-4 text-muted group-hover:text-accent" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl tracking-tight mb-6">Also on this site</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line rounded-xl overflow-hidden">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="bg-surface p-5 hover:bg-surface-2 transition-colors">
              <div className="font-medium">
                {s.title}
                {s.ta && <span className="ml-2 font-tamil text-sm text-muted">{s.ta}</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
