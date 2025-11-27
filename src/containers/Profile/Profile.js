import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateUser } from '../../services/userService';
import { setUserInfo } from '../../store/actions';
import Header from '../../components/Product/Header';
import './Profile.scss';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            isLoading: false
        };
    }

    componentDidMount() {
        // Kiểm tra đăng nhập
        if (!this.props.userInfo || !this.props.accessToken) {
            toast.error('Vui lòng đăng nhập để xem thông tin cá nhân');
            this.props.history.push('/login');
            return;
        }

        // Load thông tin user hiện tại
        this.loadUserData();
    }

    loadUserData = () => {
        const userInfo = this.props.userInfo;
        const user = userInfo?.user || userInfo || {};
        
        this.setState({
            fullName: user.full_name || user.fullName || user.name || '',
            email: user.email || '',
            phone: user.phone || user.phoneNumber || user.phone_number || '',
            password: '',
            confirmPassword: ''
        });
    }

    handleOnChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    }

    checkValidateInput = () => {
        const { fullName, phone, password, confirmPassword } = this.state;

        if (!fullName.trim()) {
            toast.error('Vui lòng nhập họ và tên');
            return false;
        }

        if (!phone.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return false;
        } else if (!/^[0-9]{10,11}$/.test(phone)) {
            toast.error('Số điện thoại phải có 10-11 chữ số');
            return false;
        }

        // Nếu có nhập password thì phải xác nhận
        if (password || confirmPassword) {
            if (password.length < 6) {
                toast.error('Mật khẩu phải có ít nhất 6 ký tự');
                return false;
            }
            if (password !== confirmPassword) {
                toast.error('Mật khẩu xác nhận không khớp');
                return false;
            }
        }

        return true;
    }

    handleUpdateProfile = async () => {
        if (!this.checkValidateInput()) {
            return;
        }

        const userInfo = this.props.userInfo;
        const user = userInfo?.user || userInfo || {};
        const userId = user.id || user.userID || user.user_id;

        if (!userId) {
            toast.error('Không tìm thấy thông tin user');
            return;
        }

        try {
            this.setState({ isLoading: true });

            const { fullName, phone, password } = this.state;
            const updateData = {
                full_name: fullName,
                phone: phone
            };

            // Chỉ thêm password nếu có nhập
            if (password) {
                updateData.password = password;
            }

            const response = await updateUser(userId, updateData);

            if (response && response.errCode === 0) {
                // Cập nhật userInfo trong Redux và localStorage
                const updatedUserInfo = {
                    ...userInfo,
                    user: {
                        ...user,
                        ...response.data
                    }
                };

                // Cập nhật localStorage
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                // Cập nhật Redux
                this.props.setUserInfo(updatedUserInfo, this.props.accessToken);

                toast.success('Cập nhật thông tin thành công!');
                
                // Reset password fields
                this.setState({
                    password: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(response.errMessage || 'Cập nhật thông tin thất bại');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.errMessage || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { fullName, email, phone, password, confirmPassword, isLoading } = this.state;
        const userInfo = this.props.userInfo;
        const user = userInfo?.user || userInfo || {};

        return (
            <div className="profile-container">
                <Header />
                <div className="profile-content">
                    <div className="container">
                        <div className="profile-wrapper">
                            <div className="profile-header">
                                <h2>Thông Tin Cá Nhân</h2>
                                <p>Quản lý thông tin tài khoản của bạn</p>
                            </div>

                            <div className="profile-form">
                                <div className="form-section">
                                    <h3>Thông Tin Cơ Bản</h3>
                                    
                                    <div className="form-group">
                                        <label>Email <span className="required">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            disabled
                                            className="form-control disabled"
                                            placeholder="Email"
                                        />
                                        <small className="form-text text-muted">
                                            Email không thể thay đổi
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>Họ và Tên <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={fullName}
                                            onChange={this.handleOnChange}
                                            className="form-control"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Số Điện Thoại <span className="required">*</span></label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={phone}
                                            onChange={this.handleOnChange}
                                            className="form-control"
                                            placeholder="Nhập số điện thoại (10-11 chữ số)"
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Đổi Mật Khẩu</h3>
                                    <p className="section-description">
                                        Để trống nếu không muốn thay đổi mật khẩu
                                    </p>

                                    <div className="form-group">
                                        <label>Mật Khẩu Mới</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={password}
                                            onChange={this.handleOnChange}
                                            className="form-control"
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Xác Nhận Mật Khẩu</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={this.handleOnChange}
                                            className="form-control"
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.handleUpdateProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Đang cập nhật...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Lưu Thay Đổi
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => this.props.history.push('/home')}
                                    >
                                        <i className="fas fa-times"></i> Hủy
                                    </button>
                                </div>
                            </div>

                            <div className="profile-info">
                                <div className="info-card">
                                    <div className="info-item">
                                        <span className="info-label">Vai trò:</span>
                                        <span className="info-value">
                                            {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Trạng thái:</span>
                                        <span className={`info-value status ${user.status || 'active'}`}>
                                            {user.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}
                                        </span>
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
        userInfo: state.user.userInfo,
        accessToken: state.user.accessToken
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setUserInfo: (userInfo, accessToken) => dispatch(setUserInfo(userInfo, accessToken))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Profile));


