import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ProductDetail.scss';
import Header from '../../components/Product/Header';
import Footer from '../../components/Product/Footer';
import CustomScrollbars from '../../components/CustomScrollbars';
import { getProductById, getProductByCategoryId } from '../../services/productService';
import { addToCart, getCartItemCount } from '../../services/cartService';
import SuccessNotification from '../../components/Common/SuccessNotification';
import InforProduct from '../../components/Product/InforProduct';
import { formatDualCurrency, calculateDiscountedPrice } from '../../utils/currencyHelper';
import { createProductUrl, getProductIdFromSlug } from '../../utils/slugHelper';
import { createAbsoluteUrl } from '../../utils/urlHelper';
import MetaTags from '../../components/Common/MetaTags';
import ShareThisWidget from '../../components/Common/ShareThisWidget';

class ProductDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: null,
            isLoading: true,
            categoryId: null,
            quantity: 1,
            selectedImageIndex: 0,
            relatedProducts: [],
            isLoadingRelated: false,
            cartItemCount: 0,
            showSuccessNotification: false,
            successMessage: ''
        }
    }

    async componentDidMount() {
        this.cleanupAfterHotReload();
        await this.fetchProductDetail();
        this.updateCartCount();
        window.addEventListener('cartUpdated', this.updateCartCount);
        // Lắng nghe sự kiện cập nhật sản phẩm (sau khi thanh toán thành công)
        window.addEventListener('productsUpdated', this.handleProductUpdated);
    }

    componentWillUnmount() {
        window.removeEventListener('cartUpdated', this.updateCartCount);
        window.removeEventListener('productsUpdated', this.handleProductUpdated);
    }

    handleProductUpdated = async () => {
        // Refresh chi tiết sản phẩm sau khi thanh toán thành công
        // Backend đã tự động cập nhật quantity và sold_quantity
        const productId = this.props.match?.params?.id;
        if (productId) {
            await this.fetchProductDetail();
        }
    }

    updateCartCount = () => {
        const count = getCartItemCount();
        this.setState({ cartItemCount: count });
    }

    handleLogout = () => {
        // userLogout action đã xóa localStorage rồi
        this.props.userLogout();
        toast.success('Đăng xuất thành công!');
        if (this.props.history) {
            this.props.history.push('/home');
        }
    }

    async componentDidUpdate(prevProps) {
        // Reload khi productId thay đổi
        const currentProductId = this.props.match?.params?.id || new URLSearchParams(this.props.location?.search).get('id');
        const prevProductId = prevProps.match?.params?.id || new URLSearchParams(prevProps.location?.search).get('id');
        
        if (currentProductId !== prevProductId) {
            this.setState({
                selectedImageIndex: 0,
                quantity: 1
            });
            await this.fetchProductDetail();
        }
    }

    cleanupAfterHotReload = () => {
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.pointerEvents = '';
    }

    fetchProductDetail = async () => {
        try {
            this.setState({ isLoading: true });
            // Hỗ trợ cả URL thân thiện (slug) và ID cũ
            const slugOrId = this.props.match?.params?.id || this.props.match?.params?.slug || new URLSearchParams(this.props.location?.search).get('id');
            console.log('check slugOrId: ', slugOrId)
            if (!slugOrId) {
                this.setState({
                    product: null,
                    isLoading: false
                });
                return;
            }

            // Lấy product ID từ slug (nếu là slug) hoặc dùng trực tiếp (nếu là ID)
            const productId = getProductIdFromSlug(slugOrId) || slugOrId;

            let response = await getProductById(productId);
            console.log('check response: ', response)
            let productData = null;
            
            if (response && response.data) {
                productData = response.data;
            } else if (response && !response.data) {
                // Nếu response trực tiếp là product object
                productData = response;
            }
            
            this.setState({
                product: productData,
                isLoading: false,
                categoryId: productData.category_id
            });

            // Cập nhật URL thành URL thân thiện nếu chưa phải
            if (productData && this.props.history) {
                const friendlyUrl = createProductUrl(productData.productID || productData.id, productData.name || productData.productName);
                const currentPath = this.props.location.pathname;
                if (currentPath !== friendlyUrl && !currentPath.includes(friendlyUrl.split('/').pop())) {
                    // Chỉ cập nhật URL nếu khác với URL hiện tại (tránh loop)
                    this.props.history.replace(friendlyUrl);
                }
            }

            // Fetch related products sau khi có product data
            if (productData) {
                await this.fetchRelatedProducts(productData);
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            this.setState({
                product: null,
                isLoading: false
            });
        }
    }

    handleQuantityChange = (delta) => {
        this.setState(prevState => ({
            quantity: Math.max(1, prevState.quantity + delta)
        }));
    }

    handleQuantityInputChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        this.setState({
            quantity: Math.max(1, value)
        });
    }

    handleAddToCart = () => {
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!this.props.isLoggedIn || !this.props.userInfo) {
            toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            if (this.props.history) {
                this.props.history.push({
                    pathname: '/login',
                    state: { from: this.props.location.pathname }
                });
            }
            return;
        }

        const { product, quantity } = this.state;
        
        if (!product) {
            toast.error('Không tìm thấy thông tin sản phẩm');
            return;
        }

        const result = addToCart(product, quantity);
        
        if (result.success) {
            const productName = product.name || product.productName || 'sản phẩm';
            this.setState({
                showSuccessNotification: true,
                successMessage: `Đã thêm ${quantity} "${productName}" vào giỏ hàng!`
            });
            this.updateCartCount();
        } else {
            toast.error(result.message || 'Có lỗi xảy ra khi thêm sản phẩm');
        }
    }

    handleBackToProducts = () => {
        if (this.props.history) {
            this.props.history.push('/product');
        }
    }

    handleSelectImage = (index) => {
        this.setState({ selectedImageIndex: index });
    }

    fetchRelatedProducts = async (product) => {
        try {
            this.setState({ isLoadingRelated: true });
            const categoryId = this.state.categoryId;
            console.log('check categoryId: ', categoryId)
            if (!categoryId) {
                this.setState({ 
                    relatedProducts: [],
                    isLoadingRelated: false 
                });
                return;
            }

            let response = await getProductByCategoryId(categoryId);
            const currentProductId = product.productID || product.id;
            console.log('check currentProductId: ', currentProductId)
            console.log('check response: ', response)
            // Lọc bỏ sản phẩm hiện tại và chỉ lấy tối đa 4 sản phẩm
            let relatedProducts = [];
            if (response && response.data && Array.isArray(response.data)) {
                relatedProducts = response.data
                    .filter(p => (p.productID || p.id) !== currentProductId)
                    .slice(0, 4);
            } else if (Array.isArray(response)) {
                relatedProducts = response
                    .filter(p => (p.productID || p.id) !== currentProductId)
                    .slice(0, 4);
            }

            this.setState({
                relatedProducts: relatedProducts,
                isLoadingRelated: false
            });
        } catch (error) {
            console.error('Error fetching related products:', error);
            this.setState({
                relatedProducts: [],
                isLoadingRelated: false
            });
        }
    }

    handleViewProductDetail = (productId, productName = '') => {
        if (this.props.history && productId) {
            // Sử dụng URL thân thiện nếu có tên sản phẩm
            if (productName) {
                const friendlyUrl = createProductUrl(productId, productName);
                this.props.history.push(friendlyUrl);
            } else {
                // Fallback về URL cũ nếu chưa có tên
                this.props.history.push(`/product-detail/${productId}`);
            }
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }

    render() {
        const { product, isLoading, quantity, selectedImageIndex } = this.state;

        // Lấy thông tin sản phẩm
        const productImage = product?.image || product?.productImage || product?.imageUrl || '';
        const productName = product?.name || product?.productName || 'Tên sản phẩm';
        const originalPrice = product?.price || product?.productPrice || 0;
        const discountPercent = product?.discount_percent || product?.discountPercent || 0;
        const finalPrice = calculateDiscountedPrice(originalPrice, discountPercent);
        const hasDiscount = discountPercent > 0;
        const productDescription = product?.description || product?.productDescription || 'Chưa có mô tả';
        const productQuantity = product?.quantity || product?.productQuantity || 0;
        const soldQuantity = product?.sold_quantity || product?.soldQuantity || 0;
        const initialQuantity = product?.initial_quantity || product?.initialQuantity || productQuantity + soldQuantity;
        const productCategory = product?.categoryName || product?.category?.name || '';

        // Tạo array images (có thể có nhiều hình)
        const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : productImage ? [productImage] : [];

        // Tạo URL thân thiện và meta data
        const productId = product?.productID || product?.id;
        const friendlyUrl = product ? createProductUrl(productId, productName) : '';
        // Đảm bảo shareUrl là absolute URL (hỗ trợ ngrok)
        const shareUrlPath = friendlyUrl || window.location.pathname;
        const shareUrl = createAbsoluteUrl(shareUrlPath);
        const shareImage = productImages.length > 0 ? productImages[0] : productImage;
        const metaDescription = productDescription.length > 150 
            ? productDescription.substring(0, 150) + '...' 
            : productDescription;
        const siteName = 'Digital Marketing Store';

        return (
            <>
                {/* Meta Tags for SEO and Social Sharing */}
                {product && (
                    <MetaTags
                        title={`${productName} - ${siteName}`}
                        description={metaDescription}
                        image={shareImage}
                        url={shareUrl}
                        type="product"
                        siteName={siteName}
                        keywords={`${productName}, ${productCategory}, sản phẩm, mua sắm`}
                    />
                )}

                <div className='product-detail-container'>
                    {/* Header */}
                    <Header />

                    {/* Breadcrumb */}
                    <div className='breadcrumb-container'>
                        <div className='container'>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a onClick={() => this.props.history.push('/home')}>Trang chủ</a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a onClick={() => this.props.history.push('/product')}>Sản phẩm</a>
                                    </li>
                                    {productCategory && (
                                        <li className="breadcrumb-item">{productCategory}</li>
                                    )}
                                    <li className="breadcrumb-item active" aria-current="page">{productName}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    {/* Product Detail Content */}
                    <div className='product-detail-content'>
                        <div className='container'>
                            {isLoading ? (
                                <div className='loading-container' style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '400px',
                                    fontSize: '18px'
                                }}>
                                    Đang tải thông tin sản phẩm...
                                </div>
                            ) : !product ? (
                                <div className='no-product-container' style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '400px',
                                    fontSize: '18px'
                                }}>
                                    <p>Không tìm thấy sản phẩm</p>
                                    <button className='btn btn-primary mt-3' onClick={this.handleBackToProducts}>
                                        Quay lại danh sách sản phẩm
                                    </button>
                                </div>
                            ) : (
                                <div className='row'>
                                    {/* Product Images */}
                                    <div className='col-md-6'>
                                        <div className='product-images-container'>
                                            {productImages.length > 0 ? (
                                                <>
                                                    <div className='main-image'>
                                                        <img 
                                                            src={productImages[selectedImageIndex]} 
                                                            alt={productName}
                                                            className='img-fluid'
                                                        />
                                                    </div>
                                                    {productImages.length > 1 && (
                                                        <div className='thumbnail-images'>
                                                            {productImages.map((img, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`thumbnail-item ${selectedImageIndex === index ? 'active' : ''}`}
                                                                    onClick={() => this.handleSelectImage(index)}
                                                                >
                                                                    <img src={img} alt={`${productName} ${index + 1}`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className='no-image'>
                                                    <i className="fas fa-image"></i>
                                                    <p>Chưa có hình ảnh</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className='col-md-6'>
                                        <div className='product-info-container'>
                                            <h1 className='product-title'>{productName}</h1>
                                            
                                            <div className='product-rating mb-3'>
                                                <ul className='list-rating'>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="far fa-star"></i></li>
                                                    <li className="review-total">(24 đánh giá)</li>
                                                </ul>
                                            </div>

                                            <div className='product-price mb-3'>
                                                <span className='current-price'>{formatDualCurrency(finalPrice).vnd}</span>
                                                <span className='current-price-usd'>{formatDualCurrency(finalPrice).usd}</span>
                                                {hasDiscount && (
                                                    <>
                                                        <span className='old-price' style={{ 
                                                            textDecoration: 'line-through', 
                                                            color: '#999', 
                                                            marginLeft: '15px',
                                                            fontSize: '18px'
                                                        }}>
                                                            {formatDualCurrency(originalPrice).vnd}
                                                        </span>
                                                        <span className='discount-badge' style={{
                                                            background: '#e74c3c',
                                                            color: 'white',
                                                            padding: '4px 10px',
                                                            borderRadius: '4px',
                                                            marginLeft: '10px',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            -{discountPercent}%
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className='product-meta mb-4'>
                                                <div className='meta-item'>
                                                    <span className='label'>Danh mục:</span>
                                                    <span className='value'>{productCategory || 'Chưa phân loại'}</span>
                                                </div>
                                                <div className='meta-item'>
                                                    <span className='label'>Tình trạng:</span>
                                                    <span className={`value ${productQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                        {productQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                                    </span>
                                                </div>
                                                <div className='meta-item'>
                                                    <span className='label'>Tồn kho:</span>
                                                    <span className={`value ${productQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                        {productQuantity} sản phẩm
                                                    </span>
                                                </div>
                                                {soldQuantity > 0 && (
                                                    <div className='meta-item'>
                                                        <span className='label'>Đã bán:</span>
                                                        <span className='value sold'>
                                                            {soldQuantity} sản phẩm
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ShareThis Widget */}
                                            <div className='product-share mb-4'>
                                                <ShareThisWidget
                                                    url={shareUrl}
                                                    title={productName}
                                                    description={metaDescription}
                                                    image={shareImage}
                                                />
                                            </div>

                                            <div className='product-actions'>
                                                <div className='quantity-selector mb-3'>
                                                    <label>Số lượng:</label>
                                                    <div className='quantity-controls'>
                                                        <button 
                                                            className='btn btn-quantity' 
                                                            onClick={() => this.handleQuantityChange(-1)}
                                                        >
                                                            <i className="fas fa-minus"></i>
                                                        </button>
                                                        <input
                                                            type='number'
                                                            className='quantity-input'
                                                            value={quantity}
                                                            onChange={this.handleQuantityInputChange}
                                                            min='1'
                                                        />
                                                        <button 
                                                            className='btn btn-quantity' 
                                                            onClick={() => this.handleQuantityChange(1)}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className='action-buttons'>
                                                    <button 
                                                        className='btn btn-add-to-cart'
                                                        onClick={this.handleAddToCart}
                                                        disabled={productQuantity === 0}
                                                    >
                                                        <i className="fas fa-shopping-cart"></i>
                                                        Thêm vào giỏ hàng
                                                    </button>
                                                    <button className='btn btn-buy-now' disabled={productQuantity === 0}>
                                                        Mua ngay
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Description & Information Section */}
                            {product && (
                                <div className='product-description-section'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <div className='description-tabs'>
                                                <div className='tab-content'>
                                                    <div className='tab-pane active'>
                                                        <div className='description-content'>
                                                            <h3>Mô tả sản phẩm</h3>
                                                            <div className='description-text'>
                                                                <p>{productDescription}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Information */}
                                    <div className='row mt-4'>
                                        <div className='col-12'>
                                            <div className='product-information'>
                                                <h3>Thông tin sản phẩm</h3>
                                                <div className='info-table'>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Tên sản phẩm:</span>
                                                        <span className='info-value'>{productName}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Danh mục:</span>
                                                        <span className='info-value'>{productCategory || 'Chưa phân loại'}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Giá:</span>
                                                        <span className='info-value'>
                                                            {formatDualCurrency(finalPrice).vnd} ({formatDualCurrency(finalPrice).usd})
                                                            {hasDiscount && (
                                                                <span style={{ 
                                                                    textDecoration: 'line-through', 
                                                                    color: '#999', 
                                                                    marginLeft: '10px' 
                                                                }}>
                                                                    {formatDualCurrency(originalPrice).vnd}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Tình trạng:</span>
                                                        <span className='info-value'>{productQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Số lượng tồn kho:</span>
                                                        <span className={`info-value ${productQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                            {productQuantity} sản phẩm
                                                        </span>
                                                    </div>
                                                    {soldQuantity > 0 && (
                                                        <div className='info-row'>
                                                            <span className='info-label'>Đã bán:</span>
                                                            <span className='info-value sold'>
                                                                {soldQuantity} sản phẩm
                                                            </span>
                                                        </div>
                                                    )}
                                                    {product?.productID && (
                                                        <div className='info-row'>
                                                            <span className='info-label'>Mã sản phẩm:</span>
                                                            <span className='info-value'>{product.productID}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Related Products Section */}
                            {product && (
                                <div className='related-products-section'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <h2 className='section-title'>Sản phẩm cùng danh mục</h2>
                                            {this.state.isLoadingRelated ? (
                                                <div className='loading-related' style={{
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    fontSize: '16px'
                                                }}>
                                                    Đang tải sản phẩm liên quan...
                                                </div>
                                            ) : this.state.relatedProducts && this.state.relatedProducts.length > 0 ? (
                                                <div className='related-products-list'>
                                                    <div className='row'>
                                                        {this.state.relatedProducts.map((relatedProduct, index) => {
                                                            const relatedProductId = relatedProduct.productID || relatedProduct.id;
                                                            return (
                                                                <div key={index} className='col-md-3 col-sm-6 mb-4'>
                                                                    <div onClick={() => {
                                                                        const relatedProduct = this.state.relatedProducts.find(p => (p.productID || p.id) === relatedProductId);
                                                                        const relatedProductName = relatedProduct?.name || relatedProduct?.productName || '';
                                                                        this.handleViewProductDetail(relatedProductId, relatedProductName);
                                                                    }}>
                                                                        <InforProduct product={relatedProduct} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='no-related-products' style={{
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    fontSize: '16px',
                                                    color: '#666'
                                                }}>
                                                    Không có sản phẩm liên quan
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='home-footer'>
                        <Footer />
                    </div>
                </div>

                {/* Success Notification */}
                <SuccessNotification
                    isOpen={this.state.showSuccessNotification}
                    onClose={() => this.setState({ showSuccessNotification: false })}
                    message={this.state.successMessage}
                    icon="shopping-cart"
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
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProductDetail));

