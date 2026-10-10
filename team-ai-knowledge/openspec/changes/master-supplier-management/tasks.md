# Tasks: master-supplier-management

## DB (Database & Persistence)
- [ ] T1 — Tạo EF Core Entity configurations & Migration cho `SupplierCategories`, `Suppliers`, và `SupplierAPLedgers` (kèm Global Query Filter `TenantId`, Unique Indexes, FKs) (REQ-01, REQ-04, REQ-06)

## Backend — Domain & Application Layer
- [ ] T2 — Định nghĩa Entities (`Supplier`, `SupplierCategory`, `SupplierAPLedger`) và Enums (`SupplierType`, `SupplierStatus`, `APDocType`) trong `MT_GRMS.Domain` (REQ-01, REQ-02, REQ-03)
- [ ] T3 — Xây dựng DTOs (`SupplierSummaryDto`, `SupplierDetailDto`, `SupplierAPLedgerDto`) và FluentValidation Validators trong `MT_GRMS.Application` (REQ-01, REQ-02)
- [ ] T4 — Cài đặt Command Handler `CreateSupplier` (tự sinh mã `SUP-...`, kiểm tra trùng mã cùng Tenant) (REQ-01, REQ-06)
- [ ] T5 — Cài đặt Command Handler `UpdateSupplier` (kiểm tra quy tắc thu hẹp BR-S07) (REQ-02)
- [ ] T6 — Cài đặt Command Handler `UpdateSupplierStatus` & `DeleteSupplier` (chặn Inactive/Delete BR-S03) (REQ-03)
- [ ] T7 — Cài đặt Command Handler `RecordAPTransaction` (transactional log + cập nhật `CurrentDebt` + IdempotencyKey BR-S08) (REQ-04)
- [ ] T8 — Cài đặt Command Handler `LinkCustomer` cho đối tác kép (Dual-role BR-S11) (REQ-05)
- [ ] T9 — Cài đặt Query Handlers `GetSuppliersList` (phân trang, lọc multi-condition) và `GetAPLedger` (REQ-01, REQ-04)

## Backend — API Layer
- [ ] T10 — Xây dựng `SuppliersController` với đầy đủ Endpoints, JWT Authorization, RFC 7807 ProblemDetails (REQ-01 đến REQ-06)

## Frontend — State & UI Components
- [x] T11 — Định nghĩa Types, TanStack Query Hooks (`useSuppliers`, `useSupplierDetail`, `useAPLedger`, `useCreateSupplier`, ...) trong `src/features/supplier/` (REQ-01 đến REQ-05)
- [x] T12 — Xây dựng màn hình `SupplierListPage` (Stat cards bo góc 24px, Filter bar, KiotViet Data Table với Full Pill badges) (REQ-01, REQ-06)
- [x] T13 — Xây dựng Modal `SupplierFormModal` (3 tabs: General, Terms & Credit Limit, Bank accounts) (REQ-01, REQ-02)
- [x] T14 — Xây dựng Drawer `SupplierDetailDrawer` (Tab thông tin chung, Tab Sổ cái AP Ledger, Link Customer button) (REQ-03, REQ-04, REQ-05)

## Test & Verification
- [ ] T15 — Viết xUnit Unit Tests trong `MT_GRMS.UnitTests` bao phủ các Scenarios GHERKIN của REQ-01 đến REQ-06 (Duplicate code, Type narrowing BR-S07, Inactivation guard BR-S03, AP Ledger Idempotency BR-S08, Dual-role BR-S11, Tenant Isolation)
