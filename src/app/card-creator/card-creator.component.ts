import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CanvasService } from './services/canvas.service';
import { HistoryService } from './services/history.service';
import { ExportService, ExportOptions } from './services/export.service';
import { CANVAS_SIZES } from './models/canvas-element.model';
import * as fabric from 'fabric';

@Component({
    selector: 'app-card-creator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './card-creator.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './card-creator.component.scss'
})
export class CardCreatorComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

    // State
    readonly activePanel = signal<'text' | 'image' | 'background' | 'templates' | null>('text');
    readonly showExportModal = signal(false);
    readonly showTemplatesModal = signal(false);
    readonly selectedSizeIndex = signal(0);
    readonly isLoading = signal(false);

    // Canvas sizes
    readonly canvasSizes = CANVAS_SIZES;
    readonly selectedSize = computed(() => this.canvasSizes[this.selectedSizeIndex()]);

    // Export options
    readonly exportFormat = signal<'png' | 'jpeg' | 'webp' | 'svg' | 'pdf'>('png');
    readonly exportQuality = signal<'low' | 'medium' | 'high' | 'max' | 'print'>('high');

    // Estimated size calculation
    getEstimatedSize(): string {
        const canvas = this.canvasService.getCanvas();
        if (!canvas) return 'Unknown';
        try {
            return this.exportService.estimateFileSize(canvas, {
                format: this.exportFormat(),
                quality: this.exportQuality()
            });
        } catch {
            return 'Unknown';
        }
    }

    // Text formatting state
    readonly selectedFont = signal('Noto Sans Tamil');
    readonly selectedFontSize = signal(48);
    readonly selectedTextColor = signal('#000000');
    readonly selectedTextAlign = signal<'left' | 'center' | 'right'>('center');
    readonly isBold = signal(false);
    readonly isItalic = signal(false);
    readonly fontWeight = signal(400); // Variable font weight: 100-900
    readonly selectedFontCategory = signal('all'); // Font category filter
    readonly isUnderline = signal(false);
    readonly isStrikethrough = signal(false);
    readonly letterSpacing = signal(0);
    readonly lineHeight = signal(1.16);
    readonly textShadowEnabled = signal(false);
    readonly textShadowX = signal(2);
    readonly textShadowY = signal(2);
    readonly textShadowBlur = signal(4);
    readonly textShadowColor = signal('#000000');
    readonly textStrokeColor = signal('#000000');
    readonly textStrokeWidth = signal(0);
    readonly textOpacity = signal(100);
    readonly textBackgroundColor = signal('');
    readonly textTransform = signal<'none' | 'uppercase' | 'lowercase' | 'capitalize'>('none');

    // Premium Font Library with Variable Font Support
    readonly fontCategories = [
        { id: 'tamil', name: 'தமிழ் Tamil', icon: '🏛️' },
        { id: 'modern', name: 'Modern Sans', icon: '✨' },
        { id: 'classic', name: 'Classic Serif', icon: '📚' },
        { id: 'display', name: 'Display', icon: '🎨' },
        { id: 'script', name: 'Script & Hand', icon: '✍️' },
    ];

    readonly fontLibrary: { name: string; category: string; variable: boolean; weights: string }[] = [
        // Tamil Fonts
        { name: 'Noto Sans Tamil', category: 'tamil', variable: true, weights: '100-900' },
        { name: 'Noto Serif Tamil', category: 'tamil', variable: true, weights: '100-900' },
        { name: 'Mukta Malar', category: 'tamil', variable: false, weights: '200-800' },
        { name: 'Catamaran', category: 'tamil', variable: false, weights: '100-900' },
        { name: 'Hind Madurai', category: 'tamil', variable: false, weights: '300-700' },
        { name: 'Meera Inimai', category: 'tamil', variable: false, weights: '400' },
        // Modern Sans (Variable)
        { name: 'Inter', category: 'modern', variable: true, weights: '100-900' },
        { name: 'Outfit', category: 'modern', variable: true, weights: '100-900' },
        { name: 'Plus Jakarta Sans', category: 'modern', variable: true, weights: '200-800' },
        { name: 'DM Sans', category: 'modern', variable: true, weights: '100-900' },
        { name: 'Space Grotesk', category: 'modern', variable: true, weights: '300-700' },
        { name: 'Manrope', category: 'modern', variable: true, weights: '200-800' },
        { name: 'Sora', category: 'modern', variable: true, weights: '100-800' },
        { name: 'Poppins', category: 'modern', variable: false, weights: '100-900' },
        { name: 'Roboto', category: 'modern', variable: false, weights: '100-900' },
        // Classic Serif
        { name: 'Playfair Display', category: 'classic', variable: true, weights: '400-900' },
        { name: 'Cormorant', category: 'classic', variable: true, weights: '300-700' },
        { name: 'Libre Baskerville', category: 'classic', variable: false, weights: '400-700' },
        { name: 'Lora', category: 'classic', variable: true, weights: '400-700' },
        { name: 'Merriweather', category: 'classic', variable: false, weights: '300-900' },
        // Display Fonts
        { name: 'Bebas Neue', category: 'display', variable: false, weights: '400' },
        { name: 'Oswald', category: 'display', variable: true, weights: '200-700' },
        { name: 'Anton', category: 'display', variable: false, weights: '400' },
        { name: 'Abril Fatface', category: 'display', variable: false, weights: '400' },
        { name: 'Righteous', category: 'display', variable: false, weights: '400' },
        // Script & Handwriting
        { name: 'Dancing Script', category: 'script', variable: true, weights: '400-700' },
        { name: 'Pacifico', category: 'script', variable: false, weights: '400' },
        { name: 'Caveat', category: 'script', variable: true, weights: '400-700' },
        { name: 'Satisfy', category: 'script', variable: false, weights: '400' },
        { name: 'Great Vibes', category: 'script', variable: false, weights: '400' },
    ];

    // Flat fonts array for backward compatibility
    readonly fonts = this.fontLibrary.map(f => f.name);

    // Premium Color Palettes (60+ designer colors)
    readonly colorPalettes = {
        monochrome: [
            '#000000', '#0a0a0a', '#171717', '#262626', '#404040',
            '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff'
        ],
        slate: [
            '#0f172a', '#1e293b', '#334155', '#475569', '#64748b',
            '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc'
        ],
        brand: [
            '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe',
            '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
        ],
        sunset: [
            '#dc2626', '#ea580c', '#f97316', '#fb923c', '#fdba74',
            '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef08a',
        ],
        ocean: [
            '#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8',
            '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4',
        ],
        rose: [
            '#881337', '#be123c', '#e11d48', '#f43f5e', '#fb7185',
            '#9d174d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4',
        ],
        forest: [
            '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e',
            '#365314', '#3f6212', '#4d7c0f', '#65a30d', '#84cc16',
        ]
    };

    // Flat colors array for quick access
    readonly colors = [
        // Monochrome
        '#000000', '#171717', '#404040', '#737373', '#d4d4d4', '#ffffff',
        // Blues & Purples
        '#0f172a', '#1e40af', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        // Warm
        '#dc2626', '#ea580c', '#f97316', '#eab308', '#fbbf24',
        // Cool
        '#0369a1', '#0ea5e9', '#14b8a6', '#10b981', '#22c55e',
        // Rose & Pink
        '#be123c', '#e11d48', '#ec4899', '#f472b6',
        // Premium
        '#1e1b4b', '#312e81', '#4338ca', '#0891b2', '#059669'
    ];

    // Premium Gradient Presets (40 designer gradients)
    readonly gradients = [
        // 🌅 Sunset & Sunrise
        ['#ff6b6b', '#feca57'],
        ['#ff9a9e', '#fecfef'],
        ['#f093fb', '#f5576c'],
        ['#ee0979', '#ff6a00'],
        ['#f12711', '#f5af19'],
        // 🌊 Ocean & Sky
        ['#667eea', '#764ba2'],
        ['#4facfe', '#00f2fe'],
        ['#0093E9', '#80D0C7'],
        ['#00c6ff', '#0072ff'],
        ['#48c6ef', '#6f86d6'],
        // 🌿 Nature & Earth
        ['#11998e', '#38ef7d'],
        ['#56ab2f', '#a8e063'],
        ['#134e5e', '#71b280'],
        ['#43e97b', '#38f9d7'],
        ['#96fbc4', '#f9f586'],
        // 💜 Purple Dreams
        ['#6a11cb', '#2575fc'],
        ['#a18cd1', '#fbc2eb'],
        ['#e0c3fc', '#8ec5fc'],
        ['#8360c3', '#2ebf91'],
        ['#cc2b5e', '#753a88'],
        // 🌙 Dark & Moody
        ['#0f0c29', '#302b63', '#24243e'],
        ['#232526', '#414345'],
        ['#1a1a2e', '#16213e', '#0f3460'],
        ['#000428', '#004e92'],
        ['#141e30', '#243b55'],
        // ✨ Luxury & Premium
        ['#c9d6ff', '#e2e2e2'],
        ['#f5f7fa', '#c3cfe2'],
        ['#ffecd2', '#fcb69f'],
        ['#d299c2', '#fef9d7'],
        ['#accbee', '#e7f0fd'],
        // 🔥 Bold & Vibrant
        ['#fc4a1a', '#f7b733'],
        ['#ff416c', '#ff4b2b'],
        ['#f857a6', '#ff5858'],
        ['#00b09b', '#96c93d'],
        ['#ed4264', '#ffedbc'],
        // 🎨 Artistic & Creative
        ['#ff758c', '#ff7eb3'],
        ['#7f7fd5', '#86a8e7', '#91eae4'],
        ['#a8edea', '#fed6e3'],
        ['#d558c8', '#24d292'],
        ['#74ebd5', '#acb6e5'],
    ];

    // Premium Texture Library (CSS patterns and gradients for backgrounds)
    readonly textureCategories = [
        { id: 'paper', name: 'Paper', icon: '📄' },
        { id: 'fabric', name: 'Fabric', icon: '🧵' },
        { id: 'geometric', name: 'Geometric', icon: '🔷' },
        { id: 'noise', name: 'Noise', icon: '📺' },
        { id: 'luxury', name: 'Luxury', icon: '✨' },
    ];

    readonly textures = [
        // Paper textures (CSS gradients simulating paper)
        { id: 'paper-cream', name: 'Cream Paper', category: 'paper', css: 'linear-gradient(135deg, #fef9ef 0%, #f5f0e3 100%)' },
        { id: 'paper-kraft', name: 'Kraft Paper', category: 'paper', css: 'linear-gradient(180deg, #c4a77d 0%, #b8956e 100%)' },
        { id: 'paper-recycled', name: 'Recycled', category: 'paper', css: 'linear-gradient(135deg, #e8e0d5 0%, #d4ccc0 50%, #e0d8cd 100%)' },
        { id: 'paper-white', name: 'Cotton White', category: 'paper', css: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)' },
        // Fabric textures
        { id: 'fabric-linen', name: 'Linen', category: 'fabric', css: 'linear-gradient(90deg, #f5f5dc 25%, #f0f0d0 50%, #f5f5dc 75%)' },
        { id: 'fabric-denim', name: 'Denim Blue', category: 'fabric', css: 'linear-gradient(145deg, #4a6fa5 0%, #3a5a89 100%)' },
        { id: 'fabric-velvet', name: 'Velvet Purple', category: 'fabric', css: 'linear-gradient(135deg, #4a1a6b 0%, #2d1042 100%)' },
        { id: 'fabric-silk', name: 'Silk Rose', category: 'fabric', css: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #fce4ec 100%)' },
        // Geometric patterns
        { id: 'geo-dots', name: 'Polka Dots', category: 'geometric', css: 'radial-gradient(circle, #000 1px, transparent 1px), linear-gradient(#f5f5f5, #f5f5f5)' },
        { id: 'geo-grid', name: 'Grid', category: 'geometric', css: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, #ffffff 1px)' },
        { id: 'geo-diagonal', name: 'Diagonal Lines', category: 'geometric', css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px), #ffffff' },
        { id: 'geo-hexagon', name: 'Hexagon Dark', category: 'geometric', css: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
        // Noise/grain textures
        { id: 'noise-light', name: 'Light Grain', category: 'noise', css: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)' },
        { id: 'noise-dark', name: 'Dark Grain', category: 'noise', css: 'linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%)' },
        { id: 'noise-warm', name: 'Warm Grain', category: 'noise', css: 'linear-gradient(135deg, #3d3024 0%, #2a2018 100%)' },
        { id: 'noise-cool', name: 'Cool Grain', category: 'noise', css: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)' },
        // Luxury textures
        { id: 'luxury-gold', name: 'Gold Shimmer', category: 'luxury', css: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)' },
        { id: 'luxury-silver', name: 'Silver Shine', category: 'luxury', css: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 25%, #a8a8a8 50%, #e0e0e0 75%, #b0b0b0 100%)' },
        { id: 'luxury-rose', name: 'Rose Gold', category: 'luxury', css: 'linear-gradient(135deg, #b76e79 0%, #ecc5c0 25%, #c78283 50%, #e8c4c4 75%, #b76e79 100%)' },
        { id: 'luxury-marble', name: 'Marble White', category: 'luxury', css: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 25%, #f0f0f0 50%, #e5e5e5 75%, #f8f8f8 100%)' },
        { id: 'luxury-onyx', name: 'Black Onyx', category: 'luxury', css: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #151515 75%, #0a0a0a 100%)' },
    ];

    // 3D Text Effect Presets
    readonly textEffectPresets = [
        { id: 'none', name: 'None', icon: '—' },
        { id: '3d-shadow', name: '3D Shadow', icon: '🎭', shadow: '3px 3px 0 #000, 6px 6px 0 rgba(0,0,0,0.3)' },
        { id: '3d-depth', name: 'Deep 3D', icon: '📦', shadow: '1px 1px 0 #333, 2px 2px 0 #333, 3px 3px 0 #333, 4px 4px 0 #333, 5px 5px 0 #333' },
        { id: 'neon-glow', name: 'Neon Glow', icon: '💡', shadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 40px #6366f1, 0 0 80px #6366f1' },
        { id: 'fire-glow', name: 'Fire Glow', icon: '🔥', shadow: '0 0 10px #ff6b35, 0 0 20px #f7c59f, 0 0 40px #ff6b35' },
        { id: 'retro', name: 'Retro Offset', icon: '📼', shadow: '4px 4px 0 #ec4899, -2px -2px 0 #22d3ee' },
        { id: 'emboss', name: 'Emboss', icon: '🏷️', shadow: '-1px -1px 0 rgba(255,255,255,0.5), 1px 1px 2px rgba(0,0,0,0.3)' },
        { id: 'outline', name: 'Bold Outline', icon: '⭕', shadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' },
        { id: 'long-shadow', name: 'Long Shadow', icon: '📐', shadow: '1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.1), 5px 5px 0 rgba(0,0,0,0.1), 6px 6px 0 rgba(0,0,0,0.1), 7px 7px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.1)' },
    ];

    // Shapes Library
    readonly shapeCategories = [
        { id: 'basic', name: 'Basic', icon: '⬜' },
        { id: 'arrows', name: 'Arrows', icon: '➡️' },
        { id: 'decorative', name: 'Decorative', icon: '✨' },
    ];

    readonly shapeLibrary = [
        // Basic shapes
        { id: 'rect', name: 'Rectangle', category: 'basic', icon: '⬜' },
        { id: 'circle', name: 'Circle', category: 'basic', icon: '⚪' },
        { id: 'ellipse', name: 'Ellipse', category: 'basic', icon: '⬭' },
        { id: 'triangle', name: 'Triangle', category: 'basic', icon: '🔺' },
        { id: 'diamond', name: 'Diamond', category: 'basic', icon: '🔷' },
        { id: 'line', name: 'Line', category: 'basic', icon: '➖' },
        // Arrows
        { id: 'arrow', name: 'Arrow', category: 'arrows', icon: '➡️' },
        { id: 'arrow-up', name: 'Arrow Up', category: 'arrows', icon: '⬆️' },
        { id: 'arrow-down', name: 'Arrow Down', category: 'arrows', icon: '⬇️' },
        // Decorative
        { id: 'star', name: 'Star', category: 'decorative', icon: '⭐' },
        { id: 'heart', name: 'Heart', category: 'decorative', icon: '❤️' },
        { id: 'badge', name: 'Badge', category: 'decorative', icon: '🏷️' },
    ];

    // Border/Frame Presets
    readonly borderPresets = [
        { id: 'none', name: 'None', width: 0, style: 'none', color: 'transparent' },
        { id: 'thin-black', name: 'Thin Black', width: 2, style: 'solid', color: '#000000' },
        { id: 'thin-white', name: 'Thin White', width: 2, style: 'solid', color: '#ffffff' },
        { id: 'medium-black', name: 'Medium Black', width: 6, style: 'solid', color: '#000000' },
        { id: 'medium-white', name: 'Medium White', width: 6, style: 'solid', color: '#ffffff' },
        { id: 'thick-black', name: 'Thick Black', width: 12, style: 'solid', color: '#000000' },
        { id: 'thick-white', name: 'Thick White', width: 12, style: 'solid', color: '#ffffff' },
        { id: 'double-black', name: 'Double Line', width: 6, style: 'double', color: '#000000' },
        { id: 'dashed', name: 'Dashed', width: 4, style: 'dashed', color: '#000000' },
        { id: 'dotted', name: 'Dotted', width: 4, style: 'dotted', color: '#000000' },
        { id: 'gold-frame', name: 'Gold Frame', width: 8, style: 'solid', color: '#d4a574' },
        { id: 'gradient-frame', name: 'Purple Gradient', width: 8, style: 'solid', color: '#6366f1' },
    ];

    // Magic Resize Size Categories
    readonly sizeCategories = [
        { id: 'social-square', name: 'Social (Square)', icon: '⬜' },
        { id: 'social-story', name: 'Social (Story)', icon: '📱' },
        { id: 'social-wide', name: 'Social (Wide)', icon: '🖼️' },
        { id: 'business', name: 'Business Cards', icon: '💳' },
        { id: 'print', name: 'Print', icon: '🖨️' },
        { id: 'digital', name: 'Digital', icon: '💻' },
    ];

    // Enterprise Templates (35+ organized by category)
    readonly templateCategories = [
        { id: 'blank', name: 'Blank', icon: '📄' },
        { id: 'quotes', name: 'Quotes', icon: '💬' },
        { id: 'poems', name: 'Poems', icon: '📜' },
        { id: 'motivational', name: 'Motivation', icon: '🔥' },
        { id: 'aesthetic', name: 'Aesthetic', icon: '🎨' },
        { id: 'festivals', name: 'Festivals', icon: '🎉' },
        { id: 'social', name: 'Social', icon: '📱' },
        { id: 'business', name: 'Business', icon: '💼' },
    ];

    readonly templates = [
        // === BLANK ===
        { id: 'blank', name: 'Clean White', category: 'blank', icon: '⬜' },
        { id: 'blank-dark', name: 'Dark Mode', category: 'blank', icon: '⬛' },
        { id: 'blank-gradient', name: 'Purple Dream', category: 'blank', icon: '💜' },
        { id: 'blank-sunset', name: 'Sunset Glow', category: 'blank', icon: '🌅' },
        { id: 'blank-ocean', name: 'Ocean Depth', category: 'blank', icon: '🌊' },

        // === QUOTES ===
        { id: 'quote-minimal', name: 'Minimal Dark', category: 'quotes', icon: '✨' },
        { id: 'quote-elegant', name: 'Elegant Purple', category: 'quotes', icon: '💎' },
        { id: 'quote-bold', name: 'Bold Impact', category: 'quotes', icon: '💪' },
        { id: 'quote-glass', name: 'Glass Card', category: 'quotes', icon: '🪟' },
        { id: 'quote-neon', name: 'Neon Glow', category: 'quotes', icon: '⚡' },
        { id: 'quote-love', name: 'Love Quote', category: 'quotes', icon: '❤️' },

        // === POEMS ===
        { id: 'poem-classic', name: 'Classic Parchment', category: 'poems', icon: '📜' },
        { id: 'poem-modern', name: 'Modern Minimal', category: 'poems', icon: '✍️' },
        { id: 'poem-tamil', name: 'சென்தமிழ் Classical', category: 'poems', icon: '🏛️' },
        { id: 'poem-nature', name: 'Nature Inspired', category: 'poems', icon: '🌿' },
        { id: 'poem-night', name: 'Starry Night', category: 'poems', icon: '🌙' },

        // === MOTIVATIONAL ===
        { id: 'motive-fire', name: 'On Fire', category: 'motivational', icon: '🔥' },
        { id: 'motive-success', name: 'Success Path', category: 'motivational', icon: '🚀' },
        { id: 'motive-strength', name: 'Inner Strength', category: 'motivational', icon: '💪' },
        { id: 'motive-dream', name: 'Dream Big', category: 'motivational', icon: '✨' },
        { id: 'motive-focus', name: 'Stay Focused', category: 'motivational', icon: '🎯' },

        // === AESTHETIC ===
        { id: 'aesthetic-pastel', name: 'Pastel Dreams', category: 'aesthetic', icon: '🎀' },
        { id: 'aesthetic-retrowave', name: 'Retrowave', category: 'aesthetic', icon: '🌆' },
        { id: 'aesthetic-minimal', name: 'Clean Minimal', category: 'aesthetic', icon: '⚪' },
        { id: 'aesthetic-gradient', name: 'Mesh Gradient', category: 'aesthetic', icon: '🎨' },
        { id: 'aesthetic-dark', name: 'Dark Academia', category: 'aesthetic', icon: '📚' },

        // === FESTIVALS ===
        { id: 'pongal', name: 'Pongal Wishes', category: 'festivals', icon: '🌾' },
        { id: 'diwali', name: 'Diwali Lights', category: 'festivals', icon: '🪔' },
        { id: 'newyear-tamil', name: 'தமிழ் புத்தாண்டு', category: 'festivals', icon: '🎊' },
        { id: 'newyear', name: 'New Year 2026', category: 'festivals', icon: '🎆' },
        { id: 'christmas', name: 'Merry Christmas', category: 'festivals', icon: '🎄' },
        { id: 'birthday', name: 'Birthday Bash', category: 'festivals', icon: '🎂' },
        { id: 'wedding', name: 'Wedding Bliss', category: 'festivals', icon: '💒' },

        // === SOCIAL MEDIA ===
        { id: 'instagram', name: 'Instagram Post', category: 'social', icon: '📸' },
        { id: 'instagram-story', name: 'Insta Story', category: 'social', icon: '📱' },
        { id: 'whatsapp', name: 'WhatsApp Status', category: 'social', icon: '💬' },
        { id: 'youtube', name: 'YouTube Thumb', category: 'social', icon: '▶️' },
        { id: 'twitter', name: 'X / Twitter', category: 'social', icon: '🐦' },

        // === BUSINESS ===
        { id: 'announcement', name: 'Announcement', category: 'business', icon: '📢' },
        { id: 'sale', name: 'Flash Sale', category: 'business', icon: '🏷️' },
        { id: 'thankyou', name: 'Thank You Card', category: 'business', icon: '🙏' },
        { id: 'invitation', name: 'Event Invite', category: 'business', icon: '📩' },
        { id: 'launch', name: 'Product Launch', category: 'business', icon: '🚀' },
    ];

    constructor(
        public canvasService: CanvasService,
        public historyService: HistoryService,
        private exportService: ExportService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Load Google Fonts
        this.loadGoogleFonts();
    }

    ngAfterViewInit(): void {
        this.initializeCanvas();
        this.checkQueryParameters();
    }

    private checkQueryParameters(): void {
        this.route.queryParams.subscribe(params => {
            const poemText = params['text'];
            if (poemText) {
                setTimeout(() => {
                    const canvas = this.canvasService.getCanvas();
                    if (canvas) {
                        this.canvasService.addText({
                            text: poemText,
                            fontSize: 32,
                            fontFamily: 'Noto Serif Tamil',
                            textAlign: 'center',
                            left: this.canvasService.canvasWidth() / 2,
                            top: this.canvasService.canvasHeight() / 2,
                        });
                        this.saveHistory();
                    }
                }, 500);
            }
        });
    }

    ngOnDestroy(): void {
        this.canvasService.dispose();
    }

    private loadGoogleFonts(): void {
        // CSS2 API requires separate family= parameters for each font
        const fontParams = this.fonts
            .map(font => `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700`)
            .join('&');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    private initializeCanvas(): void {
        if (!this.canvasElement?.nativeElement || !this.canvasContainer?.nativeElement) return;

        const container = this.canvasContainer.nativeElement;
        this.canvasService.setCanvasSize(this.selectedSize().width, this.selectedSize().height);
        const canvas = this.canvasService.initCanvas(
            this.canvasElement.nativeElement,
            container.clientWidth,
            container.clientHeight
        );

        // Listen to selection changes to update text formatting UI
        canvas.on('selection:created', () => this.updateTextPropertiesFromSelection());
        canvas.on('selection:updated', () => this.updateTextPropertiesFromSelection());

        // Save initial state
        this.saveHistory();
    }

    @HostListener('window:resize')
    onResize(): void {
        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
                case 'd':
                    event.preventDefault();
                    this.duplicateSelected();
                    break;
            }
        }

        if (event.key === 'Delete' || event.key === 'Backspace') {
            // Only delete if not editing text
            const canvas = this.canvasService.getCanvas();
            const active = canvas?.getActiveObject();
            if (active && !(active as any).isEditing) {
                event.preventDefault();
                this.deleteSelected();
            }
        }
    }

    // Panel actions
    setActivePanel(panel: 'text' | 'image' | 'background' | 'templates'): void {
        this.activePanel.set(this.activePanel() === panel ? null : panel);
    }

    // Canvas size
    onSizeChange(index: number): void {
        this.selectedSizeIndex.set(index);
        const size = this.canvasSizes[index];
        this.canvasService.setCanvasSize(size.width, size.height);

        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }

        this.saveHistory();
    }

    // Text actions
    addHeading(): void {
        this.canvasService.addHeading();
        this.saveHistory();
    }

    addSubheading(): void {
        this.canvasService.addSubheading();
        this.saveHistory();
    }

    addBodyText(): void {
        this.canvasService.addBodyText();
        this.saveHistory();
    }

    // Text formatting methods
    setTextFont(font: string): void {
        this.selectedFont.set(font);
        this.canvasService.updateSelectedText({ fontFamily: font });
        this.saveHistory();
    }

    setTextSize(size: number): void {
        this.selectedFontSize.set(size);
        this.canvasService.updateSelectedText({ fontSize: size });
        this.saveHistory();
    }

    setTextColor(color: string): void {
        this.selectedTextColor.set(color);
        this.canvasService.updateSelectedText({ fill: color });
        this.saveHistory();
    }

    setTextAlign(align: 'left' | 'center' | 'right'): void {
        this.selectedTextAlign.set(align);
        this.canvasService.updateSelectedText({ textAlign: align });
        this.saveHistory();
    }

    toggleBold(): void {
        const newBold = !this.isBold();
        this.isBold.set(newBold);
        this.canvasService.updateSelectedText({ fontWeight: newBold ? 'bold' : 'normal' });
        this.saveHistory();
    }

    toggleItalic(): void {
        const newItalic = !this.isItalic();
        this.isItalic.set(newItalic);
        this.canvasService.updateSelectedText({ fontStyle: newItalic ? 'italic' : 'normal' });
        this.saveHistory();
    }

    // Variable font weight (100-900)
    setFontWeight(weight: number): void {
        this.fontWeight.set(weight);
        this.canvasService.updateSelectedText({ fontWeight: weight });
        this.saveHistory();
    }

    // Get filtered fonts by category
    getFilteredFonts(): { name: string; category: string; variable: boolean; weights: string }[] {
        const category = this.selectedFontCategory();
        if (category === 'all') return this.fontLibrary;
        return this.fontLibrary.filter(f => f.category === category);
    }

    toggleUnderline(): void {
        const newUnderline = !this.isUnderline();
        this.isUnderline.set(newUnderline);
        this.canvasService.updateSelectedText({ underline: newUnderline });
        this.saveHistory();
    }

    toggleStrikethrough(): void {
        const newStrikethrough = !this.isStrikethrough();
        this.isStrikethrough.set(newStrikethrough);
        this.canvasService.updateSelectedText({ linethrough: newStrikethrough });
        this.saveHistory();
    }

    setLetterSpacing(spacing: number): void {
        this.letterSpacing.set(spacing);
        // Fabric.js charSpacing is in 1/1000 of em
        this.canvasService.updateSelectedText({ charSpacing: spacing * 10 });
        this.saveHistory();
    }

    setLineHeight(height: number): void {
        this.lineHeight.set(height);
        this.canvasService.updateSelectedText({ lineHeight: height });
        this.saveHistory();
    }

    updateTextShadow(): void {
        if (this.textShadowEnabled()) {
            const shadow = new fabric.Shadow({
                offsetX: this.textShadowX(),
                offsetY: this.textShadowY(),
                blur: this.textShadowBlur(),
                color: this.textShadowColor()
            });
            this.canvasService.updateSelectedText({ shadow });
        } else {
            this.canvasService.updateSelectedText({ shadow: null });
        }
        this.saveHistory();
    }

    toggleTextShadow(): void {
        this.textShadowEnabled.set(!this.textShadowEnabled());
        this.updateTextShadow();
    }

    setTextShadowX(value: number): void {
        this.textShadowX.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowY(value: number): void {
        this.textShadowY.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowBlur(value: number): void {
        this.textShadowBlur.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowColor(color: string): void {
        this.textShadowColor.set(color);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    // Apply 3D text effect preset
    applyTextEffectPreset(presetId: string): void {
        const preset = this.textEffectPresets.find(p => p.id === presetId);
        if (!preset) return;

        if (presetId === 'none') {
            // Remove shadow
            this.textShadowEnabled.set(false);
            this.canvasService.updateSelectedText({ shadow: null });
        } else if (preset.shadow) {
            // Parse shadow string and apply - using first shadow for Fabric.js
            const shadows = preset.shadow.split(',').map(s => s.trim());
            if (shadows.length > 0) {
                const parts = shadows[0].match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px?\s*(.*)/);
                if (parts) {
                    this.textShadowEnabled.set(true);
                    this.textShadowX.set(parseInt(parts[1]) || 0);
                    this.textShadowY.set(parseInt(parts[2]) || 0);
                    this.textShadowBlur.set(parseInt(parts[3]) || 0);
                    this.textShadowColor.set(parts[4] || '#000000');
                    this.updateTextShadow();
                }
            }
        }
        this.saveHistory();
    }

    setTextStroke(width: number, color?: string): void {
        this.textStrokeWidth.set(width);
        if (color) this.textStrokeColor.set(color);
        this.canvasService.updateSelectedText({
            stroke: this.textStrokeColor(),
            strokeWidth: width
        });
        this.saveHistory();
    }

    setTextStrokeColor(color: string): void {
        this.textStrokeColor.set(color);
        if (this.textStrokeWidth() > 0) {
            this.canvasService.updateSelectedText({ stroke: color });
            this.saveHistory();
        }
    }

    setTextOpacity(opacity: number): void {
        this.textOpacity.set(opacity);
        this.canvasService.updateSelectedText({ opacity: opacity / 100 });
        this.saveHistory();
    }

    setTextBackgroundColor(color: string): void {
        this.textBackgroundColor.set(color);
        this.canvasService.updateSelectedText({ textBackgroundColor: color || '' });
        this.saveHistory();
    }

    clearTextBackground(): void {
        this.textBackgroundColor.set('');
        this.canvasService.updateSelectedText({ textBackgroundColor: '' });
        this.saveHistory();
    }

    applyTextTransform(transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'): void {
        this.textTransform.set(transform);
        const activeObject = this.canvasService.getCanvas()?.getActiveObject();
        if (activeObject && 'text' in activeObject) {
            const currentText = (activeObject as any).text as string;
            let newText = currentText;

            switch (transform) {
                case 'uppercase':
                    newText = currentText.toUpperCase();
                    break;
                case 'lowercase':
                    newText = currentText.toLowerCase();
                    break;
                case 'capitalize':
                    newText = currentText.replace(/\b\w/g, char => char.toUpperCase());
                    break;
                case 'none':
                    // Keep as is
                    break;
            }

            if (newText !== currentText) {
                this.canvasService.updateSelectedText({ text: newText });
                this.saveHistory();
            }
        }
    }

    updateTextPropertiesFromSelection(): void {
        const props = this.canvasService.getSelectedTextProperties();
        if (props) {
            this.selectedFont.set(props.fontFamily);
            this.selectedFontSize.set(props.fontSize);
            this.selectedTextColor.set(props.fill);
            this.selectedTextAlign.set(props.textAlign as 'left' | 'center' | 'right');
            this.isBold.set(props.fontWeight === 'bold' || props.fontWeight === '700');
            this.isItalic.set(props.fontStyle === 'italic');

            // Advanced properties
            this.isUnderline.set(props.underline);
            this.isStrikethrough.set(props.linethrough);
            this.letterSpacing.set(props.charSpacing / 10); // Convert from fabric's 1/1000 em
            this.lineHeight.set(props.lineHeight);
            this.textStrokeWidth.set(props.strokeWidth);
            this.textStrokeColor.set(props.stroke || '#000000');
            this.textOpacity.set(Math.round(props.opacity * 100));
            this.textBackgroundColor.set(props.textBackgroundColor);

            // Parse shadow
            if (props.shadow) {
                const [x, y, blur, color] = props.shadow.split(',');
                this.textShadowEnabled.set(true);
                this.textShadowX.set(parseFloat(x) || 2);
                this.textShadowY.set(parseFloat(y) || 2);
                this.textShadowBlur.set(parseFloat(blur) || 4);
                this.textShadowColor.set(color || '#000000');
            } else {
                this.textShadowEnabled.set(false);
            }
        }
    }

    // Image actions
    onImageUpload(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                this.canvasService.addImage(url).then(() => {
                    this.saveHistory();
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Background actions
    setBackgroundColor(color: string): void {
        this.canvasService.setBackgroundColor(color);
        this.saveHistory();
    }

    setBackgroundGradient(colors: string[]): void {
        this.canvasService.setBackgroundGradient(colors);
        this.saveHistory();
    }

    // Object manipulation
    deleteSelected(): void {
        this.canvasService.deleteSelected();
        this.saveHistory();
    }

    duplicateSelected(): void {
        this.canvasService.duplicateSelected();
        this.saveHistory();
    }

    bringForward(): void {
        this.canvasService.bringForward();
        this.saveHistory();
    }

    sendBackward(): void {
        this.canvasService.sendBackward();
        this.saveHistory();
    }

    // Zoom
    zoomIn(): void {
        this.canvasService.zoomIn();
    }

    zoomOut(): void {
        this.canvasService.zoomOut();
    }

    fitToScreen(): void {
        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }
    }

    // History
    private saveHistory(): void {
        const json = this.canvasService.toJSON();
        this.historyService.pushState(json);
    }

    undo(): void {
        const state = this.historyService.undo();
        if (state) {
            this.canvasService.loadFromJSON(state);
        }
    }

    redo(): void {
        const state = this.historyService.redo();
        if (state) {
            this.canvasService.loadFromJSON(state);
        }
    }

    // Export
    openExportModal(): void {
        this.showExportModal.set(true);
    }

    closeExportModal(): void {
        this.showExportModal.set(false);
    }

    async exportImage(): Promise<void> {
        const canvas = this.canvasService.getCanvas();
        if (!canvas) return;

        this.isLoading.set(true);

        try {
            const filename = `card-${Date.now()}`;
            
            if (this.exportQuality() === 'print' && this.exportFormat() === 'png') {
                await this.exportService.downloadPrintReady(canvas, filename);
            } else {
                const options: ExportOptions = {
                    format: this.exportFormat(),
                    quality: this.exportQuality()
                };
                await this.exportService.downloadImage(canvas, filename, options);
            }
            this.closeExportModal();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    // Templates
    applyTemplate(templateId: string): void {
        this.canvasService.clear();

        switch (templateId) {
            // === BLANK ===
            case 'blank':
                this.canvasService.setBackgroundColor('#ffffff');
                break;
            case 'blank-dark':
                this.canvasService.setBackgroundColor('#0f172a');
                break;
            case 'blank-gradient':
                this.canvasService.setBackgroundGradient(['#667eea', '#764ba2']);
                break;
            case 'blank-sunset':
                this.canvasService.setBackgroundGradient(['#f97316', '#ec4899']);
                break;
            case 'blank-ocean':
                this.canvasService.setBackgroundGradient(['#0891b2', '#1e3a8a']);
                break;

            // === QUOTES ===
            case 'quote-minimal':
                this.canvasService.setBackgroundColor('#0f172a');
                this.canvasService.addText({ text: '"', fill: '#6366f1', fontSize: 200, fontFamily: 'Playfair Display', top: 80, opacity: 0.3 });
                this.canvasService.addText({ text: 'உங்கள் மேற்கோள் இங்கே', fill: '#f1f5f9', fontSize: 48, fontFamily: 'Noto Serif Tamil', textAlign: 'center' } as any);
                this.canvasService.addText({ text: '— ஆசிரியர்', fill: '#64748b', fontSize: 24, fontFamily: 'Noto Sans Tamil', top: 520 });
                break;
            case 'quote-elegant':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#7c3aed']);
                this.canvasService.addText({ text: '✦', fill: '#fbbf24', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: '"வாழ்க்கை அழகானது"', fill: '#ffffff', fontSize: 52, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: '— ஆசிரியர் பெயர்', fill: '#c7d2fe', fontSize: 24, top: 520 });
                break;
            case 'quote-bold':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: 'தைரியமாக', fill: '#fbbf24', fontSize: 80, fontFamily: 'Noto Sans Tamil', fontWeight: 'bold', top: 250 } as any);
                this.canvasService.addText({ text: 'இரு', fill: '#ffffff', fontSize: 80, fontFamily: 'Noto Sans Tamil', fontWeight: 'bold', top: 360 } as any);
                break;
            case 'quote-glass':
                this.canvasService.setBackgroundGradient(['#6366f1', '#a855f7']);
                this.canvasService.addText({ text: '"உங்கள் கனவை நோக்கி"', fill: '#ffffff', fontSize: 44, fontFamily: 'Noto Serif Tamil' } as any);
                break;
            case 'quote-neon':
                this.canvasService.setBackgroundColor('#0a0a0a');
                this.canvasService.addText({ text: 'DREAM', fill: '#22d3ee', fontSize: 90, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'BIG', fill: '#f472b6', fontSize: 90, fontFamily: 'Bebas Neue', top: 360 });
                break;
            case 'quote-love':
                this.canvasService.setBackgroundGradient(['#ec4899', '#f43f5e']);
                this.canvasService.addText({ text: '❤️', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'காதல் மேற்கோள்', fill: '#ffffff', fontSize: 48, fontFamily: 'Noto Serif Tamil' } as any);
                break;

            // === POEMS ===
            case 'poem-classic':
                this.canvasService.setBackgroundColor('#fef3c7');
                this.canvasService.addText({ text: '📜 கவிதை தலைப்பு', fill: '#78350f', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 120 });
                this.canvasService.addText({ text: 'இங்கே உங்கள் கவிதை\nவரிகள் எழுதுங்கள்\nஅழகான தமிழில்...', fill: '#92400e', fontSize: 28, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                this.canvasService.addText({ text: '— கவிஞர்', fill: '#a16207', fontSize: 22, top: 520 });
                break;
            case 'poem-modern':
                this.canvasService.setBackgroundGradient(['#0f172a', '#1e293b']);
                this.canvasService.addText({ text: 'நவீன கவிதை', fill: '#38bdf8', fontSize: 32, fontFamily: 'Outfit', top: 140 });
                this.canvasService.addText({ text: 'உங்கள் வரிகள்\nஇங்கே தட்டச்சு செய்க...', fill: '#e2e8f0', fontSize: 26, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-tamil':
                this.canvasService.setBackgroundGradient(['#fdf4ff', '#fae8ff']);
                this.canvasService.addText({ text: '🏛️ செந்தமிழ் பா 🏛️', fill: '#86198f', fontSize: 40, fontFamily: 'Noto Serif Tamil', top: 120 });
                this.canvasService.addText({ text: 'யாமறிந்த மொழிகளிலே\nதமிழ்மொழி போல்\nஇனிதாவது எங்குமில்லை', fill: '#701a75', fontSize: 28, fontFamily: 'Noto Serif Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-nature':
                this.canvasService.setBackgroundGradient(['#dcfce7', '#bbf7d0']);
                this.canvasService.addText({ text: '🌿 இயற்கை கவிதை', fill: '#166534', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 130 });
                this.canvasService.addText({ text: 'மரங்களின் ஓசை\nகாற்றின் இசை...', fill: '#15803d', fontSize: 28, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-night':
                this.canvasService.setBackgroundGradient(['#1e1b4b', '#312e81']);
                this.canvasService.addText({ text: '🌙 ✨', fill: '#fbbf24', fontSize: 50, top: 100 });
                this.canvasService.addText({ text: 'நிலவொளி கவிதை', fill: '#e0e7ff', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 200 });
                this.canvasService.addText({ text: 'கனவுகளின் வானில்...', fill: '#a5b4fc', fontSize: 26, fontFamily: 'Noto Sans Tamil' } as any);
                break;

            // === MOTIVATIONAL ===
            case 'motive-fire':
                this.canvasService.setBackgroundGradient(['#dc2626', '#f97316']);
                this.canvasService.addText({ text: '🔥', fill: '#ffffff', fontSize: 80, top: 120 });
                this.canvasService.addText({ text: 'NEVER GIVE UP', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'ஒருபோதும் விட்டுக்கொடுக்காதே', fill: '#fef08a', fontSize: 28, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;
            case 'motive-success':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#06b6d4']);
                this.canvasService.addText({ text: '🚀', fill: '#ffffff', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'SUCCESS', fill: '#ffffff', fontSize: 72, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'வெற்றி உங்களுடையது', fill: '#bfdbfe', fontSize: 30, fontFamily: 'Noto Sans Tamil', top: 420 });
                break;
            case 'motive-strength':
                this.canvasService.setBackgroundColor('#0f172a');
                this.canvasService.addText({ text: '💪', fill: '#fbbf24', fontSize: 70, top: 120 });
                this.canvasService.addText({ text: 'INNER STRENGTH', fill: '#fbbf24', fontSize: 54, fontFamily: 'Bebas Neue' } as any);
                this.canvasService.addText({ text: 'உள் வலிமை', fill: '#94a3b8', fontSize: 28, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;
            case 'motive-dream':
                this.canvasService.setBackgroundGradient(['#7c3aed', '#ec4899']);
                this.canvasService.addText({ text: '✨ DREAM BIG ✨', fill: '#ffffff', fontSize: 56, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'பெரிதாக கனவு காண்', fill: '#fce7f3', fontSize: 30, fontFamily: 'Noto Sans Tamil', top: 450 });
                break;
            case 'motive-focus':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: '🎯', fill: '#ef4444', fontSize: 80, top: 120 });
                this.canvasService.addText({ text: 'STAY FOCUSED', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue' } as any);
                this.canvasService.addText({ text: 'கவனத்தை இழக்காதே', fill: '#6b7280', fontSize: 26, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;

            // === AESTHETIC ===
            case 'aesthetic-pastel':
                this.canvasService.setBackgroundGradient(['#fce7f3', '#ddd6fe']);
                this.canvasService.addText({ text: '✿', fill: '#ec4899', fontSize: 60, top: 130 });
                this.canvasService.addText({ text: 'soft aesthetic', fill: '#a855f7', fontSize: 44, fontFamily: 'Pacifico' } as any);
                break;
            case 'aesthetic-retrowave':
                this.canvasService.setBackgroundGradient(['#1e1b4b', '#831843']);
                this.canvasService.addText({ text: 'RETRO', fill: '#22d3ee', fontSize: 80, fontFamily: 'Bebas Neue', top: 200 });
                this.canvasService.addText({ text: 'WAVE', fill: '#f472b6', fontSize: 80, fontFamily: 'Bebas Neue', top: 300 });
                break;
            case 'aesthetic-minimal':
                this.canvasService.setBackgroundColor('#fafafa');
                this.canvasService.addText({ text: 'minimal', fill: '#171717', fontSize: 56, fontFamily: 'Outfit', fontWeight: '300' } as any);
                break;
            case 'aesthetic-gradient':
                this.canvasService.setBackgroundGradient(['#f472b6', '#c084fc', '#60a5fa']);
                this.canvasService.addText({ text: 'VIBRANT', fill: '#ffffff', fontSize: 64, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'aesthetic-dark':
                this.canvasService.setBackgroundColor('#1c1917');
                this.canvasService.addText({ text: '📚', fill: '#d6d3d1', fontSize: 50, top: 140 });
                this.canvasService.addText({ text: 'Dark Academia', fill: '#d6d3d1', fontSize: 48, fontFamily: 'Playfair Display' } as any);
                break;

            // === FESTIVALS ===
            case 'pongal':
                this.canvasService.setBackgroundGradient(['#fef08a', '#fb923c']);
                this.canvasService.addText({ text: '🌾', fill: '#78350f', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'பொங்கல்', fill: '#78350f', fontSize: 64, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'வாழ்த்துக்கள்!', fill: '#92400e', fontSize: 48, fontFamily: 'Noto Serif Tamil', top: 420 });
                break;
            case 'diwali':
                this.canvasService.setBackgroundGradient(['#7c3aed', '#ec4899']);
                this.canvasService.addText({ text: '🪔 தீபாவளி 🪔', fill: '#fef08a', fontSize: 52, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold', top: 220 } as any);
                this.canvasService.addText({ text: 'நல்வாழ்த்துக்கள்!', fill: '#ffffff', fontSize: 44, fontFamily: 'Noto Serif Tamil', top: 380 });
                break;
            case 'newyear-tamil':
                this.canvasService.setBackgroundGradient(['#059669', '#10b981']);
                this.canvasService.addText({ text: '🎊', fill: '#ffffff', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'தமிழ் புத்தாண்டு', fill: '#ffffff', fontSize: 48, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'வாழ்த்துக்கள்!', fill: '#d1fae5', fontSize: 40, fontFamily: 'Noto Serif Tamil', top: 420 });
                break;
            case 'newyear':
                this.canvasService.setBackgroundGradient(['#1e3a8a', '#3b82f6']);
                this.canvasService.addText({ text: '🎆', fill: '#fbbf24', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: '2026', fill: '#fbbf24', fontSize: 100, fontFamily: 'Bebas Neue', top: 220 });
                this.canvasService.addText({ text: 'HAPPY NEW YEAR', fill: '#ffffff', fontSize: 40, fontFamily: 'Outfit', top: 420 });
                break;
            case 'christmas':
                this.canvasService.setBackgroundGradient(['#dc2626', '#16a34a']);
                this.canvasService.addText({ text: '🎄', fill: '#ffffff', fontSize: 80, top: 100 });
                this.canvasService.addText({ text: 'Merry Christmas', fill: '#ffffff', fontSize: 48, fontFamily: 'Playfair Display', fontWeight: 'bold' } as any);
                break;
            case 'birthday':
                this.canvasService.setBackgroundGradient(['#f472b6', '#a855f7']);
                this.canvasService.addText({ text: '🎂 🎈 🎉', fill: '#ffffff', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: 'Happy Birthday!', fill: '#ffffff', fontSize: 52, fontFamily: 'Pacifico' } as any);
                break;
            case 'wedding':
                this.canvasService.setBackgroundGradient(['#fecdd3', '#fef3c7']);
                this.canvasService.addText({ text: '💒', fill: '#9f1239', fontSize: 60, top: 100 });
                this.canvasService.addText({ text: 'திருமண வாழ்த்துக்கள்!', fill: '#9f1239', fontSize: 40, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                break;

            // === SOCIAL ===
            case 'instagram':
                this.canvasService.setBackgroundGradient(['#833ab4', '#fd1d1d', '#fcb045']);
                this.canvasService.addText({ text: '📸', fill: '#ffffff', fontSize: 60, top: 150 });
                this.canvasService.addText({ text: 'Your Content Here', fill: '#ffffff', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'instagram-story':
                this.canvasService.setBackgroundGradient(['#405de6', '#833ab4']);
                this.canvasService.addText({ text: 'Add Your Story', fill: '#ffffff', fontSize: 40, fontFamily: 'Outfit' } as any);
                break;
            case 'whatsapp':
                this.canvasService.setBackgroundGradient(['#25d366', '#128c7e']);
                this.canvasService.addText({ text: '💬', fill: '#ffffff', fontSize: 60, top: 150 });
                this.canvasService.addText({ text: 'WhatsApp Status', fill: '#ffffff', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'youtube':
                this.canvasService.setBackgroundGradient(['#ff0000', '#cc0000']);
                this.canvasService.addText({ text: '▶️', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'THUMBNAIL', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue' } as any);
                break;
            case 'twitter':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: '𝕏', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'Your Post Here', fill: '#ffffff', fontSize: 36, fontFamily: 'Outfit' } as any);
                break;

            // === BUSINESS ===
            case 'announcement':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#7c3aed']);
                this.canvasService.addText({ text: '📢', fill: '#fbbf24', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: 'ANNOUNCEMENT', fill: '#ffffff', fontSize: 52, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'Your message here...', fill: '#c7d2fe', fontSize: 26, fontFamily: 'Outfit', top: 450 });
                break;
            case 'sale':
                this.canvasService.setBackgroundGradient(['#dc2626', '#f97316']);
                this.canvasService.addText({ text: '🔥 SALE 🔥', fill: '#ffffff', fontSize: 72, fontFamily: 'Bebas Neue', top: 200 });
                this.canvasService.addText({ text: 'UP TO 50% OFF', fill: '#fef08a', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold', top: 380 } as any);
                break;
            case 'thankyou':
                this.canvasService.setBackgroundGradient(['#10b981', '#059669']);
                this.canvasService.addText({ text: '🙏', fill: '#ffffff', fontSize: 70, top: 140 });
                this.canvasService.addText({ text: 'Thank You!', fill: '#ffffff', fontSize: 56, fontFamily: 'Playfair Display', fontWeight: 'bold' } as any);
                break;
            case 'invitation':
                this.canvasService.setBackgroundGradient(['#a855f7', '#6366f1']);
                this.canvasService.addText({ text: '📩', fill: '#fbbf24', fontSize: 50, top: 120 });
                this.canvasService.addText({ text: "You're Invited!", fill: '#ffffff', fontSize: 48, fontFamily: 'Playfair Display' } as any);
                this.canvasService.addText({ text: 'Event details here...', fill: '#e0e7ff', fontSize: 24, fontFamily: 'Outfit', top: 450 });
                break;
            case 'launch':
                this.canvasService.setBackgroundGradient(['#0f172a', '#1e3a8a']);
                this.canvasService.addText({ text: '🚀', fill: '#38bdf8', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'NEW LAUNCH', fill: '#ffffff', fontSize: 56, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'Coming Soon...', fill: '#94a3b8', fontSize: 28, fontFamily: 'Outfit', top: 420 });
                break;

            default:
                this.canvasService.setBackgroundColor('#ffffff');
        }

        this.saveHistory();
        this.showTemplatesModal.set(false);
    }

    // Clear canvas
    clearCanvas(): void {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.canvasService.clear();
            this.saveHistory();
        }
    }
}
