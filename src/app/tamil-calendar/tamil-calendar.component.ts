import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';

interface TamilMonthInfo {
  nameEn: string;
  nameTa: string;
}

interface TamilYearInfo {
  nameEn: string;
  nameTa: string;
}

interface CalendarCell {
  date: Date | null;
  gDay: number | null;
  tamilMonthIndex: number | null;
  tamilDay: number | null;
  isToday: boolean;
  isSelected: boolean;
}

interface DailyPanchangam {
  gregorianDate: Date;
  tamilYearEn: string;
  tamilYearTa: string;
  tamilMonthEn: string;
  tamilMonthTa: string;
  tamilDay: number;
  thiruvalluvarYear: number;
  weekdayEn: string;
  weekdayTa: string;
  thithiEn: string;
  thithiTa: string;
  nakshatraEn: string;
  nakshatraTa: string;
  nallaNeram: string;
  gowriNallaNeram: string;
  rahuKalam: string;
  yamagandam: string;
  kuligai: string;
}

interface Festival {
  month: number; // Tamil Month Index (0-11)
  day: number;   // Tamil Day (1-31)
  nameEn: string;
  nameTa: string;
}

@Component({
  selector: 'app-tamil-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './tamil-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tamil-calendar.component.scss']
})
export class TamilCalendarComponent implements OnInit {
  private seo = inject(SeoService);
  public translationService = inject(TranslationService);

  // Current Calendar Focus
  currentYear: number = 2026; // Default to simulation year
  currentMonth: number = 5;    // June (0-indexed)
  selectedDate: Date = new Date(Date.UTC(2026, 5, 25, 12, 0, 0)); // Default to June 25, 2026

  // Month Display Data
  monthNameEn: string = '';
  weeks: CalendarCell[][] = [];
  selectedPanchangam!: DailyPanchangam;
  activeMonthFestivals: Festival[] = [];

  // Metadata Lists
  readonly TAMIL_MONTHS: TamilMonthInfo[] = [
    { nameEn: 'Chithirai', nameTa: 'சித்திரை' },
    { nameEn: 'Vaikasi', nameTa: 'வைகாசி' },
    { nameEn: 'Aani', nameTa: 'ஆனி' },
    { nameEn: 'Aadi', nameTa: 'ஆடி' },
    { nameEn: 'Avani', nameTa: 'ஆவணி' },
    { nameEn: 'Purattasi', nameTa: 'புரட்டாசி' },
    { nameEn: 'Aippasi', nameTa: 'ஐப்பசி' },
    { nameEn: 'Karthigai', nameTa: 'கார்த்திகை' },
    { nameEn: 'Margazhi', nameTa: 'மார்கழி' },
    { nameEn: 'Thai', nameTa: 'தை' },
    { nameEn: 'Masi', nameTa: 'மாசி' },
    { nameEn: 'Panguni', nameTa: 'பங்குனி' }
  ];

  readonly WEEKDAYS_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  readonly WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  readonly TAMIL_YEARS: TamilYearInfo[] = [
    { nameEn: 'Prabhava', nameTa: 'பிரபவ' },
    { nameEn: 'Vibhava', nameTa: 'விபவ' },
    { nameEn: 'Shukla', nameTa: 'சுக்ல' },
    { nameEn: 'Pramodoota', nameTa: 'பிரமோதூத' },
    { nameEn: 'Prajoopathi', nameTa: 'பிரஜோத்பத்தி' },
    { nameEn: 'Angirasa', nameTa: 'ஆங்கீரச' },
    { nameEn: 'Srimukha', nameTa: 'ஸ்ரீமுக' },
    { nameEn: 'Bhava', nameTa: 'பவ' },
    { nameEn: 'Yuva', nameTa: 'யுவ' },
    { nameEn: 'Dhatu', nameTa: 'தாது' },
    { nameEn: 'Eashwara', nameTa: 'ஈஸ்வர' },
    { nameEn: 'Bahudhanya', nameTa: 'bஹுதான்ய' },
    { nameEn: 'Pramathi', nameTa: 'பிரமாதி' },
    { nameEn: 'Vikrama', nameTa: 'விக்ரம' },
    { nameEn: 'Vishu', nameTa: 'விஷு' },
    { nameEn: 'Chitrabanu', nameTa: 'சித்திரபானு' },
    { nameEn: 'Subhanu', nameTa: 'சுபானு' },
    { nameEn: 'Tharana', nameTa: 'தாரண' },
    { nameEn: 'Parthiba', nameTa: 'பார்த்திப' },
    { nameEn: 'Viya', nameTa: 'விய' },
    { nameEn: 'Sarvajith', nameTa: 'சர்வஜித்' },
    { nameEn: 'Sarvadhari', nameTa: 'சர்வதாரி' },
    { nameEn: 'Virodhi', nameTa: 'விரோதி' },
    { nameEn: 'Vikruthi', nameTa: 'விக்ருதி' },
    { nameEn: 'Kara', nameTa: 'கர' },
    { nameEn: 'Nandhana', nameTa: 'நந்தன' },
    { nameEn: 'Vijaya', nameTa: 'விஜய' },
    { nameEn: 'Jaya', nameTa: 'ஜய' },
    { nameEn: 'Manmatha', nameTa: 'மன்மத' },
    { nameEn: 'Durmuki', nameTa: 'துன்முகி' },
    { nameEn: 'Hevilambi', nameTa: 'ஹேவிளம்பி' },
    { nameEn: 'Vilambi', nameTa: 'விளம்பி' },
    { nameEn: 'Vikari', nameTa: 'விகாரி' },
    { nameEn: 'Sarvari', nameTa: 'சார்வரி' },
    { nameEn: 'Plava', nameTa: 'பிலவ' },
    { nameEn: 'Subakrithu', nameTa: 'சுபகிருது' },
    { nameEn: 'Sobakrithu', nameTa: 'சோபகிருது' },
    { nameEn: 'Krodhi', nameTa: 'குரோதி' },      // 2024-2025
    { nameEn: 'Vishvavasu', nameTa: 'விஸ்வாவசு' }, // 2025-2026
    { nameEn: 'Parabhava', nameTa: 'பராபவ' },   // 2026-2027
    { nameEn: 'Plavanga', nameTa: 'பிலவங்க' },
    { nameEn: 'Keelaka', nameTa: 'கீலக' },
    { nameEn: 'Saumya', nameTa: 'சௌமிய' },
    { nameEn: 'Sadharana', nameTa: 'சாதாரண' },
    { nameEn: 'Virodhikruthu', nameTa: 'விரோதகிருது' },
    { nameEn: 'Paridhabhi', nameTa: 'பரிதாபி' },
    { nameEn: 'Pramadhicha', nameTa: 'பிரமாதீச' },
    { nameEn: 'Anandha', nameTa: 'ஆனந்த' },
    { nameEn: 'Rakshasa', nameTa: 'ராட்சச' },
    { nameEn: 'Nala', nameTa: 'நள' },
    { nameEn: 'Pingala', nameTa: 'பிங்கள' },
    { nameEn: 'Kalayukthi', nameTa: 'காளயுக்தி' },
    { nameEn: 'Siddharthi', nameTa: 'சித்தார்த்தி' },
    { nameEn: 'Roudhri', nameTa: 'ரௌத்திரி' },
    { nameEn: 'Durmathi', nameTa: 'துன்மதி' },
    { nameEn: 'Dundubhi', nameTa: 'துந்துபி' },
    { nameEn: 'Rudhirodhgari', nameTa: 'ருத்ரோத்காரி' },
    { nameEn: 'Raktakshi', nameTa: 'ரக்தாட்சி' },
    { nameEn: 'Krodhana', nameTa: 'குரோதன' },
    { nameEn: 'Akshaya', nameTa: 'அட்சய' }
  ];

  readonly THITHIS = [
    { en: 'Prathama (Shukla Paksha)', ta: 'பிரதமை (வளர்பிறை)' },
    { en: 'Dwitiya (Shukla Paksha)', ta: 'துவிதியை (வளர்பிறை)' },
    { en: 'Tritiya (Shukla Paksha)', ta: 'திருதியை (வளர்பிறை)' },
    { en: 'Chaturthi (Shukla Paksha)', ta: 'சதுர்த்தி (வளர்பிறை)' },
    { en: 'Panchami (Shukla Paksha)', ta: 'பஞ்சமி (வளர்பிறை)' },
    { en: 'Shasthi (Shukla Paksha)', ta: 'சஷ்டி (வளர்பிறை)' },
    { en: 'Saptami (Shukla Paksha)', ta: 'சப்தமி (வளர்பிறை)' },
    { en: 'Ashtami (Shukla Paksha)', ta: 'அஷ்டமி (வளர்பிறை)' },
    { en: 'Navami (Shukla Paksha)', ta: 'நவமி (வளர்பிறை)' },
    { en: 'Dashami (Shukla Paksha)', ta: 'தசமி (வளர்பிறை)' },
    { en: 'Ekadashi (Shukla Paksha)', ta: 'ஏகாதசி (வளர்பிறை)' },
    { en: 'Dwadashi (Shukla Paksha)', ta: 'துவாதசி (வளர்பிறை)' },
    { en: 'Trayodashi (Shukla Paksha)', ta: 'திரயோதசி (வளர்பிறை)' },
    { en: 'Chaturdashi (Shukla Paksha)', ta: 'சதுர்தசி (வளர்பிறை)' },
    { en: 'Pournami (Full Moon)', ta: 'பௌர்ணமி (முழு நிலவு)' },
    { en: 'Prathama (Krishna Paksha)', ta: 'பிரதமை (தேய்பிறை)' },
    { en: 'Dwitiya (Krishna Paksha)', ta: 'துவிதியை (தேய்பிறை)' },
    { en: 'Tritiya (Krishna Paksha)', ta: 'திருதியை (தேய்பிறை)' },
    { en: 'Chaturthi (Krishna Paksha)', ta: 'சதுர்த்தி (தேய்பிறை)' },
    { en: 'Panchami (Krishna Paksha)', ta: 'பஞ்சமி (தேய்பிறை)' },
    { en: 'Shasthi (Krishna Paksha)', ta: 'சஷ்டி (தேய்பிறை)' },
    { en: 'Saptami (Krishna Paksha)', ta: 'சப்தமி (தேய்பிறை)' },
    { en: 'Ashtami (Krishna Paksha)', ta: 'அஷ்டமி (தேய்பிறை)' },
    { en: 'Navami (Krishna Paksha)', ta: 'நவமி (தேய்பிறை)' },
    { en: 'Dashami (Krishna Paksha)', ta: 'தசமி (தேய்பிறை)' },
    { en: 'Ekadashi (Krishna Paksha)', ta: 'ஏகாதசி (தேய்பிறை)' },
    { en: 'Dwadashi (Krishna Paksha)', ta: 'துவாதசி (தேய்பிறை)' },
    { en: 'Trayodashi (Krishna Paksha)', ta: 'திரயோதசி (தேய்பிறை)' },
    { en: 'Chaturdashi (Krishna Paksha)', ta: 'சதுர்தசி (தேய்பிறை)' },
    { en: 'Amavasya (New Moon)', ta: 'அமாவாசை' }
  ];

  readonly NAKSHATRAS = [
    { en: 'Ashwini', ta: 'அஸ்வினி' },
    { en: 'Bharani', ta: 'பரணி' },
    { en: 'Krittika', ta: 'கார்த்திகை' },
    { en: 'Rohini', ta: 'ரோகிணி' },
    { en: 'Mrigashirsha', ta: 'மிருகசீரிடம்' },
    { en: 'Ardra', ta: 'திருவாதிரை' },
    { en: 'Punarvasu', ta: 'புனர்பூசம்' },
    { en: 'Pushya', ta: 'பூசம்' },
    { en: 'Ashlesha', ta: 'ஆயில்யம்' },
    { en: 'Magha', ta: 'மகம்' },
    { en: 'Purva Phalguni', ta: 'பூரம்' },
    { en: 'Uttara Phalguni', ta: 'உத்திரம்' },
    { en: 'Hasta', ta: 'அஸ்தம்' },
    { en: 'Chitra', ta: 'சித்திரை' },
    { en: 'Swati', ta: 'சுவாதி' },
    { en: 'Vishakha', ta: 'விசாகம்' },
    { en: 'Anuradha', ta: 'அனுஷம்' },
    { en: 'Jyeshtha', ta: 'கேட்டை' },
    { en: 'Mula', ta: 'மூலம்' },
    { en: 'Purva Ashadha', ta: 'பூராடம்' },
    { en: 'Uttara Ashadha', ta: 'உத்திராடம்' },
    { en: 'Shravana', ta: 'திருவோணம்' },
    { en: 'Dhanishta', ta: 'அவிட்டம்' },
    { en: 'Shatabhisha', ta: 'சதயம்' },
    { en: 'Purva Bhadrapada', ta: 'பூரட்டாதி' },
    { en: 'Uttara Bhadrapada', ta: 'உத்திரட்டாதி' },
    { en: 'Revati', ta: 'ரேவதி' }
  ];

  readonly FESTIVALS: Festival[] = [
    { month: 0, day: 1, nameEn: 'Tamil New Year (Puthandu)', nameTa: 'தமிழ்ப் புத்தாண்டு (சித்திரை கனி)' },
    { month: 0, day: 3, nameEn: 'Chithirai Thiruvizha Begined (Madurai)', nameTa: 'சித்திரைத் திருவிழா தொடக்கம்' },
    { month: 0, day: 15, nameEn: 'Chitra Pournami', nameTa: 'சித்ரா பௌர்ணமி' },
    { month: 1, day: 18, nameEn: 'Vaikasi Visakam', nameTa: 'வைகாசி விசாகம்' },
    { month: 2, day: 21, nameEn: 'Aani Thirumanjanam', nameTa: 'ஆனித் திருமஞ்சனம்' },
    { month: 3, day: 1, nameEn: 'Aadi Pandigai', nameTa: 'ஆடிப் பண்டிகை' },
    { month: 3, day: 18, nameEn: 'Aadi Perukku', nameTa: 'ஆடிப் பெருக்கு' },
    { month: 3, day: 28, nameEn: 'Aadi Krithigai', nameTa: 'ஆடிக் கிருத்திகை' },
    { month: 4, day: 15, nameEn: 'Avani Avittam', nameTa: 'ஆவணி அவிட்டம்' },
    { month: 4, day: 22, nameEn: 'Vinayagar Chaturthi', nameTa: 'விநாயகர் சதுர்த்தி' },
    { month: 4, day: 27, nameEn: 'Sri Krishna Jayanthi', nameTa: 'கிருஷ்ண ஜெயந்தி' },
    { month: 5, day: 10, nameEn: 'Navarathri Begins', nameTa: 'நவராத்திரி ஆரம்பம்' },
    { month: 5, day: 19, nameEn: 'Saraswathi Pooja / Ayudha Pooja', nameTa: 'சரஸ்வதி பூஜை / ஆயுத பூஜை' },
    { month: 5, day: 20, nameEn: 'Vijayadasami', nameTa: 'விஜயதசமி' },
    { month: 6, day: 15, nameEn: 'Deepavali', nameTa: 'தீபாவளி பண்டிகை' },
    { month: 6, day: 25, nameEn: 'Skanda Sasthi Soorasamharam', nameTa: 'கந்த சஷ்டி சூரசம்ஹாரம்' },
    { month: 7, day: 25, nameEn: 'Karthigai Deepam', nameTa: 'கார்த்திகைத் தீபம்' },
    { month: 8, day: 11, nameEn: 'Vaikunda Ekadashi', nameTa: 'வைகுண்ட ஏகாதசி' },
    { month: 8, day: 27, nameEn: 'Aarudra Dharisanam', nameTa: 'ஆருத்ரா தரிசனம்' },
    { month: 9, day: 1, nameEn: 'Boghi Pandigai', nameTa: 'போகிப் பண்டிகை' },
    { month: 9, day: 2, nameEn: 'Thai Pongal', nameTa: 'தைப்பொங்கல்' },
    { month: 9, day: 3, nameEn: 'Mattu Pongal / Kanum Pongal', nameTa: 'மாட்டுப் பொங்கல் / காணும் பொங்கல்' },
    { month: 9, day: 25, nameEn: 'Thai Poosam', nameTa: 'தைப்பூசம்' },
    { month: 10, day: 22, nameEn: 'Maha Shivaraathri', nameTa: 'மகா சிவராத்திரி' },
    { month: 10, day: 25, nameEn: 'Masi Magam', nameTa: 'மாசி மகம்' },
    { month: 11, day: 28, nameEn: 'Panguni Uthiram', nameTa: 'பங்குனி உத்திரம்' }
  ];

  constructor() {
    this.seo.updateMetaTags({
      title: 'Daily Tamil Calendar & Panchangam | Pravin Tamilan',
      description: 'Check active Tamil date, Thiruvalluvar year, daily Nalla Neram, Rahu Kalam, active Nakshatra, Thithi, and traditional Tamil holidays.',
      url: 'https://pravintamilan.com/calendar'
    });
  }

  ngOnInit(): void {
    // Sync current calendar variables to simulation context (June 2026)
    const today = new Date();
    // If the system year is 2026, we follow the actual date, otherwise default to simulation June 2026.
    if (today.getFullYear() === 2026) {
      this.selectedDate = today;
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth();
    } else {
      this.currentYear = 2026;
      this.currentMonth = 5; // June
      this.selectedDate = new Date(Date.UTC(2026, 5, 25, 12, 0, 0));
    }
    
    this.buildCalendar();
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }

  // Generate Calendar Grid
  buildCalendar(): void {
    const firstDayOfMonth = new Date(Date.UTC(this.currentYear, this.currentMonth, 1));
    const startDayOfWeek = firstDayOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(this.currentYear, this.currentMonth + 1, 0)).getUTCDate();

    // Fetch English Month Name
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    this.monthNameEn = formatter.format(firstDayOfMonth);

    const tempCells: CalendarCell[] = [];

    // Empty Cells for padding before the 1st of the Month
    for (let i = 0; i < startDayOfWeek; i++) {
      tempCells.push({
        date: null,
        gDay: null,
        tamilMonthIndex: null,
        tamilDay: null,
        isToday: false,
        isSelected: false
      });
    }

    // Days list
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(Date.UTC(this.currentYear, this.currentMonth, day, 12, 0, 0));
      const tamilInfo = this.convertGregorianToTamil(cellDate);

      const isToday = today.getUTCDate() === day &&
                      today.getUTCMonth() === this.currentMonth &&
                      today.getUTCFullYear() === this.currentYear;

      const isSelected = this.selectedDate.getUTCDate() === day &&
                         this.selectedDate.getUTCMonth() === this.currentMonth &&
                         this.selectedDate.getUTCFullYear() === this.currentYear;

      tempCells.push({
        date: cellDate,
        gDay: day,
        tamilMonthIndex: tamilInfo.monthIndex,
        tamilDay: tamilInfo.day,
        isToday,
        isSelected
      });
    }

    // Chunk into weeks (arrays of 7 cells)
    this.weeks = [];
    while (tempCells.length > 0) {
      this.weeks.push(tempCells.splice(0, 7));
    }

    // Compute Panchangam details for the selected day
    this.selectedPanchangam = this.calculatePanchangam(this.selectedDate);
    this.activeMonthFestivals = this.getFestivalsForActiveMonth();
  }

  // Navigation
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar();
  }

  selectCell(cell: CalendarCell): void {
    if (cell.date) {
      this.selectedDate = cell.date;
      
      // Update selected states inside weeks structure
      this.weeks.forEach(w => w.forEach(c => {
        if (c.date) {
          c.isSelected = c.date.getUTCDate() === cell.date?.getUTCDate() &&
                         c.date.getUTCMonth() === cell.date?.getUTCMonth() &&
                         c.date.getUTCFullYear() === cell.date?.getUTCFullYear();
        }
      }));

      this.selectedPanchangam = this.calculatePanchangam(this.selectedDate);
      this.activeMonthFestivals = this.getFestivalsForActiveMonth();
    }
  }

  // Convert Gregorian to Tamil Month Index & Day
  convertGregorianToTamil(date: Date): { monthIndex: number; day: number; cycleYear: number } {
    const year = date.getUTCFullYear();
    
    // Determine the Tamil cycle base year
    // Puthandu falls on April 14th
    const puthanduDate = new Date(Date.UTC(year, 3, 14, 0, 0, 0));
    const cycleYear = date.getTime() >= puthanduDate.getTime() ? year : year - 1;

    // Define approximate Tamil month ingress (Gregorian month and day)
    // 0: Chithirai, 1: Vaikasi, 2: Aani, etc.
    const monthIngress = [
      { m: 3, d: 14 }, // Chithirai (Apr 14)
      { m: 4, d: 15 }, // Vaikasi (May 15)
      { m: 5, d: 15 }, // Aani (Jun 15)
      { m: 6, d: 16 }, // Aadi (Jul 16)
      { m: 7, d: 17 }, // Avani (Aug 17)
      { m: 8, d: 17 }, // Purattasi (Sep 17)
      { m: 9, d: 18 }, // Aippasi (Oct 18)
      { m: 10, d: 17 }, // Karthigai (Nov 17)
      { m: 11, d: 16 }, // Margazhi (Dec 16)
      { m: 0, d: 14 }, // Thai (Jan 14, next year)
      { m: 1, d: 13 }, // Masi (Feb 13, next year)
      { m: 2, d: 15 }  // Panguni (Mar 15, next year)
    ];

    const transitionDates: { index: number; date: Date }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const ingress = monthIngress[i];
      let y = cycleYear;
      // Thai, Masi, Panguni are in the next Gregorian year of the cycle
      if (i >= 9) {
        y = cycleYear + 1;
      }
      transitionDates.push({
        index: i,
        date: new Date(Date.UTC(y, ingress.m, ingress.d, 0, 0, 0))
      });
    }

    // Find the current Tamil month by scanning backwards
    let activeMonthIndex = 11; // Default to Panguni
    let activeIngressDate = transitionDates[11].date;

    for (let i = 11; i >= 0; i--) {
      if (date.getTime() >= transitionDates[i].date.getTime()) {
        activeMonthIndex = i;
        activeIngressDate = transitionDates[i].date;
        break;
      }
    }

    // Difference in days gives the Tamil day of the month
    const diffTime = date.getTime() - activeIngressDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const tamilDay = diffDays + 1;

    return {
      monthIndex: activeMonthIndex,
      day: tamilDay,
      cycleYear: cycleYear
    };
  }

  // Calculate detailed daily Panchangam details
  private calculatePanchangam(date: Date): DailyPanchangam {
    const tamilDateInfo = this.convertGregorianToTamil(date);
    
    // 1. Year calculation (based on April 14 cycle year)
    const yearCycleIndex = (tamilDateInfo.cycleYear - 1987 + 60) % 60;
    const yearInfo = this.TAMIL_YEARS[yearCycleIndex];

    // 2. Month details
    const monthInfo = this.TAMIL_MONTHS[tamilDateInfo.monthIndex];

    // 3. Thiruvalluvar Year (starts on Thai 1, Jan 14)
    const thai1Date = new Date(Date.UTC(date.getUTCFullYear(), 0, 14, 0, 0, 0));
    const thiruvalluvarYear = date.getTime() >= thai1Date.getTime()
      ? date.getUTCFullYear() + 31
      : date.getUTCFullYear() + 30;

    // 4. Weekday details
    const dayOfWeek = date.getUTCDay();
    const weekdayEn = this.WEEKDAYS_EN[dayOfWeek];
    const weekdayTa = this.WEEKDAYS_TA[dayOfWeek];

    // 5. Thithi calculation (synodic cycle anchored to June 25, 2026 12:00 = Ekadashi index 10)
    const anchorDate = new Date(Date.UTC(2026, 5, 25, 12, 0, 0));
    const diffTime = date.getTime() - anchorDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Synodic Month (New Moon to New Moon) = 29.53059 days
    const synodicMonth = 29.53059;
    const tithiIndex = Math.floor(((diffDays % synodicMonth + synodicMonth) % synodicMonth) / (synodicMonth / 30) + 10) % 30;
    const thithiObj = this.THITHIS[tithiIndex];

    // 6. Nakshatra calculation (sidereal transit anchored to June 25, 2026 12:00 = Swati index 14)
    // Sidereal month = 27.321661 days
    const siderealMonth = 27.321661;
    const nakshatraIndex = Math.floor(((diffDays % siderealMonth + siderealMonth) % siderealMonth) / (siderealMonth / 27) + 14) % 27;
    const nakshatraObj = this.NAKSHATRAS[nakshatraIndex];

    // 7. Time configurations (based on weekday rules)
    const dailyTimes = this.getDailyTimings(dayOfWeek);

    return {
      gregorianDate: date,
      tamilYearEn: yearInfo.nameEn,
      tamilYearTa: yearInfo.nameTa,
      tamilMonthEn: monthInfo.nameEn,
      tamilMonthTa: monthInfo.nameTa,
      tamilDay: tamilDateInfo.day,
      thiruvalluvarYear,
      weekdayEn,
      weekdayTa,
      thithiEn: thithiObj.en,
      thithiTa: thithiObj.ta,
      nakshatraEn: nakshatraObj.en,
      nakshatraTa: nakshatraObj.ta,
      ...dailyTimes
    };
  }

  // Get Auspicious and Inauspicious Timings based on Day of Week
  private getDailyTimings(dayOfWeek: number): {
    nallaNeram: string;
    gowriNallaNeram: string;
    rahuKalam: string;
    yamagandam: string;
    kuligai: string;
  } {
    // Timings dictionary mapping day of week (0: Sunday, 1: Monday, etc.)
    const timingLookup = [
      { // Sunday (ஞாயிறு)
        nallaNeram: '07:30 AM - 09:00 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '10:30 AM - 11:30 AM | 01:30 PM - 02:30 PM',
        rahuKalam: '04:30 PM - 06:00 PM',
        yamagandam: '12:00 PM - 01:30 PM',
        kuligai: '03:00 PM - 04:30 PM'
      },
      { // Monday (திங்கள்)
        nallaNeram: '06:00 AM - 07:30 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '09:00 AM - 10:30 AM | 07:30 PM - 09:00 PM',
        rahuKalam: '07:30 AM - 09:00 AM',
        yamagandam: '10:30 AM - 12:00 PM',
        kuligai: '01:30 PM - 03:00 PM'
      },
      { // Tuesday (செவ்வாய்)
        nallaNeram: '07:30 AM - 09:00 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '12:00 PM - 01:30 PM | 04:30 PM - 05:30 PM',
        rahuKalam: '03:00 PM - 04:30 PM',
        yamagandam: '09:00 AM - 10:30 AM',
        kuligai: '12:00 PM - 01:30 PM'
      },
      { // Wednesday (புதன்)
        nallaNeram: '09:00 AM - 10:30 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '12:00 PM - 01:30 PM | 06:00 PM - 07:30 PM',
        rahuKalam: '12:00 PM - 01:30 PM',
        yamagandam: '07:30 AM - 09:00 AM',
        kuligai: '10:30 AM - 12:00 PM'
      },
      { // Thursday (வியாழன்)
        nallaNeram: '09:00 AM - 10:30 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '12:00 PM - 01:30 PM | 07:30 PM - 09:00 PM',
        rahuKalam: '01:30 PM - 03:00 PM',
        yamagandam: '06:00 AM - 07:30 AM',
        kuligai: '09:00 AM - 10:30 AM'
      },
      { // Friday (வெள்ளி)
        nallaNeram: '09:00 AM - 10:30 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '12:00 PM - 01:30 PM | 05:00 PM - 06:00 PM',
        rahuKalam: '10:30 AM - 12:00 PM',
        yamagandam: '03:00 PM - 04:30 PM',
        kuligai: '07:30 AM - 09:00 AM'
      },
      { // Saturday (சனி)
        nallaNeram: '07:30 AM - 09:00 AM | 04:30 PM - 06:00 PM',
        gowriNallaNeram: '09:00 AM - 10:30 AM | 01:30 PM - 02:30 PM',
        rahuKalam: '09:00 AM - 10:30 AM',
        yamagandam: '01:30 PM - 03:00 PM',
        kuligai: '06:00 AM - 07:30 AM'
      }
    ];

    return timingLookup[dayOfWeek];
  }

  // Fetch Festivals that fall in the currently selected Tamil Month
  private getFestivalsForActiveMonth(): Festival[] {
    const baseTamilInfo = this.convertGregorianToTamil(this.selectedDate);
    return this.FESTIVALS.filter(f => f.month === baseTamilInfo.monthIndex);
  }
}
