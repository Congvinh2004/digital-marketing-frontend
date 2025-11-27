import React, { Component } from 'react';
import './ShareThisWidget.scss';

/**
 * ShareThis Widget Component
 * Sử dụng ShareThis để chia sẻ lên các mạng xã hội
 * 
 * Cách sử dụng:
 * 1. Đăng ký tại https://www.sharethis.com/
 * 2. Lấy Property ID từ dashboard
 * 3. Thêm vào .env: REACT_APP_SHARETHIS_PROPERTY_ID=your_property_id
 * 4. Hoặc truyền trực tiếp qua props: propertyId="your_property_id"
 */
class ShareThisWidget extends Component {
    constructor(props) {
        super(props);
        this.shareThisLoaded = false;
    }

    componentDidMount() {
        this.loadShareThis();
    }

    componentDidUpdate(prevProps) {
        // Reload ShareThis nếu URL hoặc data thay đổi
        if ((prevProps.url !== this.props.url || 
             prevProps.title !== this.props.title ||
             prevProps.description !== this.props.description) && 
            this.shareThisLoaded && window.__sharethis__) {
            // Force reload ShareThis với data mới
            setTimeout(() => {
                if (window.__sharethis__ && window.__sharethis__.load) {
                    window.__sharethis__.load();
                }
            }, 100);
        }
    }

    loadShareThis = () => {
        // Kiểm tra xem ShareThis đã được load chưa
        if (window.__sharethis__) {
            this.shareThisLoaded = true;
            return;
        }

        // Lấy Property ID từ props hoặc environment variable
        const propertyId = this.props.propertyId || process.env.REACT_APP_SHARETHIS_PROPERTY_ID || 'your-property-id';

        if (propertyId === 'your-property-id') {
            console.warn('ShareThis: Property ID chưa được cấu hình. Vui lòng thêm REACT_APP_SHARETHIS_PROPERTY_ID vào .env hoặc truyền qua props.');
            return;
        }

        // Load ShareThis script
        const script = document.createElement('script');
        script.src = `https://platform-api.sharethis.com/js/sharethis.js#property=${propertyId}&product=inline-share-buttons`;
        script.async = true;
        script.onload = () => {
            this.shareThisLoaded = true;
            // Khởi tạo ShareThis sau khi script load
            if (window.__sharethis__ && window.__sharethis__.load) {
                window.__sharethis__.load();
            }
        };
        script.onerror = () => {
            console.error('ShareThis: Không thể load script. Vui lòng kiểm tra Property ID.');
        };

        document.head.appendChild(script);
    }

    render() {
        const { url, title, description, image } = this.props;

        // Tạo absolute URL cho image
        const baseUrl = window.location.origin;
        const absoluteImageUrl = image 
            ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : '/' + image}`)
            : '';

        // Tạo absolute URL
        const absoluteUrl = url 
            ? (url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`)
            : window.location.href;

        // Tạo data attributes cho ShareThis
        const shareData = {
            'data-url': absoluteUrl,
            'data-title': title || document.title,
            'data-description': description || '',
        };

        // Thêm image nếu có
        if (absoluteImageUrl) {
            shareData['data-image'] = absoluteImageUrl;
        }

        return (
            <div className="sharethis-widget">
                <div 
                    className="sharethis-inline-share-buttons"
                    {...shareData}
                ></div>
            </div>
        );
    }
}

export default ShareThisWidget;

