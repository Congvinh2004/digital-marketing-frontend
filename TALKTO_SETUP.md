# Hướng dẫn cài đặt TalkTo (Tawk.to) Chat Widget

## Bước 1: Đăng ký tài khoản TalkTo

1. Truy cập https://www.tawk.to/
2. Click "Sign Up Free" để đăng ký tài khoản miễn phí
3. Điền thông tin và xác nhận email

## Bước 2: Lấy Property ID và Widget ID

1. Sau khi đăng nhập, vào **Dashboard**
2. Chọn **Administration** > **Channels** > **Chat Widget**
3. Bạn sẽ thấy **Property ID** và **Widget ID** trong phần **Embed Code**
   - Ví dụ: `https://embed.tawk.to/PROPERTY_ID/WIDGET_ID`
   - Property ID: chuỗi ký tự dài (ví dụ: `507f1f77XXXXXXXXXXXXX`)
   - Widget ID: chuỗi ký tự ngắn hơn (ví dụ: `default`)

## Bước 3: Cấu hình trong ứng dụng

### Cách 1: Sử dụng Environment Variables (Khuyến nghị)

1. Tạo file `.env` trong thư mục gốc của project (nếu chưa có)
2. Thêm các biến sau:

```env
REACT_APP_TAWKTO_PROPERTY_ID=your_property_id_here
REACT_APP_TAWKTO_WIDGET_ID=your_widget_id_here
```

3. Khởi động lại ứng dụng:
```bash
npm start
```

### Cách 2: Truyền trực tiếp qua Props

Trong file `src/containers/App.js`, thay đổi:

```jsx
<TalkToWidget 
    propertyId="YOUR_PROPERTY_ID"
    widgetId="YOUR_WIDGET_ID"
/>
```

## Bước 4: Kiểm tra

1. Chạy ứng dụng: `npm start`
2. Mở trình duyệt và kiểm tra góc dưới bên phải màn hình
3. Widget chat TalkTo sẽ xuất hiện
4. Click vào widget để mở chat window

## Tính năng

- ✅ Chat trực tiếp với khách hàng
- ✅ Quản lý cuộc hội thoại từ dashboard TalkTo
- ✅ Tự động phản hồi (nếu cấu hình)
- ✅ Mobile responsive
- ✅ Miễn phí

## Lưu ý

- Widget TalkTo sẽ tự động load khi component được mount
- Nếu không thấy widget, kiểm tra:
  - Property ID và Widget ID đã đúng chưa
  - Console có lỗi gì không
  - Đã khởi động lại ứng dụng sau khi thêm environment variables chưa

## Tùy chỉnh nâng cao

Bạn có thể sử dụng các method của TalkTo API:

```javascript
// Trong component khác
window.Tawk_API.showWidget();
window.Tawk_API.hideWidget();
window.Tawk_API.toggle();
window.Tawk_API.maximize();
window.Tawk_API.minimize();
```

Xem thêm tài liệu tại: https://www.tawk.to/knowledgebase/

