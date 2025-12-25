import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { KavithaiService } from './kavithai.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
    selector: 'app-kavithai',
    standalone: true,
    imports: [AsyncPipe, TranslatePipe, AdUnitComponent],
    templateUrl: './kavithai.component.html',
    styleUrls: ['./kavithai.component.scss']
})
export class KavithaiComponent {
    private kavithaiService = inject(KavithaiService);

    errorMessage = '';
    loading = true;

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
