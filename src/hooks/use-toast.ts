
import { useState, useCallback, useEffect } from "react";

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export type ToastActionElement = React.ReactElement<{
  altText: string;
  onClick: () => void;
}>;

const TOAST_LIMIT = 5;
export const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = Toast & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  open: boolean;
  cancel: () => void;
  dismiss: () => void;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const memoryState: State = { toasts: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        };
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      };
    }
    case "REMOVE_TOAST": {
      const { toastId } = action;

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }

      return {
        ...state,
        toasts: [],
      };
    }
  }
}

const listeners: Array<(state: State) => void> = [];

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ title, description, variant, duration = 5000 }: ToastProps) {
  const id = genId();

  const dismiss = () => {
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id));
      toastTimeouts.delete(id);
    }

    dispatch({ type: "DISMISS_TOAST", toastId: id });

    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, TOAST_REMOVE_DELAY);
  };

  const cancel = () => {
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id));
      toastTimeouts.delete(id);
    }
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      title,
      description,
      variant,
      duration,
      open: true,
      cancel,
      dismiss,
    },
  });

  if (duration) {
    toastTimeouts.set(
      id,
      setTimeout(() => {
        dismiss();
      }, duration)
    );
  }

  return id;
}

export function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { toast };
