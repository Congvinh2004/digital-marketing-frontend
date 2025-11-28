import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import ManagePage from '../containers/System/ManagePage';
import RegisterPackageGroupOrAcc from '../containers/System/RegisterPackageGroupOrAcc';
import AdminProtectedRoute from '../components/ProtectedRoute/AdminProtectedRoute';

class System extends Component {
    render() {
        const { systemMenuPath } = this.props;
        return (
            <div className="system-container">
                <div className="system-list">
                    <Switch>
                        <AdminProtectedRoute path="/system/user-manage" exact component={ManagePage} />
                        <AdminProtectedRoute path="/system/product-manage" exact component={ManagePage} />
                        <AdminProtectedRoute path="/system/category-manage" exact component={ManagePage} />
                        <AdminProtectedRoute path="/system/order-manage" exact component={ManagePage} />
                        <AdminProtectedRoute path="/system/register-package-group-or-account" component={RegisterPackageGroupOrAcc} />
                        <Route path="/system" exact component={() => { return (<Redirect to={systemMenuPath || '/system/product-manage'} />) }} />
                        <Route component={() => { return (<Redirect to={systemMenuPath || '/system/product-manage'} />) }} />
                    </Switch>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        systemMenuPath: state.app.systemMenuPath
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
