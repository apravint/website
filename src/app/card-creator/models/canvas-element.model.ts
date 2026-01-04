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
    { name: 'Instagram Post', width: 1080, height: 1080, icon: '📸' },
    { name: 'Instagram Story', width: 1080, height: 1920, icon: '📱' },
    { name: 'WhatsApp Status', width: 1080, height: 1920, icon: '💬' },
    { name: 'Facebook Post', width: 1200, height: 630, icon: '👍' },
    { name: 'Twitter Post', width: 1200, height: 675, icon: '🐦' },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: '▶️' },
    { name: 'A4 Portrait', width: 2480, height: 3508, icon: '📄' },
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
