# Hướng dẫn cấu hình Google Analytics & Search Console

## 1. Google Analytics Setup

### Bước 1: Tạo Google Analytics Account
1. Truy cập: https://analytics.google.com/
2. Đăng nhập bằng Google account
3. Tạo Property mới cho website
4. Chọn "Web" platform
5. Nhập thông tin website:
   - Website name: F5 Store
   - Website URL: https://digital-marketing-frontend.vercel.app
   - Industry: E-commerce / Retail
   - Time zone: (GMT+07:00) Ho Chi Minh

### Bước 2: Lấy Measurement ID
1. Sau khi tạo Property, bạn sẽ nhận được **Measurement ID** dạng: `G-XXXXXXXXXX`
2. Copy Measurement ID này

### Bước 3: Cập nhật vào code
1. Mở file `public/index.html`
2. Tìm dòng:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```
3. Thay `G-XXXXXXXXXX` bằng Measurement ID thực tế của bạn
4. Tìm dòng:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX');
   ```
5. Thay `G-XXXXXXXXXX` bằng Measurement ID thực tế của bạn

### Bước 4: Test
1. Deploy lại website
2. Truy cập website và điều hướng qua các trang
3. Vào Google Analytics → Realtime → Xem có traffic không

---

## 2. Google Search Console Setup

### Bước 1: Tạo Google Search Console Account
1. Truy cập: https://search.google.com/search-console
2. Đăng nhập bằng Google account
3. Click "Add Property"
4. Chọn "URL prefix"
5. Nhập URL: `https://digital-marketing-frontend.vercel.app`

### Bước 2: Xác minh quyền sở hữu
Có 3 cách xác minh:

#### Cách 1: HTML tag (Đã được thêm vào code)
1. Google sẽ cung cấp một meta tag như:
   ```html
   <meta name="google-site-verification" content="abc123xyz..." />
   ```
2. Mở file `public/index.html`
3. Tìm dòng:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```
4. Thay `YOUR_VERIFICATION_CODE` bằng code từ Google Search Console
5. Deploy lại website
6. Click "Verify" trên Google Search Console

#### Cách 2: HTML file upload
1. Download file HTML từ Google Search Console
2. Upload file vào `public/` folder
3. Deploy và verify

#### Cách 3: DNS record
1. Thêm TXT record vào DNS của domain
2. Verify trên Google Search Console

### Bước 3: Submit sitemap
1. Sau khi verify thành công, vào "Sitemaps"
2. Nhập: `sitemap.xml`
3. Click "Submit"
4. Google sẽ crawl sitemap trong vài ngày

---

## 3. robots.txt

File `robots.txt` đã được tạo tại `public/robots.txt`

**Nội dung:**
- Cho phép tất cả search engines crawl
- Chặn các trang admin, login, checkout
- Cho phép các trang sản phẩm
- Trỏ đến sitemap.xml

**Lưu ý:** 
- File này sẽ tự động accessible tại: `https://digital-marketing-frontend.vercel.app/robots.txt`
- Có thể test bằng cách truy cập URL trên

---

## 4. sitemap.xml

File `sitemap.xml` đã được tạo tại `public/sitemap.xml`

**Hiện tại bao gồm:**
- Homepage (/)
- Home page (/home)
- Products page (/product)

**Lưu ý:**
- Sitemap hiện tại là static
- Nên tạo dynamic sitemap từ backend để tự động cập nhật khi có sản phẩm mới
- Có thể tạo API endpoint `/api/sitemap.xml` để generate động

**Để tạo dynamic sitemap:**
1. Backend: Tạo API `/api/sitemap.xml`
2. API này sẽ:
   - Lấy danh sách sản phẩm từ database
   - Generate XML với các URL sản phẩm
   - Return XML content
3. Frontend: Có thể fetch từ API hoặc để backend serve trực tiếp

---

## 5. Kiểm tra sau khi setup

### Google Analytics:
- ✅ Realtime reports có hiển thị traffic
- ✅ Page views được track
- ✅ Events được ghi nhận (nếu có)

### Google Search Console:
- ✅ Property đã được verify
- ✅ Sitemap đã được submit và processed
- ✅ Coverage report không có lỗi
- ✅ Performance report có data (sau vài ngày)

### robots.txt:
- ✅ Accessible tại `/robots.txt`
- ✅ Nội dung đúng format

### sitemap.xml:
- ✅ Accessible tại `/sitemap.xml`
- ✅ XML format hợp lệ
- ✅ Đã được Google index (sau vài ngày)

---

## Troubleshooting

### Google Analytics không track được:
1. Kiểm tra Measurement ID đã đúng chưa
2. Kiểm tra browser console có lỗi không
3. Dùng Google Tag Assistant extension để debug
4. Kiểm tra Ad blocker có chặn không

### Google Search Console không verify được:
1. Kiểm tra meta tag đã được thêm vào HTML chưa
2. Deploy lại website sau khi thêm meta tag
3. Đảm bảo meta tag nằm trong `<head>` section
4. Thử cách xác minh khác (HTML file hoặc DNS)

### Sitemap không được index:
1. Kiểm tra sitemap.xml accessible không
2. Kiểm tra format XML có đúng không
3. Đợi vài ngày để Google crawl
4. Submit lại sitemap trên Search Console

