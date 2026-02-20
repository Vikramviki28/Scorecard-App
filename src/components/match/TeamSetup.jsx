import { useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateTeamName, validatePlayerName } from '../../utils/validators';
import './TeamSetup.css';

const TeamSetup = ({ config, onNext, onBack }) => {
  const [teamA, setTeamA] = useState({ name: '', players: ['', ''] });
  const [teamB, setTeamB] = useState({ name: '', players: ['', ''] });
  const [errors, setErrors] = useState({});

  const handleTeamANameChange = (e) => {
    setTeamA({ ...teamA, name: e.target.value });
    setErrors({ ...errors, teamAName: null });
  };

  const handleTeamBNameChange = (e) => {
    setTeamB({ ...teamB, name: e.target.value });
    setErrors({ ...errors, teamBName: null });
  };

  const handlePlayerChange = (team, index, value) => {
    if (team === 'A') {
      const newPlayers = [...teamA.players];
      newPlayers[index] = value;
      setTeamA({ ...teamA, players: newPlayers });
    } else {
      const newPlayers = [...teamB.players];
      newPlayers[index] = value;
      setTeamB({ ...teamB, players: newPlayers });
    }
    setErrors({ ...errors, [`${team}Player${index}`]: null });
  };

  const addPlayer = (team) => {
    if (team === 'A') {
      if (teamA.players.length < config.playersPerTeam) {
        setTeamA({ ...teamA, players: [...teamA.players, ''] });
      }
    } else {
      if (teamB.players.length < config.playersPerTeam) {
        setTeamB({ ...teamB, players: [...teamB.players, ''] });
      }
    }
  };

  const removePlayer = (team, index) => {
    if (team === 'A') {
      if (teamA.players.length > 2) {
        const newPlayers = teamA.players.filter((_, i) => i !== index);
        setTeamA({ ...teamA, players: newPlayers });
      }
    } else {
      if (teamB.players.length > 2) {
        const newPlayers = teamB.players.filter((_, i) => i !== index);
        setTeamB({ ...teamB, players: newPlayers });
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate team names
    const teamAValidation = validateTeamName(teamA.name);
    if (!teamAValidation.valid) {
      newErrors.teamAName = teamAValidation.error;
    }

    const teamBValidation = validateTeamName(teamB.name);
    if (!teamBValidation.valid) {
      newErrors.teamBName = teamBValidation.error;
    }

    // Check if team names are different
    if (teamA.name.toLowerCase().trim() === teamB.name.toLowerCase().trim()) {
      newErrors.teamBName = 'Team names must be different';
    }

    // Validate players
    const validatePlayers = (players, teamLetter) => {
      const filledPlayers = players.filter(p => p.trim() !== '');
      if (filledPlayers.length < 2) {
        newErrors[`${teamLetter}Players`] = 'At least 2 players required';
        return;
      }

      players.forEach((player, index) => {
        if (player.trim() !== '') {
          const validation = validatePlayerName(player);
          if (!validation.valid) {
            newErrors[`${teamLetter}Player${index}`] = validation.error;
          }
        }
      });
    };

    validatePlayers(teamA.players, 'A');
    validatePlayers(teamB.players, 'B');

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Filter out empty player names
    const teamAData = {
      name: teamA.name,
      players: teamA.players.filter(p => p.trim() !== '')
    };

    const teamBData = {
      name: teamB.name,
      players: teamB.players.filter(p => p.trim() !== '')
    };

    onNext({ teamA: teamAData, teamB: teamBData });
  };

  return (
    <div className="team-setup">
      <div className="setup-header">
        <h2>👥 Team Setup</h2>
        <p>Add teams and players</p>
      </div>

      {/* Team A */}
      <Card title="Team A" className="team-card">
        <Input
          label="Team Name"
          value={teamA.name}
          onChange={handleTeamANameChange}
          placeholder="e.g., Street Warriors"
          error={errors.teamAName}
          required
        />

        <div className="players-section">
          <div className="players-header">
            <h4>Players</h4>
            <span className="players-count">{teamA.players.filter(p => p.trim() !== '').length} / {config.playersPerTeam}</span>
          </div>

          {teamA.players.map((player, index) => (
            <div key={index} className="player-input-row">
              <Input
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange('A', index, e.target.value)}
                error={errors[`APlayer${index}`]}
              />
              {teamA.players.length > 2 && (
                <button
                  className="remove-player-btn"
                  onClick={() => removePlayer('A', index)}
                  title="Remove player"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {errors.APlayers && <div className="team-error">{errors.APlayers}</div>}

          {teamA.players.length < config.playersPerTeam && (
            <Button variant="ghost" size="sm" fullWidth onClick={() => addPlayer('A')}>
              + Add Player
            </Button>
          )}
        </div>
      </Card>

      {/* VS Divider */}
      <div className="vs-divider">
        <span className="vs-text">VS</span>
      </div>

      {/* Team B */}
      <Card title="Team B" className="team-card">
        <Input
          label="Team Name"
          value={teamB.name}
          onChange={handleTeamBNameChange}
          placeholder="e.g., Gully Champions"
          error={errors.teamBName}
          required
        />

        <div className="players-section">
          <div className="players-header">
            <h4>Players</h4>
            <span className="players-count">{teamB.players.filter(p => p.trim() !== '').length} / {config.playersPerTeam}</span>
          </div>

          {teamB.players.map((player, index) => (
            <div key={index} className="player-input-row">
              <Input
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange('B', index, e.target.value)}
                error={errors[`BPlayer${index}`]}
              />
              {teamB.players.length > 2 && (
                <button
                  className="remove-player-btn"
                  onClick={() => removePlayer('B', index)}
                  title="Remove player"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {errors.BPlayers && <div className="team-error">{errors.BPlayers}</div>}

          {teamB.players.length < config.playersPerTeam && (
            <Button variant="ghost" size="sm" fullWidth onClick={() => addPlayer('B')}>
              + Add Player
            </Button>
          )}
        </div>
      </Card>

      <div className="setup-actions">
        <Button variant="outline" size="lg" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" size="lg" onClick={handleNext}>
          Next: Toss →
        </Button>
      </div>
    </div>
  );
};

export default TeamSetup;
