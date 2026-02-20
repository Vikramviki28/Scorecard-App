# stumps2stumps - Street Cricket Scoreboard

A Progressive Web App (PWA) for scoring street cricket matches with advanced statistics tracking.

## Features

- 🏏 Live match scoring
- 📊 Advanced statistics (batting, bowling, partnerships, fall of wickets)
- 📱 Mobile-first responsive design
- 💾 Offline-capable with localStorage persistence
- 📈 Match history with filters
- 🎯 Street cricket optimized (flexible team sizes, variable overs)

## Tech Stack

- React 18
- Vite (build tool)
- React Router v6
- Vite PWA Plugin
- date-fns (date formatting)
- Recharts (statistics visualization)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── models/         # Data models (Match, Player, Innings, etc.)
├── context/        # React contexts for state management
├── hooks/          # Custom hooks
├── services/       # Business logic (storage, calculations)
├── components/     # React components
├── pages/          # Route pages
├── utils/          # Helper functions and constants
└── styles/         # CSS files
```

## Features Roadmap

- [x] Phase 1: Foundation (models, contexts, routing)
- [ ] Phase 2: Match setup flow
- [ ] Phase 3: Live scoring
- [ ] Phase 4: Statistics
- [ ] Phase 5: Match history
- [ ] Phase 6: PWA & offline support
- [ ] Phase 7: Polish & optimization

## License

MIT
