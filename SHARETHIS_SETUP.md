# Hướng dẫn cài đặt ShareThis

## Bước 1: Đăng ký tài khoản ShareThis

1. Truy cập: https://www.sharethis.com/
2. Click "Get Started" hoặc "Sign Up"
3. Đăng ký tài khoản miễn phí
4. Xác nhận email (nếu cần)

## Bước 2: Tạo Domain sống với ngrok (Khuyến nghị)

### Tại sao cần ngrok?
- ShareThis cần domain có thể truy cập từ internet
- Facebook cần domain public để preview khi share
- Test đầy đủ tính năng như production

### Các bước:

1. **Cài đặt ngrok:**
   ```bash
   # Download từ https://ngrok.com/download
   # Hoặc: npm install -g ngrok
   ```

2. **Khởi động ứng dụng React:**
   ```bash
   npm start
   ```
   (Giữ terminal này chạy)

3. **Chạy ngrok** (mở terminal mới):
   ```bash
   ngrok http 3000
   ```

4. **Lấy ngrok URL:**
   - Sau khi chạy ngrok, bạn sẽ thấy:
   ```
   Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
   ```
   - Copy domain: `xxxx-xx-xx-xx-xx.ngrok-free.app` (không lấy `https://`)

5. **Thêm domain vào ShareThis:**
   - Trong ShareThis Platform, click nút **"Add new domain"** (màu xanh lá)
   - Nhập domain từ ngrok: `xxxx-xx-xx-xx-xx.ngrok-free.app`
   - **KHÔNG** nhập `https://` hoặc `http://`, chỉ nhập domain
   - Click **"Add"** hoặc **"Save"**

**Xem chi tiết trong file:** `NGROK_SHARETHIS_GUIDE.md`

2. **Tạo Share Buttons:**
   - Sau khi thêm domain, bạn sẽ thấy dashboard
   - Tìm phần **"Share Buttons"** hoặc **"Inline Share Buttons"**
   - Click **"Create"** hoặc **"Add"** để tạo nút chia sẻ mới
   - Chọn kiểu: **Inline Share Buttons** (nút chia sẻ trong dòng)

3. **Lấy Property ID:**
   - Sau khi tạo share buttons, bạn sẽ thấy **Property ID**
   - Property ID thường hiển thị ở:
     - Trong URL: `platform.sharethis.com/.../property/xxxxxxxxxxxxx`
     - Trong phần Settings của property
     - Trong code snippet được cung cấp
   - Copy Property ID này (dạng: `xxxxxxxxxxxxx`)

## Bước 3: Cấu hình trong ứng dụng

**Lưu ý:** Nếu test trên localhost, bạn có thể:
- Thêm domain `localhost` trong ShareThis
- Hoặc dùng ngrok URL nếu muốn test đầy đủ tính năng

### Cách 1: Sử dụng Environment Variable (Khuyến nghị)

1. Tạo file `.env` trong thư mục gốc (nếu chưa có)
2. Thêm:
```env
REACT_APP_SHARETHIS_PROPERTY_ID=your_property_id_here
```

3. Khởi động lại ứng dụng:
```bash
npm start
```

### Cách 2: Truyền trực tiếp qua Props

Trong `src/containers/Shop/ProductDetail.js`, thay đổi:

```jsx
<ShareThisWidget 
    propertyId="your_property_id_here"
    url={shareUrl}
    title={productName}
    description={metaDescription}
    image={shareImage}
/>
```

## Bước 4: Kiểm tra

1. Chạy ứng dụng: `npm start`
2. Vào trang chi tiết sản phẩm
3. Kiểm tra xem có nút ShareThis hiển thị không
4. Click vào các nút để test chia sẻ

## Tính năng

- ✅ Chia sẻ lên Facebook
- ✅ Chia sẻ lên Twitter
- ✅ Chia sẻ lên LinkedIn
- ✅ Chia sẻ lên WhatsApp
- ✅ Chia sẻ lên Email
- ✅ Và nhiều mạng xã hội khác
- ✅ Tự động lấy meta tags từ trang
- ✅ Preview đẹp khi share

## Tùy chỉnh

Bạn có thể tùy chỉnh ShareThis trong dashboard:
- Chọn mạng xã hội muốn hiển thị
- Thay đổi kiểu dáng nút
- Thay đổi màu sắc
- Thay đổi vị trí

## Lưu ý

- ShareThis sẽ tự động sử dụng meta tags (og:tags) đã có trong trang
- Đảm bảo meta tags đã được cấu hình đúng (đã có trong MetaTags component)
- ShareThis hoạt động tốt với cả localhost và production
- Miễn phí cho mức sử dụng cơ bản

## Troubleshooting

### Nút không hiển thị:
- Kiểm tra Property ID đã đúng chưa
- Kiểm tra Console có lỗi gì không
- Đảm bảo script đã load (kiểm tra Network tab)

### Preview không đúng:
- Kiểm tra meta tags (og:tags) có đúng không
- Dùng Facebook Sharing Debugger để test
- Đảm bảo image URL là absolute URL

