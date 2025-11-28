import axios from '../axios';

/**
 * Service xử lý quản lý đơn hàng (admin)
 */

/**
 * Lấy danh sách đơn hàng
 * @param {Object} params - Query parameters: status, customer_id, user_id, page, limit
 * @returns {Promise}
 */
export const getAllOrders = (params = {}) => {
    return axios.get('/api/orders', { params });
};

/**
 * Lấy chi tiết đơn hàng
 * @param {Number} orderId - ID đơn hàng
 * @returns {Promise}
 */
export const getOrderDetail = (orderId) => {
    return axios.get(`/api/orders/${orderId}`);
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {Number} orderId - ID đơn hàng
 * @param {String} status - Trạng thái mới (pending, paid, shipped, completed, cancelled)
 * @returns {Promise}
 */
export const updateOrderStatus = (orderId, status) => {
    return axios.put(`/api/orders/${orderId}/status`, { status });
};

/**
 * Cập nhật trạng thái thanh toán
 * @param {Number} orderId - ID đơn hàng
 * @param {String} paymentStatus - Trạng thái thanh toán mới (pending, paid, completed, failed, cancelled, refunded)
 * @returns {Promise}
 */
export const updatePaymentStatus = (orderId, paymentStatus) => {
    return axios.put(`/api/orders/${orderId}/payment-status`, { payment_status: paymentStatus });
};


