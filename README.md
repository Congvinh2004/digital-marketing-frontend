# **Hướng dẫn cài đặt dự án**

## **1.1 Giới thiệu**
- Dự án phần mềm đi chợ trực tuyến là một website được phát triển bằng ngôn ngữ JavaScript.
  Được xây dựng bằng framework ReactJs, là một nền tảng hiện đại, linh hoạt, và thân thiện với người dùng. 
  Đây là giải pháp hiệu quả giúp người tiêu dùng mua sắm thực phẩm, hàng hóa thiết yếu một cách tiện lợi và nhanh chóng mà không cần rời khỏi nhà.
  Website mang lại trải nghiệm mua sắm trực tuyến dễ dàng thông qua các tính năng nổi bật và giao diện tối ưu.
  
## **1.2 Tính năng chính**
- **a. Người dùng**
  - Đăng ký và đăng nhập
    
  - **Duyệt sản phẩm**:
  
    - Phân loại sản phẩm theo danh mục (rau củ, thịt cá, thực phẩm chế biến sẵn, v.v.).
    - Tìm kiếm sản phẩm theo tên, danh mục hoặc từ khóa.
    - Bộ lọc thông minh (giá, đánh giá, khuyến mãi).
  - **Quản lý giỏ hàng:**
  
    - Thêm, xóa hoặc cập nhật số lượng sản phẩm trong giỏ hàng.
    - Tính tổng chi phí đơn hàng kèm thuế và phí vận chuyển.
  - **Thanh toán:**
  
    - Hỗ trợ thanh toán trực tuyến qua cổng thanh toán như VNPay, Momo, hoặc thẻ tín dụng.
    - Tùy chọn thanh toán khi nhận hàng (COD).
  - **Theo dõi đơn hàng:**
  
    - Xem lịch sử mua sắm.
    - Theo dõi trạng thái đơn hàng (đang xử lý, đã giao hàng).
- **a. Admin**
  - Quản lý sản phẩm:

    - Thêm, sửa, xóa sản phẩm.
    - Quản lý tồn kho và giá cả.
  - Quản lý đơn hàng:

    - Xem danh sách đơn hàng.
    - Cập nhật trạng thái đơn hàng.
  - Quản lý người dùng:

    - Theo dõi danh sách khách hàng.
    - Quản lý quyền truy cập.
  - Thống kê:

    - Thống kê doanh thu, sản phẩm bán chạy, khách hàng thường xuyên.

## **1.3 Công nghệ sử dụng**
- Ngôn ngữ lập trình: JavaScript
- Framework: ReactJs

## **2. Yêu cầu hệ thống**
- **Phần cứng:**
  - CPU: Bộ xử lý đa nhân, tốc độ tối thiểu 2.0 GHz
  - RAM: Tối thiểu 4 GB
  - Ổ đĩa trống: Tối thiểu 5 GB
- **Phần mềm:**
  - **Hệ điều hành:**
    - Windows 10 hoặc mới hơn
    - macOS 10.15 Catalina hoặc mới hơn
    - Các bản phân phối Linux phổ biến (Ubuntu 20.04+, CentOS 8+, v.v.)
  - **Các phần mềm hoặc thư viện cần thiết:**
    
    - Visual Studio Code (Trình biên dịch code)
    - NVM (để quản lý các phiên bản của Node.js)
    - ReactJs (Framework xây dựng website)
    - npm (đi kèm với Node.js)
    - Git (Là một hệ thống quản lý mã nguồn phân tán)
## **3. Cài đặt các công cụ và thư viện cần thiết**

- **Công cụ:**

  - **Cách cài đặt NVM (phiên bản 1.1.12)**:
    - Xóa toàn bộ phiên bản NodeJs đã cài trên máy.
    - Lưu ý: cần note lại tên phiên bản đã cài trước đó để cài đặt lại nếu cần thiết để chạy các dự án khác.
    - Kiểm tra máy tính đã cài đặt NVM chưa bằng cách:
      - mở cmd trên máy tính và chạy với quyền quản trị viên
      - chạy lệnh
         ```bash
        nvm
      - Nếu chưa cài, tiến hành cài đặt trên trang chủ của github:
         ```bash
        https://github.com/coreybutler/nvm-windows/releases/tag/1.1.12
      - Nếu đã cài thì sẽ thấy phiên bản của NVM hiện trên màn hình,
        ví dụ:
        ```env
        Running version 1.1.12.
    - Kiểm tra phiên bản NVM, nếu không phải 1.1.12, tiến hành gỡ bằng lệnh với cmd:
         ```bash
        nvm uninstall
    - Sau đó cài đặt lại NVM version 1.1.12 như ở trên.
  - Sau khi cài đặt xong, kiểm tra lại bằng các nhập:
    ```bash
    nvm
  Trên màn hình hiện đúng phiên bản NVM 1.1.12 là đã cài thành công.

  
 - **Cách cài đặt NodeJs (phiên bản 14.17.0)**:
    - Sau khi đã cài NVM, tiến hành cài NodeJs version 14.17.0 bằng cách:
      ```bash
      nvm install 14.17.0

    - Chờ cho tới khi thông báo đã cài đặt thành công
    - Kiểm tra xem đã cài thành công hay chưa, nhập lệnh sau và nhấn Enter:
      ```bash
      node -v
    - Kết quả: Lệnh trên sẽ hiển thị phiên bản Node.js đang được cài đặt, ví dụ:
      ```bash
      v14.17.0
- **Cách cài đặt Git**:
- Kiểm tra xem máy tính đã được cài Git hay chưa:
  ```bash
  git --version
Nếu chưa cài, bạn có thể tải Git từ git-scm.com và cài đặt.


## **4. Tải xuống mã nguồn**
**a. Chuẩn bị**:
- Đảm bảo bạn đã cài đặt Git trên máy tính. Kiểm tra bằng lệnh:
  ```bash
  git --version
- Nếu chưa cài, bạn có thể tải Git theo bước 3.

**b. Clone Project**:

1. **Mở Terminal hoặc Command Prompt**.
2. Điều hướng đến thư mục mà bạn muốn chứa project (nếu cần):
   ```bash
   cd đường_dẫn_thư_mục
   ```
   Hoặc tạo 1 thư mục chứa project, ấn chuột phải vào thư mục chọn lệnh "Git Bash Here"
3. Chạy lệnh clone:
   ```bash
   git clone https://github.com/tridang04/UI-digitalMarketing.git
   ```
4. Clone xong kiểm tra
- Sau khi clone xong, bạn sẽ có một thư mục với tên của repository chứa toàn bộ project.

  
## **5. Chạy dự án**
- Chạy lệnh `npm install` để cài đặt các gói package của dự án.
- Sau khi cài đặt xong, sẽ thấy thư mục `node_modules`. Trường hợp chưa thấy, cần kiểm tra và cài đặt lại.
- Hướng dẫn khởi động dự án, nhập lệnh:
  ```bash
  npm start

## **6. Sử dụng chức năng**
**a. Các chức năng chính:**
- User:
  - nhập đường dẫn `http://localhost:3000/product` để xem danh sách các sản phẩm
- Admin:
  - Quản lý người dùng:
    - nhập đường dẫn `http://localhost:3000/system/user-manage` để quản lý người dùng
  - Quản lý sản phẩm:
      - nhập đường dẫn `http://localhost:3000/system/product-manage` để quản lý sản phẩm.

**b. Các chức năng khác:**
  - _Đang hoàn thiện_



## **7. Kiểm tra và xác minh**

- Cách kiểm tra xem dự án đã chạy thành công chưa:
 -Nếu thành công, bạn sẽ thấy giao diện được chạy trên trình duyệt với đường dẫn `http://localhost:3000`


## **8. Các vấn đề thường gặp**
- Danh sách các lỗi phổ biến và cách khắc phục:
 
  - **Lỗi:** Thư viện không tải được.
    - **Cách xử lý:** Chạy lại lệnh cài đặt:
      ```bash
      npm install
      ```

## **9. Tài liệu tham khảo**
- Trang chủ ReactJs: `https://react.dev/`

## **10. Liên hệ hỗ trợ**
- Email: 4801104148@student.hcmue.edu.vn
