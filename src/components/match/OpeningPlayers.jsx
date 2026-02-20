import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import './OpeningPlayers.css';

const OpeningPlayers = ({ battingTeam, bowlingTeam, onStart, onBack }) => {
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!striker || !nonStriker || !bowler) {
      setError('Please select all opening players');
      return;
    }

    if (striker === nonStriker) {
      setError('Striker and non-striker must be different players');
      return;
    }

    onStart({
      strikerId: striker,
      nonStrikerId: nonStriker,
      bowlerId: bowler
    });
  };

  const handlePlayerSelect = (type, playerId) => {
    if (type === 'striker') {
      setStriker(playerId);
    } else if (type === 'nonStriker') {
      setNonStriker(playerId);
    } else {
      setBowler(playerId);
    }
    setError('');
  };

  return (
    <div className="opening-players">
      <div className="setup-header">
        <h2>🎯 Opening Players</h2>
        <p>Select opening batsmen and bowler</p>
      </div>

      {/* Batting Team */}
      <Card title={`${battingTeam.name} - Opening Batsmen`}>
        <div className="player-role-section">
          <h4 className="role-title">Striker (On Strike)</h4>
          <div className="player-grid">
            {battingTeam.players.map((player) => (
              <button
                key={player.id}
                className={`player-select-btn ${striker === player.id ? 'active' : ''} ${
                  nonStriker === player.id ? 'disabled' : ''
                }`}
                onClick={() => handlePlayerSelect('striker', player.id)}
                disabled={nonStriker === player.id}
              >
                <div className="player-select-icon">👤</div>
                <div className="player-select-name">{player.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="player-role-section">
          <h4 className="role-title">Non-Striker</h4>
          <div className="player-grid">
            {battingTeam.players.map((player) => (
              <button
                key={player.id}
                className={`player-select-btn ${nonStriker === player.id ? 'active' : ''} ${
                  striker === player.id ? 'disabled' : ''
                }`}
                onClick={() => handlePlayerSelect('nonStriker', player.id)}
                disabled={striker === player.id}
              >
                <div className="player-select-icon">👤</div>
                <div className="player-select-name">{player.name}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bowling Team */}
      <Card title={`${bowlingTeam.name} - Opening Bowler`}>
        <div className="player-role-section">
          <h4 className="role-title">Select Bowler</h4>
          <div className="player-grid">
            {bowlingTeam.players.map((player) => (
              <button
                key={player.id}
                className={`player-select-btn ${bowler === player.id ? 'active bowler' : ''}`}
                onClick={() => handlePlayerSelect('bowler', player.id)}
              >
                <div className="player-select-icon">⚾</div>
                <div className="player-select-name">{player.name}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {striker && nonStriker && bowler && (
        <div className="selection-summary">
          <div className="summary-header">Selected Players</div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Striker:</span>
              <span className="summary-value">
                {battingTeam.players.find(p => p.id === striker)?.name}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Non-Striker:</span>
              <span className="summary-value">
                {battingTeam.players.find(p => p.id === nonStriker)?.name}
              </span>
            </div>
            <div className="summary-item bowler-summary">
              <span className="summary-label">Bowler:</span>
              <span className="summary-value">
                {bowlingTeam.players.find(p => p.id === bowler)?.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && <div className="opening-error">{error}</div>}

      <div className="setup-actions">
        <Button variant="outline" size="lg" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="success" size="lg" onClick={handleStart}>
          🏏 Start Match!
        </Button>
      </div>
    </div>
  );
};

export default OpeningPlayers;
