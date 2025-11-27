
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import "./ProductManage.scss"
import { emitter } from '../../utils/emitter';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../services/categoryService';

class ModalProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            price: '',
            discount_percent: '',
            image: '',
            imageFile: null,
            imagePreview: null,
            quantity: '',
            productCategoryID: '',
            isUploading: false,
            listCategories: [] // Danh sách categories
        }
        this.listenToEmitter()
    }

    componentDidMount() {
        // Load danh sách categories
        this.fetchAllCategories();
        // Nếu có productData từ props (edit mode), load data vào state
        if (this.props.productData) {
            this.loadProductData(this.props.productData);
        }
    }

    fetchAllCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response && response.errCode === 0 && response.data) {
                this.setState({ 
                    listCategories: Array.isArray(response.data) ? response.data : [] 
                });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    }

    componentDidUpdate(prevProps) {
        // Khi productData thay đổi (chuyển từ add sang edit hoặc ngược lại)
        // So sánh ID thay vì toàn bộ object để tránh re-render không cần thiết
        const prevProductId = prevProps.productData?.id || prevProps.productData?.productID;
        const currentProductId = this.props.productData?.id || this.props.productData?.productID;
        
        if (prevProductId !== currentProductId) {
            if (this.props.productData && currentProductId) {
                this.loadProductData(this.props.productData);
            } else {
                this.clearForm();
            }
        }
    }

    loadProductData = (productData) => {
        this.setState({
            name: productData.productName || productData.name || '',
            description: productData.description || '',
            price: productData.price || '',
            discount_percent: productData.discount_percent || productData.discountPercent || '',
            image: productData.image || productData.productImage || productData.imageUrl || '',
            imageFile: null,
            imagePreview: productData.image || productData.productImage || productData.imageUrl || null,
            quantity: productData.quantity || '',
            productCategoryID: productData.productCategoryID || productData.category_id || ''
        });
    }

    clearForm = () => {
        this.setState({
            name: '',
            description: '',
            price: '',
            discount_percent: '',
            image: '',
            imageFile: null,
            imagePreview: null,
            quantity: '',
            productCategoryID: '',
            isUploading: false
        });
    }

    checkValidateInput = () => {
        let isValid = true;
        
        // Chỉ validate các trường bắt buộc theo API: productName, price, category_id
        if (!this.state.name || this.state.name.trim() === '') {
            isValid = false;
            toast.error('Vui lòng nhập tên sản phẩm');
            return isValid;
        }
        
        if (!this.state.price || this.state.price === '') {
            isValid = false;
            toast.error('Vui lòng nhập giá sản phẩm');
            return isValid;
        }
        
        // Validate price >= 0
        const priceValue = parseFloat(this.state.price);
        if (isNaN(priceValue) || priceValue < 0) {
            isValid = false;
            toast.error('Giá sản phẩm phải >= 0');
            return isValid;
        }
        
        if (!this.state.productCategoryID || this.state.productCategoryID === '') {
            isValid = false;
            toast.error('Vui lòng chọn danh mục');
            return isValid;
        }
        
        // Validate discount_percent nếu có (0-100)
        if (this.state.discount_percent && this.state.discount_percent !== '') {
            const discountValue = parseFloat(this.state.discount_percent);
            if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
                isValid = false;
                toast.error('Phần trăm giảm giá phải từ 0 đến 100');
                return isValid;
            }
        }
        
        return isValid;
    }

    listenToEmitter = () => {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.clearForm();
        })
    }

    toggle = () => {
        this.props.toglleFromParent()
    }

    handleOnChange = (e, label) => {
        let copyState = { ...this.state }
        copyState[label] = e.target.value
        this.setState({
            ...copyState
        })
    }

    handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    imageFile: file,
                    imagePreview: reader.result,
                    image: '' // Clear text input if file is selected
                });
            };
            reader.readAsDataURL(file);
        }
    }

    handleRemoveImage = () => {
        this.setState({
            imageFile: null,
            imagePreview: null,
            image: ''
        });
        // Reset file input
        if (this.fileInputRef) {
            this.fileInputRef.value = '';
        }
    }

    // Convert file to base64 string
    fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // reader.result là data URL (data:image/jpeg;base64,...)
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    handleSaveProduct = async () => {
        if (!this.checkValidateInput()) {
            return;
        }

        try {
            this.setState({ isUploading: true });

            // Backend chỉ nhận JSON với image là string (URL hoặc base64)
            // Nếu có file image, convert thành base64 string
            let imageData = this.state.image || this.state.imagePreview || '';
            
            if (this.state.imageFile) {
                // Convert file thành base64 string
                try {
                    imageData = await this.fileToBase64(this.state.imageFile);
                    console.log('Image converted to base64, length:', imageData.length);
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                    toast.error('Failed to process image file');
                    this.setState({ isUploading: false });
                    return;
                }
            }

            // Gửi JSON với image là base64 string hoặc URL
            // Theo API documentation: productName, price, category_id là bắt buộc
            // description, quantity, image, discount_percent là không bắt buộc (có giá trị mặc định)
            const productData = {
                productName: this.state.name.trim(),
                price: parseFloat(this.state.price),
                category_id: parseInt(this.state.productCategoryID)
            };
            
            // Thêm các trường không bắt buộc nếu có giá trị
            if (this.state.description && this.state.description.trim() !== '') {
                productData.description = this.state.description.trim();
            }
            
            if (this.state.quantity && this.state.quantity !== '') {
                const quantityValue = parseInt(this.state.quantity);
                if (!isNaN(quantityValue) && quantityValue >= 0) {
                    productData.quantity = quantityValue;
                }
            }
            
            if (imageData && imageData.trim() !== '') {
                productData.image = imageData;
            }
            
            if (this.state.discount_percent && this.state.discount_percent !== '') {
                const discountValue = parseFloat(this.state.discount_percent);
                if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
                    productData.discount_percent = discountValue;
                }
            }

            // Nếu có productData từ props, đây là edit mode
            const productId = this.props.productData?.id || this.props.productData?.productID;
            if (this.props.productData && productId) {
                await this.props.updateProduct(productId, productData);
            } else {
                // Add mode
                await this.props.createNewProduct(productData);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.errMessage || 'Failed to save product');
        } finally {
            this.setState({ isUploading: false });
        }
    }

    render() {
        let isOpenModal = this.props.isOpenModal
        let { name, description, price, image, imagePreview, quantity, productCategoryID, isUploading } = this.state
        const productId = this.props.productData?.id || this.props.productData?.productID;
        const isEditMode = this.props.productData && productId;
        
        return (
            <Modal
                isOpen={isOpenModal}
                toggle={() => this.toggle()}
                className='modal-product-container'
                size='lg'
            >

                <ModalHeader toggle={() => this.toggle()}>
                    {isEditMode ? 'Edit Product' : 'Create a new product'}
                </ModalHeader>
                <ModalBody>
                    <div className='modal-product-body'>
                        <div className='input-container'>
                            <label>Name *</label>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'name') }}
                                type='text'
                                value={name}
                                placeholder='Enter product name'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Description</label>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'description') }}
                                type='text'
                                value={description}
                                placeholder='Enter product description (optional)'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Price (VND) *</label>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'price') }}
                                type='number'
                                value={price}
                                placeholder='Enter price'
                                min='0'
                                step='1000'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Discount Percent (%)</label>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'discount_percent') }}
                                type='number'
                                value={this.state.discount_percent}
                                placeholder='Enter discount percent (0-100)'
                                min='0'
                                max='100'
                                step='1'
                            />
                            <small className="form-text text-muted">
                                Nhập phần trăm giảm giá (ví dụ: 10 cho 10%)
                            </small>
                        </div>

                        <div className='input-container'>
                            <label>Quantity</label>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'quantity') }}
                                type='number'
                                value={quantity}
                                placeholder='Enter quantity (default: 0)'
                                min='0'
                            />
                            <small className="form-text text-muted">
                                Số lượng tồn kho (mặc định: 0 nếu không nhập)
                            </small>
                        </div>

                        <div className='input-container'>
                            <label>Category *</label>
                            <select
                                onChange={(e) => { this.handleOnChange(e, 'productCategoryID') }}
                                className='form-control'
                                value={productCategoryID}
                                style={{
                                    height: '40px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '0 12px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            >
                                <option value="">-- Select Category --</option>
                                {this.state.listCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='input-container input-container-full'>
                            <label>Product Image</label>
                            
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className='image-preview-container'>
                                    <img src={imagePreview} alt='Product preview' className='image-preview' />
                                    <button 
                                        type='button' 
                                        className='btn-remove-image'
                                        onClick={this.handleRemoveImage}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}

                            {/* File Input */}
                            <div className='file-input-wrapper'>
                                <input
                                    ref={(ref) => this.fileInputRef = ref}
                                    type='file'
                                    accept='image/*'
                                    onChange={this.handleImageChange}
                                    className='file-input'
                                    id='product-image-input'
                                />
                                <label htmlFor='product-image-input' className='file-input-label'>
                                    <i className="fas fa-upload"></i>
                                    {imagePreview ? 'Change Image' : 'Upload Image'}
                                </label>
                            </div>

                            {/* Or use URL input */}
                            {!imagePreview && (
                                <div className='image-url-input'>
                                    <span className='or-divider'>OR</span>
                            <input
                                onChange={(e) => { this.handleOnChange(e, 'image') }}
                                type='text'
                                value={image}
                                        placeholder='Enter image URL'
                            />
                                </div>
                            )}
                        </div>
                    </div>

                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        className='btn-action'
                        onClick={this.handleSaveProduct}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Uploading...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> {isEditMode ? 'Update' : 'Save'}
                            </>
                        )}
                    </Button>{' '}

                    <Button color="secondary" className='btn-action' onClick={() => this.toggle()}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

        )
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalProduct);
