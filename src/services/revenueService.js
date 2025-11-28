import axios from '../axios';

/**
 * Service xử lý doanh thu
 */

/**
 * Lấy doanh thu theo ngày
 * @param {String} date - Ngày cần lấy (format: YYYY-MM-DD), nếu không có thì lấy hôm nay
 * @returns {Promise}
 */
export const getDailyRevenue = (date = null) => {
    const params = date ? { date } : {};
    return axios.get('/api/revenue/daily', { params });
};

/**
 * Lấy doanh thu theo tháng
 * @param {Number} year - Năm (ví dụ: 2024)
 * @param {Number} month - Tháng (1-12), nếu không có thì lấy tháng hiện tại
 * @returns {Promise}
 */
export const getMonthlyRevenue = (year = null, month = null) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return axios.get('/api/revenue/monthly', { params });
};


