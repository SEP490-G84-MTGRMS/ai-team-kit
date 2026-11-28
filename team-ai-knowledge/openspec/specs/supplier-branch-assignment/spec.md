# Spec: supplier-branch-assignment

> Spec gốc (Living Source of Truth) của capability `supplier-branch-assignment`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-SUPP-BRAN-ASSI-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng** (`/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches`): Hiển thị toàn bộ bản ghi phân bổ NCC ↔ Chi nhánh từ `GET /api/suppliers/branch-assignments` lọc theo chi nhánh, nhà cung cấp và trạng thái.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-BRAN-ASSI-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-BRAN-ASSI-01.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierBranchAssignment` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-BRAN-ASSI-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-BRAN-ASSI-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-BRAN-ASSI-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng** (`/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches`): Hỗ trợ gán một NCC cho nhiều chi nhánh (`POST /api/suppliers/branch-assignments`) hoặc gán nhiều NCC cho một chi nhánh (`POST .../batch-to-branch`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-BRAN-ASSI-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-BRAN-ASSI-02.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierBranchAssignment` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-BRAN-ASSI-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-BRAN-ASSI-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-BRAN-ASSI-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng** (`/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches`): Cho phép tùy chỉnh lịch thứ giao hàng trong tuần (`PATCH /api/suppliers/{id}/branches/{branchId}/delivery-days`) và bật/tắt trạng thái phục vụ riêng cho từng chi nhánh.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-BRAN-ASSI-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-BRAN-ASSI-03.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierBranchAssignment` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-BRAN-ASSI-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-BRAN-ASSI-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-BRAN-ASSI-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng** (`/store-owner/suppliers/branches`, `/store-owner/suppliers/:id/branches`, `/suppliers/branches`): Ma trận đặt hàng PO (`OrderMatrixPage`) và luồng Sales NCC ghé trực tiếp bắt buộc đối chiếu bảng phân bổ này để khóa các ô không thuộc lịch phục vụ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-BRAN-ASSI-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/branches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-BRAN-ASSI-04.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierBranchAssignment` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-BRAN-ASSI-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-BRAN-ASSI-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/branches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `supplier-branch-assignment (baseline AS-IS)` · +4 ~0 -0
