# Weather Dashboard

A responsive weather dashboard built with vanilla HTML, CSS, and JavaScript. Search any city, view current conditions, hourly and multi-day forecasts, air quality, UV index, and sun/moon data—all in a single-page layout with dynamic weather-themed backgrounds.

**Live demo:** [https://sohaibalaraby.github.io/Weather-Dashboard/](https://sohaibalaraby.github.io/Weather-Dashboard/)

---

## Features

### Current weather
- City and country display with local date and time
- Temperature with **Celsius / Fahrenheit** toggle
- Weather condition text and icon (day/night aware)
- Feels-like temperature, min/max, humidity, and wind speed/direction

### Forecasts
- **Hourly forecast** for today (scrollable cards)
- **3-day forecast** with high/low temps and humidity

### Environmental & astro data
- **Air Quality Index (AQI)** with EPA-style meter and pollutant breakdown (PM₁₀, PM₂.₅, CO, SO₂, NO₂, O₃)
- **UV index** with color-coded level meter
- Humidity, visibility, dew point, and pressure
- Sunrise/sunset and moonrise/moonset with moon phase visualization

### UX & reliability
- Full-screen loading state with **Try Again** on connection failure
- City search with input validation (English and Arabic characters supported)
- Request cancellation and 10s timeout for overlapping searches
- Dynamic page background based on weather condition (sunny, cloudy, rain, snow, thunder, etc.)
- Mobile-responsive layout

### Accessibility
- Semantic landmarks (`header`, `main`, `section`)
- Screen-reader labels, `aria-live` regions, and `role="meter"` for gauges
- Keyboard-focusable forecast cards

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Markup | HTML5 (semantic structure) |
| Styling | CSS3 (custom properties, Flexbox, media queries) |
| Logic | Vanilla JavaScript (ES modules) |
| Build tool | [Vite](https://vitejs.dev/) 8 |
| Weather data | [WeatherAPI.com](https://www.weatherapi.com/) Forecast API |
| Icons & fonts | Google Material Symbols, Roboto |
| Deployment | GitHub Actions → GitHub Pages |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20 recommended)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SohaibAlaraby/Weather-Dashboard.git
   cd Weather-Dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_WEATHER_API_KEY=your_weatherapi_key_here
   ```

   Vite exposes only variables prefixed with `VITE_` to client code. Never commit `.env` to version control (it is listed in `.gitignore`).

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

The static output is written to `dist/`.

---

## Project structure

```
weather-dashboard/
├── index.html              # App shell and semantic markup
├── src/
│   ├── WD_Logic.js         # API calls, DOM updates, event handlers
│   └── WD_Style.css        # Layout, themes, and responsive styles
├── Icons/                  # Weather and moon phase icons
├── Images/                 # Dynamic background images (.webp)
├── .github/
│   └── workflows/
│       └── static.yml      # Build & deploy to GitHub Pages
├── vite.config.js          # Vite config (base path for Pages)
├── package.json
└── .env                    # Local API key (not committed)
```

---

## How it works

1. On load, the app fetches forecast data for a default city (Alexandria) with retry logic.
2. The user can search for another city; invalid names show an inline warning.
3. `fetchWeatherData()` calls the WeatherAPI forecast endpoint with `days=3` and `aqi=yes`.
4. `AbortController` cancels stale requests when a new search starts; a 10-second timeout aborts hung requests.
5. UI modules update the header, main weather panel, forecast lists, and detail cards from the JSON response.
6. Toggling °C/°F re-renders temperature-dependent sections without a new API call.

**API endpoint (simplified):**

```
GET https://api.weatherapi.com/v1/forecast.json
  ?key={VITE_WEATHER_API_KEY}
  &q={city}
  &days=3
  &aqi=yes
```

---

## Deployment (GitHub Pages)

Pushes to the `master` branch trigger the workflow in `.github/workflows/static.yml`, which:

1. Installs dependencies and runs `npm run build`
2. Injects `VITE_WEATHER_API_KEY` from the repository secret `VITE_WEATHER_API_KEY`
3. Deploys the `dist/` folder to GitHub Pages

**Setup secret:** Repository → **Settings** → **Secrets and variables** → **Actions** → add `VITE_WEATHER_API_KEY`.

The site is served under the subpath `/Weather-Dashboard/` (configured in `vite.config.js` as `base: '/Weather-Dashboard/'`).

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Browser support

Modern browsers that support ES modules, `fetch`, `AbortController`, and CSS `backdrop-filter`. Tested targets include current versions of Chrome, Firefox, Edge, and Safari.

---

## Acknowledgments

- [WeatherAPI.com](https://www.weatherapi.com/) for weather and air-quality data
- [Google Fonts](https://fonts.google.com/) for Roboto and Material Symbols
