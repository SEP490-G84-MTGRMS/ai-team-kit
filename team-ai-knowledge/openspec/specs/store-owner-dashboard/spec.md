# Spec: store-owner-dashboard

> Spec gốc (Living Source of Truth) của capability `store-owner-dashboard`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-STOR-OWNE-DASH-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard)** (`/store-owner`, `/store-owner/dashboard`): Nạp dữ liệu tổng hợp từ `GET /api/store-owner/dashboard` lọc theo chi nhánh đang chọn (hoặc toàn bộ chi nhánh của Tenant) và kỳ báo cáo.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-OWNE-DASH-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-OWNE-DASH-01.
- **THEN** Hệ thống xử lý thành công qua `StoreOwnerDashboardController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-OWNE-DASH-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-OWNE-DASH-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-OWNE-DASH-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard)** (`/store-owner`, `/store-owner/dashboard`): Hiển thị chính xác doanh thu thuần, tỷ lệ tăng trưởng `%` so với kỳ trước, biểu đồ doanh thu theo khung giờ / theo ngày và lối tắt vào màn hình bán hàng POS.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-OWNE-DASH-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-OWNE-DASH-02.
- **THEN** Hệ thống xử lý thành công qua `StoreOwnerDashboardController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-OWNE-DASH-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-OWNE-DASH-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-OWNE-DASH-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard)** (`/store-owner`, `/store-owner/dashboard`): Hiển thị danh sách cảnh báo vận hành thực tế gồm mặt hàng chạm ngưỡng đặt lại (Reorder Point) và lô hàng sắp hết hạn FEFO.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-OWNE-DASH-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-OWNE-DASH-03.
- **THEN** Hệ thống xử lý thành công qua `StoreOwnerDashboardController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-OWNE-DASH-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-OWNE-DASH-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-OWNE-DASH-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard)** (`/store-owner`, `/store-owner/dashboard`): Đảm bảo cô lập dữ liệu tuyệt đối theo `TenantId` và chỉ cho phép vai trò `STORE_OWNER` truy cập.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-OWNE-DASH-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-OWNE-DASH-04.
- **THEN** Hệ thống xử lý thành công qua `StoreOwnerDashboardController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-OWNE-DASH-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-OWNE-DASH-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `store-owner-dashboard (baseline AS-IS)` · +4 ~0 -0
