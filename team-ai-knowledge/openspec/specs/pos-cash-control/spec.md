# Spec: pos-cash-control

> Spec gốc (Living Source of Truth) của capability `pos-cash-control`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-POS-CASH-CONT-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két** (`/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control`): Cho phép Store Owner cấu hình ngưỡng hạn mức chi tiền mặt tại quầy (`GET/PUT .../settings/cash-movement`, hỗ trợ mức `0 đ` để bắt buộc duyệt tất cả các khoản chi).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CASH-CONT-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/pos-cash-control` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CASH-CONT-01.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftCashMovement` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CASH-CONT-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CASH-CONT-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/pos-cash-control` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CASH-CONT-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két** (`/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control`): Liệt kê danh sách các phiếu thu/chi két chờ xử lý (`GET .../cash-movements/pending`) lọc tự động theo chi nhánh đang chọn trên thanh Topbar.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CASH-CONT-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/pos-cash-control` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CASH-CONT-02.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftCashMovement` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CASH-CONT-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CASH-CONT-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/pos-cash-control` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CASH-CONT-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két** (`/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control`): Hỗ trợ phê duyệt xuất tiền (`POST .../approve`), từ chối bắt buộc nhập lý do (`POST .../reject`) và xác nhận đã nhận đủ tiền rút két nộp về quỹ chính (`POST .../confirm-drop`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CASH-CONT-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/pos-cash-control` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CASH-CONT-03.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftCashMovement` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CASH-CONT-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CASH-CONT-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/pos-cash-control` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-CASH-CONT-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két** (`/store-owner/pos-cash-control`, `/store-owner/cash-control`, `/pos-cash-control`): Tự động đồng bộ số dư ngăn kéo ca hiện tại và tạo bút toán đối ứng sang Sổ quỹ khi xác nhận nhận tiền rút két.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-CASH-CONT-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/pos-cash-control` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-CASH-CONT-04.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftCashMovement` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-CASH-CONT-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-CASH-CONT-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/pos-cash-control` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `pos-cash-control (baseline AS-IS)` · +4 ~0 -0
