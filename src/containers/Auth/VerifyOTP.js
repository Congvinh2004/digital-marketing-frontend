import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.scss';
import { verifyOTP, resendOTP } from '../../services/authService';
import { userLoginSuccess } from '../../store/actions';
import { isAdmin } from '../../utils/authHelper';
import { path } from '../../utils/constant';
import logo from "../../imgs/logo_F5.png";

class VerifyOTP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: ['', '', '', '', '', ''],
            email: '',
            password: '',
            fullName: '',
            phone: '',
            isLoading: false,
            isResending: false,
            countdown: 0
        }
        this.otpInputs = [];
    }

    componentDidMount() {
        // Lấy thông tin đăng ký từ sessionStorage
        const email = sessionStorage.getItem('registerEmail') || 
                     this.props.location?.state?.email || '';
        const password = sessionStorage.getItem('registerPassword') || '';
        const fullName = sessionStorage.getItem('registerFullName') || '';
        const phone = sessionStorage.getItem('registerPhone') || '';
        
        if (!email || !password) {
            toast.error('Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại!');
            this.props.history.push('/register');
            return;
        }

        this.setState({ 
            email, 
            password,
            fullName,
            phone
        });
        this.startCountdown();
    }

    startCountdown = () => {
        this.setState({ countdown: 60 });
        const timer = setInterval(() => {
            this.setState(prevState => {
                if (prevState.countdown <= 1) {
                    clearInterval(timer);
                    return { countdown: 0 };
                }
                return { countdown: prevState.countdown - 1 };
            });
        }, 1000);
    }

    handleOTPChange = (index, value) => {
        // Chỉ cho phép nhập số
        if (value && !/^[0-9]$/.test(value)) {
            return;
        }

        const newOTP = [...this.state.otp];
        newOTP[index] = value;

        this.setState({ otp: newOTP });

        // Tự động focus vào ô tiếp theo
        if (value && index < 5) {
            this.otpInputs[index + 1]?.focus();
        }
    }

    handleKeyDown = (index, e) => {
        // Xử lý phím Backspace
        if (e.key === 'Backspace' && !this.state.otp[index] && index > 0) {
            this.otpInputs[index - 1]?.focus();
        }
    }

    handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        
        if (/^[0-9]{6}$/.test(pastedData)) {
            const otpArray = pastedData.split('');
            this.setState({ otp: otpArray });
            this.otpInputs[5]?.focus();
        }
    }

    handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        const otpCode = this.state.otp.join('');
        
        if (otpCode.length !== 6) {
            toast.error('Vui lòng nhập đầy đủ 6 số OTP');
            return;
        }

        try {
            this.setState({ isLoading: true });
            
            // Tạo payload verify OTP theo format backend yêu cầu
            const verifyData = {
                email: this.state.email,
                otp_code: otpCode, // Backend yêu cầu otp_code, không phải otp
                password: this.state.password
            };
            
            // Thêm full_name và phone nếu có (không bắt buộc)
            if (this.state.fullName) {
                verifyData.full_name = this.state.fullName;
            }
            if (this.state.phone) {
                verifyData.phone = this.state.phone;
            }

            const response = await verifyOTP(verifyData);

            if (response && response.errCode === 0) {
                // Xóa tất cả thông tin tạm thời ngay lập tức (bảo mật)
                sessionStorage.removeItem('registerEmail');
                sessionStorage.removeItem('registerPassword');
                sessionStorage.removeItem('registerFullName');
                sessionStorage.removeItem('registerPhone');
                
                // Lưu thông tin user và token nếu có
                if (response.data) {
                    const userInfo = response.data.user || response.data;
                    // Thử nhiều cách để lấy token
                    const accessToken = response.data.token || 
                                      response.data.accessToken ||
                                      response.token ||
                                      response.accessToken ||
                                      userInfo?.token ||
                                      userInfo?.accessToken ||
                                      '';
                    
                    if (!accessToken || accessToken.trim() === '') {
                        console.error('No accessToken in verifyOTP response:', response);
                        toast.error('Xác thực thành công nhưng không nhận được token. Vui lòng thử lại.');
                        return;
                    }
                    
                    console.log('Saving accessToken to localStorage from VerifyOTP:', accessToken.substring(0, 20) + '...');
                    
                    if (accessToken) {
                        localStorage.setItem('accessToken', accessToken);
                    }
                    if (userInfo) {
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        // Dispatch Redux action
                        this.props.userLoginSuccess(userInfo, accessToken);
                    }
                }
                
                toast.success('Đăng ký và xác thực thành công!');
                
                // Đảm bảo token đã được lưu
                const savedToken = localStorage.getItem('accessToken');
                if (!savedToken || savedToken.trim() === '') {
                    console.error('Token was not saved properly after verifyOTP');
                    toast.error('Có lỗi xảy ra khi lưu thông tin đăng nhập. Vui lòng thử lại.');
                    return;
                }
                
                console.log('Token saved successfully from VerifyOTP, checking user role...');
                
                // Kiểm tra role và redirect tương ứng
                let redirectPath = '/home';
                if (isAdmin()) {
                    console.log('User is admin, redirecting to admin page...');
                    redirectPath = path.ADMIN_PRODUCT_MANAGE;
                } else {
                    console.log('User is not admin, redirecting to home...');
                }
                
                // Tự động đăng nhập và chuyển đến trang tương ứng
                setTimeout(() => {
                    if (redirectPath.startsWith('/system')) {
                        window.location.href = redirectPath;
                    } else {
                        this.props.history.push(redirectPath);
                    }
                }, 1500);
            } else {
                toast.error(response.errMessage || 'Mã OTP không đúng. Vui lòng thử lại!');
                // Reset OTP
                this.setState({ otp: ['', '', '', '', '', ''] });
                this.otpInputs[0]?.focus();
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            toast.error(error.response?.data?.errMessage || 'Xác thực thất bại. Vui lòng thử lại!');
            this.setState({ otp: ['', '', '', '', '', ''] });
            this.otpInputs[0]?.focus();
        } finally {
            this.setState({ isLoading: false });
        }
    }

    handleResendOTP = async () => {
        if (this.state.countdown > 0) {
            return;
        }

        try {
            this.setState({ isResending: true });
            const response = await resendOTP(this.state.email);

            if (response && (response.errCode === 0 || response.success)) {
                toast.success('Đã gửi lại mã OTP!');
                this.startCountdown();
            } else {
                toast.error(response.errMessage || 'Gửi lại OTP thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error('Gửi lại OTP thất bại. Vui lòng thử lại!');
        } finally {
            this.setState({ isResending: false });
        }
    }

    render() {
        const { otp, email, isLoading, isResending, countdown } = this.state;

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
                            <h2 className='auth-title'>Xác thực OTP</h2>
                            <p className='auth-subtitle'>
                                Chúng tôi đã gửi mã OTP đến email: <strong>{email}</strong>
                            </p>

                            <form onSubmit={this.handleVerifyOTP}>
                                <div className='otp-container'>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => this.otpInputs[index] = el}
                                            type='text'
                                            maxLength='1'
                                            value={digit}
                                            onChange={(e) => this.handleOTPChange(index, e.target.value)}
                                            onKeyDown={(e) => this.handleKeyDown(index, e)}
                                            onPaste={index === 0 ? this.handlePaste : undefined}
                                            className='otp-input'
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <button
                                    type='submit'
                                    className='btn btn-primary btn-block'
                                    disabled={isLoading || otp.join('').length !== 6}
                                >
                                    {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                                </button>
                            </form>

                            <div className='otp-footer'>
                                <p>
                                    Không nhận được mã?{' '}
                                    {countdown > 0 ? (
                                        <span className='countdown'>Gửi lại sau {countdown}s</span>
                                    ) : (
                                        <span 
                                            className='link' 
                                            onClick={this.handleResendOTP}
                                            style={{ cursor: isResending ? 'not-allowed' : 'pointer', opacity: isResending ? 0.6 : 1 }}
                                        >
                                            {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
                                        </span>
                                    )}
                                </p>
                                <p className='back-link'>
                                    <span className='link' onClick={() => this.props.history.push('/register')}>
                                        Quay lại đăng ký
                                    </span>
                                </p>
                            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VerifyOTP));

