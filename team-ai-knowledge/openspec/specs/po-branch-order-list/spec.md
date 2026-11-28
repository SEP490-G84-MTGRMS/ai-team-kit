# Spec: po-branch-order-list

> Spec gốc (Living Source of Truth) của capability `po-branch-order-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-PO-BRAN-ORDE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview)** (`/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches`): Tải danh sách chi nhánh và số liệu tóm tắt đơn đặt mua từ `BranchesController` và `GET /api/purchase-orders`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-BRAN-ORDE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-BRAN-ORDE-01.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-BRAN-ORDE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-BRAN-ORDE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-BRAN-ORDE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview)** (`/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches`): Hỗ trợ lọc nhanh theo tên/mã chi nhánh và trạng thái hoạt động của điểm bán.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-BRAN-ORDE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-BRAN-ORDE-02.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-BRAN-ORDE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-BRAN-ORDE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-BRAN-ORDE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview)** (`/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches`): Cung cấp tác vụ điều hướng trực tiếp vào Ma trận đặt hàng (`/store-owner/purchase-orders/create-matrix?branchId=...`) của đúng chi nhánh được chọn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-BRAN-ORDE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-BRAN-ORDE-03.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-BRAN-ORDE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-BRAN-ORDE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-BRAN-ORDE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview)** (`/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches`): Liên kết đồng bộ sang Danh sách tất cả đơn PO đã lập (`/store-owner/purchase-orders/list`) và Trung tâm điều phối chốt đơn (`dispatch-hub`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-BRAN-ORDE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/purchase-orders` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-BRAN-ORDE-04.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `Branch` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-BRAN-ORDE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-BRAN-ORDE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `po-branch-order-list (baseline AS-IS)` · +4 ~0 -0
