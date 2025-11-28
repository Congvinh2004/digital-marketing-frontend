# Hướng dẫn sửa lỗi PayPal redirect về localhost - BACKEND

## Vấn đề
Sau khi thanh toán PayPal thành công, user bị redirect về `http://localhost:3000/payment/success` thay vì domain production (Vercel).

## Nguyên nhân
Backend đang **hardcode return URL** là `localhost:3000` khi tạo PayPal order.

## Giải pháp

### Frontend đã được sửa ✅
Frontend đã được cập nhật để **tự động gửi returnUrl và cancelUrl** khi tạo PayPal order:
- `returnUrl`: `${window.location.origin}/payment/success`
- `cancelUrl`: `${window.location.origin}/payment/cancel`

### Backend cần sửa ⚠️

Backend cần **nhận và sử dụng returnUrl, cancelUrl từ request** thay vì hardcode.

#### 1. Cập nhật API `/api/paypal/create-order`

**Trước (hardcode):**
```javascript
// ❌ KHÔNG ĐÚNG
const returnUrl = 'http://localhost:3000/payment/success';
const cancelUrl = 'http://localhost:3000/payment/cancel';
```

**Sau (nhận từ request):**
```javascript
// ✅ ĐÚNG
app.post('/api/paypal/create-order', async (req, res) => {
    const { orderId, returnUrl, cancelUrl } = req.body;
    
    // Sử dụng returnUrl và cancelUrl từ request
    // Fallback về localhost nếu không có (cho development)
    const finalReturnUrl = returnUrl || 'http://localhost:3000/payment/success';
    const finalCancelUrl = cancelUrl || 'http://localhost:3000/payment/cancel';
    
    // Tạo PayPal order với returnUrl và cancelUrl động
    const paypalOrder = await paypalClient.createOrder({
        // ... other order data
        application_context: {
            return_url: finalReturnUrl,
            cancel_url: finalCancelUrl,
            brand_name: 'F5 Store',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW'
        }
    });
    
    // ... rest of the code
});
```

#### 2. Hoặc sử dụng Environment Variable (Alternative)

Nếu không muốn nhận từ request, có thể dùng environment variable:

```javascript
// Backend .env hoặc Railway environment variables
FRONTEND_URL=https://digital-marketing-frontend.vercel.app

// Backend code
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const returnUrl = `${FRONTEND_URL}/payment/success`;
const cancelUrl = `${FRONTEND_URL}/payment/cancel`;
```

**⚠️ Lưu ý:** Cách này kém linh hoạt hơn vì phải cấu hình riêng cho mỗi environment.

---

## Cấu hình Environment Variables

### Trên Railway (Backend):
1. Vào Railway Dashboard → Your Backend Service → Variables
2. Thêm (nếu dùng cách 2):
   - `FRONTEND_URL=https://digital-marketing-frontend.vercel.app`
3. Redeploy backend

### Trên Vercel (Frontend):
- Không cần thêm gì, frontend đã tự động dùng `window.location.origin`

---

## Test

### 1. Local Development:
- Frontend: `http://localhost:3000`
- Backend: Nhận returnUrl từ request → `http://localhost:3000/payment/success`
- ✅ Test thanh toán → redirect về `http://localhost:3000/payment/success`

### 2. Production (Vercel):
- Frontend: `https://digital-marketing-frontend.vercel.app`
- Backend: Nhận returnUrl từ request → `https://digital-marketing-frontend.vercel.app/payment/success`
- ✅ Test thanh toán → redirect về `https://digital-marketing-frontend.vercel.app/payment/success`

---

## Request Format từ Frontend

Frontend sẽ gửi request như sau:

```json
POST /api/paypal/create-order
{
  "orderId": 123,
  "returnUrl": "https://digital-marketing-frontend.vercel.app/payment/success",
  "cancelUrl": "https://digital-marketing-frontend.vercel.app/payment/cancel"
}
```

Backend cần:
1. ✅ Nhận `returnUrl` và `cancelUrl` từ `req.body`
2. ✅ Sử dụng chúng khi tạo PayPal order
3. ✅ Không hardcode `localhost:3000`

---

## Lưu ý quan trọng

1. **Backend PHẢI sửa** - đây là vấn đề chính
2. Frontend đã được sửa để gửi returnUrl động
3. Đảm bảo PayPal return URL khớp với domain production
4. Test kỹ trên cả local và production

---

## Troubleshooting

### Vẫn redirect về localhost:
1. Kiểm tra backend có nhận `returnUrl` từ request không
2. Kiểm tra backend có sử dụng `returnUrl` khi tạo PayPal order không
3. Kiểm tra browser console có lỗi không
4. Kiểm tra network tab xem request có gửi `returnUrl` không

### PayPal redirect về URL sai:
1. Kiểm tra PayPal order có được tạo với returnUrl đúng không
2. Kiểm tra PayPal dashboard xem return URL là gì
3. Đảm bảo returnUrl là HTTPS (PayPal yêu cầu HTTPS cho production)

