import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportQuality = 'low' | 'medium' | 'high' | 'max';

export interface ExportOptions {
    format: ExportFormat;
    quality: ExportQuality;
    multiplier?: number;
    backgroundColor?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    private readonly qualityMultipliers: Record<ExportQuality, number> = {
        low: 0.5,
        medium: 1,
        high: 2,
        max: 4
    };

    async exportToDataURL(canvas: fabric.Canvas, options: ExportOptions): Promise<string> {
        const multiplier = options.multiplier ?? this.qualityMultipliers[options.quality];

        const exportOptions = {
            format: options.format === 'svg' ? 'png' : options.format,
            quality: options.format === 'jpeg' ? 0.92 : 1,
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

    async downloadImage(canvas: fabric.Canvas, filename: string, options: ExportOptions): Promise<void> {
        if (options.format === 'svg') {
            const svg = this.exportToSVG(canvas);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            this.downloadBlob(blob, `${filename}.svg`);
        } else {
            const blob = await this.exportToBlob(canvas, options);
            this.downloadBlob(blob, `${filename}.${options.format}`);
        }
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
    getExportPreset(platform: 'instagram' | 'whatsapp' | 'twitter' | 'facebook'): { width: number; height: number; multiplier: number } {
        const presets = {
            instagram: { width: 1080, height: 1080, multiplier: 1 },
            whatsapp: { width: 1080, height: 1920, multiplier: 1 },
            twitter: { width: 1200, height: 675, multiplier: 1 },
            facebook: { width: 1200, height: 630, multiplier: 1 }
        };

        return presets[platform];
    }
}
