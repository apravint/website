import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';
import { SeoService } from '../shared/seo.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-container">
      <div class="glass-card">
        <div class="header">
          <h1>Tamil AI Kavithai Assistant 🤖</h1>
          <p>Ask our AI poet to write or explain a kavithai for you.</p>
        </div>

        <div class="chat-window" #chatWindow>
          <div *ngFor="let msg of messages" [ngClass]="{'message': true, 'user-msg': msg.role === 'user', 'ai-msg': msg.role === 'ai'}">
            <div class="msg-bubble">
              {{ msg.text }}
            </div>
          </div>
          <div *ngIf="isLoading" class="message ai-msg">
            <div class="msg-bubble loading">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>

        <div class="input-area">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="generatePoetry()"
            placeholder="e.g., Write a poem about friendship in Tamil..."
            [disabled]="isLoading"
          />
          <button (click)="generatePoetry()" [disabled]="isLoading || !userInput.trim()">
            Send
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-container {
      min-height: 80vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .glass-card {
      width: 100%;
      max-width: 800px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      height: 600px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
      h1 {
        color: #fff;
        margin-bottom: 8px;
        font-size: 1.8rem;
      }
      p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
      }
    }

    .chat-window {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .message {
      display: flex;
      max-width: 85%;
    }

    .user-msg {
      align-self: flex-end;
      .msg-bubble {
        background: #4ecca3;
        color: #1a1a2e;
        border-radius: 18px 18px 0 18px;
      }
    }

    .ai-msg {
      align-self: flex-start;
      .msg-bubble {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-radius: 18px 18px 18px 0;
        white-space: pre-wrap;
      }
    }

    .msg-bubble {
      padding: 12px 18px;
      font-size: 1rem;
      line-height: 1.5;
    }

    .loading span {
      animation: blink 1.4s infinite both;
      font-size: 1.5rem;
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }

    @keyframes blink {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }

    .input-area {
      display: flex;
      gap: 10px;
      input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px 20px;
        border-radius: 12px;
        color: #fff;
        outline: none;
        &:focus {
          border-color: #4ecca3;
        }
      }
      button {
        background: #4ecca3;
        color: #1a1a2e;
        border: none;
        padding: 0 25px;
        border-radius: 12px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
        &:hover:not(:disabled) {
          transform: scale(1.05);
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class AiAssistantComponent {
  userInput: string = '';
  messages: { role: 'user' | 'ai', text: string }[] = [
    { role: 'ai', text: 'வணக்கம்! நான் உங்கள் தமிழ் கவிதை உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?' }
  ];
  isLoading: boolean = false;

  private genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  private model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  constructor(private cdr: ChangeDetectorRef, private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'AI Kavithai Assistant - Tamil Poetry Generator',
      description: 'Ask our AI poet to write or explain a Tamil kavithai for you. Generate beautiful Tamil poetry with help from AI.',
      url: 'https://pravintamilan.com/ai-assistant'
    });
  }

  async generatePoetry() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userText = this.userInput;
    this.messages.push({ role: 'user', text: userText });
    this.userInput = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const prompt = `You are a legendary Tamil poet. 
      The user wants: "${userText}". 
      Respond with a beautiful, high-quality Tamil kavithai or a clear explanation if asked. 
      Always maintain a sophisticated yet accessible poetic tone in Tamil. 
      If the user speaks in English, answer mainly in Tamil with occasional English context if helpful.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.messages.push({ role: 'ai', text: text });
    } catch (error) {
      console.error('Gemini error:', error);
      this.messages.push({ role: 'ai', text: 'மன்னிக்கவும், என்னால் இப்போது பதில் அளிக்க முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து முயற்சிக்கவும்.' });
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
