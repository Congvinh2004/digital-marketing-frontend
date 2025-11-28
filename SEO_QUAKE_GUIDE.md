# Hướng Dẫn Sử Dụng SEO Quake Để Đánh Giá Và Hiệu Chỉnh SEO

## 1. Cài Đặt SEO Quake

### Cách 1: Cài đặt từ Chrome Web Store
1. Mở Google Chrome
2. Truy cập: https://chrome.google.com/webstore/detail/seoquake/akdgnmcogleenhbclghghlkkdndkjdjc
3. Click "Thêm vào Chrome"
4. Xác nhận cài đặt

### Cách 2: Cài đặt từ Firefox Add-ons
1. Mở Firefox
2. Truy cập: https://addons.mozilla.org/en-US/firefox/addon/seoquake/
3. Click "Add to Firefox"
4. Xác nhận cài đặt

## 2. Sử Dụng SEO Quake Để Đánh Giá Trang Chủ (/home)

### Bước 1: Mở trang cần đánh giá
1. Truy cập: `http://localhost:3000/home` (hoặc URL production)
2. Đảm bảo trang đã load đầy đủ

### Bước 2: Kích hoạt SEO Quake
1. Click vào icon SEO Quake trên thanh công cụ trình duyệt
2. Chọn "Show SEOquake" hoặc nhấn phím tắt (thường là `Ctrl + Shift + E`)

### Bước 3: Xem báo cáo SEO
SEO Quake sẽ hiển thị một bảng báo cáo với các chỉ số:

#### A. Basic Parameters (Thông số cơ bản)
- **Title**: Kiểm tra title có đúng format và độ dài (50-60 ký tự)
- **Description**: Kiểm tra meta description (150-160 ký tự)
- **Keywords**: Kiểm tra meta keywords
- **H1-H6**: Kiểm tra số lượng và cấu trúc heading tags

#### B. Links (Liên kết)
- **Internal Links**: Số liên kết nội bộ
- **External Links**: Số liên kết ngoài
- **NoFollow Links**: Số liên kết nofollow

#### C. Images (Hình ảnh)
- **Images with Alt**: Số hình ảnh có alt text
- **Images without Alt**: Số hình ảnh thiếu alt text

#### D. Text/HTML Ratio (Tỷ lệ Text/HTML)
- Tỷ lệ nội dung text so với HTML code (nên > 25%)

## 3. Các Chỉ Số SEO Quan Trọng Cần Kiểm Tra

### ✅ Đã Được Tối Ưu Trong Trang Chủ:

1. **Meta Tags**
   - ✅ Title: "F5 Store - Cửa Hàng Trực Tuyến Uy Tín | Mua Sắm Online Chất Lượng"
   - ✅ Description: Mô tả đầy đủ, hấp dẫn (150-160 ký tự)
   - ✅ Keywords: Từ khóa phù hợp
   - ✅ Open Graph tags: Đầy đủ cho Facebook sharing
   - ✅ Twitter Card tags: Đầy đủ cho Twitter sharing

2. **SEO Content**
   - ✅ Có section SEO content với nội dung phong phú
   - ✅ Sử dụng các heading tags (H1, H2, H3) đúng cách
   - ✅ Từ khóa được phân bố tự nhiên trong nội dung
   - ✅ Nội dung có độ dài phù hợp (500+ từ)

3. **URL Structure**
   - ✅ URL thân thiện: `/home`
   - ✅ Canonical URL được set đúng

## 4. Các Điểm Cần Hiệu Chỉnh (Nếu Có)

### A. Title Tag
- **Yêu cầu**: 50-60 ký tự, chứa từ khóa chính
- **Hiện tại**: "F5 Store - Cửa Hàng Trực Tuyến Uy Tín | Mua Sắm Online Chất Lượng" (67 ký tự)
- **Đề xuất**: Có thể rút ngắn nếu SEO Quake cảnh báo

### B. Meta Description
- **Yêu cầu**: 150-160 ký tự, hấp dẫn, chứa từ khóa
- **Hiện tại**: Đã tối ưu (~155 ký tự)

### C. Heading Tags (H1, H2, H3)
- **Yêu cầu**: 
  - Chỉ có 1 H1 tag
  - H2, H3 được sử dụng hợp lý
- **Kiểm tra**: Sử dụng SEO Quake để xem cấu trúc heading

### D. Alt Text cho Images
- **Yêu cầu**: Tất cả hình ảnh phải có alt text
- **Kiểm tra**: SEO Quake sẽ báo cáo số hình ảnh thiếu alt text

### E. Internal Links
- **Yêu cầu**: Có đủ liên kết nội bộ (tối thiểu 3-5 links)
- **Hiện tại**: Trang chủ có nhiều liên kết đến trang sản phẩm

### F. Text/HTML Ratio
- **Yêu cầu**: > 25%
- **Kiểm tra**: SEO Quake sẽ hiển thị tỷ lệ này

## 5. Cách Hiệu Chỉnh Dựa Trên SEO Quake

### Bước 1: Xem báo cáo chi tiết
1. Click vào từng chỉ số trong SEO Quake để xem chi tiết
2. Ghi chú các điểm cần cải thiện

### Bước 2: Hiệu chỉnh code
1. Mở file `src/containers/HomePage/HomePage.js`
2. Điều chỉnh các thông số SEO dựa trên báo cáo:
   - Sửa title nếu quá dài/ngắn
   - Sửa description nếu không đạt yêu cầu
   - Thêm alt text cho hình ảnh nếu thiếu
   - Điều chỉnh heading tags nếu cần

### Bước 3: Kiểm tra lại
1. Refresh trang
2. Chạy lại SEO Quake
3. So sánh kết quả trước và sau

## 6. Checklist Đánh Giá SEO

Sử dụng checklist này khi đánh giá với SEO Quake:

- [ ] Title tag: 50-60 ký tự, chứa từ khóa chính
- [ ] Meta description: 150-160 ký tự, hấp dẫn
- [ ] Meta keywords: Có từ khóa phù hợp
- [ ] H1 tag: Chỉ có 1 H1, chứa từ khóa chính
- [ ] H2, H3 tags: Được sử dụng hợp lý
- [ ] Alt text: Tất cả hình ảnh có alt text
- [ ] Internal links: Có đủ liên kết nội bộ (3-5 links)
- [ ] Text/HTML ratio: > 25%
- [ ] Open Graph tags: Đầy đủ (og:title, og:description, og:image)
- [ ] Twitter Card tags: Đầy đủ
- [ ] Canonical URL: Được set đúng
- [ ] URL structure: Thân thiện, không có ký tự đặc biệt

## 7. Kết Quả Mong Đợi

Sau khi tối ưu, trang chủ `/home` sẽ đạt:

- ✅ **SEO Score**: 80-100 điểm (tùy theo tiêu chí của SEO Quake)
- ✅ **Title**: Đạt yêu cầu về độ dài và từ khóa
- ✅ **Description**: Hấp dẫn, đầy đủ thông tin
- ✅ **Content**: Phong phú, có giá trị cho người dùng
- ✅ **Technical SEO**: Đầy đủ meta tags, alt text, heading tags

## 8. Lưu Ý

1. **SEO Quake chỉ là công cụ hỗ trợ**: Kết quả từ SEO Quake chỉ mang tính tham khảo, không phải là tiêu chuẩn tuyệt đối.

2. **Tập trung vào trải nghiệm người dùng**: SEO tốt nhưng phải đảm bảo nội dung có giá trị cho người dùng.

3. **Kiểm tra thường xuyên**: Nên kiểm tra lại sau mỗi lần cập nhật nội dung.

4. **Sử dụng nhiều công cụ**: Ngoài SEO Quake, có thể sử dụng thêm:
   - Google Search Console
   - Google PageSpeed Insights
   - Lighthouse (Chrome DevTools)

## 9. Tài Liệu Tham Khảo

- SEO Quake Documentation: https://www.seoquake.com/
- Google SEO Starter Guide: https://developers.google.com/search/docs/beginner/seo-starter-guide
- Moz SEO Learning Center: https://moz.com/learn/seo

