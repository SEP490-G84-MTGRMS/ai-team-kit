# Spec: store-wallet-sepay

> Spec gốc (Living Source of Truth) của capability `store-wallet-sepay`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-STOR-WALL-SEPA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR** (`/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`): Khởi tạo lệnh nạp tiền kèm mã nội dung chuyển khoản định danh duy nhất qua `POST /api/tenant/wallet/topup-order` và hiển thị mã QR động trên `StoreWalletTopupModal`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-WALL-SEPA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=wallet` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-WALL-SEPA-01.
- **THEN** Hệ thống xử lý thành công qua `WalletController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-WALL-SEPA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-WALL-SEPA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=wallet` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-WALL-SEPA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR** (`/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`): Xử lý callback giao dịch ngân hàng tại `POST /api/webhooks/sepay`: xác thực chữ ký/API key, chống xử lý trùng lặp (Idempotency) và cộng `Tenant.WalletBalance` nguyên tử.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-WALL-SEPA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=wallet` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-WALL-SEPA-02.
- **THEN** Hệ thống xử lý thành công qua `WalletController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-WALL-SEPA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-WALL-SEPA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=wallet` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-WALL-SEPA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR** (`/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`): Frontend tự động kiểm tra trạng thái khớp lệnh qua `GET /api/tenant/wallet/topup-status/{orderCode}` để đóng modal và cập nhật số dư ngay khi tiền về.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-WALL-SEPA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=wallet` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-WALL-SEPA-03.
- **THEN** Hệ thống xử lý thành công qua `WalletController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-WALL-SEPA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-WALL-SEPA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=wallet` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-WALL-SEPA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR** (`/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`): Hiển thị minh bạch toàn bộ lịch sử nạp ví và trừ phí thuê bao tại `WalletLedgerTab` (`GET /api/tenant/wallet/transactions`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-WALL-SEPA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/settings?tab=wallet` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-WALL-SEPA-04.
- **THEN** Hệ thống xử lý thành công qua `WalletController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-WALL-SEPA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-WALL-SEPA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/settings?tab=wallet` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `store-wallet-sepay (baseline AS-IS)` · +4 ~0 -0
