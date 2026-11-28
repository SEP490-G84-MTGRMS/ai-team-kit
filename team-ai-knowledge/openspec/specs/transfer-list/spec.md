# Spec: transfer-list

> Spec gốc (Living Source of Truth) của capability `transfer-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-TRAN-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh** (`/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers`): Truy vấn danh sách phiếu điều chuyển từ `GET /api/transfers` lọc theo chi nhánh gửi, chi nhánh nhận, trạng thái và khoảng ngày.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh** (`/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers`): Hỗ trợ quy trình trạng thái chặt chẽ: `Phiếu tạm` → Gửi duyệt (`POST /api/transfers/{id}/submit`) → Xuất kho đi đường (`POST .../dispatch`, trừ tồn kho nguồn và treo tồn đang vận chuyển) → Hủy hoặc Hoàn trả kho nguồn (`cancel` / `return`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh** (`/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers`): Mở `TransferDetailModal` / `TransferDetailPage` hiển thị chi tiết từng lô FEFO được điều chuyển và nhật ký `TransferStatusHistory`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh** (`/store-owner/transfers`, `/store-owner/transfers/:id`, `/transfers`, `/employee/transfers`): Hỗ trợ xuất danh sách phiếu điều chuyển theo bộ lọc hiện tại ra tệp báo cáo.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `transfer-list (baseline AS-IS)` · +4 ~0 -0
