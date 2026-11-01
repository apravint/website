"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Copy, Download, Mic, MicOff, RefreshCw, Settings2, Trash2, Volume2 } from "lucide-react";
import type { MLCEngine } from "@mlc-ai/web-llm";
import { Chips, Page, useCopy } from "@/components/site/ui";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

type EngineMode = "webllm" | "ollama";
type Status = "checking" | "online" | "offline";

const ENGINES = [
  { id: "webllm", label: "In browser" },
  { id: "ollama", label: "Ollama" },
] as const;

const PERSONAS = [
  { name: "General", prompt: "You are a capable, helpful AI assistant running locally on the user's device. Answer clearly and accurately." },
  { name: "Coding", prompt: "You are a master software engineer and tech expert. Write clean, optimal, well-commented code and provide precise technical solutions." },
  { name: "Tamil scholar", prompt: "You are an expert scholar in Tamil literature, Thirukkural, Tamil language, history, and heritage." },
  { name: "Game master", prompt: "You are a witty, high-energy arcade boss and game master providing gameplay strategies and secrets." },
];

const WEBLLM_MODELS = [
  ["SmolLM2-360M-Instruct-q4f16_1-MLC", "SmolLM2 360M, fastest"],
  ["Qwen2.5-0.5B-Instruct-q4f16_1-MLC", "Qwen 2.5 0.5B, compact"],
  ["Llama-3.2-1B-Instruct-q4f16_1-MLC", "Llama 3.2 1B, balanced"],
  ["Qwen2.5-1.5B-Instruct-q4f16_1-MLC", "Qwen 2.5 1.5B, higher quality"],
  ["Phi-3.5-mini-instruct-q4f16_1-MLC", "Phi-3.5 Mini, largest"],
];

const SUGGESTIONS = [
  "Explain Thirukkural 1 in Tamil and English.",
  "Write a memoized Fibonacci function in TypeScript.",
  "How do I get better at Cyber Racer?",
];

type SpeechRec = { lang: string; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; onerror: () => void; start: () => void; stop: () => void };

export default function AiView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [mode, setMode] = useState<EngineMode>("webllm");
  const [endpoint, setEndpoint] = useState("http://localhost:11434/v1");
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const [ollamaModels, setOllamaModels] = useState<string[]>(["llama3.2"]);
  const [status, setStatus] = useState<Status>("checking");
  const [webllmModel, setWebllmModel] = useState(WEBLLM_MODELS[0][0]);
  const [systemPrompt, setSystemPrompt] = useState(PERSONAS[0].prompt);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const { copied, copy } = useCopy();

  const bottomRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{ model: string; engine: MLCEngine } | null>(null);
  const recognitionRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, progress]);

  useEffect(() => {
    setMicSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }, []);

  const checkOllama = async () => {
    setStatus("checking");
    try {
      const res = await fetch(`${endpoint.replace(/\/v1\/?$/, "")}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error();
      const data: { models?: { name: string }[] } = await res.json();
      const names = data.models?.map((m) => m.name) ?? [];
      if (names.length) {
        setOllamaModels(names);
        if (!names.includes(ollamaModel)) setOllamaModel(names[0]);
      }
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  };

  // Only contact the visitor's local server once they've chosen Ollama.
  useEffect(() => {
    if (mode === "ollama") checkOllama();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, endpoint]);

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.onresult = (e) => setInput((prev) => (prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const readAloud = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, "")));
  };

  const getEngine = async () => {
    if (engineRef.current?.model === webllmModel) return engineRef.current.engine;
    if (!("gpu" in navigator)) throw new Error("This browser doesn't support WebGPU. Try a recent version of Chrome or Edge, or connect Ollama.");
    setProgress("Downloading the model. This only happens once, but it can take a few minutes.");
    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
    const engine = await CreateMLCEngine(webllmModel, { initProgressCallback: (r) => setProgress(r.text) });
    engineRef.current = { model: webllmModel, engine };
    setProgress("");
    return engine;
  };

  const send = async (text: string) => {
    const query = text.trim();
    if (!query || busy) return;
    const botId = Date.now() + 1;
    const history = [
      { role: "system" as const, content: systemPrompt },
      ...messages.filter((m) => !m.isError).map((m) => ({ role: m.role, content: m.text })),
      { role: "user" as const, content: query },
    ];
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: query }, { id: botId, role: "assistant", text: "" }]);
    setInput("");
    setBusy(true);

    let acc = "";
    const append = (delta: string) => {
      acc += delta;
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: acc } : m)));
    };

    try {
      if (mode === "ollama") {
        const res = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: ollamaModel, messages: history, stream: true, temperature }),
        });
        if (!res.ok || !res.body) throw new Error(`The Ollama server returned an error (${res.status}).`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const json = line.trim().replace(/^data:\s*/, "");
            if (!json || json === "[DONE]") continue;
            try {
              append(JSON.parse(json).choices?.[0]?.delta?.content ?? "");
            } catch {}
          }
        }
      } else {
        const engine = await getEngine();
        const stream = await engine.chat.completions.create({ messages: history, stream: true, temperature });
        for await (const chunk of stream) append(chunk.choices[0]?.delta?.content ?? "");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const hint = mode === "ollama"
        ? `Couldn't reach Ollama at ${endpoint}. Start it with OLLAMA_ORIGINS=* ollama serve, then try again.`
        : raw || "The in-browser model couldn't start.";
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: hint, isError: true } : m)));
    } finally {
      setProgress("");
      setBusy(false);
    }
  };

  const exportChat = () => {
    const md = messages.map((m) => `### ${m.role === "user" ? "You" : "Assistant"}\n\n${m.text}\n`).join("\n---\n\n");
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusText = mode === "webllm"
    ? "Runs on your device. Nothing you type leaves your browser."
    : status === "online" ? `Connected to ${endpoint}` : status === "checking" ? "Looking for Ollama…" : "Ollama isn't reachable. Start it, or open settings to change the address.";

  return (
    <Page>
      <div className="mx-auto max-w-3xl flex flex-col min-h-[calc(100vh-14rem)]">
        <div className="flex items-center justify-between gap-3">
          <Chips label="Choose an engine" options={ENGINES} value={mode} onChange={setMode} />
          <div className="flex">
            <button onClick={() => setShowSettings(!showSettings)} className="icon-btn" aria-expanded={showSettings} aria-label="Settings"><Settings2 className="w-4 h-4" /></button>
            <button onClick={exportChat} disabled={!messages.length} className="icon-btn disabled:opacity-40" aria-label="Export chat as Markdown"><Download className="w-4 h-4" /></button>
            <button onClick={() => setMessages([])} disabled={!messages.length} className="icon-btn disabled:opacity-40" aria-label="Clear chat"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">{statusText}</p>

        {showSettings && (
          <div className="panel mt-4 p-5 grid sm:grid-cols-2 gap-4 text-sm">
            {mode === "webllm" ? (
              <label className="sm:col-span-2">
                <span className="block mb-1 text-muted">Model</span>
                <select className="field" value={webllmModel} onChange={(e) => setWebllmModel(e.target.value)}>
                  {WEBLLM_MODELS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
            ) : (
              <>
                <label>
                  <span className="block mb-1 text-muted">Server address</span>
                  <span className="flex gap-2">
                    <input className="field font-mono" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
                    <button onClick={checkOllama} className="btn !px-2.5 shrink-0" aria-label="Check connection"><RefreshCw className="w-4 h-4" /></button>
                  </span>
                </label>
                <label>
                  <span className="block mb-1 text-muted">Model</span>
                  <select className="field" value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)}>
                    {ollamaModels.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
              </>
            )}
            <div className="sm:col-span-2">
              <span className="block mb-1.5 text-muted">Persona</span>
              <Chips
                label="Choose a persona"
                options={PERSONAS.map((p) => ({ id: p.prompt, label: p.name }))}
                value={systemPrompt}
                onChange={setSystemPrompt}
              />
            </div>
            <label className="sm:col-span-2">
              <span className="block mb-1 text-muted">System prompt</span>
              <textarea rows={2} className="field" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
            </label>
            <label>
              <span className="block mb-1 text-muted">Temperature: {temperature}</span>
              <input type="range" min="0.1" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-[var(--accent)]" />
            </label>
          </div>
        )}

        <div className="flex-1 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="pt-10 sm:pt-16">
              <h1 className="font-display text-4xl sm:text-5xl tracking-tight">Ask a model on your own device.</h1>
              <div className="mt-6 flex flex-col items-start gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-left text-sm text-muted hover:text-ink underline-offset-4 hover:underline cursor-pointer">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-surface-2 px-4 py-2.5 whitespace-pre-wrap">{m.text}</div>
              </div>
            ) : (
              <div key={m.id} className="group">
                <div className={`whitespace-pre-wrap leading-relaxed ${m.isError ? "text-down" : ""}`}>
                  {m.text || <span className="text-muted">{progress || "Thinking…"}</span>}
                </div>
                {m.text && !m.isError && (
                  <div className="mt-1 -ml-2 flex opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => readAloud(m.text)} className="icon-btn" aria-label="Read aloud"><Volume2 className="w-4 h-4" /></button>
                    <button onClick={() => copy(m.text, String(m.id))} className="icon-btn" aria-label="Copy response">
                      {copied === String(m.id) ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            ),
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="sticky bottom-4 panel flex items-center gap-1 p-1.5 shadow-lg"
        >
          {micSupported && (
            <button type="button" onClick={toggleMic} className={`icon-btn ${listening ? "!text-accent" : ""}`} aria-label={listening ? "Stop dictation" : "Dictate"}>
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <input
            aria-label="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message"
            className="flex-1 min-w-0 bg-transparent px-2 py-1.5 focus:outline-none"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary !px-2.5 !min-h-9" aria-label="Send"><ArrowUp className="w-4 h-4" /></button>
        </form>
      </div>
    </Page>
  );
}
