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
    private apiUrl = 'https://newsdata.io/api/1/latest';

    constructor(private http: HttpClient) { }

    getNews(category?: string, country: string = 'in'): Observable<NewsArticle[]> {
        if (!environment.newsApiKey || environment.newsApiKey === 'YOUR_NEWS_API_KEY') {
            return of(this.getFallbackNews(category));
        }

        let url = `${this.apiUrl}?apikey=${environment.newsApiKey}&country=${country}&language=en`;

        if (category && category !== 'top') {
            url += `&category=${category}`;
        }

        return this.http.get<NewsResponse>(url).pipe(
            map(response => {
                if (!response.results || response.results.length === 0) {
                    return this.getFallbackNews(category);
                }
                return response.results;
            }),
            catchError(err => {
                console.error('Error fetching news, returning fallbacks:', err);
                return of(this.getFallbackNews(category));
            })
        );
    }

    private getFallbackNews(category?: string): NewsArticle[] {
        const allMock: NewsArticle[] = [
            {
                title: "Major Archaeological Discoveries at Keeladi Reveal Ancient Trade Links",
                description: "The latest phase of excavations at the Keeladi archaeological site in Tamil Nadu has unearthed pottery shards and coins indicating robust commercial relations with Rome and the Mediterranean region dating back over 2,500 years.",
                link: "https://pravintamilan.com/news/keeladi-excavations",
                image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
                source_id: "Archaeology India",
                pubDate: new Date().toISOString(),
                category: ["top"]
            },
            {
                title: "Global Space Alliance Commences Construction of Lunar Orbital Base",
                description: "Space agencies across the globe have finalized the architectural blueprints and officially commenced component production for the upcoming Lunar Gateway orbital base, paving the way for sustained manned missions.",
                link: "https://pravintamilan.com/news/lunar-orbital-base",
                image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                source_id: "Cosmic News",
                pubDate: new Date().toISOString(),
                category: ["top", "science"]
            },
            {
                title: "Open-Source AI Models Reach Parity with Proprietary Assistants",
                description: "Leading tech researchers have released the benchmark scores for a new open-source large language model showing matching capability and performance against major commercial subscription engines.",
                link: "https://pravintamilan.com/news/open-source-ai",
                image_url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
                source_id: "Tech Insider",
                pubDate: new Date().toISOString(),
                category: ["technology"]
            },
            {
                title: "Next-Generation Solid State Batteries Enter Commercial Pilot Production",
                description: "An innovative battery manufacturer has begun operating its automated pilot assembly line, delivering solid-state cells that promise double the energy density of traditional lithium-ion batteries.",
                link: "https://pravintamilan.com/news/solid-state-batteries",
                image_url: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=600&q=80",
                source_id: "Energy Reports",
                pubDate: new Date().toISOString(),
                category: ["technology", "business"]
            },
            {
                title: "Global Supply Chains Shift Toward Green Shipping Corridors",
                description: "Maritime authorities report a significant increase in the adoption of bio-methanol and wind-assisted propulsion systems on commercial container ships routing through designated zero-emission shipping lanes.",
                link: "https://pravintamilan.com/news/green-shipping",
                image_url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=600&q=80",
                source_id: "Logistics Weekly",
                pubDate: new Date().toISOString(),
                category: ["business"]
            },
            {
                title: "Deep Space Telescope Detects Water Vapor on Habitable-Zone Exoplanet",
                description: "Astrophysicists analyzing spectroscopic data from the James Webb space observatory have confirmed the signature of water vapor in the atmosphere of a super-Earth planet orbiting a nearby dwarf star.",
                link: "https://pravintamilan.com/news/exoplanet-water-vapor",
                image_url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80",
                source_id: "Space Science Journal",
                pubDate: new Date().toISOString(),
                category: ["science"]
            },
            {
                title: "Biotech Breakthrough: Targeted CRISPR Therapy Successfully Treats Genetic Condition",
                description: "Clinical trials have yielded outstanding success for a new genetic correction technique targeting cellular mutations, restoring normal functionality in patients diagnosed with congenital visual impairments.",
                link: "https://pravintamilan.com/news/crispr-biotech-success",
                image_url: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=600&q=80",
                source_id: "Medical Frontiers",
                pubDate: new Date().toISOString(),
                category: ["science"]
            },
            {
                title: "Formula E Unveils High-Speed Gen4 Racing Platform for 2026 Season",
                description: "The electric street racing federation has officially pulled the covers off its Gen4 racer, capable of reaching speeds exceeding 360 km/h with high-efficiency energy regeneration capability.",
                link: "https://pravintamilan.com/news/formula-e-gen4",
                image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80",
                source_id: "Motorsport Daily",
                pubDate: new Date().toISOString(),
                category: ["sports"]
            }
        ];

        if (!category || category === 'top') {
            return allMock.filter(a => a.category.includes('top'));
        }
        return allMock.filter(a => a.category.includes(category));
    }
}
