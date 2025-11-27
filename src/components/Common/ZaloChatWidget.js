import React, { Component } from 'react';
import zaloIcon from '../../assets/images/icons8-zalo.svg';
import './ZaloChatWidget.scss';

class ZaloChatWidget extends Component {
    handleOpenZaloProfile = () => {
        // Mở Zalo profile/chat - lấy Zalo ID từ props
        const zaloId = '0707963726';
        // Mở Zalo chat trong tab mới
        window.open(`https://zalo.me/${zaloId}`, '_blank');
    }

    render() {
        return (
            <div className="zalo-chat-widget">
                {/* Zalo Contact Button - Mở Zalo Profile/Chat */}
                <button 
                    className="zalo-chat-button" 
                    onClick={this.handleOpenZaloProfile}
                    title="Liên hệ qua Zalo"
                >
                    <img src={zaloIcon} alt="Zalo" className="zalo-icon" />
                </button>
            </div>
        );
    }
}

export default ZaloChatWidget;

