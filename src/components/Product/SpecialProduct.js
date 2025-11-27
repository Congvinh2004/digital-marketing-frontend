import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import InforProduct from './InforProduct';
import "./SpecialProduct.scss"
import { path } from '../../utils/constant';

class SpecialProduct extends Component {

    state = {

    }

    componentDidMount() {
    }

    handleSeeMore = () => {
        if (this.props.history) {
            this.props.history.push(path.HOMEPRODUCT);
        }
    }

    render() {
        const { discountProducts = [] } = this.props;
        
        var settings = {
            dots: false,
            infinite: discountProducts.length > 4,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                }
            ]
        };
        
        return (
            <>
                <div className='special-product-container'>
                    <div className='container'>
                        <div className='special-product-top'>
                            <span>
                                Special Offers
                            </span>
                            <div className='see-more'>
                                <button className='btn-see-more' onClick={this.handleSeeMore}>
                                    See more
                                    <i className="fas fa-long-arrow-alt-right"></i>
                                </button>
                            </div>
                        </div>

                        <div className='special-product-bottom'>
                            <div className='special-product-content'>
                            {discountProducts && discountProducts.length > 0 ? (
                                <Slider {...settings}>
                                    {discountProducts.map((product, index) => {
                                        const productId = product.id || product.productID || index;
                                        return (
                                            <div key={productId} className='img-customize'>
                                                <InforProduct 
                                                    product={product}
                                                    productImg={product.image || product.productImage || product.imageUrl}
                                                />
                                            </div>
                                        );
                                    })}
                                </Slider>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    Không có sản phẩm đang giảm giá
                                </div>
                            )}
                            </div>
                        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SpecialProduct));
