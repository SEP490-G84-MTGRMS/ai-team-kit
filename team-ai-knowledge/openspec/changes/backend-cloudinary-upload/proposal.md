# Đề xuất chức năng: Tích hợp Upload ảnh qua Cloudinary xử lý tại Backend

## 1. Vấn đề (Problem Statement)
- Phân hệ quản lý hàng hóa (`ProductFormModal.tsx`) và nhân viên trong MT-GRMS cần tải lên hình ảnh đại diện minh họa cho sản phẩm và người dùng.
- Nếu thực hiện upload trực tiếp từ trình duyệt Frontend lên Cloudinary, hệ thống bắt buộc phải nhúng API Key / API Secret vào mã nguồn frontend hoặc dùng unsigned upload preset thiếu kiểm soát, dẫn đến rủi ro lộ bí mật bảo mật và bị lạm dụng tài nguyên Cloudinary.
- Chưa có cơ chế kiểm duyệt tập trung ở tầng máy chủ đối với định dạng file (chỉ cho phép định dạng ảnh hợp lệ) và dung lượng upload tối đa.

## 2. Mục tiêu (Objectives)
- Xây dựng API Endpoint an toàn `POST /api/v1/media/upload` ở Backend .NET 8, quản lý toàn bộ Cloudinary Credentials qua Options Pattern trong `appsettings.json` / biến môi trường.
- Kiểm duyệt tính hợp lệ của file tải lên (chỉ chấp nhận `.jpg`, `.jpeg`, `.png`, `.webp`, dung lượng $\le 5\text{MB}$).
- Upload ảnh qua thư viện chính thức `CloudinaryDotNet`, trả về `secure_url` (HTTPS) và `public_id`.
- Tích hợp phía Frontend: xây dựng hàm upload ảnh và nối trực tiếp vào khung tải ảnh của `ProductFormModal.tsx`.

## 3. Phạm vi (Scope)
### Trong phạm vi (In Scope)
- **Backend**:
  - Cài đặt package `CloudinaryDotNet` vào `MT_GRMS.Infrastructure`.
  - Cấu hình `CloudinarySettings` trong `MT_GRMS.Api/appsettings.json` và đăng ký Dependency Injection.
  - `ICloudinaryService` trong `MT_GRMS.Application` và `CloudinaryService` trong `MT_GRMS.Infrastructure`.
  - Endpoint `POST /api/v1/media/upload` trong `MediaController` thuộc `MT_GRMS.Api`.
  - Bộ kiểm tra định dạng và kích thước file tải lên (Validation).
- **Frontend**:
  - API client `uploadProductImage(file: File)` gọi tới backend endpoint.
  - Tích hợp vào `handleImageUpload` của `ProductFormModal.tsx` để xem trước và nhận URL ảnh.

### Ngoài phạm vi (Out of Scope)
- Công cụ cắt xén (crop), xoay hoặc chỉnh sửa hiệu ứng ảnh nâng cao trên canvas trình duyệt.
- Upload các file đa phương tiện khác (video, tài liệu PDF, zip,...).
- Màn hình quản lý thư viện ảnh tập trung (Media Library Gallery).

## 4. Người dùng & Phân quyền liên quan
- **StoreOwner (Chủ cửa hàng)**: Toàn quyền upload ảnh sản phẩm, banner, thiết lập.
- **StoreManager (Quản lý cửa hàng)**: Quyền upload ảnh sản phẩm và avatar nhân viên.

## 5. Tiêu chí thành công (Acceptance Criteria)
1. Backend khởi động và nạp cấu hình Cloudinary thành công mà không lỗi.
2. Endpoint `POST /api/v1/media/upload` nhận file ảnh hợp lệ trả về HTTP 200 với JSON chứa URL ảnh trên Cloudinary (`secure_url`).
3. Endpoint trả về HTTP 400 kèm thông điệp lỗi rõ ràng khi file vượt quá 5MB hoặc sai định dạng cho phép.
4. Giao diện `ProductFormModal.tsx` cho phép chọn ảnh từ máy, tải lên backend thành công và hiển thị ảnh xem trước ngay lập tức.
5. Unit tests và build solution (.NET và React) chạy pass 100%.
