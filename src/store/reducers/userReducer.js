import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    userInfo: null,
    accessToken: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                userInfo: action.userInfo,
                accessToken: action.accessToken
            };
        case actionTypes.USER_LOGIN_FAIL:
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null,
                accessToken: null
            };
        case actionTypes.USER_LOGOUT:
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null,
                accessToken: null
            };
        case actionTypes.SET_USER_INFO:
            return {
                ...state,
                userInfo: action.userInfo,
                accessToken: action.accessToken,
                isLoggedIn: !!action.userInfo
            };
        default:
            return state;
    }
};

export default userReducer;

