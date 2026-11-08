# Tasks: attendance-faceid-checkin-checkout

## DB
- [ ] T1 — Migration bổ sung trường `FaceDescriptor` cho `Employees` và `CheckInFaceImageUrl`, `CheckOutFaceImageUrl`, `CheckInMethod`, `CheckOutMethod` cho `EmployeeSchedule` (REQ-ATT-01, REQ-ATT-04)
- [ ] T2 — Cập nhật Enum `ScheduleRequestType` hỗ trợ tách riêng `CheckInIncident = 2` và `CheckOutIncident = 5` (REQ-ATT-06)

## Backend
- [ ] T3 — Triển khai API lấy danh sách vector khuôn mặt nhân viên trong ngày theo chi nhánh `GET /api/v1/schedules/face-id/today-descriptors` (REQ-ATT-01)
- [ ] T4 — Triển khai API Check-in FaceID `POST /api/v1/schedules/face-id/check-in` kèm upload snapshot và kích hoạt mở ca POS (REQ-ATT-01)
- [ ] T5 — Triển khai API Check-out FaceID `POST /api/v1/schedules/face-id/check-out` ràng buộc phiên POS đã đóng Z-Report (REQ-ATT-02)
- [ ] T6 — Nâng cấp API Chấm công thủ công 3 tiêu chí của Chủ cửa hàng `POST /api/v1/schedules/{id}/attendance` tự động điền giờ ca mặc định (REQ-ATT-03)
- [ ] T7 — Triển khai API Đăng ký vector khuôn mặt `POST /api/v1/employees/{id}/face-descriptor` (REQ-ATT-04)
- [ ] T8 — Hoàn thiện logic xử lý tách riêng đơn CheckInIncident (2) mở ca tức thì và CheckOutIncident (5) kèm luồng duyệt/từ chối (REQ-ATT-06)
- [ ] T9 — Củng cố Graceful Fallback khi chi nhánh chưa cấu hình AttendancePolicy (REQ-ATT-05)

## Frontend
- [ ] T10 — Tải và tích hợp models `@vladmandic/face-api` vào thư mục `public/models` và cấu hình service tải model client-side (REQ-ATT-01)
- [ ] T11 — Xây dựng Modal FaceID Check-in/Check-out với thuật toán Liveness chớp mắt EAR < 0.18 và so khớp vector trên màn hình POS (REQ-ATT-01, REQ-ATT-02)
- [ ] T12 — Nâng cấp Modal Đăng ký khuôn mặt trong trang Quản lý nhân viên (REQ-ATT-04)
- [ ] T13 — Hoàn thiện Modal Chấm công thủ công 3 tiêu chí trong Lịch làm việc (REQ-ATT-03)
- [ ] T14 — Đồng bộ giao diện gửi đơn và duyệt đơn cho cả 2 loại đơn CheckInIncident và CheckOutIncident (REQ-ATT-06)

## Test
- [ ] T15 — Viết Unit Tests Backend cho Service Check-in, Check-out, Liveness validation, và Graceful Fallback Policy (REQ-ATT-01, REQ-ATT-02, REQ-ATT-05)
- [ ] T16 — Viết Integration Tests cho luồng tạo đơn CheckInIncident tự động mở ca POS và duyệt đơn CheckOutIncident chốt công (REQ-ATT-06)
- [ ] T17 — Test kiểm thử giao diện Client-side FaceID trên trình duyệt máy POS với camera thật (REQ-ATT-01, REQ-ATT-02)
