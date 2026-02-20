import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { HistoryProvider } from './context/HistoryContext';
import { SettingsProvider } from './context/SettingsContext';

// Pages
import Home from './pages/Home';
import NewMatch from './pages/NewMatch';
import LiveMatch from './pages/LiveMatch';
import MatchHistoryPage from './pages/MatchHistoryPage';
import SharedScorecard from './pages/SharedScorecard';

// Styles
import './styles/global.css';

function App() {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <MatchProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/new-match" element={<NewMatch />} />
                <Route path="/live-match" element={<LiveMatch />} />
                <Route path="/history" element={<MatchHistoryPage />} />
                <Route path="/shared" element={<SharedScorecard />} />
              </Routes>
            </div>
          </Router>
        </MatchProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}

export default App;
