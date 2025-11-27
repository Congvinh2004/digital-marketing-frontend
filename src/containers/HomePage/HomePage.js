import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCartItemCount, getCartTotal } from '../../services/cartService';
import { getAllProducts, getAllCategories, getProductByCategoryId } from '../../services/productService';
import { userLogout } from '../../store/actions';
import { path } from '../../utils/constant';
import "./HomePage.scss"
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategoryMenu from '../../components/Product/CategoryMenu';
import InforProduct from '../../components/Product/InforProduct';
import '../../styles/base.css'
import SpecialProduct from '../../components/Product/SpecialProduct';
import DiscountProduct from '../../components/Product/DiscountProduct';
import Footer from '../../components/Product/Footer';


import logo from '../../imgs/logo_F5.png'
import banner1 from '../../imgs/banner/1.jpg'
import banner2 from '../../imgs/banner/2.jpg'
import banner3 from '../../imgs/banner/3.jpg'
import category1 from '../../imgs/icons/icon-img/category-1.png'
import category2 from '../../imgs/icons/icon-img/category-2.png'
import category3 from '../../imgs/icons/icon-img/category-3.png'
import category4 from '../../imgs/icons/icon-img/category-4.png'
import category5 from '../../imgs/icons/icon-img/category-5.png'
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
// import brandLogo1 from '../../imgs/brand-logo/1.png'
// import brandLogo2 from '../../imgs/brand-logo/2.png'
// import brandLogo3 from '../../imgs/brand-logo/3.png'
// import brandLogo4 from '../../imgs/brand-logo/4.png'
// import brandLogo5 from '../../imgs/brand-logo/5.png'

import banner13 from '../../imgs/banner/13.png'
import banner14 from '../../imgs/banner/14.png'
import banner15 from '../../imgs/banner/15.png'
import SliderIntro from '../../components/Product/SliderIntro';

// import '../../js/plugins'
// import '../../js/main'

class HomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listImgBanner: [
                banner1,
                banner2,
                banner3

            ],
            listCategoty: [
                category1,
                category2,
                category3,
                category4,
                category5
            ],
            listProduct: {
                foodDrinks: [product1, product2, product3, product4, product5],
                vegetables: [product6, product7, product8, product9, product10],
                driedFoods: [product11, product12, product13, product14, product15],
                breadCake: [product1, product2, product3, product4, product5],
                fishMeat: [product6, product7, product8, product9, product10, product7, product8,]

            },
            isTypeProduct: 'foodDrinks',
            cartItemCount: 0,
            topSellingProducts: [], // Danh sách sản phẩm bán chạy nhất
            listCategories: [], // Danh sách categories
            selectedCategory: null, // Category được chọn (null = tất cả)
            discountProducts: [] // Danh sách sản phẩm đang giảm giá
        }
    }



    handleRedirectToProductPage = () => {
        if (this.props.history) {

            this.props.history.push(`/product`)
        }
    }
    handleRedirectToCart = () => {
        // if (this.props.history) {

        this.props.history.push(`/cart`)
        // }
    }
    handleRedirectToCheckout = () => {
        if (this.props.history) {
            this.props.history.push(`/checkout`)
        }
    }


    componentDidMount() {
        this.updateCartCount();
        // Lắng nghe sự kiện cập nhật giỏ hàng
        window.addEventListener('cartUpdated', this.updateCartCount);
        // Lắng nghe sự kiện cập nhật sản phẩm
        window.addEventListener('productsUpdated', this.fetchTopSellingProducts);
        window.addEventListener('productsUpdated', this.fetchDiscountProducts);
        // Load danh sách categories
        this.fetchAllCategories();
        // Load danh sách sản phẩm bán chạy
        this.fetchTopSellingProducts();
        // Load danh sách sản phẩm đang giảm giá
        this.fetchDiscountProducts();
    }

    componentDidUpdate(prevProps) {
        // Cập nhật giỏ hàng khi user thay đổi (đăng nhập/đăng xuất)
        if (prevProps.userInfo !== this.props.userInfo) {
            this.updateCartCount();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('cartUpdated', this.updateCartCount);
        window.removeEventListener('productsUpdated', this.fetchTopSellingProducts);
        window.removeEventListener('productsUpdated', this.fetchDiscountProducts);
    }

    updateCartCount = () => {
        const count = getCartItemCount();
        this.setState({ cartItemCount: count });
    }

    getCartTotal = () => {
        return getCartTotal();
    }

    fetchAllCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response && response.errCode === 0 && response.data) {
                this.setState({ listCategories: response.data });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.setState({ listCategories: [] });
        }
    }

    fetchDiscountProducts = async () => {
        try {
            const response = await getAllProducts();
            if (response && response.data && Array.isArray(response.data)) {
                // Lọc các sản phẩm có discount_percent > 0
                const discountProducts = response.data.filter(product => {
                    const discount = product.discount_percent || product.discountPercent || 0;
                    return discount > 0;
                });
                
                // Sắp xếp theo discount_percent giảm dần (giảm giá nhiều nhất trước)
                const sortedDiscountProducts = [...discountProducts].sort((a, b) => {
                    const discountA = a.discount_percent || a.discountPercent || 0;
                    const discountB = b.discount_percent || b.discountPercent || 0;
                    return discountB - discountA;
                });

                this.setState({ discountProducts: sortedDiscountProducts });
            } else if (Array.isArray(response)) {
                const discountProducts = response.filter(product => {
                    const discount = product.discount_percent || product.discountPercent || 0;
                    return discount > 0;
                });
                const sortedDiscountProducts = [...discountProducts].sort((a, b) => {
                    const discountA = a.discount_percent || a.discountPercent || 0;
                    const discountB = b.discount_percent || b.discountPercent || 0;
                    return discountB - discountA;
                });
                this.setState({ discountProducts: sortedDiscountProducts });
            }
        } catch (error) {
            console.error('Error fetching discount products:', error);
            this.setState({ discountProducts: [] });
        }
    }

    handleCategoryChange = async (categoryId) => {
        this.setState({ selectedCategory: categoryId });
        await this.fetchTopSellingProducts(categoryId);
    }

    fetchTopSellingProducts = async (categoryId = null) => {
        try {
            let response;
            
            // Nếu có category được chọn, lấy sản phẩm theo category
            if (categoryId) {
                response = await getProductByCategoryId(categoryId);
            } else {
                // Nếu không, lấy tất cả sản phẩm
                response = await getAllProducts();
            }

            if (response && response.data && Array.isArray(response.data)) {
                // Sắp xếp sản phẩm theo sold_quantity giảm dần
                const sortedProducts = [...response.data].sort((a, b) => {
                    const soldA = a.sold_quantity || a.soldQuantity || 0;
                    const soldB = b.sold_quantity || b.soldQuantity || 0;
                    return soldB - soldA; // Giảm dần
                });

                // Lấy tối đa 8 sản phẩm
                const topProducts = sortedProducts.slice(0, 8);

                this.setState({ topSellingProducts: topProducts });
            } else if (Array.isArray(response)) {
                // Nếu response là array trực tiếp
                const sortedProducts = [...response].sort((a, b) => {
                    const soldA = a.sold_quantity || a.soldQuantity || 0;
                    const soldB = b.sold_quantity || b.soldQuantity || 0;
                    return soldB - soldA;
                });
                const topProducts = sortedProducts.slice(0, 8);
                this.setState({ topSellingProducts: topProducts });
            } else {
                // Xử lý trường hợp response từ getProductByCategoryId có thể có format khác
                const products = response?.data || response || [];
                if (Array.isArray(products) && products.length > 0) {
                    const sortedProducts = [...products].sort((a, b) => {
                        const soldA = a.sold_quantity || a.soldQuantity || 0;
                        const soldB = b.sold_quantity || b.soldQuantity || 0;
                        return soldB - soldA;
                    });
                    const topProducts = sortedProducts.slice(0, 8);
                    this.setState({ topSellingProducts: topProducts });
                } else {
                    this.setState({ topSellingProducts: [] });
                }
            }
        } catch (error) {
            console.error('Error fetching top selling products:', error);
            this.setState({ topSellingProducts: [] });
        }
    }

    handleLogout = () => {
        // userLogout action đã xóa localStorage rồi
        this.props.userLogout();
        toast.success('Đăng xuất thành công!');
        if (this.props.history) {
            this.props.history.push(path.HOMEPAGE);
        }
    }

    handleNavigateToLogin = () => {
        if (this.props.history) {
            this.props.history.push(path.LOGIN);
        }
    }

    handleNavigateToRegister = () => {
        if (this.props.history) {
            this.props.history.push(path.REGISTER);
        }
    }

    handleSelectCategory = (resultSelect) => {
        this.setState({
            isTypeProduct: resultSelect
        })
    }
    render() {
        let { isTypeProduct, listProduct } = this.state
        console.log('check list product: ', listProduct[isTypeProduct])
    let userInfo = this.props.userInfo;
    console.log('check user info: ', userInfo)
        let { listImgBanner, listCategoty } = this.state
        return (

            <>

                {/* HEADER AREA START (header-3) */}
                <header className="header-container">
                    {/* ltn__header-top-area start */}
                    <div className="header-top-area">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-7">
                                    <div className="top-bar-menu">
                                        <ul className='list-infor'>
                                            <li>
                                                <a href="mailto:info@webmail.com?Subject=Flower%20greetings%20to%20you">
                                                    <i className="far fa-envelope" style={{ color: '#80b500', paddingRight: '5px' }} ></i>
                                                    <span>
                                                        info@webmail.com

                                                    </span>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="locations.html">
                                                    <i className="fas fa-map-marker-alt" style={{ color: '#80b500', paddingRight: '5px' }} ></i>

                                                    <span>
                                                        15/A, Nest Tower, NYC

                                                    </span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="top-bar-right">
                                        <div className="top-bar-menu">
                                            <ul className='list-content-right'>
                                                <li>
                                                    <div className="language-menu">


                                                        <a href="#" className="dropdown-toggle">
                                                            <span className="active-currency">
                                                                English
                                                            </span>
                                                        </a>
                                                        <div className='list-language-container'>

                                                            <ul className='list-language'>
                                                                <li>
                                                                    <a href="#">Arabic</a>
                                                                </li>
                                                                <li>
                                                                    <a href="#">Bengali</a>
                                                                </li>
                                                                <li>
                                                                    <a href="#">Chinese</a>
                                                                </li>
                                                                <li>
                                                                    <a href="#">English</a>
                                                                </li>
                                                                <li>
                                                                    <a href="#">French</a>
                                                                </li>
                                                                <li>
                                                                    <a href="#">Hindi</a>
                                                                </li>
                                                            </ul>
                                                        </div>


                                                    </div>
                                                </li>

                                                <li>
                                                    {/* ltn__social-media */}
                                                    <div className="social-media">
                                                        <ul className='list-social'>
                                                            <li className='item-social'>
                                                                <a href="#" title="Facebook">
                                                                    <i className="fab fa-facebook-f" />
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" title="Twitter">
                                                                    <i className="fab fa-twitter" />
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" title="Instagram">
                                                                    <i className="fab fa-instagram" />
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" title="Dribbble">
                                                                    <i className="fab fa-dribbble" />
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ltn__header-top-area end */}
                    {/* ltn__header-middle-area start */}
                    <div className="header-middle-area">
                        <div className="container">
                            <div className="row">
                                <div className='col-2'>

                                    <div className="site-logo">
                                        <a href="index.html">
                                            <img src={logo} alt="Logo" />
                                        </a>
                                    </div>

                                </div>

                                <div className='col-6'>
                                    <div className="header-contact-serarch">

                                        <div className="header-feature">

                                            <i className="fas fa-phone-volume"></i>

                                            <div className="header-feature-info">
                                                <h6>Phone</h6>
                                                <p>
                                                    <a href="tel:0123456789">+0123-456-789</a>
                                                </p>
                                            </div>
                                        </div>
                                        {/* header-search-2 */}
                                        <div className="header-search-2">

                                            <input
                                                type="text"
                                                name="search"
                                                defaultValue=""
                                                placeholder="Search here..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='col-4'>
                                    <div className="header-options">
                                        <div className='profile'>
                                            {this.props.userInfo ? (
                                                <>
                                                    <div className='user-info-display'>
                                                        <i className="fas fa-user"></i>
                                                        <span className='user-name'>
                                                            {this.props.userInfo.user.full_name || this.props.userInfo.user.email || 'User'}
                                                        </span>
                                                    </div>
                                                    <div className='list-action-container'>
                                                        <ul className='list-action'>
                                                            <li>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); this.props.history.push(path.PROFILE); }}>
                                                                    My Account
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); }}>
                                                                    Wishlist
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); this.handleLogout(); }}>
                                                                    Logout
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-user"></i>
                                                    <div className='list-action-container'>
                                                        <ul className='list-action'>
                                                            <li>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); this.handleNavigateToLogin(); }}>
                                                                    Sign in
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); this.handleNavigateToRegister(); }}>
                                                                    Register
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className='cart'>
                                            <div className='cart-item' onClick={() => { this.handleRedirectToCart() }} style={{ position: 'relative', cursor: 'pointer' }}>
                                                <i className="fas fa-shopping-cart"></i>
                                                {this.state.cartItemCount > 0 && (
                                                    <sup style={{
                                                        position: 'absolute',
                                                        top: '-12px',
                                                        right: '-12px',
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '15px',
                                                        height: '15px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {this.state.cartItemCount}
                                                    </sup>
                                                )}
                                            </div>
                                            <div className='view-cart'>
                                                <p>{this.state.cartItemCount > 0 ? this.getCartTotal().toFixed(0) : '0.00'} VND</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* header-bottom-area start */}
                    <div className='header-bottom-area'>
                        <div className='content-header'>
                            <h6>HOME +</h6>
                            <h6>ABOUT +</h6>
                            <h6 onClick={() => this.handleRedirectToProductPage()}>SHOP +</h6>
                            <h6>CONTACT</h6>
                        </div>


                    </div>
                </header>

                <div className="homepage-content-wrapper">
                <div className="ltn__slider-area ltn__slider-3---  section-bg-1--- mt-30" >
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-3">
                                {/* CATEGORY-MENU-LIST START */}
                                <CategoryMenu />
                                {/* END CATEGORY-MENU-LIST */}
                            </div>
                            <div className="col-lg-9">
                                <SliderIntro />
                            </div>
                        </div>
                    </div>
                </div>




                {/* BANNER AREA START */}

                <div className="ltn__banner-area mt-120">
                    <div className="container">

                        <div className="row ltn__custom-gutter--- justify-content-center">
                            {listImgBanner.map((itemBanner, index) => (
                                <div className="col-lg-4 col-md-6">
                                    <div className="ltn__banner-item" onClick={() => this.handleRedirectToProductPage()}>
                                        <div className="ltn__banner-img">

                                            <img src={itemBanner} alt="Banner Image" />

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SPECIAL OFFERS AREA START */}
                <SpecialProduct discountProducts={this.state.discountProducts} />

                {/* CATEGORY AREA START  */}

                <div className="ltn__category-area section-bg-1--- pt-100">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section-title-area ltn__section-title-2--- text-center">
                                    <h1 className="section-title white-color---">Sản Phẩm Bán Chạy</h1>
                                    <p className="white-color---">
                                        Top 8 sản phẩm được yêu thích nhất
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Filter và See More */}
                        <div className="row mb-4">
                            <div className="col-lg-12 category-filter-row">
                                <div className="category-filter-container">
                                    <label htmlFor="categoryFilter" className="white-color---">
                                        Lọc theo danh mục:
                                    </label>
                                    <select
                                        id="categoryFilter"
                                        className="category-select"
                                        value={this.state.selectedCategory || ''}
                                        onChange={(e) => this.handleCategoryChange(e.target.value || null)}
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {this.state.listCategories.map((category) => (
                                            <option key={category.id || category.categoryID} value={category.id || category.categoryID}>
                                                {category.name || category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className="btn-see-more"
                                    onClick={this.handleRedirectToProductPage}
                                >
                                    Xem thêm
                                </button>
                            </div>
                        </div>

                        <div className="row ltn__category-slider-active--- slick-arrow-1">
                            {this.state.topSellingProducts.length > 0 ? (
                                this.state.topSellingProducts.map((product, index) => {
                                    const productId = product.id || product.productID;
                                    return (
                                        <div key={productId || index} className="col-lg-3 col-md-4 col-sm-6 col-12">
                                            <InforProduct 
                                                product={product}
                                                productImg={product.image || product.productImage || product.imageUrl}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-12 text-center">
                                    <p className="white-color---">Đang tải sản phẩm...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* PRODUCT TAB AREA START (product-item-3) */}

                <div className="ltn__product-tab-area ltn__product-gutter pt-115 pb-70">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section-title-area ltn__section-title-2--- text-center">
                                    {/* <h6 class="section-subtitle ltn__secondary-color">// Cars</h6> */}
                                    <h1 className="section-title">Our Products</h1>
                                    <p>
                                        A highly efficient slip-ring scanner for today's diagnostic
                                        requirements.
                                    </p>
                                </div>

                                {/* LIST ACTION  */}
                                <div className="list-memu">

                                    <div className="list-menu-content">
                                        <span className={`item-menu ${isTypeProduct === 'foodDrinks' ? 'active' : ''}`} onClick={() => this.handleSelectCategory('foodDrinks')}>
                                            Food &amp; Drinks
                                        </span>
                                        <span className={`item-menu ${isTypeProduct === 'vegetables' ? 'active' : ''}`} onClick={() => this.handleSelectCategory('vegetables')}>
                                            Vegetables
                                        </span>
                                        <span className={`item-menu ${isTypeProduct === 'driedFoods' ? 'active' : ''}`} onClick={() => this.handleSelectCategory('driedFoods')}>
                                            Dried Foods
                                        </span>
                                        <span className={`item-menu ${isTypeProduct === 'breadCake' ? 'active' : ''}`} onClick={() => this.handleSelectCategory('breadCake')}>
                                            Bread &amp; Cake
                                        </span>
                                        <span className={`item-menu ${isTypeProduct === 'fishMeat' ? 'active' : ''}`} onClick={() => this.handleSelectCategory('fishMeat')}>
                                            Fish &amp; Meat
                                        </span>
                                    </div>
                                </div>


                                <DiscountProduct listProductByType={listProduct[isTypeProduct]} />
                            </div>
                        </div>
                    </div>
                </div >
                <div className="ltn__banner-area">

                    <div className="ltn__banner-item content-left">
                        <div className="ltn__banner-img">

                            <img src={banner13} alt="Banner Image" />

                        </div>
                    </div>
                    <div className='ltn__banner-item content-right'>
                        <div className="banner-item first-child">
                            <div className="ltn__banner-img-top">

                                <img src={banner14} alt="Banner Image" />

                            </div>
                        </div>
                        <div className="banner-item last-child">
                            <div className="ltn__banner-img-bottom">

                                <img src={banner15} alt="Banner Image" />

                            </div>
                        </div>
                    </div>



                </div>
                </div>
                <Footer />
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomePage));
