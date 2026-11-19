export type AppGroup = "Tamil reading & devotion" | "Desk Clock";

export interface PlayApp {
  /** Google Play package name. */
  id: string;
  name: string;
  group: AppGroup;
  summary: string;
  /** Path under public/. */
  icon: string;
}

export const playUrl = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;

export const APP_GROUPS: { id: AppGroup; intro: string; privacy: string }[] = [
  {
    id: "Tamil reading & devotion",
    intro: "Ten apps from one Flutter codebase: Tamil literature, scripture and daily tools, mostly offline.",
    privacy: "/legal/?tab=privacy",
  },
  {
    id: "Desk Clock",
    intro: "Big, full-screen timers for a phone on a stand, with OLED black and burn-in protection.",
    privacy: "/desk-clock/privacy/",
  },
];

export const APPS: PlayApp[] = [
  {
    id: "io.ionic.starter.pravintest1",
    name: "Tamil Kavithai: Kural & Poems",
    group: "Tamil reading & devotion",
    summary: "Sangam, Bhakti and modern Tamil poems with Thirukkural, quote cards and videos.",
    icon: "/apps/tamil-kavithai.png",
  },
  {
    id: "io.tamilkavithai.thirukkural",
    name: "Thirukkural Daily",
    group: "Tamil reading & devotion",
    summary: "All 1,330 kurals with meanings, a kural a day, quizzes and a home-screen widget.",
    icon: "/apps/thirukkural.png",
  },
  {
    id: "io.tamilkavithai.statusmaker",
    name: "Status Maker: Quote & Video",
    group: "Tamil reading & devotion",
    summary: "Write a status and get a quote image or a voice video, in any language.",
    icon: "/apps/status-maker.png",
  },
  {
    id: "io.tamilkavithai.bhakti",
    name: "Bhakti Daily: Thevaram Prayers",
    group: "Tamil reading & devotion",
    summary: "A Tamil prayer every day: Thevaram, Thiruvasagam, Thiruppavai and festivals.",
    icon: "/apps/bhakti.png",
  },
  {
    id: "io.tamilkavithai.bharathi",
    name: "Bharathiyar Kavithaigal Tamil",
    group: "Tamil reading & devotion",
    summary: "Mahakavi Bharathi's poems with meanings in Tamil and English, a poem every day.",
    icon: "/apps/bharathiyar.png",
  },
  {
    id: "io.tamilkavithai.health",
    name: "Health A–Z: Diseases Guide",
    group: "Tamil reading & devotion",
    summary: "A plain-language guide to 1,000 diseases and conditions, in your language.",
    icon: "/apps/health.png",
  },
  {
    id: "io.tamilkavithai.panchangam",
    name: "Tamil Panchangam: Nalla Neram",
    group: "Tamil reading & devotion",
    summary: "Rahu kalam, nalla neram and the daily Tamil panchangam for your city.",
    icon: "/apps/panchangam.png",
  },
  {
    id: "io.tamilkavithai.gita",
    name: "Bhagavad Gita Tamil: Bharathi",
    group: "Tamil reading & devotion",
    summary: "All 701 verses of the Gita with Mahakavi Bharathiyar's Tamil translation.",
    icon: "/apps/gita.png",
  },
  {
    id: "io.tamilkavithai.bible",
    name: "Tamil Bible: IRV Tamil + KJV",
    group: "Tamil reading & devotion",
    summary: "The whole Bible in Tamil (IRV) with the King James English, and a verse every day.",
    icon: "/apps/bible.png",
  },
  {
    id: "io.tamilkavithai.quran",
    name: "Quran in Tamil: Arabic & Tamil",
    group: "Tamil reading & devotion",
    summary: "All 6,236 ayat in the original Arabic with a Tamil translation, offline.",
    icon: "/apps/quran.png",
  },
  {
    id: "com.apravint.deskclock.clock",
    name: "Desk Clock: Nightstand & Night",
    group: "Desk Clock",
    summary: "A big full-screen desk and bedside clock with OLED black and a night dimmer.",
    icon: "/apps/desk-clock.png",
  },
  {
    id: "com.apravint.deskclock.focus",
    name: "Desk Focus: Pomodoro Timer",
    group: "Desk Clock",
    summary: "A full-screen Pomodoro focus timer for study and work, with big numbers.",
    icon: "/apps/desk-focus.png",
  },
  {
    id: "com.apravint.deskclock.timer",
    name: "Desk Intervals: HIIT Timer",
    group: "Desk Clock",
    summary: "A big interval timer and stopwatch for HIIT, Tabata and EMOM workouts.",
    icon: "/apps/desk-timer.png",
  },
];
