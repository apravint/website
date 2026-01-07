// Canvas element models for the card creator

export type ElementType = 'text' | 'image' | 'shape' | 'sticker';
export type ShapeType = 'rect' | 'circle' | 'line' | 'arrow' | 'star' | 'heart' | 'triangle';

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    locked: boolean;
    visible: boolean;
    layerIndex: number;
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    textAlign: 'left' | 'center' | 'right';
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
    };
    letterSpacing?: number;
    lineHeight?: number;
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    filters?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        blur?: number;
    };
    borderRadius?: number;
}

export interface ShapeElement extends BaseElement {
    type: 'shape';
    shapeType: ShapeType;
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius?: number;
}

export interface StickerElement extends BaseElement {
    type: 'sticker';
    emoji: string;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | StickerElement;

export interface CanvasSize {
    name: string;
    width: number;
    height: number;
    icon: string;
}

export const CANVAS_SIZES: CanvasSize[] = [
    // Social Media - Square
    { name: 'Instagram Post', width: 1080, height: 1080, icon: '📸' },
    { name: 'Facebook Post', width: 1200, height: 1200, icon: '👍' },
    { name: 'LinkedIn Post', width: 1200, height: 1200, icon: '💼' },
    // Social Media - Portrait/Story
    { name: 'Instagram Story', width: 1080, height: 1920, icon: '📱' },
    { name: 'WhatsApp Status', width: 1080, height: 1920, icon: '💬' },
    { name: 'TikTok Video', width: 1080, height: 1920, icon: '🎵' },
    { name: 'Pinterest Pin', width: 1000, height: 1500, icon: '📌' },
    // Social Media - Landscape
    { name: 'Twitter/X Post', width: 1200, height: 675, icon: '🐦' },
    { name: 'Facebook Cover', width: 1640, height: 624, icon: '🖼️' },
    { name: 'LinkedIn Banner', width: 1584, height: 396, icon: '🎯' },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: '▶️' },
    { name: 'YouTube Banner', width: 2560, height: 1440, icon: '📺' },
    // Business Cards
    { name: 'Business Card (US)', width: 1050, height: 600, icon: '💳' },
    { name: 'Business Card (EU)', width: 1004, height: 650, icon: '🇪🇺' },
    // Print Formats
    { name: 'A4 Portrait', width: 2480, height: 3508, icon: '📄' },
    { name: 'A4 Landscape', width: 3508, height: 2480, icon: '📃' },
    { name: 'A5 Portrait', width: 1748, height: 2480, icon: '📋' },
    { name: 'Letter (US)', width: 2550, height: 3300, icon: '📝' },
    { name: 'Postcard', width: 1800, height: 1200, icon: '📮' },
    // Digital
    { name: 'Presentation 16:9', width: 1920, height: 1080, icon: '🖥️' },
    { name: 'Presentation 4:3', width: 1024, height: 768, icon: '💻' },
    { name: 'Email Header', width: 600, height: 200, icon: '📧' },
    { name: 'Custom', width: 800, height: 600, icon: '✏️' },
];

export interface CanvasState {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundGradient?: string[];
    backgroundImage?: string;
    elements: CanvasElement[];
}

export interface Template {
    id: string;
    name: string;
    category: 'quotes' | 'poems' | 'festivals' | 'social' | 'blank';
    thumbnail: string;
    canvasState: CanvasState;
}
