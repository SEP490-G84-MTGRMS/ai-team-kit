# Spec: cashbook-ledger

> Spec gốc (Living Source of Truth) của capability `cashbook-ledger`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-CASH-LEDG-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán** (`/store-owner/cashbook`, `/cashbook`): Hiển thị số dư đầu kỳ, tổng thu, tổng chi, tồn quỹ cuối kỳ và sổ cái chi tiết từ `GET /api/cashbook/summary` và `GET /api/cashbook/entries` theo từng chi nhánh hoặc toàn hệ thống.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CASH-LEDG-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/cashbook` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CASH-LEDG-01.
- **THEN** Hệ thống xử lý thành công qua `CashbookController`, cập nhật chính xác dữ liệu `CashbookEntry` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CASH-LEDG-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CASH-LEDG-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/cashbook` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CASH-LEDG-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán** (`/store-owner/cashbook`, `/cashbook`): Hỗ trợ lập Phiếu thu (`POST .../receipts`), Phiếu chi (`POST .../payments`), Nộp tiền vào két sắt (`owner-safe-deposits`) và Chuyển quỹ nội bộ đối ứng 2 đầu giữa két tiền mặt ↔ ngân hàng (`POST .../transfers`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CASH-LEDG-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/cashbook` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CASH-LEDG-02.
- **THEN** Hệ thống xử lý thành công qua `CashbookController`, cập nhật chính xác dữ liệu `CashbookEntry` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CASH-LEDG-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CASH-LEDG-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/cashbook` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CASH-LEDG-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán** (`/store-owner/cashbook`, `/cashbook`): Nghiêm cấm xóa vật lý bút toán đã ghi sổ: khi gạch bỏ giao dịch (`POST /api/cashbook/entries/{id}/void`), hệ thống bắt buộc tạo bút toán đảo bù trừ tự động và cho phép kiểm tra tính toàn vẹn chuỗi băm qua `GET .../verify-chain`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CASH-LEDG-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/cashbook` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CASH-LEDG-03.
- **THEN** Hệ thống xử lý thành công qua `CashbookController`, cập nhật chính xác dữ liệu `CashbookEntry` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CASH-LEDG-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CASH-LEDG-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/cashbook` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CASH-LEDG-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán** (`/store-owner/cashbook`, `/cashbook`): Hộp thư `TriageInboxModal` (`GET /api/cashbook/triage/pending` & `POST .../resolve`) giúp đối soát và phân loại các giao dịch chuyển khoản chưa rõ nguồn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CASH-LEDG-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/cashbook` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CASH-LEDG-04.
- **THEN** Hệ thống xử lý thành công qua `CashbookController`, cập nhật chính xác dữ liệu `CashbookEntry` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CASH-LEDG-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CASH-LEDG-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/cashbook` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `cashbook-ledger (baseline AS-IS)` · +4 ~0 -0
