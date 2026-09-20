"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Cpu, Trash2, Settings, Wifi, RefreshCw, Copy, Check, Sparkles, Bot, Zap, Code } from 'lucide-react';
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

type EngineMode = 'ollama' | 'webllm' | 'offline';

export default function AIAssistantTab() {
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "⚡ **CYBER LOCAL LLM CONSOLE INITIALIZED**\n\nConnected to Local AI Engine. You can run LLMs 100% locally via **Ollama (http://localhost:11434)** or directly **In-Browser via WebLLM (WebGPU)** with zero external data tracking.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [engineMode, setEngineMode] = useState<EngineMode>('ollama');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434/v1');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [webllmModel, setWebllmModel] = useState('SmolLM2-360M-Instruct-q4f16_1-MLC');
  const [systemPrompt, setSystemPrompt] = useState('You are Cyber AI, a helpful assistant integrated into Pravin Tamilan web portal and Termux environment.');
  const [showConfig, setShowConfig] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [webllmProgress, setWebllmProgress] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const webllmEngineRef = useRef<MLCEngine | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, webllmProgress]);

  // Test Local Ollama Connection Ping
  const checkOllamaConnection = async () => {
    setConnectionStatus('checking');
    const startTime = Date.now();
    try {
      const res = await fetch(`${ollamaEndpoint.replace(/\/v1\/?$/, '')}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        setConnectionStatus('online');
        setLatency(Date.now() - startTime);
      } else {
        setConnectionStatus('offline');
        setLatency(null);
      }
    } catch (e) {
      setConnectionStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    if (engineMode === 'ollama') {
      checkOllamaConnection();
    }
  }, [ollamaEndpoint, engineMode]);

  // Initialize WebLLM in-browser model if selected
  const initWebLLM = async () => {
    if (webllmEngineRef.current) return webllmEngineRef.current;
    setIsTyping(true);
    setWebllmProgress('Initializing WebGPU LLM Engine...');
    try {
      const engine = await CreateMLCEngine(webllmModel, {
        initProgressCallback: (report) => {
          setWebllmProgress(report.text);
        }
      });
      webllmEngineRef.current = engine;
      setWebllmProgress('');
      setIsTyping(false);
      return engine;
    } catch (e: any) {
      setWebllmProgress(`WebLLM Error: ${e?.message || 'WebGPU not supported on browser'}`);
      setIsTyping(false);
      return null;
    }
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || inputVal;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputVal('');
    setIsTyping(true);

    const botMsgId = Date.now() + 1;
    const initialBotMsg: Message = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    setMessages(prev => [...prev, initialBotMsg]);

    // 1. Ollama / Local OpenAI API Stream
    if (engineMode === 'ollama') {
      try {
        const response = await fetch(`${ollamaEndpoint}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
              { role: 'user', content: query }
            ],
            stream: true,
            temperature: 0.7
          })
        });

        if (!response.ok || !response.body) {
          throw new Error(`Local LLM Endpoint unreachable (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              if (jsonStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                accumulatedText += delta;

                setMessages(prev => prev.map(m => 
                  m.id === botMsgId ? { ...m, text: accumulatedText, isStreaming: true } : m
                ));
              } catch (err) {}
            }
          }
        }

        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m));
        setIsTyping(false);
        return;
      } catch (err: any) {
        // Fallback to offline response if endpoint fails
        runOfflineFallback(botMsgId, query, err?.message);
      }
    } 
    // 2. In-Browser WebLLM Execution
    else if (engineMode === 'webllm') {
      try {
        const engine = await initWebLLM();
        if (!engine) throw new Error('WebGPU Engine could not be loaded');

        const completion = await engine.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          stream: true
        });

        let accumulatedText = '';
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || '';
          accumulatedText += delta;
          setMessages(prev => prev.map(m => 
            m.id === botMsgId ? { ...m, text: accumulatedText, isStreaming: true } : m
          ));
        }

        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m));
        setIsTyping(false);
        return;
      } catch (err: any) {
        runOfflineFallback(botMsgId, query, err?.message);
      }
    } 
    // 3. Built-in Offline Fallback
    else {
      runOfflineFallback(botMsgId, query);
    }
  };

  const runOfflineFallback = (msgId: number, query: string, errorNotice?: string) => {
    setTimeout(() => {
      let reply = errorNotice 
        ? `⚠️ *Local LLM Endpoint Notice: ${errorNotice}*\n\n*Switched to Offline Cyber Assistant Mode.*\n\n`
        : '';
      
      const q = query.toLowerCase();
      if (q.includes('ollama') || q.includes('local llm') || q.includes('setup')) {
        reply += "To connect Ollama locally:\n1. Run `ollama serve` on your PC/server.\n2. Ensure CORS allows requests by setting `OLLAMA_ORIGINS=*`.\n3. Enter your Local IP (e.g. `http://localhost:11434/v1` or `http://192.168.1.100:11434/v1`).";
      } else if (q.includes('racer') || q.includes('game')) {
        reply += "🎮 **Cyber Racer 3D Tips**:\n- Use **Boost** when straight lines open up.\n- Near-misses with traffic trigger **Drift Multipliers**.\n- Collect **Coins** to upgrade your vehicle stats in the Garage!";
      } else if (q.includes('termux') || q.includes('linux')) {
        reply += "💻 **Termux Utility Shell**:\n- Update packages: `pkg update && pkg upgrade`\n- Node environment: `pkg install nodejs-lts git python`\n- Launch dev server: `npm run dev -- --webpack`";
      } else if (q.includes('thirukkural') || q.includes('tamil')) {
        reply += "📜 **Thirukkural 1**:\n*அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.*\n\n*Meaning*: As the letter 'A' is the first of all letters, so the Eternal God is primary to the world.";
      } else {
        reply += `I have processed your query: **"${query}"**.\n\nConnect Ollama or select WebLLM in settings to stream full local AI models on-device!`;
      }

      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, text: reply, isStreaming: false } : m
      ));
      setIsTyping(false);
    }, 600);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Terminal logs cleared. Connected to Local AI Engine.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-2xl flex flex-col h-[620px] glass-card font-sans">
      
      {/* Console Header Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-900 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyber-cyan animate-pulse" />
            <span className="text-xs text-zinc-300 font-extrabold tracking-wider font-mono">
              LOCAL LLM TERMINAL
            </span>
          </div>

          {/* Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold">
            <span className={`w-2 h-2 rounded-full ${
              engineMode === 'ollama' 
                ? (connectionStatus === 'online' ? 'bg-emerald-400 animate-ping' : connectionStatus === 'checking' ? 'bg-amber-400 animate-spin' : 'bg-red-500')
                : 'bg-cyber-pink'
            }`} />
            <span className="text-zinc-400 uppercase">
              {engineMode === 'ollama' ? (connectionStatus === 'online' ? `OLLAMA (${latency}ms)` : 'OLLAMA OFFLINE') : 'WEBLLM (WEBGPU)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-bold">
            <button
              onClick={() => setEngineMode('ollama')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                engineMode === 'ollama' ? 'bg-cyber-cyan text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🦙 Ollama
            </button>
            <button
              onClick={() => setEngineMode('webllm')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                engineMode === 'webllm' ? 'bg-cyber-pink text-white font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌐 In-Browser
            </button>
          </div>

          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Local LLM Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button 
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Configuration Drawer */}
      {showConfig && (
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 font-bold uppercase tracking-wider block">Ollama Endpoint URL</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={ollamaEndpoint}
                onChange={(e) => setOllamaEndpoint(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-black border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-cyber-cyan"
              />
              <button 
                onClick={checkOllamaConnection}
                className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-bold uppercase tracking-wider block">Ollama Model Name</label>
            <select
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-black border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-cyber-cyan"
            >
              <option value="llama3.2">llama3.2</option>
              <option value="qwen2.5">qwen2.5</option>
              <option value="phi3.5">phi3.5</option>
              <option value="smollm2">smollm2</option>
              <option value="mistral">mistral</option>
              <option value="codellama">codellama</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-bold uppercase tracking-wider block">In-Browser WebLLM Model</label>
            <select
              value={webllmModel}
              onChange={(e) => setWebllmModel(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-black border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-cyber-pink"
            >
              <option value="SmolLM2-360M-Instruct-q4f16_1-MLC">SmolLM2 360M (Fastest)</option>
              <option value="Llama-3.2-1B-Instruct-q4f16_1-MLC">Llama 3.2 1B (Smart)</option>
              <option value="Qwen2.5-0.5B-Instruct-q4f16_1-MLC">Qwen 2.5 0.5B (Compact)</option>
            </select>
          </div>
        </div>
      )}

      {/* Messages Output Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-mono text-xs md:text-sm select-text scrollbar-thin">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`group relative max-w-[90%] md:max-w-[85%] rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan rounded-tr-none'
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md'
            }`}>
              {msg.sender === 'bot' && (
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 mb-2 text-[10px] text-zinc-500 font-bold font-sans">
                  <span className="flex items-center gap-1 text-cyber-pink">
                    <Sparkles className="w-3 h-3" /> Cyber Local LLM
                  </span>
                  <button 
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="opacity-60 hover:opacity-100 transition-opacity p-1"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {msg.text}
              {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-cyber-cyan animate-pulse align-middle" />}
            </div>
            <span className="text-[9px] text-zinc-600 font-bold mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {webllmProgress && (
          <div className="p-3 rounded-lg bg-zinc-900/90 border border-cyber-pink/40 text-cyber-pink text-xs font-mono animate-pulse flex items-center gap-2">
            <Cpu className="w-4 h-4 animate-spin" />
            <span>{webllmProgress}</span>
          </div>
        )}

        {isTyping && !webllmProgress && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold font-mono">
            <Cpu className="w-4 h-4 animate-spin text-cyber-cyan" /> Streaming local LLM tokens...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompt Chips Suggestions */}
      <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-900 flex gap-2 overflow-x-auto scrollbar-none select-none">
        {[
          { label: '🚀 Termux Next.js', prompt: 'How do I run Next.js server smoothly in Termux?' },
          { label: '🦙 Ollama Setup', prompt: 'How to setup Ollama local server for API streaming?' },
          { label: '🏎️ Cyber Racer 3D', prompt: 'Give me tips to score high in Cyber Racer 3D' },
          { label: '📜 Thirukkural 1', prompt: 'Explain Thirukkural 1 with Tamil and English meaning' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(undefined, chip.prompt)}
            className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white whitespace-nowrap transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form Console */}
      <form 
        onSubmit={(e) => handleSend(e)}
        className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex gap-3"
      >
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={
            engineMode === 'ollama' 
              ? "Ask Local LLM (Ollama)..." 
              : "Ask In-Browser Local AI (WebLLM)..."
          }
          className="flex-1 px-4 py-3 rounded-xl bg-black border border-zinc-800 focus:border-cyber-cyan/50 focus:outline-none text-white text-xs md:text-sm font-mono placeholder:text-zinc-600 shadow-inner"
        />
        <button 
          type="submit"
          disabled={isTyping}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-cyber-cyan/20 disabled:opacity-40"
        >
          <Send className="w-4 h-4 fill-zinc-950" />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>
    </div>
  );
}

