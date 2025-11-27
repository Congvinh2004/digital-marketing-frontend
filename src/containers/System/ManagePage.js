import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ProductManage from './ProductManage';
import UserManage from './UserManage';
import CategoryManage from './CategoryManage';
import './ManagePage.scss';

class ManagePage extends Component {
    constructor(props) {
        super(props);
        // Lấy activeTab từ URL hoặc default là 'products'
        const path = props.location?.pathname || '';
        let activeTab = 'products';
        if (path.includes('user-manage')) {
            activeTab = 'users';
        } else if (path.includes('product-manage')) {
            activeTab = 'products';
        } else if (path.includes('category-manage')) {
            activeTab = 'categories';
        }
        
        this.state = {
            activeTab: activeTab
        };
    }

    componentDidUpdate(prevProps) {
        // Update activeTab khi route thay đổi
        const currentPath = this.props.location?.pathname || '';
        const prevPath = prevProps.location?.pathname || '';
        
        if (currentPath !== prevPath) {
            if (currentPath.includes('user-manage')) {
                this.setState({ activeTab: 'users' });
            } else if (currentPath.includes('product-manage')) {
                this.setState({ activeTab: 'products' });
            } else if (currentPath.includes('category-manage')) {
                this.setState({ activeTab: 'categories' });
            }
        }
    }

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab });
        // Update URL khi chuyển tab
        if (tab === 'users') {
            this.props.history.push('/system/user-manage');
        } else if (tab === 'categories') {
            this.props.history.push('/system/category-manage');
        } else {
            this.props.history.push('/system/product-manage');
        }
    }

    render() {
        const { activeTab } = this.state;

        return (
            <div className="manage-page-container">
                <div className="manage-sidebar">
                    <div className="sidebar-header">
                        <h3>Admin Panel</h3>
                    </div>
                    <div className="sidebar-menu">
                        <div 
                            className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('products')}
                        >
                            <i className="fas fa-box"></i>
                            <span>Products</span>
                        </div>
                        <div 
                            className={`menu-item ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('categories')}
                        >
                            <i className="fas fa-folder"></i>
                            <span>Categories</span>
                        </div>
                        <div 
                            className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('users')}
                        >
                            <i className="fas fa-users"></i>
                            <span>Users</span>
                        </div>
                    </div>
                </div>
                <div className="manage-content">
                    {activeTab === 'products' ? (
                        <ProductManage key="products" />
                    ) : activeTab === 'categories' ? (
                        <CategoryManage key="categories" />
                    ) : (
                        <UserManage key="users" />
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ManagePage));

