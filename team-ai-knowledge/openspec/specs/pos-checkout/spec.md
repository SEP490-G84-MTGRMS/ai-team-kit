# Spec: pos-checkout

> Spec gốc (Living Source of Truth) của capability `pos-checkout`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-POS-CHEC-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ)** (`/pos`, `/employee/pos`): Chỉ nạp và cho phép bán các sản phẩm đã gán kinh doanh tại chi nhánh đang chọn (`BranchProducts` + `BranchStocks`), tự động xuất kho theo nguyên tắc FEFO và chặn bán lô đã hết hạn; hỗ trợ quét tem khay cân ký (`GET /api/packages/scan`) và tra cứu tồn kho liên chi nhánh (`PosInventoryLookupModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CHEC-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/pos` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CHEC-01.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CHEC-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CHEC-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/pos` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CHEC-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ)** (`/pos`, `/employee/pos`): Tự động đánh giá khuyến mãi giỏ hàng & quà tặng Mua X tặng Y qua `POST /api/promotions/evaluate-cart`, kiểm tra mã giảm giá qua `POST /api/vouchers/validate` và quy đổi điểm thành viên.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CHEC-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/pos` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CHEC-02.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CHEC-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CHEC-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/pos` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CHEC-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ)** (`/pos`, `/employee/pos`): Kiểm tra lịch trực nhân viên thu ngân (`cashier-eligibility`); với Chủ cửa hàng, hỗ trợ bán không cần mở ca (vào Két sắt) hoặc chọn chế độ bỏ chung ngăn kéo khi chi nhánh đang có ca nhân viên mở.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CHEC-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/pos` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CHEC-03.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CHEC-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CHEC-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/pos` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CHEC-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ)** (`/pos`, `/employee/pos`): Hỗ trợ thanh toán Tiền mặt, Chuyển khoản VietQR động (`VietQrModal`), Bán ghi nợ khách hàng (kiểm tra hạn mức nợ AR), tạo Đơn đặt trước (`POST /api/orders/pre-orders`) và in hóa đơn khổ K80 (`PosReceiptModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CHEC-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/pos` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CHEC-04.
- **THEN** Hệ thống xử lý thành công qua `OrdersController`, cập nhật chính xác dữ liệu `Order` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CHEC-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CHEC-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/pos` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `pos-checkout (baseline AS-IS)` · +4 ~0 -0
