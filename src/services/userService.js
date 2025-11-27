import axios from "../axios";

// Lấy tất cả users
const getAllUsers = (inputId = 'ALL') => {
    return axios.get(`/api/get-all-users`)
}

// Tạo user mới
const createNewUsersFromService = (data) => {
    return axios.post('/api/create-user', data)
}

// Cập nhật user
const updateUser = (userId, data) => {
    return axios.put(`/api/update-user?id=${userId}`, data)
}

// Xóa user
const deleteUser = (userID) => {
    return axios.delete(`/api/users/${userID}`)
}

// Lấy thông tin user theo ID
const getUserById = (userId) => {
    return axios.get(`/api/users/${userId}`)
}

// Fallback API endpoints (nếu backend chưa có RESTful API)
const getAllUsersOld = (inputId) => {
    return axios.get(`/api/get-all-user?id=${inputId}`)
}

const createNewUsersFromServiceOld = (data) => {
    return axios.post('/api/add-user', data)
}

const deleteUserOld = (userID) => {
    return axios.delete(`/api/delete-user?id=${userID}`)
}

const addInforUserToMGDB = () => {
    return axios.post('http://localhost:3001/api/add-user')
}

export { 
    getAllUsers, 
    createNewUsersFromService, 
    updateUser,
    deleteUser, 
    getUserById,
    // Old APIs for backward compatibility
    getAllUsersOld,
    createNewUsersFromServiceOld,
    deleteUserOld,
    addInforUserToMGDB 
}