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

    /**
     * Get Bitcoin 7-day price history for sparkline
     */
    getBitcoinHistory(): Observable<number[]> {
        const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily';
        return this.http.get<any>(url).pipe(
            map(data => data.prices.map((p: number[]) => p[1])),
            catchError(err => {
                console.warn('Error fetching BTC history:', err);
                // Return mock data for demo
                return of(this.generateMockData(98000, 7));
            })
        );
    }

    /**
     * Generate mock sparkline data for assets without free historical API
     */
    generateMockData(basePrice: number, days: number): number[] {
        const data: number[] = [];
        let price = basePrice * (0.95 + Math.random() * 0.05);
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.48) * basePrice * 0.02;
            price = price + change;
            data.push(Math.round(price * 100) / 100);
        }
        return data;
    }
}
