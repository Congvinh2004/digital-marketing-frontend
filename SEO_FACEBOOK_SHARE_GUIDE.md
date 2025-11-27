# Hướng dẫn kiểm tra và khắc phục Facebook Share

## Vấn đề: Không tạo được bài share trên Facebook

### Nguyên nhân có thể:

1. **URL không accessible từ bên ngoài**
   - Facebook cần crawl URL từ server, không phải localhost
   - Cần deploy website lên server thực tế (không phải localhost:3000)

2. **Meta tags chưa được Facebook crawl**
   - Facebook cần thời gian để crawl và cache meta tags
   - Sử dụng [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) để force refresh

3. **URL không đúng format**
   - URL phải là absolute URL (có http:// hoặc https://)
   - URL phải accessible từ internet

## Cách kiểm tra và khắc phục:

### Bước 1: Kiểm tra Meta Tags

1. Mở trang sản phẩm trên trình duyệt
2. View page source (Ctrl+U)
3. Kiểm tra xem có các meta tags sau không:
   ```html
   <meta property="og:title" content="..." />
   <meta property="og:description" content="..." />
   <meta property="og:image" content="..." />
   <meta property="og:url" content="..." />
   ```

### Bước 2: Sử dụng Facebook Sharing Debugger

1. Truy cập: https://developers.facebook.com/tools/debug/
2. Nhập URL sản phẩm (phải là URL thực tế, không phải localhost)
3. Click "Debug" để xem Facebook thấy gì
4. Click "Scrape Again" để force Facebook crawl lại

### Bước 3: Kiểm tra URL

- URL phải là absolute URL: `https://yourdomain.com/san-pham/123-ten-san-pham`
- Không được là: `localhost:3000/san-pham/123-ten-san-pham` (Facebook không crawl được localhost)

### Bước 4: Test Facebook Share

1. Click nút "Chia sẻ Facebook" trên trang sản phẩm
2. Popup Facebook sẽ mở
3. Kiểm tra xem preview có hiển thị đúng:
   - Hình ảnh
   - Tiêu đề
   - Mô tả
   - URL

## Lưu ý quan trọng:

1. **Localhost không hoạt động**: Facebook không thể crawl localhost, cần deploy lên server thực tế
2. **Cache**: Facebook cache meta tags, nếu thay đổi cần dùng Sharing Debugger để refresh
3. **Image URL**: Hình ảnh phải là absolute URL và accessible từ internet
4. **HTTPS**: Nên sử dụng HTTPS cho production

## Cách test trên localhost:

### Cách 1: Sử dụng ngrok (Khuyến nghị)

1. **Cài đặt ngrok:**
   ```bash
   # Download từ https://ngrok.com/download
   # Hoặc dùng npm:
   npm install -g ngrok
   ```

2. **Chạy ngrok:**
   ```bash
   # Mở terminal mới và chạy:
   ngrok http 3000
   ```

3. **Lấy public URL:**
   - Ngrok sẽ cung cấp URL dạng: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
   - Copy URL này

4. **Cập nhật Meta Tags để dùng ngrok URL:**
   - Tạm thời thay `window.location.origin` bằng ngrok URL
   - Hoặc set environment variable

5. **Test Facebook Share:**
   - Truy cập trang sản phẩm qua ngrok URL
   - Click nút "Chia sẻ Facebook"
   - Facebook sẽ crawl được URL từ ngrok

### Cách 2: Sử dụng localtunnel (Miễn phí, không cần đăng ký)

1. **Cài đặt:**
   ```bash
   npm install -g localtunnel
   ```

2. **Chạy:**
   ```bash
   lt --port 3000
   ```

3. **Sử dụng URL được cung cấp** (dạng: `https://xxxx.loca.lt`)

### Cách 3: Sử dụng serveo.net (Không cần cài đặt)

1. **Chạy:**
   ```bash
   ssh -R 80:localhost:3000 serveo.net
   ```

2. **Sử dụng URL được cung cấp**

### Lưu ý khi test trên localhost:

- **Meta tags phải dùng ngrok URL**, không phải localhost
- **Image URLs cũng phải là absolute URLs** với ngrok domain
- **Facebook có thể cache**, nếu không thấy thay đổi, dùng Sharing Debugger để refresh

## Debug:

Mở Console (F12) và kiểm tra:
- Facebook Share URL được tạo đúng chưa
- URL có đúng format không
- Có lỗi gì không

