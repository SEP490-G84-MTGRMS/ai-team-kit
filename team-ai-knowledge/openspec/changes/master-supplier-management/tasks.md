# Tasks: master-supplier-management

## Đã xong (Apply trước — giữ nguyên)
- [x] T1 — EF config & migration SupplierCategories, Suppliers, SupplierAPLedgers (REQ-01, REQ-04, REQ-06)
- [x] T16 — EF config & migration SupplierDeliveryConfigs, SupplierBlackoutDates (REQ-DEL01, REQ-DEL02)
- [x] T2 — Entities + Enums Domain (REQ-01, REQ-02, REQ-03)
- [x] T3 — DTOs + FluentValidation (REQ-01, REQ-02)
- [x] T4 — CreateSupplier mã SUP-... (REQ-01, REQ-06)
- [x] T5 — UpdateSupplier BR-S07 (REQ-02)
- [x] T6 — UpdateSupplierStatus & Delete (cần chỉnh lại T22 theo REQ-03 mới)
- [x] T7 — RecordAPTransaction (REQ-04)
- [x] T8 — LinkCustomer (REQ-05)
- [x] T9 — GetSuppliersList + GetAPLedger (cần chỉnh T21 search MST)
- [x] T17 — Delivery config handlers (cần chỉnh T24 field mới)
- [x] T10 — SuppliersController CRUD (cần RBAC T20)
- [x] T18 — Endpoints delivery-config
- [x] T11–T14b — Frontend list/modal/detail skeleton
- [x] T15 — Unit tests REQ-01..06 (cần cập nhật T31 REQ-03)
- [x] T19 — Unit tests earliest delivery

## Delta FE-09 (Đã xong)
- [x] T20 — Migration `SupplierBranchAssignments` unique (TenantId, SupplierId, BranchId) + cột `LeadTimeDays`, `CutoffDayOffset`, `OrderCutoffTime` trên DeliveryConfig (không sửa migration cũ) (REQ-BRANCH-01, REQ-DEL01)
- [x] T21 — `SupplierSummaryDto.ContactPerson`; `GetPagedListAsync` search Name/Code/Phone/TaxCode; không gán CurrentDebt cho Branch Employee (REQ-LIST-01, REQ-AP-VIEW-01)
- [x] T22 — RBAC Application: Store Owner = STORE_OWNER|ADMIN; Employee + branchId lọc assignment/dùng chung; write 403; GET id ngoài phạm vi 404; bổ sung RoleName vào ITenantContext từ claim (REQ-RBAC-01)
- [x] T23 — UpdateStatus: cho Inactive khi còn nợ, trả `openPurchaseOrderCount`; Delete chặn khi có PO/GRN/ledger không chỉ CurrentDebt (REQ-03)
- [x] T24 — GET/PUT `/suppliers/{id}/branches`; validate Branch cùng Tenant; [] = dùng chung (REQ-BRANCH-01)
- [x] T25 — PUT delivery-config nhận LeadTimeDays, CutoffDayOffset (>=0), OrderCutoffTime HH:mm (REQ-DEL01, REQ-DEL02)
- [x] T27 — FilterBar: search mã/tên/SĐT/MST; select Loại NCC + Trạng thái; bỏ filter ngành và công nợ AP (REQ-LIST-01)
- [x] T28 — Table: cột Mã, Tên, Người liên hệ, SĐT, Trạng thái, Hành động; ẩn hạn nợ/đang nợ/quá hạn; ẩn nút Trả stub (REQ-LIST-01, REQ-AP-VIEW-01)
- [x] T29 — ListPage: role từ `useAuthStore` (STORE_OWNER|ADMIN vs khác); ẩn Thêm/Sửa với Employee; `getSuppliers` không fallback `INITIAL_SUPPLIERS`; error banner (REQ-LIST-01, REQ-RBAC-01)
- [x] T30 — FormModal: không nhập mã lúc tạo; tên bắt buộc; DueDays/CreditLimit >=0 (REQ-01, REQ-PAY-01)

## Delta Mới — Tìm kiếm Đa Thực Thể & Xuất Excel (Apply lần này)
- [x] T34 — Backend: API `GET /api/v1/suppliers/search-suggestions` trả về gợi ý phân nhóm (Suppliers, Products, ContactPersons, Phones) & Mở rộng `GET /api/v1/suppliers` hỗ trợ lọc theo mảng `SupplierIds`, `ProductIds`, `ContactPersons`, `Phones` (REQ-SEARCH-01)
- [x] T35 — Frontend: Phát triển bộ lọc Auto-complete Dropdown với Text Highlighting (`highlightMatch`) và thẻ Multi-select Tags / Chips (chọn nhiều NCC, SP, Người liên hệ, SĐT) trên `SupplierFilterBar` (REQ-SEARCH-01)
- [x] T36 — Frontend: Triển khai tính năng Xuất Excel chuyên nghiệp (`exportSuppliersToExcel`) gồm Header báo cáo, Bảng dữ liệu viền nét màu KiotViet Blue `#0066FF`, căn lề và tự động tính độ rộng cột (Auto Column Widths) trên `SupplierListPage` (REQ-EXPORT-01)
- [x] T26 — Backend: GET `/suppliers/{id}/ap/summary` Store Owner 403 Employee; GET `/suppliers/{id}/transactions` scope chi nhánh, rỗng thì empty không mock (REQ-AP-VIEW-01, REQ-HIST-01)
- [x] T31 — Frontend: DetailPage: load API thật; tab Chi nhánh (Store Owner); tab Công nợ chỉ Store Owner; lịch sử không mock; bỏ footer minh họa (REQ-BRANCH-01, REQ-HIST-01, REQ-AP-VIEW-01)

## Test & Verification
- [x] T32 — Cập nhật/bổ sung unit tests cho tìm kiếm đa thực thể, search-suggestions, RBAC 403/404 và export logic (REQ-03, REQ-SEARCH-01, REQ-EXPORT-01, REQ-RBAC-01)
- [x] T33 — Chạy `dotnet test` Backend và `npm run lint` / `npm run build` Frontend đạt 100% PASS
