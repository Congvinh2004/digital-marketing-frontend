import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import './Cart.scss'
import Header from '../../components/Product/Header';
import Footer from '../../components/Product/Footer';
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, getCartItemCount } from '../../services/cartService';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import SuccessNotification from '../../components/Common/SuccessNotification';
import { formatDualCurrency } from '../../utils/currencyHelper';



import product1 from '../../imgs/product/1.png'
import product2 from '../../imgs/product/2.png'
import product3 from '../../imgs/product/3.png'
import product4 from '../../imgs/product/4.png'
import product5 from '../../imgs/product/5.png'
import product6 from '../../imgs/product/6.png'
import product7 from '../../imgs/product/7.png'
import product8 from '../../imgs/product/8.png'
import product9 from '../../imgs/product/9.png'
import product10 from '../../imgs/product/10.png'
import product11 from '../../imgs/product/11.png'
import product12 from '../../imgs/product/12.png'
import product13 from '../../imgs/product/13.png'
import product14 from '../../imgs/product/14.png'
import product15 from '../../imgs/product/15.png'
import product16 from '../../imgs/product/16.png'
class Cart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cartItems: [],
            cartTotal: 0,
            shipping: 0, // Đã bỏ phí ship
            vat: 0,
            cartItemCount: 0,
            showConfirmDialog: false,
            itemToRemove: null,
            showSuccessNotification: false,
            successMessage: ''
        }
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

    handleRedirectToCheckout = () => {
        // Kiểm tra đăng nhập trước khi thanh toán
        if (!this.props.isLoggedIn || !this.props.userInfo) {
            toast.warning('Vui lòng đăng nhập để thanh toán');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: '/checkout' }
                });
            }
            return;
        }

        if (this.props.history) {
            this.props.history.push(`/checkout`);
        }
    }

    componentDidMount() {
        this.loadCart();
        // Lắng nghe sự kiện cập nhật giỏ hàng
        window.addEventListener('cartUpdated', this.loadCart);
    }

    componentWillUnmount() {
        window.removeEventListener('cartUpdated', this.loadCart);
    }

    loadCart = () => {
        const cartItems = getCart();
        const cartTotal = getCartTotal();
        const cartItemCount = getCartItemCount();
        this.setState({ 
            cartItems,
            cartTotal,
            cartItemCount
        });
    }

    handleRemoveItemClick = (productId) => {
        const item = this.state.cartItems.find(
            item => (item.id || item.productID) === productId
        );
        this.setState({
            showConfirmDialog: true,
            itemToRemove: productId
        });
    }

    handleConfirmRemove = () => {
        const { itemToRemove } = this.state;
        if (itemToRemove) {
            const result = removeFromCart(itemToRemove);
            if (result.success) {
                const item = this.state.cartItems.find(
                    item => (item.id || item.productID) === itemToRemove
                );
                this.setState({
                    showSuccessNotification: true,
                    successMessage: `Đã xóa "${item?.name || 'sản phẩm'}" khỏi giỏ hàng`,
                    showConfirmDialog: false,
                    itemToRemove: null
                });
                this.loadCart();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
                this.setState({
                    showConfirmDialog: false,
                    itemToRemove: null
                });
            }
        }
    }

    handleCloseConfirmDialog = () => {
        this.setState({
            showConfirmDialog: false,
            itemToRemove: null
        });
    }

    handleQuantityChange = (productId, delta) => {
        const item = this.state.cartItems.find(
            item => (item.id || item.productID) === productId
        );
        if (item) {
            const newQuantity = Math.max(1, item.quantity + delta);
            const result = updateCartItemQuantity(productId, newQuantity);
            if (result.success) {
                this.loadCart();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        }
    }

    handleQuantityInputChange = (productId, value) => {
        const quantity = Math.max(1, parseInt(value) || 1);
        const result = updateCartItemQuantity(productId, quantity);
        if (result.success) {
            this.loadCart();
        } else {
            toast.error(result.message || 'Có lỗi xảy ra');
        }
    }

    getOrderTotal = () => {
        const { cartTotal, shipping, vat } = this.state;
        return cartTotal + shipping + vat;
    }


    render() {
        return (
            <>
                <Header />
                <div className='home-body-cart'>
                    <div className='cart-title-container'>
                        <div className='cart-title-container'>
                            cart
                            <i className="fas fa-shopping-cart"></i>

                        </div>

                    </div>
                    <div className='cart-detail-container'>
                        {this.state.cartItems.length === 0 ? (
                            <div className='empty-cart-message'>
                                <i className="fas fa-shopping-cart" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                                <p>Giỏ hàng của bạn đang trống</p>
                                <button 
                                    className='btn-continue-shopping'
                                    onClick={() => this.handleRedirectToProductPage()}
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        ) : (
                            this.state.cartItems.map((item, index) => {
                                const productId = item.id || item.productID;
                                const productImage = item.image || '';
                                const productName = item.name || 'Tên sản phẩm';
                                const productPrice = item.price || 0;
                                const quantity = item.quantity || 1;
                                const subtotal = productPrice * quantity;

                                return (
                                    <div key={productId || index} className='cart-detail'>
                                        <div 
                                            className="cart-product-remove"
                                            onClick={() => this.handleRemoveItemClick(productId)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            x
                        </div>
                            <div className="cart-product-image">
                                            <img 
                                                src={productImage || product1} 
                                                alt={productName}
                                                onError={(e) => {
                                                    e.target.src = product1;
                                                }}
                                            />
                            </div>
                            <div className="cart-product-info">
                                <h4>
                                    <span className='product-name'>
                                                    {productName}
                                    </span>
                                </h4>
                            </div>
                            <div className="cart-product-price">
                                <span className='price'>
                                                {formatDualCurrency(productPrice).vnd}
                                            </span>
                                            <span className='price-usd'>
                                                {formatDualCurrency(productPrice).usd}
                                </span>
                            </div>
                            <div className="cart-product-quantity">
                                <div className="cart-plus-minus">
                                    <div className="block-container">
                                                    <div 
                                                        className="block-item item-left"
                                                        onClick={() => this.handleQuantityChange(productId, -1)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        -
                                                    </div>
                                                    <div className="block-item item-middle">
                                                        <input
                                                            type="number"
                                                            value={quantity}
                                                            onChange={(e) => this.handleQuantityInputChange(productId, e.target.value)}
                                                            min="1"
                                                            style={{
                                                                width: '100%',
                                                                border: 'none',
                                                                textAlign: 'center',
                                                                background: 'transparent'
                                                            }}
                                                        />
                                                    </div>
                                                    <div 
                                                        className="block-item item-right"
                                                        onClick={() => this.handleQuantityChange(productId, 1)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        +
                                                    </div>
                                    </div>
                                </div>
                            </div>
                            <div className="cart-product-subtotal">
                                <span className='total-price'>
                                                {formatDualCurrency(subtotal).vnd}
                                </span>
                                            <span className='total-price-usd'>
                                                {formatDualCurrency(subtotal).usd}
                                </span>
                            </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {this.state.cartItems.length > 0 && (
                    <div className="shoping-cart-total-container">
                        <div className="shoping-cart-total">

                            <h4 className='cart-total-title'>Cart Totals</h4>

                            <div className="cart-total-body">
                                <div className="cart-total-content">
                                    <div className='detail-total-price'>
                                            <span className='type-price'>Tạm tính</span>
                                            <span>
                                                {formatDualCurrency(this.state.cartTotal).vnd}
                                                <span className='price-usd-inline'> ({formatDualCurrency(this.state.cartTotal).usd})</span>
                                            </span>
                                    </div>
                                    <div className='detail-total-price'>
                                            <span className='type-price'>Phí vận chuyển</span>
                                            <span className='amount'>
                                                {formatDualCurrency(this.state.shipping).vnd}
                                                <span className='price-usd-inline'> ({formatDualCurrency(this.state.shipping).usd})</span>
                                            </span>
                                    </div>
                                    <div className='detail-total-price'>
                                            <span className='type-price'>VAT</span>
                                            <span className='amount'>
                                                {formatDualCurrency(this.state.vat).vnd}
                                                <span className='price-usd-inline'> ({formatDualCurrency(this.state.vat).usd})</span>
                                            </span>
                                    </div>
                                    <div className='detail-total-price'>
                                        <div>
                                                <strong className='order-total'>Tổng cộng</strong>
                                        </div>
                                        <div>
                                                <strong className='amount'>
                                                    {formatDualCurrency(this.getOrderTotal()).vnd}
                                                    <span className='price-usd-inline'> ({formatDualCurrency(this.getOrderTotal()).usd})</span>
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className="btn-order" 
                                    onClick={() => {
                                        if (this.state.cartItems.length > 0) {
                                            this.handleRedirectToCheckout();
                                        } else {
                                            toast.warning('Giỏ hàng đang trống');
                                        }
                                    }}
                                    style={{ 
                                        cursor: this.state.cartItems.length > 0 ? 'pointer' : 'not-allowed',
                                        opacity: this.state.cartItems.length > 0 ? 1 : 0.6
                                    }}
                                >
                                    <span>
                                        Thanh toán
                                    </span>
                            </div>
                            </div>
                        </div>
                    )}

                </div>
                <div className='home-footer'>
                    <Footer />
                </div>

                {/* Confirm Dialog */}
                <ConfirmDialog
                    isOpen={this.state.showConfirmDialog}
                    onClose={this.handleCloseConfirmDialog}
                    onConfirm={this.handleConfirmRemove}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
                    confirmText="Xóa"
                    cancelText="Hủy"
                    type="danger"
                />

                {/* Success Notification */}
                <SuccessNotification
                    isOpen={this.state.showSuccessNotification}
                    onClose={() => this.setState({ showSuccessNotification: false })}
                    message={this.state.successMessage}
                    icon="check-circle"
                    duration={3000}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
