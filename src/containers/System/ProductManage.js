import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import "./ProductManage.scss"
import { getAllProducts, deleteProduct, createNewProductsFromService, updateProduct, addInforProductToMGDB } from "../../services/productService"
import { getAllCategories } from "../../services/categoryService"
import ModalProduct from './ModalProduct';
import { emitter } from '../../utils/emitter'
import { toast } from 'react-toastify';

class ProductManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listProducts: [],
            filteredProducts: [], // Danh sách sản phẩm sau khi filter
            isOpenModal: false,
            currentProduct: null, // Product đang được edit
            searchTerm: '', // Từ khóa tìm kiếm
            selectedCategoryFilter: '', // Category được chọn để filter
            listCategories: [] // Danh sách categories
        };
        this._isMounted = false; // Flag để track component mount status
    }

    async componentDidMount() {
        this._isMounted = true;
        await this.fetchAllCategories();
        await this.getAllProductsFromReact()
    }

    componentWillUnmount() {
        // Cleanup: Đánh dấu component đã unmount
        this._isMounted = false;
    }

    fetchAllCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response && response.errCode === 0 && response.data) {
                if (this._isMounted) {
                    this.setState({ 
                        listCategories: Array.isArray(response.data) ? response.data : [] 
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    getAllProductsFromReact = async () => {
        try {
            let response = await getAllProducts()
            
            // Kiểm tra component còn mounted không trước khi setState
            if (!this._isMounted) {
                return;
            }
            
            if (response && response.data) {
                // Debug: Kiểm tra image data trong response
                if (process.env.NODE_ENV === 'development' && Array.isArray(response.data) && response.data.length > 0) {
                    const firstProduct = response.data[0];
                    if (firstProduct && firstProduct.image) {
                        console.log('First product image data:', {
                            hasImage: !!firstProduct.image,
                            imageLength: firstProduct.image.length,
                            isBase64: firstProduct.image.startsWith('data:'),
                            preview: firstProduct.image.substring(0, 100)
                        });
                    }
                }
                
                // Luôn set state, kể cả khi array rỗng
                if (this._isMounted) {
                    const products = Array.isArray(response.data) ? response.data : [];
                    this.setState({
                        listProducts: products,
                        filteredProducts: products // Khởi tạo filteredProducts bằng listProducts
                    }, () => {
                        // Sau khi set state, apply filter
                        this.applyFilters();
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            
            // Chỉ setState và hiển thị toast nếu component còn mounted
            if (this._isMounted) {
                toast.error('Failed to load products');
                // Set empty array khi có lỗi để tránh undefined
                this.setState({
                    listProducts: [],
                    filteredProducts: []
                })
            }
        }
    }

    handleSearchChange = (e) => {
        const searchTerm = e.target.value;
        this.setState({ searchTerm }, () => {
            this.applyFilters();
        });
    }

    handleCategoryFilterChange = (e) => {
        const selectedCategoryFilter = e.target.value;
        this.setState({ selectedCategoryFilter }, () => {
            this.applyFilters();
        });
    }

    applyFilters = () => {
        const { listProducts, searchTerm, selectedCategoryFilter } = this.state;
        
        let filtered = [...listProducts];
        
        // Filter theo tên sản phẩm
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const productName = (product.name || product.productName || '').toLowerCase();
                return productName.includes(searchLower);
            });
        }
        
        // Filter theo category
        if (selectedCategoryFilter) {
            const categoryId = parseInt(selectedCategoryFilter);
            filtered = filtered.filter(product => {
                const productCategoryId = product.category_id || product.categoryId || product.productCategoryID;
                return parseInt(productCategoryId) === categoryId;
            });
        }
        
        this.setState({ filteredProducts: filtered });
    }

    handleOpenModalProduct = (product = null) => {
        this.setState({
            isOpenModal: true,
            currentProduct: product // null nếu là add mode, product object nếu là edit mode
        })
    }

    toglleProductModal = () => {
        this.setState({
            isOpenModal: !this.state.isOpenModal,
            currentProduct: null // Reset khi đóng modal
        })
    }

    createNewProduct = async (data) => {
        try {
            let response = await createNewProductsFromService(data);
            console.log('check response: ', response)
            
            // Kiểm tra component còn mounted không
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                await addInforProductToMGDB()
                
                if (!this._isMounted) return;
                
                this.toglleProductModal()
                await this.getAllProductsFromReact()
                emitter.emit('EVENT_CLEAR_MODAL_DATA')
                
                if (this._isMounted) {
                    toast.success('Product created successfully');
                }
            } else {
                if (this._isMounted) {
                    toast.error(response.errMessage || 'Failed to create product');
                }
            }
        } catch (e) {
            console.log('error: ', e)
            if (this._isMounted) {
                toast.error(e.response?.data?.errMessage || 'Failed to create product');
            }
        }
    }

    handleUpdateProduct = async (productId, data) => {
        try {
            let response = await updateProduct(productId, data);
            console.log('check update response: ', response)
            
            // Kiểm tra component còn mounted không
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                this.toglleProductModal()
                await this.getAllProductsFromReact()
                emitter.emit('EVENT_CLEAR_MODAL_DATA')
                
                if (this._isMounted) {
                    toast.success('Product updated successfully');
                }
            } else {
                if (this._isMounted) {
                    toast.error(response.errMessage || 'Failed to update product');
                }
            }
        } catch (e) {
            console.log('error: ', e)
            if (this._isMounted) {
                toast.error(e.response?.data?.errMessage || 'Failed to update product');
            }
        }
    }

    handleEditProduct = (product) => {
        this.handleOpenModalProduct(product);
    }

    handleDeleteProduct = async (product) => {
        const productName = product.productName || product.name || 'this product';
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            return;
        }

        const productId = product.id || product.productID;
        console.log('check productID: ', productId)
        try {
            let response = await deleteProduct(productId)
            
            // Kiểm tra component còn mounted không
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                if (this._isMounted) {
                    toast.success('Product deleted successfully');
                }
                await this.getAllProductsFromReact()
            } else {
                if (this._isMounted) {
                    toast.error(response.errMessage || 'Failed to delete product');
                }
            }
        } catch (e) {
            console.log('error: ', e)
            if (this._isMounted) {
                toast.error(e.response?.data?.errMessage || 'Failed to delete product');
            }
        }
    }

    formatPrice = (price) => {
        if (!price) return '0';
        return new Intl.NumberFormat('vi-VN').format(price);
    }

    getProductImage = (product) => {
        return product.image || product.productImage || product.imageUrl || '';
    }

    getCategoryName = (categoryId) => {
        if (!categoryId) return '-';
        const category = this.state.listCategories.find(cat => cat.id === parseInt(categoryId));
        return category ? category.name : `Category ID: ${categoryId}`;
    }

    render() {
        let { listProducts, isOpenModal, currentProduct } = this.state
        return (
            <>
                <ModalProduct 
                    createNewProduct={this.createNewProduct}
                    updateProduct={this.handleUpdateProduct}
                    isOpenModal={isOpenModal} 
                    toglleFromParent={this.toglleProductModal}
                    productData={currentProduct}
                />

                <div className="product-container">
                    <div className="title text-center">
                        <h2>Manage Products</h2>
                    </div>

                    <div className='action-bar'>
                        <button className='btn btn-primary' onClick={() => this.handleOpenModalProduct()}>
                            <i className="fas fa-plus"></i>
                            Add a new product
                        </button>
                        <button className='btn btn-secondary' onClick={this.getAllProductsFromReact}>
                            <i className="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>

                    {/* Filter và Search Bar */}
                    <div className='filter-bar'>
                        <div className='search-container'>
                            <i className="fas fa-search"></i>
                            <input
                                type='text'
                                placeholder='Search products by name...'
                                value={this.state.searchTerm}
                                onChange={this.handleSearchChange}
                                className='search-input'
                            />
                        </div>
                        <div className='filter-container'>
                            <label htmlFor="categoryFilter">Filter by Category:</label>
                            <select
                                id="categoryFilter"
                                value={this.state.selectedCategoryFilter}
                                onChange={this.handleCategoryFilterChange}
                                className='filter-select'
                            >
                                <option value="">All Categories</option>
                                {this.state.listCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {this.state.filteredProducts.length === 0 && this.state.listProducts.length > 0 ? (
                        <div className='no-products'>
                            <i className="fas fa-search"></i>
                            <p>No products found matching your search criteria.</p>
                        </div>
                    ) : this.state.listProducts.length === 0 ? (
                        <div className='no-products'>
                            <i className="fas fa-box-open"></i>
                            <p>No products found. Click "Add a new product" to create one.</p>
                        </div>
                    ) : (
                        <div className='user-table mt-3'>
                            <table id="customers">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Price (VND)</th>
                                        <th>Discount (%)</th>
                                        <th>Quantity</th>
                                        <th>Category</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.filteredProducts.map((itemProduct, index) => {
                                        const productImage = this.getProductImage(itemProduct);
                                        const productId = itemProduct.id || itemProduct.productID || `product-${index}`;
                                        const productName = itemProduct.productName || itemProduct.name || 'Unnamed Product';
                                        
                                        // Validate và format image URL
                                        // Base64 data URL: data:image/jpeg;base64,... hoặc data:image/png;base64,...
                                        // HTTP URL: http://... hoặc https://...
                                        // Relative path: /path/to/image hoặc ./path/to/image
                                        let imageUrl = productImage;
                                        
                                        // Kiểm tra nếu là base64 data URL (bắt đầu với "data:")
                                        const isBase64DataUrl = imageUrl && imageUrl.startsWith('data:');
                                        // Kiểm tra nếu là HTTP URL
                                        const isHttpUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
                                        // Kiểm tra nếu là relative path
                                        const isRelativePath = imageUrl && imageUrl.startsWith('/');
                                        
                                        // Xử lý relative path - thêm base URL từ axios config
                                        if (imageUrl && isRelativePath) {
                                            // Lấy base URL từ axios instance (thường là http://localhost:8080)
                                            const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
                                            imageUrl = `${baseURL}${imageUrl}`;
                                        }
                                        
                                        // Kiểm tra base64 string có hợp lệ không
                                        // Base64 string quá ngắn (< 500 ký tự) thường không đủ để render image đầy đủ
                                        // Nếu base64 quá ngắn, có thể bị truncate - không hiển thị
                                        let hasValidImage = imageUrl && imageUrl.trim().length > 0;
                                        
                                        if (isBase64DataUrl) {
                                            // Base64 data URL cần ít nhất 500 ký tự để render một image nhỏ
                                            // Nếu quá ngắn, có thể bị truncate ở backend
                                            if (imageUrl.length < 500) {
                                                console.warn(`⚠️ Base64 string too short (${imageUrl.length} chars) for ${productName}. May be truncated.`);
                                                // Vẫn cố gắng render, nhưng có thể sẽ fail
                                            }
                                            hasValidImage = imageUrl.length > 50; // Tối thiểu 50 ký tự
                                        } else if (isRelativePath) {
                                            // Relative path đã được convert thành full URL ở trên
                                            hasValidImage = true;
                                        }
                                        
                                        // Debug log (chỉ trong development)
                                        if (process.env.NODE_ENV === 'development' && imageUrl) {
                                            console.log(`Product ${productName} - Image:`, {
                                                hasImage: !!imageUrl,
                                                imageLength: imageUrl.length,
                                                isBase64: isBase64DataUrl,
                                                isValid: hasValidImage,
                                                preview: imageUrl.substring(0, 80)
                                            });
                                        }
                                        
                                        return (
                                            <tr key={productId}>
                                                <td className='product-image-cell'>
                                                    {hasValidImage ? (
                                                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                                                            <img 
                                                                key={`img-${productId}-${Date.now()}`}
                                                                src={imageUrl} 
                                                                alt={productName} 
                                                                className='product-thumbnail'
                                                                style={{ 
                                                                    display: 'block',
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    console.error(`Failed to load image for ${productName}`);
                                                                    // Ẩn image và hiển thị placeholder khi lỗi
                                                                    e.target.style.display = 'none';
                                                                    // Tìm placeholder trong cùng container
                                                                    const container = e.target.parentElement;
                                                                    if (container) {
                                                                        let placeholder = container.querySelector('.no-image-placeholder');
                                                                        if (!placeholder) {
                                                                            // Tạo placeholder nếu chưa có
                                                                            placeholder = document.createElement('div');
                                                                            placeholder.className = 'no-image-placeholder';
                                                                            placeholder.innerHTML = '<i class="fas fa-image"></i>';
                                                                            container.appendChild(placeholder);
                                                                        }
                                                                        placeholder.style.display = 'flex';
                                                                    }
                                                                }}
                                                                onLoad={(e) => {
                                                                    // Ẩn placeholder khi image load thành công
                                                                    const container = e.target.parentElement;
                                                                    if (container) {
                                                                        const placeholder = container.querySelector('.no-image-placeholder');
                                                                        if (placeholder) {
                                                                            placeholder.style.display = 'none';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {/* Placeholder ẩn - chỉ hiển thị khi image lỗi */}
                                                            <div 
                                                                className='no-image-placeholder'
                                                                style={{ 
                                                                    display: 'none',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '80px',
                                                                    height: '80px'
                                                                }}
                                                            >
                                                                <i className="fas fa-image"></i>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='no-image-placeholder'>
                                                            <i className="fas fa-image"></i>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{productName}</td>
                                                <td className='description-cell' title={itemProduct.description}>
                                                    {itemProduct.description && itemProduct.description.length > 50 
                                                        ? `${itemProduct.description.substring(0, 50)}...` 
                                                        : itemProduct.description}
                                                </td>
                                                <td className='price-cell'>{this.formatPrice(itemProduct.price)}</td>
                                                <td>
                                                    {itemProduct.discount_percent || itemProduct.discountPercent 
                                                        ? `${itemProduct.discount_percent || itemProduct.discountPercent}%` 
                                                        : '-'}
                                                </td>
                                                <td>{itemProduct.quantity}</td>
                                                <td>
                                                    {this.getCategoryName(itemProduct.productCategoryID || itemProduct.category_id)}
                                                </td>
                                                <td className='action-icon text-center'>
                                                    <i 
                                                        className="fas fa-edit _edit" 
                                                        onClick={() => this.handleEditProduct(itemProduct)}
                                                        title="Edit product"
                                                    ></i>
                                                    <i 
                                                        className="fas fa-trash _delete" 
                                                        onClick={() => this.handleDeleteProduct(itemProduct)}
                                                        title="Delete product"
                                                    ></i>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </>
        );
    }

}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductManage);
