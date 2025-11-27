# Hướng dẫn lấy Zalo ID

## Zalo ID là gì?

Zalo ID có thể là:
1. **Số điện thoại** (phổ biến nhất): Số điện thoại đã đăng ký Zalo
2. **Zalo ID** (nếu có): Mã định danh Zalo (thường là tên người dùng)

## Cách lấy Zalo ID

### Cách 1: Sử dụng số điện thoại (Đơn giản nhất)

1. Mở ứng dụng Zalo trên điện thoại
2. Vào **Cá nhân** (hoặc **Tôi**)
3. Xem **Số điện thoại** của bạn
4. Số điện thoại này chính là Zalo ID

**Ví dụ:**
- Số điện thoại: `0912345678`
- Zalo ID sẽ là: `0912345678` (bỏ số 0 đầu tiên nếu cần: `912345678`)

### Cách 2: Kiểm tra link Zalo của bạn

1. Mở Zalo trên máy tính/web
2. Vào **Cá nhân** > **Chia sẻ thông tin liên hệ**
3. Copy link Zalo của bạn
4. Link có dạng: `https://zalo.me/0912345678` hoặc `https://zalo.me/912345678`
5. Phần sau `/` chính là Zalo ID

### Cách 3: Kiểm tra trong Zalo Official Account (nếu có)

Nếu bạn có Zalo Official Account:
1. Đăng nhập vào [Zalo OA Admin](https://oa.zalo.me/)
2. Vào **Cài đặt** > **Thông tin tài khoản**
3. Xem **Số điện thoại** hoặc **Zalo ID**

## Cách sử dụng trong ứng dụng

### Option 1: Truyền trực tiếp trong App.js

```jsx
<ZaloChatWidget zaloId="0912345678" />
```

### Option 2: Sử dụng Environment Variable

1. Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_ZALO_ID=0912345678
```

2. Trong `App.js`:
```jsx
<ZaloChatWidget zaloId={process.env.REACT_APP_ZALO_ID} />
```

## Lưu ý

- **Số điện thoại phải đã đăng ký Zalo**
- Có thể dùng số điện thoại có hoặc không có số 0 đầu tiên
  - `0912345678` hoặc `912345678` đều được
- Nếu là Zalo Official Account, có thể dùng **OA ID** thay vì số điện thoại
- Đảm bảo số điện thoại/Zalo ID là công khai để người khác có thể liên hệ

## Kiểm tra

Sau khi cấu hình, test bằng cách:
1. Click vào nút Zalo trên website
2. Sẽ mở link: `https://zalo.me/0912345678`
3. Nếu đúng, sẽ mở Zalo app/web để chat với số đó

## Ví dụ

```jsx
// Trong App.js
<ZaloChatWidget zaloId="0912345678" />

// Hoặc với environment variable
<ZaloChatWidget zaloId={process.env.REACT_APP_ZALO_ID || "0912345678"} />
```

