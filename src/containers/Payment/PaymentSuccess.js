import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { capturePayPalOrder, getOrderDetail } from '../../services/orderService';
import { clearCart } from '../../services/cartService';
import './PaymentSuccess.scss';

class PaymentSuccess extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            paymentStatus: 'processing', // 'processing', 'success', 'error'
            orderId: null
        };
    }

    componentDidMount() {
        this.handlePaymentSuccess();
    }

    // Xử lý khi thanh toán thành công
    onPaymentSuccess = (captureResponse) => {
        // Xóa orderId khỏi cả sessionStorage và localStorage
        sessionStorage.removeItem('pendingPayPalOrderId');
        localStorage.removeItem('pendingPayPalOrderId');

        // Xóa giỏ hàng
        clearCart();
        window.dispatchEvent(new Event('cartUpdated'));

        // Dispatch event để refresh sản phẩm (backend đã tự động cập nhật quantity và sold_quantity)
        window.dispatchEvent(new Event('productsUpdated'));

        this.setState({
            isLoading: false,
            paymentStatus: 'success'
        });

        toast.success('Thanh toán PayPal thành công! Đơn hàng của bạn đã được xác nhận.');

        // Redirect về trang chủ sau 3 giây
        setTimeout(() => {
            this.props.history.push('/home');
        }, 3000);
    }

    // Xử lý khi quay lại từ PayPal
    handlePaymentSuccess = async () => {
        try {
            // Lấy token (PayPal Order ID) và PayerID từ URL
            const urlParams = new URLSearchParams(this.props.location.search);
            const paypalOrderId = urlParams.get('token'); // PayPal Order ID từ URL
            const payerId = urlParams.get('PayerID');

            if (!paypalOrderId || !payerId) {
                this.setState({
                    isLoading: false,
                    paymentStatus: 'error'
                });
                toast.error('Thiếu thông tin thanh toán. Vui lòng thử lại.');
                setTimeout(() => {
                    this.props.history.push('/checkout');
                }, 3000);
                return;
            }

            // Lấy system order ID từ sessionStorage (ưu tiên) hoặc localStorage (fallback)
            // sessionStorage: Giữ khi tab còn mở (ít bị mất hơn)
            // localStorage: Giữ khi đóng trình duyệt (backup)
            let systemOrderId = sessionStorage.getItem('pendingPayPalOrderId') 
                || localStorage.getItem('pendingPayPalOrderId');

            // Fallback: Nếu không tìm thấy trong storage, thử tìm order dựa trên PayPal Order ID
            // Backend có thể tự tìm order dựa trên PayPal Order ID
            if (!systemOrderId) {
                console.warn('No system orderId found in localStorage, attempting to capture with PayPal Order ID only');
                
                // Thử capture payment với orderId = null, để backend tự tìm order
                // Hoặc có thể thử với orderId = 0 để backend biết cần tìm order
                try {
                    // Thử capture với orderId = null (nếu backend hỗ trợ)
                    // Nếu không, sẽ throw error và xử lý ở catch block
                    const captureResponse = await capturePayPalOrder(paypalOrderId, null);
                    
                    if (captureResponse && captureResponse.errCode === 0) {
                        // Thành công, backend đã tự tìm được order
                        this.onPaymentSuccess(captureResponse);
                        return;
                    } else {
                        throw new Error(captureResponse?.errMessage || 'Failed to capture payment');
                    }
                } catch (fallbackError) {
                    console.error('Fallback capture failed:', fallbackError);
                    // Nếu fallback thất bại, báo lỗi
                    this.setState({
                        isLoading: false,
                        paymentStatus: 'error'
                    });
                    toast.error('Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.');
                    setTimeout(() => {
                        this.props.history.push('/checkout');
                    }, 3000);
                    return;
                }
            }

            this.setState({ orderId: systemOrderId });

            // Capture payment
            // paypalOrderId: PayPal Order ID từ URL (token)
            // systemOrderId: System order ID từ localStorage
            const captureResponse = await capturePayPalOrder(paypalOrderId, parseInt(systemOrderId));

            if (captureResponse && captureResponse.errCode === 0) {
                this.onPaymentSuccess(captureResponse);
            } else {
                throw new Error(captureResponse?.errMessage || 'Failed to capture payment');
            }
        } catch (error) {
            console.error('Error processing PayPal payment:', error);
            this.setState({
                isLoading: false,
                paymentStatus: 'error'
            });

            const errorMessage = error.response?.data?.errMessage || error.message || 'Có lỗi xảy ra khi xử lý thanh toán.';
            toast.error(errorMessage);

            // Redirect về checkout sau 3 giây
            setTimeout(() => {
                this.props.history.push('/checkout');
            }, 3000);
        }
    }

    render() {
        const { isLoading, paymentStatus } = this.state;

        return (
            <div className="payment-success-container">
                <div className="payment-success-content">
                    {isLoading ? (
                        <>
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                            </div>
                            <h2>Đang xử lý thanh toán...</h2>
                            <p>Vui lòng đợi trong giây lát</p>
                        </>
                    ) : paymentStatus === 'success' ? (
                        <>
                            <div className="success-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h2>Thanh toán thành công!</h2>
                            <p>Đơn hàng của bạn đã được xác nhận.</p>
                            <p className="redirect-message">Đang chuyển hướng về trang chủ...</p>
                        </>
                    ) : (
                        <>
                            <div className="error-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <h2>Thanh toán thất bại</h2>
                            <p>Đã xảy ra lỗi khi xử lý thanh toán.</p>
                            <p className="redirect-message">Đang chuyển hướng về trang thanh toán...</p>
                        </>
                    )}
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

export default connect(mapStateToProps)(withRouter(PaymentSuccess));

