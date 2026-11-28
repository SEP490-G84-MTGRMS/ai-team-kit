# Spec: promotion-list

> Spec gốc (Living Source of Truth) của capability `promotion-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-PROM-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y** (`/store-owner/promotions`, `/promotions`): Quản lý danh sách chương trình khuyến mãi qua `GET/POST/PUT /api/promotions` với thời gian hiệu lực, phạm vi chi nhánh áp dụng và quy tắc cộng dồn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROM-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/promotions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROM-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `PromotionsController`, cập nhật chính xác dữ liệu `Promotion` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROM-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROM-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/promotions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROM-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y** (`/store-owner/promotions`, `/promotions`): Hỗ trợ cấu hình đa bậc thang khuyến mãi, cho phép chọn đúng sản phẩm tặng và đơn vị tính (`ProductUnit`) của quà tặng đối với chương trình Mua X tặng Y (BOGO).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROM-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/promotions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROM-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `PromotionsController`, cập nhật chính xác dữ liệu `Promotion` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROM-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROM-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/promotions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROM-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y** (`/store-owner/promotions`, `/promotions`): Cho phép kích hoạt hoặc tạm dừng chương trình (`PATCH /api/promotions/{id}/status`); chặn bật lại chương trình đã quá ngày kết thúc.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROM-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/promotions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROM-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `PromotionsController`, cập nhật chính xác dữ liệu `Promotion` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROM-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROM-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/promotions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROM-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y** (`/store-owner/promotions`, `/promotions`): Chặn xóa chương trình đang trong trạng thái chạy hoạt động — bắt buộc tạm dừng trước khi xóa để bảo toàn tính nhất quán tại quầy POS.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROM-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/promotions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROM-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `PromotionsController`, cập nhật chính xác dữ liệu `Promotion` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROM-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROM-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/promotions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `promotion-list (baseline AS-IS)` · +4 ~0 -0
