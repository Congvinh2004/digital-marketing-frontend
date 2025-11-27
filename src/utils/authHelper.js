/**
 * Helper functions để kiểm tra authentication
 */

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns {Boolean}
 */
export const isUserLoggedIn = () => {
    try {
        const userInfo = localStorage.getItem('userInfo');
        const accessToken = localStorage.getItem('accessToken');
        return !!(userInfo && accessToken);
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
};

/**
 * Lấy userInfo từ localStorage
 * @returns {Object|null}
 */
export const getUserInfo = () => {
    try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            return JSON.parse(userInfoStr);
        }
        return null;
    } catch (error) {
        console.error('Error getting userInfo:', error);
        return null;
    }
};

/**
 * Kiểm tra user có phải admin không
 * @returns {Boolean}
 */
export const isAdmin = () => {
    try {
        const userInfo = getUserInfo();
        if (!userInfo) return false;
        
        // Kiểm tra nhiều cách lưu role
        const role = userInfo.role || 
                    userInfo.userRole || 
                    userInfo.user?.role || 
                    userInfo.user?.userRole ||
                    userInfo.userRole ||
                    '';
        
        // Kiểm tra role là admin (case insensitive)
        const roleLower = role.toString().toLowerCase();
        return roleLower === 'admin' || roleLower === 'administrator';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * Kiểm tra đăng nhập và redirect nếu chưa đăng nhập
 * @param {Object} history - React Router history object
 * @param {String} redirectPath - Path để redirect sau khi đăng nhập (optional)
 * @returns {Boolean} - true nếu đã đăng nhập, false nếu chưa
 */
export const requireAuth = (history, redirectPath = null) => {
    if (!isUserLoggedIn()) {
        if (history) {
            // Lưu path hiện tại để redirect lại sau khi đăng nhập
            if (redirectPath) {
                history.push({
                    pathname: '/login',
                    state: { from: redirectPath }
                });
            } else {
                history.push({
                    pathname: '/login',
                    state: { from: history.location.pathname }
                });
            }
        }
        return false;
    }
    return true;
};


