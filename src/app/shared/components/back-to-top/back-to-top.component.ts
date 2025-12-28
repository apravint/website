import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-back-to-top',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button 
            class="back-to-top-btn"
            [class.visible]="isVisible"
            (click)="scrollToTop()"
            aria-label="Back to top"
            title="Back to top"
        >
            ↑
        </button>
    `,
    styles: [`
        .back-to-top-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent) 0%, #a855f7 100%);
            color: white;
            border: none;
            font-size: 1.5rem;
            font-weight: bold;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
            z-index: 1000;

            &.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 6px 30px rgba(79, 70, 229, 0.5);
            }

            &:active {
                transform: translateY(-2px);
            }
        }

        @media (max-width: 768px) {
            .back-to-top-btn {
                width: 44px;
                height: 44px;
                bottom: 16px;
                right: 16px;
                font-size: 1.3rem;
            }
        }
    `]
})
export class BackToTopComponent {
    isVisible = false;

    @HostListener('window:scroll')
    onWindowScroll(): void {
        // Show button after scrolling down 300px
        this.isVisible = window.scrollY > 300;
    }

    scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
