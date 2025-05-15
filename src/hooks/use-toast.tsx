
import * as React from "react";
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

// Create the toast store manager as a React hook
const useToastStore = () => {
  const [toasts, setToasts] = React.useState<ToastInfo[]>([]);

  const addToast = React.useCallback((toast: ToastInfo) => {
    setToasts((current) => [...current, toast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
};

// Create a singleton context for the toast store
const ToastContext = React.createContext<ReturnType<typeof useToastStore> | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useToastStore();
  
  return (
    <ToastContext.Provider value={store}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const store = React.useContext(ToastContext);
  
  if (!store) {
    console.error("useToast must be used within a ToastProvider");
    
    // Provide a fallback implementation
    return {
      toast: () => -1,
      dismiss: () => {},
      toasts: [],
      error: () => -1,
      success: () => -1,
    };
  }
  
  const toast = React.useCallback(
    ({ title, description, action, ...props }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      store.addToast({
        id,
        title, 
        description, 
        action,
        variant: props.variant,
        className: props.className,
        duration: props.duration,
      });
      
      return id;
    },
    [store]
  );
  
  const dismiss = React.useCallback(
    (id?: string) => {
      if (id) {
        store.removeToast(id);
      }
    },
    [store]
  );

  return {
    toast,
    dismiss,
    toasts: store.toasts,
    error: (message: string) => 
      toast({ title: "Erro", description: message, variant: "destructive" }),
    success: (message: string) => 
      toast({ title: "Sucesso", description: message }),
  };
}

// Export a standalone toast function for convenience
export const toast = (options: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9);
  // This is just a placeholder since we need the context to actually add a toast
  console.log("Toast outside context:", options);
  return id;
};
