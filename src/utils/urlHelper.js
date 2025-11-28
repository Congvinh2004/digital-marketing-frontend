/**
 * Utility để xử lý URL cho SEO và Social Sharing
 * Hỗ trợ cả localhost (với ngrok) và production
 */

/**
 * Lấy base URL cho meta tags và sharing
 * Hỗ trợ ngrok và các tunnel services
 */
export const getBaseUrl = () => {
    // Kiểm tra environment variable cho ngrok URL
    if (process.env.REACT_APP_NGROK_URL) {
        return process.env.REACT_APP_NGROK_URL;
    }
    
    // Kiểm tra xem có phải ngrok URL không
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('ngrok') || 
        currentOrigin.includes('loca.lt') || 
        currentOrigin.includes('serveo.net')) {
        return currentOrigin;
    }
    
    // Production hoặc localhost thông thường
    return currentOrigin;
};

/**
 * Tạo absolute URL từ relative path
 * @param {string} path - Relative path (ví dụ: '/san-pham/123-ao-thun')
 * @returns {string} - Absolute URL
 */
export const createAbsoluteUrl = (path) => {
    const baseUrl = getBaseUrl();
    
    // Nếu path đã là absolute URL, return luôn
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // Đảm bảo path bắt đầu bằng /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
};

/**
 * Tạo absolute URL cho image
 * @param {string} imagePath - Image path (có thể là relative hoặc absolute)
 * @returns {string} - Absolute image URL
 */
export const createAbsoluteImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Nếu đã là absolute URL, return luôn
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Nếu là base64, return luôn
    if (imagePath.startsWith('data:image')) {
        return imagePath;
    }
    
    // Kiểm tra xem có phải là đường dẫn từ backend không
    // Backend thường lưu ảnh ở /uploads/, /images/, /public/, /static/
    const backendImagePaths = ['/uploads/', '/images/', '/public/', '/static/', '/assets/'];
    const isBackendImage = backendImagePaths.some(path => imagePath.startsWith(path));
    
    if (isBackendImage) {
        // Ảnh từ backend, sử dụng backend URL
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${backendUrl}${normalizedPath}`;
    }
    
    // Ảnh từ frontend (public folder), sử dụng frontend URL
    const baseUrl = getBaseUrl();
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${normalizedPath}`;
};

