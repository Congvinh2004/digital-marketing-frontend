import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userLogout } from '../../store/actions';
import { path } from '../../utils/constant';
import './HomeProduct.scss'
import InforProduct from '../../components/Product/InforProduct';
import CategoryMenu from '../../components/Product/CategoryMenu';
import Header from '../../components/Product/Header';
import Footer from '../../components/Product/Footer';
import CustomScrollbars from '../../components/CustomScrollbars'
import logo from "../../imgs/logo_F5.png"

import { getAllProducts, getProductByCategoryId } from '../../services/productService';
import { getCartItemCount } from '../../services/cartService';
import banner1 from '../../imgs/banner/1.jpg'
import banner2 from '../../imgs/banner/2.jpg'
import banner3 from '../../imgs/banner/3.jpg'
import category1 from '../../imgs/icons/icon-img/category-1.png'
import category2 from '../../imgs/icons/icon-img/category-2.png'
import category3 from '../../imgs/icons/icon-img/category-3.png'
import category4 from '../../imgs/icons/icon-img/category-4.png'
import category5 from '../../imgs/icons/icon-img/category-5.png'
class HomeProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listInforProducts: [],
            isLoading: true,
            selectedCategoryId: null, // Lưu category đang được chọn
            cartItemCount: getCartItemCount(),
        }
        this.updateCartCount();
    }

    async componentDidMount() {
        // Cleanup modal backdrop và body styles sau hot reload
        this.cleanupAfterHotReload();
        this.updateCartCount();
        // Lắng nghe sự kiện cập nhật giỏ hàng
        window.addEventListener('cartUpdated', this.updateCartCount);
        // Lắng nghe sự kiện cập nhật sản phẩm (sau khi thanh toán thành công)
        window.addEventListener('productsUpdated', this.handleProductsUpdated);
        await this.fetchAllProducts();
    }

    componentDidUpdate(prevProps) {
        // Cập nhật giỏ hàng khi user thay đổi (đăng nhập/đăng xuất)
        if (prevProps.userInfo !== this.props.userInfo) {
            this.updateCartCount();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('cartUpdated', this.updateCartCount);
        window.removeEventListener('productsUpdated', this.handleProductsUpdated);
    }

    handleProductsUpdated = async () => {
        // Refresh danh sách sản phẩm sau khi thanh toán thành công
        // Backend đã tự động cập nhật quantity và sold_quantity
        await this.fetchAllProducts();
    }

    updateCartCount = () => {
        this.setState({ cartItemCount: getCartItemCount() });
    }

    // Cleanup function để xóa modal backdrop và reset body styles
    cleanupAfterHotReload = () => {
        // Remove modal backdrop nếu có
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => backdrop.remove());

        // Remove body classes và styles từ reactstrap modal
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Remove any element với pointer-events: none trên body
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.pointerEvents === 'none') {
            document.body.style.pointerEvents = '';
        }
    }

    fetchAllProducts = async () => {
        try {
            this.setState({ isLoading: true, selectedCategoryId: null });
            let response = await getAllProducts();
            
            // Kiểm tra cấu trúc response - có thể là response.data hoặc response trực tiếp
            if (response) {
                if (response && response.data && response.data.length > 0) {
                  this.setState({
                    listInforProducts: response.data,
                    isLoading: false
                  })
                } else {
                  this.setState({
                    listInforProducts: [],
                    isLoading: false
                  })
                }
            } else {
                this.setState({
                    listInforProducts: [],
                    isLoading: false
                })
            }
            
            
        } catch (error) {
            console.error('Error fetching products:', error);
            this.setState({
                listInforProducts: [],
                isLoading: false
            })
        }
    }

    // Function để lấy sản phẩm theo category
    fetchProductsByCategory = async (category_id) => {
        try {
            this.setState({ isLoading: true, selectedCategoryId: category_id });
            let response = await getProductByCategoryId(category_id);
            
            // Kiểm tra cấu trúc response
            if (response) {
                if (response && response.data && response.data.length > 0) {
                    this.setState({
                        listInforProducts: response.data,
                        isLoading: false
                    })
                } else {
                    this.setState({
                        listInforProducts: [],
                        isLoading: false
                    })
                }
            } else {
                this.setState({
                    listInforProducts: [],
                    isLoading: false
                })
            }
        } catch (error) {
            console.error('Error fetching products by category:', error);
            this.setState({
                listInforProducts: [],
                isLoading: false
            })
        }
    }

    // Callback để CategoryMenu gọi khi click vào category
    handleCategoryClick = (category_id) => {
        if (category_id) {
            this.fetchProductsByCategory(category_id);
        } else {
            // Nếu không có category_id, load tất cả sản phẩm
            this.fetchAllProducts();
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

    handleLogout = () => {
        // userLogout action đã xóa localStorage rồi
        this.props.userLogout();
        toast.success('Đăng xuất thành công!');
        if (this.props.history) {
            this.props.history.push('/home');
        }
    }


    render() {
        let { listInforProducts, isLoading } = this.state
        console.log('check listInforProducts: ', listInforProducts)  
        console.log('check isLoading: ', isLoading)
        return (
            <>
                <div className='home-product-container'>
                    <div className='home-header-container' >
                        <div className='home-header-content'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-3'>
                                        <div className='content-left'>
                                            <div className="site-logo" onClick={() => this.handleWayBackHome()}>
                                                <img src={logo} alt="Logo" />

                                            </div>

                                        </div>
                                    </div>

                                    <div className='col-6'>
                                        <div className="content-middle">

                                            <div className='section-search-container'>
                                                <input type='text' className='section-search' placeholder='Nhập từ khóa tìm kiếm' />
                                                <i className="fas fa-search search-icon"></i>

                                            </div>


                                            <div className="header-menu-content">

                                                <ul className='list-action'>
                                                    <li className="menu-icon" onClick={() => this.handleWayBackHome()}>Home + </li>
                                                    <li className="menu-icon list-about-container">
                                                        <span className='text-selection'>
                                                            About +
                                                        </span>
                                                        <div className='list-about'>
                                                            <ul className='list-about-content'>
                                                                <li className='item-about'>About</li>
                                                                <li className='item-about'>FAQ </li>
                                                                <li className='item-about'>Google Map locations</li>
                                                            </ul>

                                                        </div>
                                                    </li>
                                                    <li className="menu-icon list-action-container">
                                                        <span className='text-selection' onClick={() => this.handleRedirectToProductPage()}>
                                                            Shop +

                                                        </span>

                                                        <ul className='list-action-shop'>
                                                            <li className='item-action' onClick={() => { this.handleRedirectToCart() }}> Cart </li>
                                                            <li className='item-action'> Checkout </li>
                                                            <li className='item-action'>  Order Tracking </li>
                                                        </ul>
                                                    </li>
                                                    <li className="menu-icon">Contact</li>
                                                </ul>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-3'>
                                        <div className="content-right">
                                            <div className='list-user-selection'>
                                                <div className="header-search-wrap">

                                                    <div className="search-icon">
                                                        <i className="fas fa-search"></i>
                                                    </div>

                                                </div>
                                                <div className="user-menu">
                                                    {this.props.userInfo ? (
                                                        <>
                                                            <div className='user-info-display'>
                                                    <i className="fas fa-user"></i>
                                                                <span className='user-name'>
                                                                    {this.props.userInfo.user?.full_name || this.props.userInfo.user?.email || 'User'}
                                                                </span>
                                                            </div>
                                                    <ul className='user-selection'>
                                                                <li className='item-selection' onClick={() => this.props.history.push(path.PROFILE)}>
                                                            My Account
                                                        </li>
                                                        <li className='item-selection'>
                                                            Wishlist
                                                        </li>
                                                                <li className='item-selection' onClick={this.handleLogout}>
                                                                    Logout
                                                                </li>
                                                            </ul>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-user"></i>
                                                            <ul className='user-selection'>
                                                                <li className='item-selection' onClick={() => this.props.history.push(path.LOGIN)}>
                                                                    Sign in
                                                                </li>
                                                                <li className='item-selection' onClick={() => this.props.history.push(path.REGISTER)}>
                                                                    Register
                                                                </li>
                                                    </ul>
                                                        </>
                                                    )}
                                                </div>
                                                {/* mini-cart */}
                                                <div className="mini-cart-icon" onClick={() => { this.handleRedirectToCart() }}>

                                                    <i className="fas fa-shopping-cart"></i>
                                                    {this.state.cartItemCount !== 0 && (    
                                                        <sup>{this.state.cartItemCount !== 0 ? this.state.cartItemCount : 0}</sup>
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                    <div className='home-body'>

                        <div className='content-left'>
                            <CustomScrollbars>
                                <div className='category-menu'>
                                    <CategoryMenu 
                                        onCategoryClick={this.handleCategoryClick}
                                        selectedCategoryId={this.state.selectedCategoryId}
                                    />

                                </div>

                            </CustomScrollbars>
                        </div>
                        <div className='content-right'>
                            <CustomScrollbars>

                                <div className='list-product-container'>
                                    {isLoading ? (
                                        <div className='loading-container' style={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center', 
                                            height: '400px',
                                            fontSize: '18px'
                                        }}>
                                            Đang tải sản phẩm...
                                        </div>
                                    ) : listInforProducts && listInforProducts.length > 0 ? (
                                        listInforProducts.map((product, index) => (
                                            <InforProduct 
                                                product={product} 
                                                key={product.productID || index} 
                                            />
                                        ))
                                    ) : (
                                        <div className='no-products-container' style={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center', 
                                            height: '400px',
                                            fontSize: '18px'
                                        }}>
                                            Không có sản phẩm nào
                                        </div>
                                    )}
                                </div>
                                <div className='home-footer'>
                                    <Footer />
                                </div>
                            </CustomScrollbars>

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
        userLogout: () => dispatch(userLogout())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomeProduct));
