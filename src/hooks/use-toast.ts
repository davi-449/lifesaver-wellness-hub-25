
import { useState, useCallback } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

type ToastState = ToastProps & {
  id: string;
  open: boolean;
};

const toasts: ToastState[] = [];

export const useToast = () => {
  const [, setToastsState] = useState<ToastState[]>(toasts);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, variant, duration, open: true };
      
      toasts.push(newToast);
      setToastsState([...toasts]);
      
      setTimeout(() => {
        const index = toasts.findIndex((t) => t.id === id);
        if (index !== -1) {
          toasts.splice(index, 1);
          setToastsState([...toasts]);
        }
      }, duration);
      
      return id;
    },
    []
  );

  return { toast };
};

export { toast } from "@/components/ui/toast";
