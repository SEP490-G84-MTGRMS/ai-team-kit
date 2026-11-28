# Specs: Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê (`stocktake-detail`)

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
| `GET` | `/api/supplier-returns` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/supplier-returns/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/supplier-returns/eligible-grns` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-STOC-DETA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê** (`/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`): Hiển thị chi tiết chênh lệch từng lô từ `GET /api/stocktakes/{id}` phân tách rõ phần tồn tốt bán được và phần hàng hư hỏng/cận hạn/hết hạn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-DETA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-DETA-01.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-DETA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-DETA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-DETA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê** (`/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`): Nếu phiếu có phát sinh hàng thừa (`CountedQty > SystemQty`), bắt buộc Store Owner xác minh nguồn gốc hàng thừa trước khi cho phép duyệt cộng tồn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-DETA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-DETA-02.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-DETA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-DETA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-DETA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê** (`/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`): Khi Store Owner Từ chối hoặc Yêu cầu kiểm kê lại (`POST /api/stocktakes/{id}/review`), hệ thống bắt buộc nhập lý do phản hồi; khi Duyệt, hệ thống cập nhật `BranchStock` / `StockOnHand` trong một giao dịch nguyên tử.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-DETA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-DETA-03.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-DETA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-DETA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-DETA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê** (`/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`): Đối với các dòng hàng lỗi/cận hạn đủ điều kiện đổi trả theo chính sách NCC, cho phép chọn và gọi `POST /api/stocktakes/{id}/create-return` để sinh ngay phiếu trả hàng nhà cung cấp liên kết.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-DETA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-DETA-04.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-DETA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-DETA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-STOC-DETA-01`: Hiển thị chi tiết chênh lệch từng lô từ `GET /api/stocktakes/{id}` phân tách rõ phần tồn tốt bán được và phần ...
- [x] `REQ-STOC-DETA-02`: Nếu phiếu có phát sinh hàng thừa (`CountedQty > SystemQty`), bắt buộc Store Owner xác minh nguồn gốc hàng thừa...
- [x] `REQ-STOC-DETA-03`: Khi Store Owner Từ chối hoặc Yêu cầu kiểm kê lại (`POST /api/stocktakes/{id}/review`), hệ thống bắt buộc nhập ...
- [x] `REQ-STOC-DETA-04`: Đối với các dòng hàng lỗi/cận hạn đủ điều kiện đổi trả theo chính sách NCC, cho phép chọn và gọi `POST /api/st...
