import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MarketData {
    bitcoin: number;
    gold: number;
    silver: number;
}

@Injectable({
    providedIn: 'root'
})
export class MarketPricesService {
    private coinGeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
    private goldApiUrl = 'https://www.goldapi.io/api';

    constructor(private http: HttpClient) { }

    getMarketPrices(): Observable<MarketData> {
        const headers = new HttpHeaders().set('x-access-token', environment.metalPriceApiKey);

        const btc$ = this.http.get<any>(this.coinGeckoUrl).pipe(
            map(data => data.bitcoin.usd),
            catchError(err => {
                console.error('Error fetching BTC:', err);
                return of(null);
            })
        );

        const gold$ = this.http.get<any>(`${this.goldApiUrl}/XAU/USD`, { headers }).pipe(
            map(data => data.price),
            catchError(err => {
                console.warn('Error fetching Gold (check API key):', err);
                return of(null);
            })
        );

        const silver$ = this.http.get<any>(`${this.goldApiUrl}/XAG/USD`, { headers }).pipe(
            map(data => data.price),
            catchError(err => {
                console.warn('Error fetching Silver (check API key):', err);
                return of(null);
            })
        );

        return forkJoin({
            bitcoin: btc$,
            gold: gold$,
            silver: silver$
        });
    }
}
