import React, { useEffect } from 'react';
import './SuccessNotification.scss';

const SuccessNotification = ({ 
    isOpen, 
    onClose, 
    message = 'Thành công!',
    duration = 2000,
    icon = 'check-circle' // 'check-circle', 'shopping-cart', 'heart', etc.
}) => {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (icon) {
            case 'shopping-cart':
                return 'fas fa-shopping-cart';
            case 'heart':
                return 'fas fa-heart';
            case 'check-circle':
            default:
                return 'fas fa-check-circle';
        }
    };

    return (
        <div className="success-notification-overlay">
            <div className="success-notification">
                <div className="success-notification-icon">
                    <i className={getIcon()}></i>
                </div>
                <div className="success-notification-content">
                    <p className="success-notification-message">{message}</p>
                </div>
                <button className="success-notification-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default SuccessNotification;

