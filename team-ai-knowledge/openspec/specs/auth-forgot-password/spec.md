# Spec: auth-forgot-password

> Spec gốc (Living Source of Truth) của capability `auth-forgot-password`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-AUTH-FORG-PASS-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Khôi phục Mật khẩu qua Email OTP** (`/auth/forgot-password`, `/forgot-password`): Bước 1 gọi `POST /api/auth/forgot-password` sinh mã OTP 6 chữ số có thời hạn hiệu lực ngắn và áp dụng bộ đếm ngược chống spam gửi lại mã.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-FORG-PASS-01)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/forgot-password` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-FORG-PASS-01.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-FORG-PASS-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-FORG-PASS-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/forgot-password` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-FORG-PASS-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Khôi phục Mật khẩu qua Email OTP** (`/auth/forgot-password`, `/forgot-password`): Bước 2 gọi `POST /api/auth/verify-otp` kiểm tra tính hợp lệ và thời hạn của mã OTP; sai quá số lần quy định thì hủy hiệu lực mã hiện tại.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-FORG-PASS-02)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/forgot-password` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-FORG-PASS-02.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-FORG-PASS-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-FORG-PASS-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/forgot-password` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-FORG-PASS-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Khôi phục Mật khẩu qua Email OTP** (`/auth/forgot-password`, `/forgot-password`): Bước 3 gọi `POST /api/auth/reset-password` kiểm tra mật khẩu mới (8–64 ký tự, đủ chữ hoa/thường/số/ký tự đặc biệt, khớp xác nhận) và băm lưu trữ an toàn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-FORG-PASS-03)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/forgot-password` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-FORG-PASS-03.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-FORG-PASS-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-FORG-PASS-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/forgot-password` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-FORG-PASS-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Khôi phục Mật khẩu qua Email OTP** (`/auth/forgot-password`, `/forgot-password`): Vô hiệu hóa các Refresh Token cũ của tài khoản ngay sau khi đổi mật khẩu thành công.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-FORG-PASS-04)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/forgot-password` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-FORG-PASS-04.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-FORG-PASS-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-FORG-PASS-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/forgot-password` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `auth-forgot-password (baseline AS-IS)` · +4 ~0 -0
