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

            // Lấy system order ID từ localStorage (đã lưu khi tạo PayPal order)
            const systemOrderId = localStorage.getItem('pendingPayPalOrderId');

            if (!systemOrderId) {
                console.warn('No system orderId found in localStorage');
                this.setState({
                    isLoading: false,
                    paymentStatus: 'error'
                });
                toast.error('Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại.');
                setTimeout(() => {
                    this.props.history.push('/checkout');
                }, 3000);
                return;
            }

            this.setState({ orderId: systemOrderId });

            // Capture payment
            // paypalOrderId: PayPal Order ID từ URL (token)
            // systemOrderId: System order ID từ localStorage
            const captureResponse = await capturePayPalOrder(paypalOrderId, parseInt(systemOrderId));

            if (captureResponse && captureResponse.errCode === 0) {
                // Xóa orderId khỏi localStorage
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

