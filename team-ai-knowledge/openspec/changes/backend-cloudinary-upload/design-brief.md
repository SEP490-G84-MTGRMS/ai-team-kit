# Thiết kế kỹ thuật (Design Brief): Upload ảnh Cloudinary qua Backend

## 1. Luồng xử lý dữ liệu (Data & Execution Flow)

```
[User]
   │ (1) Chọn file ảnh (.jpg, .png, .webp)
   ▼
[ProductFormModal.tsx]
   │ (2) Tạo FormData({ file, folder: "mtgrms/products" })
   │     Hiển thị overlay "Đang tải ảnh lên..."
   ▼
[Axios / httpClient]
   │ (3) POST /api/v1/media/upload (Bearer JWT)
   ▼
[MediaController (.NET 8 Api)]
   │ (4) Validate file:
   │     - file != null && file.Length > 0
   │     - file.Length <= 5 * 1024 * 1024 (5MB)
   │     - Extension in [.jpg, .jpeg, .png, .webp]
   ▼
[CloudinaryService (Infrastructure)]
   │ (5) Khởi tạo Cloudinary client từ CloudinarySettings
   │ (6) UploadImageAsync(stream, fileName, folder)
   ▼
[Cloudinary Storage (CDN)]
   │ (7) Lưu trữ và sinh HTTPS secure_url
   ▼
[Backend Response]
   │ (8) Trả về HTTP 200 { url, publicId, format, bytes }
   ▼
[Frontend State]
   │ (9) Gán URL vào state images / imageUrl, tắt overlay loading
```

---

## 2. API Contract & DTOs

### 2.1. Endpoint: Upload Image
- **Route**: `POST /api/v1/media/upload`
- **Authentication**: `[Authorize]` (bắt buộc JWT token hợp lệ)
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `file`: `IFormFile` (Bắt buộc, tối đa 5MB)
  - `folder`: `string?` (Tùy chọn, mặc định `"mtgrms/products"`)

### 2.2. Response DTO
```csharp
namespace MT_GRMS.Application.Common.DTOs;

public class ImageUploadResponseDto
{
    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public long Bytes { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}
```

### 2.3. Lỗi (ProblemDetails RFC 7807)
- `400 Bad Request`:
  - `File rỗng hoặc không được cung cấp.`
  - `Kích thước ảnh vượt quá giới hạn tối đa 5MB.`
  - `Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp.`
- `401 Unauthorized`: Chưa đăng nhập hoặc token hết hạn.
- `500 Internal Server Error`: Lỗi kết nối Cloudinary hoặc cấu hình thiếu credentials.

---

## 3. Cấu hình & Dependency Injection

### 3.1. Cấu hình (`appsettings.json`)
```json
{
  "Cloudinary": {
    "CloudName": "your_cloud_name",
    "ApiKey": "your_api_key",
    "ApiSecret": "your_api_secret"
  }
}
```

### 3.2. Strongly-typed Settings (`MT_GRMS.Infrastructure`)
```csharp
public class CloudinarySettings
{
    public const string SectionName = "Cloudinary";
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}
```

### 3.3. Application Interface (`MT_GRMS.Application`)
```csharp
namespace MT_GRMS.Application.Common.Interfaces;

public interface ICloudinaryService
{
    Task<ImageUploadResponseDto> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string? folder = null,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteImageAsync(
        string publicId,
        CancellationToken cancellationToken = default);
}
```

---

## 4. Giao diện Frontend (`ProductFormModal.tsx`)

### 4.1. Trạng thái UI (Loading, Empty, Error)
- **Empty State**: Khi chưa có ảnh, khung hiển thị biểu tượng Camera, text "Kéo thả hoặc bấm để tải ảnh sản phẩm", kích thước khuyến nghị (800x800, tối đa 5MB).
- **Loading State**: Khi đang gọi API upload, hiển thị hiệu ứng xoay (spinner), làm mờ khung ảnh và hiển thị chữ "Đang tải ảnh lên máy chủ...". Nút Lưu và Lưu & Thêm mới tạm thời bị disable để ngăn submit thiếu URL.
- **Success State**: Hiển thị ảnh sắc nét từ URL Cloudinary, có nút thùng rác đỏ góc trên bên phải để gỡ ảnh.
- **Error State**: Nếu upload thất bại, hiển thị alert màu đỏ mô tả nguyên nhân lỗi do backend trả về và cho phép người dùng chọn lại file khác.

### 4.2. API Client Function
```typescript
export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'mtgrms/products');

  const response = await httpClient.post<ImageUploadResponseDto>('/api/v1/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
};
```

---

## 5. Thay đổi CSDL (Database Schema)
- **Không thay đổi bảng nào trong CSDL**: Bảng `products` đã có cột `image_url VARCHAR(1000)` sẵn sàng lưu trữ HTTPS URL được trả về từ Cloudinary. Do đó không cần tạo migration mới.
