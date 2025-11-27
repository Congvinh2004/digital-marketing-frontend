import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './CategoryMenu.scss'
import { getAllCategories } from '../../services/productService';
class CategoryMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listCategories: []
        }
    }

    componentDidMount() {
        this.getAllCategories();
    }

    getAllCategories = async () => {
        let res = await getAllCategories();
        if (res && res.errCode === 0) {
            this.setState({
                listCategories: res.data
            })
        }
    }

    handleCategoryClick = (category_id) => {
        console.log('check category_id: ', category_id)
        // Gọi callback từ parent component (HomeProduct)
        if (this.props.onCategoryClick) {
            this.props.onCategoryClick(category_id);
        }
    }

    render() {
        let { listCategories } = this.state;
        console.log('check listCategories: ', listCategories)
        return (
            <>
                <div className="category-menu-container">
                    <div className="category-menu-title">
                        <h2 className="title">
                            categories
                        </h2>
                    </div>
                    <div className="list-category-container">
                        <ul className='list-category'>
                            {/* Option để hiển thị "Tất cả" */}
                            <li 
                                onClick={() => this.handleCategoryClick(null)} 
                                className={`item-category ${!this.props.selectedCategoryId ? 'active' : ''}`}
                            >
                                <a>
                                    <i className="icon-shopping-bags" />
                                    Tất cả
                                </a>
                            </li>
                            {listCategories && listCategories.length > 0 && listCategories.map((item, index) => {
                                return (
                                    <li 
                                        onClick={() => this.handleCategoryClick(item.id)} 
                                        className={`item-category ${this.props.selectedCategoryId === item.id ? 'active' : ''}`} 
                                        key={index}
                                    >
                                        <a>
                                            <i className="icon-shopping-bags" />
                                            {item.name}
                                        </a>
                                    </li>
                                )
                            })}
                           
                            
                        </ul>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryMenu);
