# Sửa lỗi PayPal redirect về localhost:3000

## Vấn đề
Sau khi thanh toán PayPal thành công, user bị redirect về `http://localhost:3000/payment/success` thay vì domain production.

## Nguyên nhân
Backend đang hardcode return URL là `localhost:3000` khi tạo PayPal order.

## Giải pháp

### 1. Sửa Backend (Quan trọng nhất)

Backend cần sử dụng **dynamic URL** thay vì hardcode `localhost:3000`.

#### Cách 1: Sử dụng Environment Variable

Trong backend, khi tạo PayPal order, sử dụng environment variable:

```javascript
// Backend code (ví dụ)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const returnUrl = `${FRONTEND_URL}/payment/success`;
const cancelUrl = `${FRONTEND_URL}/payment/cancel`;
```

#### Cách 2: Nhận từ Frontend Request

Frontend có thể gửi return URL trong request body:

```javascript
// Frontend (nếu cần)
const returnUrl = `${window.location.origin}/payment/success`;
const cancelUrl = `${window.location.origin}/payment/cancel`;

// Gửi trong request khi tạo PayPal order
const response = await createPayPalOrder(orderId, {
    returnUrl,
    cancelUrl
});
```

### 2. Cấu hình Environment Variables

#### Trên Railway (Backend):
- Thêm `FRONTEND_URL=https://your-vercel-domain.vercel.app` vào environment variables

#### Trên Vercel (Frontend):
- Đã có sẵn `REACT_APP_BACKEND_URL` - không cần thêm gì

### 3. Kiểm tra Routes

Frontend đã có routes đúng:
- `/payment/success` → `PaymentSuccess` component
- `/payment/cancel` → `PaymentCancel` component

### 4. Test

1. **Local**: 
   - Backend: `FRONTEND_URL=http://localhost:3000`
   - Test thanh toán PayPal → redirect về `http://localhost:3000/payment/success`

2. **Production**:
   - Backend: `FRONTEND_URL=https://your-vercel-domain.vercel.app`
   - Test thanh toán PayPal → redirect về `https://your-vercel-domain.vercel.app/payment/success`

## Lưu ý

- **Backend phải sửa** - đây là vấn đề chính
- Frontend routes đã đúng, không cần sửa
- Đảm bảo PayPal return URL trong backend configuration khớp với domain production



