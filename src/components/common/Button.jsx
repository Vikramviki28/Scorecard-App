import './Button.css';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button'
}) => {
  const className = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${
    disabled ? 'btn-disabled' : ''
  }`;

  return (
    <button className={className} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
};

export default Button;
