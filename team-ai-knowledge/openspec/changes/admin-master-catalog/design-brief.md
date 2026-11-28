# Design Brief: Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG (`admin-master-catalog`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/admin/master-catalog`
- **Entry Page**: `src/pages/admin/MasterCatalogPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `MasterCatalogKpiBanner`
  - `MasterCatalogFilterBar`
  - `MasterCatalogTable`
  - `MasterProductModal`
  - `MasterExcelImportModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/admin/master-catalog` | `AdminMasterCatalogController.GetList` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/master-catalog/kpis` | `AdminMasterCatalogController.GetKpis` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/master-catalog/brands` | `AdminMasterCatalogController.GetBrands` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/master-catalog/categories` | `AdminMasterCatalogController.GetCategories` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/master-catalog/{id:guid}` | `AdminMasterCatalogController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/master-catalog` | `AdminMasterCatalogController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/admin/master-catalog/{id:guid}` | `AdminMasterCatalogController.Update` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/admin/master-catalog/{id:guid}` | `AdminMasterCatalogController.Delete` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/master-catalog/export-template` | `AdminMasterCatalogController.ExportTemplate` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/master-catalog/import-excel` | `AdminMasterCatalogController.ImportExcel` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `MasterProduct`, `MasterProductUnit`.
- **Vai trò được phép truy cập**: `MasterAdmin`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
