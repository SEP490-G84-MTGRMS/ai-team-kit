# Specs: Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD) (`household-tax-snapshot`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/tax/household/summary` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/books` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/declarations/01-cnkd/preview` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/snapshots/{id:guid}/declaration-xml` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tax/household/snapshots` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/snapshots` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/snapshots/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tax/household/snapshots/{id:guid}/verify-integrity` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tax/household/pin/change` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tax/household/pin/reset` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HOUS-TAX-SNAP-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD)** (`/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`): Tổng hợp doanh thu chịu thuế theo nhóm ngành và hiển thị 7 sổ kế toán hộ kinh doanh từ `GET /api/tax/household/summary` và `GET /api/tax/household/books`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOUS-TAX-SNAP-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/tax-snapshots` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOUS-TAX-SNAP-01.
- **THEN** Hệ thống xử lý thành công qua `HouseholdTaxController`, cập nhật chính xác dữ liệu `HouseholdTaxSnapshot` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOUS-TAX-SNAP-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOUS-TAX-SNAP-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/tax-snapshots` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOUS-TAX-SNAP-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD)** (`/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`): Khi chốt kỳ sổ thuế (`POST /api/tax/household/snapshots`), bắt buộc xác thực mã PIN bảo mật (`SecurityPinModal`), đóng băng dữ liệu vào `HouseholdTaxSnapshot` kèm mã kiểm tra toàn vẹn (`verify-integrity`); nếu phát sinh điều chỉnh sau chốt thì tạo bản chốt bổ sung.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOUS-TAX-SNAP-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/tax-snapshots` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOUS-TAX-SNAP-02.
- **THEN** Hệ thống xử lý thành công qua `HouseholdTaxController`, cập nhật chính xác dữ liệu `HouseholdTaxSnapshot` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOUS-TAX-SNAP-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOUS-TAX-SNAP-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/tax-snapshots` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOUS-TAX-SNAP-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD)** (`/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`): Hỗ trợ xem trước tờ khai `01/CNKD` (`GET .../declarations/01-cnkd/preview`), tải tệp XML chuẩn HTKK/eTax (`GET .../declaration-xml`) và xuất bộ sổ kế toán ra Excel (`GET .../export-excel`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOUS-TAX-SNAP-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/tax-snapshots` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOUS-TAX-SNAP-03.
- **THEN** Hệ thống xử lý thành công qua `HouseholdTaxController`, cập nhật chính xác dữ liệu `HouseholdTaxSnapshot` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOUS-TAX-SNAP-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOUS-TAX-SNAP-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/tax-snapshots` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOUS-TAX-SNAP-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD)** (`/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`): Ghi nhận trạng thái và biên lai xác nhận đã nộp tờ khai/nộp tiền thuế qua `GET/PUT /api/tax/household/snapshots/{snapshotId}/filing-confirmation`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOUS-TAX-SNAP-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/tax-snapshots` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOUS-TAX-SNAP-04.
- **THEN** Hệ thống xử lý thành công qua `HouseholdTaxController`, cập nhật chính xác dữ liệu `HouseholdTaxSnapshot` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOUS-TAX-SNAP-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOUS-TAX-SNAP-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/tax-snapshots` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HOUS-TAX-SNAP-01`: Tổng hợp doanh thu chịu thuế theo nhóm ngành và hiển thị 7 sổ kế toán hộ kinh doanh từ `GET /api/tax/household...
- [x] `REQ-HOUS-TAX-SNAP-02`: Khi chốt kỳ sổ thuế (`POST /api/tax/household/snapshots`), bắt buộc xác thực mã PIN bảo mật (`SecurityPinModal...
- [x] `REQ-HOUS-TAX-SNAP-03`: Hỗ trợ xem trước tờ khai `01/CNKD` (`GET .../declarations/01-cnkd/preview`), tải tệp XML chuẩn HTKK/eTax (`GET...
- [x] `REQ-HOUS-TAX-SNAP-04`: Ghi nhận trạng thái và biên lai xác nhận đã nộp tờ khai/nộp tiền thuế qua `GET/PUT /api/tax/household/snapshot...
