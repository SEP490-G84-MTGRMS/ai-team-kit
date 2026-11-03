# Đặc Tả Yêu Cầu (Delta Specs): Tích Hợp Thanh Toán VietQR Tự Động & Cổng SePay (pos-vietqr-sepay-payment-and-settings)

## ADDED Requirements

### Requirement: REQ-PAY-CONFIG-01 Cấu Hình Tài Khoản Ngân Hàng & SePay API Key Cho Chủ Cửa Hàng
Hệ thống **MUST** cung cấp giao diện cấu hình tài khoản ngân hàng và SePay API Key cho Chủ cửa hàng (`STORE_OWNER`) tại nút Bánh răng cài đặt trên Header POS (`PosHeader.tsx`) và trên thanh điều hướng (`AppTopNav.tsx`). API Key **MUST** được che mặt nạ bảo mật (`sepay_apikey_••••••••`) và được mã hóa lưu trữ bằng thuật toán AES-256 ở tầng Backend. Thu ngân (`EMPLOYEE` / `CASHIER`) **MUST NOT** có quyền truy cập hoặc xem cấu hình này.

#### Scenario: Chủ cửa hàng thiết lập và lưu thông tin tài khoản ngân hàng thành công
- **GIVEN** Người dùng đã đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`) thuộc Tenant `tenant_an_nhien_02`
- **WHEN** Người dùng bấm vào biểu tượng Bánh răng cài đặt và nhập:
  - Ngân hàng: `MB` (MBBank)
  - Số tài khoản: `0918889999`
  - Tên chủ tài khoản: `NGUYEN AN NHIEN`
  - SePay API Key: `sepay_apikey_example_12345`
  - Bật công tắc "Kích hoạt chuyển khoản tự động"
  - Bấm nút "Lưu Cấu Hình"
- **THEN** Hệ thống lưu cấu hình thành công, gửi thông báo thành công "Đã lưu cấu hình tài khoản thanh toán", hiển thị API Key dưới dạng mặt nạ che giấu `sepay_apikey_••••••••`, và cấp đường dẫn Webhook URL của hệ thống kèm nút Sao chép.

#### Scenario: Thu ngân cố gắng truy cập cấu hình thanh toán
- **GIVEN** Người dùng đăng nhập với vai trò Thu ngân (`EMPLOYEE` / `CASHIER`)
- **WHEN** Người dùng quan sát giao diện Header POS hoặc gọi API `GET /api/v1/payments/config`
- **THEN** Biểu tượng Bánh răng cài đặt không hiển thị cấu hình nhạy cảm, và API trả về `403 Forbidden`.

---

### Requirement: REQ-SEPAY-GUIDE-01 Cẩm Nang Hướng Dẫn Đăng Ký SePay Chi Tiết 5 Bước
Hệ thống **MUST** cung cấp một Tab riêng biệt "Hướng Dẫn Đăng Ký SePay" ngay bên trong Modal Cài đặt thanh toán. Hướng dẫn **SHALL** trình bày rõ ràng 5 bước từng bước từ đăng ký tài khoản, liên kết ngân hàng, tạo API Key, sao chép Webhook URL và thực hiện kiểm thử, giải thích rõ quyền hạn Read-only để Chủ tiệm hoàn toàn yên tâm.

#### Scenario: Chủ cửa hàng xem cẩm nang hướng dẫn đăng ký SePay
- **GIVEN** Modal Cài đặt thanh toán đang mở
- **WHEN** Chủ cửa hàng bấm sang Tab "Hướng Dẫn Đăng Ký SePay"
- **THEN** Giao diện hiển thị đầy đủ 5 thẻ bước trực quan:
  1. Đăng ký tài khoản miễn phí tại `my.sepay.vn`
  2. Thêm tài khoản ngân hàng cá nhân
  3. Lấy SePay API Key và dán vào Tab Cấu Hình
  4. Tạo Webhook trên SePay và dán đường dẫn Webhook của cửa hàng
  5. Thử nghiệm thanh toán quét mã QR tại quầy POS
  kèm nút bấm mở link trang chủ SePay và nút sao chép nhanh Webhook URL.

---

### Requirement: REQ-VIETQR-CHECKOUT-01 Sinh Mã VietQR Động Chuẩn Napas 247 Tại Quầy POS
Khi thu ngân hoặc chủ cửa hàng chọn phương thức thanh toán "Chuyển khoản" tại quầy POS, hệ thống **MUST** hiển thị Modal Thanh toán VietQR chứa mã QR động chuẩn Napas 247 với cú pháp nội dung chuyển khoản chứa tiền tố phân lập theo Tenant (`<TENANT_PREFIX>_<ORDER_CODE>`) và số tiền chính xác cần thanh toán (`FinalAmount`).

#### Scenario: Khách hàng thanh toán đơn hàng bằng chuyển khoản quét mã VietQR
- **GIVEN** Quầy POS đang có giỏ hàng với tổng tiền thanh toán là 250.000 VNĐ, mã hóa đơn `HD1005` tại Tenant `tenant_an_nhien_02`
- **WHEN** Thu ngân bấm chọn phương thức "Chuyển khoản"
- **THEN** Modal VietQR xuất hiện hiển thị:
  - Mã QR động chứa link QuickLink chuẩn Napas 247
  - Số tiền: `250.000 đ`
  - Số tài khoản và Tên chủ tài khoản ngân hàng của cửa hàng
  - Nội dung chuyển khoản: `AN02_HD1005`
  - Vòng xoay trạng thái: "Đang chờ khách quét mã thanh toán..."
  - Nút "Kiểm tra thanh toán ngay" và nút "Xác nhận thu tiền thủ công" (dự phòng).

---

### Requirement: REQ-WEBHOOK-SECURITY-01 Xử Lý Webhook SePay Với 6 Lớp Bảo Mật & Đối Soát 2 Chiều
Endpoint `POST /api/v1/payments/sepay-webhook` **MUST** thực hiện xác thực theo mô hình phòng thủ 6 lớp:
1. Lớp 1: Kiểm tra Header `Authorization: Apikey <key>`
2. Lớp 2: Kiểm tra Whitelist IP của SePay
3. Lớp 3 (Then chốt): Gọi ngược lại SePay API `GET /userapi/transactions/details/{id}` bằng chính API Key của Cửa hàng để đối soát xem giao dịch có thực sự tồn tại trong sổ cái ngân hàng hay không.
4. Lớp 4: So khớp số tiền thực nhận `amountIn >= order.FinalAmount` và khớp mã đơn hàng phân lập theo Tenant.
5. Lớp 5: Kiểm tra Idempotency qua `bank_transaction_id` để ngăn chặn tấn công gửi lại (Replay attack).
6. Lớp 6: Gạch nợ đơn hàng và bắn tín hiệu cập nhật thời gian thực về màn hình POS.

#### Scenario: Kẻ gian gửi request webhook ảo bằng Postman
- **GIVEN** Kẻ gian có được Webhook URL và cố tình dùng Postman gửi request giả mạo với ID giao dịch ảo `999999` và số tiền 500.000đ
- **WHEN** Endpoint `POST /api/v1/payments/sepay-webhook` tiếp nhận request
- **THEN** Backend gọi ngược sang SePay API để đối soát ID `999999`, SePay báo giao dịch không tồn tại $\rightarrow$ Backend lập tức từ chối với mã lỗi `400 Bad Request` hoặc `404 Not Found`, ghi log cảnh báo và đơn hàng KHÔNG bị gạch nợ.

#### Scenario: Webhook nhận giao dịch thật từ khách hàng
- **GIVEN** Khách hàng chuyển khoản thật 250.000đ cho đơn `AN02_HD1005`
- **WHEN** SePay bắn webhook về hệ thống
- **THEN** Backend đối soát thành công 2 chiều với SePay, số tiền khớp $\rightarrow$ Cập nhật đơn hàng thành `PAID`, lưu vết giao dịch vào `payment_transactions`, và màn hình POS tự động báo "Thanh toán thành công!".

---

### Requirement: REQ-IDEMPOTENCY-01 Chống Tấn Công Lặp Lại Giao Dịch Ngân Hàng
Hệ thống **MUST** lưu trữ duy nhất mã giao dịch ngân hàng (`bank_transaction_id`) trong bảng `payment_transactions`. Mọi yêu cầu webhook gửi lại cùng một mã giao dịch đã từng xử lý **MUST** bị bỏ qua hoặc từ chối để tránh việc một giao dịch ngân hàng được dùng để thanh toán cho nhiều đơn hàng khác nhau.

#### Scenario: Kẻ gian cố gắng dùng lại mã giao dịch ngân hàng cũ
- **GIVEN** Mã giao dịch ngân hàng `FT263068899011` đã được gạch nợ cho đơn hàng `HD1001` trước đó
- **WHEN** SePay hoặc kẻ gian gửi lại webhook mang mã giao dịch này cho đơn hàng `HD1005`
- **THEN** Hệ thống phát hiện mã giao dịch đã tồn tại trong CSDL, từ chối xử lý và không gạch nợ cho đơn hàng mới.

---

## Acceptance Checklist
- [ ] Chủ cửa hàng có thể mở Modal Cài Đặt Thanh Toán từ nút Bánh răng cài đặt (`PosHeader` & `AppTopNav`).
- [ ] Xem được cẩm nang hướng dẫn đăng ký SePay chi tiết 5 bước.
- [ ] Lưu thành công cấu hình tài khoản ngân hàng và SePay API Key (che mặt nạ an toàn).
- [ ] Tại quầy POS, chọn "Chuyển khoản" sinh ra đúng mã VietQR động chứa số tiền và nội dung đơn hàng.
- [ ] Webhook xử lý an toàn: Chặn đứng 100% request ảo không có tiền thật trong sổ cái ngân hàng.
- [ ] Biên dịch thành công 0 lỗi cả Frontend và Backend.
