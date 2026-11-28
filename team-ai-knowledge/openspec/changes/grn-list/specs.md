# Specs: Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay (`grn-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/goods-receipts` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/goods-receipts/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/goods-receipts/po-lookup` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/goods-receipts/po-details/{poIdOrCode}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/goods-receipts` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/goods-receipts/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/goods-receipts/{id:guid}/complete` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/goods-receipts/{id:guid}/confirm` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/goods-receipts/{id:guid}/cancel` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-GRN-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay** (`/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts`): Truy vấn danh sách phiếu nhập qua `GET /api/goods-receipts`: Chủ cửa hàng xem được toàn chuỗi hoặc lọc theo chi nhánh; Nhân viên kho chỉ xem được phiếu thuộc đúng chi nhánh được phân công.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay** (`/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts`): Hiển thị rõ mã GRN, mã PO tham chiếu, nhà cung cấp, chi nhánh nhận, tổng giá trị thực nhận, trạng thái chứng từ và thời gian nhập.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay** (`/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts`): Mở `GrnDetailDrawer` xem nhanh danh sách mặt hàng, lô HSD và trạng thái công nợ hoặc bấm in phiếu nhập kho.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay** (`/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts`): Cung cấp nút "Lập phiếu nhập kho" dẫn sang màn hình `GoodsReceiptFormPage` để nhận hàng từ các đơn PO đủ điều kiện.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-GRN-LIST-01`: Truy vấn danh sách phiếu nhập qua `GET /api/goods-receipts`: Chủ cửa hàng xem được toàn chuỗi hoặc lọc theo ch...
- [x] `REQ-GRN-LIST-02`: Hiển thị rõ mã GRN, mã PO tham chiếu, nhà cung cấp, chi nhánh nhận, tổng giá trị thực nhận, trạng thái chứng t...
- [x] `REQ-GRN-LIST-03`: Mở `GrnDetailDrawer` xem nhanh danh sách mặt hàng, lô HSD và trạng thái công nợ hoặc bấm in phiếu nhập kho.
- [x] `REQ-GRN-LIST-04`: Cung cấp nút "Lập phiếu nhập kho" dẫn sang màn hình `GoodsReceiptFormPage` để nhận hàng từ các đơn PO đủ điều ...
