# Specs: Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L) (`finance-pnl-overview`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/finance/overview` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/finance/reports/pnl/summary` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/finance/reports/pnl/breakdown/expenses` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/finance/reports/pnl/comparison` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/finance/reports/pnl/trend` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-FINA-PNL-OVER-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L)** (`/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`): Nạp dữ liệu sức khỏe tài chính tổng quan qua `GET /api/finance/overview` và báo cáo P&L chi tiết qua các endpoint `/api/finance/reports/pnl/{summary,breakdown/expenses,comparison,trend}`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-FINA-PNL-OVER-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/finance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-FINA-PNL-OVER-01.
- **THEN** Hệ thống xử lý thành công qua `FinanceOverviewController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-FINA-PNL-OVER-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-FINA-PNL-OVER-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/finance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-FINA-PNL-OVER-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L)** (`/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`): Tính toán chuẩn xác công thức kế toán bán lẻ: Doanh thu thuần = Tổng doanh thu bán hàng - Giảm giá/Khuyến mãi - Hàng bán bị trả lại; Lợi nhuận gộp = Doanh thu thuần - Giá vốn hàng bán (COGS); Lợi nhuận ròng = Lợi nhuận gộp - Chi phí vận hành.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-FINA-PNL-OVER-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/finance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-FINA-PNL-OVER-02.
- **THEN** Hệ thống xử lý thành công qua `FinanceOverviewController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-FINA-PNL-OVER-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-FINA-PNL-OVER-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/finance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-FINA-PNL-OVER-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L)** (`/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`): Hỗ trợ lọc theo từng chi nhánh hoặc toàn chuỗi, chọn kỳ tháng/quý/tùy chỉnh và so sánh tỷ lệ tăng/giảm trực quan.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-FINA-PNL-OVER-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/finance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-FINA-PNL-OVER-03.
- **THEN** Hệ thống xử lý thành công qua `FinanceOverviewController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-FINA-PNL-OVER-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-FINA-PNL-OVER-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/finance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-FINA-PNL-OVER-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L)** (`/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`): Chỉ vai trò `STORE_OWNER` mới được quyền truy cập dữ liệu lợi nhuận và cơ cấu chi phí.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-FINA-PNL-OVER-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/finance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-FINA-PNL-OVER-04.
- **THEN** Hệ thống xử lý thành công qua `FinanceOverviewController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-FINA-PNL-OVER-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-FINA-PNL-OVER-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/finance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-FINA-PNL-OVER-01`: Nạp dữ liệu sức khỏe tài chính tổng quan qua `GET /api/finance/overview` và báo cáo P&L chi tiết qua các endpo...
- [x] `REQ-FINA-PNL-OVER-02`: Tính toán chuẩn xác công thức kế toán bán lẻ: Doanh thu thuần = Tổng doanh thu bán hàng - Giảm giá/Khuyến mãi ...
- [x] `REQ-FINA-PNL-OVER-03`: Hỗ trợ lọc theo từng chi nhánh hoặc toàn chuỗi, chọn kỳ tháng/quý/tùy chỉnh và so sánh tỷ lệ tăng/giảm trực qu...
- [x] `REQ-FINA-PNL-OVER-04`: Chỉ vai trò `STORE_OWNER` mới được quyền truy cập dữ liệu lợi nhuận và cơ cấu chi phí.
