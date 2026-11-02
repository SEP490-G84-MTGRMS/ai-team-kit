# Đề Xuất Tính Năng: Tích Hợp Thanh Toán Chuyển Khoản VietQR Tự Động & Cấu Hình Cổng SePay (pos-vietqr-sepay-payment-and-settings)

## 1. Vấn Đề (Problem Statement)
1. **Thiếu pháp nhân doanh nghiệp:** Đa số chủ cửa hàng tạp hóa, siêu thị mini là cá nhân hoặc hộ kinh doanh cá thể, không đủ điều kiện pháp lý để ký hợp đồng mở cổng thanh toán doanh nghiệp (như VNPay, MoMo Doanh nghiệp). Nhu cầu thực tế là nhận tiền trực tiếp về tài khoản ngân hàng cá nhân của từng chủ tiệm.
2. **Rủi ro kiểm tra thủ công & bill giả:** Việc thu ngân đứng nhìn màn hình điện thoại của khách để xác nhận chuyển khoản rất mất thời gian, dễ gây ùn tắc quầy thu ngân và tiềm ẩn rủi ro bị lừa đảo bởi các ứng dụng tạo bill giả mạo (Fake Bill App).
3. **Chưa có nơi cấu hình tài khoản & thiếu hướng dẫn:** Hiện tại trên quầy POS chưa có giao diện cho Chủ cửa hàng thiết lập tài khoản nhận tiền chuyển khoản, cũng như chưa có hướng dẫn chi tiết cách đăng ký và kết nối cổng SePay để nhận thông báo thanh toán tự động (Webhook).
4. **Mối lo ngại về an ninh mạng:** Nguy cơ kẻ gian tấn công giả mạo Webhook bằng cách bắn request ảo (Postman, cURL) để lừa hệ thống tự động xuất hàng, hoặc nguy cơ lộ API Key gây mất an toàn dòng tiền.

## 2. Mục Tiêu (Goals)
1. **Giao diện Cấu hình Tiện lợi:** Thêm nút Cài đặt (biểu tượng bánh răng) trên thanh điều hướng quầy POS (`PosHeader`), mở Modal cấu hình tài khoản nhận tiền chuyển khoản dành riêng cho Chủ cửa hàng (`STORE_OWNER`).
2. **Hướng dẫn Đăng ký Chi tiết:** Tích hợp cẩm nang hướng dẫn trực quan từng bước ngay trong modal cài đặt: hướng dẫn đăng ký tài khoản SePay miễn phí, liên kết tài khoản ngân hàng cá nhân, lấy API Key và dán Webhook URL vào SePay.
3. **Quét Mã VietQR Động Tự Động:** Tại màn hình thu ngân POS, khi chọn phương thức "Chuyển khoản", hệ thống sinh mã VietQR động chuẩn Napas 247 chứa chính xác số tiền và cú pháp chuyển khoản phân lập theo Tenant (`<TENANT>_<ORDER_CODE>`).
4. **Tự Động Gạch Nợ & Hoàn Tất Đơn:** Khi khách chuyển khoản thành công, Webhook SePay ghi nhận biến động số dư, tự động so khớp và gạch nợ cho đơn hàng ngay lập tức.
5. **Kiến Trúc Phòng Thủ Chiều Sâu 6 Lớp:** Đảm bảo an toàn tuyệt đối 100% trước nguy cơ request ảo, chống replay attack, và giữ vững an toàn ngay cả khi lộ API Key.

## 3. Phạm Vi (Scope)

### Trong Phạm Vi (In Scope)
* **Frontend POS:**
  - Nút Cài đặt (bánh răng) trên `PosHeader.tsx` (chỉ hiển thị/cho phép thao tác khi là `STORE_OWNER`).
  - Modal `PaymentConfigModal` gồm 2 tab:
    * Tab 1: Form thiết lập thông tin ngân hàng (Ngân hàng, Số tài khoản, Tên chủ tài khoản, SePay API Key, Webhook Token, Trạng thái kích hoạt).
    * Tab 2: Hướng dẫn đăng ký SePay chi tiết 5 bước kèm hình ảnh minh họa và các thông số cần sao chép.
  - Tích hợp Modal Thanh toán VietQR động trong luồng thanh toán POS (`PosCheckoutPage.tsx`), hiển thị mã QR, thông tin đơn hàng và trạng thái chờ xác nhận chuyển khoản (hỗ trợ cả Offline Fallback lẫn Online Backend).
* **Backend .NET 8:**
  - Entity `StorePaymentConfig` lưu cấu hình tài khoản ngân hàng và API Key SePay mã hóa theo từng Tenant.
  - API Controller: Quản lý cấu hình thanh toán (`GET /api/v1/store-payment-configs`, `POST /api/v1/store-payment-configs`).
  - Webhook Controller (`POST /api/v1/payments/sepay-webhook`) xử lý Webhook với mô hình 6 lớp bảo mật, đối soát ngược (Double-check) gọi trực tiếp sang SePay API.
* **Bảo Mật:**
  - Mã hóa CSDL (AES-256) cho API Key.
  - Kiểm tra Idempotency chống tấn công lặp lại (Replay attack).
  - So khớp số tiền thực nhận và mã đơn hàng phân lập theo Tenant.

### Ngoài Phạm Vi (Out of Scope)
* Nghiệp vụ rút tiền hoặc chuyển tiền đi từ tài khoản ngân hàng (SePay chỉ là cổng đọc biến động số dư, không có quyền can thiệp dòng tiền ra).
* Kết nối cổng thanh toán thẻ quốc tế (Visa/Mastercard/JCB) hay máy POS quẹt thẻ vật lý.

## 4. Người Dùng & Vai Trò (Users & Roles)
* **Chủ Cửa Hàng (`STORE_OWNER`):** Toàn quyền truy cập nút Cài đặt bánh răng, thiết lập tài khoản ngân hàng, xem hướng dẫn kết nối SePay và cấu hình API Key.
* **Thu Ngân / Nhân Viên (`EMPLOYEE` / `CASHIER`):** Khi thanh toán đơn hàng, chọn hình thức "Chuyển khoản" để hiển thị mã VietQR động cho khách quét. Không xem được API Key hay sửa thông tin tài khoản ngân hàng của chủ.
* **Khách Hàng:** Quét mã QR bằng bất kỳ ứng dụng ngân hàng nào (Vietcombank, MB, Techcombank, VPBank...) để thanh toán tự động không cần nhập tay số tiền hay nội dung.

## 5. Tiêu Chí Thành Công Đo Được (Acceptance Criteria)
1. Bấm vào icon bánh răng trên `PosHeader` mở được Modal Cài Đặt Thanh Toán với đầy đủ hướng dẫn đăng ký SePay chi tiết.
2. Lưu cấu hình tài khoản ngân hàng thành công và hiển thị mặt nạ bảo mật cho API Key (`sepay_apikey_••••••••`).
3. Tại quầy POS, chọn "Chuyển khoản" sinh ra đúng mã VietQR chứa số tài khoản, mã ngân hàng và số tiền của đơn hàng.
4. Xử lý Webhook an toàn: Phát hiện và chặn đứng 100% các request ảo (không có giao dịch thật trên ngân hàng) nhờ cơ chế Double-Check API SePay.
5. Dự án build thành công 0 lỗi cả Frontend (`npm run build`) và Backend (`dotnet build`).
