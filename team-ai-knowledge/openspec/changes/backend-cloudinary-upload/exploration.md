# EXP-2026-10-30-001: Khảo sát kiến trúc Upload ảnh qua Cloudinary phía Backend

## 1. Hiện trạng code & Bối cảnh (Current State & Context)
- **Backend**:
  - Hệ thống .NET 8 Clean Architecture (`MT_GRMS.Domain`, `MT_GRMS.Application`, `MT_GRMS.Infrastructure`, `MT_GRMS.Api`).
  - Chưa cài đặt package `CloudinaryDotNet` và chưa có endpoint xử lý media/upload.
  - Các thực thể `Product` đã có trường `ImageUrl` (string), hiện chỉ nhận chuỗi URL.
- **Frontend**:
  - Component `ProductFormModal.tsx` đã có nút và khung UI chọn ảnh đại diện (`input type="file" accept="image/*"`).
  - Logic cũ chỉ tạo blob tạm `URL.createObjectURL(file)` lưu vào state cục bộ, dẫn đến khi lưu sản phẩm vào database thì URL ảnh là URL cục bộ không dùng được.
  - Cần một API chuẩn để upload ảnh thật và lấy URL HTTPS từ CDN Cloudinary.

## 2. Giả định (Assumptions)
- **[ASSUMPTION-01]**: Hệ thống sử dụng dịch vụ SaaS Cloudinary để lưu trữ ảnh CDN.
- **[ASSUMPTION-02]**: Thông tin xác thực Cloudinary (`CloudName`, `ApiKey`, `ApiSecret`) được cấu hình qua `appsettings.json` hoặc Environment Variables của backend, không bao giờ được lộ ra frontend.
- **[ASSUMPTION-03]**: Kích thước ảnh tối đa cho phép là 5MB, các định dạng hỗ trợ bao gồm `.jpg`, `.jpeg`, `.png`, `.webp`.

## 3. Ràng buộc (Constraints)
- Tuân thủ cấu trúc Clean Architecture: Interface nằm ở `Application`, implementation và thư viện bên thứ 3 nằm ở `Infrastructure`, controller nằm ở `Api`.
- Xử lý file bằng `Stream` để tránh load toàn bộ file vào memory gây quá tải RAM.
- Trả về mã lỗi chuẩn RFC 7807 (ProblemDetails) khi upload lỗi hoặc file không hợp lệ.

## 4. Mục tiêu ngoài phạm vi (Non-Goals)
- Không xây dựng công cụ chỉnh sửa, cắt xén (crop), áp bộ lọc màu cho ảnh trên trình duyệt.
- Không hỗ trợ tải file video hoặc tài liệu (.pdf, .docx, .zip,...).
- Không xây dựng màn hình thư viện media tập trung (Media Asset Manager) trong giai đoạn này.

## 5. Khảo sát các phương án kỹ thuật (Options Analysis)

### Phương án 1: Frontend Upload trực tiếp lên Cloudinary (Unsigned Preset)
- **Mô tả**: Frontend dùng `fetch` hoặc `axios` gọi trực tiếp `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload` với `upload_preset` unsigned.
- **Ưu điểm**:
  - Backend không tốn tài nguyên băng thông và CPU để trung chuyển file.
  - Cài đặt nhanh ở phía client.
- **Nhược điểm & Rủi ro**:
  - Phơi bày `cloud_name` và `upload_preset` công khai trong code JavaScript client.
  - Bất kỳ ai cũng có thể dùng `upload_preset` này để spam upload file rác/độc hại lên tài khoản Cloudinary, làm cạn kiệt dung lượng và chi phí.
  - Không thể xác thực quyền hạn người dùng (JWT) và tenant trước khi upload.

### Phương án 2: Server-side Proxy Upload qua ASP.NET Core Web API (ĐƯỢC CHỌN)
- **Mô tả**: Frontend gửi file qua `POST /api/v1/media/upload` (multipart/form-data) kèm JWT token. Backend validate định dạng, dung lượng, sau đó dùng `CloudinaryDotNet` SDK truyền file stream lên Cloudinary với ApiKey + ApiSecret được bảo vệ an toàn.
- **Ưu điểm**:
  - Bảo mật tuyệt đối: ApiKey và ApiSecret được lưu kín ở backend.
  - Kiểm duyệt chặt chẽ: Chỉ người dùng đã đăng nhập có quyền upload; backend kiểm tra MIME type và dung lượng trước khi chuyển tiếp.
  - Tách bạch cấu trúc: Frontend chỉ cần giao tiếp với API backend nội bộ.
  - Có thể tổ chức folder lưu trữ theo tenant hoặc theo module (ví dụ: `mtgrms/products`).
- **Nhược điểm**:
  - Server tiêu tốn một lượng nhỏ băng thông để trung chuyển file. (Đã giảm thiểu bằng cách stream trực tiếp).

## 6. Đánh giá rủi ro & Cách khắc phục (Risks & Mitigations)
- **Rủi ro 1: Cloudinary credentials chưa được thiết lập**:
  - *Khắc phục*: Service kiểm tra cấu hình khi khởi động. Nếu thiếu credentials, log warning rõ ràng và trả về thông báo lỗi chi tiết giúp dev dễ cấu hình.
- **Rủi ro 2: File upload giả mạo phần mở rộng (ví dụ đổi file .exe thành .jpg)**:
  - *Khắc phục*: Backend kiểm tra cả phần mở rộng (extension) lẫn `ContentType` của `IFormFile`, kết hợp cơ chế tự động validate định dạng ảnh của chính Cloudinary SDK khi phân tích stream.
