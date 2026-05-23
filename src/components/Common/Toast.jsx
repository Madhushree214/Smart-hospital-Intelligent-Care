import React from "react";
import { useToast } from "../../hooks/useToast";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X
} from "lucide-react";

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  // Retrieve matching icons
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} style={{ color: "var(--success-color)" }} />;
      case "warning":
        return <AlertTriangle size={18} style={{ color: "var(--warning-color)" }} />;
      case "danger":
      case "alert":
        return <XCircle size={18} style={{ color: "var(--danger-color)" }} />;
      default:
        return <Info size={18} style={{ color: "var(--info-color)" }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || "info"}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {getIcon(toast.type)}
            <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center"
            }}
            title="Close Alert"
          >
            <X size={14} className="hover-close" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
