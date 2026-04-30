export default function Modal({ title, subtitle, onClose, footer, maxWidth, children }) {
  return (
    <div className="dh-modal-overlay" onClick={onClose}>
      <div
        className="dh-modal"
        style={maxWidth ? { maxWidth, width: "100%" } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dh-modal-hd">
          <div>
            <div className="dh-modal-title">{title}</div>
            {subtitle && <div className="dh-panel-sub">{subtitle}</div>}
          </div>
          <button className="dh-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="dh-modal-body">{children}</div>
        {footer && <div className="dh-modal-ft">{footer}</div>}
      </div>
    </div>
  );
}