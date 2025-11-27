# ShareThis - Hướng dẫn nhanh

## Bạn đang ở đâu?

Bạn đang ở trang **"Add new domain"** trong ShareThis Platform. Làm theo các bước sau:

## Bước 1: Tạo Domain sống với ngrok (Khuyến nghị)

### Cách 1: Dùng ngrok để tạo domain public

1. **Cài đặt ngrok** (nếu chưa có):
   ```bash
   # Download từ https://ngrok.com/download
   # Hoặc dùng npm:
   npm install -g ngrok
   ```

2. **Khởi động ứng dụng React:**
   ```bash
   npm start
   ```
   Ứng dụng chạy tại: `http://localhost:3000`

3. **Chạy ngrok** (mở terminal mới):
   ```bash
   ngrok http 3000
   ```

4. **Lấy ngrok URL:**
   - Sau khi chạy ngrok, bạn sẽ thấy:
   ```
   Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
   ```
   - Copy URL: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
   - **Lưu ý:** Chỉ lấy phần domain, không lấy `https://` (ví dụ: `xxxx-xx-xx-xx-xx.ngrok-free.app`)

5. **Thêm domain vào ShareThis:**
   - Click nút **"Add new domain"** trong ShareThis
   - Nhập domain từ ngrok: `xxxx-xx-xx-xx-xx.ngrok-free.app`
   - Click **"Add"** hoặc **"Save"**

### Cách 2: Dùng localhost (đơn giản hơn nhưng hạn chế)

1. **Click nút "Add new domain"** (màu xanh lá ở giữa màn hình)
2. **Nhập domain:** `localhost` hoặc `127.0.0.1`
3. **Click "Add" hoặc "Save"**

**Lưu ý:** Dùng ngrok sẽ tốt hơn vì:
- ShareThis có thể crawl được URL
- Facebook có thể preview được khi share
- Test đầy đủ tính năng như production

## Bước 2: Tạo Share Buttons

Sau khi thêm domain:

1. Bạn sẽ được chuyển đến dashboard
2. Tìm phần **"Share Buttons"** hoặc **"Inline Share Buttons"**
3. Click **"Create"** hoặc **"Add"** để tạo nút chia sẻ
4. Chọn kiểu: **Inline Share Buttons**

## Bước 3: Lấy Property ID

Property ID có thể tìm thấy ở:

1. **Trong URL:** 
   - URL sẽ có dạng: `platform.sharethis.com/.../property/xxxxxxxxxxxxx`
   - Phần `xxxxxxxxxxxxx` chính là Property ID

2. **Trong Settings:**
   - Vào Settings của property vừa tạo
   - Property ID sẽ hiển thị ở đó

3. **Trong Code Snippet:**
   - ShareThis sẽ cung cấp code snippet
   - Tìm phần: `property=xxxxxxxxxxxxx`
   - Đó chính là Property ID

## Bước 4: Cấu hình vào ứng dụng

1. Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_SHARETHIS_PROPERTY_ID=your_property_id_here
```

2. Thay `your_property_id_here` bằng Property ID bạn vừa copy

3. Khởi động lại ứng dụng:
```bash
npm start
```

## Bước 5: Kiểm tra

1. Vào trang chi tiết sản phẩm
2. Tìm phần "ShareThis Widget"
3. Bạn sẽ thấy các nút chia sẻ (Facebook, Twitter, LinkedIn, v.v.)
4. Click vào để test

## Troubleshooting

### Không thấy nút chia sẻ:
- Kiểm tra Property ID đã đúng chưa
- Kiểm tra Console (F12) có lỗi gì không
- Đảm bảo domain trong ShareThis khớp với domain bạn đang dùng

### Property ID không tìm thấy:
- Kiểm tra lại trong ShareThis dashboard
- Có thể cần tạo Share Buttons trước khi có Property ID
- Thử refresh trang ShareThis

## Lưu ý

- ShareThis miễn phí cho mức sử dụng cơ bản
- Có thể tùy chỉnh nút chia sẻ trong ShareThis dashboard
- ShareThis tự động sử dụng meta tags (og:tags) đã có

