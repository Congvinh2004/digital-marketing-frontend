import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import "./UserManage.scss"
import { getAllUsers, getAllUsersOld, createNewUsersFromService, createNewUsersFromServiceOld, updateUser, deleteUser, deleteUserOld } from "../../services/userService"
import ModalUser from './ModalUser';
import { emitter } from '../../utils/emitter'
import { toast } from 'react-toastify';

class UserManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listUsers: [],
            isOpenModal: false,
            currentUser: null // User đang được edit
        }
    }

    async componentDidMount() {
        // Kiểm tra token trước khi gọi API
        const accessToken = localStorage.getItem('accessToken');
        console.log('🔍 UserManage componentDidMount - Token check:', {
            hasToken: !!accessToken,
            tokenLength: accessToken ? accessToken.length : 0,
            tokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : 'NO TOKEN'
        });
        
        if (!accessToken || accessToken.trim() === '') {
            console.error('❌ No accessToken found in localStorage');
            toast.error('Vui lòng đăng nhập lại');
            // Redirect về login nếu không có token
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }
        console.log('✅ Token found, calling getAllUsers...');
        await this.getAllUsersFromReact()
    }

    getAllUsersFromReact = async () => {
        // Kiểm tra token TRƯỚC khi gọi API
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken || accessToken.trim() === '') {
            console.error('❌ No accessToken found before API call');
            toast.error('Vui lòng đăng nhập lại');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }
        
        console.log('🔍 Checking token before API call:', accessToken.substring(0, 20) + '...');
        
        try {
            // Thử API mới trước, nếu không có thì dùng API cũ
            let response;
            try {
                console.log('📡 Calling getAllUsers API...');
                response = await getAllUsers();
            } catch (error) {
                console.error('❌ Error calling getAllUsers:', error);
                
                // Kiểm tra xem có phải lỗi authentication không
                // Nếu là lỗi 401 (authentication), không fallback, để axios interceptor xử lý
                if (error.httpStatusCode === 401 || 
                    (error.response && error.response.status === 401)) {
                    // Kiểm tra lại token sau khi có lỗi
                    const tokenAfterError = localStorage.getItem('accessToken');
                    console.warn('⚠️ 401 error detected. Token after error:', tokenAfterError ? 'EXISTS' : 'MISSING');
                    
                    // Nếu token vẫn còn, có thể là lỗi từ backend (token không hợp lệ)
                    // Nếu token đã bị xóa, có thể axios interceptor đã xử lý
                    if (tokenAfterError) {
                        // Token vẫn còn nhưng backend trả về 401 → Có thể token không hợp lệ hoặc hết hạn
                        // Để axios interceptor xử lý logout
                        throw error;
                    } else {
                        // Token đã bị xóa → Axios interceptor đã logout, không cần làm gì
                        console.warn('Token already removed by interceptor, skipping...');
                        return;
                    }
                }
                
                // Fallback to old API chỉ khi không phải lỗi auth
                try {
                    console.log('🔄 Trying fallback API...');
                    response = await getAllUsersOld();
                } catch (fallbackError) {
                    // Nếu cả 2 API đều fail, throw error đầu tiên
                    throw error;
                }
            }
            
            if (response && response.errCode === 0) {
                // Luôn set state, kể cả khi array rỗng
                this.setState({
                    listUsers: Array.isArray(response.users) ? response.users : 
                              Array.isArray(response.data) ? response.data : []
                })
            } else {
                this.setState({
                    listUsers: []
                })
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            
            // Kiểm tra xem có phải lỗi authentication không
            const isAuthError = error.httpStatusCode === 401 || 
                               (error.response && error.response.status === 401);
            
            // Chỉ hiển thị toast nếu không phải lỗi authentication
            // Lỗi 401 authentication sẽ được xử lý bởi axios interceptor (logout và redirect)
            if (!isAuthError) {
                const errorMsg = error.errorMessage || error.errMessage || 'Failed to load users';
                toast.error(errorMsg);
            } else {
                // Nếu là lỗi auth, không hiển thị toast (axios interceptor sẽ xử lý logout)
                console.warn('Authentication error - will be handled by axios interceptor');
            }
            
            // Set empty array khi có lỗi để tránh undefined
            this.setState({
                listUsers: []
            })
        }
    }

    handleOpenModalUser = (user = null) => {
        this.setState({
            isOpenModal: true,
            currentUser: user // null nếu là add mode, user object nếu là edit mode
        })
    }

    toglleUserModal = () => {
        this.setState({
            isOpenModal: !this.state.isOpenModal,
            currentUser: null // Reset khi đóng modal
        })
    }

    createNewUser = async (data) => {
        try {
            let response = await createNewUsersFromService(data);
            console.log('check response: ', response)
            if (response && response.errCode === 0) {
                this.toglleUserModal()
                await this.getAllUsersFromReact()
                emitter.emit('EVENT_CLEAR_MODAL_DATA')
                toast.success('User created successfully');
            } else {
                toast.error(response.errMessage || 'Failed to create user');
            }
        } catch (e) {
            console.log('error: ', e)
            toast.error(e.response?.data?.errMessage || 'Failed to create user');
        }
    }

    handleUpdateUser = async (userId, data) => {
        try {
            let response = await updateUser(userId, data);
            if (response && response.errCode === 0) {
                this.toglleUserModal()
                await this.getAllUsersFromReact()
                emitter.emit('EVENT_CLEAR_MODAL_DATA')
                toast.success('User updated successfully');
            } else {
                toast.error(response.errMessage || 'Failed to update user');
            }
        } catch (e) {
            console.log('error: ', e)
            toast.error(e.response?.data?.errMessage || 'Failed to update user');
        }
    }

    handleEditUser = (user) => {
        this.handleOpenModalUser(user);
    }

    handleDeleteUser = async (user) => {
        const userName = user.name || user.fullName || user.username || 'this user';
        if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) {
            return;
        }

        const userId = user.id || user.userID || user.user_id;
        console.log('check userID: ', userId)
        
        try {
            let response;
            try {
                response = await deleteUser(userId);
            } catch (error) {
                // Fallback to old API
                response = await deleteUserOld(userId);
            }
            
            if (response && response.errCode === 0) {
                toast.success('User deleted successfully');
                await this.getAllUsersFromReact()
            } else {
                toast.error(response.errMessage || 'Failed to delete user');
            }
        } catch (e) {
            console.log('error: ', e)
            toast.error(e.response?.data?.errMessage || 'Failed to delete user');
        }
    }

    render() {
        let { listUsers, isOpenModal, currentUser } = this.state
        return (
            <>
                <ModalUser 
                    createNewUser={this.createNewUser}
                    updateUser={this.handleUpdateUser}
                    isOpenModal={isOpenModal} 
                    toglleFromParent={this.toglleUserModal}
                    userData={currentUser}
                />

                <div className="user-container">
                    <div className="title text-center">
                        <h2>MANAGE USERS</h2>
                    </div>

                    <div className='action-bar'>
                        <button className='btn btn-primary' onClick={() => this.handleOpenModalUser()}>
                            <i className="fas fa-plus"></i>
                            Add a new user
                        </button>
                        <button className='btn btn-secondary' onClick={this.getAllUsersFromReact}>
                            <i className="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>

                    {listUsers.length === 0 ? (
                        <div className='no-users'>
                            <i className="fas fa-users"></i>
                            <p>No users found. Click "Add a new user" to create one.</p>
                        </div>
                    ) : (
                        <div className='user-table mt-3'>
                            <table id="customers">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listUsers.map((itemUser, index) => {
                                        const userId = itemUser.id || itemUser.userID || itemUser.user_id || `user-${index}`;
                                        const fullName = itemUser.fullName || itemUser.name || itemUser.full_name || 'N/A';
                                        const email = itemUser.email || 'N/A';
                                        const phone = itemUser.phone || itemUser.phoneNumber || itemUser.phone_number || 'N/A';
                                        const address = itemUser.address || 'N/A';
                                        const role = itemUser.role || itemUser.userRole || 'User';

                                        return (
                                            <tr key={userId}>
                                                <td>{userId}</td>
                                                <td>{fullName}</td>
                                                <td>{email}</td>
                                                <td>{phone}</td>
                                                <td className='address-cell'>{address}</td>
                                                <td>{role}</td>
                                                <td className='action-icon text-center'>
                                                    <i 
                                                        className="fas fa-edit _edit" 
                                                        onClick={() => this.handleEditUser(itemUser)}
                                                        title="Edit user"
                                                    ></i>
                                                    <i 
                                                        className="fas fa-trash _delete" 
                                                        onClick={() => this.handleDeleteUser(itemUser)}
                                                        title="Delete user"
                                                    ></i>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(UserManage));
