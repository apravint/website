import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sparkline',
    standalone: true,
    imports: [CommonModule],
    template: `
        <svg 
            [attr.width]="width" 
            [attr.height]="height" 
            class="sparkline"
            [class.up]="isUp"
            [class.down]="!isUp"
        >
            <defs>
                <linearGradient [attr.id]="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" [attr.stop-color]="isUp ? '#10b981' : '#ef4444'" stop-opacity="0.3"/>
                    <stop offset="100%" [attr.stop-color]="isUp ? '#10b981' : '#ef4444'" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <path [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'" />
            <path [attr.d]="linePath" fill="none" [attr.stroke]="isUp ? '#10b981' : '#ef4444'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle [attr.cx]="lastPointX" [attr.cy]="lastPointY" r="3" [attr.fill]="isUp ? '#10b981' : '#ef4444'" />
        </svg>
    `,
    styles: [`
        .sparkline {
            display: block;
        }
    `]
})
export class SparklineComponent implements OnChanges {
    @Input() data: number[] = [];
    @Input() width = 120;
    @Input() height = 40;

    linePath = '';
    areaPath = '';
    isUp = true;
    lastPointX = 0;
    lastPointY = 0;
    gradientId = 'gradient-' + Math.random().toString(36).substr(2, 9);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data.length > 0) {
            this.calculatePaths();
        }
    }

    private calculatePaths(): void {
        if (this.data.length < 2) return;

        const padding = 4;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;

        const min = Math.min(...this.data);
        const max = Math.max(...this.data);
        const range = max - min || 1;

        this.isUp = this.data[this.data.length - 1] >= this.data[0];

        const points = this.data.map((value, index) => {
            const x = padding + (index / (this.data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - min) / range) * chartHeight;
            return { x, y };
        });

        // Line path
        this.linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        // Area path (fill under the line)
        this.areaPath = this.linePath +
            ` L ${points[points.length - 1].x} ${this.height - padding}` +
            ` L ${padding} ${this.height - padding} Z`;

        // Last point for the dot
        this.lastPointX = points[points.length - 1].x;
        this.lastPointY = points[points.length - 1].y;
    }
}
