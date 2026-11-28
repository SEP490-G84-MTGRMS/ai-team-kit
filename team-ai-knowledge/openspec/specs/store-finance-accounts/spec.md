# Spec: store-finance-accounts

> Spec gốc (Living Source of Truth) của capability `store-finance-accounts`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-STOR-FINA-ACCO-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng** (`/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`): Quản lý danh sách két tiền mặt và tài khoản ngân hàng qua `GET/POST/PUT /api/finance-accounts`; mỗi chi nhánh chỉ duy trì một két hoạt động cùng loại tại một thời điểm.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-FINA-ACCO-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions?tab=finance-accounts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-FINA-ACCO-01.
- **THEN** Hệ thống xử lý thành công qua `FinanceAccountsController`, cập nhật chính xác dữ liệu `FinanceAccount` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-FINA-ACCO-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-FINA-ACCO-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions?tab=finance-accounts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-FINA-ACCO-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng** (`/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`): Mã hóa khóa bí mật SePay API Key bằng `IDataProtector` khi lưu qua `POST /api/payments/config` và `POST /api/finance-accounts/{id}/sepay/connect`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-FINA-ACCO-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions?tab=finance-accounts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-FINA-ACCO-02.
- **THEN** Hệ thống xử lý thành công qua `FinanceAccountsController`, cập nhật chính xác dữ liệu `FinanceAccount` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-FINA-ACCO-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-FINA-ACCO-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions?tab=finance-accounts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-FINA-ACCO-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng** (`/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`): Hỗ trợ kiểm tra kết nối tài khoản ngân hàng SePay (`GET /api/payments/sepay-bank-accounts`) và tra cứu lịch sử biến động giao dịch SePay ngay trên màn hình.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-FINA-ACCO-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions?tab=finance-accounts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-FINA-ACCO-03.
- **THEN** Hệ thống xử lý thành công qua `FinanceAccountsController`, cập nhật chính xác dữ liệu `FinanceAccount` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-FINA-ACCO-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-FINA-ACCO-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions?tab=finance-accounts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-FINA-ACCO-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng** (`/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`): Khi đổi tài khoản nhận tiền VietQR mặc định, mã QR đơn hàng mới tại POS cập nhật tức thời nhưng vẫn giữ nguyên lịch sử chứng từ của các giao dịch cũ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-FINA-ACCO-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions?tab=finance-accounts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-FINA-ACCO-04.
- **THEN** Hệ thống xử lý thành công qua `FinanceAccountsController`, cập nhật chính xác dữ liệu `FinanceAccount` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-FINA-ACCO-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-FINA-ACCO-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions?tab=finance-accounts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `store-finance-accounts (baseline AS-IS)` · +4 ~0 -0
