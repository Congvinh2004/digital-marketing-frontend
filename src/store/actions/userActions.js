import actionTypes from './actionTypes';

export const addUserSuccess = () => ({
    type: actionTypes.ADD_USER_SUCCESS
});

export const userLoginSuccess = (userInfo, accessToken) => ({
    type: actionTypes.USER_LOGIN_SUCCESS,
    userInfo: userInfo,
    accessToken: accessToken
});

export const userLoginFail = () => ({
    type: actionTypes.USER_LOGIN_FAIL
});

export const userLogout = () => {
    // Xóa tất cả dữ liệu liên quan đến user
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('registerEmail');
    sessionStorage.removeItem('registerPassword');
    sessionStorage.removeItem('registerFullName');
    sessionStorage.removeItem('registerPhone');
    
    return {
        type: actionTypes.USER_LOGOUT
    };
};

export const setUserInfo = (userInfo, accessToken) => ({
    type: actionTypes.SET_USER_INFO,
    userInfo: userInfo,
    accessToken: accessToken
});