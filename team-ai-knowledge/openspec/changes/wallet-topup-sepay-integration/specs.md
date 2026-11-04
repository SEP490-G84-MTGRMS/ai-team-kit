# Đặc tả Chức năng (Delta Specification): Cổng thanh toán SePay & Ví gian hàng MT-GRMS

## Capability: Wallet & SePay Payment Integration

Dependencies: `exploration.md`, `design-brief.md`

---

## ADDED Requirements

### Requirement: REQ-WAL-01 Tạo đơn nạp tiền vào ví gian hàng (Top-up Order Creation)
Hệ thống MUST cho phép chủ cửa hàng hoặc người quản lý tạo yêu cầu nạp tiền vào ví gian hàng với số tiền từ 50.000 VNĐ trở lên. Hệ thống SHALL sinh mã đơn nạp duy nhất, xác định nội dung chuyển khoản theo chuẩn `WAL <MÃ_ĐƠN>` và trả về thông tin tài khoản ngân hàng thụ hưởng kèm đường dẫn VietQR động.

#### Scenario: Tạo đơn nạp thành công với số tiền hợp lệ
- **GIVEN** Người dùng đăng nhập với quyền `STORE_OWNER` của gian hàng `MD-RETAIL-01`
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order` với số tiền `1.000.000` VNĐ
- **THEN** Hệ thống tạo bản ghi `WalletTopupOrders` với trạng thái `PENDING`
- **AND** Trả về HTTP 200 kèm `orderCode` (ví dụ `WAL8392`), `transferContent` (`WAL 8392`), `qrUrl` và thông tin tài khoản ngân hàng thụ hưởng `MBBank`

#### Scenario: Tạo đơn nạp thất bại do số tiền nhỏ hơn hạn mức tối thiểu
- **GIVEN** Người dùng gửi yêu cầu nạp tiền với số tiền `30.000` VNĐ
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order`
- **THEN** Hệ thống từ chối và trả về HTTP 400 ProblemDetails với lỗi `INVALID_AMOUNT` ("Số tiền nạp tối thiểu là 50.000 đ")

#### Scenario: Tạo đơn nạp thất bại do chưa xác thực (Unauthorized)
- **GIVEN** Người dùng chưa gửi JWT token hoặc token hết hạn
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order`
- **THEN** Hệ thống trả về HTTP 401 Unauthorized

---

### Requirement: REQ-WAL-02 Hiển thị VietQR động và Polling trạng thái trên Frontend
Giao diện `StoreWalletTopupModal` MUST hiển thị ảnh VietQR thật dựa trên `qrUrl` do backend cung cấp, hiển thị rõ số tài khoản, tên chủ tài khoản, ngân hàng và nội dung chuyển khoản kèm nút sao chép 1 chạm. Frontend SHALL định kỳ 3 giây/lần gọi API kiểm tra trạng thái đơn nạp. Khi nhận được trạng thái `COMPLETED`, giao diện MUST lập tức hiển thị màn hình chúc mừng thành công và cập nhật số dư mới trên ứng dụng mà không cần người dùng tải lại trang.

#### Scenario: Hiển thị thông tin VietQR và sao chép nội dung thành công
- **GIVEN** Người dùng đang mở modal nạp tiền ví gian hàng
- **WHEN** Người dùng bấm nút sao chép nội dung chuyển khoản
- **THEN** Nội dung `WAL <MÃ_ĐƠN>` được chép vào Clipboard và hiển thị biểu tượng xác nhận màu xanh lá trong 2 giây

#### Scenario: Tự động phát hiện thanh toán thành công qua Polling
- **GIVEN** Người dùng đã quét mã VietQR và hoàn tất chuyển khoản từ app ngân hàng
- **WHEN** Lệnh Polling `GET /api/v1/tenant/wallet/topup-status/{orderCode}` nhận phản hồi `status: "COMPLETED"`
- **THEN** Modal chuyển sang giao diện thông báo "Nạp tiền Thành công!"
- **AND** Hiển thị số tiền vừa cộng và số dư mới
- **AND** Tự động đóng modal và cập nhật số dư hiển thị trên thanh header & tab ví

#### Scenario: Người dùng bấm "Xác nhận đã chuyển khoản" khi giao dịch chưa hoàn tất
- **GIVEN** Người dùng bấm nút "Xác nhận đã chuyển khoản" trong khi SePay chưa nhận được tiền
- **WHEN** Frontend kích hoạt kiểm tra ngay tức thì
- **THEN** Giao diện hiển thị trạng thái đang kiểm tra và thông báo người dùng vui lòng chờ vài giây để hệ thống ngân hàng xử lý

---

### Requirement: REQ-WAL-03 Tiếp nhận và Xử lý Webhook từ SePay (SePay Webhook Processing)
Hệ thống Backend MUST cung cấp endpoint `POST /api/v1/webhooks/sepay` để đón nhận thông báo giao dịch chuyển khoản tự động từ cổng thanh toán SePay. Hệ thống MUST xác thực khóa bí mật `SePay:ApiKey`. Hệ thống MUST đảm bảo tính Idempotent tuyệt đối: không bao giờ cộng tiền nhiều lần cho cùng một mã tham chiếu ngân hàng `referenceCode`. Toàn bộ thao tác cộng số dư ví và lưu sổ cái `WalletTransactions` MUST được thực thi trong một Database Transaction duy nhất.

#### Scenario: Xử lý Webhook SePay thành công, cộng số dư ví gian hàng
- **GIVEN** SePay gửi HTTP POST tới `/api/v1/webhooks/sepay` với header `Authorization: Apikey {SECRET}`
- **AND** Payload chứa `transferType: "in"`, `transferAmount: 1000000`, `referenceCode: "FT24010199"`, `content: "WAL 8392 chuyen tien"`
- **WHEN** Backend nhận và xử lý webhook
- **THEN** Backend tìm thấy đơn nạp `WAL 8392` thuộc tenant `MD-RETAIL-01`
- **AND** Tăng `Tenants.WalletBalance` thêm `1.000.000` VNĐ
- **AND** Tạo một bản ghi mới trong `WalletTransactions` với `Type = "TOPUP"`, `Status = "SUCCESS"`, `ReferenceCode = "FT24010199"`
- **AND** Chuyển trạng thái đơn nạp `WalletTopupOrders` sang `COMPLETED`
- **AND** Phản hồi HTTP 200 `{ "success": true }` cho SePay

#### Scenario: Bỏ qua an toàn khi Webhook SePay gửi lại cùng một giao dịch (Idempotency)
- **GIVEN** Giao dịch với `referenceCode: "FT24010199"` đã được xử lý và ghi vào `WalletTransactions` trước đó
- **WHEN** SePay thử gửi lại cùng payload đó do timeout mạng
- **THEN** Backend phát hiện `referenceCode` đã tồn tại
- **AND** Không thực hiện cộng tiền lần 2 vào `Tenants.WalletBalance`
- **AND** Trả về ngay HTTP 200 OK cho SePay

#### Scenario: Từ chối Webhook khi sai khóa API SePay
- **GIVEN** Yêu cầu gửi tới `/api/v1/webhooks/sepay` nhưng header `Authorization` bị thiếu hoặc sai mã khóa
- **WHEN** Backend xác thực yêu cầu
- **THEN** Backend từ chối với HTTP 401 Unauthorized và không đọc payload

#### Scenario: Bỏ qua giao dịch tiền ra (transferType != "in")
- **GIVEN** SePay gửi webhook thông báo tài khoản thụ hưởng bị trừ tiền (`transferType: "out"`)
- **WHEN** Backend tiếp nhận webhook
- **THEN** Backend bỏ qua không thay đổi số dư ví và trả về HTTP 200 OK

#### Scenario: Xử lý nội dung chuyển khoản không khớp mã đơn nhưng khớp mã gian hàng
- **GIVEN** Khách hàng chuyển khoản quên ghi mã đơn nhưng ghi đúng mã gian hàng: `WAL MD-RETAIL-01`
- **WHEN** Backend tiếp nhận webhook
- **THEN** Backend tìm tenant theo `Code = "MD-RETAIL-01"`
- **AND** Vẫn cộng số dư ví thành công cho tenant và ghi chú rõ vào sổ cái giao dịch

---

### Requirement: REQ-WAL-04 Khấu trừ số dư ví khi mua gói dịch vụ SaaS
Khi chủ gian hàng thực hiện mua hoặc gia hạn gói dịch vụ SaaS tại API `POST /api/v1/tenant/subscriptions/purchase` với `PaymentMethod = "WALLET"`, hệ thống MUST kiểm tra số dư ví hiện tại của gian hàng `Tenants.WalletBalance`. Nếu số dư không đủ (`WalletBalance < GrandTotal`), hệ thống MUST từ chối giao dịch với mã lỗi `INSUFFICIENT_WALLET_BALANCE`. Nếu số dư đủ, hệ thống MUST trừ số dư ví tương ứng và tạo một bản ghi `WalletTransactions` với `Type = "PURCHASE_PLAN"`.

#### Scenario: Thanh toán gói dịch vụ thành công bằng số dư ví
- **GIVEN** Gian hàng có số dư ví là `5.000.000` VNĐ
- **WHEN** Người dùng gửi yêu cầu mua gói dịch vụ có tổng tiền `4.356.000` VNĐ với `paymentMethod: "WALLET"`
- **THEN** Số dư ví gian hàng giảm xuống còn `644.000` VNĐ
- **AND** Tạo bản ghi trong `WalletTransactions` với `Amount = 4356000`, `BalanceBefore = 5000000`, `BalanceAfter = 644000`, `Type = "PURCHASE_PLAN"`
- **AND** Gia hạn gói dịch vụ thành công cho gian hàng

#### Scenario: Từ chối thanh toán bằng ví khi số dư không đủ
- **GIVEN** Gian hàng có số dư ví là `1.250.000` VNĐ
- **WHEN** Người dùng gửi yêu cầu mua gói dịch vụ có tổng tiền `6.468.000` VNĐ với `paymentMethod: "WALLET"`
- **THEN** Hệ thống từ chối và trả về HTTP 400 ProblemDetails với mã lỗi `INSUFFICIENT_WALLET_BALANCE`
- **AND** Số dư ví giữ nguyên không thay đổi

---

### Requirement: REQ-WAL-05 Sổ cái lịch sử biến động số dư ví (Wallet Ledger & Balance API)
Hệ thống MUST cung cấp API tra cứu thông tin ví gian hàng:
- `GET /api/v1/tenant/wallet/balance`: Trả về số dư khả dụng, tổng tiền đã nạp và tổng tiền đã chi tiêu.
- `GET /api/v1/tenant/wallet/transactions`: Trả về danh sách lịch sử biến động số dư có phân trang, hỗ trợ lọc theo loại giao dịch (`TOPUP`, `PURCHASE_PLAN`, `PURCHASE_ADDON`, `REFUND`).
Mọi truy vấn MUST chỉ trả về dữ liệu thuộc về gian hàng đang đăng nhập (`TenantId`).

#### Scenario: Lấy thông tin số dư ví thành công
- **GIVEN** Gian hàng đăng nhập hợp lệ
- **WHEN** Gọi `GET /api/v1/tenant/wallet/balance`
- **THEN** Trả về HTTP 200 chứa `walletBalance`, `totalTopup`, `totalSpent` chính xác từ dữ liệu sổ cái

---

## Acceptance Checklist
- [ ] Bảng `Tenants` có cột `WalletBalance numeric(18,2) NOT NULL DEFAULT 0`
- [ ] Bảng `WalletTransactions` và `WalletTopupOrders` được tạo đầy đủ khóa ngoại, chỉ mục index và cấu hình EF Core
- [ ] API `POST /api/v1/tenant/wallet/topup-order` tạo đơn nạp và trả về VietQR động SePay
- [ ] API `GET /api/v1/tenant/wallet/topup-status/{orderCode}` phản ánh đúng trạng thái đơn nạp
- [ ] Endpoint `POST /api/v1/webhooks/sepay` xử lý an toàn, kiểm tra token, Idempotent chống nạp trùng và cộng số dư ví
- [ ] API `POST /api/v1/tenant/subscriptions/purchase` trừ tiền ví thật khi chọn phương thức `WALLET`
- [ ] Modal `StoreWalletTopupModal.tsx` hiển thị giao diện Deep Teal, ảnh VietQR động thật, polling tự động và thông báo thành công tức thì
- [ ] Tab `WalletLedgerTab.tsx` nạp dữ liệu động từ API Backend
