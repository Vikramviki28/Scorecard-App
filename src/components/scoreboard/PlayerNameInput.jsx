import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PlayerNameInput = ({ isOpen, onSubmit, playerType, teamName, validateName }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (validateName) {
      const validationError = validateName(name.trim());
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    onSubmit(name.trim());
    setName('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} title={`Enter ${playerType}`}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          {teamName} - {playerType}
        </p>
        <Input
          label="Player Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter name"
          error={error}
          autoFocus
        />
      </div>
      <Button variant="primary" size="md" fullWidth onClick={handleSubmit}>
        Continue
      </Button>
    </Modal>
  );
};

export default PlayerNameInput;
