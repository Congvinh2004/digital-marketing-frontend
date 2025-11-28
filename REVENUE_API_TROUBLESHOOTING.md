# Hướng dẫn xử lý lỗi API Revenue

## Vấn đề hiện tại
API `/api/revenue/daily` và `/api/revenue/monthly` đang trả về lỗi 404 (Cannot GET).

## Nguyên nhân
Backend chưa triển khai các endpoint revenue API.

## Giải pháp

### 1. Kiểm tra Backend có API Revenue không

Mở browser console (F12) và kiểm tra:
- Xem có log "Daily Revenue Response:" và "Monthly Revenue Response:" không
- Xem có lỗi 404 không

### 2. Nếu Backend chưa có API

Cần triển khai các endpoint sau trên backend:

#### Endpoint 1: GET `/api/revenue/daily`
- Query params: `date` (optional, format: YYYY-MM-DD)
- Response format:
```json
{
  "errCode": 0,
  "errMessage": "Get daily revenue successfully",
  "data": {
    "date": "2025-11-28",
    "revenue": {
      "vnd": 1500000,
      "usd": 60.00,
      "orderCount": 5,
      "paymentCount": 5
    }
  }
}
```

#### Endpoint 2: GET `/api/revenue/monthly`
- Query params: `year` (optional), `month` (optional, 1-12)
- Response format:
```json
{
  "errCode": 0,
  "errMessage": "Get monthly revenue successfully",
  "data": {
    "year": 2025,
    "month": 11,
    "revenue": {
      "vnd": 45000000,
      "usd": 1800.00,
      "orderCount": 150,
      "paymentCount": 150
    }
  }
}
```

### 3. Logic tính doanh thu (theo API_REVENUE.md)

- **Doanh thu được tính từ:**
  - Orders có status: `paid`, `completed`, `shipped`
  - Dựa vào `updated_at` của order (khi order được cập nhật thành paid)

- **Đơn vị tiền tệ:**
  - `vnd`: Doanh thu VNĐ (từ `total_amount` của Order)
  - `usd`: Doanh thu USD (từ `totalAmountUSD` của Payment)

### 4. Test API

Sau khi backend triển khai, test bằng cách:

1. Mở browser console (F12)
2. Reload trang admin
3. Kiểm tra logs:
   - "Daily Revenue Response:" - phải có data
   - "Monthly Revenue Response:" - phải có data
   - "Daily Revenue parsed:" - phải có số tiền
   - "Monthly Revenue parsed:" - phải có số tiền

### 5. Kiểm tra Base URL

Đảm bảo `REACT_APP_BACKEND_URL` đúng:
- Local: `http://localhost:8080`
- Production: URL của backend trên Railway

Kiểm tra trong `.env` hoặc Vercel environment variables.

## Frontend đã sẵn sàng ✅

Frontend đã được cấu hình đúng:
- ✅ Gọi API đúng endpoint: `/api/revenue/daily` và `/api/revenue/monthly`
- ✅ Parse response đúng format: `data.revenue.vnd`
- ✅ Xử lý lỗi và hiển thị warning khi API chưa có
- ✅ Debug logs để kiểm tra

## Khi Backend triển khai xong

Component sẽ tự động:
1. Gọi API và lấy dữ liệu
2. Parse và hiển thị doanh thu
3. Ẩn warning message
4. Hiển thị số tiền đúng format VND

## Debug

Mở browser console và xem:
- `Daily Revenue Response:` - Response từ API daily
- `Monthly Revenue Response:` - Response từ API monthly
- `Daily Revenue parsed:` - Số tiền đã parse
- `Monthly Revenue parsed:` - Số tiền đã parse

Nếu thấy lỗi 404, nghĩa là backend chưa có API.

