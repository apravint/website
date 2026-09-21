"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, Globe, Eye, Flame, Plane, Ship, Activity, Satellite,
  Volume2, VolumeX, Crosshair, Search, Compass, ShieldAlert,
  Layers, Info, Lock, Maximize2, RotateCcw, Zap
} from 'lucide-react';

// Sensor Filter Modes
type SensorMode = 'OPTICAL' | 'FLIR' | 'NVG' | 'AMBER';

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

// Preset Locations for Tactical Jump
const TACTICAL_PRESETS = [
  { name: '🚀 ISS Orbit', lat: 28.5, lng: -80.6, alt: 420, type: 'satellite' as const },
  { name: '🛸 Area 51 (Groom Lake)', lat: 37.235, lng: -115.811, alt: 1.4, type: 'hotspot' as const },
  { name: '🏛️ Pentagon (Washington DC)', lat: 38.871, lng: -77.056, alt: 0.1, type: 'hotspot' as const },
  { name: '🌋 Ring of Fire (Japan Trench)', lat: 35.676, lng: 139.65, alt: 0, type: 'earthquake' as const },
  { name: '🇮🇳 Chennai Space Hub', lat: 13.0827, lng: 80.2707, alt: 0.2, type: 'hotspot' as const },
  { name: '🚢 Suez Maritime Passage', lat: 29.975, lng: 32.559, alt: 0.05, type: 'vessel' as const },
  { name: '✈️ Heathrow Flight Corridor', lat: 51.47, lng: -0.454, alt: 10, type: 'flight' as const },
];

export default function GodsEyeViewTab() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // HUD & UI States
  const [sensorMode, setSensorMode] = useState<SensorMode>('OPTICAL');
  const [activeCategory, setActiveCategory] = useState<IntelCategory>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<IntelEntity | null>(null);
  const [entities, setEntities] = useState<IntelEntity[]>([]);
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
        { id: 'sat-iss', name: 'ISS (ZARYA) Space Station', type: 'satellite', lat: 25.4, lng: -45.2, alt: 420, speed: '27,600 km/h', callsign: 'NORAD 25544', detail: 'International Space Station | Orbital Inclination 51.6°', extraInfo: 'Crew: 7 | Mass: 450 Tons | Period: 92.6 min' },
        { id: 'sat-hst', name: 'Hubble Space Telescope', type: 'satellite', lat: -12.1, lng: 110.5, alt: 535, speed: '27,300 km/h', callsign: 'NORAD 20580', detail: 'Low Earth Orbit Observatory | Spectral Imaging', extraInfo: 'Deep Field Reconnaissance Sensors Active' },
        { id: 'sat-st1', name: 'STARLINK-5402 Constellation', type: 'satellite', lat: 48.2, lng: 8.5, alt: 550, speed: '27,000 km/h', callsign: 'SL-5402', detail: 'Ku-Band Telemetry Satellite Mesh', extraInfo: 'Orbital Plane 34 | Active Relay Node' },
        { id: 'sat-landsat', name: 'LANDSAT-9 Multispectral', type: 'satellite', lat: 62.1, lng: -105.4, alt: 705, speed: '26,800 km/h', callsign: 'NORAD 49260', detail: 'Earth Observation Reconnaissance Satellite', extraInfo: 'SWIR / Thermal Infrared Sensor Array' },
      ];

      // Flights
      const flights: IntelEntity[] = [
        { id: 'fl-1', name: 'FLIGHT AI-101 (B788)', type: 'flight', lat: 28.5, lng: 77.1, alt: 11, heading: 270, speed: '890 km/h', callsign: 'AIC101', detail: 'Route: DEL -> LHR | Altitude: 36,000 ft', extraInfo: 'Boeing 787-8 Dreamliner | Transponder 4321' },
        { id: 'fl-2', name: 'FLIGHT BA-286 (A388)', type: 'flight', lat: 40.7, lng: -73.9, alt: 12, heading: 85, speed: '920 km/h', callsign: 'BAW286', detail: 'Route: JFK -> LHR | Transatlantic Track', extraInfo: 'Airbus A380-800 | Transponder 7612' },
        { id: 'fl-3', name: 'RECON DRONE AF-99', type: 'flight', lat: 36.5, lng: -115.1, alt: 18, heading: 140, speed: '450 km/h', callsign: 'NIGHTHAWK', detail: 'Nevada Test Range Reconnaissance Circuit', extraInfo: 'High Altitude FLIR Recon Payload' },
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

      // Add log entries
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

  // Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere radius R
  const latLngToVector3 = useCallback((lat: number, lng: number, radius: number, altOffset = 0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = radius + altOffset;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Helper: Create procedural Earth textures in Canvas so no external images are required
  const createEarthTextures = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ocean deep navy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#040b19');
    grad.addColorStop(0.5, '#071630');
    grad.addColorStop(1, '#030814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw continental outlines (procedural low-poly map representation)
    ctx.fillStyle = '#0f2d4a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;

    // Draw grid lines (lat/lng coordinates)
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

    // Procedural continents approximation dots & shapes
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    const continents = [
      // North America
      { x: 220, y: 140, r: 80 }, { x: 180, y: 180, r: 60 }, { x: 300, y: 150, r: 40 },
      // South America
      { x: 320, y: 320, r: 70 }, { x: 340, y: 380, r: 50 },
      // Eurasia / Europe / Asia
      { x: 550, y: 130, r: 90 }, { x: 700, y: 150, r: 120 }, { x: 800, y: 180, r: 100 }, { x: 600, y: 200, r: 70 },
      // Africa
      { x: 550, y: 280, r: 80 }, { x: 580, y: 340, r: 60 },
      // Australia
      { x: 840, y: 360, r: 55 },
      // Antarctica
      { x: 500, y: 490, r: 150 }
    ];

    continents.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Equator highlight line
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.8);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Clear existing canvas children
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff007f, 0.8);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere
    const sphereRadius = 1.6;
    const earthGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const earthTexture = createEarthTextures();

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.5,
      metalness: 0.2,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Atmosphere Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius * 1.05, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Outer Tactical Wireframe Radar Ring
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

    // Group for 3D Markers & Entities
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Group for Satellite Orbit Lines
    const orbitsGroup = new THREE.Group();
    globeGroup.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    // Create 3D Orbit rings for Satellites
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

    // Mouse Controls for 3D Orbit Drag & Zoom
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
      // Clamp vertical pitch rotation
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

    // Handle Window Resize
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

      // Auto rotation if not dragging and not locked on target
      if (!isDraggingRef.current && !isLockedOn) {
        targetRotationRef.current.y += 0.0012;
      }

      // Smooth interpolation (lerp) of rotation & zoom
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

      // Rotate Satellite Orbits group slowly
      if (orbitsGroupRef.current) {
        orbitsGroupRef.current.rotation.y += delta * 0.05;
      }

      // Animate pulsing 3D markers
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach(child => {
          if (child.userData.isPulse) {
            child.scale.x = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
            child.scale.y = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
            child.scale.z = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
          }
        });
      }

      // Calculate approximate Lat/Lng under center view
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
  }, [createEarthTextures, isLockedOn]);

  // Update 3D Entity Markers whenever entities or category filter changes
  useEffect(() => {
    if (!markersGroupRef.current) return;

    // Clear existing markers
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
        color = 0xfacc15; // Cyan / Gold
        size = 0.045;
      } else if (entity.type === 'flight') {
        color = 0x38bdf8; // Sky blue
        size = 0.038;
      } else if (entity.type === 'earthquake') {
        color = entity.magnitude && entity.magnitude >= 6.0 ? 0xff007f : 0xf97316; // Magenta or Orange
        size = 0.05 + (entity.magnitude ? entity.magnitude * 0.006 : 0);
      } else if (entity.type === 'fire') {
        color = 0xef4444; // Bright Red / Thermal
        size = 0.042;
      } else if (entity.type === 'vessel') {
        color = 0x10b981; // Emerald Green
        size = 0.038;
      }

      // Create core marker dot mesh
      const geom = new THREE.SphereGeometry(size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.userData = { entity, isPulse: true };

      // Outer pulse ring for high importance targets
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

  // Target Jump & Camera Lock-on Function
  const lockOnTarget = useCallback((targetLat: number, targetLng: number, entity?: IntelEntity) => {
    setIsLockedOn(true);
    playBeep(1200, 0.15, 'square');

    // Convert Target Lat/Lng into Sphere Rotations
    const targetX = targetLat * (Math.PI / 180);
    const targetY = -targetLng * (Math.PI / 180);

    targetRotationRef.current = { x: targetX, y: targetY };
    targetCameraDistanceRef.current = 2.6; // Zoom in close for satellite lock-on

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
    <div className="w-full max-w-[1700px] flex flex-col items-center gap-4 text-slate-100 font-mono select-none">
      
      {/* Classified Header Banner */}
      <div className="w-full glass-card p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-cyber-cyan/30 shadow-2xl relative overflow-hidden">
        <div className="aurora-glow-cyan top-0 left-0 -ml-20 -mt-20" />
        
        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan animate-pulse">
            <Eye className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold tracking-widest text-gradient">
                GOD'S EYE VIEW
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-widest">
                CLASSIFIED // TOP SECRET
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-semibold tracking-wider">
              REAL-TIME SPATIAL INTELLIGENCE & SATELLITE TELEMETRY SIMULATOR
            </span>
          </div>
        </div>

        {/* Tactical Status & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-4 z-10 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300 font-bold">{utcTime || 'UPLINK ACTIVE'}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBeep(900, 0.1);
            }}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled 
                ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title="Toggle Tactical Audio FX"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + HUD Command Center Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Side: Category Filters & Live Telemetry Feed */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Sensor Mode Switcher Card */}
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Sensor Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['OPTICAL', 'FLIR', 'NVG', 'AMBER'] as SensorMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setSensorMode(mode);
                    playBeep(1000, 0.08);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    sensorMode === mode
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-lg shadow-cyber-cyan/20'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode === 'OPTICAL' && '🌐 OPTICAL'}
                  {mode === 'FLIR' && '🔥 FLIR THERMAL'}
                  {mode === 'NVG' && '🟢 NVG NIGHT'}
                  {mode === 'AMBER' && '🟧 AMBER CRT'}
                </button>
              ))}
            </div>
          </div>

          {/* Intelligence Stream Categories */}
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              <span className="flex items-center gap-2"><Radar className="w-4 h-4" /> Intel Categories</span>
              <span className="text-[10px] text-zinc-500 font-mono">{filteredEntitiesList.length} Active</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'All Intel Feeds', icon: Globe, count: entities.length, color: 'text-white' },
                { id: 'satellites', label: 'Orbiting Satellites', icon: Satellite, count: entities.filter(e => e.type === 'satellite').length, color: 'text-amber-400' },
                { id: 'flights', label: 'Commercial Flights', icon: Plane, count: entities.filter(e => e.type === 'flight').length, color: 'text-sky-400' },
                { id: 'earthquakes', label: 'USGS Earthquakes', icon: Activity, count: earthquakeCount, color: 'text-rose-400' },
                { id: 'fires', label: 'Thermal Hotspots', icon: Flame, count: entities.filter(e => e.type === 'fire').length, color: 'text-orange-400' },
                { id: 'vessels', label: 'Maritime AIS Ships', icon: Ship, count: entities.filter(e => e.type === 'vessel').length, color: 'text-emerald-400' },
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
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border border-zinc-700 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump Hotspot Target Presets */}
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-cyber-pink uppercase tracking-wider">
              <Compass className="w-4 h-4" /> Hotspot Jump Targets
            </div>
            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
              {TACTICAL_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => lockOnTarget(preset.lat, preset.lng)}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-left transition-all text-zinc-300 hover:text-cyber-cyan"
                >
                  <span className="font-bold">{preset.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{preset.lat.toFixed(1)}°, {preset.lng.toFixed(1)}°</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center 3D Viewport + Reticle HUD (Spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Main 3D Canvas Box */}
          <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl glass-card border border-cyber-cyan/30 overflow-hidden shadow-2xl group">
            
            {/* 3D Mount Container */}
            <div
              ref={mountRef}
              onClick={handleCanvasClick}
              className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${getSensorModeStyle()}`}
            />

            {/* Tactical Crosshair Overlay in Center */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-48 h-48 border border-cyber-cyan/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="absolute w-2 h-2 bg-cyber-cyan/60 rounded-full" />
                <div className="absolute top-0 bottom-0 w-[1px] bg-cyber-cyan/30" />
                <div className="absolute left-0 right-0 h-[1px] bg-cyber-cyan/30" />
                <Crosshair className="w-12 h-12 text-cyber-cyan/40" />
              </div>
            </div>

            {/* Tactical HUD Header Info Overlay (Top Left) */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-[10px] font-mono text-cyber-cyan bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-cyber-cyan/30">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> SAT-EYE-9X RECON ORBIT
              </div>
              <div className="text-zinc-400">LAT: {cameraCoords.lat}° | LNG: {cameraCoords.lng}°</div>
              <div className="text-zinc-400">ALTITUDE: {cameraCoords.alt} KM | RESOLUTION: 0.15m/px</div>
            </div>

            {/* HUD Status Badge (Top Right) */}
            <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] text-zinc-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SENSOR: {sensorMode}</span>
            </div>

            {/* Bottom Floating View Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto bg-black/70 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    targetRotationRef.current = { x: 0.3, y: 0 };
                    targetCameraDistanceRef.current = 3.8;
                    setIsLockedOn(false);
                    setSelectedEntity(null);
                    playBeep(600, 0.1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset View
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

              <div className="text-[10px] text-zinc-400 hidden sm:block">
                💡 Drag to Orbit | Scroll to Zoom | Click Target to Lock On
              </div>
            </div>
          </div>

          {/* Intel Logs Stream Footer */}
          <div className="p-3 sm:p-4 rounded-2xl glass-card border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Live Recon Intel Telemetry Logs
            </div>
            <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-400 max-h-[80px] overflow-y-auto scrollbar-thin">
              {intelLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-cyber-cyan">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Entity Search & Selected Target Intel Detail */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Target Search Box */}
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              <Search className="w-4 h-4" /> Search Targets
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search callsign, satellite, quake..."
                className="w-full px-3 py-2 pl-9 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyber-cyan"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
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
                className="p-5 rounded-2xl glass-card border border-cyber-cyan/50 shadow-2xl flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="aurora-glow-pink top-0 right-0 -mr-16 -mt-16" />

                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-cyber-cyan tracking-widest">
                      TARGET RECON INTEL
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      {selectedEntity.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase">LATITUDE</span>
                    <span className="font-extrabold text-cyber-cyan">{selectedEntity.lat.toFixed(4)}°</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase">LONGITUDE</span>
                    <span className="font-extrabold text-cyber-cyan">{selectedEntity.lng.toFixed(4)}°</span>
                  </div>
                  {selectedEntity.speed && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase">VELOCITY</span>
                      <span className="font-extrabold text-amber-400">{selectedEntity.speed}</span>
                    </div>
                  )}
                  {selectedEntity.callsign && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase">CALLSIGN</span>
                      <span className="font-extrabold text-sky-400">{selectedEntity.callsign}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                  {selectedEntity.detail}
                </div>

                {selectedEntity.extraInfo && (
                  <div className="p-3 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs text-cyber-cyan font-bold">
                    {selectedEntity.extraInfo}
                  </div>
                )}

                <button
                  onClick={() => lockOnTarget(selectedEntity.lat, selectedEntity.lng, selectedEntity)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:opacity-90 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyber-cyan/20"
                >
                  <Lock className="w-4 h-4" /> RE-ENGAGE CAMERA LOCK
                </button>
              </motion.div>
            ) : (
              <div className="p-5 rounded-2xl glass-card border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[220px] gap-2">
                <Maximize2 className="w-8 h-8 text-zinc-600 animate-pulse" />
                <span className="text-xs font-bold text-zinc-400">NO TARGET SELECTED</span>
                <span className="text-[10px] text-zinc-500 max-w-[200px]">
                  Click any entity marker on the 3D globe or select from the live target list below.
                </span>
              </div>
            )}
          </AnimatePresence>

          {/* Live Targets List */}
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-3 border border-zinc-800 max-h-[320px] overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              <span className="flex items-center gap-2"><Info className="w-4 h-4" /> Live Target Mesh</span>
              <span className="text-[10px] text-zinc-500">{filteredEntitiesList.length} Targets</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin pr-1">
              {filteredEntitiesList.map(entity => (
                <div
                  key={entity.id}
                  onClick={() => lockOnTarget(entity.lat, entity.lng, entity)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedEntity?.id === entity.id
                      ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-lg'
                      : 'bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex flex-col max-w-[170px]">
                    <span className="font-bold truncate">{entity.name}</span>
                    <span className="text-[9px] text-zinc-500">{entity.lat.toFixed(2)}°, {entity.lng.toFixed(2)}°</span>
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

      </div>
    </div>
  );
}
