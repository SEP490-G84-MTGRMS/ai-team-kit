# Spec: po-order-matrix

> Spec gốc (Living Source of Truth) của capability `po-order-matrix`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-PO-ORDE-MATR-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ** (`/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`): Tải dữ liệu lưới ma trận qua `GET /api/purchase-orders/matrix` và gợi ý số lượng đặt thông minh dựa trên tốc độ bán & định mức tồn qua `POST /api/purchase-orders/matrix/suggestions`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-ORDE-MATR-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/create-matrix` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-ORDE-MATR-01.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-ORDE-MATR-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-ORDE-MATR-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/create-matrix` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-ORDE-MATR-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ** (`/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`): Khóa cứng các ô nhập liệu kèm chú thích rõ lý do nếu rơi vào: ngày đã qua, không phải thứ giao hàng của NCC tại chi nhánh, ngày nghỉ lễ `SupplierBlackoutDate`, hoặc đã qua giờ `CutoffTime`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-ORDE-MATR-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/create-matrix` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-ORDE-MATR-02.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-ORDE-MATR-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-ORDE-MATR-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/create-matrix` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-ORDE-MATR-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ** (`/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`): Hỗ trợ lưu nháp (`POST .../matrix/draft`), nhập dữ liệu từ Excel có xem trước (`POST .../matrix/excel/preview` & `import`), kiểm tra số lượng tối thiểu MOQ và tự động tách thành các đơn PO riêng theo từng cặp (NCC, Chi nhánh, Ngày giao) qua `POST .../matrix/split`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-ORDE-MATR-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/create-matrix` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-ORDE-MATR-03.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-ORDE-MATR-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-ORDE-MATR-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/create-matrix` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PO-ORDE-MATR-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ** (`/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`): Trước giờ Cut-off, cho phép điều chỉnh số lượng trên ma trận để cập nhật (Amend) đơn PO đã tạo; sau giờ Cut-off hệ thống khóa sửa đổi.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PO-ORDE-MATR-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/purchase-orders/create-matrix` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PO-ORDE-MATR-04.
- **THEN** Hệ thống xử lý thành công qua `PurchaseOrdersController`, cập nhật chính xác dữ liệu `PurchaseOrder` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PO-ORDE-MATR-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PO-ORDE-MATR-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/purchase-orders/create-matrix` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `po-order-matrix (baseline AS-IS)` · +4 ~0 -0
