import React, { Component } from 'react';
import { getDailyRevenue, getMonthlyRevenue } from '../../services/revenueService';
import './RevenueStats.scss';

/**
 * RevenueStats Component
 * Hiển thị tổng hợp doanh thu theo ngày và tháng
 */
class RevenueStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dailyRevenue: 0,
            monthlyRevenue: 0,
            isLoading: true,
            currency: 'VND', // hoặc 'USD'
            apiAvailable: true, // Flag để biết API có sẵn sàng không
            errorMessage: null
        };
    }

    componentDidMount() {
        this.loadRevenueData();
    }

    loadRevenueData = async () => {
        try {
            this.setState({ isLoading: true });

            // Gọi API revenue theo format backend
            // API Response format: { errCode, errMessage, data }
            // data.revenue.vnd - Doanh thu VNĐ
            // data.revenue.usd - Doanh thu USD
            // data.revenue.orderCount - Số đơn hàng
            const [dailyResponse, monthlyResponse] = await Promise.allSettled([
                getDailyRevenue(), // GET /api/revenue/daily
                getMonthlyRevenue() // GET /api/revenue/monthly
            ]);

            let dailyRevenue = 0;
            let monthlyRevenue = 0;

            // Xử lý daily revenue
            // Lưu ý: Axios interceptor đã parse và trả về data trực tiếp (không phải response.data)
            if (dailyResponse.status === 'fulfilled') {
                const data = dailyResponse.value;
                
                // Debug log để kiểm tra response structure
                console.log('Daily Revenue Response:', data);
                
                // Axios interceptor trả về data trực tiếp với format: { errCode, errMessage, data }
                // Nếu errCode === 0, interceptor đã trả về data, nên data ở đây là response.data
                // Nếu có errCode !== 0, interceptor đã reject promise
                if (data && data.errCode === 0 && data.data) {
                    const revenueData = data.data.revenue;
                    dailyRevenue = revenueData?.vnd || 0;
                    console.log('Daily Revenue parsed:', dailyRevenue);
                } else {
                    console.warn('Daily revenue API error:', data?.errMessage || 'Unknown error', data);
                }
            } else {
                // Promise bị reject - có thể là lỗi network hoặc API không tồn tại
                const error = dailyResponse.reason;
                console.error('Daily revenue API failed:', {
                    status: error?.response?.status,
                    message: error?.message,
                    error: error
                });
                if (error?.response?.status === 404) {
                    console.warn('⚠️ API /api/revenue/daily not found (404) - Backend may not have implemented this endpoint yet');
                    this.setState({ apiAvailable: false });
                }
            }

            // Xử lý monthly revenue
            if (monthlyResponse.status === 'fulfilled') {
                const data = monthlyResponse.value;
                
                // Debug log để kiểm tra response structure
                console.log('Monthly Revenue Response:', data);
                
                // Axios interceptor trả về data trực tiếp với format: { errCode, errMessage, data }
                if (data && data.errCode === 0 && data.data) {
                    const revenueData = data.data.revenue;
                    monthlyRevenue = revenueData?.vnd || 0;
                    console.log('Monthly Revenue parsed:', monthlyRevenue);
                } else {
                    console.warn('Monthly revenue API error:', data?.errMessage || 'Unknown error', data);
                }
            } else {
                // Promise bị reject - có thể là lỗi network hoặc API không tồn tại
                const error = monthlyResponse.reason;
                console.error('Monthly revenue API failed:', {
                    status: error?.response?.status,
                    message: error?.message,
                    error: error
                });
                if (error?.response?.status === 404) {
                    console.warn('⚠️ API /api/revenue/monthly not found (404) - Backend may not have implemented this endpoint yet');
                    this.setState({ apiAvailable: false });
                }
            }

            this.setState({
                dailyRevenue: dailyRevenue,
                monthlyRevenue: monthlyRevenue,
                isLoading: false
            });
        } catch (error) {
            console.error('Error loading revenue data:', error);
            this.setState({
                dailyRevenue: 0,
                monthlyRevenue: 0,
                isLoading: false
            });
        }
    }


    formatCurrency = (amount) => {
        if (this.state.currency === 'USD') {
            return `$${(amount / 25000).toFixed(2)}`;
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    render() {
        const { dailyRevenue, monthlyRevenue, isLoading, apiAvailable } = this.state;

        return (
            <div className="revenue-stats-container">
                <div className="revenue-stats-header">
                    <h3>Tổng hợp doanh thu</h3>
                    <button 
                        className="refresh-btn" 
                        onClick={this.loadRevenueData}
                        disabled={isLoading}
                        title="Làm mới"
                    >
                        <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                    </button>
                </div>

                {!apiAvailable && !isLoading && (
                    <div className="revenue-api-warning">
                        <i className="fas fa-info-circle"></i>
                        <span>API doanh thu chưa được triển khai trên backend. Vui lòng liên hệ admin để kích hoạt.</span>
                    </div>
                )}
                <div className="revenue-stats-grid">
                    <div className="revenue-card daily-revenue">
                        <div className="revenue-icon">
                            <i className="fas fa-calendar-day"></i>
                        </div>
                        <div className="revenue-content">
                            <div className="revenue-label">Doanh thu hôm nay</div>
                            <div className="revenue-value">
                                {isLoading ? (
                                    <div className="loading-spinner">
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </div>
                                ) : (
                                    this.formatCurrency(dailyRevenue)
                                )}
                            </div>
                            <div className="revenue-date">
                                {new Date().toLocaleDateString('vi-VN', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="revenue-card monthly-revenue">
                        <div className="revenue-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="revenue-content">
                            <div className="revenue-label">Doanh thu tháng này</div>
                            <div className="revenue-value">
                                {isLoading ? (
                                    <div className="loading-spinner">
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </div>
                                ) : (
                                    this.formatCurrency(monthlyRevenue)
                                )}
                            </div>
                            <div className="revenue-date">
                                Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RevenueStats;

