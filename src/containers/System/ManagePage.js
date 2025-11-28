import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductManage from './ProductManage';
import UserManage from './UserManage';
import CategoryManage from './CategoryManage';
import OrderManage from './OrderManage';
import { userLogout } from '../../store/actions';
import { getUserInfo } from '../../utils/authHelper';
import { path } from '../../utils/constant';
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
        } else if (path.includes('order-manage')) {
            activeTab = 'orders';
        }
        
        this.state = {
            activeTab: activeTab,
            showProfileDropdown: false
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
            } else if (currentPath.includes('order-manage')) {
                this.setState({ activeTab: 'orders' });
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
        } else if (tab === 'orders') {
            this.props.history.push('/system/order-manage');
        } else {
            this.props.history.push('/system/product-manage');
        }
    }

    toggleProfileDropdown = () => {
        this.setState(prevState => ({
            showProfileDropdown: !prevState.showProfileDropdown
        }));
    }

    handleLogout = () => {
        // Đóng dropdown
        this.setState({ showProfileDropdown: false });
        
        // Logout
        this.props.userLogout();
        toast.success('Đăng xuất thành công!');
        
        // Redirect về trang login
        setTimeout(() => {
            this.props.history.push(path.LOGIN);
        }, 500);
    }

    // Đóng dropdown khi click bên ngoài
    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        if (this.profileRef && !this.profileRef.contains(event.target)) {
            this.setState({ showProfileDropdown: false });
        }
    }

    // Lấy lastname từ fullName
    getLastName = (fullName) => {
        if (!fullName || typeof fullName !== 'string') return 'Admin';
        
        // Tách tên thành mảng các từ
        const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
        
        // Lấy phần cuối cùng (lastname)
        return nameParts.length > 0 ? nameParts[nameParts.length - 1] : 'Admin';
    }

    render() {
        const { activeTab, showProfileDropdown } = this.state;
        
        // Ưu tiên lấy từ Redux state, fallback về localStorage
        const userInfo = this.props.userInfo || getUserInfo();
        
        // Lấy user object (có thể là userInfo.user hoặc userInfo trực tiếp)
        const user = userInfo?.user || userInfo || {};
        
        // Kiểm tra nhiều trường hợp có thể có full_name
        const fullName = user.full_name || 
                        user.fullName || 
                        user.name ||
                        userInfo?.full_name ||
                        userInfo?.fullName ||
                        userInfo?.name ||
                        '';
        
        // Debug log để kiểm tra (có thể xóa sau)
        if (process.env.NODE_ENV === 'development') {
            console.log('Redux UserInfo:', this.props.userInfo);
            console.log('LocalStorage UserInfo:', getUserInfo());
            console.log('Final UserInfo:', userInfo);
            console.log('User:', user);
            console.log('FullName:', fullName);
        }
        
        const adminName = this.getLastName(fullName);

        return (
            <div className="manage-page-container">
                <div className="manage-sidebar">
                    <div className="sidebar-header">
                        <h3>Admin Panel</h3>
                    </div>
                    <div className="sidebar-profile" ref={ref => this.profileRef = ref}>
                        <div className="profile-button" onClick={this.toggleProfileDropdown}>
                            <div className="profile-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div className="profile-info">
                                <span className="profile-name">{adminName}</span>
                                <span className="profile-role">Administrator</span>
                            </div>
                            <div className="profile-arrow">
                                <i className={`fas fa-chevron-${showProfileDropdown ? 'up' : 'down'}`}></i>
                            </div>
                        </div>
                        {showProfileDropdown && (
                            <div className="profile-dropdown">
                                <div className="dropdown-item" onClick={this.handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Đăng xuất</span>
                                </div>
                            </div>
                        )}
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
                        <div 
                            className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('orders')}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Orders & Revenue</span>
                        </div>
                    </div>
                </div>
                <div className="manage-content">
                    {activeTab === 'products' ? (
                        <ProductManage key="products" />
                    ) : activeTab === 'categories' ? (
                        <CategoryManage key="categories" />
                    ) : activeTab === 'orders' ? (
                        <OrderManage key="orders" />
                    ) : (
                        <UserManage key="users" />
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        userLogout: () => dispatch(userLogout())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ManagePage));

