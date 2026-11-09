# Tasks: attendance-faceid-checkin-checkout

## DB
- [x] T1 — Migration bổ sung trường `FaceDescriptor`, `FaceImageUrls`, `FaceRegisteredAt` cho `Employees` và `CheckInFaceImageUrl`, `CheckOutFaceImageUrl`, `CheckInMethod`, `CheckOutMethod` cho `EmployeeSchedule` (REQ-ATT-01, REQ-ATT-04)
- [x] T2 — Cập nhật Enum `ScheduleRequestType` hỗ trợ tách riêng `CheckInIncident = 2` và `CheckOutIncident = 5` (REQ-ATT-06)
- [x] T2a — Cập nhật `DbInitializer.cs` (ALTER TABLE safe script bổ sung cột CSDL nếu chưa có) và `EmployeeSeedData.cs` (kiểm tra Exist từng trường, từng phụ cấp và từng ca làm việc trước khi add, kèm dữ liệu vector FaceID và ảnh mẫu 128 số float chuẩn)

## Backend
- [x] T3 — Triển khai API lấy danh sách vector khuôn mặt nhân viên trong ngày theo chi nhánh `GET /api/v1/schedules/face-id/today-descriptors` kèm `FaceImageUrls` (REQ-ATT-01)
- [x] T4 — Triển khai API Check-in FaceID `POST /api/v1/schedules/face-id/check-in` với ngưỡng khớp FaceMatchScore >= 65.00m, kèm upload snapshot và kích hoạt mở ca POS (REQ-ATT-01)
- [x] T5 — Triển khai API Check-out FaceID `POST /api/v1/schedules/face-id/check-out` với ngưỡng khớp FaceMatchScore >= 65.00m, ràng buộc phiên POS đã đóng Z-Report (REQ-ATT-02)
- [x] T6 — Nâng cấp API Chấm công thủ công 3 tiêu chí của Chủ cửa hàng `POST /api/v1/schedules/{id}/attendance` tự động điền giờ ca mặc định (REQ-ATT-03)
- [x] T7 — Triển khai API Đăng ký vector khuôn mặt `POST /api/v1/employees/{id}/face-descriptor` hỗ trợ lưu chuỗi danh sách ảnh mẫu `FaceImageUrls` và mảng vector đa ảnh (REQ-ATT-04)
- [x] T8 — Hoàn thiện logic xử lý tách riêng đơn CheckInIncident (2) mở ca tức thì và CheckOutIncident (5) kèm luồng duyệt/từ chối (REQ-ATT-06)
- [x] T9 — Củng cố Graceful Fallback khi chi nhánh chưa cấu hình AttendancePolicy (REQ-ATT-05)

## Frontend & Thuật toán Đa ảnh
- [x] T10 — Tải và tích hợp models `@vladmandic/face-api` vào thư mục `public/models` và cấu hình service tải model client-side (REQ-ATT-01)
- [x] T11 — Nâng cấp thuật toán so khớp đa ảnh: chuẩn hóa L2-norm (`normalizeDescriptor`), phân giải đệ quy chuỗi mảng 2 chiều đa vector, nạp `Float32Array[]` vào `LabeledFaceDescriptors`, và thuật toán ánh xạ khoảng cách Euclid sang điểm số % (`calculateMatchScore`) đồng bộ chuẩn xác với mốc 65% tại khoảng cách 0.60 (REQ-ATT-01)
- [x] T12 — Nâng cấp Modal FaceID Check-in/Check-out với ngưỡng nhận diện 65%, nút Xác nhận vào/ra ca mặc định luôn hiển thị rõ ràng (REQ-ATT-01, REQ-ATT-02)
- [x] T13 — Nâng cấp `EmployeeFormModal.tsx` hỗ trợ huấn luyện đa ảnh (tối đa 4 ảnh mẫu góc mặt khác nhau), trích xuất mảng vector 128 số và lưu trữ `FaceImageUrls`, `FaceDescriptor` (REQ-ATT-04)
- [x] T14 — Hoàn thiện Modal Chấm công thủ công 3 tiêu chí trong Lịch làm việc (REQ-ATT-03)
- [x] T15 — Đồng bộ giao diện gửi đơn và duyệt đơn cho cả 2 loại đơn CheckInIncident và CheckOutIncident (REQ-ATT-06)

## Test & Build
- [x] T16 — Cập nhật Unit Tests Backend cho Service Check-in, Check-out với ngưỡng FaceMatchScore >= 65.00m (REQ-ATT-01, REQ-ATT-02, REQ-ATT-05)
- [x] T17 — 556/556 tests Backend (512 Unit + 44 Integration) PASSED 100%
- [x] T18 — Build sạch Frontend (`tsc -b && vite build`) hoàn tất 0 lỗi
