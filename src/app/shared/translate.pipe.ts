import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Pipe({
    name: 'translate',
    standalone: true,
    pure: false // Impure to update when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
    private langSub: Subscription;

    constructor(private translationService: TranslationService, private ref: ChangeDetectorRef) {
        this.langSub = this.translationService.translations$.subscribe(() => {
            this.ref.markForCheck();
        });
    }

    transform(key: string): string {
        return this.translationService.translate(key);
    }

    ngOnDestroy() {
        if (this.langSub) {
            this.langSub.unsubscribe();
        }
    }
}
