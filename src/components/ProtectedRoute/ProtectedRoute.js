import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { path } from '../../utils/constant';

/**
 * ProtectedRoute - Component để bảo vệ các route cần đăng nhập
 * Nếu chưa đăng nhập, redirect về trang login và lưu path hiện tại để redirect lại sau khi đăng nhập
 */
const ProtectedRoute = ({ 
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
                                       (localStorage.getItem('userInfo') && localStorage.getItem('accessToken'));
                
                if (isAuthenticated) {
                    return <Component {...props} />;
                } else {
                    // Lưu path hiện tại để redirect lại sau khi đăng nhập
                    return (
                        <Redirect
                            to={{
                                pathname: path.LOGIN,
                                state: { from: props.location.pathname }
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

export default connect(mapStateToProps)(ProtectedRoute);

