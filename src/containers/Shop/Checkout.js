import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import './Checkout.scss'
import Header from '../../components/Product/Header';
import PayPalQRCode from '../../components/Payment/PayPalQRCode';
import { getCart, getCartTotal, clearCart } from '../../services/cartService';
import NotificationModal from '../../components/Common/NotificationModal';
import { 
    createOrder, 
    updateOrderPayment,
    createPayPalOrder,
    capturePayPalOrder,
    getOrderDetail
} from '../../services/orderService';
import { createShippingAddress } from '../../services/addressService';
import { formatDualCurrency, vndToUsd } from '../../utils/currencyHelper';
import Cash from '../../imgs/icons/cash.png'
import ApplePay from '../../imgs/icons/applepay.png'
import payPal from '../../imgs/icons/payment-3.png'
import Footer from '../../components/Product/Footer';

class Checkout extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoginVisible: false,
            isCouponVisible: false,
            selectedPaymentMethod: 'cash', // 'cash', 'applepay', 'paypal'
            cartItems: [],
            cartTotal: 0,
            shipping: 0, // Đã bỏ phí ship
            vat: 0,
            billingInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                province: '',
                district: '',
                ward: '',
                notes: ''
            },
            isLoading: false,
            // PayPal state
            paypalOrderId: null, // ID đơn hàng trong hệ thống
            paypalOrderIdPayPal: null, // PayPal order ID (từ PayPal)
            paypalApprovalUrl: null,
            paypalQRCode: null,
            paypalOrderCreated: false,
            paymentPollingInterval: null,
            // Notification modal state
            notificationModal: {
                isOpen: false,
                type: 'success',
                title: '',
                message: '',
                onConfirm: null
            }
        }
    }

    componentDidMount() {
        // Đợi một chút để Redux persist có thời gian rehydrate state
        setTimeout(() => {
            // Kiểm tra đăng nhập - kiểm tra cả Redux state và localStorage
            this.checkAuthAndLoadData();
            
            // Kiểm tra nếu user quay lại từ PayPal
            this.checkPayPalPaymentStatus();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        // Nếu Redux state thay đổi (ví dụ sau khi đăng nhập), kiểm tra lại
        if (prevProps.isLoggedIn !== this.props.isLoggedIn || 
            prevProps.userInfo !== this.props.userInfo) {
            console.log('User state changed in Checkout, rechecking auth...');
            // Đợi một chút để đảm bảo localStorage đã được cập nhật
            setTimeout(() => {
                this.checkAuthAndLoadData();
            }, 200);
        }
    }

    checkAuthAndLoadData = () => {
        // Kiểm tra localStorage trước (nhanh hơn)
        let isLoggedInLocal = false;
        let userInfoLocal = null;

        try {
            const userInfoStr = localStorage.getItem('userInfo');
            const accessToken = localStorage.getItem('accessToken');
            if (userInfoStr && accessToken) {
                userInfoLocal = JSON.parse(userInfoStr);
                isLoggedInLocal = true;
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }

        // Kiểm tra Redux state (có thể chưa ready)
        const isLoggedInRedux = this.props.isLoggedIn && this.props.userInfo;
        
        // Ưu tiên localStorage vì nó luôn có sẵn, Redux có thể chưa rehydrate
        const isAuthenticated = isLoggedInLocal || isLoggedInRedux;
        const userInfo = userInfoLocal || this.props.userInfo;

        if (!isAuthenticated || !userInfo) {
            // Chỉ redirect nếu chắc chắn chưa đăng nhập (sau khi đã check cả localStorage)
            toast.warning('Vui lòng đăng nhập để thanh toán');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: '/checkout' }
                });
            }
            return;
        }

        // Load giỏ hàng và thông tin user
        this.loadCartData();
        this.loadUserInfo(userInfo);
    }

    loadCartData = () => {
        const cartItems = getCart();
        const cartTotal = getCartTotal();
        
        if (cartItems.length === 0) {
            toast.warning('Giỏ hàng đang trống');
            if (this.props.history) {
                this.props.history.push('/cart');
            }
            return;
        }

        this.setState({
            cartItems,
            cartTotal
        });
    }

    loadUserInfo = (userInfo = null) => {
        // Sử dụng userInfo từ param hoặc từ props
        const user = userInfo || this.props.userInfo;
        
        if (user) {
            const fullName = user.full_name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            this.setState({
                billingInfo: {
                    ...this.state.billingInfo,
                    firstName,
                    lastName,
                    email: user.email || '',
                    phone: user.phone || ''
                }
            });
        }
    }
    toggleLoginVisibility = () => {
        this.setState({
            isLoginVisible: !this.state.isLoginVisible
        })
    }
    toggleCouponVisibility = () => {
        this.setState({
            isCouponVisible: !this.state.isCouponVisible
        })
    }
    handleWayBackHome = () => {
        if (this.props.history) {

            this.props.history.push(`/home`)
        }
    }
    handleRedirectToProductPage = () => {
        if (this.props.history) {

            this.props.history.push(`/product`)
        }
    }

    handleRedirectToCart = () => {
        if (this.props.history) {
            this.props.history.push(`/cart`)
        }
    }

    handlePaymentMethodChange = (method) => {
        // Chỉ thay đổi payment method, không tự động tạo order
        this.setState({ 
            selectedPaymentMethod: method,
            paypalOrderId: null,
            paypalApprovalUrl: null,
            paypalQRCode: null,
            paypalOrderCreated: false
        });
    }

    // Khởi tạo thanh toán PayPal
    initiatePayPalPayment = async () => {
        // Kiểm tra đăng nhập
        const userInfo = this.props.userInfo || this.getUserInfoFromLocalStorage();
        if (!userInfo) {
            toast.warning('Vui lòng đăng nhập để thanh toán');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: '/checkout' }
                });
            }
            return;
        }

        // Kiểm tra accessToken - thử lại sau 100ms nếu không có (có thể đang được lưu)
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken || accessToken.trim() === '') {
            // Đợi một chút để token có thể được lưu (nếu vừa đăng nhập)
            await new Promise(resolve => setTimeout(resolve, 100));
            accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken || accessToken.trim() === '') {
                console.error('No valid accessToken found in initiatePayPalPayment after retry');
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                if (this.props.history) {
                    this.props.history.push({
                        pathname: '/login',
                        state: { from: '/checkout' }
                    });
                }
                return;
            }
        }
        
        // Debug log
        console.log('AccessToken found in initiatePayPalPayment:', accessToken.substring(0, 20) + '...');

        // Validate billing info
        const { billingInfo } = this.state;
        if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || 
            !billingInfo.phone || !billingInfo.province || !billingInfo.district || 
            !billingInfo.ward || !billingInfo.address) {
            toast.warning('Vui lòng điền đầy đủ thông tin thanh toán trước khi chọn PayPal');
            return;
        }

        try {
            this.setState({ isLoading: true });

            // Bước 1: Tạo shipping address trước
            const addressData = {
                full_name: `${billingInfo.firstName} ${billingInfo.lastName}`.trim(),
                phone: billingInfo.phone,
                province: billingInfo.province,
                district: billingInfo.district,
                ward: billingInfo.ward,
                detail: billingInfo.address,
                is_default: true
            };

            let shippingAddressId = null;
            try {
                const addressResponse = await createShippingAddress(addressData);
                
                if (addressResponse && addressResponse.data && addressResponse.data.id) {
                    shippingAddressId = addressResponse.data.id;
                } else {
                    throw new Error('Address created but no ID returned');
                }
            } catch (addressError) {
                console.error('Error creating shipping address:', addressError);
                const errorMessage = addressError.response?.data?.errMessage || addressError.message || 'Không thể tạo địa chỉ giao hàng';
                toast.error(errorMessage);
                this.setState({ isLoading: false });
                return;
            }

            // Bước 2: Tạo đơn hàng trong hệ thống
            // 1. Tính tổng tiền VND từ items (không bao gồm shipping và VAT)
            const totalVND = this.state.cartItems.reduce((sum, item) => {
                const itemPrice = item.price || 0;
                const itemQuantity = item.quantity || 0;
                return sum + (itemPrice * itemQuantity);
            }, 0);
            
            // 2. Quy đổi sang USD (tỷ giá 1 USD = 25,000 VND)
            const totalUSD = vndToUsd(totalVND);
            
            const orderData = {
                items: this.state.cartItems.map(item => ({
                    product_id: item.id || item.productID,
                    quantity: item.quantity
                    // Không gửi price vì backend tự tính
                })),
                shipping_address_id: shippingAddressId,
                // Gửi total_amount_usd (USD) - backend sẽ dùng để tạo PayPal order
                total_amount_usd: parseFloat(totalUSD.toFixed(2)),
                currency: 'USD'
            };

            // Debug log để kiểm tra giá trị gửi lên
            console.log('Order data being sent:', {
                ...orderData,
                total_amount_usd: orderData.total_amount_usd,
                total_amount_vnd_calculated: totalVND,
                exchange_rate: '1 USD = 25,000 VND'
            });

            const orderResponse = await createOrder(orderData);
            
            // Debug log
            console.log('Order response:', orderResponse);
            
            // Xử lý response format khác nhau
            let orderDataResponse = null;
            if (orderResponse && orderResponse.data) {
                orderDataResponse = orderResponse.data;
            } else if (orderResponse && orderResponse.id) {
                orderDataResponse = orderResponse;
            }
            
            if (!orderDataResponse || !orderDataResponse.id) {
                console.error('Invalid order response:', orderResponse);
                throw new Error('Failed to create order: Invalid response format');
            }

            const systemOrderId = orderDataResponse.id;

            // Bước 3: Tạo PayPal order và lấy approval URL + QR code
            // Backend sẽ tự động dùng total_amount_usd đã lưu trong order để tạo PayPal order
            const paypalResponse = await createPayPalOrder(systemOrderId);
            
            // Kiểm tra lỗi từ PayPal API
            if (paypalResponse && paypalResponse.errCode !== 0) {
                const errorMsg = paypalResponse.errMessage || 'Lỗi khi tạo PayPal order';
                console.error('PayPal API error:', paypalResponse);
                
                // Kiểm tra nếu là lỗi authentication
                if (errorMsg.includes('invalid_client') || errorMsg.includes('Client Authentication failed')) {
                    toast.error('Lỗi cấu hình PayPal: Client ID hoặc Secret không đúng. Vui lòng liên hệ quản trị viên.');
                } else {
                    toast.error(`Lỗi PayPal: ${errorMsg}`);
                }
                
                this.setState({ isLoading: false });
                return;
            }
            
            if (paypalResponse && paypalResponse.data) {
                this.setState({
                    paypalOrderId: systemOrderId,
                    paypalOrderIdPayPal: paypalResponse.data.orderId, // PayPal order ID
                    paypalApprovalUrl: paypalResponse.data.approvalUrl,
                    paypalQRCode: paypalResponse.data.qrCode,
                    paypalOrderCreated: true,
                    isLoading: false
                });
                
                // Lưu order ID vào localStorage để dùng khi redirect về
                localStorage.setItem('pendingPayPalOrderId', systemOrderId);
                
                toast.success('Đã tạo đơn hàng PayPal. Vui lòng quét QR code hoặc click để thanh toán.');
                
                // Bắt đầu polling để kiểm tra trạng thái thanh toán (nếu dùng QR code)
                this.startPaymentPolling();
            } else {
                throw new Error('Failed to create PayPal order: Invalid response format');
            }
        } catch (error) {
            console.error('Error initiating PayPal payment:', error);
            
            // Xử lý lỗi chi tiết hơn
            let errorMessage = 'Có lỗi xảy ra khi khởi tạo thanh toán PayPal. Vui lòng thử lại.';
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.errMessage) {
                    errorMessage = errorData.errMessage;
                    
                    // Kiểm tra lỗi PayPal authentication
                    if (errorMessage.includes('invalid_client') || errorMessage.includes('Client Authentication failed')) {
                        errorMessage = 'Lỗi cấu hình PayPal: Client ID hoặc Secret không đúng. Vui lòng liên hệ quản trị viên.';
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            this.setState({ isLoading: false });
        }
    }

    // Xử lý khi user click "Thanh toán trên Web" - mở tab mới
    handlePayPalRedirect = (approvalUrl) => {
        if (approvalUrl) {
            // Mở PayPal trong tab mới
            const paypalWindow = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
            
            // Kiểm tra nếu popup bị chặn
            if (!paypalWindow || paypalWindow.closed || typeof paypalWindow.closed === 'undefined') {
                toast.warning('Popup bị chặn. Vui lòng cho phép popup và thử lại, hoặc click vào link để mở trong tab mới.');
                // Fallback: vẫn có thể redirect trong tab hiện tại
                if (window.confirm('Popup bị chặn. Bạn có muốn chuyển đến PayPal trong tab này không?')) {
                    window.location.href = approvalUrl;
                }
                return;
            }
            
            // Bắt đầu polling để kiểm tra payment status khi tab mới đóng hoặc payment hoàn thành
            this.startPaymentPolling();
            
            // Kiểm tra xem tab có bị đóng không (mỗi 1 giây)
            const checkClosed = setInterval(() => {
                if (paypalWindow.closed) {
                    clearInterval(checkClosed);
                    // Tab đã đóng, kiểm tra payment status
                    this.checkPaymentStatusAfterRedirect();
                }
            }, 1000);
            
            // Cleanup sau 5 phút
            setTimeout(() => {
                clearInterval(checkClosed);
            }, 300000); // 5 phút
        }
    }

    // Kiểm tra payment status sau khi tab PayPal đóng
    checkPaymentStatusAfterRedirect = async () => {
        try {
            const orderId = localStorage.getItem('pendingPayPalOrderId');
            if (!orderId) {
                return;
            }

            const orderDetail = await getOrderDetail(parseInt(orderId));
            
            if (orderDetail && orderDetail.data && 
                (orderDetail.data.payment_status === 'paid' || orderDetail.data.status === 'paid')) {
                // Payment đã thành công
                this.stopPaymentPolling();
                
                // Xóa giỏ hàng
                sessionStorage.removeItem('shopping_cart');
                window.dispatchEvent(new Event('cartUpdated'));
                
                // Xóa pending order ID
                localStorage.removeItem('pendingPayPalOrderId');
                
                toast.success('Thanh toán PayPal thành công!');
                
                // Redirect về trang chủ
                setTimeout(() => {
                    if (this.props.history) {
                        this.props.history.push('/home');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }

    // Kiểm tra payment status sau khi user quay lại từ PayPal
    checkPayPalPaymentStatus = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const payerId = urlParams.get('PayerID');

        if (token && payerId && this.state.paypalOrderId) {
            try {
                this.setState({ isLoading: true });

                // Lấy PayPal order ID từ URL hoặc state
                // Giả sử backend trả về paypal_order_id trong response createPayPalOrder
                // Nếu không, cần lưu vào state khi tạo order

                // Capture payment
                const captureResponse = await capturePayPalOrder(token, this.state.paypalOrderId);
                
                if (captureResponse && captureResponse.data) {
                    toast.success('Thanh toán PayPal thành công!');
                    
                    // Xóa giỏ hàng
                    sessionStorage.removeItem('shopping_cart');
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Redirect đến trang thành công
                    setTimeout(() => {
                        if (this.props.history) {
                            this.props.history.push('/home');
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Error capturing PayPal payment:', error);
                toast.error('Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.');
            } finally {
                this.setState({ isLoading: false });
            }
        }
    }

    handleBillingInfoChange = (field, value) => {
        this.setState({
            billingInfo: {
                ...this.state.billingInfo,
                [field]: value
            }
        });
    }

    getOrderTotal = () => {
        const { cartTotal, shipping, vat } = this.state;
        return cartTotal + shipping + vat;
    }

    // Helper: Lấy user info từ localStorage
    getUserInfoFromLocalStorage = () => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                return JSON.parse(userInfoStr);
            }
        } catch (error) {
            console.error('Error reading userInfo from localStorage:', error);
        }
        return null;
    }

    // Xử lý khi user quét QR code và thanh toán thành công (polling hoặc webhook)
    // Có thể dùng polling để kiểm tra trạng thái thanh toán
    startPaymentPolling = () => {
        if (!this.state.paypalOrderId) return;

        // Clear interval cũ nếu có
        if (this.state.paymentPollingInterval) {
            clearInterval(this.state.paymentPollingInterval);
        }

        const pollInterval = setInterval(async () => {
            try {
                // Gọi API để kiểm tra trạng thái đơn hàng
                const orderDetail = await getOrderDetail(this.state.paypalOrderId);
                
                if (orderDetail && orderDetail.data && 
                    (orderDetail.data.payment_status === 'paid' || orderDetail.data.status === 'paid')) {
                    clearInterval(pollInterval);
                    this.setState({ paymentPollingInterval: null });
                    
                    // Xóa pending order ID
                    localStorage.removeItem('pendingPayPalOrderId');
                    
                    toast.success('Thanh toán PayPal thành công!');
                    
                    // Xóa giỏ hàng
                    sessionStorage.removeItem('shopping_cart');
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Redirect
                    setTimeout(() => {
                        if (this.props.history) {
                            this.props.history.push('/home');
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 3000); // Poll mỗi 3 giây

        this.setState({ paymentPollingInterval: pollInterval });

        // Dừng polling sau 5 phút
        setTimeout(() => {
            clearInterval(pollInterval);
            this.setState({ paymentPollingInterval: null });
        }, 300000);
    }

    componentWillUnmount() {
        // Clear polling interval khi component unmount
        if (this.state.paymentPollingInterval) {
            clearInterval(this.state.paymentPollingInterval);
        }
    }

    showSuccessNotification = (onConfirm) => {
        this.setState({
            notificationModal: {
                isOpen: true,
                type: 'success',
                title: 'Đặt hàng thành công!',
                message: 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và sẽ được giao trong thời gian sớm nhất.',
                onConfirm: onConfirm || (() => this.closeNotificationModal())
            }
        });
    }

    closeNotificationModal = () => {
        this.setState({
            notificationModal: {
                isOpen: false,
                type: 'success',
                title: '',
                message: '',
                onConfirm: null
            }
        });
    }

    handlePlaceOrder = async () => {
        // Kiểm tra đăng nhập lại trước khi đặt hàng
        const userInfo = this.props.userInfo || this.getUserInfoFromLocalStorage();
        if (!userInfo) {
            toast.warning('Vui lòng đăng nhập để thanh toán');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: '/checkout' }
                });
            }
            return;
        }

        // Kiểm tra accessToken - thử lại sau 100ms nếu không có (có thể đang được lưu)
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken || accessToken.trim() === '') {
            // Đợi một chút để token có thể được lưu (nếu vừa đăng nhập)
            await new Promise(resolve => setTimeout(resolve, 100));
            accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken || accessToken.trim() === '') {
                console.error('No valid accessToken found in handlePlaceOrder after retry');
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                if (this.props.history) {
                    this.props.history.push({
                        pathname: '/login',
                        state: { from: '/checkout' }
                    });
                }
                return;
            }
        }
        
        // Debug log
        console.log('AccessToken found in handlePlaceOrder:', accessToken.substring(0, 20) + '...');

        const { billingInfo, selectedPaymentMethod } = this.state;

        // Validate form
        if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || !billingInfo.phone || 
            !billingInfo.province || !billingInfo.district || !billingInfo.ward || !billingInfo.address) {
            toast.warning('Vui lòng điền đầy đủ thông tin thanh toán');
            return;
        }

        // Nếu chọn PayPal, khởi tạo PayPal payment
        if (selectedPaymentMethod === 'paypal') {
            // Nếu chưa tạo PayPal order, tạo mới
            if (!this.state.paypalOrderCreated) {
                await this.initiatePayPalPayment();
            } else {
                // Nếu đã có PayPal order, hiện thông báo
                toast.info('Vui lòng hoàn tất thanh toán PayPal bằng cách quét QR code hoặc click "Thanh toán trên Web" ở trên');
            }
            return;
        }

        // Xử lý thanh toán COD hoặc ApplePay
        try {
            this.setState({ isLoading: true });

            // Tạo shipping address trước
            const addressData = {
                full_name: `${billingInfo.firstName} ${billingInfo.lastName}`.trim(),
                phone: billingInfo.phone,
                province: billingInfo.province || 'Hồ Chí Minh', // Tạm thời dùng giá trị mặc định, có thể thêm vào form sau
                district: billingInfo.district || 'Quận 1',
                ward: billingInfo.ward || 'Phường Bến Nghé',
                detail: billingInfo.address,
                is_default: true
            };

            let shippingAddressId = null;
            try {
                const addressResponse = await createShippingAddress(addressData);
                
                if (addressResponse && addressResponse.data && addressResponse.data.id) {
                    shippingAddressId = addressResponse.data.id;
                } else {
                    throw new Error('Address created but no ID returned');
                }
            } catch (addressError) {
                console.error('Error creating shipping address:', addressError);
                const errorMessage = addressError.response?.data?.errMessage || addressError.message || 'Không thể tạo địa chỉ giao hàng';
                toast.error(errorMessage);
                this.setState({ isLoading: false });
                return;
            }

            const orderData = {
                items: this.state.cartItems.map(item => ({
                    product_id: item.id || item.productID,
                    quantity: item.quantity
                    // Không gửi price vì backend tự tính
                })),
                shipping_address_id: shippingAddressId
                // Chỉ gửi items và shipping_address_id theo đúng format backend yêu cầu
            };

            const response = await createOrder(orderData);
            
            if (response && response.data) {
                // Xóa giỏ hàng (sử dụng clearCart để xóa đúng user-specific cart)
                clearCart();
                window.dispatchEvent(new Event('cartUpdated'));

                // Dispatch event để refresh sản phẩm (backend đã tự động cập nhật quantity và sold_quantity)
                window.dispatchEvent(new Event('productsUpdated'));

                // Hiển thị modal thông báo thành công
                this.showSuccessNotification(() => {
                    this.closeNotificationModal();
                    // Redirect về trang chủ sau khi đóng modal
                    if (this.props.history) {
                        this.props.history.push('/home');
                    }
                });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    render() {
        let { isLoginVisible, isCouponVisible, notificationModal } = this.state
        return (
            <>
                <NotificationModal
                    isOpen={notificationModal.isOpen}
                    type={notificationModal.type}
                    title={notificationModal.title}
                    message={notificationModal.message}
                    onConfirm={notificationModal.onConfirm}
                    toggle={this.closeNotificationModal}
                />
                <Header />

                <div className='home-checkout-container'>
                    <div className='home-checkout-content'>
                        <div className='login-container'>
                            <div className='not-login'>
                                <span className='not-login-title'>You are not logged in?</span>
                                <span className='returning-login-title' onClick={() => this.toggleLoginVisibility()}>Click here to login</span>
                            </div>
                            {isLoginVisible === true &&

                                <div className='login'>
                                    <div className='login-title'>
                                        <span className='title-text'>Please login your accont.</span>
                                    </div>
                                    <div className='input-login'>
                                        <input type='text' placeholder='Enter your name' className='input-username' />
                                        <input type='password' placeholder='Enter your password' className='input-password' />

                                    </div>
                                    <div className='btn-login'>
                                        <button>Sign in</button>
                                    </div>
                                    <div className='forget-register'>
                                        <span className='child-content'>
                                            Sign up
                                        </span>
                                        <span className='child-content'>

                                            Forget to password?
                                        </span>

                                    </div>
                                </div>
                            }



                        </div>


                        <div className='apply-coupon-container'>
                            <div className='have-coupon'>
                                <span className='have-coupon-title'>Have a coupon?</span>
                                <span className='returning-login-title' onClick={() => this.toggleCouponVisibility()}>Click here to enter your code</span>
                            </div>
                            {isCouponVisible === true &&

                                <div className='enter-coupon'>
                                    <div className='enter-coupon-title'>
                                        <span className='title-text'>If you have a coupon code, please apply it below.</span>
                                    </div>
                                    <div className='input-coupon'>
                                        <input type='text' placeholder='Couppon code' className='input-couppon-code' />

                                    </div>
                                    <div className='btn-apply-coupon'>
                                        <button>Apply coupon</button>
                                    </div>

                                </div>
                            }



                        </div>

                        <div className='detail-payment-container'>
                            <div className='detail-payment-content'>
                                <h2 className='personal-information-title'>Billing Details</h2>
                                <div className='personal-information-body'>
                                    <div className='container'>
                                        <div className='row'>
                                            <div className="form-group col-md-6">
                                                <label>First name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="First name"
                                                    value={this.state.billingInfo.firstName}
                                                    onChange={(e) => this.handleBillingInfoChange('firstName', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Last name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Last name"
                                                    value={this.state.billingInfo.lastName}
                                                    onChange={(e) => this.handleBillingInfoChange('lastName', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group col-md-6">
                                                <label htmlFor="inputEmail4">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="inputEmail4"
                                                    placeholder="Email"
                                                    value={this.state.billingInfo.email}
                                                    onChange={(e) => this.handleBillingInfoChange('email', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="inputPassword4">Phone number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Phone number"
                                                    value={this.state.billingInfo.phone}
                                                    onChange={(e) => this.handleBillingInfoChange('phone', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="inputProvince">Tỉnh/Thành phố</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputProvince"
                                                    placeholder="Nhập Tỉnh/Thành phố"
                                                    value={this.state.billingInfo.province}
                                                    onChange={(e) => this.handleBillingInfoChange('province', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="inputDistrict">Quận/Huyện</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputDistrict"
                                                    placeholder="Nhập Quận/Huyện"
                                                    value={this.state.billingInfo.district}
                                                    onChange={(e) => this.handleBillingInfoChange('district', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="inputWard">Phường/Xã</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputWard"
                                                    placeholder="Nhập Phường/Xã"
                                                    value={this.state.billingInfo.ward}
                                                    onChange={(e) => this.handleBillingInfoChange('ward', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="inputAddress">Địa chỉ chi tiết</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputAddress"
                                                    placeholder="Nhập Địa chỉ chi tiết"
                                                    value={this.state.billingInfo.address}
                                                    onChange={(e) => this.handleBillingInfoChange('address', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="inputNotes">Ghi chú (tùy chọn)</label>
                                                <input
                                                    type="text"
                                                    className="form-control input-order"
                                                    id="inputNotes"
                                                    value={this.state.billingInfo.notes}
                                                    onChange={(e) => this.handleBillingInfoChange('notes', e.target.value)}
                                                />
                                            </div>



                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className='checkout-payment-method-container'>

                            <div className="checkout-payment-method-content">
                                <h3 className="payment-method-title">Payment Method</h3>
                                <div className="payment-method-title-body">
                                    <div className="payment-method">
                                        <div 
                                            className={`payment-method-item cash ${this.state.selectedPaymentMethod === 'cash' ? 'active' : ''}`}
                                            onClick={() => this.handlePaymentMethodChange('cash')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className='selection-type-payment'>
                                                <div className='check-box'>
                                                    {this.state.selectedPaymentMethod === 'cash' && <div className='check-box-child'></div>}
                                                </div>
                                                <span className='payment-method-type'>
                                                    Cash on delivery
                                                </span>
                                            </div>
                                            <img className='payment-method-img' src={Cash} alt="#" />
                                        </div>
                                    </div>
                                    <div className="payment-method">
                                        <div 
                                            className={`payment-method-item apple-pay ${this.state.selectedPaymentMethod === 'applepay' ? 'active' : ''}`}
                                            onClick={() => this.handlePaymentMethodChange('applepay')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className='selection-type-payment'>
                                                <div className='check-box'>
                                                    {this.state.selectedPaymentMethod === 'applepay' && <div className='check-box-child'></div>}
                                                </div>
                                                <span className='payment-method-type'>
                                                    ApplePay
                                                </span>
                                            </div>
                                            <img className='payment-method-img' src={ApplePay} alt="#" />
                                        </div>
                                        <div className="payment-method-detail">
                                            <p>Apple Pay is the modern way to pay.</p>
                                        </div>
                                    </div>
                                    <div className="payment-method">
                                        <div 
                                            className={`payment-method-item paypal ${this.state.selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                                            onClick={() => this.handlePaymentMethodChange('paypal')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className='selection-type-payment'>
                                                <div className='check-box'>
                                                    {this.state.selectedPaymentMethod === 'paypal' && <div className='check-box-child'></div>}
                                                </div>
                                                <span className='payment-method-type'>
                                                    PayPal
                                                </span>
                                            </div>
                                            <img className='payment-method-img' src={payPal} alt="#" />
                                        </div>
                                        <div className="payment-method-detail">
                                            <p>Pay via PayPal; you can pay with your credit card if you don't have a PayPal account.</p>
                                        </div>
                                        {this.state.selectedPaymentMethod === 'paypal' && (
                                            <div className="paypal-payment-wrapper">
                                                {this.state.isLoading && !this.state.paypalOrderCreated ? (
                                                    <div className="paypal-loading">
                                                        <p>Đang tạo đơn hàng PayPal...</p>
                                                    </div>
                                                ) : this.state.paypalQRCode ? (
                                                    <>
                                                        <PayPalQRCode
                                                            qrCode={this.state.paypalQRCode}
                                                            approvalUrl={this.state.paypalApprovalUrl}
                                                            onRedirect={this.handlePayPalRedirect}
                                                            isLoading={this.state.isLoading}
                                                        />
                                                        <div className="paypal-info-box">
                                                            <p className="info-text">
                                                                <i className="fas fa-info-circle"></i>
                                                                Đơn hàng PayPal đã được tạo. Vui lòng hoàn tất thanh toán bằng cách quét QR code hoặc click "Thanh toán trên Web" ở trên.
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="paypal-init-info">
                                                        <div className="info-box">
                                                            <i className="fas fa-info-circle"></i>
                                                            <p>Vui lòng điền đầy đủ thông tin thanh toán và click nút <strong>"Place order"</strong> ở dưới để khởi tạo thanh toán PayPal.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className="shoping-cart-total-content">
                                <h3 className="cart-total-title">Cart Totals</h3>
                                <div className="cart-total-body">
                                    <table className="table list-prict-product">
                                        <tbody>
                                            {this.state.cartItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {item.name || 'Sản phẩm'} <strong>× {item.quantity}</strong>
                                                    </td>
                                                    <td>
                                                        {formatDualCurrency(item.price * item.quantity).vnd}
                                                        {this.state.selectedPaymentMethod === 'paypal' && (
                                                            <span className="price-usd-inline"> ({formatDualCurrency(item.price * item.quantity).usd})</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td>Shipping and Handing</td>
                                                <td>
                                                    {formatDualCurrency(this.state.shipping).vnd}
                                                    {this.state.selectedPaymentMethod === 'paypal' && (
                                                        <span className="price-usd-inline"> ({formatDualCurrency(this.state.shipping).usd})</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Vat</td>
                                                <td>
                                                    {formatDualCurrency(this.state.vat).vnd}
                                                    {this.state.selectedPaymentMethod === 'paypal' && (
                                                        <span className="price-usd-inline"> ({formatDualCurrency(this.state.vat).usd})</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Order Total</strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {formatDualCurrency(this.getOrderTotal()).vnd}
                                                        {this.state.selectedPaymentMethod === 'paypal' && (
                                                            <span className="price-usd-inline"> ({formatDualCurrency(this.getOrderTotal()).usd})</span>
                                                        )}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="ltn__payment-note mt-30 mb-30">
                                        <p style={{ fontSize: 13, fontStyle: "italic" }}>
                                            Your personal data will be used to process your order, support your
                                            experience throughout this website, and for other purposes described
                                            in our privacy policy.
                                        </p>
                                    </div>
                                    <button 
                                        className="btn-checkout" 
                                        onClick={this.handlePlaceOrder}
                                        disabled={this.state.isLoading || (this.state.selectedPaymentMethod === 'paypal' && this.state.paypalOrderCreated)}
                                    >
                                        {this.state.isLoading ? 'Đang xử lý...' : 
                                         this.state.selectedPaymentMethod === 'paypal' && this.state.paypalOrderCreated 
                                            ? 'Đã tạo đơn hàng PayPal' 
                                            : 'Place order'}
                                    </button>
                                    {this.state.selectedPaymentMethod === 'paypal' && this.state.paypalOrderCreated && (
                                        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                                            Vui lòng hoàn tất thanh toán PayPal bằng cách quét QR code hoặc click "Thanh toán trên Web" ở trên
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                <Footer />

            </>

        )
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Checkout));
