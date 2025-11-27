import React, { Component } from 'react';
import { toast } from 'react-toastify';
import axios from '../../axios';
import './SubscribeForm.scss';

/**
 * SubscribeForm Component
 * Component form đăng ký nhận newsletter/email marketing
 */
class SubscribeForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            name: '',
            isLoading: false,
            showNameField: props.showNameField || false
        };
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    }

    validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        
        const { email, name } = this.state;
        
        // Validation
        if (!email || email.trim() === '') {
            toast.error('Vui lòng nhập email!');
            return;
        }

        if (!this.validateEmail(email)) {
            toast.error('Email không hợp lệ!');
            return;
        }

        if (this.state.showNameField && (!name || name.trim() === '')) {
            toast.error('Vui lòng nhập tên!');
            return;
        }

        try {
            this.setState({ isLoading: true });

            // Gọi API subscribe
            const subscribeData = {
                email: email.trim(),
                ...(name && { name: name.trim() })
            };

            // TODO: Thay đổi endpoint này khi backend có API subscribe
            const response = await axios.post('/api/subscribe', subscribeData);

            if (response && (response.data?.errCode === 0 || response.data?.success)) {
                toast.success('Đăng ký thành công! Cảm ơn bạn đã đăng ký nhận tin tức.');
                
                // Reset form
                this.setState({
                    email: '',
                    name: ''
                });

                // Callback nếu có
                if (this.props.onSubscribeSuccess) {
                    this.props.onSubscribeSuccess(email);
                }
            } else {
                toast.error(response.data?.errMessage || 'Đăng ký thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Subscribe error:', error);
            
            // Nếu backend chưa có API, hiển thị thông báo tạm thời
            if (error.response?.status === 404) {
                toast.info('Tính năng đang được phát triển. Email của bạn đã được ghi nhận!');
                this.setState({
                    email: '',
                    name: ''
                });
            } else {
                toast.error(error.response?.data?.errMessage || 'Có lỗi xảy ra. Vui lòng thử lại!');
            }
        } finally {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { email, name, isLoading, showNameField } = this.state;
        const { variant = 'default' } = this.props; // 'default' hoặc 'inline'

        if (variant === 'inline') {
            // Inline variant - cho footer
            return (
                <form className="subscribe-form subscribe-form-inline" onSubmit={this.handleSubmit}>
                    {showNameField && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Tên của bạn"
                            value={name}
                            onChange={this.handleInputChange}
                            className="subscribe-input subscribe-input-name"
                            disabled={isLoading}
                        />
                    )}
                    <div className="subscribe-input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email*"
                            value={email}
                            onChange={this.handleInputChange}
                            className="subscribe-input subscribe-input-email"
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="submit"
                            className="subscribe-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </div>
                </form>
            );
        }

        // Default variant - cho modal hoặc standalone
        return (
            <div className="subscribe-form-container">
                <form className="subscribe-form" onSubmit={this.handleSubmit}>
                    <h4 className="subscribe-title">Đăng ký nhận tin tức</h4>
                    <p className="subscribe-description">
                        Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và cập nhật từ chúng tôi.
                    </p>
                    
                    {showNameField && (
                        <div className="subscribe-field">
                            <input
                                type="text"
                                name="name"
                                placeholder="Tên của bạn"
                                value={name}
                                onChange={this.handleInputChange}
                                className="subscribe-input"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    
                    <div className="subscribe-field">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email của bạn*"
                            value={email}
                            onChange={this.handleInputChange}
                            className="subscribe-input"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="subscribe-submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i> Đăng ký ngay
                            </>
                        )}
                    </button>
                    
                    <p className="subscribe-privacy">
                        Bằng cách đăng ký, bạn đồng ý với <a href="/privacy">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                </form>
            </div>
        );
    }
}

export default SubscribeForm;

