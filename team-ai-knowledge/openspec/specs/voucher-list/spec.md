# Spec: voucher-list

> Spec gốc (Living Source of Truth) của capability `voucher-list`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-VOUC-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon** (`/store-owner/vouchers`, `/promotions/vouchers`): Quản lý các đợt voucher qua `GET/POST/PUT /api/vouchers` với cấu hình loại giảm giá (`%` hoặc số tiền cố định, mức giảm tối đa, giá trị đơn tối thiểu và hạn dùng).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-VOUC-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/vouchers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-VOUC-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `VouchersController`, cập nhật chính xác dữ liệu `VoucherCode` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-VOUC-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-VOUC-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/vouchers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-VOUC-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon** (`/store-owner/vouchers`, `/promotions/vouchers`): Hỗ trợ sinh thêm hàng loạt mã coupon duy nhất cho đợt phát hành qua `POST /api/vouchers/{id}/generate-codes` (`GenerateCodesModal`) và tra cứu danh sách mã qua `GET .../codes`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-VOUC-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/vouchers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-VOUC-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `VouchersController`, cập nhật chính xác dữ liệu `VoucherCode` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-VOUC-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-VOUC-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/vouchers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-VOUC-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon** (`/store-owner/vouchers`, `/promotions/vouchers`): Hỗ trợ bật/tắt lưu hành đợt voucher (`PATCH /api/vouchers/{id}/status`), in phiếu voucher qua `POST /api/vouchers/print` và gạch mã khi thanh toán POS (`POST /api/vouchers/redeem`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-VOUC-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/vouchers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-VOUC-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `VouchersController`, cập nhật chính xác dữ liệu `VoucherCode` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-VOUC-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-VOUC-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/vouchers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-VOUC-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon** (`/store-owner/vouchers`, `/promotions/vouchers`): Chặn xóa đợt voucher đang ở trạng thái lưu hành hoạt động.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-VOUC-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/vouchers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-VOUC-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `VouchersController`, cập nhật chính xác dữ liệu `VoucherCode` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-VOUC-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-VOUC-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/vouchers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `voucher-list (baseline AS-IS)` · +4 ~0 -0
