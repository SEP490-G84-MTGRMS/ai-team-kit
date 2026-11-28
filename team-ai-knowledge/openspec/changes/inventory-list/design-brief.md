# Design Brief: Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp (`inventory-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/inventory`
- **Entry Page**: `src/features/inventory/pages/InventoryListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `InventoryFilterBar`
  - `InventoryTable`
  - `SupplierVisitModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/inventory` | `InventoryController.GetInventorySummary` | JSON DTO / ProblemDetails |
| `GET` | `/api/inventory/{productId:guid}/batches` | `InventoryController.GetProductBatches` | JSON DTO / ProblemDetails |
| `GET` | `/api/inventory/supplier-visits/eligibility` | `SupplierDirectVisitsController.GetEligibility` | JSON DTO / ProblemDetails |
| `GET` | `/api/inventory/supplier-visits/scope` | `SupplierDirectVisitsController.GetSupplierScope` | JSON DTO / ProblemDetails |
| `POST` | `/api/inventory/supplier-visits/export-excel` | `SupplierDirectVisitsController.ExportExcel` | JSON DTO / ProblemDetails |
| `POST` | `/api/inventory/supplier-visits/import-preview` | `SupplierDirectVisitsController.ImportPreview` | JSON DTO / ProblemDetails |
| `POST` | `/api/inventory/supplier-visits/preview-lines` | `SupplierDirectVisitsController.PreviewLines` | JSON DTO / ProblemDetails |
| `POST` | `/api/inventory/supplier-visits/confirm` | `SupplierDirectVisitsController.Confirm` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `StockOnHand`, `BranchStock`, `GoodsReceipt`, `SupplierReturn`, `SupplierAPLedger`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
