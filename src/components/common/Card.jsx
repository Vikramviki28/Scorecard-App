import './Card.css';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`cricket-card ${className}`}>
      {title && <div className="cricket-card-header">{title}</div>}
      <div className="cricket-card-content">{children}</div>
    </div>
  );
};

export default Card;
