import axios from '../axios';

/**
 * Service xử lý địa chỉ giao hàng
 */

/**
 * Tạo địa chỉ giao hàng mới
 * @param {Object} addressData - Thông tin địa chỉ
 * @returns {Promise}
 */
export const createShippingAddress = (addressData) => {
    return axios.post('/api/addresses/create', addressData);
};

/**
 * Lấy danh sách địa chỉ của user
 * @returns {Promise}
 */
export const getUserAddresses = () => {
    return axios.get('/api/addresses');
};

/**
 * Cập nhật địa chỉ
 * @param {String|Number} addressId - ID địa chỉ
 * @param {Object} addressData - Thông tin địa chỉ mới
 * @returns {Promise}
 */
export const updateAddress = (addressId, addressData) => {
    return axios.put(`/api/addresses/${addressId}`, addressData);
};

/**
 * Xóa địa chỉ
 * @param {String|Number} addressId - ID địa chỉ
 * @returns {Promise}
 */
export const deleteAddress = (addressId) => {
    return axios.delete(`/api/addresses/${addressId}`);
};

