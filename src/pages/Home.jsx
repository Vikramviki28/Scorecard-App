import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { MATCH_STATUS } from '../utils/constants';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { match } = useMatch();

  const handleNewMatch = () => {
    navigate('/new-match');
  };

  const handleResumeMatch = () => {
    navigate('/live-match');
  };

  const handleMatchHistory = () => {
    navigate('/history');
  };

  const hasOngoingMatch = match && match.status !== MATCH_STATUS.COMPLETED;

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Logo and Title */}
        <div className="home-header">
          <Logo size={100} />
          <h1 className="home-title">stumps2stumps</h1>
          <p className="home-subtitle">Street Cricket Scoreboard</p>
          <div className="home-tagline">Score • Track • Celebrate</div>
        </div>

        {/* Action Buttons */}
        <div className="home-actions">
          {hasOngoingMatch && (
            <div className="resume-match-banner">
              <div className="resume-match-text">
                <div className="resume-match-icon">🏏</div>
                <div>
                  <div className="resume-match-title">Match in Progress</div>
                  <div className="resume-match-subtitle">
                    {match.teams.teamA.name} vs {match.teams.teamB.name}
                  </div>
                </div>
              </div>
              <Button variant="success" size="md" fullWidth onClick={handleResumeMatch}>
                Resume Match
              </Button>
            </div>
          )}

          <Button variant="primary" size="md" fullWidth onClick={handleNewMatch}>
            🆕 New Match
          </Button>

          <Button variant="outline" size="md" fullWidth onClick={handleMatchHistory}>
            📊 Match History
          </Button>
        </div>

        {/* Features */}
        <div className="home-features">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Quick Scoring</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <div className="feature-text">Live Stats</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💾</div>
            <div className="feature-text">Auto Save</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>Made for street cricket enthusiasts</p>
      </div>
    </div>
  );
};

export default Home;
