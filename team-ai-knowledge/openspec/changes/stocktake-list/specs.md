# Specs: Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh (`stocktake-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/stocktakes` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/stocktakes/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/stocktakes/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/submit` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/review` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/create-return` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-STOC-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh** (`/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes`): Truy vấn danh sách phiên kiểm kê phân trang qua `GET /api/stocktakes` áp dụng bộ lọc phạm vi chi nhánh tự động (`useBranchScope`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh** (`/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes`): Hiển thị rõ mã phiếu (`KK-...`), chi nhánh, phạm vi kiểm kê (Toàn kho / Theo ngành hàng / Theo lô chọn sẵn), ngày kiểm kê, số dòng mặt hàng và trạng thái phê duyệt.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh** (`/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes`): Cho phép sắp xếp theo mã phiếu, chi nhánh, ngày kiểm kê, số dòng và điều hướng vào màn hình sửa nháp (`StocktakeFormPage`) hoặc màn hình đối chiếu duyệt (`StocktakeDetailPage`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh** (`/store-owner/stocktakes`, `/stocktakes`, `/employee/stocktakes`, `/employees/stocktakes`): Cung cấp liên kết nhanh sang Sổ tồn kho & lô hàng cũng như danh sách phiếu trả NCC sinh ra từ kiểm kê.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-STOC-LIST-01`: Truy vấn danh sách phiên kiểm kê phân trang qua `GET /api/stocktakes` áp dụng bộ lọc phạm vi chi nhánh tự động...
- [x] `REQ-STOC-LIST-02`: Hiển thị rõ mã phiếu (`KK-...`), chi nhánh, phạm vi kiểm kê (Toàn kho / Theo ngành hàng / Theo lô chọn sẵn), n...
- [x] `REQ-STOC-LIST-03`: Cho phép sắp xếp theo mã phiếu, chi nhánh, ngày kiểm kê, số dòng và điều hướng vào màn hình sửa nháp (`Stockta...
- [x] `REQ-STOC-LIST-04`: Cung cấp liên kết nhanh sang Sổ tồn kho & lô hàng cũng như danh sách phiếu trả NCC sinh ra từ kiểm kê.
