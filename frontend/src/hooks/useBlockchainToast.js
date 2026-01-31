import { useState, useCallback } from 'react';

/**
 * Custom hook for managing blockchain toast notifications
 * Provides methods to show and remove toast notifications
 */
export const useBlockchainToast = () => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, hash = null, type = 'success', duration = 60000) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            hash,
            type,
            duration
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        setTimeout(() => {
            removeToast(id);
        }, duration + 500); // Extra buffer for exit animation

        return id;
    }, [removeToast]);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        clearAllToasts
    };
};

export default useBlockchainToast;
