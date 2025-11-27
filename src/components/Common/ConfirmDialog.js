import React from 'react';
import './ConfirmDialog.scss';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Xác nhận', 
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning' // 'warning', 'danger', 'info'
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="confirm-dialog-overlay" onClick={handleBackdropClick}>
            <div className={`confirm-dialog ${type}`}>
                <div className="confirm-dialog-header">
                    <div className="confirm-dialog-icon">
                        {type === 'danger' && <i className="fas fa-exclamation-triangle"></i>}
                        {type === 'warning' && <i className="fas fa-exclamation-circle"></i>}
                        {type === 'info' && <i className="fas fa-info-circle"></i>}
                    </div>
                    <h3 className="confirm-dialog-title">{title}</h3>
                    <button className="confirm-dialog-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="confirm-dialog-body">
                    <p className="confirm-dialog-message">{message}</p>
                </div>
                <div className="confirm-dialog-footer">
                    <button 
                        className="confirm-dialog-btn confirm-dialog-btn-cancel"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`confirm-dialog-btn confirm-dialog-btn-confirm ${type}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

