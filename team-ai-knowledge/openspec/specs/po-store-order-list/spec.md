# Spec: po-store-order-list

> Spec gốc (Living Source of Truth) của capability `po-store-order-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-PO-STOR-ORDE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi** (`/store-owner/purchase-orders/list`): Truy vấn danh sách PO phân trang qua `GET /api/purchase-orders` lọc theo chi nhánh (`useBranchScope`), nhà cung cấp, nguồn tạo (PO Matrix / NV đề xuất / Đổi hàng RTV), trạng thái và khoảng ngày giao.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-STOR-ORDE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/list` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-STOR-ORDE-01.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-STOR-ORDE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-STOR-ORDE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/list` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-STOR-ORDE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi** (`/store-owner/purchase-orders/list`): Cho phép chuyển trạng thái/đóng PO sớm hoặc hủy đơn khi chưa nhận hàng (`PATCH /api/purchase-orders/{id}/status`) và lưu lịch sử phiên bản `PurchaseOrderRevision`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-STOR-ORDE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/list` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-STOR-ORDE-02.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-STOR-ORDE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-STOR-ORDE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/list` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-STOR-ORDE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi** (`/store-owner/purchase-orders/list`): Tự động kiểm tra điều kiện nhận hàng khi bấm "Nhập kho": nếu PO đã có phiếu GRN nháp thì mở tiếp phiếu nháp đó; nếu chưa có thì điều hướng tạo GRN mới gắn sẵn mã PO.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-STOR-ORDE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/list` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-STOR-ORDE-03.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-STOR-ORDE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-STOR-ORDE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/list` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-STOR-ORDE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi** (`/store-owner/purchase-orders/list`): Chặn chỉnh sửa trên Ma trận đối với các PO sinh tự động từ luồng Đổi hàng Nhà cung cấp (`SourceType = SUPPLIER_RETURN`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-STOR-ORDE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/list` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-STOR-ORDE-04.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-STOR-ORDE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-STOR-ORDE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/list` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `po-store-order-list (baseline AS-IS)` · +4 ~0 -0
