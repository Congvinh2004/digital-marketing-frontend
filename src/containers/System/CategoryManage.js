import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import "./CategoryManage.scss"
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryService"
import ModalCategory from './ModalCategory';
import { emitter } from '../../utils/emitter'
import { toast } from 'react-toastify';

class CategoryManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listCategories: [],
            isOpenModal: false,
            currentCategory: null // Category đang được edit
        };
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
        await this.getAllCategoriesFromReact()
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getAllCategoriesFromReact = async () => {
        try {
            let response = await getAllCategories()
            
            if (!this._isMounted) {
                return;
            }
            
            if (response && response.errCode === 0 && response.data) {
                if (this._isMounted) {
                    this.setState({
                        listCategories: Array.isArray(response.data) ? response.data : []
                    })
                }
            } else {
                if (this._isMounted) {
                    this.setState({
                        listCategories: []
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            
            if (this._isMounted) {
                toast.error('Failed to load categories');
                this.setState({
                    listCategories: []
                })
            }
        }
    }

    handleOpenModalCategory = (category = null) => {
        this.setState({
            isOpenModal: true,
            currentCategory: category // null nếu là add mode, category object nếu là edit mode
        })
    }

    toglleCategoryModal = () => {
        this.setState({
            isOpenModal: !this.state.isOpenModal,
            currentCategory: null // Reset khi đóng modal
        })
    }

    createNewCategory = async (data) => {
        try {
            let response = await createCategory(data);
            console.log('check response: ', response)
            
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                toast.success('Create category successfully!');
                this.toglleCategoryModal();
                await this.getAllCategoriesFromReact();
                emitter.emit('EVENT_CATEGORIES_UPDATED');
            } else {
                toast.error(response.errMessage || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            if (this._isMounted) {
                const errorMsg = error.response?.data?.errMessage || error.message || 'Failed to create category';
                toast.error(errorMsg);
            }
        }
    }

    handleUpdateCategory = async (categoryId, data) => {
        try {
            let response = await updateCategory(categoryId, data);
            console.log('check response: ', response)
            
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                toast.success('Update category successfully!');
                this.toglleCategoryModal();
                await this.getAllCategoriesFromReact();
                emitter.emit('EVENT_CATEGORIES_UPDATED');
            } else {
                toast.error(response.errMessage || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            if (this._isMounted) {
                const errorMsg = error.response?.data?.errMessage || error.message || 'Failed to update category';
                toast.error(errorMsg);
            }
        }
    }

    handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            let response = await deleteCategory(categoryId);
            
            if (!this._isMounted) return;
            
            if (response && response.errCode === 0) {
                toast.success('Delete category successfully!');
                await this.getAllCategoriesFromReact();
                emitter.emit('EVENT_CATEGORIES_UPDATED');
            } else {
                toast.error(response.errMessage || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            if (this._isMounted) {
                const errorMsg = error.response?.data?.errMessage || error.message || 'Failed to delete category';
                toast.error(errorMsg);
            }
        }
    }

    render() {
        let { listCategories, isOpenModal, currentCategory } = this.state
        return (
            <>
                <ModalCategory 
                    createNewCategory={this.createNewCategory}
                    updateCategory={this.handleUpdateCategory}
                    isOpenModal={isOpenModal} 
                    toglleFromParent={this.toglleCategoryModal}
                    categoryData={currentCategory}
                />

                <div className="category-container">
                    <div className="title text-center">
                        <h2>Manage Categories</h2>
                    </div>

                    <div className='action-bar'>
                        <button className='btn btn-primary' onClick={() => this.handleOpenModalCategory()}>
                            <i className="fas fa-plus"></i>
                            Add a new category
                        </button>
                        <button className='btn btn-secondary' onClick={this.getAllCategoriesFromReact}>
                            <i className="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>

                    {
                        listCategories && listCategories.length > 0 ? (
                            <table id="categories">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listCategories.map((category, index) => {
                                        return (
                                            <tr key={category.id || index}>
                                                <td>{category.id}</td>
                                                <td>{category.name}</td>
                                                <td>{category.slug || '-'}</td>
                                                <td className="description-cell">{category.description || '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${category.status === 'active' ? 'active' : 'inactive'}`}>
                                                        {category.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="action-icon">
                                                    <span className='_edit' onClick={() => this.handleOpenModalCategory(category)}>
                                                        <i className="fas fa-edit"></i>
                                                    </span>
                                                    <span className='_delete' onClick={() => this.handleDeleteCategory(category.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className='no-categories'>
                                <i className="fas fa-folder-open"></i>
                                <p>No categories found</p>
                            </div>
                        )
                    }
                </div>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CategoryManage));

