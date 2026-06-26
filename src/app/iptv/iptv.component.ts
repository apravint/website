import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SeoService } from '../shared/seo.service';

interface IPTVChannel {
  name: string;
  logo: string;
  category: string;
  url: string;
}

@Component({
  selector: 'app-iptv',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './iptv.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./iptv.component.scss']
})
export class IptvComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  private http = inject(HttpClient);
  private seo = inject(SeoService);
  private cdr = inject(ChangeDetectorRef);

  // M3U Playlist States
  playlistUrl = '';
  parsedChannels: IPTVChannel[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  searchQuery = '';
  isLoading = false;
  errorMessage = '';

  // Player States
  currentChannel: IPTVChannel | null = null;
  isPlaying = false;
  private hlsPlayer: any = null; // hls.js player reference
  private hlsScriptElement: HTMLScriptElement | null = null;

  // Curated 100% Legal Public Streams
  sampleChannels: IPTVChannel[] = [
    {
      name: 'DW News (English)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Deutsche_Welle_logo_2012.svg',
      category: 'News',
      url: 'https://dwamdstream102.akamaized.net/hls/live/2014104/dwamdstream102/index.m3u8'
    },
    {
      name: 'France 24 (English)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/France_24_logo.svg',
      category: 'News',
      url: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8'
    },
    {
      name: 'NHK World Japan',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/NHK_World_logo.svg',
      category: 'News',
      url: 'https://nhkworld.akamaized.net/hls/live/2034591/nhkworld/master.m3u8'
    },
    {
      name: 'NASA TV Live',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
      category: 'Science',
      url: 'https://ntv1.nasatv.live/nasatv/HST-PL-54/chunklist.m3u8'
    },
    {
      name: 'Red Bull TV (Sports)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Red_Bull_TV_logo.svg',
      category: 'Sports',
      url: 'https://rbmn-live.akamaized.net/hls/live/590945/sports/master.m3u8'
    }
  ];

  constructor() {
    this.seo.updateMetaTags({
      title: 'Legal IPTV Player & M3U Playlist Viewer | Pravin Tamilan',
      description: 'Stream public channels and parse custom .m3u playlists in your browser locally and securely using our client-side IPTV player.',
      url: 'https://pravintamilan.com/iptv'
    });
  }

  ngOnInit(): void {
    this.loadHlsLibrary();
  }

  ngOnDestroy(): void {
    this.destroyHlsPlayer();
    if (this.hlsScriptElement) {
      document.body.removeChild(this.hlsScriptElement);
    }
  }

  // Inject hls.js library dynamically
  private loadHlsLibrary(): void {
    if ((window as any).Hls) return; // Already loaded

    this.hlsScriptElement = document.createElement('script');
    this.hlsScriptElement.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    this.hlsScriptElement.async = true;
    this.hlsScriptElement.onload = () => {
      console.log('Hls.js loaded successfully from CDN.');
      // Auto play sample channels if loaded
    };
    this.hlsScriptElement.onerror = () => {
      console.error('Failed to load Hls.js script.');
      this.errorMessage = 'Could not load media decoder library. Please refresh.';
    };
    document.body.appendChild(this.hlsScriptElement);
  }

  loadSamplePlaylist(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.parsedChannels = [...this.sampleChannels];
      this.extractCategories();
      this.isLoading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 500);
  }

  // Parse playlist URL
  fetchPlaylistFromUrl(): void {
    if (!this.playlistUrl.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get(this.playlistUrl, { responseType: 'text' }).subscribe({
      next: (data) => {
        this.parseM3UPlaylist(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CORS or Network Error fetching M3U', err);
        this.errorMessage = 'Failed to load remote M3U. Check CORS policies or internet connection. (Fallback: Upload a local .m3u file below)';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Handle local file upload
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    this.isLoading = true;
    this.errorMessage = '';

    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseM3UPlaylist(text);
      this.isLoading = false;
      this.cdr.detectChanges();
    };

    reader.onerror = () => {
      this.errorMessage = 'Failed to read local file.';
      this.isLoading = false;
      this.cdr.detectChanges();
    };

    reader.readAsText(file);
  }

  // Playlist parser
  private parseM3UPlaylist(text: string): void {
    const lines = text.split('\n');
    const channels: IPTVChannel[] = [];
    let tempChannel: Partial<IPTVChannel> | null = null;

    if (!text.includes('#EXTM3U')) {
      this.errorMessage = 'Invalid file format. Playlist must start with #EXTM3U';
      return;
    }

    for (let line of lines) {
      line = line.trim();

      if (line.startsWith('#EXTINF:')) {
        // Extract properties using regex
        const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
        const groupMatch = line.match(/group-title="([^"]+)"/i);
        const nameIndex = line.lastIndexOf(',');
        const name = nameIndex !== -1 ? line.substring(nameIndex + 1).trim() : 'Unnamed Stream';

        tempChannel = {
          name: name,
          logo: logoMatch ? logoMatch[1] : '',
          category: groupMatch ? groupMatch[1] : 'General',
          url: ''
        };
      } else if (line && !line.startsWith('#') && tempChannel) {
        tempChannel.url = line;
        channels.push(tempChannel as IPTVChannel);
        tempChannel = null;
      }
    }

    if (channels.length === 0) {
      this.errorMessage = 'Parsed 0 channels. Please verify M3U formatting.';
    } else {
      this.parsedChannels = channels;
      this.extractCategories();
      this.errorMessage = '';
    }
  }

  private extractCategories(): void {
    const list = this.parsedChannels.map(c => c.category);
    this.categories = ['All', ...Array.from(new Set(list))];
    this.selectedCategory = 'All';
  }

  // Filter channels based on tab selections
  getFilteredChannels(): IPTVChannel[] {
    return this.parsedChannels.filter(c => {
      const matchesCategory = this.selectedCategory === 'All' || c.category === this.selectedCategory;
      const matchesSearch = c.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  // Play a channel
  playChannel(channel: IPTVChannel): void {
    this.currentChannel = channel;
    this.isPlaying = true;
    this.cdr.detectChanges();

    const videoElement = this.videoPlayer.nativeElement;
    this.destroyHlsPlayer();

    const Hls = (window as any).Hls;

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari/iOS)
      videoElement.src = channel.url;
      videoElement.play().catch(err => console.warn('Native playback play block', err));
    } else if (Hls && Hls.isSupported()) {
      // Desktop Chrome/Firefox with hls.js
      this.hlsPlayer = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true
      });
      this.hlsPlayer.loadSource(channel.url);
      this.hlsPlayer.attachMedia(videoElement);
      
      this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(err => console.warn('Hls.js play block', err));
      });

      this.hlsPlayer.on(Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error. Try recovery.', data);
              this.hlsPlayer.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error. Try recovery.', data);
              this.hlsPlayer.recoverMediaError();
              break;
            default:
              console.error('Fatal decoding error. Stop playback.', data);
              this.destroyHlsPlayer();
              this.errorMessage = 'Unable to play stream: decoding error.';
              break;
          }
        }
      });
    } else {
      this.errorMessage = 'HLS streaming is not supported in this browser. Try Chrome/Safari.';
    }
  }

  private destroyHlsPlayer(): void {
    if (this.hlsPlayer) {
      this.hlsPlayer.destroy();
      this.hlsPlayer = null;
    }
  }
}
