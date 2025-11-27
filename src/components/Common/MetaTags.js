import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { createAbsoluteUrl, createAbsoluteImageUrl } from '../../utils/urlHelper';

/**
 * Component để quản lý Meta Tags và Open Graph Tags cho SEO và Social Sharing
 */
class MetaTags extends Component {
    render() {
        const {
            title = 'Sản phẩm',
            description = 'Mô tả sản phẩm',
            image = '',
            url = '',
            type = 'website',
            siteName = 'Digital Marketing Store'
        } = this.props;

        // Tạo absolute URL cho image và url (hỗ trợ ngrok)
        // Sử dụng hình mặc định nếu không có hình
        const defaultImage = `${window.location.origin}/logo_F5.png`;
        const fullImageUrl = image ? createAbsoluteImageUrl(image) : defaultImage;
        const fullUrl = url ? createAbsoluteUrl(url) : window.location.href;

        return (
            <Helmet>
                {/* Basic Meta Tags */}
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={this.props.keywords || title} />

                {/* Open Graph Tags for Facebook */}
                <meta property="og:type" content={type} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={fullUrl} />
                <meta property="og:image" content={fullImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:locale" content="vi_VN" />

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={fullImageUrl} />

                {/* Canonical URL */}
                <link rel="canonical" href={fullUrl} />
            </Helmet>
        );
    }
}

export default MetaTags;

