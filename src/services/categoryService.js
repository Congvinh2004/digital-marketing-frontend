import axios from "../axios";

const getAllCategories = () => {
    return axios.get(`/api/get-all-categories`)
}

const getCategoryById = (categoryId) => {
    return axios.get(`/api/get-category-by-id?id=${categoryId}`)
}

const createCategory = (data) => {
    return axios.post('/api/create-category', data)
}

const updateCategory = (categoryId, data) => {
    return axios.put(`/api/update-category?id=${categoryId}`, data)
}

const deleteCategory = (categoryId) => {
    return axios.delete(`/api/delete-category?id=${categoryId}`)
}

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}

