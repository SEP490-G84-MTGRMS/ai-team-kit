# Tasks: supplier-store-assignment (Refactor Popup Phân Bổ)

## 1. Đã xong từ giai đoạn trước (Giữ nguyên)
- [x] T1 — DTOs Supplier Store/Branch Assignment (QueryFilter, DetailDto)
- [x] T2 — Endpoint `GET /api/v1/suppliers/branch-assignments` phân trang và lọc
- [x] T3 — Hủy gán `DELETE /suppliers/{id}/branches/{branchId}` & Đổi trạng thái `PATCH .../status`
- [x] T4 — Trang chính `SupplierBranchManagementPage.tsx` và bảng `SupplierBranchTable.tsx`
- [x] T5 — Bộ lọc `SupplierBranchFilterBar.tsx`

## 2. Refactor Backend (Luồng Gán Nhiều NCC Cho Chi Nhánh)
- [x] T6 — DTO `AssignSuppliersToBranchCommand` `{ BranchId, SupplierIds }` và validation
- [x] T7 — Application Service & Repository: Cài đặt `AssignSuppliersToBranchAsync` với:
  * Validate Chi nhánh tồn tại, active, cùng Tenant (BR-01..03)
  * Validate danh sách NCC tồn tại, active (SUP-01, SUP-03, SUP-04)
  * Loại bỏ trùng ID (MAP-01)
  * Tái kích hoạt: Cặp đã tồn tại nhưng Inactive -> chuyển thành Active (MAP-06)
  * All-or-nothing trong 1 transaction (MAP-05)
- [x] T8 — Controller: Thêm endpoint `POST /api/v1/suppliers/branches/{branchId}/suppliers` hoặc `POST /api/v1/suppliers/branch-assignments/batch-to-branch`
- [x] T9 — Unit Tests: Viết test cases kiểm thử BR-01..04, SUP-01..05, MAP-01..06

## 3. Refactor Frontend (Popup Mới "Chọn 1 Chi Nhánh -> Thêm Nhiều NCC")
- [x] T10 — API Client `supplierBranchApi.ts`: Thêm `assignSuppliersToBranch(branchId, supplierIds)`
- [x] T11 — Refactor `AssignBranchModal.tsx`:
  * Bước 1: Chọn Cửa hàng / Chi nhánh từ Dropdown
  * Bước 2: Danh sách NCC khả dụng (loại trừ các NCC đã có liên kết Active với chi nhánh đang chọn)
  * Ô tìm kiếm tức thời mã/tên NCC (không phân biệt hoa thường)
  * Thẻ hiển thị NCC có checkbox `[ ]`, Tên, Mã, Người liên hệ, SĐT
  * Bộ đếm realtime: `Đã chọn: X nhà cung cấp`
  * Nút "Chọn tất cả" / "Bỏ chọn tất cả" trên danh sách đang hiển thị
  * Empty states: Khi chi nhánh đã gán hết NCC hoặc tìm kiếm không thấy
- [x] T12 — Cập nhật `SupplierBranchManagementPage.tsx`: Đấu nối mở modal mới và tự động reload danh sách phân bổ

## 4. Kiểm Thử & Nghiệm Thu
- [x] T13 — Chạy `dotnet test` Backend đạt 100% PASS (37/37 tests)
- [x] T14 — Chạy `npm run build` Frontend đạt 100% PASS (0 warning, 0 error)
