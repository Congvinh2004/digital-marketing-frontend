# Hướng dẫn test API Revenue trên localhost

## Cấu hình hiện tại ✅

File `.env` đã được cấu hình:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

## Kiểm tra Backend

### 1. Đảm bảo Backend đang chạy
- Backend phải chạy trên `http://localhost:8080`
- Kiểm tra: Mở browser và truy cập `http://localhost:8080/api/health` (nếu có) hoặc test API khác

### 2. Kiểm tra API Revenue có tồn tại không

Test bằng cách mở browser console (F12) và chạy:
```javascript
// Test API daily
fetch('http://localhost:8080/api/revenue/daily', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(res => res.json())
.then(data => console.log('Daily Revenue:', data))
.catch(err => console.error('Error:', err));

// Test API monthly
fetch('http://localhost:8080/api/revenue/monthly', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(res => res.json())
.then(data => console.log('Monthly Revenue:', data))
.catch(err => console.error('Error:', err));
```

## Test trên Frontend

### 1. Restart Frontend (nếu cần)
Sau khi sửa `.env`, cần restart frontend để load lại environment variables:
```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm start
```

### 2. Kiểm tra trong Browser Console
1. Mở trang admin: `http://localhost:3000/system/product-manage`
2. Mở Console (F12)
3. Xem logs:
   - `Daily Revenue Response:` - Response từ API
   - `Monthly Revenue Response:` - Response từ API
   - `Daily Revenue parsed:` - Số tiền đã parse
   - `Monthly Revenue parsed:` - Số tiền đã parse

### 3. Kiểm tra Network Tab
1. Mở Network tab (F12)
2. Reload trang
3. Tìm requests:
   - `daily` - GET `/api/revenue/daily`
   - `monthly` - GET `/api/revenue/monthly`
4. Kiểm tra:
   - Status code: 200 (thành công) hoặc 404 (chưa có API)
   - Response: Xem response body

## Nếu API chưa có (404)

Nếu thấy lỗi 404 "Cannot GET /api/revenue/daily", nghĩa là backend chưa implement API này.

### Backend cần implement:

1. **GET `/api/revenue/daily`**
   - Query params: `date` (optional, format: YYYY-MM-DD)
   - Response: `{ errCode: 0, errMessage: "...", data: { revenue: { vnd: ..., usd: ... } } }`

2. **GET `/api/revenue/monthly`**
   - Query params: `year` (optional), `month` (optional, 1-12)
   - Response: `{ errCode: 0, errMessage: "...", data: { revenue: { vnd: ..., usd: ... } } }`

Xem chi tiết trong file `API_REVENUE.md`

## Nếu API đã có nhưng vẫn lỗi

### Kiểm tra:
1. **Token có hợp lệ không?**
   - Console log: `✅ Request with token:` - phải có token
   - Nếu không có: Đăng nhập lại

2. **Backend URL đúng không?**
   - Kiểm tra Network tab → Request URL phải là `http://localhost:8080/api/revenue/daily`
   - Nếu không đúng: Kiểm tra lại `.env` và restart frontend

3. **CORS có bị chặn không?**
   - Kiểm tra Console có lỗi CORS không
   - Nếu có: Backend cần thêm CORS cho `http://localhost:3000`

## Khi API hoạt động

Component sẽ tự động:
- ✅ Gọi API và lấy dữ liệu
- ✅ Parse và hiển thị doanh thu VND
- ✅ Ẩn warning message
- ✅ Hiển thị số tiền đúng format

## Debug Tips

1. **Xem request URL:**
   - Network tab → Click vào request `daily` hoặc `monthly`
   - Xem tab "Headers" → Request URL phải là `http://localhost:8080/api/revenue/daily`

2. **Xem response:**
   - Network tab → Click vào request
   - Tab "Preview" hoặc "Response" → Xem response body

3. **Xem console logs:**
   - Console tab → Tìm logs bắt đầu bằng "Daily Revenue Response:" và "Monthly Revenue Response:"



