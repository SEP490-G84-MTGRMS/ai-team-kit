# Specs: backend-cloudinary-upload

## API / Contract
| Method | Path | Request Body | Response Body | Error Codes |
|---|---|---|---|---|
| POST | `/api/v1/media/upload` | `multipart/form-data`: `file` (IFormFile, $\le 5\text{MB}$), `folder` (optional string) | `200 OK`: `{ url: string, publicId: string, format: string, bytes: number, width: number, height: number }` | `400 Bad Request` (File rỗng, sai format, >5MB), `401 Unauthorized`, `500 Internal Error` |

---

## ADDED Requirements

### Requirement: REQ-MEDIA-01 Upload ảnh an toàn qua Backend lên Cloudinary
Hệ thống **MUST** cung cấp endpoint `POST /api/v1/media/upload` để tiếp nhận tệp ảnh từ người dùng đã đăng nhập, sử dụng thư viện `CloudinaryDotNet` để stream tệp lên dịch vụ lưu trữ đám mây Cloudinary và trả về đường dẫn an toàn HTTPS (`secure_url`).

#### Scenario: Người dùng tải lên ảnh sản phẩm hợp lệ thành công
- **GIVEN** Người dùng đã đăng nhập với JWT token hợp lệ và chọn file ảnh `tra-xanh.jpg` có dung lượng 1.2MB
- **WHEN** Gửi request `POST /api/v1/media/upload` với file `tra-xanh.jpg` và `folder = "mtgrms/products"`
- **THEN** Hệ thống phản hồi HTTP 200 OK với body chứa trường `url` bắt đầu bằng `https://res.cloudinary.com/` và trường `publicId` tương ứng.

#### Scenario: Người dùng chưa đăng nhập cố gắng tải ảnh
- **GIVEN** Request không kèm header `Authorization` hoặc token JWT không hợp lệ / hết hạn
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST từ chối với mã lỗi HTTP 401 Unauthorized.

---

### Requirement: REQ-MEDIA-02 Kiểm duyệt kích thước và định dạng file tải lên
Hệ thống **MUST** kiểm tra tính hợp lệ của tệp tải lên trước khi truyền tải lên Cloudinary:
- Dung lượng tệp không được vượt quá 5MB ($5 \times 1024 \times 1024$ bytes).
- Phần mở rộng của tệp chỉ được thuộc danh sách cho phép: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Tệp không được rỗng (Length > 0).

#### Scenario: Tải lên file vượt quá giới hạn 5MB
- **GIVEN** Người dùng chọn một file ảnh `poster.png` có dung lượng 6.5MB
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Kích thước ảnh vượt quá giới hạn tối đa 5MB."

#### Scenario: Tải lên tệp không đúng định dạng ảnh
- **GIVEN** Người dùng chọn một tệp văn bản hoặc thực thi `document.pdf` hoặc `script.exe`
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp."

#### Scenario: Gửi request rỗng không đính kèm file
- **GIVEN** Request `POST /api/v1/media/upload` với form data không có trường `file` hoặc file có dung lượng 0 bytes
- **WHEN** Gửi request đến server
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "File rỗng hoặc không được cung cấp."

---

### Requirement: REQ-MEDIA-03 Tích hợp tải ảnh tại giao diện Tạo / Sửa sản phẩm
Giao diện `ProductFormModal.tsx` **SHALL** cho phép người dùng chọn tệp ảnh từ máy tính, tự động gọi API upload ở backend, hiển thị trạng thái đang tải (loading) và hiển thị ảnh xem trước (preview) sau khi tải thành công. Khi lưu sản phẩm, URL ảnh trên Cloudinary **MUST** được đính kèm vào payload gửi đến API sản phẩm.

#### Scenario: Chọn file ảnh từ máy tính trong ProductFormModal
- **GIVEN** Người dùng đang mở modal `ProductFormModal` để tạo sản phẩm mới
- **WHEN** Người dùng click khung tải ảnh và chọn file `banh-quy.png`
- **THEN** Modal hiển thị thông báo/spinner "Đang tải ảnh lên...", gọi API backend upload ảnh, nhận về URL Cloudinary và hiển thị ảnh xem trước, đồng thời cho phép gỡ ảnh nếu muốn.

---

## MODIFIED Requirements
*(Không có)*

## REMOVED Requirements
*(Không có)*

---

## Acceptance checklist
- [ ] Backend cài đặt package `CloudinaryDotNet` và đọc cấu hình từ `appsettings.json`.
- [ ] `POST /api/v1/media/upload` hoạt động và yêu cầu JWT Authentication.
- [ ] Validation từ chối file > 5MB hoặc file không phải ảnh (.jpg, .jpeg, .png, .webp) với mã lỗi 400.
- [ ] `ProductFormModal.tsx` upload ảnh thật lên Cloudinary qua backend và hiển thị preview mượt mà.
- [ ] Toàn bộ unit tests cho `CloudinaryService` / `MediaController` và frontend chạy pass.
