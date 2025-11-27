import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import './PaymentCancel.scss';

class PaymentCancel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    componentDidMount() {
        // Lấy token từ URL (nếu có)
        const urlParams = new URLSearchParams(this.props.location.search);
        const token = urlParams.get('token');

        if (token) {
            console.log('Payment cancelled with token:', token);
        }

        // Xóa pending order ID khỏi cả sessionStorage và localStorage nếu có
        const pendingOrderId = sessionStorage.getItem('pendingPayPalOrderId') 
            || localStorage.getItem('pendingPayPalOrderId');
        if (pendingOrderId) {
            sessionStorage.removeItem('pendingPayPalOrderId');
            localStorage.removeItem('pendingPayPalOrderId');
        }

        // Hiển thị thông báo
        toast.warning('Bạn đã hủy thanh toán PayPal. Đơn hàng chưa được thanh toán.');

        // Redirect về checkout sau 3 giây
        setTimeout(() => {
            this.props.history.push('/checkout');
        }, 3000);
    }

    handleBackToCheckout = () => {
        this.props.history.push('/checkout');
    }

    render() {
        return (
            <div className="payment-cancel-container">
                <div className="payment-cancel-content">
                    <div className="cancel-icon">
                        <i className="fas fa-times-circle"></i>
                    </div>
                    <h2>Thanh toán đã bị hủy</h2>
                    <p>Bạn đã hủy quá trình thanh toán PayPal.</p>
                    <p className="info-text">Đơn hàng của bạn vẫn được lưu và bạn có thể thanh toán lại sau.</p>
                    <p className="redirect-message">Đang chuyển hướng về trang thanh toán...</p>
                    <button 
                        className="btn-back-to-checkout"
                        onClick={this.handleBackToCheckout}
                    >
                        Quay lại trang thanh toán
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

export default connect(mapStateToProps)(withRouter(PaymentCancel));

