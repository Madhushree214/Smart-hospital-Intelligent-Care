import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export const useToast = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useToast must be used within an AppProvider");
  }
  return {
    addToast: context.addToast,
    removeToast: context.removeToast,
    toasts: context.toasts
  };
};
