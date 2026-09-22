"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanEye, Orbit, Radar, Globe, Globe2, Eye, Flame, Plane, Ship, Activity, Satellite,
  Volume2, VolumeX, Crosshair, Search, Compass, ShieldAlert, Waves, Anchor, Radio,
  SlidersHorizontal, Layers, Info, Lock, Maximize2, RotateCcw, Zap, Target,
  EyeOff, Navigation, Share2, Check, Moon, Sun, Map, X, MapPin, LocateFixed,
  Terminal, Cpu, Grid, Aperture, Gauge, Sparkles
} from 'lucide-react';

// Sensor Filter Modes
type SensorMode = 'OPTICAL' | 'FLIR' | 'NVG' | 'AMBER';

// Map Imagery Modes
type MapStyleMode = 'SATELLITE' | 'NIGHT' | 'VECTOR';

// HUD Layout Types
type HudLayout = 'tactical' | 'operator' | 'minimal';

// Intelligence Category
type IntelCategory = 'all' | 'satellites' | 'flights' | 'earthquakes' | 'fires' | 'vessels';

// Intel Entity interface
interface IntelEntity {
  id: string;
  name: string;
  type: 'satellite' | 'flight' | 'earthquake' | 'fire' | 'vessel';
  lat: number;
  lng: number;
  alt: number; // in km or altitude scale
  heading?: number;
  speed?: string;
  callsign?: string;
  detail: string;
  extraInfo?: string;
  magnitude?: number; // for earthquakes
  frp?: number; // fire radiative power
  timestamp?: string;
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
  { name: '[SAT] ISS Orbit', lat: 28.5, lng: -80.6, alt: 420, type: 'satellite' as const },
  { name: '[MIL] Area 51 (Groom Lake)', lat: 37.235, lng: -115.811, alt: 1.4, type: 'hotspot' as const },
  { name: '[MIL] Pentagon (Washington DC)', lat: 38.871, lng: -77.056, alt: 0.1, type: 'hotspot' as const },
  { name: '[SEIS] Ring of Fire (Japan Trench)', lat: 35.676, lng: 139.65, alt: 0, type: 'earthquake' as const },
  { name: '[HUB] Chennai Space Hub', lat: 13.0827, lng: 80.2707, alt: 0.2, type: 'hotspot' as const },
  { name: '[CHOKE] Suez Maritime Passage', lat: 29.975, lng: 32.559, alt: 0.05, type: 'vessel' as const },
  { name: '[AIR] Heathrow Flight Corridor', lat: 51.47, lng: -0.454, alt: 10, type: 'flight' as const },
];

export default function GodsEyeViewTab() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // HUD & UI States
  const [sensorMode, setSensorMode] = useState<SensorMode>('OPTICAL');
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('SATELLITE');
  const [hudLayout, setHudLayout] = useState<HudLayout>('tactical');
  const [scopeEnabled, setScopeEnabled] = useState<boolean>(true);
  const [cockpitMode, setCockpitMode] = useState<boolean>(false);
  const [cleanUiMode, setCleanUiMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
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

  // Web Audio Context for Synthetic Tactical Sounds
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
      // Audio fallback silent
    }
  }, [soundEnabled]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const earthMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const orbitsGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.3, y: 0 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.3, y: 0 });
  const targetCameraDistanceRef = useRef<number>(3.8);
  const currentCameraDistanceRef = useRef<number>(3.8);
  const animationFrameIdRef = useRef<number | null>(null);

  // UTC Time update ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Copy Coordinates to Clipboard
  const copyCoordinatesToClipboard = () => {
    const text = `Lat: ${cameraCoords.lat}°, Lng: ${cameraCoords.lng}°, Alt: ${cameraCoords.alt}km`;
    navigator.clipboard.writeText(text);
    setToastMessage(`COORDINATES COPIED TO CLIPBOARD`);
    playBeep(1300, 0.15, 'square');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Live USGS Earthquake Data
  const fetchLiveEarthquakes = useCallback(async () => {
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      const quakes: IntelEntity[] = data.features.slice(0, 30).map((f: {
        id: string;
        properties: { title: string; mag: number; time: number; place: string };
        geometry: { coordinates: [number, number, number] };
      }) => ({
        id: `eq-${f.id}`,
        name: f.properties.title || `Magnitude ${f.properties.mag} Earthquake`,
        type: 'earthquake' as const,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        alt: Math.max(0, 10 - f.geometry.coordinates[2] * 0.1),
        magnitude: f.properties.mag,
        detail: `Location: ${f.properties.place} | Depth: ${f.geometry.coordinates[2]} km`,
        extraInfo: `USGS Event ID: ${f.id} | Recorded: ${new Date(f.properties.time).toLocaleTimeString()}`
      }));

      return quakes;
    } catch {
      // Fallback sample seismic events
      return [
        { id: 'eq-s1', name: 'M6.2 Seismic Event - Japan Trench', type: 'earthquake' as const, lat: 38.2, lng: 142.4, alt: 0, magnitude: 6.2, detail: 'Depth: 32 km | Pacific Plate Boundary', extraInfo: 'Tsunami Watch Advisory' },
        { id: 'eq-s2', name: 'M5.4 Seismic Anomaly - San Andreas Fault', type: 'earthquake' as const, lat: 35.5, lng: -119.8, alt: 0, magnitude: 5.4, detail: 'Depth: 12 km | Southern California Sector', extraInfo: 'Strike-slip Fault Movement' },
        { id: 'eq-s3', name: 'M4.8 Tremor - Mid-Atlantic Ridge', type: 'earthquake' as const, lat: 14.2, lng: -44.8, alt: 0, magnitude: 4.8, detail: 'Depth: 10 km | Oceanic Spreading Ridge', extraInfo: 'Divergent Plate Boundary' }
      ];
    }
  }, []);

  // Generate Real-Time Spatial Intelligence Feed
  useEffect(() => {
    let isMounted = true;

    const generateAllEntities = async () => {
      const quakes = await fetchLiveEarthquakes();
      if (!isMounted) return;

      setEarthquakeCount(quakes.length);

      // Satellites
      const sats: IntelEntity[] = [
        { id: 'sat-iss', name: 'ISS (ZARYA) Space Station', type: 'satellite', lat: 28.5, lng: -80.6, alt: 420, speed: '27,600 km/h', callsign: 'NORAD 25544', detail: 'International Space Station | Orbital Inclination 51.6°', extraInfo: 'Crew: 7 | Mass: 450 Tons | Period: 92.6 min' },
        { id: 'sat-hst', name: 'Hubble Space Telescope', type: 'satellite', lat: -12.1, lng: 110.5, alt: 535, speed: '27,300 km/h', callsign: 'NORAD 20580', detail: 'Low Earth Orbit Observatory | Spectral Imaging', extraInfo: 'Deep Field Reconnaissance Sensors Active' },
        { id: 'sat-st1', name: 'STARLINK-5402 Constellation', type: 'satellite', lat: 48.2, lng: 8.5, alt: 550, speed: '27,000 km/h', callsign: 'SL-5402', detail: 'Ku-Band Telemetry Satellite Mesh', extraInfo: 'Orbital Plane 34 | Active Relay Node' },
        { id: 'sat-landsat', name: 'LANDSAT-9 Multispectral', type: 'satellite', lat: 62.1, lng: -105.4, alt: 705, speed: '26,800 km/h', callsign: 'NORAD 49260', detail: 'Earth Observation Reconnaissance Satellite', extraInfo: 'SWIR / Thermal Infrared Sensor Array' },
      ];

      // Flights
      const flights: IntelEntity[] = [
        { id: 'fl-1', name: 'FLIGHT AI-101 (B788)', type: 'flight', lat: 28.5, lng: 77.1, alt: 11, heading: 270, speed: '890 km/h', callsign: 'AIC101', detail: 'Route: DEL -> LHR | Altitude: 36,000 ft', extraInfo: 'Boeing 787-8 Dreamliner | Transponder 4321' },
        { id: 'fl-2', name: 'FLIGHT BA-286 (A388)', type: 'flight', lat: 40.7, lng: -73.9, alt: 12, heading: 85, speed: '920 km/h', callsign: 'BAW286', detail: 'Route: JFK -> LHR | Transatlantic Track', extraInfo: 'Airbus A380-800 | Transponder 7612' },
        { id: 'fl-3', name: 'RECON DRONE AF-99', type: 'flight', lat: 37.235, lng: -115.811, alt: 18, heading: 140, speed: '450 km/h', callsign: 'NIGHTHAWK', detail: 'Nevada Test Range Reconnaissance Circuit', extraInfo: 'High Altitude FLIR Recon Payload' },
        { id: 'fl-4', name: 'FLIGHT SQ-322 (A359)', type: 'flight', lat: 1.3, lng: 103.9, alt: 10.5, heading: 310, speed: '880 km/h', callsign: 'SIA322', detail: 'Route: SIN -> LHR | Malacca Corridor Transit', extraInfo: 'Airbus A350-900 | Transponder 5204' },
      ];

      // Wildfires
      const fires: IntelEntity[] = [
        { id: 'fr-1', name: 'Thermal Anomaly #409 (Wildfire)', type: 'fire', lat: -15.4, lng: -55.2, alt: 0, frp: 184.2, detail: 'NASA FIRMS Detection | Amazon Basin Sector', extraInfo: 'Fire Radiative Power: 184.2 MW | High Intensity' },
        { id: 'fr-2', name: 'Thermal Anomaly #812 (Bushfire)', type: 'fire', lat: -33.8, lng: 150.8, alt: 0, frp: 96.5, detail: 'NASA FIRMS Thermal Scan | New South Wales', extraInfo: 'Fire Radiative Power: 96.5 MW | Active Hotspot' },
        { id: 'fr-3', name: 'Volcanic Thermal Anomaly', type: 'fire', lat: 19.4, lng: -155.2, alt: 0.5, frp: 310.0, detail: 'Kilauea Caldera Thermal Signature', extraInfo: 'Magmatic Lava Lake Infrared Emission' }
      ];

      // Marine Vessels
      const vessels: IntelEntity[] = [
        { id: 'vs-1', name: 'CONTAINER SHIP "EVER GIVEN"', type: 'vessel', lat: 29.9, lng: 32.5, alt: 0, heading: 340, speed: '14 knots', callsign: 'H3RC', detail: 'Suez Canal Convoy Position', extraInfo: 'Draft: 15.7m | MMSI 353136000' },
        { id: 'vs-2', name: 'VLCC TANKER "PACIFIC TITAN"', type: 'vessel', lat: 5.8, lng: 97.4, alt: 0, heading: 120, speed: '12 knots', callsign: 'V7AK9', detail: 'Strait of Malacca Eastbound Channel', extraInfo: 'Raw Crude Transit | AIS Class A' },
        { id: 'vs-3', name: 'NAVAL RECON VESSEL USNS-4', type: 'vessel', lat: 24.5, lng: 121.5, alt: 0, heading: 45, speed: '22 knots', callsign: 'NAV-9', detail: 'Taiwan Strait Hydrographic Survey', extraInfo: 'Multibeam Sonar & Array Active' }
      ];

      const combined = [...sats, ...flights, ...quakes, ...fires, ...vessels];
      setEntities(combined);

      setIntelLogs([
        `[${new Date().toLocaleTimeString()}] Live USGS Earthquake Telemetry Synced (${quakes.length} Events)`,
        `[${new Date().toLocaleTimeString()}] NORAD Orbital TLE Data Stream Online`,
        `[${new Date().toLocaleTimeString()}] Global ADS-B Flight Transponder Mesh Active`,
        `[${new Date().toLocaleTimeString()}] NASA FIRMS Thermal Sensor Uplink Connected`
      ]);
    };

    generateAllEntities();
    const refreshInterval = setInterval(generateAllEntities, 45000); // 45s sync
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [fetchLiveEarthquakes]);

  // Precise Cartesian Conversion matching Three.js Equirectangular UV texture mapping
  const latLngToVector3 = useCallback((lat: number, lng: number, radius: number, altOffset = 0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = radius + altOffset;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Helper: Create procedural Earth textures in Canvas as fallback
  const createEarthTextures = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#040b19');
    grad.addColorStop(0.5, '#071630');
    grad.addColorStop(1, '#030814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f2d4a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    const continents = [
      { x: 220, y: 140, r: 80 }, { x: 180, y: 180, r: 60 }, { x: 300, y: 150, r: 40 },
      { x: 320, y: 320, r: 70 }, { x: 340, y: 380, r: 50 },
      { x: 550, y: 130, r: 90 }, { x: 700, y: 150, r: 120 }, { x: 800, y: 180, r: 100 }, { x: 600, y: 200, r: 70 },
      { x: 550, y: 280, r: 80 }, { x: 580, y: 340, r: 60 },
      { x: 840, y: 360, r: 55 },
      { x: 500, y: 490, r: 150 }
    ];

    continents.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Map Imagery Style Switcher Function
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
    } else if (style === 'VECTOR') {
      if (earthMaterialRef.current) {
        earthMaterialRef.current.map = createEarthTextures();
        earthMaterialRef.current.needsUpdate = true;
      }
    }
  }, [createEarthTextures, playBeep]);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff007f, 0.8);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const sphereRadius = 1.6;
    const earthGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const earthTexture = createEarthTextures();

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.5,
      metalness: 0.2,
      wireframe: false,
    });
    earthMaterialRef.current = earthMaterial;

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Initial Satellite High-Res Map Texture load
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      (realTexture) => {
        earthMaterial.map = realTexture;
        earthMaterial.needsUpdate = true;
      }
    );

    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius * 1.05, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

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

    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const orbitsGroup = new THREE.Group();
    globeGroup.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

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
      targetCameraDistanceRef.current = Math.max(2.2, Math.min(7.0, targetCameraDistanceRef.current));
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

    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (!isDraggingRef.current && !isLockedOn) {
        targetRotationRef.current.y += 0.0012;
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
        orbitsGroupRef.current.rotation.y += delta * 0.05;
      }

      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach(child => {
          if (child.userData.isPulse) {
            child.scale.x = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
            child.scale.y = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
            child.scale.z = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
          }
        });
      }

      // Compute 2D Screen Overlay Tags for visible front-facing entities
      if (cameraRef.current && globeGroupRef.current && mountRef.current && entities.length > 0) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const overlays: ScreenOverlayTag[] = [];

        entities.slice(0, 12).forEach(ent => {
          const worldPos = latLngToVector3(ent.lat, ent.lng, 1.6, 0.04).applyMatrix4(globeGroupRef.current!.matrixWorld);
          
          const cameraPos = cameraRef.current!.position;
          const distToCenter = cameraPos.distanceTo(new THREE.Vector3(0, 0, 0));
          const distToMarker = cameraPos.distanceTo(worldPos);

          // Render tag if marker is on front hemisphere (closer to camera than sphere center)
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
  }, [createEarthTextures, isLockedOn, entities, latLngToVector3]);

  // Update 3D Entity Markers
  useEffect(() => {
    if (!markersGroupRef.current) return;

    while (markersGroupRef.current.children.length > 0) {
      const child = markersGroupRef.current.children[0];
      markersGroupRef.current.remove(child);
    }

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
    });
  }, [entities, activeCategory, latLngToVector3]);

  // Target Jump & Camera Lock-on Function with 100% Precise UV Latitude & Longitude Math
  const lockOnTarget = useCallback((targetLat: number, targetLng: number, entity?: IntelEntity) => {
    setIsLockedOn(true);
    playBeep(1200, 0.15, 'square');

    // Convert Target Lat/Lng into Sphere Rotations matching UV map coordinates
    const targetX = targetLat * (Math.PI / 180);
    const targetY = -targetLng * (Math.PI / 180);

    targetRotationRef.current = { x: targetX, y: targetY };
    targetCameraDistanceRef.current = 2.6;

    if (entity) {
      setSelectedEntity(entity);
      setIntelLogs(prev => [
        `[${new Date().toLocaleTimeString()}] SATELLITE TARGET LOCK: ${entity.name} (${entity.lat.toFixed(2)}°, ${entity.lng.toFixed(2)}°)`,
        ...prev.slice(0, 10)
      ]);
    }
  }, [playBeep]);

  // Handle Raycasting click on 3D Globe Markers
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
      default:
        return '';
    }
  };

  // Filter entities by Search Query & Category
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

      {/* Classified Header Banner (Hidden in Clean UI Mode) */}
      {!cleanUiMode && (
        <div className="w-full glass-card p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="aurora-glow-cyan top-0 left-0 -ml-20 -mt-20 opacity-30" />
          
          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ScanEye className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-widest text-slate-100">
                  GOD'S EYE VIEW <span className="text-cyan-400 font-normal">SIMULATOR</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
                  DEFENSE INTELLIGENCE FEED
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider">
                REAL-TIME SPATIAL RECONNAISSANCE & ORBITAL TELEMETRY
              </span>
            </div>
          </div>

          {/* Tactical Status & Audio Controls */}
          <div className="flex items-center gap-2 sm:gap-4 z-10 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-semibold">{utcTime || 'UPLINK ACTIVE'}</span>
            </div>

            <button
              onClick={copyCoordinatesToClipboard}
              className="p-2 rounded-xl border bg-slate-900 border-slate-800 hover:border-cyan-500 text-slate-300 transition-all flex items-center gap-1.5"
              title="Copy current telemetry coordinates"
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

      {/* Main 3D Viewport + HUD Command Center Layout */}
      <div className={`w-full grid ${cleanUiMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-4`}>
        
        {/* Left Side: Category Filters & Live Telemetry Feed */}
        {!cleanUiMode && (
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Map Imagery Style Switcher */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Globe2 className="w-4 h-4" /> Map Imagery Style
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

            {/* Sensor Mode Switcher Card */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Aperture className="w-4 h-4" /> Sensor Filter Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['OPTICAL', 'FLIR', 'NVG', 'AMBER'] as SensorMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSensorMode(mode);
                      playBeep(1000, 0.08);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      sensorMode === mode
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'OPTICAL' && 'OPTICAL'}
                    {mode === 'FLIR' && 'FLIR THERMAL'}
                    {mode === 'NVG' && 'NVG NIGHT'}
                    {mode === 'AMBER' && 'AMBER CRT'}
                  </button>
                ))}
              </div>
            </div>

            {/* HUD Layout & Viewport Toggles */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4" /> Viewport Controls
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setScopeEnabled(!scopeEnabled);
                    playBeep(850, 0.1);
                  }}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    scopeEnabled
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" /> Scope Mask
                </button>

                <button
                  onClick={() => {
                    setCockpitMode(!cockpitMode);
                    playBeep(1100, 0.12);
                  }}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    cockpitMode
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" /> Cockpit HUD
                </button>
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center justify-between gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {(['tactical', 'operator', 'minimal'] as HudLayout[]).map(lay => (
                  <button
                    key={lay}
                    onClick={() => setHudLayout(lay)}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                      hudLayout === lay ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lay}
                  </button>
                ))}
              </div>
            </div>

            {/* Intelligence Stream Categories */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Radio className="w-4 h-4 animate-pulse" /> Intel Categories</span>
                <span className="text-[10px] text-slate-500 font-mono">{filteredEntitiesList.length} Active</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'all', label: 'All Intel Feeds', icon: Orbit, count: entities.length, color: 'text-cyan-400' },
                  { id: 'satellites', label: 'Orbiting Satellites', icon: Satellite, count: entities.filter(e => e.type === 'satellite').length, color: 'text-amber-400' },
                  { id: 'flights', label: 'Commercial Flights', icon: Plane, count: entities.filter(e => e.type === 'flight').length, color: 'text-sky-400' },
                  { id: 'earthquakes', label: 'USGS Earthquakes', icon: Waves, count: earthquakeCount, color: 'text-rose-400' },
                  { id: 'fires', label: 'Thermal Hotspots', icon: Flame, count: entities.filter(e => e.type === 'fire').length, color: 'text-orange-400' },
                  { id: 'vessels', label: 'Maritime AIS Ships', icon: Anchor, count: entities.filter(e => e.type === 'vessel').length, color: 'text-emerald-400' },
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
                        isSelected
                          ? 'bg-slate-900 border border-slate-700 text-white shadow-md'
                          : 'text-slate-400 hover:text-white border border-transparent'
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

            {/* Quick Jump Hotspot Target Presets */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                <LocateFixed className="w-4 h-4" /> Hotspot Jump Targets
              </div>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                {TACTICAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => lockOnTarget(preset.lat, preset.lng)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-xs text-left transition-all text-slate-300 hover:text-cyan-400"
                  >
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{preset.lat.toFixed(1)}°, {preset.lng.toFixed(1)}°</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center 3D Viewport + HUD Command Center Layout */}
        <div className={`${cleanUiMode ? 'col-span-1' : 'lg:col-span-2'} flex flex-col gap-4`}>
          
          {/* Main 3D Canvas Box */}
          <div className={`relative w-full ${cleanUiMode ? 'h-[80vh]' : 'h-[520px] sm:h-[600px]'} rounded-3xl glass-card border border-cyan-500/30 overflow-hidden shadow-2xl group`}>
            
            {/* 3D Mount Container */}
            <div
              ref={mountRef}
              onClick={handleCanvasClick}
              className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${getSensorModeStyle()}`}
            />

            {/* Floating 2D Screen Overlay Target Badges */}
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

            {/* Scope / Viewfinder Aperture Vignette Overlay */}
            {scopeEnabled && (
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background: 'radial-gradient(circle at center, transparent 38%, rgba(2, 6, 23, 0.75) 65%, rgba(2, 6, 23, 0.96) 92%)'
                }}
              />
            )}

            {/* First-Person Aircraft Cockpit Visor HUD Overlay */}
            {cockpitMode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 font-mono text-cyan-400 text-[11px] select-none">
                <div className="absolute inset-y-12 left-16 flex flex-col justify-between text-cyan-400/60 font-bold border-l border-cyan-500/30 pl-2">
                  <span>+30°</span>
                  <span>+20°</span>
                  <span>+10°</span>
                  <span className="text-cyan-400 font-extrabold text-xs">00° LEVEL</span>
                  <span>-10°</span>
                  <span>-20°</span>
                  <span>-30°</span>
                </div>

                <div className="absolute inset-y-12 right-16 flex flex-col justify-between text-cyan-400/60 font-bold border-r border-cyan-500/30 pr-2 text-right">
                  <span>+30°</span>
                  <span>+20°</span>
                  <span>+10°</span>
                  <span className="text-cyan-400 font-extrabold text-xs">00° LEVEL</span>
                  <span>-10°</span>
                  <span>-20°</span>
                  <span>-30°</span>
                </div>

                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-start p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-slate-200">
                  <span className="text-[9px] text-cyan-400 uppercase font-bold">GROUND SPEED</span>
                  <span className="text-sm font-black text-amber-400">485 KTS</span>
                  <span className="text-[9px] text-slate-500">MACH 0.78</span>
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-slate-200">
                  <span className="text-[9px] text-cyan-400 uppercase font-bold">ALTITUDE</span>
                  <span className="text-sm font-black text-sky-400">36,000 FT</span>
                  <span className="text-[9px] text-slate-500">BARO 1013 HPA</span>
                </div>

                <div className="absolute inset-x-24 top-1/2 -translate-y-1/2 flex items-center justify-between">
                  <div className="w-16 h-[2px] bg-cyan-400/70" />
                  <span className="text-[10px] text-cyan-300 font-extrabold tracking-widest">[ HORIZON LEVEL ]</span>
                  <div className="w-16 h-[2px] bg-cyan-400/70" />
                </div>
              </div>
            )}

            {/* Tactical Crosshair Overlay in Center */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-48 h-48 border border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
                <div className="absolute w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="absolute top-0 bottom-0 w-[1px] bg-cyan-500/30" />
                <div className="absolute left-0 right-0 h-[1px] bg-cyan-500/30" />
                <Crosshair className="w-12 h-12 text-cyan-400/50" />
              </div>
            </div>

            {/* Tactical HUD Header Info Overlay */}
            {hudLayout !== 'minimal' && (
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-[10px] font-mono text-cyan-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> SAT-EYE-9X RECON ORBIT
                </div>
                <div className="text-slate-300">LAT: {cameraCoords.lat}° | LNG: {cameraCoords.lng}°</div>
                <div className="text-slate-400">ALTITUDE: {cameraCoords.alt} KM | STYLE: {mapStyle}</div>
              </div>
            )}

            {/* HUD Status Badge */}
            {hudLayout !== 'minimal' && (
              <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SENSOR: {sensorMode}</span>
              </div>
            )}

            {/* Bottom Floating Command Dock Controls */}
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
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center gap-1.5 transition-all"
                  title="Reset Camera View"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset View
                </button>

                <button
                  onClick={() => setCleanUiMode(!cleanUiMode)}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                    cleanUiMode 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                  title="Toggle Clean View mode"
                >
                  <EyeOff className="w-3.5 h-3.5" /> {cleanUiMode ? 'Exit Clean UI' : 'Clean UI'}
                </button>

                {isLockedOn && (
                  <button
                    onClick={() => {
                      setIsLockedOn(false);
                      setSelectedEntity(null);
                      playBeep(500, 0.1);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> Unlock Target
                  </button>
                )}
              </div>

              <div className="text-[10px] text-slate-400 hidden sm:block">
                💡 Drag to Orbit | Scroll to Zoom | Click Target Marker/Label to Lock On
              </div>
            </div>
          </div>

          {/* Intel Logs Stream Footer */}
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

        {/* Right Side: Entity Search & Selected Target Intel Detail */}
        {!cleanUiMode && (
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Target Search Box */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Search className="w-4 h-4" /> Search Targets & Jump
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

            {/* Selected Target Intel Inspection Modal Card */}
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
                <div className="p-5 rounded-2xl glass-card border border-slate-800/80 bg-slate-950/70 text-center flex flex-col items-center justify-center min-h-[200px] gap-2">
                  <Maximize2 className="w-8 h-8 text-slate-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400">NO TARGET SELECTED</span>
                  <span className="text-[10px] text-slate-500 max-w-[200px]">
                    Click any entity marker or label tag on the 3D globe to lock on.
                  </span>
                </div>
              )}
            </AnimatePresence>

            {/* Live Targets List */}
            <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-slate-800/80 bg-slate-950/70 max-h-[300px] overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Live Target Mesh</span>
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
