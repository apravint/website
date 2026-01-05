import { Injectable, signal, computed } from '@angular/core';
import { CanvasState, CanvasElement, CANVAS_SIZES } from '../models/canvas-element.model';
import * as fabric from 'fabric';

@Injectable({
    providedIn: 'root'
})
export class CanvasService {
    private canvas: fabric.Canvas | null = null;

    // Reactive state
    private readonly _selectedElement = signal<fabric.FabricObject | null>(null);
    private readonly _canvasWidth = signal(1080);
    private readonly _canvasHeight = signal(1080);
    private readonly _zoom = signal(1);
    private readonly _backgroundColor = signal('#ffffff');

    // Public computed signals
    readonly selectedElement = this._selectedElement.asReadonly();
    readonly canvasWidth = this._canvasWidth.asReadonly();
    readonly canvasHeight = this._canvasHeight.asReadonly();
    readonly zoom = this._zoom.asReadonly();
    readonly backgroundColor = this._backgroundColor.asReadonly();

    readonly canvasSize = computed(() => ({
        width: this._canvasWidth(),
        height: this._canvasHeight()
    }));

    initCanvas(canvasElement: HTMLCanvasElement, containerWidth: number, containerHeight: number): fabric.Canvas {
        // Calculate scale to fit canvas in container
        const targetWidth = this._canvasWidth();
        const targetHeight = this._canvasHeight();
        const scale = Math.min(
            (containerWidth - 40) / targetWidth,
            (containerHeight - 40) / targetHeight,
            1
        );

        this.canvas = new fabric.Canvas(canvasElement, {
            width: targetWidth * scale,
            height: targetHeight * scale,
            backgroundColor: this._backgroundColor(),
            preserveObjectStacking: true,
            selection: true,
        });

        // Set internal dimensions
        this.canvas.setDimensions({ width: targetWidth, height: targetHeight });
        this.canvas.setZoom(scale);
        this._zoom.set(scale);

        // Event handlers
        this.canvas.on('selection:created', (e) => {
            this._selectedElement.set(e.selected?.[0] ?? null);
        });

        this.canvas.on('selection:updated', (e) => {
            this._selectedElement.set(e.selected?.[0] ?? null);
        });

        this.canvas.on('selection:cleared', () => {
            this._selectedElement.set(null);
        });

        return this.canvas;
    }

    getCanvas(): fabric.Canvas | null {
        return this.canvas;
    }

    setCanvasSize(width: number, height: number): void {
        this._canvasWidth.set(width);
        this._canvasHeight.set(height);

        if (this.canvas) {
            this.canvas.setDimensions({ width, height });
            this.canvas.renderAll();
        }
    }

    setBackgroundColor(color: string): void {
        this._backgroundColor.set(color);
        if (this.canvas) {
            this.canvas.backgroundColor = color;
            this.canvas.renderAll();
        }
    }

    setBackgroundGradient(colors: string[], direction: 'horizontal' | 'vertical' = 'vertical'): void {
        if (!this.canvas) return;

        const gradient = new fabric.Gradient({
            type: 'linear',
            coords: direction === 'vertical'
                ? { x1: 0, y1: 0, x2: 0, y2: this._canvasHeight() }
                : { x1: 0, y1: 0, x2: this._canvasWidth(), y2: 0 },
            colorStops: colors.map((color, i) => ({
                offset: i / (colors.length - 1),
                color
            }))
        });

        this.canvas.backgroundColor = gradient;
        this.canvas.renderAll();
    }

    addText(options: Record<string, unknown> = {}): fabric.IText {
        const text = new fabric.IText('உங்கள் உரை', {
            left: this._canvasWidth() / 2,
            top: this._canvasHeight() / 2,
            fontFamily: 'Noto Sans Tamil',
            fontSize: 48,
            fill: '#000000',
            originX: 'center',
            originY: 'center',
            ...options
        });

        this.canvas?.add(text);
        this.canvas?.setActiveObject(text);
        this.canvas?.renderAll();

        return text;
    }

    addHeading(): fabric.IText {
        return this.addText({
            fontSize: 72,
            fontWeight: 'bold',
            text: 'தலைப்பு'
        });
    }

    addSubheading(): fabric.IText {
        return this.addText({
            fontSize: 48,
            fontWeight: '500',
            text: 'துணைத்தலைப்பு'
        });
    }

    addBodyText(): fabric.IText {
        return this.addText({
            fontSize: 32,
            text: 'உடல் உரை இங்கே...'
        });
    }

    // Text formatting methods
    updateSelectedText(options: Record<string, unknown>): void {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject && activeObject instanceof fabric.IText) {
            activeObject.set(options);
            // Mark as dirty to force re-render and recalculate dimensions
            activeObject.dirty = true;
            activeObject.setCoords();
            this.canvas?.requestRenderAll();
        }
    }

    getSelectedTextProperties(): {
        fontFamily: string;
        fontSize: number;
        fill: string;
        textAlign: string;
        fontWeight: string;
        fontStyle: string;
        underline: boolean;
        linethrough: boolean;
        charSpacing: number;
        lineHeight: number;
        shadow: string;
        stroke: string;
        strokeWidth: number;
        opacity: number;
        textBackgroundColor: string;
        isUppercase: boolean;
    } | null {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject && activeObject instanceof fabric.IText) {
            // Parse shadow if it exists
            let shadowString = '';
            if (activeObject.shadow) {
                const s = activeObject.shadow as fabric.Shadow;
                shadowString = `${s.offsetX || 0},${s.offsetY || 0},${s.blur || 0},${s.color || '#000000'}`;
            }

            return {
                fontFamily: activeObject.fontFamily || 'Noto Sans Tamil',
                fontSize: activeObject.fontSize || 48,
                fill: (activeObject.fill as string) || '#000000',
                textAlign: activeObject.textAlign || 'left',
                fontWeight: String(activeObject.fontWeight || 'normal'),
                fontStyle: activeObject.fontStyle || 'normal',
                underline: activeObject.underline || false,
                linethrough: activeObject.linethrough || false,
                charSpacing: activeObject.charSpacing || 0,
                lineHeight: activeObject.lineHeight || 1.16,
                shadow: shadowString,
                stroke: (activeObject.stroke as string) || '',
                strokeWidth: activeObject.strokeWidth || 0,
                opacity: activeObject.opacity ?? 1,
                textBackgroundColor: (activeObject.textBackgroundColor as string) || '',
                isUppercase: false // This is handled at component level
            };
        }
        return null;
    }

    isTextSelected(): boolean {
        const activeObject = this.canvas?.getActiveObject();
        return activeObject instanceof fabric.IText;
    }

    addImage(url: string): Promise<fabric.Image> {
        return new Promise((resolve, reject) => {
            fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
                .then((img) => {
                    // Scale image to fit canvas if too large
                    const maxWidth = this._canvasWidth() * 0.8;
                    const maxHeight = this._canvasHeight() * 0.8;

                    if (img.width && img.height) {
                        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
                        img.scale(scale);
                    }

                    img.set({
                        left: this._canvasWidth() / 2,
                        top: this._canvasHeight() / 2,
                        originX: 'center',
                        originY: 'center'
                    });

                    this.canvas?.add(img);
                    this.canvas?.setActiveObject(img);
                    this.canvas?.renderAll();
                    resolve(img);
                })
                .catch(reject);
        });
    }

    addShape(type: 'rect' | 'circle' | 'triangle' | 'line' | 'star' | 'ellipse' | 'arrow' | 'diamond'): fabric.FabricObject {
        let shape: fabric.FabricObject;

        const commonProps = {
            left: this._canvasWidth() / 2,
            top: this._canvasHeight() / 2,
            originX: 'center' as const,
            originY: 'center' as const,
            fill: '#4f46e5',
            stroke: '#312e81',
            strokeWidth: 2
        };

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({
                    ...commonProps,
                    width: 200,
                    height: 150,
                    rx: 10,
                    ry: 10
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    ...commonProps,
                    radius: 100
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    ...commonProps,
                    width: 200,
                    height: 180
                });
                break;
            case 'line':
                shape = new fabric.Line([0, 0, 300, 0], {
                    ...commonProps,
                    stroke: '#4f46e5',
                    strokeWidth: 4
                });
                break;
            case 'star':
                // 5-pointed star using polygon
                const starPoints = this.createStarPoints(5, 80, 40);
                shape = new fabric.Polygon(starPoints, {
                    ...commonProps,
                    fill: '#fbbf24',
                    stroke: '#f59e0b'
                });
                break;
            case 'ellipse':
                shape = new fabric.Ellipse({
                    ...commonProps,
                    rx: 120,
                    ry: 70
                });
                break;
            case 'arrow':
                // Arrow pointing right
                const arrowPoints = [
                    { x: 0, y: 30 },
                    { x: 150, y: 30 },
                    { x: 150, y: 0 },
                    { x: 200, y: 50 },
                    { x: 150, y: 100 },
                    { x: 150, y: 70 },
                    { x: 0, y: 70 }
                ];
                shape = new fabric.Polygon(arrowPoints, {
                    ...commonProps,
                    fill: '#10b981',
                    stroke: '#059669'
                });
                break;
            case 'diamond':
                const diamondPoints = [
                    { x: 0, y: 100 },
                    { x: 80, y: 0 },
                    { x: 160, y: 100 },
                    { x: 80, y: 200 }
                ];
                shape = new fabric.Polygon(diamondPoints, {
                    ...commonProps,
                    fill: '#ec4899',
                    stroke: '#db2777'
                });
                break;
            default:
                shape = new fabric.Rect({ ...commonProps, width: 200, height: 150 });
        }

        this.canvas?.add(shape);
        this.canvas?.setActiveObject(shape);
        this.canvas?.renderAll();

        return shape;
    }

    private createStarPoints(points: number, outerRadius: number, innerRadius: number): { x: number; y: number }[] {
        const result: { x: number; y: number }[] = [];
        const step = Math.PI / points;

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            result.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }

        return result;
    }

    deleteSelected(): void {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject) {
            this.canvas?.remove(activeObject);
            this.canvas?.discardActiveObject();
            this.canvas?.renderAll();
        }
    }

    duplicateSelected(): void {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject) {
            activeObject.clone().then((cloned: fabric.FabricObject) => {
                cloned.set({
                    left: (cloned.left || 0) + 20,
                    top: (cloned.top || 0) + 20
                });
                this.canvas?.add(cloned);
                this.canvas?.setActiveObject(cloned);
                this.canvas?.renderAll();
            });
        }
    }

    bringForward(): void {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject) {
            this.canvas?.bringObjectForward(activeObject);
            this.canvas?.renderAll();
        }
    }

    sendBackward(): void {
        const activeObject = this.canvas?.getActiveObject();
        if (activeObject) {
            this.canvas?.sendObjectBackwards(activeObject);
            this.canvas?.renderAll();
        }
    }

    setZoom(zoom: number): void {
        this._zoom.set(zoom);
        this.canvas?.setZoom(zoom);
        this.canvas?.renderAll();
    }

    zoomIn(): void {
        this.setZoom(Math.min(this._zoom() * 1.2, 3));
    }

    zoomOut(): void {
        this.setZoom(Math.max(this._zoom() / 1.2, 0.2));
    }

    fitToScreen(containerWidth: number, containerHeight: number): void {
        const scale = Math.min(
            (containerWidth - 40) / this._canvasWidth(),
            (containerHeight - 40) / this._canvasHeight(),
            1
        );
        this.setZoom(scale);
    }

    clear(): void {
        this.canvas?.clear();
        this.canvas!.backgroundColor = this._backgroundColor();
        this.canvas?.renderAll();
    }

    toJSON(): object {
        return this.canvas?.toJSON() || {};
    }

    loadFromJSON(json: object): Promise<void> {
        return new Promise((resolve, reject) => {
            this.canvas?.loadFromJSON(json)
                .then(() => {
                    this.canvas?.renderAll();
                    resolve();
                })
                .catch(reject);
        });
    }

    dispose(): void {
        this.canvas?.dispose();
        this.canvas = null;
    }
}
