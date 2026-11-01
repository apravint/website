export const COMMANDS = [
  { cmd: "iram video [prompt]", desc: "YouTube documentaries and OpenMontage pipelines" },
  { cmd: "iram craft [app]", desc: "Launch PhotoCraft, VectorCraft, FilmCraft and others" },
  { cmd: "iram theme [set|timeline]", desc: "Retheme the desktop live across 49 palettes" },
  { cmd: "iram voice [speak|clone]", desc: "Voice cloning, PipeWire routing and dubbing" },
  { cmd: "iram sidecar", desc: "Toggle the floating Wayland AI assistant" },
  { cmd: "iram quant [us|in]", desc: "Scan US and Indian markets for stock leaders" },
  { cmd: "iram audit", desc: "Run the six-phase pre-push security audit" },
  { cmd: "iram package iso", desc: "Build a hybrid live ISO and test-boot it in QEMU" },
];

export const SUBSYSTEMS = [
  { title: "Hyprland 0.56 and hypr-doctor", desc: "Geometric tiling, acrylic blur, zero-restart theming, and a linter that removes duplicate keybindings." },
  { title: "Dual Wi-Fi multipath", desc: "Combines PCIe and USB Wi-Fi adapters with kernel equal-cost multipath routing and L4 flow hashing." },
  { title: "BM25 context condenser", desc: "A local SQLite FTS5 ranker that shrinks logs and diffs by up to 98% before prompting." },
  { title: "Adversarial pre-push gate", desc: "A six-phase Hunter and Verifier audit that catches secrets, eval leaks and shell injection before a push." },
  { title: "Agent jail and ToolGate", desc: "Agents run in rootless Bubblewrap sandboxes, with desktop approval dialogs they can't skip." },
  { title: "OpenRig swarm factory", desc: "Multi-agent software teams with review gates, verification loops and specialised roles." },
];

export const CRAFT_APPS = [
  { name: "PhotoCraft", role: "Raster image and retouching", replaces: "Photoshop", desc: "GPU-accelerated raster editing with PSD layer compositing, non-destructive adjustments, neural inpainting and RAW import.", formats: "PSD, PSB, TIFF, PNG, EXR, WebP, JPEG-XL" },
  { name: "VectorCraft", role: "Vector graphics and typography", replaces: "Illustrator", desc: "An infinite canvas with boolean path geometry, type on path, SVG glyph editing and AI vector tracing.", formats: "SVG, AI, EPS, PDF, DXF, GeoJSON" },
  { name: "FilmCraft", role: "Non-linear 4K video editor", replaces: "Premiere Pro", desc: "A magnetic timeline for 4K and 8K multi-track footage, with NVENC and VA-API rendering, 3D LUT grading and optical flow.", formats: "MP4, MOV, ProRes, MKV, WebM, XML, EDL" },
  { name: "SoundCraft", role: "Audio workstation and DSP", replaces: "Pro Tools, Logic Pro", desc: "Low-latency PipeWire multi-track audio with VST3 and LV2 hosting, spectral repair, MIDI sequencing and DSP calibration.", formats: "WAV, FLAC, AIFF, OGG, MIDI" },
  { name: "CADCraft", role: "Parametric 2D and 3D CAD", replaces: "AutoCAD, Fusion 360", desc: "Parametric modelling and 2D drafting with constraint solvers, STEP and IGES import, and 3D-printing slicer export.", formats: "STEP, IGES, STL, OBJ, DXF, DWG" },
  { name: "FigCraft", role: "UI design and prototyping", replaces: "Figma", desc: "A collaborative canvas with design tokens, auto-layout, interactive state machines and CSS or Tailwind export.", formats: "FIG, JSON tokens, HTML/CSS, React TSX" },
  { name: "LightCraft", role: "RAW processing and grading", replaces: "Lightroom", desc: "Non-destructive RAW development with lens calibration, chromatic aberration correction, split toning and batch export.", formats: "DNG, CR3, NEF, ARW, RAF, TIFF" },
  { name: "WordCraft", role: "Word processor", replaces: "Word", desc: "Distraction-free writing with a live Markdown split view, citation management and DOCX or PDF export.", formats: "DOCX, ODT, Markdown, PDF, LaTeX" },
  { name: "GridCraft", role: "Spreadsheet engine", replaces: "Excel", desc: "Renders a million rows at 60 FPS, with multi-dimensional pivot tables and formula solvers.", formats: "XLSX, CSV, TSV, Parquet, Arrow" },
  { name: "DeckCraft", role: "Presentation designer", replaces: "PowerPoint", desc: "Slides with WebGL 3D transitions, animated charts and code blocks, exported to PDF or HTML5.", formats: "PPTX, HTML slides, PDF, MP4" },
  { name: "PdfCraft", role: "PDF editing and signing", replaces: "Acrobat Pro", desc: "Text editing, form filling, certificate signing, redaction and page merging.", formats: "PDF, PDF/A, FDF, XFDF" },
];

export const PIPELINES = [
  { id: "documentary-montage", cat: "documentary", title: "Documentary montage", desc: "Thematic montage from NASA, Archive.org and Pexels with music sync and grading." },
  { id: "animated-explainer", cat: "animation", title: "Animated explainer", desc: "Remotion motion graphics with KPIs, charts and comparison cards." },
  { id: "character-animation", cat: "animation", title: "Character animation", desc: "Animation from local SVG and diffusers-generated assets." },
  { id: "cinematic", cat: "animation", title: "Cinematic trailer", desc: "Mood-led trailers with a tension curve and orchestral score." },
  { id: "hybrid", cat: "animation", title: "Hybrid production", desc: "Combines AI video, archive footage and Remotion graphics." },
  { id: "talking-head", cat: "speech", title: "Talking head", desc: "End-to-end presenter-led video." },
  { id: "avatar-spokesperson", cat: "speech", title: "Avatar spokesperson", desc: "A digital twin avatar with speech and lip sync." },
  { id: "localization-dub", cat: "speech", title: "Localisation and dubbing", desc: "Transcript-first dubbing and subtitles, in English and தமிழ்." },
  { id: "clip-factory", cat: "social", title: "Clip factory", desc: "Extracts vertical clips for Shorts, Reels and TikTok." },
  { id: "podcast-repurpose", cat: "social", title: "Podcast repurpose", desc: "Turns long podcasts into video with waveforms and captions." },
  { id: "screen-demo", cat: "social", title: "Screen demo", desc: "Developer screen recordings with zoom callouts." },
  { id: "framework-smoke", cat: "custom", title: "Framework smoke test", desc: "A minimal manifest for verifying the pipeline framework." },
];

export const THEMES = [
  { id: "tokyo-storm", name: "Tokyo Storm", color: "#38bdf8", bg: "#090d16", accent: "#6366f1", desc: "Midnight blue with cyan and violet" },
  { id: "alpora-alpine", name: "Alpora Alpine", color: "#38bdf8", bg: "#07131e", accent: "#0284c7", desc: "Glacial cobalt and ice blue" },
  { id: "cyber-neon", name: "Cyber Neon", color: "#06b6d4", bg: "#080612", accent: "#f43f5e", desc: "Electric magenta, cyan and obsidian" },
  { id: "rose-pine", name: "Rosé Pine", color: "#9ccfd8", bg: "#191724", accent: "#eb6f92", desc: "Muted rose, pine and gold" },
  { id: "catppuccin", name: "Catppuccin Mocha", color: "#89dceb", bg: "#1e1e2e", accent: "#cba6f7", desc: "Pastel lavender, mauve and sky" },
  { id: "nord", name: "Nord Frost", color: "#88c0d0", bg: "#242933", accent: "#81a1c1", desc: "Arctic slate with cool frost" },
  { id: "gruvbox", name: "Gruvbox Retro", color: "#83a598", bg: "#1d2021", accent: "#fe8019", desc: "Warm charcoal, amber and forest" },
];

export const MCP_TOOLS = [
  { title: "Window management", tools: "get_windows, focus_window, dispatch_hyprland, move_window, close_window" },
  { title: "Audio and hardware", tools: "get_audio_status, toggle_audio_sink, set_volume, audit_media, heal_system" },
  { title: "Memory and theming", tools: "set_theme, launch_craft, condense_context, memory_retain, memory_recall" },
];
