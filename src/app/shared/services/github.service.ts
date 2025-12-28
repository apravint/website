import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GitHubStats {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    publicRepos: number;
    followers: number;
    following: number;
    profileUrl: string;
}

export interface GitHubRepo {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
}

@Injectable({
    providedIn: 'root'
})
export class GitHubService {
    private apiUrl = 'https://api.github.com';

    constructor(private http: HttpClient) { }

    /**
     * Get user profile stats
     */
    getUserStats(username: string): Observable<GitHubStats | null> {
        return this.http.get<any>(`${this.apiUrl}/users/${username}`).pipe(
            map(data => ({
                username: data.login,
                name: data.name || data.login,
                avatar: data.avatar_url,
                bio: data.bio || '',
                publicRepos: data.public_repos,
                followers: data.followers,
                following: data.following,
                profileUrl: data.html_url
            })),
            catchError(err => {
                console.error('Error fetching GitHub stats:', err);
                return of(null);
            })
        );
    }

    /**
     * Get top repositories (by stars)
     */
    getTopRepos(username: string, limit: number = 3): Observable<GitHubRepo[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/${username}/repos?sort=stars&per_page=${limit}`).pipe(
            map(repos => repos.map(repo => ({
                name: repo.name,
                description: repo.description || 'No description',
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language || 'Unknown',
                url: repo.html_url
            }))),
            catchError(err => {
                console.error('Error fetching GitHub repos:', err);
                return of([]);
            })
        );
    }

    /**
     * Get total stars across all repos
     */
    getTotalStars(username: string): Observable<number> {
        return this.http.get<any[]>(`${this.apiUrl}/users/${username}/repos?per_page=100`).pipe(
            map(repos => repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)),
            catchError(err => {
                console.error('Error calculating total stars:', err);
                return of(0);
            })
        );
    }
}
