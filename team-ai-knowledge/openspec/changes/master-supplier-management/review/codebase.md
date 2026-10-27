# Codebase Review: master-supplier-management

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|
| REQ-RBAC-01 | `ITenantContext` có TenantId/BranchId, không có Role | Middleware đọc claim; service lọc assignment | `UserProfile.role`: STORE_OWNER/ADMIN/MANAGER/CASHIER |
| REQ-LIST-01 | `SupplierListPage`, `SupplierFilterBar`, `SupplierTable` | Filter loại NCC; search MST; cột; bỏ mock | `GetPagedListAsync` chỉ Name/Code/Phone |
| REQ-01 | `CreateSupplierAsync` tự sinh mã nếu trống | UI ẩn nhập mã | |
| REQ-03 | `UpdateStatusAsync` ném nợ AP | Cho Inactive + cảnh báo PO | Test cũ sẽ fail |
| REQ-PAY-01 | Field PaymentTermDays, CreditLimit, bank | Validate >=0 đã có một phần | |
| REQ-DEL01 | `LeadTimeHours`, `CutoffTime` | Thêm LeadTimeDays, CutoffDayOffset, OrderCutoffTime | Migration mới |
| REQ-DEL02 | `SupplierBlackoutDate` + HolidaysTab mock | Nối API | |
| REQ-BRANCH-01 | Không thấy entity | `SupplierBranchAssignment` + API | |
| REQ-HIST-01 | `SupplierHistoryTab` + MOCK_PURCHASE_ORDERS | API transactions | |
| REQ-AP-VIEW-01 | `CurrentDebt` trên SummaryDto; PayablesTab mock | `/ap/summary`; ẩn list AP | |
| REQ-NORETro-01 | PO snapshot thuộc FE-05 | Không đổi giá dòng PO trong change này | |

## Tái sử dụng được
- `MT_GRMS_FRONTEND/src/features/supplier/pages/SupplierListPage.tsx` — layout list.
- `MT_GRMS_BACKEND/src/MT_GRMS.Application/Suppliers/SupplierService.cs` — CRUD.
- `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/SupplierRepository.cs` — paging.
- `SupplierFormModal.tsx`, `SupplierDetailPage.tsx` — cần nối API, không viết mới.
- `supplier-product-management` — FE-09.09.

## Xung đột / rủi ro
- [HIGH] `supplierApi.getSuppliers` fallback `INITIAL_SUPPLIERS` khi API lỗi — trái REQ-LIST-01.
- [HIGH] `SupplierSummaryDto` không có `ContactPerson`; list dễ trống cột liên hệ.
- [HIGH] Chưa có `SupplierBranchAssignment` — FE-09.10/RBAC không làm được chỉ bằng UI.
- [HIGH] `UpdateStatusAsync` chặn Inactive khi `CurrentDebt>0` — trái REQ-03 mới.
- [MEDIUM] `SupplierDetailPage` đọc mock, không `getSupplierById`.
- [MEDIUM] FilterBar có `supplierType` trong state nhưng không render select loại NCC; có filter category/debt trái FE-09.01.

## Kết luận: Khả thi
