import { useState, useCallback } from "react";

export default function useToast() {
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: "", type: "success", visible: false });
  }, []);

  return { toast, showToast, hideToast };
}
