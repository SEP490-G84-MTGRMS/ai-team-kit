# Spec: grn-form

> Spec gốc (Living Source of Truth) của capability `grn-form`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-GRN-FORM-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost** (`/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`): Tra cứu PO đủ điều kiện nhận hàng qua `GET /api/goods-receipts/po-lookup` và nạp chi tiết dòng hàng từ `GET /api/goods-receipts/po-details/{poIdOrCode}`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-FORM-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-FORM-01.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-FORM-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-FORM-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-FORM-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost** (`/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`): Cho phép tách một mặt hàng thành nhiều dòng lô (`BatchCode`, `ManufactureDate`, `ExpiryDate`) miễn là tổng số lượng thực nhận của các dòng không vượt quá số lượng đặt trên PO; bắt buộc xác nhận qua `GrnMismatchConfirmModal` nếu nhận thiếu.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-FORM-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-FORM-02.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-FORM-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-FORM-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-FORM-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost** (`/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`): Khi bấm Hoàn tất (`POST /api/goods-receipts/{id}/complete`), hệ thống quy đổi về ĐVT cơ sở để cộng `BranchStock` / `StockOnHand`, cập nhật trạng thái PO nguồn và hỗ trợ in tem kệ (`GrnPrintPreviewModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-FORM-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-FORM-03.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-FORM-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-FORM-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-GRN-FORM-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost** (`/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`): Tự động ghi tăng công nợ `SupplierAPLedger` nếu hình thức thanh toán là mua chịu (`CREDIT`) trên đơn mua thường; đối với GRN từ PO đổi hàng (`SourceType = SUPPLIER_RETURN`) không ghi trùng nợ toàn bộ giá trị đơn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-GRN-FORM-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/goods-receipts/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-GRN-FORM-04.
- **THEN** Hệ thống xử lý thành công qua `GoodsReceiptsController`, cập nhật chính xác dữ liệu `GoodsReceipt` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-GRN-FORM-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-GRN-FORM-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/goods-receipts/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `grn-form (baseline AS-IS)` · +4 ~0 -0
