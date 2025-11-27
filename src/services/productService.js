import axios from "../axios";

const getAllProducts = () => {
    return axios.get(`/api/get-all-products`)
}

const createNewProductsFromService = (data) => {
    console.log('check data from service: ', data)
    // Backend chỉ nhận JSON, không nhận FormData
    // Image đã được convert thành base64 string trong ModalProduct
    return axios.post('/api/add-product', data)
}

const updateProduct = (productId, data) => {
    // Backend chỉ nhận JSON, không nhận FormData
    // Image đã được convert thành base64 string trong ModalProduct
    return axios.put(`/api/update-product?id=${productId}`, data)
}

const deleteProduct = (productID) => {
    return axios.delete(`/api/delete-product?id=${productID}`)
}

const addInforProductToMGDB = () => {
    return axios.post('http://localhost:3001/api/add-new-product')
}

const getAllCategories = () => {
    return axios.get(`/api/get-all-categories`)
}

// Lấy sản phẩm theo category_id
const getProductByCategoryId = (category_id) => {
    return axios.get(`/api/get-product-by-category-id?category_id=${category_id}`)
}

// Lấy chi tiết sản phẩm theo ID
const getProductById = (productId) => {
    return axios.get(`/api/get-product-by-id?id=${productId}`)
}

// Upload hình ảnh sản phẩm
const uploadProductImage = (formData) => {
    return axios.post('/api/upload-product-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// Cập nhật số lượng sản phẩm sau khi bán
const updateProductQuantity = (productId, quantity) => {
    return axios.put(`/api/update-product?id=${productId}`, { quantity });
}

export { 
    getAllProducts, 
    deleteProduct, 
    createNewProductsFromService, 
    updateProduct,
    addInforProductToMGDB, 
    getProductByCategoryId, 
    getAllCategories, 
    getProductById,
    uploadProductImage,
    updateProductQuantity
}