# Design Brief: Kho Danh mục Hàng hóa Mẫu Toàn Cầu (Global FMCG Master Catalog)

## 1. Luồng Người Dùng (User Flows)

### Flow 1: Super Admin quản trị và Import danh mục từ Excel
1. Super Admin đăng nhập, vào sidebar chọn menu **Kho Hàng Mẫu Toàn Cầu** (`/admin/master-catalog`).
2. Màn hình hiển thị 4 thẻ KPI tổng quan (Tổng SKU mẫu, Ngành hàng, Lượt tiệm clone, Tỷ lệ ảnh HD) và bảng dữ liệu.
3. Super Admin bấm **Tải mẫu Excel** (`/api/admin/master-catalog/export-template`) để lấy file mẫu chuẩn có sẵn cột và hướng dẫn.
4. Super Admin bấm **Import Excel**: Hộp thoại Modal mở ra cho phép kéo thả file `.xlsx`.
5. Frontend gửi file lên backend `/api/admin/master-catalog/import-excel`. Backend dùng `ClosedXML` duyệt từng dòng, kiểm tra mã vạch EAN-13, lưu vào CSDL và trả về báo cáo kết quả (Số dòng thành công, Danh sách lỗi chi tiết nếu có).
6. Frontend cập nhật bảng danh sách và hiển thị Toast thông báo kết quả.

### Flow 2: Chủ tiệm (Tenant) Thêm sản phẩm nhanh bằng mã vạch
1. Chủ tiệm vào màn hình Danh sách sản phẩm (`/store-owner/products`), bấm **+ Thêm sản phẩm**.
2. Form modal `ProductFormModal.tsx` xuất hiện.
3. Chủ tiệm cầm súng bắn mã vạch quét vào vỏ lon/gói sản phẩm -> Ô `Barcode` nhận chuỗi 13 số.
4. Frontend tự động gọi API `GET /api/products/lookup-master?barcode=893...`.
5. Nếu tìm thấy trong Master Catalog, modal hiển thị thông báo badge: *"Tìm thấy trong Thư viện mẫu: [Ảnh] Coca-Cola Lon 330ml - Tự động điền"*.
6. Khi chọn tự động điền: Form tự động gán Tên sản phẩm, Ảnh, Đơn vị tính cơ bản ("Lon"), Thuế suất (8%), và tự động điền sẵn bảng Đơn vị quy đổi ("1 Thùng = 24 lon").
7. Chủ tiệm chỉ cần nhập: Giá vốn (`7.000 đ`) và Giá bán lẻ (`10.000 đ`) rồi bấm **Lưu**.

---

## 2. Thiết Kế Màn Hình & Thành Phần Giao Diện (Frontend Components)

Tuân thủ nghiêm ngặt **`RULE_UI_DESIGN_SYSTEM.md`**:
- **Bảng màu**: Nền trang xanh dịu `#F7FAFF`, Electric Blue `#0066FF`, viền thẻ `#EDF2F9`, màu thành công `#00C853`.
- **Typography**: `Be Vietnam Pro` (văn bản), `JetBrains Mono` (mã vạch & số tiền tabular-nums).
- **Border radius**: Full Pill `border-radius: 9999px` cho nút bấm, badge, search bar; Card `24px - 28px`.
- **Icon**: 100% SVG đơn sắc (Monochrome) từ Lucide, tuyệt đối không dùng Emoji.
- **Animation**: Tĩnh và ổn định (Solid & Grounded), không dùng keyframes float/bounce/rung lắc.

### Danh sách Components mới tại `src/features/admin/master-catalog/`:
1. `MasterCatalogPage.tsx`: Trang chính tại route `/admin/master-catalog`.
2. `MasterCatalogKpiBanner.tsx`: 4 thẻ KPI số liệu (Tổng SKU mẫu, Ngành hàng FMCG, Lượt tiệm clone, Tỷ lệ ảnh HD).
3. `MasterCatalogFilterBar.tsx`: Thanh tìm kiếm quét barcode, dropdown lọc ngành hàng, dropdown lọc thương hiệu, nút Tải template, nút Import Excel và nút Thêm mới.
4. `MasterCatalogTable.tsx`: Bảng dữ liệu hiển thị ảnh thumbnail, mã vạch EAN-13, tên sản phẩm, hãng, ngành hàng, quy cách đóng gói (Thùng/Lốc), giá tham khảo, số tiệm dùng, nút Sửa/Xóa.
5. `MasterProductModal.tsx`: Hộp thoại thêm/sửa sản phẩm mẫu thủ công, hỗ trợ thêm nhiều đơn vị quy đổi (`MasterProductUnit`).
6. `MasterExcelImportModal.tsx`: Hộp thoại kéo thả file `.xlsx`, thanh tiến trình, switch "Ghi đè nếu trùng mã vạch", bảng hiển thị báo cáo kết quả import.
7. `masterCatalogApi.ts`: Client gọi các endpoint `/api/admin/master-catalog`.

### Trạng thái Giao diện:
- **Loading State**: Skeleton table và spinner nhẹ nhàng.
- **Empty State**: Thẻ card với icon `PackageOpen` đơn sắc, tiêu đề "Chưa có mặt hàng mẫu nào", nút kêu gọi "Import từ file Excel".
- **Error State**: Banner cảnh báo viền đỏ nhạt, nút "Thử lại".

---

## 3. Thiết Kế Backend API & DTOs (`MT_GRMS_BACKEND`)

### 3.1. Các Endpoints Mới
1. `GET /api/admin/master-catalog`
   - Query: `keyword`, `brand`, `categoryName`, `pageIndex`, `pageSize`.
   - Response: `ApiResponse<PagedResult<MasterProductDto>>`.
2. `GET /api/admin/master-catalog/kpis`
   - Response: `ApiResponse<MasterCatalogKpiDto>`.
3. `GET /api/admin/master-catalog/{id}`
   - Response: `ApiResponse<MasterProductDetailDto>`.
4. `POST /api/admin/master-catalog`
   - Request: `CreateMasterProductRequest`.
   - Response: `ApiResponse<MasterProductDetailDto>`.
5. `PUT /api/admin/master-catalog/{id}`
   - Request: `UpdateMasterProductRequest`.
   - Response: `ApiResponse<MasterProductDetailDto>`.
6. `DELETE /api/admin/master-catalog/{id}`
   - Response: `ApiResponse<bool>`.
7. `POST /api/admin/master-catalog/import-excel`
   - Form-data: `file` (IFormFile), `upsert` (bool).
   - Response: `ApiResponse<MasterCatalogImportResultDto>`.
8. `GET /api/admin/master-catalog/export-template`
   - Response: File stream `.xlsx`.
9. `GET /api/products/lookup-master?barcode={barcode}`
   - Role: Mọi tenant đã xác thực.
   - Response: `ApiResponse<MasterProductSuggestionDto?>`.

### 3.2. Cấu trúc DTOs chính
```csharp
public record MasterProductDto(
    Guid Id,
    string Barcode,
    string Name,
    string Brand,
    string CategoryName,
    string BaseUnit,
    decimal? SuggestedRetailPrice,
    decimal VatRate,
    string? ImageUrl,
    int UsageCount,
    bool IsActive,
    List<MasterProductUnitDto> Units
);

public record MasterProductUnitDto(
    Guid Id,
    string UnitName,
    decimal ConversionRate,
    string? Barcode,
    bool IsPurchaseUnit
);

public record MasterCatalogImportResultDto(
    int TotalRows,
    int SuccessCount,
    int FailedCount,
    List<string> ErrorMessages
);
```

---

## 4. Thay Đổi Cơ Sở Dữ Liệu (Database Schema & Migration)

### 4.1. Bảng `MasterProducts`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `Id` | `uuid` | PK | Mã định danh toàn cầu (Uuid7) |
| `Barcode` | `varchar(50)` | NOT NULL, UNIQUE INDEX | Mã vạch EAN-13 |
| `Name` | `varchar(255)` | NOT NULL | Tên chuẩn hóa tiếng Việt |
| `Brand` | `varchar(100)` | NOT NULL | Hãng sản xuất / Thương hiệu |
| `CategoryName` | `varchar(100)` | NOT NULL | Ngành hàng FMCG |
| `BaseUnit` | `varchar(50)` | NOT NULL | Đơn vị tính cơ bản (Gói, Lon, Chai...) |
| `SuggestedRetailPrice` | `numeric(18,2)` | NULL | Giá bán lẻ thị trường tham khảo |
| `VatRate` | `numeric(5,2)` | NOT NULL, DEFAULT 8.00 | Thuế suất GTGT |
| `TaxCategory` | `varchar(50)` | NOT NULL, DEFAULT 'STANDARD_1PCT' | Nhóm thuế hộ kinh doanh |
| `ImageUrl` | `varchar(1000)` | NULL | Link ảnh chuẩn Cloudinary/CDN |
| `Description` | `text` | NULL | Mô tả chi tiết bao bì |
| `UsageCount` | `int` | NOT NULL, DEFAULT 0 | Số lượt tenant đã áp dụng |
| `IsActive` | `boolean` | NOT NULL, DEFAULT TRUE | Trạng thái sẵn sàng |
| `CreatedAt` | `timestamptz` | NOT NULL | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | NULL | Thời điểm sửa |
| `IsDeleted` | `boolean` | NOT NULL, DEFAULT FALSE | Xóa mềm |

### 4.2. Bảng `MasterProductUnits`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `Id` | `uuid` | PK | Mã định danh (Uuid7) |
| `MasterProductId` | `uuid` | FK `MasterProducts(Id)` ON DELETE CASCADE | Tham chiếu SP mẫu |
| `UnitName` | `varchar(50)` | NOT NULL | Tên đơn vị quy cách (Thùng, Lốc...) |
| `ConversionRate` | `numeric(18,4)` | NOT NULL | Tỷ lệ quy đổi (VD: 30, 24, 6) |
| `Barcode` | `varchar(50)` | NULL | Mã vạch trên thùng carton |
| `IsPurchaseUnit` | `boolean` | NOT NULL, DEFAULT TRUE | Đơn vị mua hàng mặc định |
| `CreatedAt` | `timestamptz` | NOT NULL | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | NULL | Thời điểm sửa |
| `IsDeleted` | `boolean` | NOT NULL, DEFAULT FALSE | Xóa mềm |

---

## 5. Phân Quyền & Bảo Mật (Security & RBAC)
- Toàn bộ các API `/api/admin/master-catalog/**` đều được bảo vệ bằng `[Authorize(Roles = RoleConstants.AdminOnly)]`.
- Tenant chỉ được cấp quyền gọi `GET /api/products/lookup-master?barcode=...` để đọc dữ liệu mẫu công khai.
- Không có bất kỳ endpoint nào cho phép Tenant thay đổi hoặc xóa dữ liệu của Master Catalog.
