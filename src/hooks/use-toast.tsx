
import * as React from "react";
import { toast as sonnerToast, type Toast } from "sonner";
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

type ToastOptions = ToastProps & {
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

const toast = ({ title, description, action, ...props }: ToastOptions) => {
  return sonnerToast.custom(
    ({ id, dismiss }) => (
      <div className="toast-wrapper">
        {title && <div className="toast-title">{title}</div>}
        {description && <div className="toast-description">{description}</div>}
        {action && <div className="toast-action">{action}</div>}
      </div>
    ),
    {
      duration: 5000,
      ...props,
    }
  );
};

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (message: string) => 
      toast({ title: "Erro", description: message, variant: "destructive" }),
    success: (message: string) => 
      toast({ title: "Sucesso", description: message }),
  };
}

export { useToast, toast };
