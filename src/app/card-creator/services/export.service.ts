import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf';
export type ExportQuality = 'low' | 'medium' | 'high' | 'max' | 'print';

export interface ExportOptions {
    format: ExportFormat;
    quality: ExportQuality;
    multiplier?: number;
    backgroundColor?: string;
    // Print options
    includeBleed?: boolean;
    bleedSize?: number; // in pixels
    includeCropMarks?: boolean;
    colorProfile?: 'srgb' | 'cmyk-simulation';
}

export interface PrintExportOptions extends ExportOptions {
    dpi: 300 | 600;
    includeBleed: boolean;
    bleedSize: number;
    includeCropMarks: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    private readonly qualityMultipliers: Record<ExportQuality, number> = {
        low: 0.5,
        medium: 1,
        high: 2,
        max: 4,
        print: 4 // 300 DPI equivalent
    };

    // Export format presets for quick access
    readonly exportPresets = [
        { id: 'web', name: 'Web (PNG)', format: 'png' as ExportFormat, quality: 'high' as ExportQuality, icon: '🌐' },
        { id: 'social', name: 'Social Media (JPEG)', format: 'jpeg' as ExportFormat, quality: 'high' as ExportQuality, icon: '📱' },
        { id: 'webp', name: 'WebP (Small File)', format: 'webp' as ExportFormat, quality: 'high' as ExportQuality, icon: '⚡' },
        { id: 'print', name: 'Print Ready (PNG 300DPI)', format: 'png' as ExportFormat, quality: 'print' as ExportQuality, icon: '🖨️' },
        { id: 'vector', name: 'Vector (SVG)', format: 'svg' as ExportFormat, quality: 'max' as ExportQuality, icon: '📐' },
    ];

    async exportToDataURL(canvas: fabric.Canvas, options: ExportOptions): Promise<string> {
        const multiplier = options.multiplier ?? this.qualityMultipliers[options.quality];

        let format = options.format;
        if (format === 'svg' || format === 'pdf') format = 'png';

        const exportOptions = {
            format: format as 'png' | 'jpeg' | 'webp',
            quality: format === 'jpeg' ? 0.92 : (format === 'webp' ? 0.85 : 1),
            multiplier
        };

        return canvas.toDataURL(exportOptions as fabric.TDataUrlOptions);
    }

    async exportToBlob(canvas: fabric.Canvas, options: ExportOptions): Promise<Blob> {
        const dataURL = await this.exportToDataURL(canvas, options);
        return this.dataURLToBlob(dataURL);
    }

    exportToSVG(canvas: fabric.Canvas): string {
        return canvas.toSVG();
    }

    // Export with bleed marks for print
    async exportForPrint(canvas: fabric.Canvas, options: PrintExportOptions): Promise<Blob> {
        const multiplier = this.qualityMultipliers[options.quality];
        const bleedSize = options.bleedSize || 36; // 3mm at 300 DPI

        // Create a temporary canvas with bleed
        const width = canvas.getWidth();
        const height = canvas.getHeight();

        const tempCanvas = document.createElement('canvas');
        const totalWidth = (width + bleedSize * 2) * multiplier;
        const totalHeight = (height + bleedSize * 2) * multiplier;
        tempCanvas.width = totalWidth;
        tempCanvas.height = totalHeight;

        const ctx = tempCanvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Fill with white (bleed area)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw the main canvas content
        const mainDataURL = await this.exportToDataURL(canvas, { ...options, multiplier });
        const img = await this.loadImage(mainDataURL);
        ctx.drawImage(img, bleedSize * multiplier, bleedSize * multiplier);

        // Draw crop marks if requested
        if (options.includeCropMarks) {
            this.drawCropMarks(ctx, bleedSize * multiplier, width * multiplier, height * multiplier, totalWidth, totalHeight);
        }

        return new Promise((resolve, reject) => {
            tempCanvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                'image/png',
                1
            );
        });
    }

    private drawCropMarks(ctx: CanvasRenderingContext2D, bleed: number, width: number, height: number, totalWidth: number, totalHeight: number): void {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        const markLength = 20;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(bleed - markLength, bleed);
        ctx.lineTo(bleed - 5, bleed);
        ctx.moveTo(bleed, bleed - markLength);
        ctx.lineTo(bleed, bleed - 5);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(bleed + width + 5, bleed);
        ctx.lineTo(bleed + width + markLength, bleed);
        ctx.moveTo(bleed + width, bleed - markLength);
        ctx.lineTo(bleed + width, bleed - 5);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(bleed - markLength, bleed + height);
        ctx.lineTo(bleed - 5, bleed + height);
        ctx.moveTo(bleed, bleed + height + 5);
        ctx.lineTo(bleed, bleed + height + markLength);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(bleed + width + 5, bleed + height);
        ctx.lineTo(bleed + width + markLength, bleed + height);
        ctx.moveTo(bleed + width, bleed + height + 5);
        ctx.lineTo(bleed + width, bleed + height + markLength);
        ctx.stroke();
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async downloadImage(canvas: fabric.Canvas, filename: string, options: ExportOptions): Promise<void> {
        if (options.format === 'svg') {
            const svg = this.exportToSVG(canvas);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            this.downloadBlob(blob, `${filename}.svg`);
        } else {
            const blob = await this.exportToBlob(canvas, options);
            const ext = options.format === 'jpeg' ? 'jpg' : options.format;
            this.downloadBlob(blob, `${filename}.${ext}`);
        }
    }

    async downloadPrintReady(canvas: fabric.Canvas, filename: string): Promise<void> {
        const options: PrintExportOptions = {
            format: 'png',
            quality: 'print',
            dpi: 300,
            includeBleed: true,
            bleedSize: 36,
            includeCropMarks: true
        };

        const blob = await this.exportForPrint(canvas, options);
        this.downloadBlob(blob, `${filename}_print_ready.png`);
    }

    private dataURLToBlob(dataURL: string): Blob {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Platform-specific export presets
    getExportPreset(platform: 'instagram' | 'whatsapp' | 'twitter' | 'facebook' | 'print'): { width: number; height: number; multiplier: number } {
        const presets = {
            instagram: { width: 1080, height: 1080, multiplier: 1 },
            whatsapp: { width: 1080, height: 1920, multiplier: 1 },
            twitter: { width: 1200, height: 675, multiplier: 1 },
            facebook: { width: 1200, height: 630, multiplier: 1 },
            print: { width: 2480, height: 3508, multiplier: 4 } // A4 at 300 DPI
        };

        return presets[platform];
    }

    // Get file size estimate
    estimateFileSize(canvas: fabric.Canvas, options: ExportOptions): string {
        const multiplier = options.multiplier ?? this.qualityMultipliers[options.quality];
        const pixels = canvas.getWidth() * canvas.getHeight() * multiplier * multiplier;

        // Rough estimates based on format
        let bytesPerPixel = 0;
        switch (options.format) {
            case 'png': bytesPerPixel = 3; break;
            case 'jpeg': bytesPerPixel = 0.5; break;
            case 'webp': bytesPerPixel = 0.3; break;
            default: bytesPerPixel = 1;
        }

        const bytes = pixels * bytesPerPixel;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
