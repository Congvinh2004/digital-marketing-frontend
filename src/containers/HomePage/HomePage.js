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
import MetaTags from '../../components/Common/MetaTags';
import { Helmet } from 'react-helmet';


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
            discountProducts: [], // Danh sách sản phẩm đang giảm giá
            ourProducts: [], // Danh sách sản phẩm cho phần Our Products
            selectedProductCategory: null // Category được chọn trong phần Our Products
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
        // Load danh sách sản phẩm cho phần Our Products
        this.fetchOurProducts();
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

    fetchOurProducts = async (categoryId = null) => {
        try {
            let response;
            if (categoryId) {
                response = await getProductByCategoryId(categoryId);
            } else {
                response = await getAllProducts();
            }

            if (response && response.data && Array.isArray(response.data)) {
                // Lấy tối đa 12 sản phẩm
                const products = response.data.slice(0, 12);
                this.setState({ ourProducts: products });
            } else if (Array.isArray(response)) {
                const products = response.slice(0, 12);
                this.setState({ ourProducts: products });
            } else {
                const products = response?.data || response || [];
                if (Array.isArray(products)) {
                    this.setState({ ourProducts: products.slice(0, 12) });
                } else {
                    this.setState({ ourProducts: [] });
                }
            }
        } catch (error) {
            console.error('Error fetching our products:', error);
            this.setState({ ourProducts: [] });
        }
    }

    handleSelectProductCategory = async (categoryId) => {
        this.setState({ selectedProductCategory: categoryId });
        await this.fetchOurProducts(categoryId);
    }
    render() {
        let { isTypeProduct, listProduct } = this.state
        console.log('check list product: ', listProduct[isTypeProduct])
    let userInfo = this.props.userInfo;
    console.log('check user info: ', userInfo)
        let { listImgBanner, listCategoty } = this.state
        
        // SEO Content cho trang chủ
        const seoTitle = 'F5 Mart - Cửa Hàng Trực Tuyến Uy Tín | Mua Sắm Online Chất Lượng';
        const seoDescription = 'F5 Mart - Cửa hàng trực tuyến hàng đầu Việt Nam chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý. Mua sắm online tiện lợi, giao hàng nhanh chóng, thanh toán an toàn. Khám phá ngàn sản phẩm đa dạng từ thực phẩm, đồ uống, rau củ quả đến các mặt hàng tiêu dùng thiết yếu.';
        const seoKeywords = 'F5 Mart, cửa hàng trực tuyến, mua sắm online, thương mại điện tử, sản phẩm chất lượng, giao hàng nhanh, thanh toán an toàn, mua hàng online Việt Nam, shop online uy tín';
        const seoImage = `${window.location.origin}/logo_F5.png`;
        const seoUrl = `${window.location.origin}/home`;
        
        return (

            <>
                {/* Meta Tags for SEO */}
                <MetaTags
                    title={seoTitle}
                    description={seoDescription}
                    image={seoImage}
                    url={seoUrl}
                    type="website"
                    siteName="F5 Mart"
                    keywords={seoKeywords}
                />
                
                {/* Schema.org JSON-LD Markup for SEO */}
                <Helmet>
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Store",
                            "name": "F5 Mart",
                            "description": "Cửa hàng trực tuyến hàng đầu Việt Nam chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý",
                            "url": seoUrl,
                            "logo": seoImage,
                            "image": seoImage,
                            "priceRange": "$$",
                            "address": {
                                "@type": "PostalAddress",
                                "addressCountry": "VN",
                                "addressLocality": "Việt Nam"
                            },
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+0123-456-789",
                                "contactType": "customer service",
                                "email": "info@webmail.com",
                                "availableLanguage": ["Vietnamese"]
                            },
                            "sameAs": [
                                "https://www.facebook.com",
                                "https://www.youtube.com"
                            ],
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": {
                                    "@type": "EntryPoint",
                                    "urlTemplate": `${seoUrl}/product?search={search_term_string}`
                                },
                                "query-input": "required name=search_term_string"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.8",
                                "reviewCount": "1250"
                            }
                        })}
                    </script>
                </Helmet>

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
                                    <h2 className="section-title white-color---">Sản Phẩm Bán Chạy</h2>
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
                                    <h2 className="section-title">Sản Phẩm Của Chúng Tôi</h2>
                                    <p style={{ color: '#666' , paddingTop: '20px'}}>
                                        Khám phá bộ sưu tập sản phẩm đa dạng và chất lượng cao từ F5 Mart. 
                                        Từ thực phẩm tươi sống đến các mặt hàng tiêu dùng thiết yếu, 
                                        chúng tôi mang đến cho bạn những lựa chọn tốt nhất với giá cả hợp lý.
                                    </p>
                                </div>

                                {/* LIST ACTION  */}
                                {this.state.listCategories && this.state.listCategories.length > 0 && (
                                    <div className="list-memu">
                                        <div className="list-menu-content">
                                            <span 
                                                className={`item-menu ${this.state.selectedProductCategory === null ? 'active' : ''}`} 
                                                onClick={() => this.handleSelectProductCategory(null)}
                                            >
                                                Tất Cả
                                            </span>
                                            {this.state.listCategories.map((category) => (
                                                <span 
                                                    key={category.id || category.categoryId}
                                                    className={`item-menu ${this.state.selectedProductCategory === (category.id || category.categoryId) ? 'active' : ''}`} 
                                                    onClick={() => this.handleSelectProductCategory(category.id || category.categoryId)}
                                                >
                                                    {category.name || category.categoryName || 'Danh mục'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {this.state.ourProducts && this.state.ourProducts.length > 0 ? (
                                    <DiscountProduct listProductByType={this.state.ourProducts} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        <p>Đang tải sản phẩm...</p>
                                    </div>
                                )}

                                {/* Nút Xem Thêm */}
                                <div style={{ 
                                    textAlign: 'center', 
                                    marginTop: '50px',
                                    marginBottom: '20px'
                                }}>
                                    <button
                                        onClick={() => this.props.history.push(path.HOMEPRODUCT)}
                                        style={{
                                            padding: '12px 40px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#fff',
                                            backgroundColor: '#80b500',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#6a9900';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#80b500';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        Xem Thêm Sản Phẩm
                                    </button>
                                </div>
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
                {/* SEO Content Section */}
                <div className="seo-content-section" style={{ 
                    padding: '60px 0', 
                    backgroundColor: '#f8f9fa',
                    marginTop: '50px'
                }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="seo-content-wrapper" style={{
                                    maxWidth: '900px',
                                    margin: '0 auto',
                                    textAlign: 'center'
                                }}>
                                    <h1 style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#333',
                                        marginBottom: '20px',
                                        lineHeight: '1.4'
                                    }}>
                                        F5 Mart - Cửa Hàng Trực Tuyến Uy Tín Hàng Đầu Việt Nam
                                    </h1>
                                    <div style={{
                                        fontSize: '16px',
                                        lineHeight: '1.8',
                                        color: '#555',
                                        textAlign: 'left',
                                        marginTop: '30px'
                                    }}>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> là một trong những <strong>cửa hàng trực tuyến</strong> uy tín và chất lượng hàng đầu tại Việt Nam. 
                                            Chúng tôi chuyên cung cấp các <strong>sản phẩm chất lượng cao</strong> với giá cả hợp lý, đáp ứng mọi nhu cầu mua sắm của khách hàng.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Với hệ thống <strong>mua sắm online</strong> hiện đại và tiện lợi, F5 Mart mang đến trải nghiệm <strong>thương mại điện tử</strong> 
                                            tốt nhất cho người dùng. Khách hàng có thể dễ dàng tìm kiếm và mua các sản phẩm yêu thích từ bất kỳ đâu, 
                                            bất kỳ lúc nào chỉ với vài cú click chuột.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '30px',
                                            marginBottom: '15px'
                                        }}>
                                            Tại Sao Chọn F5 Mart?
                                        </h3>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            marginBottom: '20px'
                                        }}>
                                            <li style={{ marginBottom: '12px', paddingLeft: '25px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#80b500' }}>✓</span>
                                                <strong>Giao hàng nhanh chóng:</strong> Hệ thống vận chuyển hiện đại, đảm bảo giao hàng đúng hẹn, 
                                                an toàn và tiện lợi đến tận tay khách hàng.
                                            </li>
                                            <li style={{ marginBottom: '12px', paddingLeft: '25px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#80b500' }}>✓</span>
                                                <strong>Thanh toán an toàn:</strong> Hỗ trợ nhiều phương thức thanh toán như COD, PayPal, VNPay 
                                                với hệ thống bảo mật cao, đảm bảo thông tin khách hàng được bảo vệ tuyệt đối.
                                            </li>
                                            <li style={{ marginBottom: '12px', paddingLeft: '25px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#80b500' }}>✓</span>
                                                <strong>Sản phẩm đa dạng:</strong> Hàng ngàn sản phẩm từ thực phẩm, đồ uống, rau củ quả tươi ngon 
                                                đến các mặt hàng tiêu dùng thiết yếu, đáp ứng mọi nhu cầu của gia đình bạn.
                                            </li>
                                            <li style={{ marginBottom: '12px', paddingLeft: '25px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#80b500' }}>✓</span>
                                                <strong>Giá cả hợp lý:</strong> Cam kết mang đến sản phẩm chất lượng với mức giá tốt nhất thị trường, 
                                                giúp khách hàng tiết kiệm chi phí mua sắm.
                                            </li>
                                            <li style={{ marginBottom: '12px', paddingLeft: '25px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#80b500' }}>✓</span>
                                                <strong>Dịch vụ khách hàng chuyên nghiệp:</strong> Đội ngũ tư vấn nhiệt tình, hỗ trợ 24/7, 
                                                giải đáp mọi thắc mắc và hỗ trợ khách hàng một cách nhanh chóng, hiệu quả.
                                            </li>
                                        </ul>
                                        <p style={{ marginBottom: '20px', marginTop: '30px' }}>
                                            <strong>Mua hàng online tại F5 Mart</strong> không chỉ tiện lợi mà còn an toàn và đáng tin cậy. 
                                            Chúng tôi cam kết mang đến cho khách hàng những trải nghiệm <strong>mua sắm trực tuyến</strong> tốt nhất 
                                            với chất lượng sản phẩm vượt trội và dịch vụ chăm sóc khách hàng tận tâm.
                                        </p>
                                        <p style={{ marginBottom: '20px', marginTop: '30px' }}>
                                            <strong>Mua sắm tại F5 Mart</strong> là lựa chọn thông minh cho mọi gia đình Việt Nam. 
                                            Chúng tôi không chỉ cung cấp sản phẩm chất lượng mà còn mang đến dịch vụ chăm sóc khách hàng tận tâm, 
                                            đảm bảo mọi trải nghiệm mua sắm đều trở nên tuyệt vời và đáng nhớ.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '30px',
                                            marginBottom: '15px'
                                        }}>
                                            Cam Kết Chất Lượng Từ F5 Mart
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            Với nhiều năm kinh nghiệm trong lĩnh vực <strong>thương mại điện tử</strong>, F5 Mart tự hào là 
                                            một trong những <strong>cửa hàng trực tuyến</strong> được tin tưởng nhất tại Việt Nam. 
                                            Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chính hãng, chất lượng cao với giá cả cạnh tranh nhất thị trường.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Hệ thống <strong>mua sắm online</strong> của chúng tôi được xây dựng với công nghệ hiện đại, 
                                            đảm bảo trải nghiệm mua sắm mượt mà, an toàn và tiện lợi. Khách hàng có thể dễ dàng tìm kiếm sản phẩm, 
                                            so sánh giá cả và đặt hàng chỉ trong vài phút. Quy trình thanh toán đơn giản với nhiều phương thức như 
                                            <strong>COD (Thanh toán khi nhận hàng)</strong>, <strong>PayPal</strong>, và <strong>VNPay</strong>, 
                                            đảm bảo an toàn tuyệt đối cho mọi giao dịch.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Đội ngũ nhân viên của F5 Mart luôn sẵn sàng hỗ trợ khách hàng 24/7, giải đáp mọi thắc mắc về sản phẩm, 
                                            hướng dẫn đặt hàng và xử lý mọi vấn đề phát sinh một cách nhanh chóng, chuyên nghiệp. 
                                            Chúng tôi hiểu rằng sự hài lòng của khách hàng chính là thành công của chúng tôi.
                                        </p>
                                        <p style={{ marginBottom: '20px', marginTop: '30px' }}>
                                            <strong>F5 Mart</strong> không chỉ là một <strong>cửa hàng trực tuyến</strong> thông thường, 
                                            mà còn là đối tác tin cậy của hàng ngàn khách hàng trên khắp Việt Nam. 
                                            Chúng tôi hiểu rằng mỗi sản phẩm bạn mua đều quan trọng, vì vậy chúng tôi luôn đảm bảo 
                                            chất lượng và dịch vụ tốt nhất có thể.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '30px',
                                            marginBottom: '15px'
                                        }}>
                                            Quy Trình Mua Sắm Đơn Giản Và Tiện Lợi
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            Với <strong>F5 Mart</strong>, việc mua sắm trở nên cực kỳ đơn giản. 
                                            Chỉ cần vài bước: tìm kiếm sản phẩm yêu thích, thêm vào giỏ hàng, 
                                            điền thông tin giao hàng và chọn phương thức thanh toán phù hợp. 
                                            Hệ thống <strong>mua sắm online</strong> của chúng tôi được thiết kế để 
                                            mang lại trải nghiệm tốt nhất cho người dùng, từ giao diện thân thiện đến 
                                            quy trình thanh toán an toàn và nhanh chóng.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Chúng tôi cung cấp đa dạng các phương thức thanh toán để phù hợp với mọi nhu cầu: 
                                            <strong>COD (Thanh toán khi nhận hàng)</strong> cho những ai muốn kiểm tra sản phẩm trước, 
                                            <strong>PayPal</strong> cho khách hàng quốc tế hoặc những ai ưa thích thanh toán online, 
                                            và <strong>VNPay</strong> - giải pháp thanh toán phổ biến tại Việt Nam. 
                                            Tất cả đều được bảo mật cao, đảm bảo thông tin tài chính của bạn được bảo vệ tuyệt đối.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '30px',
                                            marginBottom: '15px'
                                        }}>
                                            Chính Sách Đổi Trả Và Bảo Hành Linh Hoạt
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> cam kết mang đến sự hài lòng tuyệt đối cho khách hàng. 
                                            Nếu bạn không hài lòng với sản phẩm đã mua, chúng tôi có chính sách đổi trả linh hoạt 
                                            trong vòng 7 ngày kể từ ngày nhận hàng. Đội ngũ chăm sóc khách hàng của chúng tôi 
                                            luôn sẵn sàng hỗ trợ bạn trong mọi tình huống, đảm bảo mọi vấn đề đều được giải quyết 
                                            một cách nhanh chóng và thỏa đáng.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Với mạng lưới đối tác vận chuyển rộng khắp, <strong>F5 Mart</strong> có thể giao hàng 
                                            đến mọi tỉnh thành trên cả nước. Thời gian giao hàng thông thường từ 1-3 ngày làm việc, 
                                            tùy thuộc vào địa điểm nhận hàng. Đối với các đơn hàng trong nội thành, 
                                            chúng tôi có thể giao hàng trong ngày nếu đặt hàng trước 12 giờ trưa.
                                        </p>
                                        <p style={{ marginBottom: '20px', fontStyle: 'italic', color: '#666' }}>
                                            Hãy khám phá ngay <strong>F5 Mart</strong> - <strong>Shop online uy tín</strong> hàng đầu Việt Nam 
                                            và trải nghiệm dịch vụ <strong>mua hàng online</strong> chất lượng cao ngay hôm nay! 
                                            Với hàng ngàn sản phẩm đa dạng, giá cả hợp lý và dịch vụ giao hàng tận nơi, 
                                            F5 Mart chắc chắn sẽ là điểm đến lý tưởng cho mọi nhu cầu mua sắm của bạn. 
                                            Đăng ký ngay để nhận các ưu đãi đặc biệt và cập nhật thông tin về sản phẩm mới nhất!
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Danh Mục Sản Phẩm Đa Dạng Tại F5 Mart
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> tự hào mang đến cho khách hàng một bộ sưu tập sản phẩm phong phú và đa dạng, 
                                            đáp ứng mọi nhu cầu mua sắm hàng ngày. Từ <strong>thực phẩm tươi sống</strong> đến các mặt hàng 
                                            <strong>đồ uống</strong>, từ <strong>rau củ quả</strong> tươi ngon đến các sản phẩm <strong>đóng gói</strong>, 
                                            chúng tôi có tất cả những gì bạn cần cho một bữa ăn ngon miệng và đầy đủ dinh dưỡng.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Khi mua sắm tại <strong>F5 Mart</strong>, bạn sẽ được trải nghiệm một không gian <strong>mua sắm online</strong> 
                                            được tổ chức một cách khoa học và dễ dàng tìm kiếm. Mỗi danh mục sản phẩm đều được phân loại rõ ràng, 
                                            giúp khách hàng nhanh chóng tìm thấy những gì mình cần. Hệ thống tìm kiếm thông minh của chúng tôi 
                                            cho phép bạn tìm kiếm sản phẩm theo tên, thương hiệu, giá cả hoặc các tiêu chí khác một cách dễ dàng.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Lợi Ích Khi Mua Sắm Online Tại F5 Mart
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            Việc <strong>mua sắm trực tuyến</strong> tại <strong>F5 Mart</strong> mang lại nhiều lợi ích vượt trội 
                                            so với mua sắm truyền thống. Bạn có thể mua sắm mọi lúc, mọi nơi mà không cần phải di chuyển đến cửa hàng. 
                                            Điều này đặc biệt tiện lợi trong thời đại công nghệ số hiện nay, khi mọi người đều bận rộn với công việc 
                                            và cuộc sống hàng ngày.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Khi mua sắm tại <strong>F5 Mart</strong>, bạn sẽ tiết kiệm được rất nhiều thời gian và công sức. 
                                            Thay vì phải đi từ cửa hàng này sang cửa hàng khác để tìm kiếm sản phẩm, bạn chỉ cần ngồi tại nhà, 
                                            mở website hoặc ứng dụng của chúng tôi và đặt hàng. Sản phẩm sẽ được giao tận nơi một cách nhanh chóng và an toàn.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Ngoài ra, <strong>mua hàng online</strong> tại <strong>F5 Mart</strong> còn giúp bạn tiết kiệm chi phí. 
                                            Chúng tôi thường xuyên có các chương trình khuyến mãi, giảm giá và ưu đãi đặc biệt dành cho khách hàng. 
                                            Bạn có thể dễ dàng so sánh giá cả giữa các sản phẩm và lựa chọn những sản phẩm phù hợp nhất với ngân sách của mình.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Hệ Thống Bảo Mật Và An Toàn Thông Tin
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> hiểu rằng việc bảo vệ thông tin cá nhân và tài chính của khách hàng là vô cùng quan trọng. 
                                            Chính vì vậy, chúng tôi đã đầu tư vào một hệ thống bảo mật hiện đại, đảm bảo mọi giao dịch đều được mã hóa 
                                            và bảo vệ an toàn. Khi <strong>mua sắm online</strong> tại <strong>F5 Mart</strong>, bạn có thể hoàn toàn yên tâm 
                                            về tính bảo mật của thông tin cá nhân và phương thức thanh toán.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Hệ thống thanh toán của chúng tôi được tích hợp với các đối tác uy tín như PayPal và VNPay, 
                                            đảm bảo mọi giao dịch đều được xử lý một cách an toàn và nhanh chóng. Chúng tôi không lưu trữ thông tin 
                                            thẻ tín dụng của khách hàng, mọi giao dịch đều được xử lý trực tiếp thông qua các cổng thanh toán bảo mật.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Câu Chuyện Về F5 Mart
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> được thành lập với sứ mệnh mang đến cho người tiêu dùng Việt Nam một trải nghiệm 
                                            <strong>mua sắm trực tuyến</strong> tốt nhất. Chúng tôi tin rằng mọi người đều xứng đáng được tiếp cận với 
                                            những sản phẩm chất lượng cao với giá cả hợp lý, bất kể họ sống ở đâu hay có điều kiện kinh tế như thế nào.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Trong suốt quá trình phát triển, <strong>F5 Mart</strong> luôn không ngừng cải thiện dịch vụ và mở rộng danh mục sản phẩm 
                                            để đáp ứng nhu cầu ngày càng cao của khách hàng. Chúng tôi hợp tác với các nhà cung cấp uy tín, 
                                            đảm bảo mọi sản phẩm đều được kiểm tra chất lượng kỹ lưỡng trước khi đến tay khách hàng.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Đội ngũ nhân viên của <strong>F5 Mart</strong> là những người tận tâm, nhiệt tình và chuyên nghiệp. 
                                            Họ luôn sẵn sàng lắng nghe phản hồi từ khách hàng và không ngừng cải thiện dịch vụ để mang lại 
                                            trải nghiệm <strong>mua sắm online</strong> tốt nhất. Chúng tôi tin rằng sự hài lòng của khách hàng 
                                            chính là động lực để chúng tôi tiếp tục phát triển và hoàn thiện.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Tại Sao Khách Hàng Tin Tưởng F5 Mart?
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> đã và đang nhận được sự tin tưởng từ hàng ngàn khách hàng trên khắp Việt Nam. 
                                            Điều này không chỉ đến từ chất lượng sản phẩm mà còn từ dịch vụ chăm sóc khách hàng tận tâm của chúng tôi. 
                                            Mỗi đơn hàng đều được xử lý cẩn thận, mỗi khách hàng đều được đối xử với sự tôn trọng và chuyên nghiệp.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Chúng tôi cam kết minh bạch trong mọi giao dịch, từ giá cả đến chất lượng sản phẩm. 
                                            Khách hàng luôn được cung cấp đầy đủ thông tin về sản phẩm, bao gồm nguồn gốc, thành phần, 
                                            hạn sử dụng và các thông tin quan trọng khác. Điều này giúp khách hàng đưa ra quyết định mua sắm 
                                            một cách thông minh và tự tin.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            <strong>F5 Mart</strong> không chỉ là một <strong>cửa hàng trực tuyến</strong>, mà còn là người bạn đồng hành 
                                            đáng tin cậy trong cuộc sống hàng ngày của bạn. Chúng tôi hiểu rằng mỗi sản phẩm bạn mua đều có ý nghĩa, 
                                            và chúng tôi cam kết mang đến những sản phẩm tốt nhất để góp phần làm cho cuộc sống của bạn trở nên tốt đẹp hơn.
                                        </p>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginTop: '40px',
                                            marginBottom: '15px'
                                        }}>
                                            Hướng Dẫn Mua Sắm Tại F5 Mart
                                        </h3>
                                        <p style={{ marginBottom: '20px' }}>
                                            Để có trải nghiệm <strong>mua sắm online</strong> tốt nhất tại <strong>F5 Mart</strong>, 
                                            chúng tôi khuyên bạn nên làm theo các bước sau: Đầu tiên, hãy tạo tài khoản trên website của chúng tôi 
                                            để nhận được các ưu đãi đặc biệt và cập nhật thông tin về sản phẩm mới. Tiếp theo, bạn có thể duyệt 
                                            qua các danh mục sản phẩm hoặc sử dụng công cụ tìm kiếm để tìm sản phẩm mình cần.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Khi đã tìm thấy sản phẩm yêu thích, hãy xem kỹ thông tin chi tiết về sản phẩm, bao gồm mô tả, 
                                            hình ảnh, giá cả và các đánh giá từ khách hàng khác. Sau đó, bạn có thể thêm sản phẩm vào giỏ hàng 
                                            và tiếp tục mua sắm hoặc tiến hành thanh toán ngay. Trong quá trình thanh toán, bạn sẽ được yêu cầu 
                                            nhập thông tin giao hàng và chọn phương thức thanh toán phù hợp.
                                        </p>
                                        <p style={{ marginBottom: '20px' }}>
                                            Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận đơn hàng. Chúng tôi sẽ xử lý đơn hàng 
                                            và giao hàng đến địa chỉ bạn đã cung cấp trong thời gian sớm nhất. Bạn có thể theo dõi trạng thái 
                                            đơn hàng thông qua tài khoản của mình hoặc liên hệ với bộ phận chăm sóc khách hàng nếu có bất kỳ thắc mắc nào.
                                        </p>
                                        <p style={{ marginBottom: '0', fontStyle: 'italic', color: '#666', marginTop: '30px' }}>
                                            Hãy bắt đầu hành trình <strong>mua sắm trực tuyến</strong> của bạn ngay hôm nay với <strong>F5 Mart</strong>! 
                                            Chúng tôi cam kết mang đến cho bạn những trải nghiệm tuyệt vời nhất với sản phẩm chất lượng, 
                                            giá cả hợp lý và dịch vụ chăm sóc khách hàng tận tâm. Đăng ký ngay để nhận các ưu đãi đặc biệt 
                                            và trở thành một phần của cộng đồng khách hàng hài lòng của <strong>F5 Mart</strong>!
                                        </p>
                                    </div>
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
