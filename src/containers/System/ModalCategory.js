import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import "./CategoryManage.scss"
import { emitter } from '../../utils/emitter';
import { toast } from 'react-toastify';

class ModalCategory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            slug: '',
            description: '',
            status: 'active',
            isEditMode: false
        }
        this.listenToEmitter()
    }

    componentDidMount() {
        // Nếu có categoryData từ props (edit mode), load data vào state
        if (this.props.categoryData) {
            this.loadCategoryData(this.props.categoryData);
        }
    }

    componentDidUpdate(prevProps) {
        // Khi categoryData thay đổi (chuyển từ add sang edit hoặc ngược lại)
        const prevCategoryId = prevProps.categoryData?.id;
        const currentCategoryId = this.props.categoryData?.id;
        
        if (prevCategoryId !== currentCategoryId) {
            if (this.props.categoryData && currentCategoryId) {
                this.loadCategoryData(this.props.categoryData);
            } else {
                this.clearForm();
            }
        }
    }

    loadCategoryData = (categoryData) => {
        this.setState({
            name: categoryData.name || '',
            slug: categoryData.slug || '',
            description: categoryData.description || '',
            status: categoryData.status || 'active',
            isEditMode: true
        });
    }

    clearForm = () => {
        this.setState({
            name: '',
            slug: '',
            description: '',
            status: 'active',
            isEditMode: false
        });
    }

    // Tự động tạo slug từ name
    generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
            .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
            .replace(/-+/g, '-'); // Loại bỏ nhiều dấu gạch ngang liên tiếp
    }

    handleOnChange = (event) => {
        const { name, value } = event.target;
        
        // Tự động tạo slug khi nhập name (chỉ khi không phải edit mode hoặc slug đang trống)
        if (name === 'name' && (!this.state.isEditMode || !this.state.slug)) {
            this.setState({
                [name]: value,
                slug: this.generateSlug(value)
            });
        } else {
            this.setState({
                [name]: value
            });
        }
    }

    checkValidateInput = () => {
        let isValid = true;
        const { name, status } = this.state;

        if (!name.trim()) {
            toast.error('Please input category name');
            isValid = false;
            return isValid;
        }

        if (status && status !== 'active' && status !== 'inactive') {
            toast.error('Status must be "active" or "inactive"');
            isValid = false;
            return isValid;
        }

        return isValid;
    }

    handleSaveCategory = () => {
        if (!this.checkValidateInput()) {
            return;
        }

        const { name, slug, description, status, isEditMode } = this.state;
        const categoryData = {
            name: name.trim(),
            status: status || 'active'
        };

        // Chỉ thêm slug nếu có giá trị
        if (slug && slug.trim()) {
            categoryData.slug = slug.trim();
        }

        // Chỉ thêm description nếu có giá trị
        if (description && description.trim()) {
            categoryData.description = description.trim();
        }

        if (isEditMode) {
            const categoryId = this.props.categoryData?.id;
            if (categoryId) {
                this.props.updateCategory(categoryId, categoryData);
            } else {
                toast.error('Category ID not found');
            }
        } else {
            this.props.createNewCategory(categoryData);
        }
    }

    listenToEmitter = () => {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.clearForm();
        })
    }

    render() {
        let { isOpenModal, toglleFromParent } = this.props;
        let { name, slug, description, status, isEditMode } = this.state;

        return (
            <Modal
                isOpen={isOpenModal}
                toggle={toglleFromParent}
                className={'modal-category-container'}
                size="lg"
            >
                <ModalHeader toggle={toglleFromParent}>
                    {isEditMode ? 'Edit Category' : 'Create New Category'}
                </ModalHeader>
                <ModalBody>
                    <div className='modal-category-body'>
                        <div className="input-container">
                            <label>Category Name <span className="required">*</span></label>
                            <input
                                type='text'
                                name="name"
                                value={name}
                                onChange={this.handleOnChange}
                                placeholder="Enter category name"
                            />
                        </div>

                        <div className="input-container">
                            <label>Slug</label>
                            <input
                                type='text'
                                name="slug"
                                value={slug}
                                onChange={this.handleOnChange}
                                placeholder="Auto-generated from name"
                            />
                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                Slug will be auto-generated from name if left empty
                            </small>
                        </div>

                        <div className="input-container input-container-full">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={this.handleOnChange}
                                placeholder="Enter category description (optional)"
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>

                        <div className="input-container">
                            <label>Status</label>
                            <select
                                name="status"
                                onChange={this.handleOnChange}
                                value={status}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    height: '40px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        className='btn-action btn-primary'
                        onClick={this.handleSaveCategory}
                    >
                        <i className="fas fa-save"></i>
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>{' '}
                    <Button
                        color="secondary"
                        className='btn-action'
                        onClick={toglleFromParent}
                    >
                        <i className="fas fa-times"></i>
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalCategory);

