"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanEye, Orbit, Radar, Globe, Globe2, Eye, Flame, Plane, Ship, Activity, Satellite,
  Volume2, VolumeX, Crosshair, Search, Compass, ShieldAlert, Waves, Anchor, Radio,
  SlidersHorizontal, Layers, Info, Lock, Maximize2, Minimize2, RotateCcw, Zap, Target,
  EyeOff, Navigation, Share2, Check, Moon, Sun, Map, X, MapPin, LocateFixed,
  Terminal, Cpu, Grid, Aperture, Gauge, Sparkles, Video, Play, Pause, FastForward,
  ShieldCheck, UserCheck, AlertTriangle, RadioTower, RefreshCw, Camera, Move, LayoutGrid
} from 'lucide-react';

// Sensor Filter Modes
type SensorMode = 'OPTICAL' | 'FLIR' | 'NVG' | 'AMBER' | 'CRT_MATRIX';

// Map Imagery Modes
type MapStyleMode = 'SATELLITE' | 'NIGHT' | 'VECTOR' | 'HYBRID';

// HUD Layout Types
type HudLayout = 'tactical' | 'operator' | 'minimal';

// Intel Category
type IntelCategory = 'all' | 'satellites' | 'flights' | 'earthquakes' | 'fires' | 'vessels';

// Intel Entity interface
interface IntelEntity {
  id: string;
  name: string;
  type: 'satellite' | 'flight' | 'earthquake' | 'fire' | 'vessel';
  lat: number;
  lng: number;
  alt: number; // km
  heading?: number;
  speed?: string;
  speedKmH?: number;
  callsign?: string;
  detail: string;
  extraInfo?: string;
  magnitude?: number; // for earthquakes
  frp?: number; // fire radiative power
  targetPerson?: string; // target face match name if applicable
  trajectoryEndLat?: number;
  trajectoryEndLng?: number;
}

// Projected 2D Screen Overlay Tag
interface ScreenOverlayTag {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  sx: number;
  sy: number;
  entity: IntelEntity;
}

// Preset Locations for Tactical Jump
const TACTICAL_PRESETS = [
  { name: '[SAT] ISS Orbit Station', lat: 28.5, lng: -80.6, alt: 420, type: 'satellite' as const },
  { name: '[MIL] Area 51 (Groom Lake)', lat: 37.235, lng: -115.811, alt: 1.4, type: 'hotspot' as const },
  { name: '[MIL] Pentagon HQ (Washington)', lat: 38.871, lng: -77.056, alt: 0.1, type: 'hotspot' as const },
  { name: '[SEIS] Japan Trench Fault', lat: 35.676, lng: 139.65, alt: 0, type: 'earthquake' as const },
  { name: '[HUB] Chennai Space Telemetry', lat: 13.0827, lng: 80.2707, alt: 0.2, type: 'hotspot' as const },
  { name: '[CHOKE] Suez Maritime Passage', lat: 29.975, lng: 32.559, alt: 0.05, type: 'vessel' as const },
  { name: '[AIR] Heathrow Flight Corridor', lat: 51.47, lng: -0.454, alt: 10, type: 'flight' as const },
  { name: '[VOLC] Kilauea Thermal Crater', lat: 19.42, lng: -155.28, alt: 0, type: 'fire' as const },
];

export default function GodsEyeViewTab() {
  const mountRef = useRef<HTMLDivElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);
  const cam1CanvasRef = useRef<HTMLCanvasElement>(null);
  const cam2CanvasRef = useRef<HTMLCanvasElement>(null);
  const cam3CanvasRef = useRef<HTMLCanvasElement>(null);
  const cam4CanvasRef = useRef<HTMLCanvasElement>(null);
  
  // HUD & UI States
  const [sensorMode, setSensorMode] = useState<SensorMode>('OPTICAL');
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('SATELLITE');
  const [hudLayout, setHudLayout] = useState<HudLayout>('tactical');
  const [scopeEnabled, setScopeEnabled] = useState<boolean>(true);
  const [cockpitMode, setCockpitMode] = useState<boolean>(false);
  const [cleanUiMode, setCleanUiMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Surveillance Camera & God's Eye Webcam States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showPipFeed, setShowPipFeed] = useState<boolean>(true);
  const [pipCameraMode, setPipCameraMode] = useState<'OPTICAL' | 'FLIR' | 'NVG' | 'INFRARED' | 'WEBCAM_GODSEYE'>('FLIR');
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [dewarpAmount, setDewarpAmount] = useState<number>(65); // Fisheye dewarp distortion correction
  const [topDownTilt, setTopDownTilt] = useState<number>(45); // Bird's eye overhead perspective tilt
  const [showRoomGrid, setShowRoomGrid] = useState<boolean>(true); // Spatial room grid
  const [multiCamMode, setMultiCamMode] = useState<boolean>(false);
  const [pipExpanded, setPipExpanded] = useState<boolean>(false);
  
  const [activeCategory, setActiveCategory] = useState<IntelCategory>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<IntelEntity | null>(null);
  const [entities, setEntities] = useState<IntelEntity[]>([]);
  const [screenOverlays, setScreenOverlays] = useState<ScreenOverlayTag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLockedOn, setIsLockedOn] = useState<boolean>(false);
  const [utcTime, setUtcTime] = useState<string>('');
  const [earthquakeCount, setEarthquakeCount] = useState<number>(0);
  const [cameraCoords, setCameraCoords] = useState<{ lat: number; lng: number; alt: number }>({ lat: 20, lng: 78, alt: 250 });
  const [intelLogs, setIntelLogs] = useState<string[]>([]);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [showUplinks, setShowUplinks] = useState<boolean>(true);

  // Biometric God's Eye Recon Scanner State
  const [isReconScanning, setIsReconScanning] = useState<boolean>(false);
  const [reconProgress, setReconProgress] = useState<number>(0);
  const [reconTargetQuery, setReconTargetQuery] = useState<string>('Dominic Toretto');
  const [reconMatchResult, setReconMatchResult] = useState<{
    targetName: string;
    entity: IntelEntity;
    matchScore: number;
    locationName: string;
  } | null>(null);

  // Web Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq = 800, duration = 0.08, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Fallback
    }
  }, [soundEnabled]);

  const playSirenSweep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Fallback
    }
  }, [soundEnabled]);

  const playShutterSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Fallback
    }
  }, [soundEnabled]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const gridLinesGroupRef = useRef<THREE.Group | null>(null);
  const earthMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const uplinksGroupRef = useRef<THREE.Group | null>(null);
  const orbitsGroupRef = useRef<THREE.Group | null>(null);
  
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.3, y: 0 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.3, y: 0 });
  const targetCameraDistanceRef = useRef<number>(3.8);
  const currentCameraDistanceRef = useRef<number>(3.8);
  const animationFrameIdRef = useRef<number | null>(null);

  // Ticker for UTC Time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Copy Telemetry
  const copyCoordinatesToClipboard = () => {
    const text = `LAT: ${cameraCoords.lat}°, LNG: ${cameraCoords.lng}°, ALT: ${cameraCoords.alt}km | TIME: ${utcTime}`;
    navigator.clipboard.writeText(text);
    setToastMessage(`TELEMETRY COPIED TO CLIPBOARD`);
    playBeep(1300, 0.15, 'square');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Capture Camera Snapshot
  const captureCameraSnapshot = () => {
    playShutterSound();
    setToastMessage(`SURVEILLANCE SNAPSHOT SAVED`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Start Hardware Webcam Stream (God's Eye Mode)
  const startWebcamStream = useCallback(async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setWebcamActive(true);
      setPipCameraMode('WEBCAM_GODSEYE');
      setShowPipFeed(true);
      setToastMessage("GOD'S EYE WEBCAM STREAM ACTIVE");
      playBeep(1200, 0.15, 'triangle');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Webcam error:", err);
      setWebcamError("Camera access denied or device unavailable.");
      setToastMessage("WEBCAM ACCESS DENIED");
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, [playBeep]);

  // Stop Hardware Webcam Stream
  const stopWebcamStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    setPipCameraMode('FLIR');
    setToastMessage("GOD'S EYE WEBCAM DISCONNECTED");
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Fetch Live Earthquakes
  const fetchLiveEarthquakes = useCallback(async () => {
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      const quakes: IntelEntity[] = data.features.slice(0, 25).map((f: {
        id: string;
        properties: { title: string; mag: number; time: number; place: string };
        geometry: { coordinates: [number, number, number] };
      }) => ({
        id: `eq-${f.id}`,
        name: f.properties.title || `M${f.properties.mag} Earthquake`,
        type: 'earthquake' as const,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        alt: Math.max(0, 10 - f.geometry.coordinates[2] * 0.1),
        magnitude: f.properties.mag,
        detail: `Epicenter: ${f.properties.place} | Focal Depth: ${f.geometry.coordinates[2]} km`,
        extraInfo: `USGS Event ID: ${f.id} | Recorded: ${new Date(f.properties.time).toLocaleTimeString()}`
      }));

      return quakes;
    } catch {
      return [
        { id: 'eq-s1', name: 'M6.4 Seismic Shockwave - Japan Trench', type: 'earthquake' as const, lat: 38.2, lng: 142.4, alt: 0, magnitude: 6.4, detail: 'Depth: 32 km | Pacific Subduction Zone', extraInfo: 'Tsunami Early Warning Watch Active' },
        { id: 'eq-s2', name: 'M5.6 Tremor Anomaly - San Andreas Fault', type: 'earthquake' as const, lat: 35.5, lng: -119.8, alt: 0, magnitude: 5.6, detail: 'Depth: 12 km | Southern California Corridor', extraInfo: 'Strike-slip Fault Tectonic Strain' },
        { id: 'eq-s3', name: 'M4.9 Oceanic Ridge Seismic Event', type: 'earthquake' as const, lat: 14.2, lng: -44.8, alt: 0, magnitude: 4.9, detail: 'Depth: 10 km | Mid-Atlantic Spreading Center', extraInfo: 'Divergent Plate Boundary Activity' }
      ];
    }
  }, []);

  // Generate All Intel Entities
  useEffect(() => {
    let isMounted = true;

    const generateEntities = async () => {
      const quakes = await fetchLiveEarthquakes();
      if (!isMounted) return;

      setEarthquakeCount(quakes.length);

      // Satellites
      const sats: IntelEntity[] = [
        { id: 'sat-iss', name: 'ISS (ZARYA) Orbital Complex', type: 'satellite', lat: 28.5, lng: -80.6, alt: 420, speed: '27,600 km/h', speedKmH: 27600, callsign: 'NORAD 25544', detail: 'International Space Station | Inclination: 51.6°', extraInfo: 'Crew: 7 Astronauts | Mass: 450 Tons | Period: 92.6m', targetPerson: 'Commander Oleg Artemyev', trajectoryEndLat: 48.5, trajectoryEndLng: 12.4 },
        { id: 'sat-hst', name: 'Hubble Space Observatory', type: 'satellite', lat: -12.1, lng: 110.5, alt: 535, speed: '27,300 km/h', speedKmH: 27300, callsign: 'NORAD 20580', detail: 'Low Earth Orbit Deep Space Telescope', extraInfo: 'Ultraviolet/Optical Recon Payload Online', trajectoryEndLat: 15.2, trajectoryEndLng: -140.2 },
        { id: 'sat-st1', name: 'STARLINK-5402 Orbital Array', type: 'satellite', lat: 48.2, lng: 8.5, alt: 550, speed: '27,000 km/h', speedKmH: 27000, callsign: 'SL-5402', detail: 'High-Bandwidth Laser Mesh Transceiver', extraInfo: 'Orbital Plane 34 | Encrypted Uplink Mesh', trajectoryEndLat: 22.1, trajectoryEndLng: -70.4 },
        { id: 'sat-landsat', name: 'LANDSAT-9 Earth Imaging', type: 'satellite', lat: 62.1, lng: -105.4, alt: 705, speed: '26,800 km/h', speedKmH: 26800, callsign: 'NORAD 49260', detail: 'Multispectral Thermal Surface Recon Satellite', extraInfo: 'SWIR / TIRS Thermal Imaging Resolution: 15m', trajectoryEndLat: -30.4, trajectoryEndLng: 40.2 },
      ];

      // Flights
      const flights: IntelEntity[] = [
        { id: 'fl-1', name: 'AIR INDIA AI-101 (B788)', type: 'flight', lat: 28.5, lng: 77.1, alt: 11, heading: 270, speed: '890 km/h', speedKmH: 890, callsign: 'AIC101', detail: 'Transatlantic Track: DEL -> LHR | Alt: 36,000 ft', extraInfo: 'Boeing 787-8 Dreamliner | Transponder 4321', trajectoryEndLat: 51.47, trajectoryEndLng: -0.45 },
        { id: 'fl-2', name: 'BRITISH AIRWAYS BA-286', type: 'flight', lat: 40.7, lng: -73.9, alt: 12, heading: 85, speed: '920 km/h', speedKmH: 920, callsign: 'BAW286', detail: 'Route: JFK -> LHR | Transatlantic Corridor', extraInfo: 'Airbus A380-800 | Transponder 7612', targetPerson: 'Dominic Toretto', trajectoryEndLat: 51.47, trajectoryEndLng: -0.45 },
        { id: 'fl-3', name: 'RECON DRONE AF-99 (STEALTH)', type: 'flight', lat: 37.235, lng: -115.811, alt: 18, heading: 140, speed: '480 km/h', speedKmH: 480, callsign: 'NIGHTHAWK', detail: 'Nevada Test Range Recon Circuit', extraInfo: 'High-Altitude FLIR Optical Sensor Pod', targetPerson: 'Deckard Shaw', trajectoryEndLat: 34.05, trajectoryEndLng: -118.24 },
        { id: 'fl-4', name: 'SINGAPORE AIR SQ-322', type: 'flight', lat: 1.3, lng: 103.9, alt: 10.5, heading: 310, speed: '880 km/h', speedKmH: 880, callsign: 'SIA322', detail: 'Route: SIN -> LHR | Malacca Transit Corridor', extraInfo: 'Airbus A350-900 | Transponder 5204', trajectoryEndLat: 25.2, trajectoryEndLng: 55.27 },
      ];

      // Wildfires
      const fires: IntelEntity[] = [
        { id: 'fr-1', name: 'Thermal Anomaly #409 (Amazon Wildfire)', type: 'fire', lat: -15.4, lng: -55.2, alt: 0, frp: 184.2, detail: 'NASA FIRMS Sensor | Amazon Basin Sector', extraInfo: 'Fire Radiative Power: 184.2 MW | High Intensity' },
        { id: 'fr-2', name: 'Thermal Anomaly #812 (Bushfire)', type: 'fire', lat: -33.8, lng: 150.8, alt: 0, frp: 96.5, detail: 'NASA FIRMS Thermal Scan | NSW Australia', extraInfo: 'Fire Radiative Power: 96.5 MW | Active Hotspot' },
        { id: 'fr-3', name: 'Volcanic Caldera Thermal Anomaly', type: 'fire', lat: 19.42, lng: -155.28, alt: 0.5, frp: 310.0, detail: 'Kilauea Volcano Lava Emission', extraInfo: 'Magmatic Thermal Radiative Output: 310 MW' }
      ];

      // Vessels
      const vessels: IntelEntity[] = [
        { id: 'vs-1', name: 'CONTAINER SHIP "EVER GIVEN"', type: 'vessel', lat: 29.9, lng: 32.5, alt: 0, heading: 340, speed: '14 knots', speedKmH: 26, callsign: 'H3RC', detail: 'Suez Canal Maritime Transit', extraInfo: 'Draft: 15.7m | MMSI 353136000', trajectoryEndLat: 31.2, trajectoryEndLng: 32.3 },
        { id: 'vs-2', name: 'CRUDE TANKER "PACIFIC TITAN"', type: 'vessel', lat: 5.8, lng: 97.4, alt: 0, heading: 120, speed: '12 knots', speedKmH: 22, callsign: 'V7AK9', detail: 'Strait of Malacca Eastbound Channel', extraInfo: 'Raw Crude Transit | AIS Class A Transponder', trajectoryEndLat: 1.2, trajectoryEndLng: 103.8 },
        { id: 'vs-3', name: 'NAVAL RECON VESSEL USNS-4', type: 'vessel', lat: 24.5, lng: 121.5, alt: 0, heading: 45, speed: '22 knots', speedKmH: 40, callsign: 'NAV-9', detail: 'Taiwan Strait Hydrographic Survey', extraInfo: 'Multibeam Sonar & Array Active', targetPerson: 'Cipher', trajectoryEndLat: 35.6, trajectoryEndLng: 139.7 }
      ];

      const combined = [...sats, ...flights, ...quakes, ...fires, ...vessels];
      setEntities(combined);

      setIntelLogs([
        `[${new Date().toLocaleTimeString()}] God's Eye Defense Surveillance System Online`,
        `[${new Date().toLocaleTimeString()}] Live USGS Seismic Feed Synced (${quakes.length} Events)`,
        `[${new Date().toLocaleTimeString()}] NORAD Orbital TLE Telemetry Mesh Active`,
        `[${new Date().toLocaleTimeString()}] NASA FIRMS Thermal Sensor Array Connected`
      ]);
    };

    generateEntities();
    const interval = setInterval(generateEntities, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchLiveEarthquakes]);

  // Convert Lat/Lng to 3D Cartesian Vector
  const latLngToVector3 = useCallback((lat: number, lng: number, radius: number, altOffset = 0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = radius + altOffset;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Helper: Create high-res Earth canvas texture
  const createEarthCanvasTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#030a16');
    grad.addColorStop(0.5, '#071830');
    grad.addColorStop(1, '#020712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tactical Grid Lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // High-res Continents
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    const continents = [
      { x: 440, y: 280, r: 160 }, { x: 360, y: 360, r: 120 }, { x: 600, y: 300, r: 90 },
      { x: 640, y: 640, r: 140 }, { x: 680, y: 760, r: 100 },
      { x: 1100, y: 260, r: 180 }, { x: 1400, y: 300, r: 240 }, { x: 1600, y: 360, r: 200 }, { x: 1200, y: 400, r: 140 },
      { x: 1100, y: 560, r: 160 }, { x: 1160, y: 680, r: 120 },
      { x: 1680, y: 720, r: 110 },
      { x: 1000, y: 980, r: 300 }
    ];

    continents.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Map Imagery Style Switcher
  const changeMapStyle = useCallback((style: MapStyleMode) => {
    setMapStyle(style);
    playBeep(950, 0.1);

    if (!earthMaterialRef.current) return;
    const loader = new THREE.TextureLoader();

    if (style === 'SATELLITE') {
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg', tex => {
        if (earthMaterialRef.current) {
          earthMaterialRef.current.map = tex;
          earthMaterialRef.current.needsUpdate = true;
        }
      });
    } else if (style === 'NIGHT') {
      loader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg', tex => {
        if (earthMaterialRef.current) {
          earthMaterialRef.current.map = tex;
          earthMaterialRef.current.needsUpdate = true;
        }
      });
    } else if (style === 'VECTOR' || style === 'HYBRID') {
      if (earthMaterialRef.current) {
        earthMaterialRef.current.map = createEarthCanvasTexture();
        earthMaterialRef.current.needsUpdate = true;
      }
    }
  }, [createEarthCanvasTexture, playBeep]);

  // Target Jump & Camera Lock-on Function
  const lockOnTarget = useCallback((targetLat: number, targetLng: number, entity?: IntelEntity) => {
    setIsLockedOn(true);
    playSirenSweep();

    const targetX = targetLat * (Math.PI / 180);
    const targetY = -targetLng * (Math.PI / 180);

    targetRotationRef.current = { x: targetX, y: targetY };
    targetCameraDistanceRef.current = 2.6;

    if (entity) {
      setSelectedEntity(entity);
      setIntelLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GOD'S EYE RECON LOCK: ${entity.name} (${entity.lat.toFixed(2)}°, ${entity.lng.toFixed(2)}°)`,
        ...prev.slice(0, 10)
      ]);
    }
  }, [playSirenSweep]);

  // Initiate Biometric God's Eye Recon Scan
  const startBiometricReconScan = (targetQueryName: string) => {
    setIsReconScanning(true);
    setReconProgress(0);
    setReconMatchResult(null);
    playSirenSweep();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setReconProgress(prog);

      if (prog % 15 === 0) playBeep(900 + Math.random() * 400, 0.05, 'square');
      targetRotationRef.current.y += (Math.random() - 0.5) * 0.8;
      targetRotationRef.current.x += (Math.random() - 0.5) * 0.4;

      if (prog >= 100) {
        clearInterval(interval);
        setIsReconScanning(false);

        const match = entities.find(e => 
          e.name.toLowerCase().includes(targetQueryName.toLowerCase()) || 
          (e.targetPerson && e.targetPerson.toLowerCase().includes(targetQueryName.toLowerCase())) ||
          (e.callsign && e.callsign.toLowerCase().includes(targetQueryName.toLowerCase()))
        ) || entities[Math.floor(Math.random() * entities.length)];

        setReconMatchResult({
          targetName: targetQueryName,
          entity: match,
          matchScore: 99.8,
          locationName: match.detail
        });

        lockOnTarget(match.lat, match.lng, match);
      }
    }, 100);
  };

  // Render Procedural & Live God's Eye Camera Feed Helper
  const drawCameraFeedOnCanvas = useCallback((
    canvas: HTMLCanvasElement | null,
    mode: 'OPTICAL' | 'FLIR' | 'NVG' | 'INFRARED' | 'WEBCAM_GODSEYE',
    label: string,
    time: number
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // IF LIVE WEBCAM MODE IS ACTIVE AND VIDEO STREAM IS PLAYING
    if (mode === 'WEBCAM_GODSEYE' && webcamActive && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Apply Top-Down Perspective Tilt Skew & Fisheye Scale Transformation
      const tiltScaleY = 0.5 + (topDownTilt / 90) * 0.5;
      const dewarpScale = 1.0 + (dewarpAmount / 100) * 0.3;

      ctx.translate(w / 2, h / 2);
      ctx.scale(dewarpScale, dewarpScale * tiltScaleY);
      
      // Draw Video Frame
      ctx.drawImage(videoRef.current, -w / 2, -h / 2, w, h);
      ctx.restore();

      // Apply Optional Color Sensor Filter on Live Video
      if (sensorMode === 'NVG') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(0, 0, w, h);
      } else if (sensorMode === 'FLIR') {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
        ctx.fillRect(0, 0, w, h);
      } else if (sensorMode === 'CRT_MATRIX') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(0, 0, w, h);
      }

      // Overhead Room Spatial Grid Overlay
      if (showRoomGrid) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1;
        const gridStep = 24;
        for (let x = 0; x < w; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Dynamic Target Bounding Box
      const cx = w / 2 + Math.sin(time * 2) * 14;
      const cy = h / 2 + Math.cos(time * 1.5) * 10;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 24, cy - 24, 48, 48);
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Live Telemetry Text
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`[GOD'S EYE WEBCAM - BIRD'S EYE TOP-DOWN]`, 6, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`DEWARP: ${dewarpAmount}% | PITCH: ${topDownTilt}° | GRID: ${showRoomGrid ? 'ON' : 'OFF'}`, 6, 22);
      ctx.fillText(`FPS: 60 | FEED: LIVE HD WEBCAM ●`, 6, h - 8);

      // Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let sl = 0; sl < h; sl += 4) {
        ctx.fillRect(0, sl, w, 2);
      }

      return;
    }

    // IF WEBCAM MODE SELECTED BUT NOT ACTIVE YET
    if (mode === 'WEBCAM_GODSEYE' && !webcamActive) {
      ctx.fillStyle = '#030816';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.strokeRect(10, 10, w - 20, h - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("📷 GOD'S EYE LIVE WEBCAM DISCONNECTED", w / 2, h / 2 - 12);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText("Click 'START WEBCAM' in control bar to view top-down feed", w / 2, h / 2 + 8);
      ctx.textAlign = 'left';
      return;
    }

    // SIMULATED CAMERAS (OPTICAL, FLIR, NVG, INFRARED)
    if (mode === 'FLIR') ctx.fillStyle = '#060214';
    else if (mode === 'NVG') ctx.fillStyle = '#011508';
    else if (mode === 'INFRARED') ctx.fillStyle = '#1c0303';
    else ctx.fillStyle = '#050c1a';

    ctx.fillRect(0, 0, w, h);

    // Wireframe Grid Lines
    ctx.strokeStyle = mode === 'NVG' ? 'rgba(34, 197, 94, 0.25)' : 
                      mode === 'FLIR' ? 'rgba(236, 72, 153, 0.25)' : 
                      mode === 'INFRARED' ? 'rgba(239, 68, 68, 0.3)' : 
                      'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dynamic Target Bounding Box
    const cx = w / 2 + Math.sin(time * 2) * 12;
    const cy = h / 2 + Math.cos(time * 1.5) * 8;

    ctx.strokeStyle = mode === 'NVG' ? '#22c55e' : 
                      mode === 'FLIR' ? '#f43f5e' : 
                      mode === 'INFRARED' ? '#ef4444' : '#06b6d4';
    ctx.lineWidth = 2;

    const boxSize = 44;
    ctx.strokeRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);

    // Target Pulse Dot
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Thermal Heatmap Gradient
    if (mode === 'FLIR' || mode === 'INFRARED') {
      const heatGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30);
      heatGrad.addColorStop(0, '#fef08a');
      heatGrad.addColorStop(0.4, '#f97316');
      heatGrad.addColorStop(0.8, '#7c2d12');
      heatGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = heatGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Telemetry text
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.fillText(`${label}`, 6, 12);
    ctx.fillText(`TARGET: ${selectedEntity ? selectedEntity.name.substring(0, 16) : 'LOCK ACTIVE'}`, 6, 22);
    ctx.fillText(`TEMP: ${(36.6 + Math.sin(time) * 1.2).toFixed(1)}°C | REC ●`, 6, h - 8);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let sl = 0; sl < h; sl += 4) {
      ctx.fillRect(0, sl, w, 2);
    }
  }, [selectedEntity, webcamActive, dewarpAmount, topDownTilt, showRoomGrid, sensorMode]);

  // Main PiP Camera & Multi-Cam Canvas Render Loop
  useEffect(() => {
    let animId: number;
    let time = 0;

    const renderLoop = () => {
      time += 0.05;

      if (showPipFeed) {
        drawCameraFeedOnCanvas(pipCanvasRef.current, pipCameraMode, `CAM 01 (${pipCameraMode})`, time);
      }

      if (multiCamMode) {
        drawCameraFeedOnCanvas(
          cam1CanvasRef.current,
          webcamActive ? 'WEBCAM_GODSEYE' : 'OPTICAL',
          webcamActive ? "CAM 01: GOD'S EYE WEBCAM" : 'CAM 01: SATELLITE OPTICAL',
          time
        );
        drawCameraFeedOnCanvas(cam2CanvasRef.current, 'FLIR', 'CAM 02: DRONE FLIR THERMAL', time);
        drawCameraFeedOnCanvas(cam3CanvasRef.current, 'NVG', 'CAM 03: GROUND NVG RECON', time);
        drawCameraFeedOnCanvas(cam4CanvasRef.current, 'INFRARED', 'CAM 04: INFRARED SPECTRUM', time);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [showPipFeed, multiCamMode, pipCameraMode, drawCameraFeedOnCanvas]);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff007f, 0.9);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const sphereRadius = 1.6;
    const earthGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const earthTexture = createEarthCanvasTexture();

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.45,
      metalness: 0.15,
      wireframe: false,
    });
    earthMaterialRef.current = earthMaterial;

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Load High-Res NASA Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      (realTexture) => {
        earthMaterial.map = realTexture;
        earthMaterial.needsUpdate = true;
      }
    );

    // Rotating Clouds Layer Mesh
    const cloudsGeo = new THREE.SphereGeometry(sphereRadius * 1.015, 64, 64);
    const cloudsMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Glow Halo
    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius * 1.06, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Tactical Radar Ring
    const radarGeo = new THREE.RingGeometry(sphereRadius * 1.15, sphereRadius * 1.16, 64);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const radarRing = new THREE.Mesh(radarGeo, radarMat);
    radarRing.rotation.x = Math.PI / 2;
    globeGroup.add(radarRing);

    // Lat/Lng Grid Lines Group
    const gridLinesGroup = new THREE.Group();
    globeGroup.add(gridLinesGroup);
    gridLinesGroupRef.current = gridLinesGroup;

    // Build 3D Lat/Lng Grid Mesh
    const gridMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.18 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        pts.push(latLngToVector3(lat, lng, sphereRadius, 0.005));
      }
      gridLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = 0; lng < 360; lng += 45) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        pts.push(latLngToVector3(lat, lng, sphereRadius, 0.005));
      }
      gridLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Sub-Groups
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const uplinksGroup = new THREE.Group();
    globeGroup.add(uplinksGroup);
    uplinksGroupRef.current = uplinksGroup;

    const orbitsGroup = new THREE.Group();
    globeGroup.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    // Orbit Rings
    const createOrbitRing = (radius: number, color: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * 0.4, Math.sin(theta) * radius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const orbitMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
      return new THREE.Line(orbitGeo, orbitMat);
    };

    orbitsGroup.add(createOrbitRing(sphereRadius + 0.35, 0x00f0ff));
    orbitsGroup.add(createOrbitRing(sphereRadius + 0.5, 0xff007f));
    orbitsGroup.add(createOrbitRing(sphereRadius + 0.65, 0xfacc15));

    // Drag / Zoom Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      targetRotationRef.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraDistanceRef.current += e.deltaY * 0.002;
      targetCameraDistanceRef.current = Math.max(2.1, Math.min(7.0, targetCameraDistanceRef.current));
    };

    const domElem = mountRef.current;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.03;
      }

      if (!isDraggingRef.current && !isLockedOn) {
        targetRotationRef.current.y += 0.0012 * timeMultiplier;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
      currentCameraDistanceRef.current += (targetCameraDistanceRef.current - currentCameraDistanceRef.current) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = currentCameraDistanceRef.current;
      }

      if (orbitsGroupRef.current) {
        orbitsGroupRef.current.rotation.y += delta * 0.05 * timeMultiplier;
      }

      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach(child => {
          if (child.userData.isPulse) {
            const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      if (cameraRef.current && globeGroupRef.current && mountRef.current && entities.length > 0) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const overlays: ScreenOverlayTag[] = [];

        entities.slice(0, 14).forEach(ent => {
          const worldPos = latLngToVector3(ent.lat, ent.lng, 1.6, 0.04).applyMatrix4(globeGroupRef.current!.matrixWorld);
          
          const cameraPos = cameraRef.current!.position;
          const distToCenter = cameraPos.distanceTo(new THREE.Vector3(0, 0, 0));
          const distToMarker = cameraPos.distanceTo(worldPos);

          if (distToMarker < distToCenter) {
            const proj = worldPos.clone().project(cameraRef.current!);
            const sx = (proj.x * 0.5 + 0.5) * w;
            const sy = (-(proj.y * 0.5) + 0.5) * h;

            if (sx >= 40 && sx <= w - 40 && sy >= 40 && sy <= h - 40) {
              overlays.push({
                id: ent.id,
                name: ent.name,
                type: ent.type,
                lat: ent.lat,
                lng: ent.lng,
                sx,
                sy,
                entity: ent
              });
            }
          }
        });

        setScreenOverlays(overlays);
      }

      const currentLng = ((-currentRotationRef.current.y * (180 / Math.PI)) % 360 + 540) % 360 - 180;
      const currentLat = currentRotationRef.current.x * (180 / Math.PI);
      const currentAlt = Math.round((currentCameraDistanceRef.current - 1.6) * 250);
      setCameraCoords({
        lat: Number(currentLat.toFixed(2)),
        lng: Number(currentLng.toFixed(2)),
        alt: currentAlt
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, [createEarthCanvasTexture, isLockedOn, entities, latLngToVector3, timeMultiplier]);

  // Update 3D Entity Markers & Arcs
  useEffect(() => {
    if (!markersGroupRef.current || !arcsGroupRef.current || !uplinksGroupRef.current) return;

    while (markersGroupRef.current.children.length > 0) markersGroupRef.current.remove(markersGroupRef.current.children[0]);
    while (arcsGroupRef.current.children.length > 0) arcsGroupRef.current.remove(arcsGroupRef.current.children[0]);
    while (uplinksGroupRef.current.children.length > 0) uplinksGroupRef.current.remove(uplinksGroupRef.current.children[0]);

    const sphereRadius = 1.6;

    const filteredEntities = entities.filter(e => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'satellites') return e.type === 'satellite';
      if (activeCategory === 'flights') return e.type === 'flight';
      if (activeCategory === 'earthquakes') return e.type === 'earthquake';
      if (activeCategory === 'fires') return e.type === 'fire';
      if (activeCategory === 'vessels') return e.type === 'vessel';
      return true;
    });

    filteredEntities.forEach(entity => {
      const pos = latLngToVector3(entity.lat, entity.lng, sphereRadius, 0.03 + (entity.alt ? entity.alt * 0.0003 : 0));

      let color = 0x00f0ff;
      let size = 0.04;

      if (entity.type === 'satellite') {
        color = 0xfacc15;
        size = 0.045;
      } else if (entity.type === 'flight') {
        color = 0x38bdf8;
        size = 0.038;
      } else if (entity.type === 'earthquake') {
        color = entity.magnitude && entity.magnitude >= 6.0 ? 0xff007f : 0xf97316;
        size = 0.05 + (entity.magnitude ? entity.magnitude * 0.006 : 0);
      } else if (entity.type === 'fire') {
        color = 0xef4444;
        size = 0.042;
      } else if (entity.type === 'vessel') {
        color = 0x10b981;
        size = 0.038;
      }

      const geom = new THREE.SphereGeometry(size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.userData = { entity, isPulse: true };

      const ringGeom = new THREE.RingGeometry(size * 1.4, size * 2.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      ringMesh.userData = { entity, isPulse: true };

      markersGroupRef.current?.add(mesh);
      markersGroupRef.current?.add(ringMesh);

      if (showTrajectories && entity.trajectoryEndLat !== undefined && entity.trajectoryEndLng !== undefined) {
        const startPos = latLngToVector3(entity.lat, entity.lng, sphereRadius, 0.02);
        const endPos = latLngToVector3(entity.trajectoryEndLat, entity.trajectoryEndLng, sphereRadius, 0.02);

        const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        midPos.multiplyScalar(1.25);

        const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
        const points = curve.getPoints(32);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        const arcMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
        arcsGroupRef.current?.add(new THREE.Line(arcGeo, arcMat));
      }

      if (showUplinks && entity.type === 'satellite') {
        const surfacePos = latLngToVector3(entity.lat, entity.lng, sphereRadius, 0.005);
        const beamPts = [pos, surfacePos];
        const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPts);
        const beamMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.65 });
        uplinksGroupRef.current?.add(new THREE.Line(beamGeo, beamMat));
      }
    });
  }, [entities, activeCategory, showTrajectories, showUplinks, latLngToVector3]);

  // Canvas Click Raycaster
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !markersGroupRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(markersGroupRef.current.children);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.entity) {
        const ent = hit.userData.entity as IntelEntity;
        lockOnTarget(ent.lat, ent.lng, ent);
      }
    }
  };

  // Sensor Filter Style Classes
  const getSensorModeStyle = () => {
    switch (sensorMode) {
      case 'FLIR':
        return 'invert-[0.9] contrast-[1.8] hue-rotate-180 brightness-110';
      case 'NVG':
        return 'sepia-[1] hue-rotate-[90deg] saturate-[3] contrast-[1.4] brightness-90';
      case 'AMBER':
        return 'sepia-[1] hue-rotate-[15deg] saturate-[4] contrast-[1.3] brightness-95';
      case 'CRT_MATRIX':
        return 'hue-rotate-[120deg] contrast-[2] brightness-105';
      default:
        return '';
    }
  };

  // Filter entities
  const filteredEntitiesList = entities.filter(e => {
    const matchesSearch = searchQuery === '' || 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.callsign && e.callsign.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = activeCategory === 'all' || 
      (activeCategory === 'satellites' && e.type === 'satellite') ||
      (activeCategory === 'flights' && e.type === 'flight') ||
      (activeCategory === 'earthquakes' && e.type === 'earthquake') ||
      (activeCategory === 'fires' && e.type === 'fire') ||
      (activeCategory === 'vessels' && e.type === 'vessel');

    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-[1700px] flex flex-col items-center gap-4 text-slate-100 font-mono select-none relative">
      <video ref={videoRef} className="hidden" playsInline muted />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 tracking-wider"
          >
            <Check className="w-4 h-4" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric God's Eye Recon Scan Modal */}
      <AnimatePresence>
        {isReconScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-cyan-500/50 flex flex-col items-center gap-5 shadow-2xl text-center relative overflow-hidden">
              <div className="aurora-glow-cyan top-0 left-0 -ml-20 -mt-20 opacity-40" />

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
                <ScanEye className="w-12 h-12" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  GOD'S EYE BIOMETRIC RECON SCAN
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  SCANNING GLOBAL TELEMETRY MESH
                </h2>
                <span className="text-xs text-slate-400">Target query: "{reconTargetQuery}"</span>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    style={{ width: `${reconProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>SATELLITE BEAM MATCHING...</span>
                  <span className="font-bold text-cyan-400">{reconProgress}%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                [ SCANNING 1,840,920 SATELLITE & CCTV CAMERAS WORLDWIDE ]
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Recon Scan Result Card */}
      <AnimatePresence>
        {reconMatchResult && !isReconScanning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 z-40 w-full max-w-lg px-4"
          >
            <div className="p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <UserCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      TARGET MATCH: {reconMatchResult.targetName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {reconMatchResult.matchScore}% MATCH
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{reconMatchResult.locationName}</span>
                </div>
              </div>
              <button
                onClick={() => setReconMatchResult(null)}
                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Header Banner (Normal UI Mode) */}
      {!cleanUiMode && (
        <div className="w-full glass-card p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="aurora-glow-cyan top-0 left-0 -ml-20 -mt-20 opacity-30" />
          
          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ScanEye className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-widest text-slate-100">
                  GOD'S EYE VIEW <span className="text-cyan-400 font-normal">RECON SYSTEM</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
                  GLOBAL DEFENSE SURVEILLANCE
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider">
                ORBITAL SATELLITE RECON, BIOMETRIC SCANNING & LIVE WEBCAM DEWARPING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 text-xs">
            <button
              onClick={() => {
                if (webcamActive) stopWebcamStream();
                else startWebcamStream();
              }}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                webcamActive 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/30 animate-pulse' 
                  : 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500'
              }`}
            >
              <Camera className="w-4 h-4" /> {webcamActive ? "● WEBCAM LIVE" : "START LIVE WEBCAM"}
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <input
                type="text"
                value={reconTargetQuery}
                onChange={e => setReconTargetQuery(e.target.value)}
                placeholder="Biometric Target Search..."
                className="w-32 sm:w-44 px-2 py-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => startBiometricReconScan(reconTargetQuery)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 transition-all shadow-md shadow-cyan-500/20"
              >
                <Zap className="w-3 h-3" /> Recon Scan
              </button>
            </div>

            <button
              onClick={() => setMultiCamMode(!multiCamMode)}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                multiCamMode ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> 4-Cam Grid
            </button>

            <button
              onClick={copyCoordinatesToClipboard}
              className="p-2 rounded-xl border bg-slate-900 border-slate-800 hover:border-cyan-500 text-slate-300 transition-all flex items-center gap-1.5"
              title="Copy telemetry coordinates"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playBeep(900, 0.1);
              }}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled 
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle Tactical Audio FX"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Clean UI Top Command Bar (Visible when Clean UI is active) */}
      {cleanUiMode && (
        <div className="w-full glass-card px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl shadow-2xl z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <ScanEye className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-black tracking-wider text-white uppercase">
              GOD'S EYE <span className="text-cyan-400">CLEAN RECON</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <input
              type="text"
              value={reconTargetQuery}
              onChange={e => setReconTargetQuery(e.target.value)}
              placeholder="Search Target..."
              className="w-28 sm:w-36 px-2 py-0.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => startBiometricReconScan(reconTargetQuery)}
              className="px-2 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Scan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (webcamActive) stopWebcamStream();
                else startWebcamStream();
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                webcamActive 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/30 animate-pulse' 
                  : 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" /> {webcamActive ? "● WEBCAM LIVE" : "📷 WEBCAM"}
            </button>

            <button
              onClick={() => setShowPipFeed(!showPipFeed)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                showPipFeed ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Video className="w-3 h-3" /> PiP Cam
            </button>

            <button
              onClick={() => setMultiCamMode(!multiCamMode)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                multiCamMode ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> 4-Cam Grid
            </button>

            <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['OPTICAL', 'FLIR', 'NVG', 'CRT_MATRIX'] as SensorMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSensorMode(mode)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    sensorMode === mode ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'OPTICAL' && 'OPT'}
                  {mode === 'FLIR' && 'FLIR'}
                  {mode === 'NVG' && 'NVG'}
                  {mode === 'CRT_MATRIX' && 'MATRIX'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCleanUiMode(false)}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-bold text-xs text-cyan-400 flex items-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Full UI
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className={`w-full grid ${cleanUiMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-4`}>
        
        {/* Left Side (Hidden in Clean UI Mode) */}
        {!cleanUiMode && (
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Map Style */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Globe2 className="w-4 h-4" /> Map Style
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'SATELLITE', label: 'NASA SAT', icon: Satellite },
                  { id: 'NIGHT', label: 'CITY LIGHTS', icon: Sparkles },
                  { id: 'VECTOR', label: 'VECTOR', icon: Grid },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = mapStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => changeMapStyle(item.id as MapStyleMode)}
                      className={`py-2 px-1.5 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensor Filters */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Aperture className="w-4 h-4" /> Sensor Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['OPTICAL', 'FLIR', 'NVG', 'AMBER', 'CRT_MATRIX'] as SensorMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSensorMode(mode);
                      playBeep(1000, 0.08);
                    }}
                    className={`py-2 px-3 rounded-xl text-[11px] font-semibold border transition-all ${
                      sensorMode === mode
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'OPTICAL' && 'OPTICAL'}
                    {mode === 'FLIR' && 'FLIR THERMAL'}
                    {mode === 'NVG' && 'NVG NIGHT'}
                    {mode === 'AMBER' && 'AMBER CRT'}
                    {mode === 'CRT_MATRIX' && 'MATRIX GREEN'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Layers */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" /> 3D Layers
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  onClick={() => setShowGridLines(!showGridLines)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 ${
                    showGridLines ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" /> Grid Lines
                </button>
                <button
                  onClick={() => setShowTrajectories(!showTrajectories)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 ${
                    showTrajectories ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> 3D Arcs
                </button>
                <button
                  onClick={() => setShowUplinks(!showUplinks)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 ${
                    showUplinks ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <RadioTower className="w-3.5 h-3.5" /> Uplinks
                </button>
              </div>
            </div>

            {/* Intel Stream Categories */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Radio className="w-4 h-4 animate-pulse" /> Intel Feeds</span>
                <span className="text-[10px] text-slate-500">{filteredEntitiesList.length} Active</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'all', label: 'All Recon Feeds', icon: Orbit, count: entities.length, color: 'text-cyan-400' },
                  { id: 'satellites', label: 'Satellites', icon: Satellite, count: entities.filter(e => e.type === 'satellite').length, color: 'text-amber-400' },
                  { id: 'flights', label: 'Flights', icon: Plane, count: entities.filter(e => e.type === 'flight').length, color: 'text-sky-400' },
                  { id: 'earthquakes', label: 'USGS Quakes', icon: Waves, count: earthquakeCount, color: 'text-rose-400' },
                  { id: 'fires', label: 'Thermal Fires', icon: Flame, count: entities.filter(e => e.type === 'fire').length, color: 'text-orange-400' },
                  { id: 'vessels', label: 'AIS Vessels', icon: Anchor, count: entities.filter(e => e.type === 'vessel').length, color: 'text-emerald-400' },
                ].map(cat => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id as IntelCategory);
                        playBeep(750, 0.08);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected ? 'bg-slate-900 border border-slate-700 text-white' : 'text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                <LocateFixed className="w-4 h-4" /> Hotspots
              </div>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                {TACTICAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => lockOnTarget(preset.lat, preset.lng)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-xs text-left transition-all text-slate-300 hover:text-cyan-400"
                  >
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-[9px] text-slate-500">{preset.lat.toFixed(1)}°, {preset.lng.toFixed(1)}°</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center: 3D Globe & Camera Surveillance Layer */}
        <div className={`${cleanUiMode ? 'col-span-1' : 'lg:col-span-2'} flex flex-col gap-4 relative`}>
          
          {/* Main Viewport Box */}
          <div className={`relative w-full ${cleanUiMode ? 'h-[88vh]' : 'h-[520px] sm:h-[620px]'} rounded-3xl glass-card border border-cyan-500/40 overflow-hidden shadow-2xl group`}>
            
            {/* 3D Canvas */}
            <div
              ref={mountRef}
              onClick={handleCanvasClick}
              className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${getSensorModeStyle()}`}
            />

            {/* 2D Badges */}
            {screenOverlays.map(tag => (
              <div
                key={tag.id}
                onClick={() => lockOnTarget(tag.lat, tag.lng, tag.entity)}
                style={{ left: `${tag.sx}px`, top: `${tag.sy}px` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group flex flex-col items-center gap-0.5"
              >
                <div className={`px-2 py-0.5 rounded-lg backdrop-blur-md border shadow-lg text-[9px] font-extrabold tracking-wider whitespace-nowrap transition-transform group-hover:scale-110 flex items-center gap-1 ${
                  tag.type === 'satellite' ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' :
                  tag.type === 'flight' ? 'bg-sky-950/80 border-sky-500/50 text-sky-300' :
                  tag.type === 'earthquake' ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' :
                  tag.type === 'fire' ? 'bg-orange-950/80 border-orange-500/50 text-orange-300' :
                  'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                }`}>
                  {tag.type === 'satellite' && <Satellite className="w-2.5 h-2.5 animate-pulse" />}
                  {tag.type === 'flight' && <Plane className="w-2.5 h-2.5 animate-pulse" />}
                  {tag.type === 'earthquake' && <Waves className="w-2.5 h-2.5 animate-pulse" />}
                  {tag.type === 'fire' && <Flame className="w-2.5 h-2.5 animate-pulse" />}
                  {tag.type === 'vessel' && <Anchor className="w-2.5 h-2.5 animate-pulse" />}
                  <span>{tag.name.length > 18 ? tag.name.substring(0, 18) + '...' : tag.name}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md animate-ping" />
              </div>
            ))}

            {/* Scope Vignette */}
            {scopeEnabled && (
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background: 'radial-gradient(circle at center, transparent 38%, rgba(2, 6, 23, 0.75) 65%, rgba(2, 6, 23, 0.96) 92%)'
                }}
              />
            )}

            {/* 4-Camera Surveillance Split Grid Overlay */}
            {multiCamMode && (
              <div className="absolute inset-4 z-30 pointer-events-auto bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-3 grid grid-cols-2 grid-rows-2 gap-3 shadow-2xl backdrop-blur-xl">
                <div className="w-full h-full rounded-xl bg-black border border-slate-800 relative overflow-hidden flex flex-col">
                  <canvas ref={cam1CanvasRef} width={320} height={180} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 text-[9px] font-bold text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    CAM 01: SATELLITE OPTICAL
                  </div>
                </div>
                <div className="w-full h-full rounded-xl bg-black border border-slate-800 relative overflow-hidden flex flex-col">
                  <canvas ref={cam2CanvasRef} width={320} height={180} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 text-[9px] font-bold text-rose-400 bg-slate-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                    CAM 02: DRONE FLIR THERMAL
                  </div>
                </div>
                <div className="w-full h-full rounded-xl bg-black border border-slate-800 relative overflow-hidden flex flex-col">
                  <canvas ref={cam3CanvasRef} width={320} height={180} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 text-[9px] font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    CAM 03: GROUND NVG RECON
                  </div>
                </div>
                <div className="w-full h-full rounded-xl bg-black border border-slate-800 relative overflow-hidden flex flex-col">
                  <canvas ref={cam4CanvasRef} width={320} height={180} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 text-[9px] font-bold text-red-400 bg-slate-950/80 px-2 py-0.5 rounded border border-red-500/30">
                    CAM 04: INFRARED SPECTRUM
                  </div>
                </div>

                <button
                  onClick={() => setMultiCamMode(false)}
                  className="absolute top-4 right-4 z-40 p-1.5 rounded-xl bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition-all flex items-center gap-1 text-[10px]"
                >
                  <X className="w-4 h-4" /> Close 4-Cam Grid
                </button>
              </div>
            )}

            {/* PiP Camera Surveillance Feed Monitor (Always available & interactive) */}
            {showPipFeed && !multiCamMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute ${pipExpanded ? 'inset-6 sm:inset-10 z-40' : 'top-4 right-4 z-30 w-56 sm:w-72'} rounded-2xl glass-card border border-cyan-500/50 bg-slate-950/95 shadow-2xl flex flex-col p-2.5 gap-2 overflow-hidden pointer-events-auto transition-all`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                    <span>SURVEILLANCE CAM ({pipCameraMode})</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={captureCameraSnapshot}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                      title="Take Surveillance Snapshot"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPipExpanded(!pipExpanded)}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                      title={pipExpanded ? "Minimize Cam" : "Maximize Cam"}
                    >
                      {pipExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setShowPipFeed(false)}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Mode Selector Tabs including WEBCAM */}
                <div className="flex items-center justify-between gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[8px] font-bold overflow-x-auto scrollbar-none">
                  {(['OPTICAL', 'FLIR', 'NVG', 'INFRARED', 'WEBCAM_GODSEYE'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPipCameraMode(mode);
                        if (mode === 'WEBCAM_GODSEYE' && !webcamActive) {
                          startWebcamStream();
                        }
                      }}
                      className={`flex-1 py-1 px-1 rounded uppercase transition-all whitespace-nowrap ${
                        pipCameraMode === mode ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'WEBCAM_GODSEYE' ? '📷 WEBCAM' : mode}
                    </button>
                  ))}
                </div>

                {/* God's Eye Webcam Dewarping & Top-Down Dewarp Controls */}
                {pipCameraMode === 'WEBCAM_GODSEYE' && (
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col gap-1.5 text-[9px]">
                    <div className="flex items-center justify-between font-bold text-cyan-400">
                      <span>FISHEYE DEWARP CORRECTION</span>
                      <span>{dewarpAmount}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dewarpAmount}
                      onChange={e => setDewarpAmount(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />

                    <div className="flex items-center justify-between font-bold text-pink-400">
                      <span>TOP-DOWN PITCH TILT</span>
                      <span>{topDownTilt}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={topDownTilt}
                      onChange={e => setTopDownTilt(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setShowRoomGrid(!showRoomGrid)}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-all ${
                          showRoomGrid ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {showRoomGrid ? "GRID: ON" : "GRID: OFF"}
                      </button>

                      <button
                        onClick={() => {
                          if (webcamActive) stopWebcamStream();
                          else startWebcamStream();
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-all ${
                          webcamActive ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        }`}
                      >
                        {webcamActive ? "STOP WEBCAM" : "START WEBCAM"}
                      </button>
                    </div>
                  </div>
                )}

                <div className={`w-full ${pipExpanded ? 'flex-1 min-h-[300px]' : 'h-36'} rounded-xl bg-black border border-slate-800 overflow-hidden relative`}>
                  <canvas ref={pipCanvasRef} width={320} height={180} className="w-full h-full object-cover" />
                </div>
              </motion.div>
            )}

            {/* Tactical Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-48 h-48 border border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
                <div className="absolute w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="absolute top-0 bottom-0 w-[1px] bg-cyan-500/30" />
                <div className="absolute left-0 right-0 h-[1px] bg-cyan-500/30" />
                <Crosshair className="w-12 h-12 text-cyan-400/50" />
              </div>
            </div>

            {/* Tactical HUD Header Info Overlay (Minimal in Clean UI) */}
            {hudLayout !== 'minimal' && !cleanUiMode && (
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-[10px] font-mono text-cyan-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> GOD'S EYE ORBITAL RECON
                </div>
                <div className="text-slate-300">LAT: {cameraCoords.lat}° | LNG: {cameraCoords.lng}°</div>
                <div className="text-slate-400">ALTITUDE: {cameraCoords.alt} KM | STYLE: {mapStyle}</div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    targetRotationRef.current = { x: 0.3, y: 0 };
                    targetCameraDistanceRef.current = 3.8;
                    setIsLockedOn(false);
                    setSelectedEntity(null);
                    playBeep(600, 0.1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center gap-1.5 transition-all text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>

                <button
                  onClick={() => setCleanUiMode(!cleanUiMode)}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all text-xs ${
                    cleanUiMode 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> {cleanUiMode ? 'Exit Clean UI' : 'Clean UI'}
                </button>

                {!showPipFeed && (
                  <button
                    onClick={() => setShowPipFeed(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" /> Open Cam
                  </button>
                )}

                {isLockedOn && (
                  <button
                    onClick={() => {
                      setIsLockedOn(false);
                      setSelectedEntity(null);
                      playBeep(500, 0.1);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> Unlock
                  </button>
                )}
              </div>

              <div className="text-[10px] text-slate-400 hidden sm:block">
                💡 Drag to Orbit | Scroll to Zoom | Click Marker to Lock On
              </div>
            </div>
          </div>

          {/* Logs stream in normal UI mode */}
          {!cleanUiMode && (
            <div className="p-3 sm:p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-950/70 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Terminal className="w-4 h-4" /> Live Recon Intel Telemetry Logs
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400 max-h-[80px] overflow-y-auto scrollbar-thin">
                {intelLogs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-cyan-400">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side (Hidden in Clean UI Mode) */}
        {!cleanUiMode && (
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Target Search Box */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Search className="w-4 h-4" /> Search Targets Mesh
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search callsign, satellite, quake..."
                  className="w-full px-3 py-2 pl-9 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Selected Target Recon Card */}
            <AnimatePresence mode="wait">
              {selectedEntity ? (
                <motion.div
                  key={selectedEntity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl glass-card border border-cyan-500/50 shadow-2xl flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="aurora-glow-pink top-0 right-0 -mr-16 -mt-16" />

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest">
                        TARGET RECON INTEL
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {selectedEntity.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedEntity(null)}
                      className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase">LATITUDE</span>
                      <span className="font-extrabold text-cyan-400">{selectedEntity.lat.toFixed(4)}°</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase">LONGITUDE</span>
                      <span className="font-extrabold text-cyan-400">{selectedEntity.lng.toFixed(4)}°</span>
                    </div>
                    {selectedEntity.speed && (
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase">VELOCITY</span>
                        <span className="font-extrabold text-amber-400">{selectedEntity.speed}</span>
                      </div>
                    )}
                    {selectedEntity.callsign && (
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase">CALLSIGN</span>
                        <span className="font-extrabold text-sky-400">{selectedEntity.callsign}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {selectedEntity.detail}
                  </div>

                  {selectedEntity.extraInfo && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-semibold">
                      {selectedEntity.extraInfo}
                    </div>
                  )}

                  <button
                    onClick={() => lockOnTarget(selectedEntity.lat, selectedEntity.lng, selectedEntity)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Lock className="w-4 h-4" /> RE-ENGAGE CAMERA LOCK
                  </button>
                </motion.div>
              ) : (
                <div className="p-5 rounded-2xl glass-card border border-slate-800/80 bg-slate-950/70 text-center flex flex-col items-center justify-center min-h-[180px] gap-2">
                  <Maximize2 className="w-8 h-8 text-slate-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400">NO TARGET SELECTED</span>
                  <span className="text-[10px] text-slate-500 max-w-[200px]">
                    Click any marker or badge on the 3D globe to lock on.
                  </span>
                </div>
              )}
            </AnimatePresence>

            {/* Live Targets Mesh List */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70 max-h-[300px] overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Live Targets Mesh</span>
                <span className="text-[10px] text-slate-500">{filteredEntitiesList.length} Targets</span>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin pr-1">
                {filteredEntitiesList.map(entity => (
                  <div
                    key={entity.id}
                    onClick={() => lockOnTarget(entity.lat, entity.lng, entity)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedEntity?.id === entity.id
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col max-w-[170px]">
                      <span className="font-semibold truncate">{entity.name}</span>
                      <span className="text-[9px] text-slate-500">{entity.lat.toFixed(2)}°, {entity.lng.toFixed(2)}°</span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      entity.type === 'satellite' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      entity.type === 'flight' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                      entity.type === 'earthquake' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      entity.type === 'fire' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {entity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
