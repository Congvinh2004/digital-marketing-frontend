import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { getAllOrders, updateOrderStatus, getOrderDetail, updatePaymentStatus } from '../../services/orderManageService';
import RevenueStats from '../../components/System/RevenueStats';
import CustomScrollbars from '../../components/CustomScrollbars';
import './OrderManage.scss';

/**
 * OrderManage Component
 * Trang quản lý đơn hàng và doanh thu
 */
class OrderManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            isLoading: true,
            currentPage: 1,
            totalPages: 1,
            total: 0,
            limit: 20, // Tăng limit lên 20 để hiển thị nhiều đơn hàng hơn
            statusFilter: 'all', // all, pending, paid, shipped, completed, cancelled
            selectedOrder: null,
            showOrderDetail: false
        };
    }

    componentDidMount() {
        this.loadOrders();
    }

    loadOrders = async () => {
        try {
            this.setState({ isLoading: true });

            const params = {
                page: this.state.currentPage,
                limit: this.state.limit
            };

            // Thêm status filter nếu không phải 'all'
            if (this.state.statusFilter !== 'all') {
                params.status = this.state.statusFilter;
            }

            const response = await getAllOrders(params);

            // Parse response theo format: { errCode, errMessage, data }
            if (response && response.errCode === 0 && response.data) {
                const orders = response.data.orders || [];
                const pagination = response.data.pagination || {};
                const totalPages = pagination.totalPages || 1;
                const total = pagination.total || 0;
                
                this.setState({
                    orders: orders,
                    totalPages: totalPages,
                    total: total,
                    isLoading: false
                });
            } else {
                throw new Error(response?.errMessage || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error(error?.response?.data?.errMessage || error?.message || 'Không thể tải danh sách đơn hàng');
            this.setState({
                orders: [],
                isLoading: false
            });
        }
    }

    handleStatusFilterChange = (status) => {
        this.setState({ statusFilter: status, currentPage: 1 }, () => {
            this.loadOrders();
        });
    }

    handlePageChange = (page) => {
        this.setState({ currentPage: page }, () => {
            this.loadOrders();
        });
    }

    handleStatusUpdate = async (orderId, newStatus) => {
        try {
            // Tìm order để lấy payment_method
            const order = this.state.orders.find(o => o.id === orderId) || this.state.selectedOrder;
            const paymentMethod = order?.payment_method;

            // Cập nhật trạng thái đơn hàng
            const response = await updateOrderStatus(orderId, newStatus);

            if (response && response.errCode === 0) {
                // Tự động cập nhật payment_status dựa trên payment_method và trạng thái đơn hàng
                let shouldUpdatePaymentStatus = false;
                let newPaymentStatus = null;

                // COD: Khi trạng thái đơn hàng chuyển thành "completed" → payment_status = "completed"
                if (paymentMethod === 'COD' && newStatus === 'completed') {
                    shouldUpdatePaymentStatus = true;
                    newPaymentStatus = 'completed';
                }
                // PayPal: Khi trạng thái đơn hàng chuyển thành "paid" → payment_status = "paid"
                else if (paymentMethod === 'paypal' && newStatus === 'paid') {
                    shouldUpdatePaymentStatus = true;
                    newPaymentStatus = 'paid';
                }

                // Cập nhật payment_status nếu cần
                if (shouldUpdatePaymentStatus && newPaymentStatus) {
                    try {
                        await updatePaymentStatus(orderId, newPaymentStatus);
                    } catch (paymentError) {
                        console.error('Error updating payment status:', paymentError);
                        // Không hiển thị lỗi cho user vì đây là cập nhật tự động
                    }
                }

                toast.success(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
                // Reload danh sách đơn hàng
                this.loadOrders();
                // Nếu đang mở modal chi tiết, reload lại order detail
                if (this.state.showOrderDetail && this.state.selectedOrder && this.state.selectedOrder.id === orderId) {
                    this.loadOrderDetail(orderId);
                }
            } else {
                throw new Error(response?.errMessage || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error?.response?.data?.errMessage || error?.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    }

    loadOrderDetail = async (orderId) => {
        try {
            const response = await getOrderDetail(orderId);
            
            if (response && response.errCode === 0 && response.data) {
                // API trả về { data: { order: {...}, payment: {...} } }
                const orderData = response.data.order || response.data;
                const paymentData = response.data.payment || {};
                
                // Merge order và payment data
                // Lấy payment_status từ nhiều nguồn (ưu tiên paymentData vì có thể có dữ liệu mới nhất)
                const paymentStatus = paymentData.paymentStatus ||      // camelCase từ payment object
                                     paymentData.payment_status ||      // snake_case từ payment object
                                     paymentData.paymentstatus ||      // không có dấu gạch dưới
                                     orderData.payment_status ||       // từ order object
                                     null;
                
                // Lấy payment_method từ nhiều nguồn (ưu tiên paymentData)
                const paymentMethod = paymentData.paymentMethod ||     // camelCase từ payment object
                                      paymentData.payment_method ||     // snake_case từ payment object
                                      paymentData.paymentmethod ||     // không có dấu gạch dưới
                                      orderData.payment_method ||      // từ order object
                                      null;
                
                const fullOrderData = {
                    ...orderData,
                    // Lấy status từ order (hỗ trợ cả status và order_status)
                    status: orderData.status || orderData.order_status || null,
                    order_status: orderData.order_status || orderData.status || null,
                    // Đảm bảo payment_method và payment_status được set đúng
                    payment_method: paymentMethod,
                    payment_status: paymentStatus,
                    // Giữ lại payment data nếu cần
                    payment: paymentData
                };
                
                // Đảm bảo setState với dữ liệu đầy đủ
                this.setState({
                    selectedOrder: { ...fullOrderData } // Tạo object mới để đảm bảo React detect thay đổi
                });
            } else {
                throw new Error(response?.errMessage || 'Failed to load order detail');
            }
        } catch (error) {
            console.error('Error loading order detail:', error);
            toast.error(error?.response?.data?.errMessage || error?.message || 'Không thể tải chi tiết đơn hàng');
        }
    }

    handleViewOrderDetail = async (order) => {
        // Mở modal trước
        this.setState({ 
            showOrderDetail: true 
        });
        
        // Load chi tiết đầy đủ từ API ngay (không set order từ danh sách vì có thể thiếu thông tin)
        await this.loadOrderDetail(order.id);
    }

    formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusBadgeClass = (status) => {
        const statusClasses = {
            pending: 'badge-warning',
            paid: 'badge-info',
            shipped: 'badge-primary',
            completed: 'badge-success',
            cancelled: 'badge-danger'
        };
        return statusClasses[status] || 'badge-secondary';
    }

    getStatusLabel = (status, paymentMethod = null) => {
        // Với COD: pending = "Chờ vận chuyển", paid = "Chờ thanh toán"
        // Với PayPal: pending = "Chờ thanh toán", paid = "Đã thanh toán"
        if (paymentMethod === 'COD') {
            const codStatusLabels = {
                pending: 'Chờ vận chuyển',
                paid: 'Chờ thanh toán',
                shipped: 'Đang vận chuyển',
                completed: 'Hoàn thành',
                cancelled: 'Đã hủy'
            };
            return codStatusLabels[status] || status;
        }
        
        // Mặc định cho PayPal và các hình thức khác
        const statusLabels = {
            pending: 'Chờ thanh toán',
            paid: 'Đã thanh toán',
            shipped: 'Đang vận chuyển',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return statusLabels[status] || status;
    }

    getNextStatusOptions = (currentStatus, paymentMethod = null) => {
        // Với COD: pending (chờ vận chuyển) → paid (chờ thanh toán) → completed (hoàn thành)
        // Với PayPal: pending (chờ thanh toán) → paid (đã thanh toán) → shipped (đang vận chuyển) → completed (hoàn thành)
        if (paymentMethod === 'COD') {
            const codStatusFlow = {
                pending: ['paid', 'cancelled'], // Chờ vận chuyển → Chờ thanh toán
                paid: ['completed', 'cancelled'], // Chờ thanh toán → Hoàn thành
                completed: [], // Không thể thay đổi
                cancelled: [] // Không thể thay đổi
            };
            return codStatusFlow[currentStatus] || [];
        }
        
        // Mặc định cho PayPal và các hình thức khác
        const statusFlow = {
            pending: ['paid', 'cancelled'],
            paid: ['shipped', 'cancelled'],
            shipped: ['completed'],
            completed: [], // Không thể thay đổi
            cancelled: [] // Không thể thay đổi
        };
        return statusFlow[currentStatus] || [];
    }

    getPaymentMethodLabel = (paymentMethod) => {
        const paymentMethodLabels = {
            'COD': 'COD',
            'paypal': 'PayPal',
            'vnpay': 'VNPay'
        };
        return paymentMethodLabels[paymentMethod] || paymentMethod || 'N/A';
    }

    getPaymentStatusBadgeClass = (paymentStatus) => {
        const paymentStatusClasses = {
            paid: 'badge-success',
            unpaid: 'badge-danger',
            pending: 'badge-warning',
            completed: 'badge-success',
            failed: 'badge-danger',
            cancelled: 'badge-secondary',
            refunded: 'badge-secondary'
        };
        return paymentStatusClasses[paymentStatus] || 'badge-secondary';
    }

    getPaymentStatusLabel = (paymentStatus) => {
        const paymentStatusLabels = {
            paid: 'Đã thanh toán',
            unpaid: 'Chưa thanh toán',
            pending: 'Chờ thanh toán',
            completed: 'Thanh toán hoàn tất',
            failed: 'Thanh toán thất bại',
            cancelled: 'Thanh toán đã bị hủy',
            refunded: 'Đã hoàn tiền'
        };
        return paymentStatusLabels[paymentStatus] || paymentStatus || 'N/A';
    }

    // Helper function để lấy thông tin khách hàng (ưu tiên từ customer_info)
    getCustomerInfo = (order) => {
        if (!order) return { full_name: 'N/A', email: '', phone: '' };
        
        // Ưu tiên customer_info (thông tin từ shipping_address)
        if (order.customer_info) {
            return {
                full_name: order.customer_info.full_name || 'N/A',
                email: order.customer_info.email || '',
                phone: order.customer_info.phone || ''
            };
        }
        
        // Fallback về customer hoặc user
        return {
            full_name: order.customer?.full_name || order.user?.full_name || 'N/A',
            email: order.customer?.email || order.user?.email || '',
            phone: order.customer?.phone || order.user?.phone || ''
        };
    }

    render() {
        const { orders, isLoading, currentPage, totalPages, total, statusFilter } = this.state;

        return (
            <div className="order-manage-wrapper">
                <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                    <div className="order-manage-container">
                        {/* Revenue Stats Section */}
                        <RevenueStats />

                {/* Orders Management Section */}
                <div className="orders-section">
                    <div className="section-header">
                        <h3>Quản lý đơn hàng</h3>
                        <button 
                            className="refresh-btn" 
                            onClick={this.loadOrders}
                            disabled={isLoading}
                            title="Làm mới"
                        >
                            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                        </button>
                    </div>

                    {/* Status Filter và Limit Selector */}
                    <div className="filter-controls">
                        <div className="status-filter">
                            <button
                                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => this.handleStatusFilterChange('all')}
                            >
                                Tất cả ({total})
                            </button>
                        <button
                            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => this.handleStatusFilterChange('pending')}
                        >
                            Chờ thanh toán
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
                            onClick={() => this.handleStatusFilterChange('paid')}
                        >
                            Đã thanh toán
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
                            onClick={() => this.handleStatusFilterChange('shipped')}
                        >
                            Đang vận chuyển
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                            onClick={() => this.handleStatusFilterChange('completed')}
                        >
                            Hoàn thành
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => this.handleStatusFilterChange('cancelled')}
                        >
                            Đã hủy
                        </button>
                        </div>
                        
                        <div className="limit-selector">
                            <label>Số đơn hàng mỗi trang:</label>
                            <select
                                value={this.state.limit}
                                onChange={(e) => {
                                    const newLimit = parseInt(e.target.value);
                                    this.setState({ limit: newLimit, currentPage: 1 }, () => {
                                        this.loadOrders();
                                    });
                                }}
                                className="limit-select"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                {total > 100 && <option value={total}>Tất cả ({total})</option>}
                            </select>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="orders-table-wrapper">
                        {isLoading ? (
                            <div className="loading-container">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Đang tải danh sách đơn hàng...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-inbox"></i>
                                <p>Không có đơn hàng nào</p>
                            </div>
                        ) : (
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Hình thức thanh toán</th>
                                        <th>Trạng thái đơn hàng</th>
                                        <th>Trạng thái thanh toán</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => {
                                        const customerInfo = this.getCustomerInfo(order);
                                        return (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="customer-name">
                                                        {customerInfo.full_name}
                                                    </div>
                                                    <div className="customer-phone">
                                                        {customerInfo.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="amount-cell">
                                                {this.formatCurrency(order.total_amount || 0)}
                                            </td>
                                            <td>
                                                <span className="payment-method-badge">
                                                    {this.getPaymentMethodLabel(order.payment_method)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${this.getStatusBadgeClass(order.status || order.order_status)}`}>
                                                    {this.getStatusLabel(order.status || order.order_status, order.payment_method)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${this.getPaymentStatusBadgeClass(order.payment_status)}`}>
                                                    {this.getPaymentStatusLabel(order.payment_status)}
                                                </span>
                                            </td>
                                            <td>{this.formatDate(order.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => this.handleViewOrderDetail(order)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    {this.getNextStatusOptions(order.status || order.order_status, order.payment_method).length > 0 && (
                                                        <select
                                                            className="status-select"
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    this.handleStatusUpdate(order.id, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Thay đổi trạng thái</option>
                                                            {this.getNextStatusOptions(order.status || order.order_status, order.payment_method).map(status => (
                                                                <option key={status} value={status}>
                                                                    {this.getStatusLabel(status, order.payment_method)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination - Hiển thị nếu có nhiều hơn 1 trang hoặc có nhiều đơn hàng */}
                    {(totalPages > 1 || (totalPages === 1 && total > orders.length)) && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => this.handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <span className="page-info">
                                Trang {currentPage} / {totalPages} ({total} đơn hàng)
                                {orders.length < total && ` - Hiển thị ${orders.length} đơn hàng`}
                            </span>
                            <button
                                className="page-btn"
                                onClick={() => this.handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || isLoading}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                    
                    {/* Hiển thị thông tin nếu có nhiều đơn hàng nhưng chỉ 1 trang */}
                    {totalPages === 1 && total > orders.length && total <= this.state.limit && (
                        <div className="pagination-info">
                            <span>Hiển thị {orders.length} / {total} đơn hàng</span>
                        </div>
                    )}
                </div>

                {/* Order Detail Modal */}
                {this.state.showOrderDetail && this.state.selectedOrder && (
                    <div className="modal-overlay" onClick={() => this.setState({ showOrderDetail: false, selectedOrder: null })}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>Chi tiết đơn hàng #{this.state.selectedOrder.id}</h4>
                                <button
                                    className="modal-close"
                                    onClick={() => this.setState({ showOrderDetail: false, selectedOrder: null })}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-section">
                                    <h5>Thông tin đơn hàng</h5>
                                    <div className="detail-row">
                                        <span className="label">Mã đơn:</span>
                                        <span className="value">#{this.state.selectedOrder.id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Hình thức thanh toán:</span>
                                        <span className="value">
                                            <span className="payment-method-badge">
                                                {this.getPaymentMethodLabel(this.state.selectedOrder.payment_method)}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Trạng thái đơn hàng:</span>
                                        <span className="value">
                                            {this.state.selectedOrder?.status || this.state.selectedOrder?.order_status ? (
                                                <span className={`badge ${this.getStatusBadgeClass(this.state.selectedOrder.status || this.state.selectedOrder.order_status)}`}>
                                                    {this.getStatusLabel(this.state.selectedOrder.status || this.state.selectedOrder.order_status, this.state.selectedOrder?.payment_method)}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#999', fontStyle: 'italic' }}>Đang tải...</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Trạng thái thanh toán:</span>
                                        <span className="value">
                                            {this.state.selectedOrder?.payment_status ? (
                                                <span className={`badge ${this.getPaymentStatusBadgeClass(this.state.selectedOrder.payment_status)}`}>
                                                    {this.getPaymentStatusLabel(this.state.selectedOrder.payment_status)}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#999', fontStyle: 'italic' }}>Đang tải...</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Tổng tiền:</span>
                                        <span className="value">{this.formatCurrency(this.state.selectedOrder.total_amount || 0)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Ngày tạo:</span>
                                        <span className="value">{this.formatDate(this.state.selectedOrder.created_at)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Ngày cập nhật:</span>
                                        <span className="value">{this.formatDate(this.state.selectedOrder.updated_at)}</span>
                                    </div>
                                </div>

                                <div className="order-detail-section">
                                    <h5>Thông tin khách hàng</h5>
                                    {(() => {
                                        const customerInfo = this.getCustomerInfo(this.state.selectedOrder);
                                        return (
                                            <>
                                                <div className="detail-row">
                                                    <span className="label">Tên:</span>
                                                    <span className="value">
                                                        {customerInfo.full_name}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Email:</span>
                                                    <span className="value">
                                                        {customerInfo.email || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Số điện thoại:</span>
                                                    <span className="value">
                                                        {customerInfo.phone || 'N/A'}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {this.state.selectedOrder.shipping_address && (
                                    <div className="order-detail-section">
                                        <h5>Địa chỉ giao hàng</h5>
                                        <div className="address-info">
                                            {this.state.selectedOrder.shipping_address.detail && (
                                                <div>{this.state.selectedOrder.shipping_address.detail}</div>
                                            )}
                                            <div>
                                                {[
                                                    this.state.selectedOrder.shipping_address.ward,
                                                    this.state.selectedOrder.shipping_address.district,
                                                    this.state.selectedOrder.shipping_address.province
                                                ].filter(Boolean).join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {this.state.selectedOrder.items && this.state.selectedOrder.items.length > 0 && (
                                    <div className="order-detail-section">
                                        <h5>Sản phẩm ({this.state.selectedOrder.items.length})</h5>
                                        <div className="order-items">
                                            {this.state.selectedOrder.items.map(item => (
                                                <div key={item.id} className="order-item">
                                                    <div className="item-image">
                                                        {item.product?.image ? (
                                                            <img src={item.product.image} alt={item.product.productName} />
                                                        ) : (
                                                            <div className="no-image">No Image</div>
                                                        )}
                                                    </div>
                                                    <div className="item-info">
                                                        <div className="item-name">{item.product?.productName || 'N/A'}</div>
                                                        <div className="item-details">
                                                            Số lượng: {item.quantity} × {this.formatCurrency(item.unit_price || 0)}
                                                        </div>
                                                    </div>
                                                    <div className="item-total">
                                                        {this.formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {this.getNextStatusOptions(this.state.selectedOrder.status || this.state.selectedOrder.order_status, this.state.selectedOrder.payment_method).length > 0 && (
                                    <div className="status-update-section">
                                        <label>Cập nhật trạng thái:</label>
                                        <select
                                            className="status-select"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    this.handleStatusUpdate(this.state.selectedOrder.id, e.target.value);
                                                    e.target.value = '';
                                                    this.setState({ showOrderDetail: false, selectedOrder: null });
                                                }
                                            }}
                                        >
                                            <option value="">Chọn trạng thái mới</option>
                                            {this.getNextStatusOptions(this.state.selectedOrder.status || this.state.selectedOrder.order_status, this.state.selectedOrder.payment_method).map(status => (
                                                <option key={status} value={status}>
                                                    {this.getStatusLabel(status, this.state.selectedOrder.payment_method)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    className="btn-close"
                                    onClick={() => this.setState({ showOrderDetail: false, selectedOrder: null })}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                    </div>
                </CustomScrollbars>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OrderManage));

