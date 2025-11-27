import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../../services/cartService';
import { formatDualCurrency, calculateDiscountedPrice } from '../../utils/currencyHelper';
import { createProductUrl } from '../../utils/slugHelper';
import './InforProduct.scss'
class InforProduct extends Component {

    state = {

    }


    componentDidMount() {
    }


    handleAddToCart = (e) => {
        e.stopPropagation();
        
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!this.props.isLoggedIn || !this.props.userInfo) {
            toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: this.props.location?.pathname }
                });
            }
            return;
        }
        
        if (!this.props.product) {
            toast.error('Không tìm thấy thông tin sản phẩm');
            return;
        }

        const result = addToCart(this.props.product, 1);
        
        if (result.success) {
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        } else {
            toast.error(result.message || 'Có lỗi xảy ra khi thêm sản phẩm');
        }
    }

    handleRedirectToCart = () => {
        if (this.props.history) {
            this.props.history.push(`/cart`)
        }
    }

    handleRedirectToProductPage = () => {
        if (this.props.history) {
            this.props.history.push(`/product`)
        }
    }

    handleViewProductDetail = () => {
        if (this.props.history && this.props.product) {
            const productId = this.props.product.productID || this.props.product.id;
            const productName = this.props.product.name || this.props.product.productName || '';
            if (productId) {
                // Sử dụng URL thân thiện
                const friendlyUrl = createProductUrl(productId, productName);
                this.props.history.push(friendlyUrl);
            }
        }
    }
    render() {

        let { product, productImg } = this.props
        
        // Kiểm tra product có tồn tại không
        if (!product) {
            return null;
        }

        // Lấy image từ các field có thể có: image, productImage, imageUrl
        const productImage = product.image || product.productImage || product.imageUrl || '';
        const productName = product.name || product.productName || 'Tên sản phẩm';
        const originalPrice = product.price || product.productPrice || 0;
        const discountPercent = product.discount_percent || product.discountPercent || 0;
        const finalPrice = calculateDiscountedPrice(originalPrice, discountPercent);
        const hasDiscount = discountPercent > 0;
        const quantity = product.quantity || product.productQuantity || 0;
        const soldQuantity = product.sold_quantity || product.soldQuantity || 0;
        const initialQuantity = product.initial_quantity || product.initialQuantity || quantity + soldQuantity;

        return (
            <>
                    <div className="product-item text-center">
                        <div className='product-img'
                        onClick={this.handleViewProductDetail}
                            style={{
                            backgroundImage: productImage ? `url(${productImage})` : 'none',
                            cursor: 'pointer'
                            }}>
                            {hasDiscount && (
                            <div className="product-badge">
                                    <span className="sale-badge">-{discountPercent}%</span>
                            </div>
                            )}
                            <div className='product-hover-action-container'>

                                <div className="product-hover-action">
                                <span className='product-action-child' onClick={this.handleViewProductDetail}>
                                        <i className="far fa-eye" />
                                    </span>

                                <span className='product-action-child cart-item' onClick={this.handleAddToCart}>
                                        <i className="fas fa-shopping-cart" />
                                    </span>

                                    <span className='product-action-child'>
                                        <i className="far fa-heart" />
                                    </span>


                                </div>
                            </div>

                        </div>
                    <div className="product-info">
                        <div className="product-ratting">
                                <ul className='list-ratting'>
                                <li><a href="#"><i className="fas fa-star"></i></a></li>
                                <li><a href="#"><i className="fas fa-star"></i></a></li>
                                <li><a href="#"><i className="fas fa-star"></i></a></li>
                                <li><a href="#"><i className="fas fa-star"></i></a>
                                    </li>
                                <li><a href="#"><i className="far fa-star"></i></a></li>
                                <li className="review-total"> <a href="#"> (24)</a></li>
                                </ul>
                            </div>
                        <h6 className="product-title" onClick={this.handleViewProductDetail} style={{ cursor: 'pointer' }}>{productName}</h6>
                        <div className="product-price">
                            <div className="price-main">
                                <span className='price'>{formatDualCurrency(finalPrice).vnd}</span>
                                <span className='price-usd'>{formatDualCurrency(finalPrice).usd}</span>
                            </div>
                            {hasDiscount && (
                                <div className="price-old-container">
                                    <del className='price-old'>
                                        {formatDualCurrency(originalPrice).vnd}
                                    </del>
                                    <span className='price-old-usd'>
                                        {formatDualCurrency(originalPrice).usd}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="product-stock-info">
                            <div className="stock-item">
                                <span className="stock-label">Tồn kho:</span>
                                <span className={`stock-value ${quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {quantity}
                                </span>
                            </div>
                            {soldQuantity > 0 && (
                                <div className="stock-item">
                                    <span className="stock-label">Đã bán:</span>
                                    <span className="stock-value sold">
                                        {soldQuantity}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(InforProduct));
