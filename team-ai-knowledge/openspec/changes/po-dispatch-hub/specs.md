# Specs: Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp (`po-dispatch-hub`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/purchase-orders` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/purchase-orders/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/purchase-orders/matrix` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/purchase-orders/matrix/suggestions` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/purchase-orders/dispatch-hub` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/purchase-orders/dispatch-hub/suppliers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/purchase-orders/dispatch-hub/suppliers/{supplierId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/purchase-orders/matrix/draft` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/purchase-orders/matrix/excel/preview` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/purchase-orders/matrix/excel/import` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-PO-DISP-HUB-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp** (`/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub`): Tổng hợp trạng thái chờ chốt/cần cập nhật theo từng NCC từ `GET /api/purchase-orders/dispatch-hub` và chi tiết từng dòng thay đổi tại `GET .../dispatch-hub/suppliers/{supplierId}`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-DISP-HUB-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders/dispatch-hub` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-DISP-HUB-01.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-DISP-HUB-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-DISP-HUB-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/dispatch-hub` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-DISP-HUB-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp** (`/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub`): Khi xác nhận chốt đơn trên `DispatchConfirmModal`, hệ thống tạo mới các PO chưa có, cập nhật (Amend) các PO thay đổi số lượng trước giờ Cut-off và sinh gói chứng từ `SupplierDispatchPackage`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-DISP-HUB-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders/dispatch-hub` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-DISP-HUB-02.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-DISP-HUB-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-DISP-HUB-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/dispatch-hub` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-DISP-HUB-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp** (`/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub`): Hỗ trợ tải xuống file chứng từ tổng hợp (`GET .../dispatch-packages/{packageId}/download`), thử tạo lại file (`POST .../retry-generation`) hoặc gửi lại email cho NCC (`POST .../retry-email`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-DISP-HUB-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders/dispatch-hub` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-DISP-HUB-03.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-DISP-HUB-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-DISP-HUB-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/dispatch-hub` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-DISP-HUB-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp** (`/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub`): Chặn tuyệt đối việc chốt sửa (Amend) hoặc gửi lại đơn của ngày giao đã vượt quá giờ Cut-off quy định của nhà cung cấp.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-DISP-HUB-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders/dispatch-hub` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-DISP-HUB-04.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-DISP-HUB-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-DISP-HUB-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/dispatch-hub` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-PO-DISP-HUB-01`: Tổng hợp trạng thái chờ chốt/cần cập nhật theo từng NCC từ `GET /api/purchase-orders/dispatch-hub` và chi tiết...
- [x] `REQ-PO-DISP-HUB-02`: Khi xác nhận chốt đơn trên `DispatchConfirmModal`, hệ thống tạo mới các PO chưa có, cập nhật (Amend) các PO th...
- [x] `REQ-PO-DISP-HUB-03`: Hỗ trợ tải xuống file chứng từ tổng hợp (`GET .../dispatch-packages/{packageId}/download`), thử tạo lại file (...
- [x] `REQ-PO-DISP-HUB-04`: Chặn tuyệt đối việc chốt sửa (Amend) hoặc gửi lại đơn của ngày giao đã vượt quá giờ Cut-off quy định của nhà c...
