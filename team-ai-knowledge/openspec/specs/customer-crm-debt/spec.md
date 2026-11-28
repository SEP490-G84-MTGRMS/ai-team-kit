# Spec: customer-crm-debt

> Spec gốc (Living Source of Truth) của capability `customer-crm-debt`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-CUST-CRM-DEBT-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Quản lý danh sách và tổng hợp nợ khách hàng qua `GET/POST/PUT /api/customers` và `GET /api/customers/debts/summary` kèm xuất báo cáo ra tệp CSV/Excel.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-01.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Phân quyền chặt chẽ: chỉ `STORE_OWNER` được phép nâng/sửa hạn mức công nợ tối đa (`DebtLimit`) của khách hàng; thu ngân POS bị chặn bán chịu nếu tổng dư nợ vượt hạn mức này.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-02.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Xem chi tiết lịch sử mua nợ và trả nợ của từng khách trên `CustomerDebtLedgerDrawer` (`GET /api/customers/debt/ledger/{customerId}`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-03.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Khi lập phiếu thu nợ khách hàng (`POST /api/customers/debt/repay` qua `DebtCollectionModal`), hệ thống giảm dư nợ AR của khách và tự động ghi nhận bút toán phiếu thu tương ứng vào Sổ quỹ Tiền mặt/Ngân hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-04.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `customer-crm-debt (baseline AS-IS)` · +4 ~0 -0
