import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { isAdmin } from '../utils/authHelper';
import { path } from '../utils/constant';

class Home extends Component {

    render() {
        // Kiểm tra nếu user là admin, redirect về trang admin
        if (isAdmin()) {
            return <Redirect to={path.ADMIN_PRODUCT_MANAGE} />;
        }

        // Nếu không phải admin, redirect về trang chủ
        return <Redirect to={path.HOMEPAGE} />;
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.admin.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
