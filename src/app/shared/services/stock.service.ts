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
        if (!this.apiKey || this.apiKey === 'YOUR_TWELVE_DATA_API_KEY') {
            return of({
                nifty50: {
                    symbol: 'NIFTY 50',
                    name: 'Nifty 50 Index',
                    exchange: 'NSE',
                    currency: 'INR',
                    price: 23501.20,
                    open: 23420.50,
                    high: 23550.00,
                    low: 23410.10,
                    close: 23501.20,
                    previousClose: 23415.80,
                    change: 85.40,
                    percentChange: 0.36,
                    isUp: true
                },
                sensex: {
                    symbol: 'SENSEX',
                    name: 'BSE Sensex Index',
                    exchange: 'BSE',
                    currency: 'INR',
                    price: 77301.15,
                    open: 77050.40,
                    high: 77450.80,
                    low: 77010.20,
                    close: 77301.15,
                    previousClose: 77020.10,
                    change: 281.05,
                    percentChange: 0.36,
                    isUp: true
                }
            });
        }

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
        if (!this.apiKey || this.apiKey === 'YOUR_TWELVE_DATA_API_KEY') {
            const sym = symbol.toUpperCase();
            const baseQuote = {
                symbol: sym,
                name: sym === 'AAPL' ? 'Apple Inc.' : sym === 'RELIANCE' ? 'Reliance Industries Ltd.' : sym === 'TCS' ? 'Tata Consultancy Services Ltd.' : `${sym} Corp`,
                exchange: exchange || 'NSE',
                currency: exchange === 'NASDAQ' ? 'USD' : 'INR',
                price: sym === 'AAPL' ? 180.50 : sym === 'RELIANCE' ? 2450.00 : sym === 'TCS' ? 3820.00 : 150.00,
                open: sym === 'AAPL' ? 179.20 : sym === 'RELIANCE' ? 2435.00 : sym === 'TCS' ? 3800.00 : 148.00,
                high: sym === 'AAPL' ? 181.40 : sym === 'RELIANCE' ? 2465.00 : sym === 'TCS' ? 3850.00 : 152.00,
                low: sym === 'AAPL' ? 178.90 : sym === 'RELIANCE' ? 2420.00 : sym === 'TCS' ? 3780.00 : 147.00,
                close: sym === 'AAPL' ? 180.50 : sym === 'RELIANCE' ? 2450.00 : sym === 'TCS' ? 3820.00 : 150.00,
                previousClose: sym === 'AAPL' ? 179.00 : sym === 'RELIANCE' ? 2440.00 : sym === 'TCS' ? 3810.00 : 149.00,
                change: sym === 'AAPL' ? 1.50 : sym === 'RELIANCE' ? 10.00 : sym === 'TCS' ? 10.00 : 1.00,
                percentChange: sym === 'AAPL' ? 0.84 : sym === 'RELIANCE' ? 0.41 : sym === 'TCS' ? 0.26 : 0.67,
                isUp: true
            };
            return of(baseQuote);
        }

        let url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
        if (exchange) {
            url += `&exchange=${encodeURIComponent(exchange)}`;
        }

        return this.http.get<any>(url).pipe(
            map(data => {
                if (data.code) {
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

        if (!this.apiKey || this.apiKey === 'YOUR_TWELVE_DATA_API_KEY') {
            const allMock: SearchResult[] = [
                { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', country: 'India', currency: 'INR', type: 'Common Stock' },
                { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', country: 'India', currency: 'INR', type: 'Common Stock' },
                { symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', country: 'India', currency: 'INR', type: 'Common Stock' },
                { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', country: 'United States', currency: 'USD', type: 'Common Stock' },
                { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', country: 'United States', currency: 'USD', type: 'Common Stock' }
            ];
            const q = query.toLowerCase();
            return of(allMock.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)));
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
