import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "success", onClose, duration = 5000, visible }) => {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, visible]);

  if (!visible || !message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-message">{message}</div>
      <button className="toast-close-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
