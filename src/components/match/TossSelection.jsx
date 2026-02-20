import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import './TossSelection.css';

const TossSelection = ({ teamA, teamB, onNext, onBack }) => {
  const [tossWinner, setTossWinner] = useState(null);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!tossWinner) {
      setError('Please select toss winner');
      return;
    }
    if (!decision) {
      setError('Please select batting or bowling');
      return;
    }

    onNext({ winner: tossWinner, decision });
  };

  const handleTossWinnerSelect = (winner) => {
    setTossWinner(winner);
    setError('');
  };

  const handleDecisionSelect = (dec) => {
    setDecision(dec);
    setError('');
  };

  return (
    <div className="toss-selection">
      <div className="setup-header">
        <h2>🪙 Toss</h2>
        <p>Who won the toss?</p>
      </div>

      <Card title="Select Toss Winner">
        <div className="toss-teams">
          <button
            className={`toss-team-btn ${tossWinner === 'teamA' ? 'active' : ''}`}
            onClick={() => handleTossWinnerSelect('teamA')}
          >
            <div className="toss-team-icon">🏏</div>
            <div className="toss-team-name">{teamA.name}</div>
          </button>

          <div className="toss-vs">VS</div>

          <button
            className={`toss-team-btn ${tossWinner === 'teamB' ? 'active' : ''}`}
            onClick={() => handleTossWinnerSelect('teamB')}
          >
            <div className="toss-team-icon">🏏</div>
            <div className="toss-team-name">{teamB.name}</div>
          </button>
        </div>
      </Card>

      {tossWinner && (
        <Card title="Choose to Bat or Bowl" className="decision-card">
          <div className="toss-decision">
            <button
              className={`decision-btn ${decision === 'bat' ? 'active' : ''}`}
              onClick={() => handleDecisionSelect('bat')}
            >
              <div className="decision-icon">🏏</div>
              <div className="decision-label">Bat First</div>
              <div className="decision-subtitle">Set the target</div>
            </button>

            <button
              className={`decision-btn ${decision === 'bowl' ? 'active' : ''}`}
              onClick={() => handleDecisionSelect('bowl')}
            >
              <div className="decision-icon">⚾</div>
              <div className="decision-label">Bowl First</div>
              <div className="decision-subtitle">Chase the score</div>
            </button>
          </div>
        </Card>
      )}

      {tossWinner && decision && (
        <div className="toss-summary">
          <div className="toss-summary-icon">✅</div>
          <div className="toss-summary-text">
            <strong>{tossWinner === 'teamA' ? teamA.name : teamB.name}</strong> won the toss and
            chose to <strong>{decision === 'bat' ? 'bat' : 'bowl'}</strong> first
          </div>
        </div>
      )}

      {error && <div className="toss-error">{error}</div>}

      <div className="setup-actions">
        <Button variant="outline" size="lg" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" size="lg" onClick={handleNext}>
          Start Match →
        </Button>
      </div>
    </div>
  );
};

export default TossSelection;
