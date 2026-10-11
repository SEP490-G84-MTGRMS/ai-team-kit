# Tasks: master-supplier-management

## DB (Database & Persistence)
- [ ] T1 — Tạo EF Core Entity configurations & Migration cho `SupplierCategories`, `Suppliers`, và `SupplierAPLedgers` (kèm Global Query Filter `TenantId`, Unique Indexes, FKs) (REQ-01, REQ-04, REQ-06)
- [ ] T16 — Tạo EF Core Entity configurations & Migration cho `SupplierDeliveryConfigs` và `SupplierBlackoutDates` (REQ-DEL01, REQ-DEL02)

## Backend — Domain & Application Layer
- [ ] T2 — Định nghĩa Entities (`Supplier`, `SupplierCategory`, `SupplierAPLedger`) và Enums (`SupplierType`, `SupplierStatus`, `APDocType`) trong `MT_GRMS.Domain` (REQ-01, REQ-02, REQ-03)
- [ ] T3 — Xây dựng DTOs (`SupplierSummaryDto`, `SupplierDetailDto`, `SupplierAPLedgerDto`) và FluentValidation Validators trong `MT_GRMS.Application` (REQ-01, REQ-02)
- [ ] T4 — Cài đặt Command Handler `CreateSupplier` (tự sinh mã `SUP-...`, kiểm tra trùng mã cùng Tenant) (REQ-01, REQ-06)
- [ ] T5 — Cài đặt Command Handler `UpdateSupplier` (kiểm tra quy tắc thu hẹp BR-S07) (REQ-02)
- [ ] T6 — Cài đặt Command Handler `UpdateSupplierStatus` & `DeleteSupplier` (chặn Inactive/Delete BR-S03) (REQ-03)
- [ ] T7 — Cài đặt Command Handler `RecordAPTransaction` (transactional log + cập nhật `CurrentDebt` + IdempotencyKey BR-S08) (REQ-04)
- [ ] T8 — Cài đặt Command Handler `LinkCustomer` cho đối tác kép (Dual-role BR-S11) (REQ-05)
- [ ] T9 — Cài đặt Query Handlers `GetSuppliersList` (phân trang, lọc multi-condition) và `GetAPLedger` (REQ-01, REQ-04)
- [ ] T17 — Cài đặt DTOs, Command & Query Handlers cho Cấu hình giao hàng & Ngày nghỉ lễ (`GetSupplierDeliveryConfig`, `UpdateSupplierDeliveryConfig`) trong `MT_GRMS.Application` (REQ-DEL01, REQ-DEL02)

## Backend — API Layer
- [ ] T10 — Xây dựng `SuppliersController` với đầy đủ Endpoints CRUD, Status, AP Ledger, JWT Authorization, RFC 7807 ProblemDetails (REQ-01 đến REQ-06)
- [ ] T18 — Bổ sung Endpoints Cấu hình giao hàng & Ngày nghỉ lễ (`GET/PUT /api/v1/suppliers/{id}/delivery-config`) vào `SuppliersController` (REQ-DEL01, REQ-DEL02)

## Frontend — State & UI Components
- [x] T11 — Định nghĩa Types, TanStack Query Hooks (`useSuppliers`, `useSupplierDetail`, `useAPLedger`, `useCreateSupplier`, ...) trong `src/features/supplier/` (REQ-01 đến REQ-05)
- [x] T12 — Xây dựng màn hình `SupplierListPage` (Stat cards bo góc 24px, Filter bar, KiotViet Data Table với Full Pill badges) (REQ-01, REQ-06)
- [x] T13 — Xây dựng Modal `SupplierFormModal` (3 tabs: General, Terms & Credit Limit, Bank accounts) (REQ-01, REQ-02)
- [x] T14 — Xây dựng màn hình chi tiết toàn màn hình `SupplierDetailPage` (Header actions, Stat cards bo góc 24px, 5 tabs: Hồ sơ chung, Giao hàng & Cutoff, Ngày nghỉ lễ, Công nợ & Sổ cái AP, Lịch sử giao dịch) (REQ-03, REQ-04, REQ-05)
- [x] T14b — Xây dựng tab Cài đặt Giao hàng & Cutoff (`SupplierDeliveryConfigTab`) và tab Ngày nghỉ lễ riêng biệt (`SupplierHolidaysTab`) kèm tính toán ngày giao mô phỏng (REQ-DEL01, REQ-DEL02)

## Test & Verification
- [ ] T15 — Viết xUnit Unit Tests trong `MT_GRMS.UnitTests` bao phủ các Scenarios GHERKIN của REQ-01 đến REQ-06 (Duplicate code, Type narrowing BR-S07, Inactivation guard BR-S03, AP Ledger Idempotency BR-S08, Dual-role BR-S11, Tenant Isolation)
- [ ] T19 — Viết xUnit Unit Tests kiểm thử logic tính ngày hẹn giao sớm nhất (`EarliestDeliveryDate`) theo Lead Time, Cutoff Time, Weekdays và Blackout Dates (REQ-DEL01, REQ-DEL02)
