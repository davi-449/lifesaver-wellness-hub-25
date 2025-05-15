
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

// Define the toast options type
type ToastOptions = Omit<ToastProps, "id"> & {
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

// Create a type for our toast store 
interface ToastInfo {
  id: string; // Ensure id is always string
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  className?: string;
  duration?: number;
}

// Create a simple toast store manager
const useToastStore = () => {
  const [toasts, setToasts] = React.useState<ToastInfo[]>([]);

  const addToast = (toast: ToastInfo) => {
    setToasts((current) => [...current, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
};

// Create a singleton instance of the toast store
const toastStore = useToastStore();

const toast = ({ title, description, action, ...props }: ToastOptions) => {
  const id = sonnerToast.custom(
    () => <></>, // Empty placeholder as we'll render via our own component
    {
      duration: 5000,
      ...props,
    }
  );
  
  // Add toast to our store - ensure the id is a string
  toastStore.addToast({
    id: id.toString(),
    title,
    description,
    action,
    variant: props.variant,
    className: props.className,
    duration: props.duration,
  });
  
  return id;
};

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => {
      if (id) {
        toastStore.removeToast(id.toString());
      }
      return sonnerToast.dismiss(id);
    },
    error: (message: string) => 
      toast({ title: "Erro", description: message, variant: "destructive" }),
    success: (message: string) => 
      toast({ title: "Sucesso", description: message }),
    // Expose the toasts array for the Toaster component
    toasts: toastStore.toasts,
  };
}

export { useToast, toast };
