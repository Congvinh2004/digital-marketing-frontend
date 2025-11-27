import React, { Component } from 'react';
import './FacebookShareButton.scss';
import { createAbsoluteUrl } from '../../utils/urlHelper';

/**
 * Component Facebook Share Button
 * Sử dụng Facebook Share Dialog API
 * Hỗ trợ cả localhost (với ngrok) và production
 */
class FacebookShareButton extends Component {
    handleFacebookShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const { url } = this.props;
        
        // Tạo absolute URL (hỗ trợ ngrok)
        const shareUrl = url || window.location.pathname;
        const fullUrl = createAbsoluteUrl(shareUrl);
        
        // Đảm bảo URL là absolute và encode đúng cách
        const encodedUrl = encodeURIComponent(fullUrl);
        
        // Sử dụng Facebook Share Dialog với quote và hashtag (nếu có)
        const { description } = this.props;
        let facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        
        // Thêm quote (description) nếu có
        if (description) {
            facebookShareUrl += `&quote=${encodeURIComponent(description)}`;
        }
        
        // Thêm hashtag
        facebookShareUrl += `&hashtag=%23DigitalMarketingStore`;

        // Mở Facebook Share Dialog trong popup
        const width = 626;
        const height = 436;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
            facebookShareUrl,
            'facebook-share-dialog',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes`
        );
        
        // Log để debug
        console.log('Facebook Share URL:', facebookShareUrl);
        console.log('Full URL to share:', fullUrl);
        console.log('Base URL:', window.location.origin);
    }

    render() {
        return (
            <button
                className="facebook-share-button"
                onClick={this.handleFacebookShare}
                title="Chia sẻ lên Facebook"
            >
                <i className="fab fa-facebook-f"></i>
                <span>Chia sẻ Facebook</span>
            </button>
        );
    }
}

export default FacebookShareButton;

