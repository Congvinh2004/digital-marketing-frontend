import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './NotificationModal.scss';

/**
 * Modal thông báo và xác nhận
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {string} type - Loại modal: 'success', 'confirm', 'error'
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung thông báo
 * @param {function} onConfirm - Callback khi xác nhận
 * @param {function} onCancel - Callback khi hủy
 * @param {function} toggle - Function để đóng modal
 */
class NotificationModal extends Component {
    render() {
        const { 
            isOpen, 
            type = 'success', 
            title, 
            message, 
            onConfirm, 
            onCancel, 
            toggle 
        } = this.props;

        // Xác định icon và màu sắc theo type
        let icon, iconClass, headerClass;
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                iconClass = 'success-icon';
                headerClass = 'modal-header-success';
                break;
            case 'confirm':
                icon = 'fa-exclamation-triangle';
                iconClass = 'warning-icon';
                headerClass = 'modal-header-warning';
                break;
            case 'error':
                icon = 'fa-times-circle';
                iconClass = 'error-icon';
                headerClass = 'modal-header-error';
                break;
            default:
                icon = 'fa-info-circle';
                iconClass = 'info-icon';
                headerClass = 'modal-header-info';
        }

        return (
            <Modal 
                isOpen={isOpen} 
                toggle={toggle}
                className="notification-modal"
                centered
            >
                <ModalHeader 
                    toggle={toggle}
                    className={headerClass}
                >
                    <i className={`fas ${icon} ${iconClass}`}></i>
                    {title || this.getDefaultTitle(type)}
                </ModalHeader>
                <ModalBody>
                    <p className="notification-message">{message}</p>
                </ModalBody>
                <ModalFooter>
                    {type === 'confirm' ? (
                        <>
                            <Button 
                                color="danger" 
                                onClick={onConfirm}
                                className="btn-confirm"
                            >
                                <i className="fas fa-check"></i> Xác nhận
                            </Button>
                            <Button 
                                color="secondary" 
                                onClick={onCancel || toggle}
                                className="btn-cancel"
                            >
                                <i className="fas fa-times"></i> Hủy
                            </Button>
                        </>
                    ) : (
                        <Button 
                            color="primary" 
                            onClick={onConfirm || toggle}
                            className="btn-ok"
                        >
                            <i className="fas fa-check"></i> OK
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        );
    }

    getDefaultTitle = (type) => {
        switch (type) {
            case 'success':
                return 'Thành công';
            case 'confirm':
                return 'Xác nhận';
            case 'error':
                return 'Lỗi';
            default:
                return 'Thông báo';
        }
    }
}

export default NotificationModal;



