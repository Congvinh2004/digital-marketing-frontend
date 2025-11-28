import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer, toast } from 'react-toastify';
import HomePage from './HomePage/HomePage.js'
import CustomScrollbars from '../components/CustomScrollbars.js';
import { userIsAuthenticated, userIsNotAuthenticated } from '../hoc/authentication';
import { path } from '../utils'
import Home from '../routes/Home';
import Login from './Auth/Login';
import System from '../routes/System';
import HomeProduct from './Shop/HomeProduct.js';
import ProductDetail from './Shop/ProductDetail.js';
import { CustomToastCloseButton } from '../components/CustomToast';
import Cart from './Shop/Cart.js';
import Checkout from './Shop/Checkout.js';
import Auth from './Auth/Auth.js';
import VerifyOTP from './Auth/VerifyOTP.js';
import ForgotPassword from './Auth/ForgotPassword.js';
import PaymentSuccess from './Payment/PaymentSuccess.js';
import PaymentCancel from './Payment/PaymentCancel.js';
import Profile from './Profile/Profile.js';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import UserOnlyRoute from '../components/ProtectedRoute/UserOnlyRoute';
import { setUserInfo, userLogout } from '../store/actions';
import ZaloChatWidget from '../components/Common/ZaloChatWidget';
import TalkToWidget from '../components/Common/TalkToWidget';
// import { validateToken } from '../services/authService'; // Tạm thời comment vì backend chưa có API



class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
        // Cleanup modal backdrop và body styles sau hot reload
        this.cleanupAfterHotReload();
        // Đồng bộ user info từ localStorage vào Redux
        this.syncUserFromLocalStorage();
        // Validate token khi app khởi động (tạm thời tắt vì backend chưa có API)
        // this.validateTokenOnMount();
    }
    
    // Tạm thời comment lại vì backend chưa có API validate-token
    // validateTokenOnMount = async () => {
    //     try {
    //         const accessToken = localStorage.getItem('accessToken');
    //         if (accessToken) {
    //             // Validate token với backend
    //             await validateToken();
    //             // Token hợp lệ, không cần làm gì
    //         }
    //     } catch (error) {
    //         // Kiểm tra xem có phải lỗi 404 (API chưa có) không
    //         const is404Error = error.httpStatusCode === 404 || 
    //                           (error.response && error.response.status === 404);
    //         
    //         if (is404Error) {
    //             // API validate-token chưa có, bỏ qua (không logout)
    //             console.warn('Validate token API not found (404). Skipping validation.');
    //             return;
    //         }
    //         
    //         // Token không hợp lệ hoặc hết hạn (lỗi khác 404)
    //         console.warn('Token validation failed:', error);
    //         // Xóa token và logout
    //         this.props.userLogout();
    //         // Chỉ hiển thị thông báo nếu không phải đang ở trang login
    //         if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    //             toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    //         }
    //     }
    // }

    syncUserFromLocalStorage = () => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            const accessToken = localStorage.getItem('accessToken');
            
            if (userInfoStr && accessToken) {
                const userInfo = JSON.parse(userInfoStr);
                // Chỉ sync nếu Redux state chưa có (tránh overwrite state đã được persist)
                if (!this.props.userInfo || !this.props.isLoggedIn) {
                    this.props.setUserInfo(userInfo, accessToken);
                }
            }
        } catch (error) {
            console.error('Error syncing user from localStorage:', error);
        }
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

    render() {
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        <Switch>
                            {/* Auth routes - không dùng CustomScrollbars */}
                            <Route path={path.LOGIN} component={Auth} />
                            <Route path={path.REGISTER} component={Auth} />
                            <Route path={path.VERIFY_OTP} component={VerifyOTP} />
                            <Route path={path.FORGOT_PASSWORD} component={ForgotPassword} />
                            <Route path={path.PAYMENT_SUCCESS} component={PaymentSuccess} />
                            <Route path={path.PAYMENT_CANCEL} component={PaymentCancel} />

                            {/* System routes - không dùng CustomScrollbars vì có sidebar riêng */}
                            <Route path={path.SYSTEM} component={(System)} />
                            
                            {/* Other routes - dùng CustomScrollbars */}
                            <Route render={() => (
                        <div className="content-container">
                            <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                                <Switch>
                                    <Route path={path.HOME} exact component={(Home)} />
                                    {/* URL thân thiện cho sản phẩm: /san-pham/:slug hoặc /product-detail/:id */}
                                    <UserOnlyRoute path="/san-pham/:slug" component={(ProductDetail)} />
                                    <UserOnlyRoute path={`${path.PRODUCT_DETAIL}/:id`} component={(ProductDetail)} />
                                    <UserOnlyRoute path={path.HOMEPRODUCT} component={(HomeProduct)} />
                                    {/* Protected routes - cần đăng nhập và chỉ dành cho user (không phải admin) */}
                                    <ProtectedRoute path={path.PROFILE} component={Profile} />
                                    <ProtectedRoute path={path.CART} component={Cart} />
                                    <ProtectedRoute path={path.CHECKOUT} component={Checkout} />
                                    <UserOnlyRoute path={path.HOMEPAGE} component={HomePage} />
                                </Switch>
                            </CustomScrollbars>
                                </div>
                            )} />
                        </Switch>
                        </div>

                        {/* <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        /> */}
                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                        <ZaloChatWidget zaloId="your-zalo-id" />
                        {/* TalkTo Chat Widget */}
                        <TalkToWidget 
                            propertyId="69280ab0cb59ac1958eadf1e"
                            widgetId="1jb26jgq8"
                        />
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setUserInfo: (userInfo, accessToken) => dispatch(setUserInfo(userInfo, accessToken)),
        userLogout: () => dispatch(userLogout())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);