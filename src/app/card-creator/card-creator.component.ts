import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasService } from './services/canvas.service';
import { HistoryService } from './services/history.service';
import { ExportService, ExportOptions } from './services/export.service';
import { CANVAS_SIZES } from './models/canvas-element.model';
import * as fabric from 'fabric';

@Component({
    selector: 'app-card-creator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './card-creator.component.html',
    styleUrl: './card-creator.component.scss'
})
export class CardCreatorComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

    // State
    readonly activePanel = signal<'text' | 'image' | 'background' | 'templates' | null>('text');
    readonly showExportModal = signal(false);
    readonly showTemplatesModal = signal(false);
    readonly selectedSizeIndex = signal(0);
    readonly isLoading = signal(false);

    // Canvas sizes
    readonly canvasSizes = CANVAS_SIZES;
    readonly selectedSize = computed(() => this.canvasSizes[this.selectedSizeIndex()]);

    // Export options
    readonly exportFormat = signal<'png' | 'jpeg' | 'svg'>('png');
    readonly exportQuality = signal<'medium' | 'high' | 'max'>('high');

    // Text formatting state
    readonly selectedFont = signal('Noto Sans Tamil');
    readonly selectedFontSize = signal(48);
    readonly selectedTextColor = signal('#000000');
    readonly selectedTextAlign = signal<'left' | 'center' | 'right'>('center');
    readonly isBold = signal(false);
    readonly isItalic = signal(false);

    // Advanced text formatting state
    readonly isUnderline = signal(false);
    readonly isStrikethrough = signal(false);
    readonly letterSpacing = signal(0);
    readonly lineHeight = signal(1.16);
    readonly textShadowEnabled = signal(false);
    readonly textShadowX = signal(2);
    readonly textShadowY = signal(2);
    readonly textShadowBlur = signal(4);
    readonly textShadowColor = signal('#000000');
    readonly textStrokeColor = signal('#000000');
    readonly textStrokeWidth = signal(0);
    readonly textOpacity = signal(100);
    readonly textBackgroundColor = signal('');
    readonly textTransform = signal<'none' | 'uppercase' | 'lowercase' | 'capitalize'>('none');

    // Google Fonts for text
    readonly fonts = [
        'Noto Sans Tamil',
        'Noto Serif Tamil',
        'Mukta Malar',
        'Catamaran',
        'Hind Madurai',
        'Meera Inimai',
        'Poppins',
        'Inter',
        'Outfit',
        'Roboto',
        'Open Sans',
        'Lato',
        'Montserrat',
        'Playfair Display',
        'Dancing Script',
        'Pacifico',
        'Bebas Neue',
        'Oswald',
        'Raleway',
        'Ubuntu'
    ];

    // Enterprise Color Palettes (50+ colors)
    readonly colorPalettes = {
        basics: [
            '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
            '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'
        ],
        brand: [
            '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc',
            '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
            '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
        ],
        warm: [
            '#dc2626', '#ef4444', '#f87171', '#fca5a5',
            '#ea580c', '#f97316', '#fb923c', '#fdba74',
            '#ca8a04', '#eab308', '#facc15', '#fde047',
        ],
        cool: [
            '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9',
            '#059669', '#10b981', '#34d399', '#6ee7b7',
            '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4',
        ],
        accent: [
            '#db2777', '#ec4899', '#f472b6', '#f9a8d4',
            '#9333ea', '#a855f7', '#c084fc', '#d8b4fe',
            '#be123c', '#e11d48', '#f43f5e', '#fb7185',
        ]
    };

    // Flat colors array for template
    readonly colors = [
        '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080',
        '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff',
        '#4f46e5', '#6366f1', '#818cf8', '#7c3aed', '#8b5cf6',
        '#2563eb', '#3b82f6', '#dc2626', '#ef4444', '#ea580c',
        '#f97316', '#ca8a04', '#eab308', '#0891b2', '#06b6d4',
        '#059669', '#10b981', '#db2777', '#ec4899', '#9333ea'
    ];

    // Enterprise Gradient Presets (30 gradients)
    readonly gradients = [
        // Classic
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        // Sunset & Warm
        ['#ff0844', '#ffb199'],
        ['#fc4a1a', '#f7b733'],
        ['#f12711', '#f5af19'],
        ['#ff416c', '#ff4b2b'],
        ['#ed4264', '#ffedbc'],
        // Ocean & Cool
        ['#6a11cb', '#2575fc'],
        ['#11998e', '#38ef7d'],
        ['#00c6ff', '#0072ff'],
        ['#4776e6', '#8e54e9'],
        ['#00b4db', '#0083b0'],
        // Luxury
        ['#a18cd1', '#fbc2eb'],
        ['#d299c2', '#fef9d7'],
        ['#accbee', '#e7f0fd'],
        ['#e0c3fc', '#8ec5fc'],
        ['#f5f7fa', '#c3cfe2'],
        // Dark & Bold
        ['#0f0c29', '#302b63'],
        ['#1a1a2e', '#16213e'],
        ['#232526', '#414345'],
        ['#0f2027', '#2c5364'],
        ['#141e30', '#243b55'],
        // Nature
        ['#56ab2f', '#a8e063'],
        ['#134e5e', '#71b280'],
        ['#1d976c', '#93f9b9'],
        ['#3a6186', '#89253e'],
        ['#e65c00', '#f9d423'],
    ];

    // Enterprise Templates (35+ organized by category)
    readonly templateCategories = [
        { id: 'blank', name: 'Blank', icon: '📄' },
        { id: 'quotes', name: 'Quotes', icon: '💬' },
        { id: 'poems', name: 'Poems', icon: '📜' },
        { id: 'motivational', name: 'Motivation', icon: '🔥' },
        { id: 'aesthetic', name: 'Aesthetic', icon: '🎨' },
        { id: 'festivals', name: 'Festivals', icon: '🎉' },
        { id: 'social', name: 'Social', icon: '📱' },
        { id: 'business', name: 'Business', icon: '💼' },
    ];

    readonly templates = [
        // === BLANK ===
        { id: 'blank', name: 'Clean White', category: 'blank', icon: '⬜' },
        { id: 'blank-dark', name: 'Dark Mode', category: 'blank', icon: '⬛' },
        { id: 'blank-gradient', name: 'Purple Dream', category: 'blank', icon: '💜' },
        { id: 'blank-sunset', name: 'Sunset Glow', category: 'blank', icon: '🌅' },
        { id: 'blank-ocean', name: 'Ocean Depth', category: 'blank', icon: '🌊' },

        // === QUOTES ===
        { id: 'quote-minimal', name: 'Minimal Dark', category: 'quotes', icon: '✨' },
        { id: 'quote-elegant', name: 'Elegant Purple', category: 'quotes', icon: '💎' },
        { id: 'quote-bold', name: 'Bold Impact', category: 'quotes', icon: '💪' },
        { id: 'quote-glass', name: 'Glass Card', category: 'quotes', icon: '🪟' },
        { id: 'quote-neon', name: 'Neon Glow', category: 'quotes', icon: '⚡' },
        { id: 'quote-love', name: 'Love Quote', category: 'quotes', icon: '❤️' },

        // === POEMS ===
        { id: 'poem-classic', name: 'Classic Parchment', category: 'poems', icon: '📜' },
        { id: 'poem-modern', name: 'Modern Minimal', category: 'poems', icon: '✍️' },
        { id: 'poem-tamil', name: 'சென்தமிழ் Classical', category: 'poems', icon: '🏛️' },
        { id: 'poem-nature', name: 'Nature Inspired', category: 'poems', icon: '🌿' },
        { id: 'poem-night', name: 'Starry Night', category: 'poems', icon: '🌙' },

        // === MOTIVATIONAL ===
        { id: 'motive-fire', name: 'On Fire', category: 'motivational', icon: '🔥' },
        { id: 'motive-success', name: 'Success Path', category: 'motivational', icon: '🚀' },
        { id: 'motive-strength', name: 'Inner Strength', category: 'motivational', icon: '💪' },
        { id: 'motive-dream', name: 'Dream Big', category: 'motivational', icon: '✨' },
        { id: 'motive-focus', name: 'Stay Focused', category: 'motivational', icon: '🎯' },

        // === AESTHETIC ===
        { id: 'aesthetic-pastel', name: 'Pastel Dreams', category: 'aesthetic', icon: '🎀' },
        { id: 'aesthetic-retrowave', name: 'Retrowave', category: 'aesthetic', icon: '🌆' },
        { id: 'aesthetic-minimal', name: 'Clean Minimal', category: 'aesthetic', icon: '⚪' },
        { id: 'aesthetic-gradient', name: 'Mesh Gradient', category: 'aesthetic', icon: '🎨' },
        { id: 'aesthetic-dark', name: 'Dark Academia', category: 'aesthetic', icon: '📚' },

        // === FESTIVALS ===
        { id: 'pongal', name: 'Pongal Wishes', category: 'festivals', icon: '🌾' },
        { id: 'diwali', name: 'Diwali Lights', category: 'festivals', icon: '🪔' },
        { id: 'newyear-tamil', name: 'தமிழ் புத்தாண்டு', category: 'festivals', icon: '🎊' },
        { id: 'newyear', name: 'New Year 2026', category: 'festivals', icon: '🎆' },
        { id: 'christmas', name: 'Merry Christmas', category: 'festivals', icon: '🎄' },
        { id: 'birthday', name: 'Birthday Bash', category: 'festivals', icon: '🎂' },
        { id: 'wedding', name: 'Wedding Bliss', category: 'festivals', icon: '💒' },

        // === SOCIAL MEDIA ===
        { id: 'instagram', name: 'Instagram Post', category: 'social', icon: '📸' },
        { id: 'instagram-story', name: 'Insta Story', category: 'social', icon: '📱' },
        { id: 'whatsapp', name: 'WhatsApp Status', category: 'social', icon: '💬' },
        { id: 'youtube', name: 'YouTube Thumb', category: 'social', icon: '▶️' },
        { id: 'twitter', name: 'X / Twitter', category: 'social', icon: '🐦' },

        // === BUSINESS ===
        { id: 'announcement', name: 'Announcement', category: 'business', icon: '📢' },
        { id: 'sale', name: 'Flash Sale', category: 'business', icon: '🏷️' },
        { id: 'thankyou', name: 'Thank You Card', category: 'business', icon: '🙏' },
        { id: 'invitation', name: 'Event Invite', category: 'business', icon: '📩' },
        { id: 'launch', name: 'Product Launch', category: 'business', icon: '🚀' },
    ];

    constructor(
        public canvasService: CanvasService,
        public historyService: HistoryService,
        private exportService: ExportService
    ) { }

    ngOnInit(): void {
        // Load Google Fonts
        this.loadGoogleFonts();
    }

    ngAfterViewInit(): void {
        this.initializeCanvas();
    }

    ngOnDestroy(): void {
        this.canvasService.dispose();
    }

    private loadGoogleFonts(): void {
        // CSS2 API requires separate family= parameters for each font
        const fontParams = this.fonts
            .map(font => `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700`)
            .join('&');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    private initializeCanvas(): void {
        if (!this.canvasElement?.nativeElement || !this.canvasContainer?.nativeElement) return;

        const container = this.canvasContainer.nativeElement;
        this.canvasService.setCanvasSize(this.selectedSize().width, this.selectedSize().height);
        const canvas = this.canvasService.initCanvas(
            this.canvasElement.nativeElement,
            container.clientWidth,
            container.clientHeight
        );

        // Listen to selection changes to update text formatting UI
        canvas.on('selection:created', () => this.updateTextPropertiesFromSelection());
        canvas.on('selection:updated', () => this.updateTextPropertiesFromSelection());

        // Save initial state
        this.saveHistory();
    }

    @HostListener('window:resize')
    onResize(): void {
        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
                case 'd':
                    event.preventDefault();
                    this.duplicateSelected();
                    break;
            }
        }

        if (event.key === 'Delete' || event.key === 'Backspace') {
            // Only delete if not editing text
            const canvas = this.canvasService.getCanvas();
            const active = canvas?.getActiveObject();
            if (active && !(active as any).isEditing) {
                event.preventDefault();
                this.deleteSelected();
            }
        }
    }

    // Panel actions
    setActivePanel(panel: 'text' | 'image' | 'background' | 'templates'): void {
        this.activePanel.set(this.activePanel() === panel ? null : panel);
    }

    // Canvas size
    onSizeChange(index: number): void {
        this.selectedSizeIndex.set(index);
        const size = this.canvasSizes[index];
        this.canvasService.setCanvasSize(size.width, size.height);

        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }

        this.saveHistory();
    }

    // Text actions
    addHeading(): void {
        this.canvasService.addHeading();
        this.saveHistory();
    }

    addSubheading(): void {
        this.canvasService.addSubheading();
        this.saveHistory();
    }

    addBodyText(): void {
        this.canvasService.addBodyText();
        this.saveHistory();
    }

    // Text formatting methods
    setTextFont(font: string): void {
        this.selectedFont.set(font);
        this.canvasService.updateSelectedText({ fontFamily: font });
        this.saveHistory();
    }

    setTextSize(size: number): void {
        this.selectedFontSize.set(size);
        this.canvasService.updateSelectedText({ fontSize: size });
        this.saveHistory();
    }

    setTextColor(color: string): void {
        this.selectedTextColor.set(color);
        this.canvasService.updateSelectedText({ fill: color });
        this.saveHistory();
    }

    setTextAlign(align: 'left' | 'center' | 'right'): void {
        this.selectedTextAlign.set(align);
        this.canvasService.updateSelectedText({ textAlign: align });
        this.saveHistory();
    }

    toggleBold(): void {
        const newBold = !this.isBold();
        this.isBold.set(newBold);
        this.canvasService.updateSelectedText({ fontWeight: newBold ? 'bold' : 'normal' });
        this.saveHistory();
    }

    toggleItalic(): void {
        const newItalic = !this.isItalic();
        this.isItalic.set(newItalic);
        this.canvasService.updateSelectedText({ fontStyle: newItalic ? 'italic' : 'normal' });
        this.saveHistory();
    }

    toggleUnderline(): void {
        const newUnderline = !this.isUnderline();
        this.isUnderline.set(newUnderline);
        this.canvasService.updateSelectedText({ underline: newUnderline });
        this.saveHistory();
    }

    toggleStrikethrough(): void {
        const newStrikethrough = !this.isStrikethrough();
        this.isStrikethrough.set(newStrikethrough);
        this.canvasService.updateSelectedText({ linethrough: newStrikethrough });
        this.saveHistory();
    }

    setLetterSpacing(spacing: number): void {
        this.letterSpacing.set(spacing);
        // Fabric.js charSpacing is in 1/1000 of em
        this.canvasService.updateSelectedText({ charSpacing: spacing * 10 });
        this.saveHistory();
    }

    setLineHeight(height: number): void {
        this.lineHeight.set(height);
        this.canvasService.updateSelectedText({ lineHeight: height });
        this.saveHistory();
    }

    updateTextShadow(): void {
        if (this.textShadowEnabled()) {
            const shadow = new fabric.Shadow({
                offsetX: this.textShadowX(),
                offsetY: this.textShadowY(),
                blur: this.textShadowBlur(),
                color: this.textShadowColor()
            });
            this.canvasService.updateSelectedText({ shadow });
        } else {
            this.canvasService.updateSelectedText({ shadow: null });
        }
        this.saveHistory();
    }

    toggleTextShadow(): void {
        this.textShadowEnabled.set(!this.textShadowEnabled());
        this.updateTextShadow();
    }

    setTextShadowX(value: number): void {
        this.textShadowX.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowY(value: number): void {
        this.textShadowY.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowBlur(value: number): void {
        this.textShadowBlur.set(value);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextShadowColor(color: string): void {
        this.textShadowColor.set(color);
        if (this.textShadowEnabled()) this.updateTextShadow();
    }

    setTextStroke(width: number, color?: string): void {
        this.textStrokeWidth.set(width);
        if (color) this.textStrokeColor.set(color);
        this.canvasService.updateSelectedText({
            stroke: this.textStrokeColor(),
            strokeWidth: width
        });
        this.saveHistory();
    }

    setTextStrokeColor(color: string): void {
        this.textStrokeColor.set(color);
        if (this.textStrokeWidth() > 0) {
            this.canvasService.updateSelectedText({ stroke: color });
            this.saveHistory();
        }
    }

    setTextOpacity(opacity: number): void {
        this.textOpacity.set(opacity);
        this.canvasService.updateSelectedText({ opacity: opacity / 100 });
        this.saveHistory();
    }

    setTextBackgroundColor(color: string): void {
        this.textBackgroundColor.set(color);
        this.canvasService.updateSelectedText({ textBackgroundColor: color || '' });
        this.saveHistory();
    }

    clearTextBackground(): void {
        this.textBackgroundColor.set('');
        this.canvasService.updateSelectedText({ textBackgroundColor: '' });
        this.saveHistory();
    }

    applyTextTransform(transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'): void {
        this.textTransform.set(transform);
        const activeObject = this.canvasService.getCanvas()?.getActiveObject();
        if (activeObject && 'text' in activeObject) {
            const currentText = (activeObject as any).text as string;
            let newText = currentText;

            switch (transform) {
                case 'uppercase':
                    newText = currentText.toUpperCase();
                    break;
                case 'lowercase':
                    newText = currentText.toLowerCase();
                    break;
                case 'capitalize':
                    newText = currentText.replace(/\b\w/g, char => char.toUpperCase());
                    break;
                case 'none':
                    // Keep as is
                    break;
            }

            if (newText !== currentText) {
                this.canvasService.updateSelectedText({ text: newText });
                this.saveHistory();
            }
        }
    }

    updateTextPropertiesFromSelection(): void {
        const props = this.canvasService.getSelectedTextProperties();
        if (props) {
            this.selectedFont.set(props.fontFamily);
            this.selectedFontSize.set(props.fontSize);
            this.selectedTextColor.set(props.fill);
            this.selectedTextAlign.set(props.textAlign as 'left' | 'center' | 'right');
            this.isBold.set(props.fontWeight === 'bold' || props.fontWeight === '700');
            this.isItalic.set(props.fontStyle === 'italic');

            // Advanced properties
            this.isUnderline.set(props.underline);
            this.isStrikethrough.set(props.linethrough);
            this.letterSpacing.set(props.charSpacing / 10); // Convert from fabric's 1/1000 em
            this.lineHeight.set(props.lineHeight);
            this.textStrokeWidth.set(props.strokeWidth);
            this.textStrokeColor.set(props.stroke || '#000000');
            this.textOpacity.set(Math.round(props.opacity * 100));
            this.textBackgroundColor.set(props.textBackgroundColor);

            // Parse shadow
            if (props.shadow) {
                const [x, y, blur, color] = props.shadow.split(',');
                this.textShadowEnabled.set(true);
                this.textShadowX.set(parseFloat(x) || 2);
                this.textShadowY.set(parseFloat(y) || 2);
                this.textShadowBlur.set(parseFloat(blur) || 4);
                this.textShadowColor.set(color || '#000000');
            } else {
                this.textShadowEnabled.set(false);
            }
        }
    }

    // Image actions
    onImageUpload(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                this.canvasService.addImage(url).then(() => {
                    this.saveHistory();
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Background actions
    setBackgroundColor(color: string): void {
        this.canvasService.setBackgroundColor(color);
        this.saveHistory();
    }

    setBackgroundGradient(colors: string[]): void {
        this.canvasService.setBackgroundGradient(colors);
        this.saveHistory();
    }

    // Object manipulation
    deleteSelected(): void {
        this.canvasService.deleteSelected();
        this.saveHistory();
    }

    duplicateSelected(): void {
        this.canvasService.duplicateSelected();
        this.saveHistory();
    }

    bringForward(): void {
        this.canvasService.bringForward();
        this.saveHistory();
    }

    sendBackward(): void {
        this.canvasService.sendBackward();
        this.saveHistory();
    }

    // Zoom
    zoomIn(): void {
        this.canvasService.zoomIn();
    }

    zoomOut(): void {
        this.canvasService.zoomOut();
    }

    fitToScreen(): void {
        if (this.canvasContainer?.nativeElement) {
            const container = this.canvasContainer.nativeElement;
            this.canvasService.fitToScreen(container.clientWidth, container.clientHeight);
        }
    }

    // History
    private saveHistory(): void {
        const json = this.canvasService.toJSON();
        this.historyService.pushState(json);
    }

    undo(): void {
        const state = this.historyService.undo();
        if (state) {
            this.canvasService.loadFromJSON(state);
        }
    }

    redo(): void {
        const state = this.historyService.redo();
        if (state) {
            this.canvasService.loadFromJSON(state);
        }
    }

    // Export
    openExportModal(): void {
        this.showExportModal.set(true);
    }

    closeExportModal(): void {
        this.showExportModal.set(false);
    }

    async exportImage(): Promise<void> {
        const canvas = this.canvasService.getCanvas();
        if (!canvas) return;

        this.isLoading.set(true);

        try {
            const options: ExportOptions = {
                format: this.exportFormat(),
                quality: this.exportQuality()
            };

            const filename = `card-${Date.now()}`;
            await this.exportService.downloadImage(canvas, filename, options);
            this.closeExportModal();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    // Templates
    applyTemplate(templateId: string): void {
        this.canvasService.clear();

        switch (templateId) {
            // === BLANK ===
            case 'blank':
                this.canvasService.setBackgroundColor('#ffffff');
                break;
            case 'blank-dark':
                this.canvasService.setBackgroundColor('#0f172a');
                break;
            case 'blank-gradient':
                this.canvasService.setBackgroundGradient(['#667eea', '#764ba2']);
                break;
            case 'blank-sunset':
                this.canvasService.setBackgroundGradient(['#f97316', '#ec4899']);
                break;
            case 'blank-ocean':
                this.canvasService.setBackgroundGradient(['#0891b2', '#1e3a8a']);
                break;

            // === QUOTES ===
            case 'quote-minimal':
                this.canvasService.setBackgroundColor('#0f172a');
                this.canvasService.addText({ text: '"', fill: '#6366f1', fontSize: 200, fontFamily: 'Playfair Display', top: 80, opacity: 0.3 });
                this.canvasService.addText({ text: 'உங்கள் மேற்கோள் இங்கே', fill: '#f1f5f9', fontSize: 48, fontFamily: 'Noto Serif Tamil', textAlign: 'center' } as any);
                this.canvasService.addText({ text: '— ஆசிரியர்', fill: '#64748b', fontSize: 24, fontFamily: 'Noto Sans Tamil', top: 520 });
                break;
            case 'quote-elegant':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#7c3aed']);
                this.canvasService.addText({ text: '✦', fill: '#fbbf24', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: '"வாழ்க்கை அழகானது"', fill: '#ffffff', fontSize: 52, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: '— ஆசிரியர் பெயர்', fill: '#c7d2fe', fontSize: 24, top: 520 });
                break;
            case 'quote-bold':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: 'தைரியமாக', fill: '#fbbf24', fontSize: 80, fontFamily: 'Noto Sans Tamil', fontWeight: 'bold', top: 250 } as any);
                this.canvasService.addText({ text: 'இரு', fill: '#ffffff', fontSize: 80, fontFamily: 'Noto Sans Tamil', fontWeight: 'bold', top: 360 } as any);
                break;
            case 'quote-glass':
                this.canvasService.setBackgroundGradient(['#6366f1', '#a855f7']);
                this.canvasService.addText({ text: '"உங்கள் கனவை நோக்கி"', fill: '#ffffff', fontSize: 44, fontFamily: 'Noto Serif Tamil' } as any);
                break;
            case 'quote-neon':
                this.canvasService.setBackgroundColor('#0a0a0a');
                this.canvasService.addText({ text: 'DREAM', fill: '#22d3ee', fontSize: 90, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'BIG', fill: '#f472b6', fontSize: 90, fontFamily: 'Bebas Neue', top: 360 });
                break;
            case 'quote-love':
                this.canvasService.setBackgroundGradient(['#ec4899', '#f43f5e']);
                this.canvasService.addText({ text: '❤️', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'காதல் மேற்கோள்', fill: '#ffffff', fontSize: 48, fontFamily: 'Noto Serif Tamil' } as any);
                break;

            // === POEMS ===
            case 'poem-classic':
                this.canvasService.setBackgroundColor('#fef3c7');
                this.canvasService.addText({ text: '📜 கவிதை தலைப்பு', fill: '#78350f', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 120 });
                this.canvasService.addText({ text: 'இங்கே உங்கள் கவிதை\nவரிகள் எழுதுங்கள்\nஅழகான தமிழில்...', fill: '#92400e', fontSize: 28, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                this.canvasService.addText({ text: '— கவிஞர்', fill: '#a16207', fontSize: 22, top: 520 });
                break;
            case 'poem-modern':
                this.canvasService.setBackgroundGradient(['#0f172a', '#1e293b']);
                this.canvasService.addText({ text: 'நவீன கவிதை', fill: '#38bdf8', fontSize: 32, fontFamily: 'Outfit', top: 140 });
                this.canvasService.addText({ text: 'உங்கள் வரிகள்\nஇங்கே தட்டச்சு செய்க...', fill: '#e2e8f0', fontSize: 26, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-tamil':
                this.canvasService.setBackgroundGradient(['#fdf4ff', '#fae8ff']);
                this.canvasService.addText({ text: '🏛️ செந்தமிழ் பா 🏛️', fill: '#86198f', fontSize: 40, fontFamily: 'Noto Serif Tamil', top: 120 });
                this.canvasService.addText({ text: 'யாமறிந்த மொழிகளிலே\nதமிழ்மொழி போல்\nஇனிதாவது எங்குமில்லை', fill: '#701a75', fontSize: 28, fontFamily: 'Noto Serif Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-nature':
                this.canvasService.setBackgroundGradient(['#dcfce7', '#bbf7d0']);
                this.canvasService.addText({ text: '🌿 இயற்கை கவிதை', fill: '#166534', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 130 });
                this.canvasService.addText({ text: 'மரங்களின் ஓசை\nகாற்றின் இசை...', fill: '#15803d', fontSize: 28, fontFamily: 'Noto Sans Tamil', textAlign: 'center' } as any);
                break;
            case 'poem-night':
                this.canvasService.setBackgroundGradient(['#1e1b4b', '#312e81']);
                this.canvasService.addText({ text: '🌙 ✨', fill: '#fbbf24', fontSize: 50, top: 100 });
                this.canvasService.addText({ text: 'நிலவொளி கவிதை', fill: '#e0e7ff', fontSize: 36, fontFamily: 'Noto Serif Tamil', top: 200 });
                this.canvasService.addText({ text: 'கனவுகளின் வானில்...', fill: '#a5b4fc', fontSize: 26, fontFamily: 'Noto Sans Tamil' } as any);
                break;

            // === MOTIVATIONAL ===
            case 'motive-fire':
                this.canvasService.setBackgroundGradient(['#dc2626', '#f97316']);
                this.canvasService.addText({ text: '🔥', fill: '#ffffff', fontSize: 80, top: 120 });
                this.canvasService.addText({ text: 'NEVER GIVE UP', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'ஒருபோதும் விட்டுக்கொடுக்காதே', fill: '#fef08a', fontSize: 28, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;
            case 'motive-success':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#06b6d4']);
                this.canvasService.addText({ text: '🚀', fill: '#ffffff', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'SUCCESS', fill: '#ffffff', fontSize: 72, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'வெற்றி உங்களுடையது', fill: '#bfdbfe', fontSize: 30, fontFamily: 'Noto Sans Tamil', top: 420 });
                break;
            case 'motive-strength':
                this.canvasService.setBackgroundColor('#0f172a');
                this.canvasService.addText({ text: '💪', fill: '#fbbf24', fontSize: 70, top: 120 });
                this.canvasService.addText({ text: 'INNER STRENGTH', fill: '#fbbf24', fontSize: 54, fontFamily: 'Bebas Neue' } as any);
                this.canvasService.addText({ text: 'உள் வலிமை', fill: '#94a3b8', fontSize: 28, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;
            case 'motive-dream':
                this.canvasService.setBackgroundGradient(['#7c3aed', '#ec4899']);
                this.canvasService.addText({ text: '✨ DREAM BIG ✨', fill: '#ffffff', fontSize: 56, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'பெரிதாக கனவு காண்', fill: '#fce7f3', fontSize: 30, fontFamily: 'Noto Sans Tamil', top: 450 });
                break;
            case 'motive-focus':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: '🎯', fill: '#ef4444', fontSize: 80, top: 120 });
                this.canvasService.addText({ text: 'STAY FOCUSED', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue' } as any);
                this.canvasService.addText({ text: 'கவனத்தை இழக்காதே', fill: '#6b7280', fontSize: 26, fontFamily: 'Noto Sans Tamil', top: 480 });
                break;

            // === AESTHETIC ===
            case 'aesthetic-pastel':
                this.canvasService.setBackgroundGradient(['#fce7f3', '#ddd6fe']);
                this.canvasService.addText({ text: '✿', fill: '#ec4899', fontSize: 60, top: 130 });
                this.canvasService.addText({ text: 'soft aesthetic', fill: '#a855f7', fontSize: 44, fontFamily: 'Pacifico' } as any);
                break;
            case 'aesthetic-retrowave':
                this.canvasService.setBackgroundGradient(['#1e1b4b', '#831843']);
                this.canvasService.addText({ text: 'RETRO', fill: '#22d3ee', fontSize: 80, fontFamily: 'Bebas Neue', top: 200 });
                this.canvasService.addText({ text: 'WAVE', fill: '#f472b6', fontSize: 80, fontFamily: 'Bebas Neue', top: 300 });
                break;
            case 'aesthetic-minimal':
                this.canvasService.setBackgroundColor('#fafafa');
                this.canvasService.addText({ text: 'minimal', fill: '#171717', fontSize: 56, fontFamily: 'Outfit', fontWeight: '300' } as any);
                break;
            case 'aesthetic-gradient':
                this.canvasService.setBackgroundGradient(['#f472b6', '#c084fc', '#60a5fa']);
                this.canvasService.addText({ text: 'VIBRANT', fill: '#ffffff', fontSize: 64, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'aesthetic-dark':
                this.canvasService.setBackgroundColor('#1c1917');
                this.canvasService.addText({ text: '📚', fill: '#d6d3d1', fontSize: 50, top: 140 });
                this.canvasService.addText({ text: 'Dark Academia', fill: '#d6d3d1', fontSize: 48, fontFamily: 'Playfair Display' } as any);
                break;

            // === FESTIVALS ===
            case 'pongal':
                this.canvasService.setBackgroundGradient(['#fef08a', '#fb923c']);
                this.canvasService.addText({ text: '🌾', fill: '#78350f', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'பொங்கல்', fill: '#78350f', fontSize: 64, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'வாழ்த்துக்கள்!', fill: '#92400e', fontSize: 48, fontFamily: 'Noto Serif Tamil', top: 420 });
                break;
            case 'diwali':
                this.canvasService.setBackgroundGradient(['#7c3aed', '#ec4899']);
                this.canvasService.addText({ text: '🪔 தீபாவளி 🪔', fill: '#fef08a', fontSize: 52, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold', top: 220 } as any);
                this.canvasService.addText({ text: 'நல்வாழ்த்துக்கள்!', fill: '#ffffff', fontSize: 44, fontFamily: 'Noto Serif Tamil', top: 380 });
                break;
            case 'newyear-tamil':
                this.canvasService.setBackgroundGradient(['#059669', '#10b981']);
                this.canvasService.addText({ text: '🎊', fill: '#ffffff', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'தமிழ் புத்தாண்டு', fill: '#ffffff', fontSize: 48, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'வாழ்த்துக்கள்!', fill: '#d1fae5', fontSize: 40, fontFamily: 'Noto Serif Tamil', top: 420 });
                break;
            case 'newyear':
                this.canvasService.setBackgroundGradient(['#1e3a8a', '#3b82f6']);
                this.canvasService.addText({ text: '🎆', fill: '#fbbf24', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: '2026', fill: '#fbbf24', fontSize: 100, fontFamily: 'Bebas Neue', top: 220 });
                this.canvasService.addText({ text: 'HAPPY NEW YEAR', fill: '#ffffff', fontSize: 40, fontFamily: 'Outfit', top: 420 });
                break;
            case 'christmas':
                this.canvasService.setBackgroundGradient(['#dc2626', '#16a34a']);
                this.canvasService.addText({ text: '🎄', fill: '#ffffff', fontSize: 80, top: 100 });
                this.canvasService.addText({ text: 'Merry Christmas', fill: '#ffffff', fontSize: 48, fontFamily: 'Playfair Display', fontWeight: 'bold' } as any);
                break;
            case 'birthday':
                this.canvasService.setBackgroundGradient(['#f472b6', '#a855f7']);
                this.canvasService.addText({ text: '🎂 🎈 🎉', fill: '#ffffff', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: 'Happy Birthday!', fill: '#ffffff', fontSize: 52, fontFamily: 'Pacifico' } as any);
                break;
            case 'wedding':
                this.canvasService.setBackgroundGradient(['#fecdd3', '#fef3c7']);
                this.canvasService.addText({ text: '💒', fill: '#9f1239', fontSize: 60, top: 100 });
                this.canvasService.addText({ text: 'திருமண வாழ்த்துக்கள்!', fill: '#9f1239', fontSize: 40, fontFamily: 'Noto Serif Tamil', fontWeight: 'bold' } as any);
                break;

            // === SOCIAL ===
            case 'instagram':
                this.canvasService.setBackgroundGradient(['#833ab4', '#fd1d1d', '#fcb045']);
                this.canvasService.addText({ text: '📸', fill: '#ffffff', fontSize: 60, top: 150 });
                this.canvasService.addText({ text: 'Your Content Here', fill: '#ffffff', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'instagram-story':
                this.canvasService.setBackgroundGradient(['#405de6', '#833ab4']);
                this.canvasService.addText({ text: 'Add Your Story', fill: '#ffffff', fontSize: 40, fontFamily: 'Outfit' } as any);
                break;
            case 'whatsapp':
                this.canvasService.setBackgroundGradient(['#25d366', '#128c7e']);
                this.canvasService.addText({ text: '💬', fill: '#ffffff', fontSize: 60, top: 150 });
                this.canvasService.addText({ text: 'WhatsApp Status', fill: '#ffffff', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                break;
            case 'youtube':
                this.canvasService.setBackgroundGradient(['#ff0000', '#cc0000']);
                this.canvasService.addText({ text: '▶️', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'THUMBNAIL', fill: '#ffffff', fontSize: 60, fontFamily: 'Bebas Neue' } as any);
                break;
            case 'twitter':
                this.canvasService.setBackgroundColor('#000000');
                this.canvasService.addText({ text: '𝕏', fill: '#ffffff', fontSize: 80, top: 150 });
                this.canvasService.addText({ text: 'Your Post Here', fill: '#ffffff', fontSize: 36, fontFamily: 'Outfit' } as any);
                break;

            // === BUSINESS ===
            case 'announcement':
                this.canvasService.setBackgroundGradient(['#4f46e5', '#7c3aed']);
                this.canvasService.addText({ text: '📢', fill: '#fbbf24', fontSize: 60, top: 120 });
                this.canvasService.addText({ text: 'ANNOUNCEMENT', fill: '#ffffff', fontSize: 52, fontFamily: 'Outfit', fontWeight: 'bold' } as any);
                this.canvasService.addText({ text: 'Your message here...', fill: '#c7d2fe', fontSize: 26, fontFamily: 'Outfit', top: 450 });
                break;
            case 'sale':
                this.canvasService.setBackgroundGradient(['#dc2626', '#f97316']);
                this.canvasService.addText({ text: '🔥 SALE 🔥', fill: '#ffffff', fontSize: 72, fontFamily: 'Bebas Neue', top: 200 });
                this.canvasService.addText({ text: 'UP TO 50% OFF', fill: '#fef08a', fontSize: 44, fontFamily: 'Outfit', fontWeight: 'bold', top: 380 } as any);
                break;
            case 'thankyou':
                this.canvasService.setBackgroundGradient(['#10b981', '#059669']);
                this.canvasService.addText({ text: '🙏', fill: '#ffffff', fontSize: 70, top: 140 });
                this.canvasService.addText({ text: 'Thank You!', fill: '#ffffff', fontSize: 56, fontFamily: 'Playfair Display', fontWeight: 'bold' } as any);
                break;
            case 'invitation':
                this.canvasService.setBackgroundGradient(['#a855f7', '#6366f1']);
                this.canvasService.addText({ text: '📩', fill: '#fbbf24', fontSize: 50, top: 120 });
                this.canvasService.addText({ text: "You're Invited!", fill: '#ffffff', fontSize: 48, fontFamily: 'Playfair Display' } as any);
                this.canvasService.addText({ text: 'Event details here...', fill: '#e0e7ff', fontSize: 24, fontFamily: 'Outfit', top: 450 });
                break;
            case 'launch':
                this.canvasService.setBackgroundGradient(['#0f172a', '#1e3a8a']);
                this.canvasService.addText({ text: '🚀', fill: '#38bdf8', fontSize: 70, top: 100 });
                this.canvasService.addText({ text: 'NEW LAUNCH', fill: '#ffffff', fontSize: 56, fontFamily: 'Bebas Neue', top: 250 });
                this.canvasService.addText({ text: 'Coming Soon...', fill: '#94a3b8', fontSize: 28, fontFamily: 'Outfit', top: 420 });
                break;

            default:
                this.canvasService.setBackgroundColor('#ffffff');
        }

        this.saveHistory();
        this.showTemplatesModal.set(false);
    }

    // Clear canvas
    clearCanvas(): void {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.canvasService.clear();
            this.saveHistory();
        }
    }
}
