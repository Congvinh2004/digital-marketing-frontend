# Input Data Cần Thiết Cho Flow Thanh Toán PayPal

## Tổng Quan Flow Thanh Toán

```
1. Tạo đơn hàng → 2. Tạo PayPal Order → 3. User thanh toán → 4. Capture Payment
```

---

## BƯỚC 1: Tạo Đơn Hàng

### API: `POST /api/orders/create`

### Headers:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Body (Request):
```json
{
  "items": [
    {
      "product_id": 1,        // REQUIRED: ID sản phẩm (integer)
      "quantity": 2            // REQUIRED: Số lượng (integer, > 0)
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "shipping_address_id": 1    // REQUIRED: ID địa chỉ giao hàng (integer)
}
```

### Input Data Chi Tiết:

| Field | Type | Required | Description | Validation |
|-------|------|-----------|-------------|------------|
| `items` | Array | ✅ Yes | Danh sách sản phẩm trong đơn hàng | Phải là array, không rỗng |
| `items[].product_id` | Integer | ✅ Yes | ID sản phẩm | Phải tồn tại trong database |
| `items[].quantity` | Integer | ✅ Yes | Số lượng sản phẩm | Phải > 0, không vượt quá số lượng tồn kho |
| `shipping_address_id` | Integer | ✅ Yes | ID địa chỉ giao hàng | Phải tồn tại và thuộc về customer của user |

### Response:
```json
{
  "errCode": 0,
  "errMessage": "Order created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "user_id": 1,
    "status": "pending",
    "total_amount": "125000.00",
    "shipping_address_id": 1,
    "items": [...],
    "customer": {...},
    "shipping_address": {...}
  }
}
```

### Lưu ý:
- User phải đã đăng nhập (có JWT token hợp lệ)
- User phải có địa chỉ giao hàng đã tạo trước
- Sản phẩm phải còn tồn kho đủ số lượng
- Tổng tiền được tính tự động từ giá sản phẩm × số lượng

---

## BƯỚC 2: Tạo PayPal Order (Có QR Code)

### API: `POST /api/paypal/create-order`

### Headers:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Body (Request):
```json
{
  "orderId": 1    // REQUIRED: ID đơn hàng đã tạo ở bước 1 (integer)
}
```

### Input Data Chi Tiết:

| Field | Type | Required | Description | Validation |
|-------|------|-----------|-------------|------------|
| `orderId` | Integer | ✅ Yes | ID đơn hàng từ bước 1 | Phải tồn tại trong database, status = "pending" |

### Response:
```json
{
  "errCode": 0,
  "errMessage": "PayPal order created successfully",
  "data": {
    "orderId": "5O190127TN364715T",           // PayPal Order ID
    "status": "CREATED",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",  // QR Code base64 image
    "links": [...]
  }
}
```

### Lưu ý:
- Đơn hàng phải đã được tạo ở bước 1
- QR code được tạo tự động từ approval URL
- QR code trả về dạng base64 image (data URL) - sẵn sàng hiển thị

---

## BƯỚC 3: User Thanh Toán

### Cách 1: Quét QR Code (Mobile)
- User mở app PayPal trên điện thoại
- Quét QR code từ response bước 2
- Xác nhận thanh toán trên app PayPal

### Cách 2: Redirect URL (Web)
- Frontend redirect user đến `approvalUrl` từ response bước 2
- User đăng nhập PayPal và xác nhận thanh toán
- PayPal redirect về `PAYPAL_RETURN_URL` với `token` và `PayerID`

**Không cần input data từ frontend ở bước này** - User tương tác trực tiếp với PayPal.

---

## BƯỚC 4: Capture Payment

### API: `POST /api/paypal/capture-order`

### Headers:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Body (Request):
```json
{
  "paypal_order_id": "5O190127TN364715T",    // REQUIRED: PayPal Order ID từ bước 2
  "orderId": 1                                // REQUIRED: ID đơn hàng trong database (integer)
}
```

### Input Data Chi Tiết:

| Field | Type | Required | Description | Validation |
|-------|------|-----------|-------------|------------|
| `paypal_order_id` | String | ✅ Yes | PayPal Order ID từ response bước 2 | Phải là PayPal order ID hợp lệ |
| `orderId` | Integer | ✅ Yes | ID đơn hàng trong database | Phải tồn tại trong database |

### Response:
```json
{
  "errCode": 0,
  "errMessage": "Payment captured and updated successfully",
  "data": {
    "paypal": {
      "orderId": "5O190127TN364715T",
      "status": "COMPLETED",
      "transactionId": "8XK12345AB67890CD",
      "captureStatus": "COMPLETED",
      "payer": {...},
      "purchase_units": [...]
    },
    "order": {
      "order": {...},
      "payment": {
        "id": 1,
        "orderId": 1,
        "paymentMethod": "paypal",
        "paymentStatus": "paid",
        "paypalOrderId": "5O190127TN364715T",
        "paypalTransactionId": "8XK12345AB67890CD",
        "paymentDate": "2024-01-02T10:30:00.000Z"
      }
    }
  }
}
```

### Lưu ý:
- API này capture payment từ PayPal và tự động cập nhật:
  - Payment status → "paid"
  - Order status → "paid"
  - Payment date → thời gian hiện tại
  - Transaction ID từ PayPal

---

## API Bổ Sung

### Tạo QR Code Từ Order ID

### API: `POST /api/paypal/qr-code-by-order`

### Body:
```json
{
  "orderId": 1    // REQUIRED: ID đơn hàng
}
```

**Lưu ý:** API này tự động tạo PayPal order nếu chưa có, sau đó trả về QR code.

---

### Tạo QR Code Từ Approval URL

### API: `POST /api/paypal/qr-code`

### Body:
```json
{
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",  // REQUIRED
  "orderId": 1                                                             // Optional
}
```

---

## Tóm Tắt Input Data Cần Thiết

### Để chạy flow thanh toán hoàn chỉnh, bạn cần:

1. **JWT Token** (từ login API)
2. **Danh sách sản phẩm** với `product_id` và `quantity`
3. **Shipping address ID** (đã tạo trước)
4. **Order ID** (từ bước 1)
5. **PayPal Order ID** (từ bước 2)

### Flow Đầy Đủ:

```javascript
// 1. Login để lấy token
POST /api/auth/login
Body: { email, password }

// 2. Tạo đơn hàng
POST /api/orders/create
Headers: { Authorization: Bearer <token> }
Body: { items: [{ product_id, quantity }], shipping_address_id }

// 3. Tạo PayPal order (có QR code)
POST /api/paypal/create-order
Headers: { Authorization: Bearer <token> }
Body: { orderId }

// 4. User thanh toán (quét QR hoặc redirect)

// 5. Capture payment
POST /api/paypal/capture-order
Headers: { Authorization: Bearer <token> }
Body: { paypal_order_id, orderId }
```

---

## Validation Rules

### Product:
- `product_id` phải tồn tại trong database
- `quantity` phải > 0
- Số lượng tồn kho phải >= `quantity` yêu cầu

### Address:
- `shipping_address_id` phải tồn tại
- Address phải thuộc về customer của user đang đăng nhập

### Order:
- Order phải có status = "pending" để tạo PayPal order
- Order phải có ít nhất 1 item

### PayPal:
- PayPal credentials phải được cấu hình trong `.env`
- PayPal order phải ở trạng thái "CREATED" để capture

---

## Error Codes

| errCode | errMessage | Giải pháp |
|---------|------------|-----------|
| 1 | Missing required parameter | Kiểm tra lại body request |
| 2 | User not found or inactive | User chưa đăng nhập hoặc bị khóa |
| 3 | Shipping address not found | Tạo địa chỉ giao hàng trước |
| 4 | Product not found | Kiểm tra product_id |
| 5 | Insufficient stock | Giảm số lượng hoặc chọn sản phẩm khác |
| -1 | Error from the server | Lỗi server, kiểm tra logs |

