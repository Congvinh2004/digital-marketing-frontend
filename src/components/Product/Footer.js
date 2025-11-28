import React, { Component } from 'react';
import './Footer.scss';
import logo from '../../imgs/logo_F5.png';
import payment from '../../imgs/icons/payment-4.png';
import Newsletter from '../Common/Newsletter';

/**
 * Footer Component
 * Component hiển thị footer của trang web với thông tin liên hệ, links hỗ trợ, và newsletter
 */
class Footer extends Component {
    render() {
        return (
            <footer className="ltn__footer-area">
                <div className='footer-container'>
                    <div className="footer-top-area section-bg-1 plr--5">
                        <div className="container-fluid">
                            <div className="row">
                                <div className='top-footer-content'>

                                    <div className="col-4">
                                        <div className="footer-widget footer-about-widget">
                                            <div>
                                                <div className="footer-logo mb-10">
                                                    <div className="site-logo">
                                                        <img src={logo} alt="Logo" />
                                                    </div>
                                                </div>

                                                <div className="footer-address">
                                                    <ul className='list-contact'>
                                                        <li className='item-contact'>
                                                            <div className="footer-address-icon">
                                                                <i className="icon-placeholder" />
                                                            </div>
                                                            <div className="footer-address-info">
                                                                <p>Brooklyn, New York, United States</p>
                                                            </div>
                                                        </li>
                                                        <li className='item-contact'>
                                                            <div className="footer-address-icon">
                                                                <i className="icon-call" />
                                                            </div>
                                                            <div className="footer-address-info">
                                                                <p>
                                                                    <a href="tel:+0123-456789">+0123-456789</a>
                                                                </p>
                                                            </div>
                                                        </li>
                                                        <li className='item-contact'>
                                                            <div className="footer-address-icon">
                                                                <i className="icon-mail" />
                                                            </div>
                                                            <div className="footer-address-info">
                                                                <p>
                                                                    <a href="mailto:example@example.com">
                                                                        example@example.com
                                                                    </a>
                                                                </p>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="ltn__social-media mt-20">
                                                    <ul className='list-contact-icons'>
                                                        <li>
                                                            <a href="#" title="Facebook">
                                                                <i className="fab fa-facebook-f" />
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="#" title="Twitter">
                                                                <i className="fab fa-twitter" />
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="#" title="Linkedin">
                                                                <i className="fab fa-linkedin" />
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="#" title="Youtube">
                                                                <i className="fab fa-youtube" />
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                    <div className="col-4">
                                        <div className="footer-section">
                                            <div>
                                                <h4 className='title-about'>Support Links</h4>
                                                <ul className='list-about'>
                                                    <li><a href="/about">Introduce</a></li>
                                                    <li><a href="/faq">Frequently Asked Questions</a></li>
                                                    <li><a href="/support">Customer Support</a></li>
                                                    <li><a href="/privacy">Privacy Policy</a></li>
                                                </ul>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="col-4">
                                        <div className="footer-newsletter-widget">
                                            <div className='footer-newsletter-widget-content'>
                                                <h4 className="footer-title">Newsletter</h4>
                                                <p>
                                                    <br /> Subscribe to our weekly Newsletter and
                                                    <br /> receive updates via email.
                                                </p>
                                                <div className="footer-newsletter">
                                                    <Newsletter variant="inline" />
                                                </div>
                                                <h5 className='payment-title'>We Accept</h5>
                                                <img src={payment} alt="Payment Image" />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ltn__copyright-area ltn__copyright-2 section-bg-1 border-top  ltn__border-top-2--- plr--5">

                        <div className="ltn__copyright-design clearfix">
                            <p style={{ fontSize: '15px', color: '#4b4b4b' }}>
                                © 2024. SMOLDER Trading Joint Stock Company
                            </p>
                        </div>


                        <div className="ltn__copyright-menu text-end">
                            <ul className='copyright-menu-list'>
                                <li className='copyright-menu-item'>
                                    <a href="#">Terms &amp; Conditions</a>
                                </li>
                                <li className='copyright-menu-item'>
                                    <a href="#">Claim</a>
                                </li>
                                <li className='copyright-menu-item'>
                                    <a href="#">Privacy &amp; Policy</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


            </footer>

        );
    }
}

export default Footer;
