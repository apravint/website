import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Skill {
    name: string;
    level: number; // 0-100
    icon?: string;
    color?: string;
}

@Component({
    selector: 'app-skill-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="skill-bar" #skillBar>
            <div class="skill-header">
                <span class="skill-icon" *ngIf="skill.icon">{{ skill.icon }}</span>
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-percent">{{ displayLevel }}%</span>
            </div>
            <div class="progress-track">
                <div 
                    class="progress-fill" 
                    [style.width.%]="displayLevel"
                    [style.background]="getGradient()"
                ></div>
            </div>
        </div>
    `,
    styles: [`
        .skill-bar {
            margin-bottom: 1.25rem;
        }

        .skill-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .skill-icon {
            font-size: 1.2rem;
            margin-right: 0.5rem;
        }

        .skill-name {
            font-weight: 600;
            color: var(--text);
            flex: 1;
        }

        .skill-percent {
            font-weight: 700;
            font-size: 0.9rem;
            color: var(--accent);
        }

        .progress-track {
            height: 10px;
            background: var(--border);
            border-radius: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(90deg, var(--accent) 0%, #a855f7 100%);
        }
    `]
})
export class SkillBarComponent implements OnInit, AfterViewInit {
    @Input() skill: Skill = { name: '', level: 0 };
    @ViewChild('skillBar') skillBar!: ElementRef;

    displayLevel = 0;

    ngOnInit(): void {
        // Start at 0 for animation
        this.displayLevel = 0;
    }

    ngAfterViewInit(): void {
        // Small delay then animate - simpler approach that works reliably
        setTimeout(() => {
            this.displayLevel = this.skill.level;
        }, 300);
    }

    getGradient(): string {
        if (this.skill.color) {
            return `linear-gradient(90deg, ${this.skill.color} 0%, ${this.skill.color}cc 100%)`;
        }
        return 'linear-gradient(90deg, var(--accent) 0%, #a855f7 100%)';
    }
}
