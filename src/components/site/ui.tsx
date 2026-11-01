"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14">{children}</div>;
}

export function PageHeader({
  title,
  intro,
  children,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{title}</h1>
        {intro && <p className="mt-3 text-muted leading-relaxed">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1.5 overflow-x-auto no-scrollbar">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${
            value === o.id
              ? "bg-ink text-bg border-ink"
              : "border-line text-muted hover:text-ink hover:border-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, id: string = text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    });
  }, []);
  return { copied, copy };
}

export function Command({ children }: { children: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="min-w-0 flex items-center justify-between gap-2 rounded-lg bg-surface-2 pl-3 pr-1 py-1 font-mono text-xs">
      <code className="overflow-x-auto no-scrollbar whitespace-nowrap">{children}</code>
      <button onClick={() => copy(children)} className="icon-btn shrink-0 !w-7 !h-7" aria-label={`Copy ${children}`}>
        {copied ? <Check className="w-3.5 h-3.5 text-up" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

/** Speaks Tamil text with the browser voice; tracks which item is playing. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState<string | number | null>(null);
  const speak = (id: string | number, text: string, lang = "ta-IN") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speaking === id) {
      setSpeaking(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(id);
    window.speechSynthesis.speak(u);
  };
  return { speaking, speak };
}
