import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../shared/seo.service';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'ascii' | 'success';
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('cmdInput') private cmdInput!: ElementRef;
  @ViewChild('matrixCanvas') private matrixCanvas!: ElementRef<HTMLCanvasElement>;

  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);

  // Command input field
  command = '';
  promptPrefix = 'guest@pravintamilan:~$ ';
  
  // Terminal history
  history: TerminalLine[] = [];
  commandHistory: string[] = [];
  historyIndex = -1;

  // Matrix screensaver state
  isMatrixMode = false;
  private matrixInterval: any = null;

  constructor() {
    this.seo.updateMetaTags({
      title: 'Interactive CLI Terminal Simulator | Pravin Tamilan',
      description: 'Run commands, view resume details, read Tamil poetry, or start animations inside our browser-based Termux simulator.',
      url: 'https://pravintamilan.com/terminal'
    });
  }

  ngOnInit(): void {
    this.showWelcomeMessage();

    // Check for auto-run command query parameter
    this.route.queryParams.subscribe(params => {
      const runCmd = params['run'];
      if (runCmd) {
        setTimeout(() => {
          this.command = runCmd;
          this.handleCommandSubmit();
        }, 600);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopMatrixEffect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Welcome banner on startup
  private showWelcomeMessage(): void {
    this.history.push(
      { text: '========================================================', type: 'ascii' },
      { text: '  ____                  _       ______                _ __', type: 'ascii' },
      { text: ' / __ \\_________ __   _(_)___  /_  __/___ _____ ___  (_) /___ _____', type: 'ascii' },
      { text: '/ /_/ / ___/ __ `/ | / / / __ \\ / / / __ `/ __ `__ \\/ / / __ `/ __ \\', type: 'ascii' },
      { text: '/ ____/ /  / /_/ /| |/ / / / / // / / /_/ / / / / / / / / /_/ / / / /', type: 'ascii' },
      { text: '/_/   /_/   \\__,_/ |___/_/_/ /_//_/  \\__,_/_/ /_/ /_/_/_/\\__,_/_/ /_/', type: 'ascii' },
      { text: '========================================================', type: 'ascii' },
      { text: 'Welcome to Pravin Tamilan\'s Interactive Terminal (v1.2.0)', type: 'success' },
      { text: 'Type "help" to view list of available commands.', type: 'output' },
      { text: '', type: 'output' }
    );
  }

  // Auto scroll console to bottom
  private scrollToBottom(): void {
    try {
      const el = this.terminalBody.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {}
  }

  // Keep input focused when clicking window
  focusInput(): void {
    if (!this.isMatrixMode && this.cmdInput) {
      this.cmdInput.nativeElement.focus();
    }
  }

  // Process enter command
  handleCommandSubmit(): void {
    const cmd = this.command.trim();
    if (!cmd) {
      this.history.push({ text: this.promptPrefix, type: 'input' });
      return;
    }

    // Echo input command
    this.history.push({ text: this.promptPrefix + cmd, type: 'input' });
    this.commandHistory.push(cmd);
    this.historyIndex = this.commandHistory.length;
    this.command = '';

    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];
    const args = parts.slice(1);

    this.executeCommand(mainCmd, args, cmd);
  }

  // Key navigation for command history
  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.command = this.commandHistory[this.historyIndex];
      }
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.command = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.command = '';
      }
      event.preventDefault();
    }
  }

  // Execute quick commands from the toolbar
  handleQuickCommand(cmdText: string): void {
    if (this.isMatrixMode) {
      if (cmdText === 'clear' || cmdText === 'exit' || cmdText === 'q') {
        this.stopMatrixEffect();
      }
      return;
    }
    this.command = cmdText;
    this.handleCommandSubmit();
    this.focusInput();
  }

  // Simulate hardware keypresses from toolbar
  handleKeyPress(keyType: 'esc' | 'tab' | 'up' | 'down' | 'ctrl+c'): void {
    if (keyType === 'esc') {
      if (this.isMatrixMode) {
        this.stopMatrixEffect();
      } else {
        this.command = '';
      }
      this.focusInput();
    } else if (keyType === 'tab') {
      if (this.isMatrixMode) return;
      const current = this.command.trim().toLowerCase();
      const availableCmds = ['about', 'clear', 'cmatrix', 'contact', 'cowsay', 'help', 'kavithai', 'neofetch', 'projects', 'skills', 'socials'];
      
      if (!current) {
        // Echo current line and list available commands
        this.history.push({ text: this.promptPrefix + this.command, type: 'input' });
        this.history.push({ text: availableCmds.join('   '), type: 'output' });
        this.focusInput();
        return;
      }
      
      const matches = availableCmds.filter(c => c.startsWith(current));
      if (matches.length === 1) {
        this.command = matches[0] + ' ';
      } else if (matches.length > 1) {
        this.history.push({ text: this.promptPrefix + this.command, type: 'input' });
        this.history.push({ text: matches.join('   '), type: 'output' });
      }
      this.focusInput();
    } else if (keyType === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.command = this.commandHistory[this.historyIndex];
      }
      this.focusInput();
    } else if (keyType === 'down') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.command = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.command = '';
      }
      this.focusInput();
    } else if (keyType === 'ctrl+c') {
      if (this.isMatrixMode) {
        this.stopMatrixEffect();
      } else {
        this.history.push({ text: this.promptPrefix + this.command + '^C', type: 'input' });
        this.command = '';
        this.historyIndex = this.commandHistory.length;
      }
      this.focusInput();
    }
  }

  // Command parser
  private executeCommand(cmd: string, args: string[], rawCmd: string): void {
    switch (cmd) {
      case 'help':
      case '?':
        this.printHelp();
        break;
      case 'about':
        this.history.push(
          { text: 'I am Pravin Tamilan, a software developer who bridges logic and creativity.', type: 'output' },
          { text: 'I build modern web apps, mobile solutions using Angular/Node.js, and compose Tamil poetry.', type: 'output' },
          { text: 'Type "skills" or "projects" to explore more.', type: 'output' }
        );
        break;
      case 'skills':
        this.history.push(
          { text: 'Frontend: Angular (19), TypeScript, SCSS, HTML5, Canvas, Fabric.js', type: 'output' },
          { text: 'Backend: Node.js, Express, Firebase (Firestore, Functions, Auth), REST APIs', type: 'output' },
          { text: 'Tools: Git, SSH, Termux CLI, npm, Webpack, Docker', type: 'output' }
        );
        break;
      case 'projects':
        this.history.push(
          { text: '1. Card Creator - Canvas editor app for publishing social graphics.', type: 'output' },
          { text: '2. Client IPTV Player - Serverless public television and M3U parser.', type: 'output' },
          { text: '3. Tamil Poetry AI - generative verses assistant powered by Gemini API.', type: 'output' }
        );
        break;
      case 'neofetch':
        this.printNeofetch();
        break;
      case 'clear':
      case 'cls':
        this.history = [];
        break;
      case 'cowsay':
        const sayText = args.length > 0 ? args.join(' ') : 'Moo!';
        this.printCowsay(sayText);
        break;
      case 'kavithai':
      case 'poem':
        this.printPoem();
        break;
      case 'socials':
      case 'twitter':
        this.history.push({ text: 'Opening social handle: https://x.com/apravint ...', type: 'success' });
        window.open('https://x.com/apravint', '_blank');
        break;
      case 'contact':
        this.history.push({ text: 'Opening email client: apravint@gmail.com ...', type: 'success' });
        window.open('mailto:apravint@gmail.com');
        break;
      case 'cmatrix':
        this.startMatrixEffect();
        break;
      default:
        this.history.push({ text: `command not found: ${cmd}. Type "help" for a list of commands.`, type: 'error' });
    }
  }

  private printHelp(): void {
    this.history.push(
      { text: 'Available commands:', type: 'success' },
      { text: '  about      - Display background summary', type: 'output' },
      { text: '  skills     - View programming language details', type: 'output' },
      { text: '  projects   - Summary of key portfolio projects', type: 'output' },
      { text: '  neofetch   - Displays system details and ASCII art logo', type: 'output' },
      { text: '  kavithai   - Prints a sample Tamil poem', type: 'output' },
      { text: '  cowsay     - Make a cow say something (e.g. cowsay coding is fun)', type: 'output' },
      { text: '  cmatrix    - Start classic falling code matrix (press ESC or Q to exit)', type: 'output' },
      { text: '  socials    - Opens X / Twitter profile', type: 'output' },
      { text: '  contact    - Opens developer mail target', type: 'output' },
      { text: '  clear      - Clears terminal history', type: 'output' }
    );
  }

  private printNeofetch(): void {
    const neofetchText = `
   /\\_/\\      guest@pravintamilan
  ( o.o )     -------------------
   > ^ <      OS: Termux on Android 14
              Host: pravintamilan.com (v1.2.0)
              Kernel: Linux 6.1.25-antigravity
              Shell: bash/zsh (Simulated)
              Terminal: xterm.js Canvas
              CPU: Snapdragon 8 Gen 3 (8)
              Memory: 12GB LPDDR5X
              Accent Color: Obsidian Blue
    `;
    this.history.push({ text: neofetchText, type: 'ascii' });
  }

  private printCowsay(text: string): void {
    const lines = text.length;
    const dashes = '-'.repeat(lines + 2);
    const cow = `
  ${dashes}
< ${text} >
  ${dashes}
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
    `;
    this.history.push({ text: cow, type: 'ascii' });
  }

  private printPoem(): void {
    const poem = `
மின்னல் கீற்றுகள் கோர்க்கும்
டெர்மினல் திரையின் வழியே,
பூக்கும் கவிதையின் புள்ளிகள்
புதுமையானதொரு வானம்!

-- பிரவின் தமிழன்
    `;
    this.history.push({ text: poem, type: 'ascii' });
  }

  // MATRIX SCREEN SAVER IMPLEMENTATION
  private startMatrixEffect(): void {
    this.isMatrixMode = true;
    setTimeout(() => {
      const canvas = this.matrixCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 450;

      const columns = Math.floor(canvas.width / 16);
      const drops: number[] = Array(columns).fill(1);

      const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';

      this.matrixInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          ctx.fillText(text, i * 16, drops[i] * 16);

          if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }, 35);
    }, 100);
  }

  stopMatrixEffect(): void {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    this.isMatrixMode = false;
  }
}
