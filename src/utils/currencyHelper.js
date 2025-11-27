/**
 * Utility functions cho chuyển đổi tiền tệ
 */

// Tỷ giá VND/USD (có thể cập nhật từ API hoặc config)
const VND_TO_USD_RATE = 25000; // 1 USD = 25,000 VND

/**
 * Chuyển đổi VND sang USD
 * @param {Number} vndAmount - Số tiền VND
 * @returns {Number} Số tiền USD (làm tròn 2 chữ số thập phân)
 */
export const vndToUsd = (vndAmount) => {
    if (!vndAmount || vndAmount === 0) return 0;
    return parseFloat((vndAmount / VND_TO_USD_RATE).toFixed(2));
};

/**
 * Chuyển đổi USD sang VND
 * @param {Number} usdAmount - Số tiền USD
 * @returns {Number} Số tiền VND (làm tròn)
 */
export const usdToVnd = (usdAmount) => {
    if (!usdAmount || usdAmount === 0) return 0;
    return Math.round(usdAmount * VND_TO_USD_RATE);
};

/**
 * Format số tiền VND
 * @param {Number} amount - Số tiền
 * @returns {String} Chuỗi đã format (ví dụ: "1.000.000 VND")
 */
export const formatVND = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return `${parseFloat(amount).toLocaleString('vi-VN')} VND`;
};

/**
 * Format số tiền USD
 * @param {Number} amount - Số tiền USD
 * @returns {String} Chuỗi đã format (ví dụ: "$41.67")
 */
export const formatUSD = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Hiển thị cả VND và USD
 * @param {Number} vndAmount - Số tiền VND
 * @returns {Object} { vnd: string, usd: string }
 */
export const formatDualCurrency = (vndAmount) => {
    const usdAmount = vndToUsd(vndAmount);
    return {
        vnd: formatVND(vndAmount),
        usd: formatUSD(usdAmount)
    };
};

/**
 * Lấy tỷ giá hiện tại
 * @returns {Number} Tỷ giá VND/USD
 */
export const getExchangeRate = () => {
    return VND_TO_USD_RATE;
};

/**
 * Tính giá sau khi giảm giá
 * @param {Number} originalPrice - Giá gốc
 * @param {Number} discountPercent - Phần trăm giảm giá (0-100)
 * @returns {Number} Giá sau khi giảm
 */
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!discountPercent || discountPercent <= 0) {
        return originalPrice;
    }
    if (discountPercent >= 100) {
        return 0;
    }
    const discount = (originalPrice * discountPercent) / 100;
    return Math.round(originalPrice - discount);
};

