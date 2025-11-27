import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import "./UserManage.scss"
import { emitter } from '../../utils/emitter';
import { toast } from 'react-toastify';

class ModalUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            confirmPassword: '',
            role: 'customer', // API yêu cầu 'customer' hoặc 'admin', không phải 'user'
            isEditMode: false
        }
        this.listenToEmitter()
    }

    componentDidMount() {
        // Nếu có userData từ props (edit mode), load data vào state
        if (this.props.userData) {
            this.loadUserData(this.props.userData);
        }
    }

    componentDidUpdate(prevProps) {
        // Khi userData thay đổi (chuyển từ add sang edit hoặc ngược lại)
        const prevUserId = prevProps.userData?.id || prevProps.userData?.userID || prevProps.userData?.user_id;
        const currentUserId = this.props.userData?.id || this.props.userData?.userID || this.props.userData?.user_id;
        
        if (prevUserId !== currentUserId) {
            if (this.props.userData && currentUserId) {
                this.loadUserData(this.props.userData);
            } else {
                this.clearForm();
            }
        }
    }

    loadUserData = (userData) => {
        this.setState({
            fullName: userData.fullName || userData.name || userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || userData.phoneNumber || userData.phone_number || '',
            address: userData.address || '',
            password: '', // Không load password khi edit
            confirmPassword: '', // Không load password khi edit
            role: userData.role || userData.userRole || 'customer',
            isEditMode: true
        });
    }

    clearForm = () => {
        this.setState({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            confirmPassword: '',
            role: 'customer',
            isEditMode: false
        });
    }

    checkValidateInput = () => {
        let isValid = true;
        const { fullName, email, phone, address, password, confirmPassword, isEditMode } = this.state;

        if (!fullName.trim()) {
            toast.error('Please input full name');
            isValid = false;
            return isValid;
        }

        if (!email.trim()) {
            toast.error('Please input email');
            isValid = false;
            return isValid;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Email is not valid');
            isValid = false;
            return isValid;
        }

        if (!phone.trim()) {
            toast.error('Please input phone number');
            isValid = false;
            return isValid;
        } else if (!/^[0-9]{10,11}$/.test(phone)) {
            toast.error('Phone number must be 10-11 digits');
            isValid = false;
            return isValid;
        }

        if (!address.trim()) {
            toast.error('Please input address');
            isValid = false;
            return isValid;
        }

        // Password chỉ bắt buộc khi tạo mới, không bắt buộc khi edit
        if (!isEditMode) {
            if (!password) {
                toast.error('Please input password');
                isValid = false;
                return isValid;
            } else if (password.length < 6) {
                toast.error('Password must be at least 6 characters');
                isValid = false;
                return isValid;
            }

            if (password !== confirmPassword) {
                toast.error('Password confirmation does not match');
                isValid = false;
                return isValid;
            }
        } else {
            // Khi edit, nếu có nhập password thì phải xác nhận
            if (password || confirmPassword) {
                if (password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    isValid = false;
                    return isValid;
                }
                if (password !== confirmPassword) {
                    toast.error('Password confirmation does not match');
                    isValid = false;
                    return isValid;
                }
            }
        }

        return isValid;
    }

    listenToEmitter = () => {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.clearForm();
        })
    }

    toggle = () => {
        this.props.toglleFromParent()
    }

    handleOnChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    handleSaveUser = () => {
        if (!this.checkValidateInput()) {
            return;
        }

        const { fullName, email, phone, address, password, role, isEditMode } = this.state;
        
        if (isEditMode) {
            // Update user - format theo API backend (snake_case)
            const userId = this.props.userData?.id || this.props.userData?.userID || this.props.userData?.user_id;
            const userData = {
                full_name: fullName, // Backend yêu cầu full_name (snake_case)
                phone: phone,
                role: role
            };

            // Chỉ thêm password nếu có (khi edit có thay đổi password)
            if (password) {
                userData.password = password;
            }

            // Không gửi email khi update (theo tài liệu API, email có thể không được cập nhật)
            // Không gửi address vì API không hỗ trợ trường này
            
            this.props.updateUser(userId, userData);
        } else {
            // Create new user - giữ nguyên format hiện tại
        const userData = {
            fullName: fullName,
            email: email,
            phone: phone,
            address: address,
            role: role
        };

        // Chỉ thêm password nếu có (khi tạo mới hoặc khi edit có thay đổi password)
        if (password) {
            userData.password = password;
        }

            this.props.createNewUser(userData);
        }
    }

    render() {
        let isOpenModal = this.props.isOpenModal
        let { fullName, email, phone, address, password, confirmPassword, role, isEditMode } = this.state
        return (
            <Modal
                isOpen={isOpenModal}
                toggle={() => this.toggle()}
                className='modal-user-container'
                size='lg'
            >
                <ModalHeader toggle={() => this.toggle()}>
                    {isEditMode ? 'Edit User' : 'Create a new user'}
                </ModalHeader>
                <ModalBody>
                    <div className='modal-user-body'>
                        <div className='input-container'>
                            <label>Full Name *</label>
                            <input
                                name="fullName"
                                onChange={this.handleOnChange}
                                type='text'
                                value={fullName}
                                placeholder='Enter full name'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Email *</label>
                            <input
                                name="email"
                                onChange={this.handleOnChange}
                                type='email'
                                value={email}
                                placeholder='Enter email'
                                disabled={isEditMode} // Không cho sửa email khi edit
                            />
                        </div>

                        <div className='input-container'>
                            <label>Phone Number *</label>
                            <input
                                name="phone"
                                onChange={this.handleOnChange}
                                type='tel'
                                value={phone}
                                placeholder='Enter phone number (10-11 digits)'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Address *</label>
                            <input
                                name="address"
                                onChange={this.handleOnChange}
                                type='text'
                                value={address}
                                placeholder='Enter address'
                            />
                        </div>

                        <div className='input-container'>
                            <label>Role</label>
                            <select
                                name="role"
                                onChange={this.handleOnChange}
                                value={role}
                                className='form-select'
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className='input-container'>
                            <label>Password {isEditMode ? '(leave blank to keep current password)' : '*'}</label>
                            <input
                                name="password"
                                onChange={this.handleOnChange}
                                type='password'
                                value={password}
                                placeholder={isEditMode ? 'Enter new password (optional)' : 'Enter password (min 6 characters)'}
                            />
                        </div>

                        {(password || !isEditMode) && (
                            <div className='input-container'>
                                <label>Confirm Password {isEditMode ? '' : '*'}</label>
                                <input
                                    name="confirmPassword"
                                    onChange={this.handleOnChange}
                                    type='password'
                                    value={confirmPassword}
                                    placeholder='Confirm password'
                                />
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        className='btn-action'
                        onClick={this.handleSaveUser}
                    >
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>{' '}
                    <Button 
                        color="secondary" 
                        className='btn-action' 
                        onClick={() => this.toggle()}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalUser);

