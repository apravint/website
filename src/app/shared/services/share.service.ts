import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ShareService {

    /**
     * Share to Twitter/X
     */
    shareToTwitter(text: string, url?: string): void {
        const tweetText = encodeURIComponent(text);
        const tweetUrl = url ? `&url=${encodeURIComponent(url)}` : '';
        window.open(
            `https://twitter.com/intent/tweet?text=${tweetText}${tweetUrl}`,
            '_blank',
            'width=550,height=420'
        );
    }

    /**
     * Share to WhatsApp
     */
    shareToWhatsApp(text: string): void {
        const whatsappText = encodeURIComponent(text);
        window.open(
            `https://wa.me/?text=${whatsappText}`,
            '_blank'
        );
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    /**
     * Use Web Share API if available
     */
    async nativeShare(title: string, text: string, url?: string): Promise<boolean> {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }
}
