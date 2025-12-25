import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLang = new BehaviorSubject<string>('en');
    public currentLang$ = this.currentLang.asObservable();

    private translationsSubject = new BehaviorSubject<any>({});
    public translations$ = this.translationsSubject.asObservable();

    private translations: any = {};

    constructor() {
        this.loadTranslations('en');
    }

    setLanguage(lang: string) {
        this.currentLang.next(lang);
        this.loadTranslations(lang);
    }

    getCurrentLang(): string {
        return this.currentLang.value;
    }

    private async loadTranslations(lang: string) {
        try {
            const response = await fetch(`assets/i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.translationsSubject.next(this.translations);
        } catch (error) {
            console.error(`Could not load translations for ${lang}`, error);
        }
    }

    translate(key: string): string {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    }
}
