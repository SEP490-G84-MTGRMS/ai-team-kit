# Spec: pos-invoice-list

> Spec gốc (Living Source of Truth) của capability `pos-invoice-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-POS-INVO-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy** (`/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`): Truy vấn danh sách hóa đơn bán lẻ và đơn đặt trước qua `GET /api/orders` và thống kê qua `GET /api/orders/summary`, lọc theo chi nhánh phân công, thu ngân (`CashierName`), phương thức thanh toán và trạng thái.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-INVO-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/invoices` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-INVO-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-INVO-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-INVO-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/invoices` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-INVO-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy** (`/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`): Hỗ trợ tạo mới đơn đặt trước (`CreatePreOrderModal`), giao hàng hoàn tất đơn đặt trước (`PUT /api/orders/{id}/fulfill`) hoặc hủy đơn (`PUT /api/orders/{id}/cancel`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-INVO-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/invoices` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-INVO-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-INVO-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-INVO-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/invoices` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-INVO-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy** (`/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`): Khi thực hiện Đổi/Trả hàng khách lẻ (`POST /api/orders/{id}/return-exchange` qua `ReturnExchangeModal`), bắt buộc phân loại tình trạng hàng nhận lại (còn nguyên vẹn nhập lại tồn bán được hay hàng lỗi/hết hạn đưa vào khu cách ly).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-INVO-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/invoices` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-INVO-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-INVO-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-INVO-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/invoices` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-INVO-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy** (`/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`): Chuẩn hóa hoàn tiền mặt qua két quầy thu ngân đang mở (hoặc cấn trừ công nợ khách hàng) và hiển thị đầy đủ vết khuyến mãi/voucher/BOGO đã áp dụng trên từng dòng hóa đơn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-INVO-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/invoices` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-INVO-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-INVO-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-INVO-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/invoices` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `pos-invoice-list (baseline AS-IS)` · +4 ~0 -0
