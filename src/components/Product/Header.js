import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCartItemCount } from '../../services/cartService';
import { userLogout } from '../../store/actions';
import { path } from '../../utils/constant';
import './Header.scss';
import logo from "../../imgs/logo_F5.png";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cartItemCount: 0
        }
    }

    componentDidMount() {
        this.updateCartCount();
        window.addEventListener('cartUpdated', this.updateCartCount);
    }

    componentDidUpdate(prevProps) {
        // Cập nhật giỏ hàng khi user thay đổi (đăng nhập/đăng xuất)
        if (prevProps.userInfo !== this.props.userInfo) {
            this.updateCartCount();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('cartUpdated', this.updateCartCount);
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

    handleRedirectToHome = () => {
        if (this.props.history) {
            this.props.history.push('/home');
        }
    }

    handleRedirectToCart = () => {
        if (this.props.history) {
            this.props.history.push('/cart');
        }
    }

    render() {
        return (
            <div className='home-header-container'>
                <div className='home-header-content'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-3'>
                                <div className='content-left'>
                                    <div className="site-logo" onClick={this.handleRedirectToHome} style={{ cursor: 'pointer' }}>
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
                                            <li className="menu-icon" onClick={this.handleRedirectToHome}>Home + </li>
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
                                                <span className='text-selection' onClick={() => this.props.history.push('/product')}>
                                                    Shop +
                                                </span>
                                                <ul className='list-action-shop'>
                                                    <li className='item-action' onClick={this.handleRedirectToCart}> Cart </li>
                                                    <li className='item-action' onClick={() => this.props.history.push('/checkout')}> Checkout </li>
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
                                                        <span className='user-name' style={{ cursor: 'pointer', color: 'white' }}>
                                                            {this.props.userInfo.user.full_name || this.props.userInfo.user.email || 'User'}
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
                                        <div className="mini-cart-icon" onClick={this.handleRedirectToCart} style={{ cursor: 'pointer' }}>
                                            <i className="fas fa-shopping-cart"></i>
                                            {this.state.cartItemCount > 0 && (
                                                <sup>{this.state.cartItemCount}</sup>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));

