import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { KavithaiService } from './kavithai.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';

@Component({
    selector: 'app-kavithai',
    standalone: true,
    imports: [AsyncPipe, TranslatePipe, AdUnitComponent],
    templateUrl: './kavithai.component.html',
    styleUrls: ['./kavithai.component.scss']
})
export class KavithaiComponent {
    private kavithaiService = inject(KavithaiService);
    private seo = inject(SeoService);

    errorMessage = '';
    loading = true;

    constructor() {
        this.seo.updateMetaTags({
            title: 'Poems - Tamil Kavithai',
            description: 'Browse poems and poetry in Tamil from the Tamil Kavithai collection.',
            url: 'https://pravintamilan.com/kavithai'
        });
    }

    kavithaigal$ = this.kavithaiService.getKavithaigal().pipe(
        tap(() => {
            this.loading = false;
            this.errorMessage = '';
        }),
        catchError(err => {
            this.loading = false;
            this.errorMessage = 'Failed to load poems. ' + (err.message || err);
            console.error(err);
            return of([]);
        })
    );
}
