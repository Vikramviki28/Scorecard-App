import { useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateOvers } from '../../utils/validators';
import { DEFAULT_CONFIG } from '../../utils/constants';
import './MatchSetup.css';

const MatchSetup = ({ onNext }) => {
  const [config, setConfig] = useState({
    totalOvers: DEFAULT_CONFIG.TOTAL_OVERS,
    playersPerTeam: DEFAULT_CONFIG.PLAYERS_PER_TEAM
  });
  const [errors, setErrors] = useState({});

  const handleOversChange = (e) => {
    const value = parseInt(e.target.value);
    setConfig({ ...config, totalOvers: value });
    setErrors({ ...errors, totalOvers: null });
  };

  const handlePlayersChange = (e) => {
    const value = parseInt(e.target.value);
    setConfig({ ...config, playersPerTeam: value });
    setErrors({ ...errors, playersPerTeam: null });
  };

  const handleNext = () => {
    const newErrors = {};

    const oversValidation = validateOvers(config.totalOvers);
    if (!oversValidation.valid) {
      newErrors.totalOvers = oversValidation.error;
    }

    if (config.playersPerTeam < 2 || config.playersPerTeam > 15) {
      newErrors.playersPerTeam = 'Players must be between 2 and 15';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(config);
  };

  const quickOptions = [
    { overs: 5, label: '5 Overs', subtitle: 'Quick Match' },
    { overs: 10, label: '10 Overs', subtitle: 'Standard' },
    { overs: 15, label: '15 Overs', subtitle: 'Extended' },
    { overs: 20, label: '20 Overs', subtitle: 'T20 Style' }
  ];

  return (
    <div className="match-setup">
      <div className="setup-header">
        <h2>⚙️ Match Configuration</h2>
        <p>Set up your match details</p>
      </div>

      <Card title="Quick Select">
        <div className="quick-options">
          {quickOptions.map((option) => (
            <button
              key={option.overs}
              className={`quick-option ${config.totalOvers === option.overs ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, totalOvers: option.overs })}
            >
              <div className="quick-option-label">{option.label}</div>
              <div className="quick-option-subtitle">{option.subtitle}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Custom Settings">
        <Input
          label="Total Overs"
          type="number"
          value={config.totalOvers}
          onChange={handleOversChange}
          min={1}
          max={50}
          error={errors.totalOvers}
          required
        />

        <Input
          label="Players Per Team"
          type="number"
          value={config.playersPerTeam}
          onChange={handlePlayersChange}
          min={2}
          max={15}
          error={errors.playersPerTeam}
          required
        />
      </Card>

      <div className="setup-actions">
        <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
          Next: Teams →
        </Button>
      </div>
    </div>
  );
};

export default MatchSetup;
