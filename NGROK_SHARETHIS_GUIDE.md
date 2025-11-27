# Hướng dẫn dùng ngrok với ShareThis

## Tại sao cần ngrok?

- ShareThis cần domain có thể truy cập từ internet để crawl meta tags
- Facebook cần domain public để preview khi share
- Test đầy đủ tính năng như môi trường production

## Các bước chi tiết:

### Bước 1: Cài đặt ngrok

**Cách 1: Download trực tiếp**
1. Truy cập: https://ngrok.com/download
2. Download file cho Windows
3. Giải nén vào thư mục (ví dụ: `C:\ngrok`)

**Cách 2: Dùng npm**
```bash
npm install -g ngrok
```

### Bước 2: Khởi động ứng dụng React

Mở terminal và chạy:
```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

**Giữ terminal này chạy!**

### Bước 3: Chạy ngrok (Terminal mới)

Mở terminal mới (giữ terminal `npm start` vẫn chạy) và chạy:

```bash
# Nếu cài qua npm:
ngrok http 3000

# Hoặc nếu download file:
C:\ngrok\ngrok.exe http 3000
```

### Bước 4: Lấy ngrok URL

Sau khi chạy ngrok, bạn sẽ thấy output:

```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy domain:** `xxxx-xx-xx-xx-xx.ngrok-free.app` (không lấy `https://`)

### Bước 5: Thêm domain vào ShareThis

1. **Quay lại ShareThis Platform:**
   - Vẫn ở trang "Add new domain"
   - Click nút **"Add new domain"** (màu xanh lá)

2. **Nhập ngrok domain:**
   - Nhập domain từ ngrok: `xxxx-xx-xx-xx-xx.ngrok-free.app`
   - **KHÔNG** nhập `https://` hoặc `http://`
   - Chỉ nhập domain: `xxxx-xx-xx-xx-xx.ngrok-free.app`

3. **Click "Add" hoặc "Save"**

### Bước 6: Tạo Share Buttons và lấy Property ID

Sau khi thêm domain:

1. Bạn sẽ thấy dashboard của domain vừa thêm
2. Tìm phần **"Share Buttons"** hoặc **"Inline Share Buttons"**
3. Click **"Create"** hoặc **"Add"**
4. Chọn kiểu: **Inline Share Buttons**
5. Copy **Property ID** (sẽ hiển thị sau khi tạo)

### Bước 7: Cấu hình Property ID vào ứng dụng

1. **Tạo file `.env`** trong thư mục gốc:
```env
REACT_APP_SHARETHIS_PROPERTY_ID=your_property_id_here
```

2. **Thay `your_property_id_here`** bằng Property ID bạn vừa copy

3. **Khởi động lại ứng dụng:**
```bash
# Dừng npm start (Ctrl+C)
# Chạy lại:
npm start
```

### Bước 8: Test

1. **Truy cập ứng dụng qua ngrok URL:**
   - Mở trình duyệt
   - Truy cập: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
   - **KHÔNG dùng localhost:3000**

2. **Vào trang chi tiết sản phẩm:**
   - Tìm một sản phẩm
   - Click vào để xem chi tiết
   - URL sẽ là: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/san-pham/123-ten-san-pham`

3. **Kiểm tra ShareThis:**
   - Tìm phần "ShareThis Widget" trên trang
   - Bạn sẽ thấy các nút chia sẻ (Facebook, Twitter, LinkedIn, v.v.)
   - Click vào để test

## Lưu ý quan trọng:

1. **Giữ cả 2 terminal chạy:**
   - Terminal 1: `npm start` (React app)
   - Terminal 2: `ngrok http 3000` (ngrok tunnel)

2. **ngrok URL thay đổi:**
   - Mỗi lần chạy ngrok, URL có thể khác
   - Nếu URL thay đổi, cần cập nhật lại trong ShareThis
   - Hoặc đăng ký ngrok account để có URL cố định

3. **Truy cập qua ngrok URL:**
   - Luôn dùng ngrok URL để test
   - Không dùng `localhost:3000` khi test ShareThis

4. **ngrok có thể bị chặn:**
   - Một số trình duyệt có thể chặn ngrok
   - Nếu bị chặn, click "Visit Site" để tiếp tục

## Troubleshooting:

### ngrok không chạy được:
- Kiểm tra port 3000 đã được sử dụng chưa
- Thử port khác: `ngrok http 3001` (và đổi port trong React)

### ShareThis không nhận domain:
- Đảm bảo chỉ nhập domain, không có `https://` hoặc `http://`
- Kiểm tra domain đúng format: `xxxx-xx-xx-xx-xx.ngrok-free.app`

### Nút ShareThis không hiển thị:
- Kiểm tra Property ID đã đúng chưa
- Kiểm tra Console (F12) có lỗi gì không
- Đảm bảo truy cập qua ngrok URL, không phải localhost

