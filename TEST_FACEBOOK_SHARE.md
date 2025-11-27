# Hướng dẫn Test Facebook Share trên Localhost

## Bước 1: Cài đặt ngrok

### Cách 1: Download trực tiếp (Khuyến nghị)
1. Truy cập: https://ngrok.com/download
2. Download file phù hợp với hệ điều hành của bạn
3. Giải nén và đặt vào thư mục dễ tìm (ví dụ: `C:\ngrok`)

### Cách 2: Dùng npm
```bash
npm install -g ngrok
```

## Bước 2: Khởi động ứng dụng React

Mở terminal và chạy:
```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## Bước 3: Khởi động ngrok

Mở terminal mới (giữ terminal chạy `npm start` vẫn chạy) và chạy:

```bash
ngrok http 3000
```

**Lưu ý:** Nếu ngrok không có trong PATH, bạn cần:
- Windows: `C:\ngrok\ngrok.exe http 3000` (hoặc đường dẫn bạn đặt)
- Mac/Linux: `./ngrok http 3000` (nếu trong cùng thư mục)

## Bước 4: Lấy ngrok URL

Sau khi chạy ngrok, bạn sẽ thấy output như sau:

```
Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
```

**Copy URL:** `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

## Bước 5: Truy cập ứng dụng qua ngrok URL

1. Mở trình duyệt
2. Truy cập URL từ ngrok (ví dụ: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)
3. **KHÔNG dùng localhost:3000** - phải dùng ngrok URL

## Bước 6: Test Facebook Share

1. **Điều hướng đến trang sản phẩm:**
   - Tìm một sản phẩm bất kỳ
   - Click vào để xem chi tiết
   - URL sẽ là: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/san-pham/123-ten-san-pham`

2. **Kiểm tra Meta Tags:**
   - Nhấn `Ctrl+U` (hoặc `Cmd+U` trên Mac) để xem source code
   - Tìm các thẻ `<meta property="og:...">`
   - Kiểm tra xem URL trong meta tags có dùng ngrok URL không

3. **Click nút "Chia sẻ Facebook":**
   - Tìm nút màu xanh "Chia sẻ Facebook" trên trang sản phẩm
   - Click vào nút đó
   - Popup Facebook sẽ mở

4. **Kiểm tra preview trên Facebook:**
   - Trong popup Facebook, bạn sẽ thấy preview của bài share
   - Kiểm tra:
     - ✅ Hình ảnh sản phẩm có hiển thị không?
     - ✅ Tiêu đề sản phẩm có đúng không?
     - ✅ Mô tả sản phẩm có hiển thị không?
     - ✅ URL có đúng không?

## Bước 7: Debug nếu không hoạt động

### Kiểm tra Console (F12):
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Click nút "Chia sẻ Facebook"
4. Xem các log:
   - `Facebook Share URL:` - URL được tạo
   - `Full URL to share:` - URL đầy đủ
   - `Base URL:` - Base URL hiện tại

### Sử dụng Facebook Sharing Debugger:
1. Truy cập: https://developers.facebook.com/tools/debug/
2. Nhập URL sản phẩm từ ngrok (ví dụ: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/san-pham/123-ten-san-pham`)
3. Click "Debug"
4. Xem kết quả:
   - Nếu có lỗi, sẽ hiển thị ở đây
   - Nếu thành công, sẽ thấy preview
5. Click "Scrape Again" để force Facebook crawl lại

## Lưu ý quan trọng:

1. **Phải dùng ngrok URL:** Không dùng `localhost:3000`, phải dùng URL từ ngrok
2. **Giữ ngrok chạy:** Đừng tắt terminal chạy ngrok khi đang test
3. **Facebook cache:** Nếu thay đổi meta tags, dùng Sharing Debugger để refresh
4. **ngrok URL thay đổi:** Mỗi lần chạy ngrok, URL có thể khác (trừ khi dùng ngrok account)

## Troubleshooting:

### Ngrok không chạy được:
- Kiểm tra port 3000 đã được sử dụng chưa
- Thử port khác: `ngrok http 3001` (và đổi port trong React)

### Facebook không hiển thị preview:
- Kiểm tra meta tags có đúng không (View Source)
- Dùng Sharing Debugger để xem lỗi
- Đảm bảo image URL là absolute URL

### Preview hiển thị sai:
- Dùng Sharing Debugger để refresh cache
- Kiểm tra image có accessible không
- Kiểm tra description không quá dài

## Checklist Test:

- [ ] ngrok đã chạy và có URL
- [ ] Truy cập ứng dụng qua ngrok URL (không phải localhost)
- [ ] Vào trang chi tiết sản phẩm
- [ ] Kiểm tra meta tags trong source code
- [ ] Click nút "Chia sẻ Facebook"
- [ ] Popup Facebook mở thành công
- [ ] Preview hiển thị đúng hình ảnh
- [ ] Preview hiển thị đúng tiêu đề
- [ ] Preview hiển thị đúng mô tả
- [ ] URL trong preview đúng

## Kết quả mong đợi:

Khi share thành công, bạn sẽ thấy:
- Popup Facebook mở
- Preview hiển thị hình ảnh sản phẩm
- Tiêu đề là tên sản phẩm
- Mô tả là mô tả sản phẩm
- URL là URL thân thiện của sản phẩm

