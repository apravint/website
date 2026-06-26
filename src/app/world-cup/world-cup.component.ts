import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SeoService } from '../shared/seo.service';

interface TeamStats {
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  points: number;
}

interface Group {
  name: string;
  teams: TeamStats[];
}

interface Match {
  id: number;
  group: string;
  team1: string;
  flag1: string;
  score1: number | null;
  team2: string;
  flag2: string;
  score2: number | null;
  date: string;
  time: string;
  venue: string;
  status: 'Scheduled' | 'Live' | 'FT';
}

@Component({
  selector: 'app-world-cup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './world-cup.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./world-cup.component.scss']
})
export class WorldCupComponent implements OnInit {
  private http = inject(HttpClient);
  private seo = inject(SeoService);

  activeTab: 'standings' | 'matches' | 'news' = 'standings';
  searchQuery = '';
  newsItems: any[] = [];
  isNewsLoading = false;
  newsError = '';

  // 2026 World Cup Groups (48 teams, 12 groups of 4)
  groups: Group[] = [
    {
      name: 'Group A',
      teams: [
        { name: 'United States', flag: '🇺🇸', played: 2, won: 1, drawn: 1, lost: 0, gd: 2, points: 4 },
        { name: 'Colombia', flag: '🇨🇴', played: 2, won: 1, drawn: 0, lost: 1, gd: 0, points: 3 },
        { name: 'Switzerland', flag: '🇨🇭', played: 2, won: 1, drawn: 0, lost: 1, gd: -1, points: 3 },
        { name: 'Angola', flag: '🇦🇴', played: 2, won: 0, drawn: 1, lost: 1, gd: -1, points: 1 }
      ]
    },
    {
      name: 'Group B',
      teams: [
        { name: 'Mexico', flag: '🇲🇽', played: 2, won: 2, drawn: 0, lost: 0, gd: 3, points: 6 },
        { name: 'Sweden', flag: '🇸🇪', played: 2, won: 1, drawn: 0, lost: 1, gd: 1, points: 3 },
        { name: 'Cameroon', flag: '🇨🇲', played: 2, won: 1, drawn: 0, lost: 1, gd: -1, points: 3 },
        { name: 'New Zealand', flag: '🇳🇿', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group C',
      teams: [
        { name: 'Canada', flag: '🇨🇦', played: 2, won: 1, drawn: 1, lost: 0, gd: 1, points: 4 },
        { name: 'Uruguay', flag: '🇺🇾', played: 2, won: 1, drawn: 0, lost: 1, gd: 2, points: 3 },
        { name: 'South Korea', flag: '🇰🇷', played: 2, won: 1, drawn: 0, lost: 1, gd: -2, points: 3 },
        { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', played: 2, won: 0, drawn: 1, lost: 1, gd: -1, points: 1 }
      ]
    },
    {
      name: 'Group D',
      teams: [
        { name: 'Argentina', flag: '🇦🇷', played: 2, won: 2, drawn: 0, lost: 0, gd: 5, points: 6 },
        { name: 'Morocco', flag: '🇲🇦', played: 2, won: 1, drawn: 0, lost: 1, gd: 1, points: 3 },
        { name: 'Chile', flag: '🇨🇱', played: 2, won: 1, drawn: 0, lost: 1, gd: -2, points: 3 },
        { name: 'Poland', flag: '🇵🇱', played: 2, won: 0, drawn: 0, lost: 2, gd: -4, points: 0 }
      ]
    },
    {
      name: 'Group E',
      teams: [
        { name: 'Brazil', flag: '🇧🇷', played: 2, won: 1, drawn: 1, lost: 0, gd: 3, points: 4 },
        { name: 'Japan', flag: '🇯🇵', played: 2, won: 1, drawn: 1, lost: 0, gd: 1, points: 4 },
        { name: 'Serbia', flag: '🇷🇸', played: 2, won: 1, drawn: 0, lost: 1, gd: 0, points: 3 },
        { name: 'Costa Rica', flag: '🇨🇷', played: 2, won: 0, drawn: 0, lost: 2, gd: -4, points: 0 }
      ]
    },
    {
      name: 'Group F',
      teams: [
        { name: 'France', flag: '🇫🇷', played: 2, won: 2, drawn: 0, lost: 0, gd: 4, points: 6 },
        { name: 'Austria', flag: '🇦🇹', played: 2, won: 1, drawn: 0, lost: 1, gd: 1, points: 3 },
        { name: 'Nigeria', flag: '🇳🇬', played: 2, won: 1, drawn: 0, lost: 1, gd: -2, points: 3 },
        { name: 'Honduras', flag: '🇭🇳', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group G',
      teams: [
        { name: 'Spain', flag: '🇪🇸', played: 2, won: 1, drawn: 1, lost: 0, gd: 2, points: 4 },
        { name: 'Croatia', flag: '🇭🇷', played: 2, won: 1, drawn: 1, lost: 0, gd: 1, points: 4 },
        { name: 'Egypt', flag: '🇪🇬', played: 2, won: 1, drawn: 0, lost: 1, gd: 0, points: 3 },
        { name: 'Panama', flag: '🇵🇦', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group H',
      teams: [
        { name: 'Germany', flag: '🇩🇪', played: 2, won: 2, drawn: 0, lost: 0, gd: 4, points: 6 },
        { name: 'Ecuador', flag: '🇪🇨', played: 2, won: 1, drawn: 0, lost: 1, gd: 1, points: 3 },
        { name: 'Iran', flag: '🇮🇷', played: 2, won: 1, drawn: 0, lost: 1, gd: -2, points: 3 },
        { name: 'Peru', flag: '🇵🇪', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group I',
      teams: [
        { name: 'Portugal', flag: '🇵🇹', played: 2, won: 2, drawn: 0, lost: 0, gd: 3, points: 6 },
        { name: 'Belgium', flag: '🇧🇪', played: 2, won: 1, drawn: 1, lost: 0, gd: 2, points: 4 },
        { name: 'Ghana', flag: '🇬🇭', played: 2, won: 0, drawn: 1, lost: 1, gd: -2, points: 1 },
        { name: 'Jamaica', flag: '🇯🇲', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group J',
      teams: [
        { name: 'Netherlands', flag: '🇳🇱', played: 2, won: 1, drawn: 1, lost: 0, gd: 2, points: 4 },
        { name: 'Denmark', flag: '🇩🇰', played: 2, won: 1, drawn: 1, lost: 0, gd: 1, points: 4 },
        { name: 'Algeria', flag: '🇩🇿', played: 2, won: 1, drawn: 0, lost: 1, gd: -1, points: 3 },
        { name: 'Canada B', flag: '🇨🇦', played: 2, won: 0, drawn: 0, lost: 2, gd: -2, points: 0 }
      ]
    },
    {
      name: 'Group K',
      teams: [
        { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', played: 2, won: 2, drawn: 0, lost: 0, gd: 4, points: 6 },
        { name: 'Australia', flag: '🇦🇺', played: 2, won: 1, drawn: 0, lost: 1, gd: 0, points: 3 },
        { name: 'Tunisia', flag: '🇹🇳', played: 2, won: 1, drawn: 0, lost: 1, gd: -1, points: 3 },
        { name: 'Iraq', flag: '🇮🇶', played: 2, won: 0, drawn: 0, lost: 2, gd: -3, points: 0 }
      ]
    },
    {
      name: 'Group L',
      teams: [
        { name: 'Italy', flag: '🇮🇹', played: 2, won: 1, drawn: 1, lost: 0, gd: 2, points: 4 },
        { name: 'Ukraine', flag: '🇺🇦', played: 2, won: 1, drawn: 1, lost: 0, gd: 1, points: 4 },
        { name: 'Paraguay', flag: '🇵🇾', played: 2, won: 1, drawn: 0, lost: 1, gd: -1, points: 3 },
        { name: 'China', flag: '🇨🇳', played: 2, won: 0, drawn: 0, lost: 2, gd: -2, points: 0 }
      ]
    }
  ];

  // Matches List (Group Stage & Knockouts schedule)
  matches: Match[] = [
    { id: 1, group: 'Group A', team1: 'United States', flag1: '🇺🇸', score1: 3, team2: 'Switzerland', flag2: '🇨🇭', score2: 1, date: 'June 11, 2026', time: '17:00', venue: 'Estadio Azteca, Mexico City', status: 'FT' },
    { id: 2, group: 'Group A', team1: 'Colombia', flag1: '🇨🇴', score1: 2, team2: 'Angola', flag2: '🇦🇴', score2: 0, date: 'June 12, 2026', time: '15:00', venue: 'MetLife Stadium, New York', status: 'FT' },
    { id: 3, group: 'Group B', team1: 'Mexico', flag1: '🇲🇽', score1: 2, team2: 'New Zealand', flag2: '🇳🇿', score2: 0, date: 'June 12, 2026', time: '18:00', venue: 'Estadio BBVA, Monterrey', status: 'FT' },
    { id: 4, group: 'Group B', team1: 'Sweden', flag1: '🇸🇪', score1: 1, team2: 'Cameroon', flag2: '🇨🇲', score2: 2, date: 'June 13, 2026', time: '12:00', venue: 'SoFi Stadium, Los Angeles', status: 'FT' },
    { id: 5, group: 'Group A', team1: 'United States', flag1: '🇺🇸', score1: 1, team2: 'Angola', flag2: '🇦🇴', score2: 1, date: 'June 17, 2026', time: '19:00', venue: 'AT&T Stadium, Dallas', status: 'FT' },
    { id: 6, group: 'Group A', team1: 'Colombia', flag1: '🇨🇴', score1: 0, team2: 'Switzerland', flag2: '🇨🇭', score2: 1, date: 'June 17, 2026', time: '21:00', venue: 'Mercedes-Benz Stadium, Atlanta', status: 'FT' },
    { id: 7, group: 'Group B', team1: 'Mexico', flag1: '🇲🇽', score1: 3, team2: 'Sweden', flag2: '🇸🇪', score2: 2, date: 'June 18, 2026', time: '17:00', venue: 'Akron Stadium, Guadalajara', status: 'FT' },
    { id: 8, group: 'Group B', team1: 'Cameroon', flag1: '🇨🇲', score1: 1, team2: 'New Zealand', flag2: '🇳🇿', score2: 0, date: 'June 18, 2026', time: '20:00', venue: 'Lumen Field, Seattle', status: 'FT' },
    { id: 9, group: 'Group C', team1: 'Canada', flag1: '🇨🇦', score1: null, team2: 'Uruguay', flag2: '🇺🇾', score2: null, date: 'June 25, 2026', time: '18:00', venue: 'BC Place, Vancouver', status: 'Scheduled' },
    { id: 10, group: 'Group C', team1: 'South Korea', flag1: '🇰🇷', score1: null, team2: 'Scotland', flag2: '🏴\u200d󠁢󠁳󠁣󠁴󠁿', score2: null, date: 'June 25, 2026', time: '21:00', venue: 'Gillette Stadium, Boston', status: 'Scheduled' },
    { id: 11, group: 'Group D', team1: 'Argentina', flag1: '🇦🇷', score1: null, team2: 'Morocco', flag2: '🇲🇦', score2: null, date: 'June 26, 2026', time: '17:00', venue: 'Hard Rock Stadium, Miami', status: 'Scheduled' }
  ];

  constructor() {
    this.seo.updateMetaTags({
      title: 'FIFA World Cup 2026 Dashboard | Pravin Tamilan',
      description: 'Live standings, matches calendar, team statistics, and trending news for the FIFA World Cup 2026 in North America.',
      url: 'https://pravintamilan.com/worldcup'
    });
  }

  ngOnInit(): void {
    this.fetchWorldCupNews();
  }

  // Google News search via rss2json
  fetchWorldCupNews(): void {
    this.isNewsLoading = true;
    this.newsError = '';
    const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=FIFA+World+Cup+2026&hl=en-US&gl=US&ceid=US:en');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          this.newsItems = response.items || [];
        } else {
          this.newsError = 'Unable to parse RSS feed.';
        }
        this.isNewsLoading = false;
      },
      error: (err) => {
        console.error('Error loading RSS sports feed', err);
        this.newsError = 'Could not fetch news items. Check your internet connection.';
        this.isNewsLoading = false;
      }
    });
  }

  // Standings filtered by search query
  getFilteredGroups(): Group[] {
    if (!this.searchQuery.trim()) return this.groups;
    
    return this.groups.map(g => {
      const filteredTeams = g.teams.filter(t => 
        t.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      return { name: g.name, teams: filteredTeams };
    }).filter(g => g.teams.length > 0);
  }

  // Matches filtered by search query
  getFilteredMatches(): Match[] {
    if (!this.searchQuery.trim()) return this.matches;

    return this.matches.filter(m => 
      m.team1.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      m.team2.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      m.group.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
