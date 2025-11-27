import React, { Component } from 'react';
import './PayPalButton.scss';

class PayPalButton extends Component {
    constructor(props) {
        super(props);
        this.paypalRef = React.createRef();
    }

    componentDidMount() {
        // Load PayPal SDK script
        if (window.paypal) {
            this.renderPayPalButton();
        } else {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.props.clientId || 'YOUR_CLIENT_ID'}&currency=USD`;
            script.async = true;
            script.onload = () => {
                this.renderPayPalButton();
            };
            script.onerror = () => {
                console.error('Failed to load PayPal SDK');
            };
            document.body.appendChild(script);
            this.paypalScript = script;
        }
    }

    componentDidUpdate(prevProps) {
        // Re-render button nếu amount hoặc clientId thay đổi
        if (prevProps.amount !== this.props.amount || prevProps.clientId !== this.props.clientId) {
            if (window.paypal && this.paypalRef.current) {
                // Clear previous button
                this.paypalRef.current.innerHTML = '';
                this.renderPayPalButton();
            }
        }
    }

    componentWillUnmount() {
        // Cleanup
        if (this.paypalRef.current) {
            this.paypalRef.current.innerHTML = '';
        }
    }

    renderPayPalButton = () => {
        if (!window.paypal || !this.paypalRef.current) {
            return;
        }

        window.paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            },
            createOrder: (data, actions) => {
                // Tạo order trên PayPal
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: this.props.amount || '0.00',
                            currency_code: 'USD'
                        },
                        description: this.props.description || 'Order payment'
                    }]
                });
            },
            onApprove: (data, actions) => {
                // Xử lý khi thanh toán được approve
                return actions.order.capture().then((details) => {
                    // Gọi callback khi thanh toán thành công
                    if (this.props.onSuccess) {
                        this.props.onSuccess(details, data);
                    }
                });
            },
            onError: (err) => {
                // Xử lý lỗi
                if (this.props.onError) {
                    this.props.onError(err);
                }
            },
            onCancel: (data) => {
                // Xử lý khi user hủy thanh toán
                if (this.props.onCancel) {
                    this.props.onCancel(data);
                }
            }
        }).render(this.paypalRef.current);
    }

    render() {
        return (
            <div className="paypal-button-container">
                <div ref={this.paypalRef}></div>
            </div>
        );
    }
}

export default PayPalButton;

