# Spec: grn-list

> Spec gốc (Living Source of Truth) của capability `grn-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

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

## Lịch sử
- 2026-11-28 · `grn-list (baseline AS-IS)` · +4 ~0 -0
