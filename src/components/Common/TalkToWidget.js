import React, { Component } from 'react';

/**
 * TalkTo (Tawk.to) Chat Widget Component
 * 
 * Cách sử dụng:
 * 1. Đăng ký tài khoản tại https://www.tawk.to/
 * 2. Lấy Property ID và Widget ID từ dashboard
 * 3. Truyền props: <TalkToWidget propertyId="YOUR_PROPERTY_ID" widgetId="YOUR_WIDGET_ID" />
 * 
 * Hoặc có thể cấu hình trong file config hoặc environment variables
 */
class TalkToWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scriptLoaded: false
        };
    }

    componentDidMount() {
        // Kiểm tra xem script đã được load chưa
        if (window.Tawk_API) {
            this.setState({ scriptLoaded: true });
            return;
        }

        // Lấy Property ID và Widget ID từ props hoặc config
        const propertyId = this.props.propertyId || process.env.REACT_APP_TAWKTO_PROPERTY_ID;
        const widgetId = this.props.widgetId || process.env.REACT_APP_TAWKTO_WIDGET_ID;

        if (!propertyId || !widgetId) {
            console.warn('TalkTo: Property ID và Widget ID chưa được cấu hình. Vui lòng thêm vào props hoặc environment variables.');
            return;
        }

        // Tạo và load script Tawk.to
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        
        script.onload = () => {
            this.setState({ scriptLoaded: true });
            
            // Cấu hình Tawk.to nếu cần
            if (window.Tawk_API && this.props.onLoad) {
                this.props.onLoad(window.Tawk_API);
            }
        };

        script.onerror = () => {
            console.error('TalkTo: Không thể load script. Vui lòng kiểm tra lại Property ID và Widget ID.');
        };

        // Thêm script vào document
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.head.appendChild(script);
        }

        // Cleanup function
        this.scriptElement = script;
    }

    componentWillUnmount() {
        // Có thể ẩn widget khi component unmount nếu cần
        if (window.Tawk_API && this.props.hideOnUnmount) {
            window.Tawk_API.hideWidget();
        }
    }

    // Method để show widget (có thể gọi từ bên ngoài)
    showWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.showWidget();
        }
    }

    // Method để hide widget
    hideWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.hideWidget();
        }
    }

    // Method để toggle widget
    toggleWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.toggle();
        }
    }

    // Method để maximize widget
    maximizeWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.maximize();
        }
    }

    // Method để minimize widget
    minimizeWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.minimize();
        }
    }

    render() {
        // Component này không render gì, chỉ load script
        return null;
    }
}

export default TalkToWidget;

