# EXP-2026-10-10-FE09: Master Supplier Management & AP Ledger Infrastructure

## 1. Problem Statement
Hệ thống MT-GRMS (Multi-Tenant Grocery Retail Management System) quản lý chuỗi siêu thị mini / bán lẻ tạp hóa đa chi nhánh hiện chưa có module quản lý Nhà cung cấp (Master Supplier) và Sổ cái Nợ phải trả (AP Ledger).
Điều này dẫn đến việc:
- Không thể lưu trữ thông tin Master Data của các nhà cung cấp thực phẩm tươi sống (Fresh), hàng khô (Ambient/FMCG), hàng đông lạnh (Frozen) và dịch vụ utility.
- Chưa có cơ chế theo dõi công nợ nhà cung cấp (AP), hạn mức tín dụng (Credit Limit), và thời hạn thanh toán (Payment Term).
- Chưa có cơ sở dữ liệu để ghi nhận nhập kho (GRN) và đơn đặt hàng (PO) liên kết với nhà cung cấp.

Mục tiêu của exploration này là khảo sát hiện trạng codebase, xác định giả định, rủi ro, và thiết kế phương án kỹ thuật cho module Quản lý Master Supplier & AP Ledger.

## 2. Context & Background
- **Dự án**: MT-GRMS (Clean Architecture .NET 8 Backend + React 19 Frontend).
- **Phân tích nghiệp vụ sẵn có**: Tài liệu `Analysis_FE09_Supplier.md` đã quy định 14 Use Cases (UC-09-01 đến UC-09-14) và 11 Quy tắc Nghiệp vụ (BR-S01 đến BR-S11).
- **Hiện trạng codebase**:
  - `MT_GRMS.Domain`: Đã có các subdomain `Catalog/`, `Finance/`, `Identity/`, `Inventory/`. Chưa có entity `Supplier`, `SupplierCategory`, `SupplierAPLedger`.
  - `MT_GRMS.Application`: Chưa có use case hay DTO liên quan đến Supplier.
  - `MT_GRMS.Infrastructure`: `ApplicationDbContext` chưa cấu hình DB set và EF Core Configuration cho Supplier.
  - `MT_GRMS.Api`: Chưa có `SuppliersController`.
  - Frontend: `MT_GRMS_FRONTEND` chưa có feature `src/features/supplier/`.

## 3. Constraints
1. **Kiến trúc & Công nghệ**:
   - Backend: Clean Architecture 4 tầng (.NET 8, EF Core 8, SQL Server).
   - Frontend: React 19, TypeScript, TanStack Query, Zustand, KiotViet Brand Blue style guide (`#0066FF`, `#F7FAFF`, `#00C2FF`, `#00C853`, `#FF9500`, `#FF3B30`), phông chữ `Be Vietnam Pro` + `JetBrains Mono` cho tiền tệ/mã.
2. **Multi-Tenancy**: Mọi query và command bắt buộc cô lập theo `TenantId` thông qua EF Core Global Query Filter và claim trong JWT token.
3. **Tiền tệ & Thời gian**: Tiền tệ lưu `decimal(18,2)` VND; Thời gian lưu UTC, hiển thị `Asia/Ho_Chi_Minh`.
4. **Bảo mật & Integrity**: Khóa ngoại và ràng buộc unique `(TenantId, Code)` ở cấp CSDL.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi request từ API Client đều gửi kèm JWT chứa Claim `tenant_id` hợp lệ.
- **[ASSUMPTION-02]**: Loại Nhà cung cấp bao gồm: `Goods` (Hàng hóa), `Service` (Dịch vụ), `Both` (Cả hai).
- **[ASSUMPTION-03]**: Công nợ AP được tăng khi ghi nhận Hóa đơn nhập hàng/Đột xuất (Direction = +1) và giảm khi lập Phếu chi thanh toán/Giảm giá hàng trả lại (Direction = -1).
- **[ASSUMPTION-04]**: Một đối tác có thể vừa là Nhà cung cấp vừa là Khách hàng (Dual-role), liên kết qua `LinkedCustomerId`, nhưng nợ AR và nợ AP giữ độc lập, không tự động cấn trừ.

## 5. Scope & Non-Goals
### In Scope
- Quản lý danh mục nhóm NCC (Supplier Categories): CRUD, gán mã, tên.
- Quản lý hồ sơ Master Supplier: Tạo mới, cập nhật, đổi trạng thái (Active/Inactive), tìm kiếm/lọc nâng cao.
- Kiểm tra quy tắc thu hẹp Loại NCC (BR-S07): Không cho đổi loại thu hẹp (VD: `Both` -> `Goods`) khi đã có giao dịch loại hình tương ứng.
- Ngăn chặn hard-delete NCC khi đã phát sinh PO/GRN/Công nợ (BR-S03).
- Sổ cái công nợ AP Ledger (Supplier AP Ledger): Ghi nhận biến động công nợ có `IdempotencyKey` phòng trùng lặp (BR-S08).
- Liên kết với Hồ sơ Khách hàng (Dual-role linkage) (BR-S11).

### Out of Scope (Non-Goals)
- Tự động cấn trừ công nợ giữa AR (Phải thu khách hàng) và AP (Phải trả nhà cung cấp).
- Phê duyệt đa cấp (Multi-level Approval Workflow) cho thanh toán NCC.
- Đổi loại tiền tệ khác ngoại trừ VND.

## 6. Technical Options Analysis

### Phương án 1: Monolithic Single Table & Direct Debt Field Updates
- **Mô tả**: Lưu thông tin NCC và số nợ hiện tại `CurrentDebt` trên duy nhất bảng `Suppliers`. Mỗi lần nhập hàng hoặc thanh toán thì update trực tiếp `CurrentDebt = CurrentDebt + X`.
- **Ưu điểm**: Đơn giản, dễ code nhanh.
- **Nhược điểm**:
  - Không có vết audit trail lịch sử công nợ (AP Ledger Log).
  - Rủi ro sai lệch công nợ do Race Condition / Concurrent Writes.
  - Không đảm bảo tính Idempotent khi retry API giao dịch.

### Phương án 2 (ĐƯỢC CHỌN): Clean Architecture Subdomain `Supplier` với Transactional AP Ledger Log & Idempotency Key
- **Mô tả**:
  - Tạo subdomain `MT_GRMS.Domain/Entities/SupplierAggregate/` gồm `Supplier`, `SupplierCategory`, `SupplierAPLedger`.
  - Cập nhật công nợ `CurrentDebt` đồng thời ghi log vào `SupplierAPLedger` trong cùng một Database Transaction.
  - Áp dụng `IdempotencyKey` cho các giao dịch biến động nợ để chống ghi trùng.
  - Áp dụng Specification / Domain Event hoặc Application Service validation cho các quy tắc BR-S03, BR-S07, BR-S11.
- **Ưu điểm**:
  - Đảm bảo tính toàn vẹn dữ liệu công nợ 100%, dễ dàng đối soát (Reconciliation).
  - Chuẩn Clean Architecture & Multi-tenant cô lập hoàn toàn.
  - Phù hợp với toàn bộ quy tắc nghiệp vụ trong `Analysis_FE09_Supplier.md`.
- **Nhược điểm**: Cần tạo EF Core migration và bổ sung bộ test xUnit cho Concurrency & AP Ledger calculation.

## 7. Risks & Mitigations
- **Rủi ro 1: Concurrency Conflict khi 2 giao dịch cập nhật công nợ cùng lúc.**
  - *Mitigation*: Sử dụng Concurrency Token (`RowVersion` / EF Core Optimistic Concurrency) hoặc SQL Row Lock khi cập nhật `CurrentDebt`.
- **Rủi ro 2: Idempotent Key bị gửi lặp lại gây khóa transaction.**
  - *Mitigation*: Sử dụng Unique Index `(TenantId, IdempotencyKey)` trên bảng `SupplierAPLedgers` và bắt lỗi `DbUpdateException` để trả kết quả idempotent thành công.
