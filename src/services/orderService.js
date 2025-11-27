import axios from '../axios';

/**
 * Service xử lý đơn hàng và PayPal
 */

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - Thông tin đơn hàng
 * @returns {Promise}
 */
export const createOrder = (orderData) => {
    // Debug: Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('No accessToken found when creating order');
        return Promise.reject(new Error('No accessToken found. Please login again.'));
    }
    
    return axios.post('/api/orders/create', orderData);
};

/**
 * Cập nhật trạng thái đơn hàng sau khi thanh toán PayPal thành công
 * @param {String} orderId - ID đơn hàng
 * @param {Object} paymentData - Thông tin thanh toán từ PayPal
 * @returns {Promise}
 */
export const updateOrderPayment = (orderId, paymentData) => {
    return axios.put(`/api/orders/${orderId}/payment`, paymentData);
};

/**
 * Lấy danh sách đơn hàng của user
 * @param {String} userId - ID người dùng
 * @returns {Promise}
 */
export const getUserOrders = (userId) => {
    return axios.get(`/api/orders/user/${userId}`);
};

/**
 * Lấy chi tiết đơn hàng
 * @param {String} orderId - ID đơn hàng
 * @returns {Promise}
 */
export const getOrderDetail = (orderId) => {
    return axios.get(`/api/orders/${orderId}`);
};

/**
 * Tạo PayPal order và lấy approval URL + QR code
 * Backend sẽ tự động dùng total_amount_usd đã lưu trong order
 * @param {Number} orderId - ID đơn hàng trong hệ thống
 * @returns {Promise}
 */
export const createPayPalOrder = (orderId) => {
    return axios.post('/api/paypal/create-order', { orderId });
};

/**
 * Tạo QR code từ order ID (tự động tạo PayPal order nếu chưa có)
 * @param {Number} orderId - ID đơn hàng trong hệ thống
 * @returns {Promise}
 */
export const getQRCodeByOrder = (orderId) => {
    return axios.post('/api/paypal/qr-code-by-order', { orderId });
};

/**
 * Tạo QR code từ approval URL
 * @param {String} approvalUrl - PayPal approval URL
 * @param {Number} orderId - ID đơn hàng (optional)
 * @returns {Promise}
 */
export const getQRCode = (approvalUrl, orderId = null) => {
    return axios.post('/api/paypal/qr-code', { approvalUrl, orderId });
};

/**
 * Capture payment sau khi user approve
 * @param {String} paypalOrderId - PayPal order ID
 * @param {Number} orderId - ID đơn hàng trong hệ thống
 * @returns {Promise}
 */
export const capturePayPalOrder = (paypalOrderId, orderId) => {
    return axios.post('/api/paypal/capture-order', { 
        paypal_order_id: paypalOrderId,
        orderId 
    });
};


