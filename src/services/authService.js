import axios from "../axios";

// Đăng nhập
const login = (data) => {
    return axios.post('/api/auth/login', data);
}

// Đăng ký (API sẽ tự động gửi OTP sau khi đăng ký thành công)
const register = (data) => {
    return axios.post('/api/auth/register', data);
}

// Xác thực OTP
const verifyOTP = (data) => {
    return axios.post('/api/auth/verify-otp', data);
}

// Gửi lại OTP
const resendOTP = (email) => {
    return axios.post('/api/auth/resend-otp', { email });
}

// Validate token (kiểm tra token còn hợp lệ không)
const validateToken = () => {
    return axios.get('/api/auth/validate-token');
}

// Quên mật khẩu - Gửi OTP
const forgotPassword = (email) => {
    return axios.post('/api/auth/forgot-password', { email });
}

// Reset mật khẩu với OTP
const resetPassword = (data) => {
    return axios.post('/api/auth/reset-password', data);
}

export { login, register, verifyOTP, resendOTP, validateToken, forgotPassword, resetPassword };

