import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.scss';
import { login, register } from '../../services/authService';
import { userLoginSuccess } from '../../store/actions';
import { isAdmin } from '../../utils/authHelper';
import { path } from '../../utils/constant';
import logo from "../../imgs/logo_F5.png";

class Auth extends Component {
    constructor(props) {
        super(props);
        // Kiểm tra xem có phải route register không
        const isRegister = this.props.location?.pathname === '/register';
        
        this.state = {
            activeTab: isRegister ? 'register' : 'login',
            // Login state
            email: '',
            password: '',
            showPassword: false,
            rememberMe: false,
            // Register state
            fullName: '',
            phone: '',
            confirmPassword: '',
            // Common
            errors: {},
            isLoading: false
        }
        
        // Load remember me data nếu có
        this.loadRememberedEmail();
    }

    componentDidMount() {
        // Kiểm tra route để set tab
        const isRegister = this.props.location?.pathname === '/register';
        if (isRegister) {
            this.setState({ activeTab: 'register' });
        }
        
        // Kiểm tra token hết hạn từ query param
        const urlParams = new URLSearchParams(this.props.location?.search);
        if (urlParams.get('expired') === 'true') {
            toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
    }
    
    loadRememberedEmail = () => {
        try {
            const rememberedEmail = localStorage.getItem('rememberedEmail');
            if (rememberedEmail) {
                this.setState({ 
                    email: rememberedEmail,
                    rememberMe: true 
                });
            }
        } catch (error) {
            console.error('Error loading remembered email:', error);
        }
    }

    componentDidUpdate(prevProps) {
        // Update tab khi route thay đổi
        if (prevProps.location?.pathname !== this.props.location?.pathname) {
            const isRegister = this.props.location?.pathname === '/register';
            this.setState({ 
                activeTab: isRegister ? 'register' : 'login',
                errors: {},
                email: '',
                password: '',
                fullName: '',
                phone: '',
                confirmPassword: ''
            });
        }
    }

    switchTab = (tab) => {
        this.setState({ 
            activeTab: tab,
            errors: {},
            email: '',
            password: '',
            fullName: '',
            phone: '',
            confirmPassword: ''
        });
        // Update URL
        if (tab === 'register') {
            this.props.history.push('/register');
        } else {
            this.props.history.push('/login');
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
            errors: { ...this.state.errors, [name]: '' }
        });
    }

    validateLoginForm = () => {
        const { email, password } = this.state;
        const errors = {};

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    validateRegisterForm = () => {
        const { email, password, confirmPassword, fullName, phone } = this.state;
        const errors = {};

        if (!fullName.trim()) {
            errors.fullName = 'Vui lòng nhập họ và tên';
        }

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!phone.trim()) {
            errors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    handleLogin = async (e) => {
        e.preventDefault();
        
        if (!this.validateLoginForm()) {
            return;
        }

        try {
            this.setState({ isLoading: true });
            const { email, password } = this.state;

            const response = await login({ email, password });
            
            if (response && (response.errCode === 0 || response.success)) {
                if (response.data) {
                    const userInfo = response.data;
                    // Thử nhiều cách để lấy token
                    const accessToken = userInfo.accessToken || 
                                      userInfo.token || 
                                      response.accessToken || 
                                      response.token || 
                                      response.data?.accessToken ||
                                      response.data?.token ||
                                      '';
                    
                    if (!accessToken || accessToken.trim() === '') {
                        console.error('No accessToken in login response:', response);
                        toast.error('Đăng nhập thành công nhưng không nhận được token. Vui lòng thử lại.');
                        return;
                    }
                    
                    console.log('Saving accessToken to localStorage:', accessToken.substring(0, 20) + '...');
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    localStorage.setItem('accessToken', accessToken);
                    
                    // Xử lý Remember Me
                    if (this.state.rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    
                    // Dispatch Redux action
                    this.props.userLoginSuccess(userInfo, accessToken);
                }
                
                toast.success('Đăng nhập thành công!');
                
                // Đảm bảo token đã được lưu trước khi redirect
                const savedToken = localStorage.getItem('accessToken');
                if (!savedToken || savedToken.trim() === '') {
                    console.error('Token was not saved properly after login');
                    toast.error('Có lỗi xảy ra khi lưu thông tin đăng nhập. Vui lòng thử lại.');
                    return;
                }
                
                console.log('Token saved successfully, checking user role...');
                
                // Kiểm tra role và redirect tương ứng
                let redirectPath = this.props.location?.state?.from || '/home';
                
                // Nếu user là admin, redirect về trang admin
                if (isAdmin()) {
                    console.log('User is admin, redirecting to admin page...');
                    redirectPath = path.ADMIN_PRODUCT_MANAGE;
                } else {
                    console.log('User is not admin, redirecting to:', redirectPath);
                }
                
                setTimeout(() => {
                    // Force reload nếu redirect về checkout hoặc admin để đảm bảo component được refresh
                    if (redirectPath === '/checkout' || redirectPath.startsWith('/system')) {
                        window.location.href = redirectPath;
                    } else {
                        this.props.history.push(redirectPath);
                    }
                }, 1000);
            } else {
                toast.error(response.errMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.errMessage || 'Đăng nhập thất bại. Vui lòng thử lại!');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    handleRegister = async (e) => {
        e.preventDefault();
        
        if (!this.validateRegisterForm()) {
            return;
        }

        try {
            this.setState({ isLoading: true });
            const { email, password, fullName, phone } = this.state;

            const registerData = {
                email,
                password,
                fullName,
                phone
            };

            const response = await register(registerData);
            
            if (response && (response.errCode === 0 || response.success)) {
                // Lưu thông tin đăng ký tạm thời để verify OTP
                // Lưu ý: Lưu password trong sessionStorage có rủi ro bảo mật, 
                // nhưng backend yêu cầu password gốc để hash khi verify OTP
                // Giải pháp: Xóa ngay sau khi verify thành công
                sessionStorage.setItem('registerEmail', email);
                sessionStorage.setItem('registerPassword', password);
                if (fullName) {
                    sessionStorage.setItem('registerFullName', fullName);
                }
                if (phone) {
                    sessionStorage.setItem('registerPhone', phone);
                }
                
                toast.success('Đăng ký thành công! Vui lòng xác thực OTP');
                this.props.history.push('/verify-otp');
            } else {
                toast.error(response.errMessage || 'Đăng ký thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Register error:', error);
            toast.error(error.response?.data?.errMessage || 'Đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    toggleShowPassword = () => {
        this.setState(prevState => ({
            showPassword: !prevState.showPassword
        }));
    }

    render() {
        const { activeTab, email, password, fullName, phone, confirmPassword, errors, isLoading, showPassword } = this.state;

        return (
            <div className='auth-container'>
                <div className='auth-wrapper'>
                    <div className='auth-header'>
                        <div className='logo' onClick={() => this.props.history.push('/home')}>
                            <img src={logo} alt="Logo" />
                        </div>
                    </div>

                    <div className='auth-content'>
                        <div className='auth-card'>
                            {/* Tabs */}
                            <div className='auth-tabs'>
                                <button
                                    className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                                    onClick={() => this.switchTab('login')}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                                    onClick={() => this.switchTab('register')}
                                >
                                    Đăng ký
                                </button>
                            </div>

                            {/* Login Form */}
                            {activeTab === 'login' && (
                                <>
                                    <h2 className='auth-title'>Đăng nhập</h2>
                                    <form onSubmit={this.handleLogin}>
                                        <div className='form-group'>
                                            <label>Email *</label>
                                            <input
                                                type='email'
                                                name='email'
                                                value={email}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập email của bạn'
                                                className={errors.email ? 'error' : ''}
                                            />
                                            {errors.email && <span className='error-message'>{errors.email}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Mật khẩu *</label>
                                            <div className='password-input-wrapper'>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name='password'
                                                    value={password}
                                                    onChange={this.handleInputChange}
                                                    placeholder='Nhập mật khẩu'
                                                    className={errors.password ? 'error' : ''}
                                                />
                                                <span 
                                                    className='password-toggle'
                                                    onClick={this.toggleShowPassword}
                                                >
                                                    <i className={showPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                                                </span>
                                            </div>
                                            {errors.password && <span className='error-message'>{errors.password}</span>}
                                        </div>

                                        <div className='form-options'>
                                            <label className='remember-me'>
                                                <input 
                                                    type='checkbox' 
                                                    checked={this.state.rememberMe}
                                                    onChange={(e) => this.setState({ rememberMe: e.target.checked })}
                                                />
                                                <span>Ghi nhớ đăng nhập</span>
                                            </label>
                                            <span 
                                                className='forgot-password link'
                                                onClick={() => this.props.history.push('/forgot-password')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Quên mật khẩu?
                                            </span>
                                        </div>

                                        <button
                                            type='submit'
                                            className='btn btn-primary btn-block'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                        </button>
                                    </form>

                                    <div className='auth-divider'>
                                        <span>Hoặc</span>
                                    </div>

                                    <div className='social-login'>
                                        <button type='button' className='btn btn-social btn-google'>
                                            <i className="fab fa-google"></i>
                                            Đăng nhập với Google
                                        </button>
                                        <button type='button' className='btn btn-social btn-facebook'>
                                            <i className="fab fa-facebook-f"></i>
                                            Đăng nhập với Facebook
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Register Form */}
                            {activeTab === 'register' && (
                                <>
                                    <h2 className='auth-title'>Đăng ký tài khoản</h2>
                                    <p className='auth-subtitle'>Tạo tài khoản mới để bắt đầu mua sắm</p>

                                    <form onSubmit={this.handleRegister}>
                                        <div className='form-group'>
                                            <label>Họ và tên *</label>
                                            <input
                                                type='text'
                                                name='fullName'
                                                value={fullName}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập họ và tên'
                                                className={errors.fullName ? 'error' : ''}
                                            />
                                            {errors.fullName && <span className='error-message'>{errors.fullName}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Email *</label>
                                            <input
                                                type='email'
                                                name='email'
                                                value={email}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập email'
                                                className={errors.email ? 'error' : ''}
                                            />
                                            {errors.email && <span className='error-message'>{errors.email}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Số điện thoại *</label>
                                            <input
                                                type='tel'
                                                name='phone'
                                                value={phone}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập số điện thoại'
                                                className={errors.phone ? 'error' : ''}
                                            />
                                            {errors.phone && <span className='error-message'>{errors.phone}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Mật khẩu *</label>
                                            <input
                                                type='password'
                                                name='password'
                                                value={password}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập mật khẩu (tối thiểu 6 ký tự)'
                                                className={errors.password ? 'error' : ''}
                                            />
                                            {errors.password && <span className='error-message'>{errors.password}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Xác nhận mật khẩu *</label>
                                            <input
                                                type='password'
                                                name='confirmPassword'
                                                value={confirmPassword}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập lại mật khẩu'
                                                className={errors.confirmPassword ? 'error' : ''}
                                            />
                                            {errors.confirmPassword && <span className='error-message'>{errors.confirmPassword}</span>}
                                        </div>

                                        <button
                                            type='submit'
                                            className='btn btn-primary btn-block'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        userLoginSuccess: (userInfo, accessToken) => dispatch(userLoginSuccess(userInfo, accessToken))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Auth));

