/**
 * Service quản lý giỏ hàng trong sessionStorage
 * Giỏ hàng được lưu theo user ID để mỗi user có giỏ hàng riêng
 */

const CART_KEY_PREFIX = 'shopping_cart_';

/**
 * Lấy key để lưu giỏ hàng dựa trên user ID
 * @param {Number|String} userId - ID của user (nếu có)
 * @returns {String} Key để lưu giỏ hàng
 */
const getCartKey = (userId = null) => {
    if (userId) {
        return `${CART_KEY_PREFIX}${userId}`;
    }
    // Nếu chưa đăng nhập, dùng key mặc định
    return `${CART_KEY_PREFIX}guest`;
};

/**
 * Lấy user ID từ localStorage
 * @returns {Number|String|null} User ID hoặc null nếu chưa đăng nhập
 */
const getCurrentUserId = () => {
    try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            const user = userInfo?.user || userInfo;
            return user?.id || user?.userID || user?.user_id || null;
        }
    } catch (error) {
        console.error('Error getting user ID:', error);
    }
    return null;
};

/**
 * Lấy toàn bộ giỏ hàng từ sessionStorage
 * @param {Number|String} userId - ID của user (optional, sẽ tự động lấy nếu không truyền)
 * @returns {Array} Danh sách sản phẩm trong giỏ hàng
 */
export const getCart = (userId = null) => {
    try {
        const currentUserId = userId || getCurrentUserId();
        const cartKey = getCartKey(currentUserId);
        const cartStr = sessionStorage.getItem(cartKey);
        return cartStr ? JSON.parse(cartStr) : [];
    } catch (error) {
        console.error('Error getting cart:', error);
        return [];
    }
};

/**
 * Lưu giỏ hàng vào sessionStorage
 * @param {Array} cart - Danh sách sản phẩm trong giỏ hàng
 * @param {Number|String} userId - ID của user (optional, sẽ tự động lấy nếu không truyền)
 */
export const saveCart = (cart, userId = null) => {
    try {
        const currentUserId = userId || getCurrentUserId();
        const cartKey = getCartKey(currentUserId);
        sessionStorage.setItem(cartKey, JSON.stringify(cart));
        // Dispatch custom event để các component khác có thể lắng nghe
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
};

/**
 * Tính giá sau khi giảm giá
 * @param {Number} originalPrice - Giá gốc
 * @param {Number} discountPercent - Phần trăm giảm giá (0-100)
 * @returns {Number} Giá sau khi giảm
 */
const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!discountPercent || discountPercent <= 0) {
        return originalPrice;
    }
    if (discountPercent >= 100) {
        return 0;
    }
    const discount = (originalPrice * discountPercent) / 100;
    return Math.round(originalPrice - discount);
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {Object} product - Thông tin sản phẩm
 * @param {Number} quantity - Số lượng (mặc định 1)
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
export const addToCart = (product, quantity = 1) => {
    try {
        if (!product || !product.id && !product.productID) {
            return {
                success: false,
                message: 'Thông tin sản phẩm không hợp lệ',
                cart: getCart()
            };
        }

        const cart = getCart();
        const productId = product.id || product.productID;
        
        // Tính giá sau discount
        const originalPrice = product.price || product.productPrice || 0;
        const discountPercent = product.discount_percent || product.discountPercent || 0;
        const finalPrice = calculateDiscountedPrice(originalPrice, discountPercent);
        
        // Tìm sản phẩm đã có trong giỏ hàng
        const existingItemIndex = cart.findIndex(
            item => (item.id || item.productID) === productId
        );

        if (existingItemIndex !== -1) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            cart[existingItemIndex].quantity += quantity;
            // Cập nhật giá nếu có thay đổi (giá discount có thể thay đổi)
            cart[existingItemIndex].price = finalPrice;
        } else {
            // Nếu chưa có, thêm mới
            const cartItem = {
                id: product.id || product.productID,
                productID: product.productID || product.id,
                name: product.name || product.productName || 'Tên sản phẩm',
                price: finalPrice, // Lưu giá sau discount
                originalPrice: originalPrice, // Lưu giá gốc để hiển thị
                discount_percent: discountPercent, // Lưu phần trăm discount
                image: product.image || product.productImage || product.imageUrl || '',
                quantity: quantity,
                // Lưu thêm các thông tin khác nếu cần
                category_id: product.category_id || product.categoryId || null,
                description: product.description || ''
            };
            cart.push(cartItem);
        }

        saveCart(cart);
        return {
            success: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            cart: cart
        };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return {
            success: false,
            message: 'Có lỗi xảy ra khi thêm sản phẩm',
            cart: getCart()
        };
    }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {String|Number} productId - ID sản phẩm
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
export const removeFromCart = (productId) => {
    try {
        const cart = getCart();
        const filteredCart = cart.filter(
            item => (item.id || item.productID) !== productId
        );
        saveCart(filteredCart);
        return {
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            cart: filteredCart
        };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return {
            success: false,
            message: 'Có lỗi xảy ra khi xóa sản phẩm',
            cart: getCart()
        };
    }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {String|Number} productId - ID sản phẩm
 * @param {Number} quantity - Số lượng mới
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
export const updateCartItemQuantity = (productId, quantity) => {
    try {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }

        const cart = getCart();
        const itemIndex = cart.findIndex(
            item => (item.id || item.productID) === productId
        );

        if (itemIndex !== -1) {
            cart[itemIndex].quantity = quantity;
            saveCart(cart);
            return {
                success: true,
                message: 'Đã cập nhật số lượng',
                cart: cart
            };
        } else {
            return {
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng',
                cart: cart
            };
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        return {
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật số lượng',
            cart: getCart()
        };
    }
};

/**
 * Xóa toàn bộ giỏ hàng
 * @param {Number|String} userId - ID của user (optional, sẽ tự động lấy nếu không truyền)
 */
export const clearCart = (userId = null) => {
    try {
        const currentUserId = userId || getCurrentUserId();
        const cartKey = getCartKey(currentUserId);
        sessionStorage.removeItem(cartKey);
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
};

/**
 * Lấy tổng số lượng sản phẩm trong giỏ hàng
 * @param {Number|String} userId - ID của user (optional, sẽ tự động lấy nếu không truyền)
 * @returns {Number}
 */
export const getCartItemCount = (userId = null) => {
    const cart = getCart(userId);
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Lấy tổng giá trị giỏ hàng
 * @returns {Number}
 */
export const getCartTotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        return total + (price * quantity);
    }, 0);
};

/**
 * Kiểm tra sản phẩm đã có trong giỏ hàng chưa
 * @param {String|Number} productId - ID sản phẩm
 * @returns {Boolean}
 */
export const isProductInCart = (productId) => {
    const cart = getCart();
    return cart.some(item => (item.id || item.productID) === productId);
};

