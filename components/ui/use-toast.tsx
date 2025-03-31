// This is a simplified version of the toast component.
// In a real application, you would use a library like sonner or react-hot-toast

import { createContext, useContext, useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}

interface ToastContextType {
    toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

    const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-0 right-0 p-4 flex flex-col gap-2 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`p-4 rounded-md shadow-md max-w-md ${toast.variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground'
                                : toast.variant === 'success'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-background border'
                            }`}
                    >
                        {toast.title && <div className="font-semibold">{toast.title}</div>}
                        {toast.description && <div className="text-sm">{toast.description}</div>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const toast = (props: ToastProps) => {
    // This is a shorthand for calling the toast function directly without hooks
    // It's not ideal but works for simple demos
    if (typeof window !== 'undefined') {
        const customEvent = new CustomEvent('toast', { detail: props });
        window.dispatchEvent(customEvent);
    }
    console.log('Toast:', props.title, props.description);
}; 