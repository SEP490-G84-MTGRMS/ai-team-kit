# Spec: cashbook

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-WAL-06 Chuyển dữ liệu yêu cầu nạp tiền hiện có
Migration MUST hợp nhất dữ liệu `WalletTopupOrders` vào `WalletTransactions`, bảo toàn tenant, mã đơn, dữ liệu VietQR, số tiền yêu cầu, thời hạn và trạng thái tương ứng. Đơn `COMPLETED` MUST được đối chiếu với giao dịch `TOPUP` đã ghi sổ theo tenant và mã tham chiếu hoặc bằng chứng đối soát xác định được, sau đó bổ sung dữ liệu đơn vào giao dịch tương ứng. Các yêu cầu chưa ghi sổ MUST được chuyển với trạng thái gốc. Migration MUST giữ nguyên số dư ví và giá trị các giao dịch đã ghi sổ. Nếu có đơn đã hoàn tất thiếu giao dịch tương ứng hoặc khớp nhiều giao dịch, migration MUST dừng để đối soát trước khi bỏ bảng cũ.

#### Scenario: Chuyển đơn đang chờ và đơn đã hoàn tất
- **GIVEN** Một đơn đang chờ và một đơn hoàn tất đã có giao dịch ghi sổ
- **WHEN** Migration thành công
- **THEN** Cả hai mã đơn cũ vẫn tra cứu được với trạng thái tương ứng và giao dịch đã ghi sổ chỉ tồn tại một lần
- **AND** Số dư ví, tổng tiền đã ghi nhận và dữ liệu giao dịch lịch sử được bảo toàn

#### Scenario: Dữ liệu hoàn tất thiếu hoặc khớp nhiều giao dịch
- **GIVEN** Một đơn hoàn tất không có giao dịch tương ứng duy nhất
- **WHEN** Migration thực hiện đối chiếu
- **THEN** Migration dừng và chỉ ra dữ liệu cần đối soát, giữ lại bảng cũ

#### Tiêu chí nghiệm thu cấu hình dữ liệu
- [ ] `WalletTransactions` lưu cả yêu cầu nạp và giao dịch ví, với khóa ngoại tenant và chỉ mục phục vụ tra cứu mã đơn và chống ghi nhận trùng.
- [ ] Đối chiếu tình trạng tra cứu mã đơn cũ, số dư, tổng sổ cái và giao dịch đã ghi sổ trước khi bỏ `WalletTopupOrders`.
- [ ] Kiểm thử webhook gửi lặp, xử lý đồng thời và khoản chuyển khác dùng lại mã đơn đã hoàn tất.

### Requirement: REQ-WAL-01 Tạo đơn nạp tiền vào ví gian hàng (Top-up Order Creation)
Hệ thống MUST cho phép chủ cửa hàng hoặc người quản lý tạo yêu cầu nạp tiền vào ví gian hàng với số tiền từ 50.000 VNĐ trở lên. Hệ thống SHALL sinh mã đơn nạp duy nhất, xác định nội dung chuyển khoản theo chuẩn `WAL <MÃ_ĐƠN>` và trả về thông tin tài khoản ngân hàng thụ hưởng kèm đường dẫn VietQR động. Yêu cầu nạp MUST dùng một bản ghi `WalletTransactions` loại `TOPUP` với mã đơn duy nhất, số tiền yêu cầu, nội dung chuyển khoản, dữ liệu VietQR và thời hạn nạp. API `GET /api/v1/tenant/wallet/topup-status/{orderCode}` MUST tra cứu theo mã đơn và tenant hiện tại, giữ hợp đồng phản hồi hiện hành và trả `COMPLETED` khi bản ghi tương ứng có trạng thái `SUCCESS`.

#### Scenario: Tạo đơn nạp thành công với số tiền hợp lệ
- **GIVEN** Người dùng đăng nhập với quyền `STORE_OWNER` của gian hàng `MD-RETAIL-01`
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order` với số tiền `1.000.000` VNĐ
- **THEN** Hệ thống tạo bản ghi `WalletTransactions` với `Type = "TOPUP"` và `Status = "PENDING"`, số dư ví chưa thay đổi
- **AND** Trả về HTTP 200 kèm `orderCode` (ví dụ `WAL8392`), `transferContent` (`WAL 8392`), `qrUrl` và thông tin tài khoản ngân hàng thụ hưởng `MBBank`

#### Scenario: Tạo đơn nạp thất bại do số tiền nhỏ hơn hạn mức tối thiểu
- **GIVEN** Người dùng gửi yêu cầu nạp tiền với số tiền `30.000` VNĐ
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order`
- **THEN** Hệ thống từ chối và trả về HTTP 400 ProblemDetails với lỗi `INVALID_AMOUNT` ("Số tiền nạp tối thiểu là 50.000 đ")

#### Scenario: Tạo đơn nạp thất bại do chưa xác thực (Unauthorized)
- **GIVEN** Người dùng chưa gửi JWT token hoặc token hết hạn
- **WHEN** Gửi yêu cầu `POST /api/v1/tenant/wallet/topup-order`
- **THEN** Hệ thống trả về HTTP 401 Unauthorized

### Requirement: REQ-WAL-03 Tiếp nhận và Xử lý Webhook từ SePay (SePay Webhook Processing)
Hệ thống Backend MUST cung cấp endpoint `POST /api/v1/webhooks/sepay` để đón nhận thông báo giao dịch chuyển khoản tự động từ cổng thanh toán SePay. Hệ thống MUST xác thực khóa bí mật `SePay:ApiKey`. Backend MUST đảm bảo mỗi khoản chuyển chỉ được cộng số dư một lần, kể cả khi webhook gửi lặp hoặc được xử lý đồng thời. Việc nhận diện giao dịch trùng MUST dùng mã tham chiếu ngân hàng hoặc mã giao dịch SePay nếu thiếu mã tham chiếu. Quyết định ghi nhận, thay đổi số dư và cập nhật sổ cái MUST được bảo vệ trong cùng một database transaction. Với khoản nạp khớp mã đơn, Backend MUST cập nhật chính bản ghi `TOPUP` đang chờ, ghi số tiền thực nhận, mã tham chiếu, thời điểm hoàn tất và số dư trước/sau.

#### Scenario: Xử lý Webhook SePay thành công, cộng số dư ví gian hàng
- **GIVEN** SePay gửi HTTP POST tới `/api/v1/webhooks/sepay` với header `Authorization: Apikey {SECRET}`
- **AND** Payload chứa `transferType: "in"`, `transferAmount: 1000000`, `referenceCode: "FT24010199"`, `content: "WAL 8392 chuyen tien"`
- **WHEN** Backend nhận và xử lý webhook
- **THEN** Backend tìm thấy đơn nạp `WAL 8392` thuộc tenant `MD-RETAIL-01`
- **AND** Tăng `Tenants.WalletBalance` thêm `1.000.000` VNĐ
- **AND** Cập nhật bản ghi `TOPUP` của đơn sang `SUCCESS` với `ReferenceCode = "FT24010199"` và ghi nhận biến động số dư trên chính bản ghi đó
- **AND** Phản hồi HTTP 200 `{ "success": true }` cho SePay

#### Scenario: Bỏ qua an toàn khi Webhook SePay gửi lại cùng một giao dịch (Idempotency)
- **GIVEN** Giao dịch với `referenceCode: "FT24010199"` đã được xử lý và ghi vào `WalletTransactions` trước đó
- **WHEN** SePay gửi lại cùng khoản chuyển hoặc nhiều yêu cầu cùng nhận một khoản chuyển đồng thời
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
- **AND** Ghi giao dịch `TOPUP` thành công cho tenant đúng một lần và ghi chú nguồn đối chiếu trong sổ cái

#### Scenario: Khoản chuyển khác dùng lại mã đơn đã hoàn tất
- **GIVEN** Một mã đơn đã được xác nhận và một webhook đến với mã tham chiếu ngân hàng khác nhưng cùng mã đơn
- **WHEN** Backend xử lý khoản chuyển mới
- **THEN** Khoản chuyển được đưa vào đối soát, giao dịch hoàn tất trước đó và số dư ví giữ nguyên cho đến khi có kết quả đối soát

### Requirement: REQ-WAL-05 Sổ cái lịch sử biến động số dư ví (Wallet Ledger & Balance API)
Hệ thống MUST cung cấp API tra cứu thông tin ví gian hàng:
- `GET /api/v1/tenant/wallet/balance`: Trả về số dư khả dụng, tổng tiền đã nạp và tổng tiền đã chi tiêu.
- `GET /api/v1/tenant/wallet/transactions`: Trả về danh sách lịch sử biến động số dư có phân trang, hỗ trợ lọc theo loại giao dịch (`TOPUP`, `PURCHASE_PLAN`, `PURCHASE_ADDON`, `REFUND`).
Lịch sử biến động và các tổng tiền đã nạp, đã chi MUST chỉ tính các giao dịch có trạng thái `SUCCESS`. Yêu cầu nạp đang chờ vẫn có thể tra cứu qua API trạng thái theo mã đơn. Mọi truy vấn MUST chỉ trả về dữ liệu thuộc về gian hàng đang đăng nhập (`TenantId`).

#### Scenario: Lấy thông tin số dư ví thành công
- **GIVEN** Gian hàng đăng nhập hợp lệ
- **WHEN** Gọi `GET /api/v1/tenant/wallet/balance`
- **THEN** Trả về HTTP 200 chứa `walletBalance`, `totalTopup`, `totalSpent` chính xác từ dữ liệu sổ cái

#### Scenario: Yêu cầu nạp chưa thành công chưa được ghi nhận vào sổ cái
- **GIVEN** Tenant có yêu cầu nạp ở trạng thái `PENDING`, `EXPIRED` hoặc `CANCELLED`
- **WHEN** Tenant truy vấn tổng tiền đã nạp và lịch sử biến động số dư
- **THEN** Các yêu cầu này không được cộng vào tổng tiền đã nạp và không xuất hiện trong lịch sử biến động

## Lịch sử
- 2026-11-15 · `sep-refactor:Hợp-nhất-WalletTopupOrders-vào-WalletTra` · +1 ~3 -0
