import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { path } from '../../utils/constant';
import { isAdmin } from '../../utils/authHelper';

/**
 * UserOnlyRoute - Component để đảm bảo admin không thể truy cập các trang user
 * Nếu user là admin, tự động redirect về trang admin
 */
const UserOnlyRoute = ({ 
    component: Component, 
    isLoggedIn, 
    userInfo,
    ...rest 
}) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                // Kiểm tra nếu user là admin
                const userIsAdmin = isAdmin();
                
                if (userIsAdmin) {
                    // Nếu là admin, redirect về trang admin
                    return (
                        <Redirect
                            to={{
                                pathname: path.ADMIN_PRODUCT_MANAGE
                            }}
                        />
                    );
                }
                
                // Nếu không phải admin, cho phép truy cập
                return <Component {...props} />;
            }}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

export default connect(mapStateToProps)(UserOnlyRoute);

