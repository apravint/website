import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NewsArticle {
    title: string;
    description: string;
    link: string;
    image_url: string | null;
    source_id: string;
    pubDate: string;
    category: string[];
}

export interface NewsResponse {
    status: string;
    totalResults: number;
    results: NewsArticle[];
}

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private apiUrl = 'https://newsdata.io/api/1/news';

    constructor(private http: HttpClient) { }

    getNews(category?: string, country: string = 'in'): Observable<NewsArticle[]> {
        let url = `${this.apiUrl}?apikey=${environment.newsApiKey}&country=${country}&language=en`;

        if (category && category !== 'top') {
            url += `&category=${category}`;
        }

        return this.http.get<NewsResponse>(url).pipe(
            map(response => response.results || []),
            catchError(err => {
                console.error('Error fetching news:', err);
                return of([]);
            })
        );
    }
}
