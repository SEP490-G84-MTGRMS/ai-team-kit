# Spec: inventory-list

> Spec gốc (Living Source of Truth) của capability `inventory-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-INVE-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp** (`/store-owner/inventory`): Tổng hợp tồn kho thời gian thực từ `GET /api/inventory` và chi tiết các lô của từng sản phẩm qua `GET /api/inventory/{productId}/batches` lọc theo chi nhánh, ngành hàng và trạng thái chạm ngưỡng đặt lại (`ReorderPoint`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-INVE-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/inventory` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-INVE-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `InventoryController`, cập nhật chính xác dữ liệu `StockOnHand` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-INVE-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-INVE-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/inventory` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-INVE-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp** (`/store-owner/inventory`): Tách biệt minh bạch 3 chỉ số tồn kho: Tồn vật lý (`QuantityOnHand`), Tồn đang cách ly/giữ (`QuantityQuarantined` / `Reserved`) và Tồn khả dụng bán lẻ (`AvailableQty`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-INVE-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/inventory` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-INVE-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `InventoryController`, cập nhật chính xác dữ liệu `StockOnHand` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-INVE-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-INVE-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/inventory` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-INVE-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp** (`/store-owner/inventory`): Trong `SupplierVisitModal` (`SupplierDirectVisitsController`), kiểm tra điều kiện NCC đã gán chi nhánh (`eligibility`), hỗ trợ nhập tay hoặc import Excel cả dòng Bán thêm (Restock) lẫn dòng Đổi hàng cận hạn/vỡ (Exchange 1-1).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-INVE-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/inventory` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-INVE-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `InventoryController`, cập nhật chính xác dữ liệu `StockOnHand` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-INVE-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-INVE-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/inventory` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-INVE-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp** (`/store-owner/inventory`): Khi xác nhận phiên Sales NCC ghé (`POST /api/inventory/supplier-visits/confirm`), hệ thống tự động tạo chứng từ nhập lô mới, trừ lô cũ thu hồi theo đúng tỷ lệ quy đổi ĐVT và chỉ ghi công nợ AP cho phần hàng mua thêm.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-INVE-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/inventory` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-INVE-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `InventoryController`, cập nhật chính xác dữ liệu `StockOnHand` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-INVE-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-INVE-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/inventory` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `inventory-list (baseline AS-IS)` · +4 ~0 -0
