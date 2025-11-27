/**
 * Utility functions for creating and handling URL-friendly slugs
 */

/**
 * Tạo slug từ text (tên sản phẩm)
 * @param {string} text - Text cần chuyển đổi
 * @returns {string} - Slug đã được format
 */
export const createSlug = (text) => {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Chuyển đổi ký tự có dấu thành không dấu
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Thay thế khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        // Loại bỏ nhiều dấu gạch ngang liên tiếp
        .replace(/\-\-+/g, '-')
        // Loại bỏ dấu gạch ngang ở đầu và cuối
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Tạo URL thân thiện cho sản phẩm
 * @param {number|string} productId - ID sản phẩm
 * @param {string} productName - Tên sản phẩm
 * @returns {string} - URL thân thiện (ví dụ: /san-pham/123-ao-thun-nam)
 */
export const createProductUrl = (productId, productName) => {
    const slug = createSlug(productName);
    return `/san-pham/${productId}-${slug}`;
};

/**
 * Lấy product ID từ URL slug
 * @param {string} slug - Slug từ URL (ví dụ: "123-ao-thun-nam")
 * @returns {number|null} - Product ID hoặc null nếu không tìm thấy
 */
export const getProductIdFromSlug = (slug) => {
    if (!slug) return null;
    
    // Lấy phần đầu tiên trước dấu gạch ngang đầu tiên
    const match = slug.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

