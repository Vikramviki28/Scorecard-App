import './Input.css';

const Input = ({
  label,
  value,
  onChange,
  onKeyPress,
  placeholder,
  type = 'text',
  error,
  required = false,
  disabled = false,
  autoFocus = false,
  min,
  max
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        min={min}
        max={max}
        className={`input-field ${error ? 'input-error' : ''}`}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
