# Tasks: backend-cloudinary-upload

## Backend
- [x] T1 — Thêm package `CloudinaryDotNet` vào `MT_GRMS.Infrastructure` và thêm template cấu hình `Cloudinary` vào `appsettings.json` (REQ-MEDIA-01)
- [x] T2 — Tạo DTO `ImageUploadResponseDto` và interface `ICloudinaryService` trong `MT_GRMS.Application` (REQ-MEDIA-01)
- [x] T3 — Cài đặt service `CloudinaryService` trong `MT_GRMS.Infrastructure` và đăng ký Dependency Injection (REQ-MEDIA-01)
- [x] T4 — Tạo `MediaController` với endpoint `POST /api/v1/media/upload`, kiểm duyệt kích thước $\le 5\text{MB}$ và định dạng `.jpg, .jpeg, .png, .webp` (REQ-MEDIA-01, REQ-MEDIA-02)

## Frontend
- [x] T5 — Thêm API helper `uploadImage` trong frontend để gửi `multipart/form-data` lên endpoint backend (REQ-MEDIA-03)
- [x] T6 — Tích hợp tải ảnh, trạng thái loading ("Đang tải ảnh lên..."), hiển thị preview và lưu URL vào `ProductFormModal.tsx` (REQ-MEDIA-03)

## Test
- [x] T7 — Viết unit tests cho validation upload ảnh và xử lý service tại backend (REQ-MEDIA-01, REQ-MEDIA-02)
- [x] T8 — Viết unit tests cho API client upload ảnh ở frontend và kiểm chứng toàn bộ test suite (REQ-MEDIA-03)
