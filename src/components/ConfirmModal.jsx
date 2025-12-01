import { useState } from "react";
import "../styles/ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
  type = "danger",
  requirePassword = false,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requirePassword) {
      if (password === "87654321!@") {
        setPassword("");
        setError("");
        onConfirm();
      } else {
        setError("Parol noto'g'ri!");
      }
    } else {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon ${type}`}>
          {type === "danger" && "⚠️"}
          {type === "warning" && "⚡"}
          {type === "info" && "ℹ️"}
        </div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        {requirePassword && (
          <div className="password-input-group">
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="password-input"
            />
            {error && <p className="password-error">{error}</p>}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            {cancelText}
          </button>
          <button className={`btn-confirm ${type}`} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
