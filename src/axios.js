import axios from 'axios';
import _ from 'lodash';

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor để tự động thêm token vào headers
instance.interceptors.request.use(
    (config) => {
        // Đảm bảo headers object tồn tại
        config.headers = config.headers || {};
        
        // Lấy accessToken từ localStorage
        const accessToken = localStorage.getItem('accessToken');
        
        if (accessToken && accessToken.trim() !== '') {
            // Thêm Authorization header
            config.headers.Authorization = `Bearer ${accessToken}`;
            
            // Debug log (chỉ trong development)
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Request with token:', config.url, 'Token:', accessToken.substring(0, 20) + '...');
                console.log('✅ Authorization header:', config.headers.Authorization.substring(0, 30) + '...');
            }
        } else {
            // Log warning nếu không có token (chỉ trong development)
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ No accessToken found in localStorage. Request may fail if authentication is required.', config.url);
                console.warn('⚠️ localStorage.getItem("accessToken"):', localStorage.getItem('accessToken'));
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
    const error = new Error();
    error.httpStatusCode = httpStatusCode;
    error.statusCode = statusCode;
    error.errorMessage = errorMessage;
    error.problems = problems;
    error.errorCode = errorCode + "";
    return error;
};

export const isSuccessStatusCode = (s) => {
    // May be string or number
    const statusType = typeof s;
    return (statusType === 'number' && s === 0) || (statusType === 'string' && s.toUpperCase() === 'OK');
};

instance.interceptors.response.use(
    (response) => {
        const { data } = response;
        
        // Xử lý format response mới (errCode, errMessage)
        if (data.hasOwnProperty('errCode')) {
            if (data.errCode !== 0 && data.errCode !== '0') {
                // Có lỗi
                return Promise.reject(createError(
                    response.status, 
                    data.errCode, 
                    data.errMessage || 'An error occurred',
                    null,
                    data.errCode
                ));
            }
            // Thành công, trả về data
            return data;
        }
        
        // Xử lý format response cũ (s, errmsg)
        if (data.hasOwnProperty('s') && !isSuccessStatusCode(data['s']) && data.hasOwnProperty('errmsg')) {
            return Promise.reject(createError(response.status, data['s'], data['errmsg'], null, data['errcode'] ? data['errcode'] : ""));
        }

        // Return direct data to callback
        if (data.hasOwnProperty('s') && data.hasOwnProperty('d')) {
            return data['d'];
        }
        // Handle special case
        if (data.hasOwnProperty('s') && _.keys(data).length === 1) {
            return null;
        }
        return response.data;
    },
    (error) => {
        const { response } = error;
        if (response == null) {
            return Promise.reject(error);
        }

        const { data } = response;

        // Xử lý token hết hạn hoặc không hợp lệ (401 Unauthorized)
        // CHỈ logout khi thực sự là lỗi authentication
        if (response.status === 401) {
            // Kiểm tra xem có phải lỗi authentication thực sự không
            let isAuthError = false;
            
            if (!data) {
                // Không có data, coi như lỗi auth
                isAuthError = true;
            } else {
                // Có data, kiểm tra errCode và errMessage
                const errCode = data.errCode;
                const errMessage = data.errMessage || '';
                const errMsgLower = errMessage.toLowerCase();
                
                // Chỉ logout nếu:
                // 1. errCode === 401 hoặc '401' (lỗi authentication rõ ràng)
                // 2. errMessage chứa từ khóa rõ ràng về authentication (không phải lỗi API thông thường)
                // 3. errCode không tồn tại VÀ errMessage chứa từ khóa auth
                
                // Kiểm tra errMessage có chứa từ khóa authentication rõ ràng không
                const hasAuthKeywords = errMsgLower.includes('no token') ||
                                      errMsgLower.includes('invalid token') ||
                                      errMsgLower.includes('expired token') ||
                                      errMsgLower.includes('token expired') ||
                                      errMsgLower.includes('unauthorized') ||
                                      errMsgLower.includes('authentication') ||
                                      errMsgLower.includes('token missing') ||
                                      errMsgLower.includes('token required');
                
                if (errCode === 401 || errCode === '401') {
                    // errCode = 401 → Lỗi authentication rõ ràng
                    isAuthError = true;
                } else if (hasAuthKeywords) {
                    // errMessage chứa từ khóa authentication → Lỗi auth
                    isAuthError = true;
                } else if (!data.hasOwnProperty('errCode') && (
                    errMsgLower.includes('token') ||
                    errMsgLower.includes('unauthorized') ||
                    errMsgLower.includes('authentication')
                )) {
                    // Không có errCode nhưng có từ khóa auth → Lỗi auth
                    isAuthError = true;
                }
                // Nếu errCode khác 401 và errMessage không chứa từ khóa auth → Không phải lỗi auth
            }
            
            // Chỉ logout khi thực sự là lỗi authentication
            if (isAuthError) {
                console.warn('🔒 Authentication error detected, logging out...', {
                    status: response.status,
                    errCode: data?.errCode,
                    errMessage: data?.errMessage
                });
                
                // Xóa token và user info
                localStorage.removeItem('userInfo');
                localStorage.removeItem('accessToken');
                
                // Redirect về login nếu không phải đang ở trang login
                if (window.location.pathname !== '/login' && 
                    window.location.pathname !== '/register' &&
                    window.location.pathname !== '/verify-otp' &&
                    window.location.pathname !== '/forgot-password') {
                    // Sử dụng setTimeout để tránh conflict với các component đang xử lý error
                    setTimeout(() => {
                        window.location.href = '/login?expired=true';
                    }, 100);
                }
            } else {
                // Không phải lỗi auth, chỉ log warning
                console.warn('⚠️ 401 response but not authentication error:', {
                    status: response.status,
                    errCode: data?.errCode,
                    errMessage: data?.errMessage
                });
            }
            // Nếu không phải lỗi auth, tiếp tục xử lý như lỗi thông thường (không logout)
        }

        // Xử lý format response mới
        if (data && data.hasOwnProperty('errCode')) {
            return Promise.reject(createError(
                response.status,
                data.errCode,
                data.errMessage || 'An error occurred',
                null,
                data.errCode
            ));
        }

        // Xử lý format response cũ
        if (data && data.hasOwnProperty('s') && data.hasOwnProperty('errmsg')) {
            return Promise.reject(createError(response.status, data['s'], data['errmsg']));
        }

        if (data && data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
            return Promise.reject(createError(response.status, data['code'], data['message'], data['problems']));
        }

        return Promise.reject(createError(response.status));
    }
);

export default instance;
