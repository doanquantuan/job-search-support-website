import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (!toasts || toasts.length === 0) return null;

  const renderIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 text-foreground";
      case "error":
        return "border-destructive/30 bg-destructive/10 dark:bg-destructive/20 text-foreground";
      case "warning":
        return "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 text-foreground";
      case "info":
      default:
        return "border-border bg-card text-foreground";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${getBorderColor(
            toast.type
          )}`}
        >
          {renderIcon(toast.type)}
          <div className="flex-1 min-w-0">
            {toast.title && <h5 className="text-xs font-semibold leading-tight">{toast.title}</h5>}
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
