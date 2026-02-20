import { useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import './QuickMatchSetup.css';

const QuickMatchSetup = ({ onStart }) => {
  const [formData, setFormData] = useState({
    teamAName: '',
    teamBName: '',
    totalOvers: 10,
    tossWinner: null,
    battingFirst: null
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.teamAName.trim()) {
      newErrors.teamAName = 'Team name required';
    }
    if (!formData.teamBName.trim()) {
      newErrors.teamBName = 'Team name required';
    }
    if (formData.teamAName.toLowerCase() === formData.teamBName.toLowerCase()) {
      newErrors.teamBName = 'Team names must be different';
    }
    if (!formData.totalOvers || formData.totalOvers < 1 || formData.totalOvers > 50) {
      newErrors.totalOvers = 'Overs must be between 1 and 50';
    }
    if (!formData.tossWinner) {
      newErrors.toss = 'Select toss winner';
    }
    if (!formData.battingFirst) {
      newErrors.batting = 'Select batting team';
    }

    return newErrors;
  };

  const handleStart = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onStart(formData);
  };

  const quickOvers = [5, 10, 15, 20];

  return (
    <div className="quick-match-setup">
      <div className="quick-header">
        <h2>⚡ Quick Setup</h2>
        <p>Get started in seconds</p>
      </div>

      <Card>
        <div className="form-section">
          <h3 className="section-title">Teams</h3>
          <Input
            label="Team 1"
            value={formData.teamAName}
            onChange={(e) => handleChange('teamAName', e.target.value)}
            placeholder="e.g., Street Warriors"
            error={errors.teamAName}
          />
          <Input
            label="Team 2"
            value={formData.teamBName}
            onChange={(e) => handleChange('teamBName', e.target.value)}
            placeholder="e.g., Gully Champions"
            error={errors.teamBName}
          />
        </div>

        <div className="form-section">
          <h3 className="section-title">Overs</h3>
          <div className="overs-quick-select">
            {quickOvers.map((overs) => (
              <button
                key={overs}
                className={`overs-btn ${formData.totalOvers === overs ? 'active' : ''}`}
                onClick={() => handleChange('totalOvers', overs)}
              >
                {overs}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={formData.totalOvers}
            onChange={(e) => handleChange('totalOvers', parseInt(e.target.value))}
            min={1}
            max={50}
            error={errors.totalOvers}
          />
        </div>

        <div className="form-section">
          <h3 className="section-title">Toss Winner</h3>
          {errors.toss && <div className="error-msg">{errors.toss}</div>}
          <div className="team-select-btns">
            <button
              className={`team-select-btn ${formData.tossWinner === 'teamA' ? 'active' : ''}`}
              onClick={() => handleChange('tossWinner', 'teamA')}
              disabled={!formData.teamAName}
            >
              {formData.teamAName || 'Team 1'}
            </button>
            <button
              className={`team-select-btn ${formData.tossWinner === 'teamB' ? 'active' : ''}`}
              onClick={() => handleChange('tossWinner', 'teamB')}
              disabled={!formData.teamBName}
            >
              {formData.teamBName || 'Team 2'}
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Batting First</h3>
          {errors.batting && <div className="error-msg">{errors.batting}</div>}
          <div className="team-select-btns">
            <button
              className={`team-select-btn ${formData.battingFirst === 'teamA' ? 'active' : ''}`}
              onClick={() => handleChange('battingFirst', 'teamA')}
              disabled={!formData.teamAName}
            >
              🏏 {formData.teamAName || 'Team 1'}
            </button>
            <button
              className={`team-select-btn ${formData.battingFirst === 'teamB' ? 'active' : ''}`}
              onClick={() => handleChange('battingFirst', 'teamB')}
              disabled={!formData.teamBName}
            >
              🏏 {formData.teamBName || 'Team 2'}
            </button>
          </div>
        </div>
      </Card>

      <Button variant="primary" size="md" fullWidth onClick={handleStart}>
        🚀 Start Match
      </Button>
    </div>
  );
};

export default QuickMatchSetup;
