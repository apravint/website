# Pravin Tamilan - Personal Website

A modern Angular 19 personal website featuring a portfolio, Tamil poetry (Kavithai) collection with Firebase integration, and a powerful Card Creator tool for designing social media graphics.

## ✨ Features

### 🎨 Card Creator
A professional-grade graphic design tool for creating social media cards and posters:
- **Canvas Sizes**: Instagram Post/Story, WhatsApp Status, Facebook, Twitter/X, YouTube Thumbnail
- **Text Editing**:
  - Multiple fonts (20+ Google Fonts including Tamil fonts)
  - Font size, color, and alignment controls
  - Bold, Italic, Underline, Strikethrough
  - Letter spacing and line height
  - Text shadow with customizable offset, blur, and color
  - Text stroke/outline
  - Text opacity and background color
  - Text transform (uppercase, lowercase, capitalize)
- **Templates**: 25+ pre-designed templates for quotes, poems, festivals, social media, and business
- **Backgrounds**: 30+ gradient presets and 50+ solid color options
- **Export**: PNG, JPEG, SVG formats with quality options (1x, 2x, 4x)

### 📜 Kavithai (Tamil Poetry)
- Browse and read Tamil poems with Firebase backend
- AI-powered poetry assistant
- Share poems on social media

### 📰 News
- Trending Tamil news from Google News RSS
- Clean reading experience

### 📱 Pages
- Home / Portfolio
- About
- Download (App downloads)
- Privacy Policy

## 🚀 Getting Started

### Prerequisites
- Node.js v20.19+ or v22.12+
- Angular CLI

### Development Server

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`. The app auto-reloads on file changes.

### Build

```bash
ng build --configuration production
```

Build artifacts are stored in the `dist/` directory.

### Testing

```bash
# Unit tests
ng test

# Headless (CI)
npm test -- --watch=false
```

## 🔧 Firebase Setup

For local development with Firebase features:

1. Open `src/environments/environment.ts`
2. Replace `YOUR_FIREBASE_API_KEY` and `YOUR_FIREBASE_APP_ID` with your credentials
3. To prevent tracking local changes:
   ```bash
   git update-index --assume-unchanged src/environments/environment.ts
   ```

## 🛠️ Tech Stack

- **Framework**: Angular 19
- **Styling**: SCSS with CSS custom properties
- **Canvas**: Fabric.js 6.x
- **Backend**: Firebase (Firestore, Auth)
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
src/app/
├── card-creator/       # Card design tool
│   ├── services/       # Canvas, Export, History services
│   └── models/         # Canvas element models
├── kavithai/           # Tamil poetry page
├── news/               # News feed
├── about/              # About page
├── download/           # Downloads page
├── privacy/            # Privacy policy
├── navbar/             # Navigation
└── shared/             # Shared services
```

## 📝 Notes

- This project was generated with Angular CLI v19.0.6
- For more Angular CLI commands: [Angular CLI Reference](https://angular.dev/tools/cli)

## 📄 License

© Pravin Tamilan. All rights reserved.
