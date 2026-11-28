# Design Brief: Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD) (`household-tax-snapshot`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/tax-snapshots`, `/store-owner/tax`, `/store-owner/accounting-books`, `/tax-snapshots`
- **Entry Page**: `src/features/tax-snapshot/pages/TaxSnapshotPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `TaxOverviewCard`
  - `AccountingBooksView`
  - `TaxDeclarationFormView`
  - `TaxSnapshotsHistoryView`
  - `CreateTaxSnapshotModal`
  - `SecurityPinModal`
  - `TaxRateConfigModal`
  - `TaxSnapshotDetailDrawer`
  - `TaxDeclarationPreviewModal`
  - `TaxExportModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/tax/household/summary` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/books` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/declarations/01-cnkd/preview` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/snapshots/{id:guid}/declaration-xml` | `HouseholdTaxController.ExportDeclarationXml` | JSON DTO / ProblemDetails |
| `POST` | `/api/tax/household/snapshots` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/snapshots` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/snapshots/{id:guid}` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tax/household/snapshots/{id:guid}/verify-integrity` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/tax/household/pin/change` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/tax/household/pin/reset` | `HouseholdTaxController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `HouseholdTaxSnapshot`, `TaxFilingConfirmation`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
