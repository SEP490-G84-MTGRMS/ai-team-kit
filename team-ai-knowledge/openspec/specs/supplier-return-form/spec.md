# Spec: supplier-return-form

> Spec gốc (Living Source of Truth) của capability `supplier-return-form`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-SUPP-RETU-FORM-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp** (`/store-owner/supplier-returns/create`): Chỉ nạp danh sách các phiếu nhập kho ở trạng thái `COMPLETED` qua `GET /api/supplier-returns/eligible-grns` và chi tiết số lượng còn có thể trả qua `GET /api/supplier-returns/grn-lines/{grnId}`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-FORM-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-FORM-01.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-FORM-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-FORM-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-FORM-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp** (`/store-owner/supplier-returns/create`): Chặn tạo phiếu nếu số lượng yêu cầu trả vượt quá `availableReturnQty` của dòng lô hoặc không có dòng sản phẩm nào có số lượng `> 0`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-FORM-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-FORM-02.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-FORM-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-FORM-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-FORM-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp** (`/store-owner/supplier-returns/create`): Đối chiếu tự động với `SupplierReturnPolicy` của NCC (cho phép trả hay không, lý do trả hợp lệ, số ngày cận hạn tối thiểu, số ngày tối đa sau nhập kho và ảnh bằng chứng).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-FORM-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-FORM-03.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-FORM-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-FORM-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-FORM-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp** (`/store-owner/supplier-returns/create`): Khi lưu phiếu (`POST /api/supplier-returns`), hệ thống khoanh giữ số lượng hàng trả tương ứng để tránh xuất bán nhầm tại quầy POS trong thời gian chờ xử lý.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-FORM-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-FORM-04.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-FORM-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-FORM-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `supplier-return-form (baseline AS-IS)` · +4 ~0 -0
