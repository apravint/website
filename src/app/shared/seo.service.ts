import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SeoService {

    constructor(private titleService: Title, private metaService: Meta) { }

    updateTitle(title: string) {
        this.titleService.setTitle(title);
        this.updateOpenGraphTags({ title });
    }

    updateMetaTags(config: { title?: string, description?: string, image?: string, url?: string }) {
        if (config.title) {
            this.updateTitle(config.title);
        }
        if (config.description) {
            this.metaService.updateTag({ name: 'description', content: config.description });
            this.updateOpenGraphTags({ description: config.description });
        }
        if (config.image) {
            this.updateOpenGraphTags({ image: config.image });
        }
        if (config.url) {
            this.updateOpenGraphTags({ url: config.url });
        }
    }

    updateOpenGraphTags(config: { title?: string, description?: string, image?: string, url?: string }) {
        if (config.title) {
            this.metaService.updateTag({ property: 'og:title', content: config.title });
            this.metaService.updateTag({ name: 'twitter:title', content: config.title });
        }
        if (config.description) {
            this.metaService.updateTag({ property: 'og:description', content: config.description });
            this.metaService.updateTag({ name: 'twitter:description', content: config.description });
        }
        if (config.image) {
            this.metaService.updateTag({ property: 'og:image', content: config.image });
            this.metaService.updateTag({ name: 'twitter:image', content: config.image });
        }
        if (config.url) {
            this.metaService.updateTag({ property: 'og:url', content: config.url });
        }
    }
}
