import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { KavithaiService } from './kavithai.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { ShareService } from '../shared/services/share.service';

@Component({
    selector: 'app-kavithai',
    standalone: true,
    imports: [AsyncPipe, CommonModule, TranslatePipe, AdUnitComponent],
    templateUrl: './kavithai.component.html',
    styleUrls: ['./kavithai.component.scss']
})
export class KavithaiComponent {
    private kavithaiService = inject(KavithaiService);
    private seo = inject(SeoService);
    private favoritesService = inject(FavoritesService);
    private shareService = inject(ShareService);

    errorMessage = '';
    loading = true;
    copiedId: string | null = null;
    highlightedPoemId: string | null = null;
    private allPoems: any[] = [];

    constructor() {
        this.seo.updateMetaTags({
            title: 'Poems - Tamil Kavithai',
            description: 'Browse poems and poetry in Tamil from the Tamil Kavithai collection.',
            url: 'https://pravintamilan.com/kavithai'
        });
    }

    kavithaigal$ = this.kavithaiService.getKavithaigal().pipe(
        tap((poems) => {
            this.loading = false;
            this.errorMessage = '';
            this.allPoems = poems;
        }),
        catchError(err => {
            this.loading = false;
            this.errorMessage = 'Failed to load poems. ' + (err.message || err);
            console.error(err);
            return of([]);
        })
    );

    /**
     * Generate a unique ID for a poem (using title + first 20 chars of description)
     */
    getPoemId(poem: any): string {
        return `${poem.title || 'untitled'}_${(poem.description || '').substring(0, 20)}`.replace(/\s/g, '_');
    }

    /**
     * Pick a random poem and scroll to it
     */
    surpriseMe(): void {
        if (this.allPoems.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.allPoems.length);
        const randomPoem = this.allPoems[randomIndex];
        const poemId = this.getPoemId(randomPoem);

        // Set highlighted poem
        this.highlightedPoemId = poemId;

        // Scroll to the poem card
        setTimeout(() => {
            const element = document.getElementById(`poem-${poemId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Remove highlight after 3 seconds
        setTimeout(() => {
            this.highlightedPoemId = null;
        }, 3000);
    }

    /**
     * Check if poem is liked
     */
    isLiked(poem: any): boolean {
        return this.favoritesService.isFavorite(this.getPoemId(poem));
    }

    /**
     * Toggle like status
     */
    toggleLike(poem: any): void {
        this.favoritesService.toggleFavorite(this.getPoemId(poem));
    }

    /**
     * Share poem to Twitter
     */
    shareToTwitter(poem: any): void {
        const text = this.formatPoemForShare(poem);
        this.shareService.shareToTwitter(text, 'https://pravintamilan.com/kavithai');
    }

    /**
     * Share poem to WhatsApp
     */
    shareToWhatsApp(poem: any): void {
        const text = this.formatPoemForShare(poem) + '\n\n📖 https://pravintamilan.com/kavithai';
        this.shareService.shareToWhatsApp(text);
    }

    /**
     * Copy poem to clipboard
     */
    async copyPoem(poem: any): Promise<void> {
        const text = this.formatPoemForShare(poem);
        const success = await this.shareService.copyToClipboard(text);
        if (success) {
            this.copiedId = this.getPoemId(poem);
            setTimeout(() => {
                this.copiedId = null;
            }, 2000);
        }
    }

    /**
     * Format poem for sharing
     */
    private formatPoemForShare(poem: any): string {
        let text = '';
        if (poem.title) {
            text += `📜 ${poem.title}\n\n`;
        }
        text += poem.description;
        text += `\n\n— ${poem.user}`;
        return text;
    }
}
