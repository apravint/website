import { Component, inject, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KavithaiService } from './kavithai.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { ShareService } from '../shared/services/share.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-kavithai',
    standalone: true,
    imports: [AsyncPipe, CommonModule, FormsModule, TranslatePipe, AdUnitComponent],
    templateUrl: './kavithai.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./kavithai.component.scss']
})
export class KavithaiComponent implements OnInit {
    private kavithaiService = inject(KavithaiService);
    private seo = inject(SeoService);
    private favoritesService = inject(FavoritesService);
    private shareService = inject(ShareService);
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // Tab state
    activeTab: 'browse' | 'ai' = 'browse';

    // Reading preference state
    textSize: 'small' | 'medium' | 'large' = 'medium';
    textStyle: 'sans' | 'serif' = 'serif';
    paperTheme: 'clean' | 'parchment' | 'dark-onyx' = 'clean';

    // Browse poems state
    errorMessage = '';
    loading = true;
    copiedId: string | null = null;
    highlightedPoemId: string | null = null;
    isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
    private allPoems: any[] = [];

    // AI Poet state
    aiUserInput = '';
    aiMessages: { role: 'user' | 'ai', text: string }[] = [
        { role: 'ai', text: 'வணக்கம்! நான் உங்கள் தமிழ் கவிதை உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?' }
    ];
    aiLoading = false;
    private genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    private model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    constructor() {
        this.seo.updateMetaTags({
            title: 'Poems - Tamil Kavithai',
            description: 'Browse poems and poetry in Tamil from the Tamil Kavithai collection, or create your own with AI.',
            url: 'https://pravintamilan.com/kavithai'
        });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['tab'] === 'ai') {
                this.activeTab = 'ai';
                this.cdr.detectChanges();
            }
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

    getPoemId(poem: any): string {
        return `${poem.title || 'untitled'}_${(poem.description || '').substring(0, 20)}`.replace(/\s/g, '_');
    }

    surpriseMe(): void {
        if (this.allPoems.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.allPoems.length);
        const randomPoem = this.allPoems[randomIndex];
        const poemId = this.getPoemId(randomPoem);

        this.highlightedPoemId = poemId;

        setTimeout(() => {
            const element = document.getElementById(`poem-${poemId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        setTimeout(() => {
            this.highlightedPoemId = null;
        }, 3000);
    }

    isLiked(poem: any): boolean {
        return this.favoritesService.isFavorite(this.getPoemId(poem));
    }

    toggleLike(poem: any): void {
        this.favoritesService.toggleFavorite(this.getPoemId(poem));
    }

    shareToTwitter(poem: any): void {
        const text = this.formatPoemForShare(poem);
        this.shareService.shareToTwitter(text, 'https://pravintamilan.com/kavithai');
    }

    nativeShare(poem: any): void {
        const text = this.formatPoemForShare(poem);
        this.shareService.nativeShare(poem.title || 'Tamil Kavithai', text, 'https://pravintamilan.com/kavithai');
    }

    designCard(poem: any): void {
        const text = this.formatPoemForShare(poem);
        this.router.navigate(['/create'], { queryParams: { text } });
    }

    designCardFromText(text: string): void {
        this.router.navigate(['/create'], { queryParams: { text } });
    }

    shareToWhatsApp(poem: any): void {
        const text = this.formatPoemForShare(poem) + '\n\n📖 https://pravintamilan.com/kavithai';
        this.shareService.shareToWhatsApp(text);
    }

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

    private formatPoemForShare(poem: any): string {
        let text = '';
        if (poem.title) {
            text += `📜 ${poem.title}\n\n`;
        }
        text += poem.description;
        text += `\n\n— ${poem.user}`;
        return text;
    }

    // AI Poet Methods
    async generatePoetry(): Promise<void> {
        if (!this.aiUserInput.trim() || this.aiLoading) return;

        const userText = this.aiUserInput;
        this.aiMessages.push({ role: 'user', text: userText });
        this.aiUserInput = '';
        this.aiLoading = true;
        this.cdr.detectChanges();

        if (!environment.geminiApiKey || environment.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
            setTimeout(() => {
                let mockResponse = 'மன்னிக்கவும், Gemini API சாவி (API Key) இன்னும் கட்டமைக்கப்படவில்லை. ';
                mockResponse += 'கட்டமைத்த பின் இந்த கவிதை உதவியாளர் உங்களுக்கு சிறப்பாக உதவ முடியும்!\n\n';
                mockResponse += 'இங்கே ஒரு மாதிரி கவிதை:\n';
                mockResponse += 'அறிவை வளர்க்கும் கணினியே,\n';
                mockResponse += 'அன்பைப் பெருக்கும் தமிழ்மொழியே!\n';
                mockResponse += 'இணைந்து இயங்கும் உலகினில்,\n';
                mockResponse += 'இன்பம் தருவதே எமது கவியே!';
                this.aiMessages.push({ role: 'ai', text: mockResponse });
                this.aiLoading = false;
                this.cdr.detectChanges();
            }, 1000);
            return;
        }

        try {
            const prompt = `You are a legendary Tamil poet. 
            The user wants: "${userText}". 
            Respond with a beautiful, high-quality Tamil kavithai or a clear explanation if asked. 
            Always maintain a sophisticated yet accessible poetic tone in Tamil. 
            If the user speaks in English, answer mainly in Tamil with occasional English context if helpful.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            this.aiMessages.push({ role: 'ai', text: text });
        } catch (error) {
            console.error('Gemini error:', error);
            this.aiMessages.push({ role: 'ai', text: 'மன்னிக்கவும், என்னால் இப்போது பதில் அளிக்க முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து முயற்சிக்கவும்.' });
        } finally {
            this.aiLoading = false;
            this.cdr.detectChanges();
        }
    }
}
