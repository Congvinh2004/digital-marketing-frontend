import React, { Component } from 'react';
import './PayPalQRCode.scss';

/**
 * Component hiển thị QR Code cho thanh toán PayPal
 */
class PayPalQRCode extends Component {
    render() {
        const { qrCode, approvalUrl, onRedirect, isLoading } = this.props;

        if (!qrCode) {
            return null;
        }

        return (
            <div className="paypal-qr-container">
                <div className="qr-code-wrapper">
                    <h4>Quét QR Code để thanh toán</h4>
                    <div className="qr-code-image">
                        <img src={qrCode} alt="PayPal QR Code" />
                    </div>
                    <p className="qr-instruction">
                        Mở app PayPal trên điện thoại và quét QR code này để thanh toán
                    </p>
                </div>
                
                {approvalUrl && (
                    <div className="paypal-actions">
                        <p className="or-divider">Hoặc</p>
                        <button 
                            className="btn-paypal-redirect"
                            onClick={() => onRedirect && onRedirect(approvalUrl)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Thanh toán trên Web'}
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default PayPalQRCode;

