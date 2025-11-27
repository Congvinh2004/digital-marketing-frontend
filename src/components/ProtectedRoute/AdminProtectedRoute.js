import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { path } from '../../utils/constant';
import { isAdmin, isUserLoggedIn } from '../../utils/authHelper';

/**
 * AdminProtectedRoute - Component để bảo vệ các route chỉ dành cho admin
 * Nếu chưa đăng nhập hoặc không phải admin, redirect về trang login hoặc home
 */
const AdminProtectedRoute = ({ 
    component: Component, 
    isLoggedIn, 
    userInfo, 
    accessToken,
    ...rest 
}) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                // Kiểm tra đăng nhập từ Redux state hoặc localStorage
                const isAuthenticated = (isLoggedIn && userInfo && accessToken) || 
                                       isUserLoggedIn();
                
                // Kiểm tra role admin
                const userIsAdmin = isAdmin();
                
                if (isAuthenticated && userIsAdmin) {
                    return <Component {...props} />;
                } else if (!isAuthenticated) {
                    // Chưa đăng nhập, redirect về login
                    return (
                        <Redirect
                            to={{
                                pathname: path.LOGIN,
                                state: { from: props.location.pathname }
                            }}
                        />
                    );
                } else {
                    // Đã đăng nhập nhưng không phải admin, redirect về home
                    return (
                        <Redirect
                            to={{
                                pathname: path.HOMEPAGE
                            }}
                        />
                    );
                }
            }}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        accessToken: state.user.accessToken
    };
};

export default connect(mapStateToProps)(AdminProtectedRoute);

