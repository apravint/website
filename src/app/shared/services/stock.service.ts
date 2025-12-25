import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface StockQuote {
    symbol: string;
    name: string;
    exchange: string;
    currency: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    previousClose: number;
    change: number;
    percentChange: number;
    isUp: boolean;
}

export interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    country: string;
    currency: string;
    type: string;
}

export interface IndicesData {
    nifty50: StockQuote | null;
    sensex: StockQuote | null;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private baseUrl = 'https://api.twelvedata.com';
    private apiKey = environment.twelveDataApiKey;

    constructor(private http: HttpClient) { }

    /**
     * Fetch Nifty 50 and Sensex quotes
     */
    getIndices(): Observable<IndicesData> {
        const nifty$ = this.getQuote('NIFTY 50', 'NSE').pipe(
            catchError(err => {
                console.warn('Error fetching Nifty 50:', err);
                return of(null);
            })
        );

        const sensex$ = this.getQuote('SENSEX', 'BSE').pipe(
            catchError(err => {
                console.warn('Error fetching Sensex:', err);
                return of(null);
            })
        );

        return forkJoin({
            nifty50: nifty$,
            sensex: sensex$
        });
    }

    /**
     * Get quote for a specific stock
     */
    getQuote(symbol: string, exchange?: string): Observable<StockQuote | null> {
        let url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
        if (exchange) {
            url += `&exchange=${encodeURIComponent(exchange)}`;
        }

        return this.http.get<any>(url).pipe(
            map(data => {
                if (data.code) {
                    // API returned an error
                    console.warn('Twelve Data error:', data.message);
                    return null;
                }
                return this.mapQuoteResponse(data);
            }),
            catchError(err => {
                console.error('Error fetching quote:', err);
                return of(null);
            })
        );
    }

    /**
     * Search for stocks globally
     */
    searchStocks(query: string): Observable<SearchResult[]> {
        if (!query || query.length < 2) {
            return of([]);
        }

        const url = `${this.baseUrl}/symbol_search?symbol=${encodeURIComponent(query)}&outputsize=10&apikey=${this.apiKey}`;

        return this.http.get<any>(url).pipe(
            map(response => {
                if (response.data) {
                    return response.data.map((item: any) => ({
                        symbol: item.symbol,
                        name: item.instrument_name,
                        exchange: item.exchange,
                        country: item.country,
                        currency: item.currency,
                        type: item.instrument_type
                    }));
                }
                return [];
            }),
            catchError(err => {
                console.error('Error searching stocks:', err);
                return of([]);
            })
        );
    }

    private mapQuoteResponse(data: any): StockQuote {
        const change = parseFloat(data.change) || 0;
        const percentChange = parseFloat(data.percent_change) || 0;

        return {
            symbol: data.symbol,
            name: data.name,
            exchange: data.exchange,
            currency: data.currency || 'USD',
            price: parseFloat(data.close) || 0,
            open: parseFloat(data.open) || 0,
            high: parseFloat(data.high) || 0,
            low: parseFloat(data.low) || 0,
            close: parseFloat(data.close) || 0,
            previousClose: parseFloat(data.previous_close) || 0,
            change: change,
            percentChange: percentChange,
            isUp: change >= 0
        };
    }
}
