import { Injectable, Optional } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(@Optional() private analytics: Analytics) {}

  /**
   * Logs a custom event to Firebase Analytics
   * @param eventName Name of the event to track
   * @param params Optional key-value parameters to include with the event
   */
  logCustomEvent(eventName: string, params?: { [key: string]: any }) {
    if (this.analytics) {
      try {
        logEvent(this.analytics, eventName, params);
        console.log(`[Analytics] Event Logged: ${eventName}`, params);
      } catch (err) {
        console.error('[Analytics] Failed to log event', err);
      }
    } else {
      console.log(`[Analytics Simulation] Event ignored in Dev/Mock Mode: ${eventName}`, params);
    }
  }
}
