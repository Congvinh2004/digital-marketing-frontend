import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './DiscountProduct.scss'
import '../../styles/base.css'
import InforProduct from './InforProduct';
class DiscountProduct extends Component {

    state = {

    }

    componentDidMount() {
    }


    render() {
        let { listProductByType } = this.props
        console.log('check props: ', listProductByType)
        return (
            <>
                <div className="tab-content" >
                    <div className="product-tab-content-inner">
                        {listProductByType && listProductByType.length > 0 &&
                            listProductByType.map((product, index) => {
                                return <InforProduct product={product} key={index} />
                            })


                        }

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

export default connect(mapStateToProps, mapDispatchToProps)(DiscountProduct);
