import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import './Auth.scss';
import { forgotPassword, resetPassword } from '../../services/authService';
import logo from "../../imgs/logo_F5.png";

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 'email', // 'email' hoặc 'reset'
            email: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
            errors: {},
            isLoading: false
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
            errors: { ...this.state.errors, [name]: '' }
        });
    }

    validateEmailForm = () => {
        const { email } = this.state;
        const errors = {};

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    validateResetForm = () => {
        const { otp, newPassword, confirmPassword } = this.state;
        const errors = {};

        if (!otp.trim()) {
            errors.otp = 'Vui lòng nhập mã OTP';
        } else if (otp.length !== 6) {
            errors.otp = 'Mã OTP phải có 6 chữ số';
        }

        if (!newPassword) {
            errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (newPassword.length < 6) {
            errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    handleSendOTP = async (e) => {
        e.preventDefault();
        
        if (!this.validateEmailForm()) {
            return;
        }

        try {
            this.setState({ isLoading: true });
            const { email } = this.state;

            const response = await forgotPassword(email);
            
            if (response && (response.errCode === 0 || response.success)) {
                toast.success('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!');
                this.setState({ step: 'reset' });
            } else {
                toast.error(response.errMessage || 'Gửi OTP thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.errMessage || 'Gửi OTP thất bại. Vui lòng thử lại!');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!this.validateResetForm()) {
            return;
        }

        try {
            this.setState({ isLoading: true });
            const { email, otp, newPassword } = this.state;

            const response = await resetPassword({
                email,
                otp,
                newPassword
            });
            
            if (response && (response.errCode === 0 || response.success)) {
                toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
                this.props.history.push('/login');
            } else {
                toast.error(response.errMessage || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.errMessage || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { step, email, otp, newPassword, confirmPassword, errors, isLoading } = this.state;

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
                            {step === 'email' ? (
                                <>
                                    <h2 className='auth-title'>Quên mật khẩu</h2>
                                    <p className='auth-subtitle'>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>

                                    <form onSubmit={this.handleSendOTP}>
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

                                        <button
                                            type='submit'
                                            className='btn btn-primary btn-block'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                        </button>
                                    </form>

                                    <div className='auth-footer'>
                                        <span 
                                            className='link'
                                            onClick={() => this.props.history.push('/login')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Quay lại đăng nhập
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className='auth-title'>Đặt lại mật khẩu</h2>
                                    <p className='auth-subtitle'>Nhập mã OTP và mật khẩu mới</p>

                                    <form onSubmit={this.handleResetPassword}>
                                        <div className='form-group'>
                                            <label>Email</label>
                                            <input
                                                type='email'
                                                value={email}
                                                disabled
                                                className='disabled-input'
                                            />
                                        </div>

                                        <div className='form-group'>
                                            <label>Mã OTP *</label>
                                            <input
                                                type='text'
                                                name='otp'
                                                value={otp}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập mã OTP (6 chữ số)'
                                                maxLength={6}
                                                className={errors.otp ? 'error' : ''}
                                            />
                                            {errors.otp && <span className='error-message'>{errors.otp}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Mật khẩu mới *</label>
                                            <input
                                                type='password'
                                                name='newPassword'
                                                value={newPassword}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập mật khẩu mới (tối thiểu 6 ký tự)'
                                                className={errors.newPassword ? 'error' : ''}
                                            />
                                            {errors.newPassword && <span className='error-message'>{errors.newPassword}</span>}
                                        </div>

                                        <div className='form-group'>
                                            <label>Xác nhận mật khẩu *</label>
                                            <input
                                                type='password'
                                                name='confirmPassword'
                                                value={confirmPassword}
                                                onChange={this.handleInputChange}
                                                placeholder='Nhập lại mật khẩu mới'
                                                className={errors.confirmPassword ? 'error' : ''}
                                            />
                                            {errors.confirmPassword && <span className='error-message'>{errors.confirmPassword}</span>}
                                        </div>

                                        <button
                                            type='submit'
                                            className='btn btn-primary btn-block'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                        </button>
                                    </form>

                                    <div className='auth-footer'>
                                        <span 
                                            className='link'
                                            onClick={() => this.setState({ step: 'email', otp: '', newPassword: '', confirmPassword: '', errors: {} })}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Quay lại
                                        </span>
                                    </div>
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
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ForgotPassword));

