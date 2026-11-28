# Proposal: Tích hợp thanh toán SePay và nâng cấp giao diện Nạp tiền ví gian hàng (wallet-topup-sepay-integration)

## Vấn đề
- Hiện tại chức năng nạp tiền vào ví gian hàng (`StoreWalletTopupModal`) trên Frontend hoàn toàn là mock với mã QR tĩnh, mã giao dịch ngẫu nhiên và tự động cộng tiền giả lập qua `setTimeout`.
- Hệ thống backend chưa có API xử lý nạp tiền, bảng `Tenants` trong PostgreSQL chưa lưu trữ số dư ví (`WalletBalance`) và chưa có bảng lịch sử giao dịch ví (`WalletTransactions`).
- Chưa có cổng thanh toán thật (SePay Webhook) để tự động nhận diện giao dịch chuyển khoản ngân hàng qua VietQR / Napas247, khiến chủ cửa hàng không thể nạp tiền thật vào tài khoản để thanh toán mua gói cước SaaS hoặc mua thêm chi nhánh/kho phụ.
- Giao diện modal nạp ví cũ chưa đồng bộ với phong cách Deep Teal (`#0F766E`) và phông chữ chuẩn `Be Vietnam Pro` (`var(--font-sans)`).

## Mục tiêu
1. **Giao diện Nạp ví chuẩn hóa (Frontend)**:
   - Nâng cấp modal Nạp tiền ví (`StoreWalletTopupModal`) theo ngôn ngữ thiết kế Deep Teal (#0F766E) và font `Be Vietnam Pro`.
   - Sinh mã VietQR động theo mệnh giá nạp (500k, 1M, 2M, 5M hoặc nhập tùy chọn) kèm số tài khoản và nội dung chuyển khoản chuẩn.
   - Tích hợp cơ chế tự động kiểm tra giao dịch (Polling trạng thái đơn nạp), tự động chuyển màn hình thành công khi ngân hàng báo có.
2. **Backend API Nạp tiền & Quản lý số dư ví**:
   - Thêm cột `WalletBalance` vào thực thể và bảng `Tenants`, tạo bảng `WalletTransactions` để ghi nhận sao kê biến động số dư.
   - Triển khai API tạo yêu cầu nạp ví `POST /api/v1/tenant/wallet/topup-order` (sinh mã định danh nạp tiền duy nhất dạng `WAL <TENANT_CODE> <ID>`).
   - Triển khai API kiểm tra trạng thái đơn nạp tiền `GET /api/v1/tenant/wallet/topup-status/{orderCode}`.
   - Triển khai API lấy số dư ví & danh sách sao kê `GET /api/v1/tenant/wallet/balance`.
3. **Cấu hình & Tích hợp SePay Webhook**:
   - Cấu hình thông tin tài khoản ngân hàng thụ hưởng và SePay ApiKey trong `appsettings.json`.
   - Triển khai endpoint nhận Webhook `POST /api/v1/payments/sepay/webhook` có kiểm tra bảo mật (API Key / Webhook Secret).
   - Khi SePay gửi thông báo giao dịch chuyển khoản đến, hệ thống đối soát nội dung chuyển khoản, kiểm tra trùng lặp (Idempotency), tự động cộng số dư ví gian hàng (`WalletBalance`) và cập nhật trạng thái đơn thành công.

## Phạm vi
- **In scope**:
  - Giao diện modal nạp ví: chọn mệnh giá, nhập số tiền tùy chọn, sinh mã VietQR động thật qua API VietQR/SePay, copy nội dung chuyển khoản 1-chạm, polling kiểm tra giao dịch hoàn tất.
  - Cập nhật số dư ví real-time trên thanh trạng thái `StoreTopStatusBar` và tab `WalletLedgerTab`.
  - Database PostgreSQL: Quản lý số dư `WalletBalance` của Tenant và bảng lưu lịch sử `WalletTransactions`.
  - Backend API: Tạo đơn nạp tiền, truy vấn số dư, lịch sử giao dịch, xử lý SePay Webhook an toàn (idempotency, đối soát số tiền, xác thực webhook token).
  - Cấu hình SePay: appsettings.json (Ngân hàng thụ hưởng, STK, Tên tài khoản, Webhook API Key).
- **Out of scope**:
  - Tích hợp cổng thanh toán thẻ quốc tế Visa/Mastercard (chỉ tập trung VietQR Napas247 qua SePay).
  - Rút tiền từ ví về tài khoản ngân hàng cá nhân của chủ tiệm (Payout).

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner / Tenant)**: Nạp tiền vào ví gian hàng để gia hạn dịch vụ, mua thêm chi nhánh hoặc kho.
- **Hệ thống SePay Webhook Bot**: Bắn sự kiện chuyển khoản tự động vào backend MT-GRMS.
- **Hệ thống Quản trị Super Admin**: Xem tổng hợp biến động số dư ví của toàn bộ các tenant trên hệ thống.

## Tiêu chí thành công
- [ ] Giao diện Modal nạp ví hiển thị đồng bộ phông `Be Vietnam Pro`, tông màu Deep Teal `#0F766E`, sinh mã VietQR thật với đúng số tiền và nội dung chuyển khoản.
- [ ] API `POST /api/v1/tenant/wallet/topup-order` tạo đơn nạp tiền và trả về thông tin mã QR, STK, ngân hàng và cú pháp chuyển khoản chuẩn.
- [ ] API `POST /api/v1/payments/sepay/webhook` tiếp nhận payload SePay, xác thực API Key, đối soát nội dung chuyển khoản và tự động cộng tiền vào `WalletBalance` của Tenant trong CSDL.
- [ ] Đảm bảo tính Idempotent: Giao dịch SePay trùng lặp (duplicate webhook) không bị cộng tiền 2 lần.
- [ ] Frontend tự động nhận biết thanh toán thành công (qua polling API trạng thái) và chuyển sang màn hình thông báo thành công mà không cần người dùng thao tác lại.
- [ ] Dự án Backend và Frontend build pass 100% (`dotnet test`, `npm run build`).
