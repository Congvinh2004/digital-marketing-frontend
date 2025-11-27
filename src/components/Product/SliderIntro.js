import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './SliderIntro.scss';
import lider61 from '../../imgs/slider/61.jpg'
import lider62 from '../../imgs/slider/62.jpg'
class SliderIntro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 1
        };
        this.slides = [
            lider61,
            lider62
        ];
    }


    handleRedirectToProductPage = () => {
        if (this.props.history) {

            this.props.history.push(`/product`)
        }
    }
    // Hàm điều hướng giữa các slide
    plusSlides = (n) => {
        this.setState((prevState) => {
            let newIndex = prevState.slideIndex + n;
            if (newIndex > this.slides.length) newIndex = 1;
            if (newIndex < 1) newIndex = this.slides.length;
            return { slideIndex: newIndex };
        });
    };

    // Hiển thị slide hiện tại
    currentSlide = (n) => {
        this.setState({ slideIndex: n });
    };

    render() {
        const { slideIndex } = this.state;

        return (
            <div className="slider-container" >
                {/* Các slide */}
                {this.slides.map((slide, index) => (
                    <div
                        key={index}
                        className="slide"

                        style={{

                            backgroundImage: `url(${slide})`,
                            display: slideIndex === index + 1 ? 'block' : 'none'
                        }}
                    >
                        {slideIndex === 1 ?
                            <div className="col-lg-7 col-md-7 col-sm-7 align-self-center">
                                <div className="slide-item-info">
                                    <div className="slide-item-info-inner ltn__slide-animation">
                                        <h5 className="slide-sub-title ltn__secondary-color animated text-uppercase">
                                            Up To 50% Off Today Only!
                                        </h5>
                                        <h1 className="slide-title  animated" style={{ fontSize: '46px' }}>
                                            Tasty &amp; Healthy <br /> Organic Food
                                        </h1>
                                        <div className="slide-brief animated d-none">
                                            <p>
                                                Predictive analytics is drastically changing the real estate industry.
                                                In the past, providing data for quick
                                            </p>
                                        </div>
                                        <button className="btn-wrapper animated" onClick={() => this.handleRedirectToProductPage()}>

                                            Shop now
                                        </button>
                                    </div>
                                </div>
                            </div>

                            :
                            <div className="col-lg-7 col-md-7 col-sm-7 align-self-center">
                                <div className="slide-item-info">
                                    <div className="slide-item-info-inner ltn__slide-animation">
                                        <h5 className="slide-sub-title ltn__secondary-color animated text-uppercase">
                                            welcome to our shop
                                        </h5>
                                        <h1 className="slide-title  animated" style={{ fontSize: '46px' }}>
                                            Clean Fruits <br /> Quality
                                        </h1>
                                        <div className="slide-brief animated d-none">
                                            <p>
                                                Predictive analytics is drastically changing the real
                                                estate industry. In the past, providing data for quick
                                            </p>
                                        </div>
                                        <button className="btn-wrapper animated" onClick={() => this.handleRedirectToProductPage()}>

                                            Shop now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                ))}

                {/* Nút điều hướng */}
                <button className="prev" onClick={() => this.plusSlides(-1)}>
                    &#10094;
                </button>
                <button className="next" onClick={() => this.plusSlides(1)}>
                    &#10095;
                </button>

                {/* Các chấm hiển thị trạng thái */}
                <div className="dot-container">
                    {this.slides.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${slideIndex === index + 1 ? 'active' : ''}`}
                            onClick={() => this.currentSlide(index + 1)}
                        ></span>
                    ))}
                </div>
            </div>
        );
    }
} const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SliderIntro));
