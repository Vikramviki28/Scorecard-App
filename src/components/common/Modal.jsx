import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <div className="modal-header">{title}</div>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
