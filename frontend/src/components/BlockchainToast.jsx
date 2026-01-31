import React, { useEffect, useState } from 'react';
import { CheckCircle, Shield, AlertCircle, X } from 'lucide-react';
import '../styles/BlockchainToast.css';

/**
 * BlockchainToast Component
 * Displays mock blockchain notifications for demo purposes
 * Clearly labeled as simulated for hackathon demonstration
 */
const BlockchainToast = ({ message, hash, type = 'success', duration = 60000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300);
    };

    useEffect(() => {
        // Entrance animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after specified duration
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]); // handleClose is stable, no need to include

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={24} />;
            case 'info':
                return <Shield size={24} />;
            case 'warning':
                return <AlertCircle size={24} />;
            default:
                return <CheckCircle size={24} />;
        }
    };

    return (
        <div className={`blockchain-toast ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} blockchain-toast-${type}`}>
            <div className="blockchain-toast-content">
                <div className="blockchain-toast-icon">
                    {getIcon()}
                </div>
                <div className="blockchain-toast-body">
                    <div className="blockchain-toast-message">{message}</div>
                    {hash && (
                        <div className="blockchain-toast-hash">
                            <span className="blockchain-toast-hash-label">Mock Hash:</span>
                            <code className="blockchain-toast-hash-value">{hash}</code>
                        </div>
                    )}
                    <div className="blockchain-toast-disclaimer">
                        🔬 <strong>Demo Mode:</strong> Blockchain integration simulated
                    </div>
                </div>
                <button className="blockchain-toast-close" onClick={handleClose} aria-label="Close notification">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

/**
 * BlockchainToastContainer Component
 * Manages multiple toast notifications
 */
export const BlockchainToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="blockchain-toast-container">
            {toasts.map((toast) => (
                <BlockchainToast
                    key={toast.id}
                    message={toast.message}
                    hash={toast.hash}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default BlockchainToast;
