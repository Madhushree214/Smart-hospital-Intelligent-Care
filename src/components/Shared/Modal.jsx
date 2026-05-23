const Modal = ({ open, title, description, children, onClose }) => {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

export default Modal
