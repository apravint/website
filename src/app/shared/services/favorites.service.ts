import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    private readonly STORAGE_KEY = 'kavithai_favorites';

    /**
     * Get all favorited poem IDs
     */
    getFavorites(): Set<string> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return new Set(JSON.parse(stored));
            } catch {
                return new Set();
            }
        }
        return new Set();
    }

    /**
     * Check if a poem is favorited
     */
    isFavorite(poemId: string): boolean {
        return this.getFavorites().has(poemId);
    }

    /**
     * Toggle favorite status for a poem
     */
    toggleFavorite(poemId: string): boolean {
        const favorites = this.getFavorites();
        if (favorites.has(poemId)) {
            favorites.delete(poemId);
        } else {
            favorites.add(poemId);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...favorites]));
        return favorites.has(poemId);
    }

    /**
     * Get count of favorites
     */
    getFavoriteCount(): number {
        return this.getFavorites().size;
    }
}
