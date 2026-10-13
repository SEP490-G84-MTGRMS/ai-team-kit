# Proposal: refactor-shared-table-pagination

## 1. Vấn đề của code hiện tại (Problem Statement)
- **Phân mảnh giao diện & trải nghiệm người dùng (UX Inconsistency):** Mỗi phân hệ (Admin Tenants, Supplier FE-01, Service Expenses FE-07, Customer CRM FE-08) đang tự triển khai phân trang theo một kiểu riêng:
  - `TenantDataTable.tsx` (Admin): Hardcode tĩnh danh sách nút trang (`1, 2, 3 ... 7`), không hỗ trợ chọn số dòng/trang, không có nút Trước/Sau.
  - `SupplierTable.tsx` (FE-01): Có dropdown chọn dòng nhưng thiếu hoàn toàn nút điều hướng Trước/Sau (`<` / `>`). Dùng tên prop `pageIndex` thay vì chuẩn chung.
  - `SupplierProductTable.tsx`: Viết 100% inline style trực tiếp trong JSX, thiếu bộ chọn kích thước trang (`pageSize`).
  - `ExpenseTable.tsx` (FE-07): Dùng class CSS riêng `.expense-pagination`, chỉ có 2 nút `<` và `>` với text tĩnh `Trang X / Y`, không có nút số trang bấm trực tiếp và không có bộ chọn số dòng.
  - `CustomerTable.tsx` (FE-08): Chưa có phân trang, render trực tiếp toàn bộ dữ liệu.
- **Lặp mã nguồn & Khó bảo trì:** Thiếu thư mục thành phần cơ bản (`src/components/common/`), dẫn đến việc code phân trang bị sao chép hoặc viết lại mỗi khi xây dựng tính năng mới.

## 2. Mục tiêu (Goals & Value Proposition)
- Xây dựng component dùng chung **`TablePagination`** duy nhất tại `src/components/common/TablePagination/` chuẩn hóa 100% UI, logic và TypeScript interface.
- Cung cấp trải nghiệm phân trang tiêu chuẩn doanh nghiệp (Enterprise Data Grid):
  - Hiển thị dải số liệu: `Hiển thị {from} - {to} trên tổng số {total} {itemLabel}`.
  - Dropdown chọn số dòng / trang linh hoạt (`10, 20, 50, 100 dòng / trang`).
  - Nút điều hướng Trước (`<`) và Sau (`>`) kèm tooltip/aria-label rõ ràng.
  - Thuật toán sinh dãy nút trang thông minh tự động chèn dấu ba chấm `...` khi tổng số trang lớn (VD: `1 ... 4 5 6 ... 20`).
  - Đồng bộ hoàn toàn theo hệ thống Design Tokens của dự án (`var(--blue-primary)`, `var(--bg-soft-blue)`, `var(--border-mid)`, font mono).
- Tái cấu trúc và tích hợp thay thế toàn diện trên tất cả các bảng dữ liệu trong hệ thống mà không làm thay đổi các hành vi nghiệp vụ gốc (Preserve Invariants).

## 3. Phạm vi (Scope)

### In-Scope
1. **Xây dựng Core Component `TablePagination`:**
   - Component chính `TablePagination.tsx` và stylesheet `TablePagination.css`.
   - Thuật toán sinh dải phân trang `pagination.utils.ts` (xử lý logic dấu `...`, sibling count).
   - Thư mục export chuẩn `src/components/common/index.ts`.
2. **Refactor & Tích hợp vào các bảng:**
   - `CustomerTable.tsx` & `useCustomerCrm.ts` (FE-08): Bổ sung phân trang hoàn chỉnh cho màn hình Quản lý khách hàng.
   - `ExpenseTable.tsx` (FE-07): Thay thế cụm phân trang cũ bằng `TablePagination`.
   - `SupplierTable.tsx` (FE-01): Chuẩn hóa props và thay thế bằng `TablePagination`.
   - `SupplierProductTable.tsx`: Thay thế đoạn mã inline style bằng `TablePagination`.
   - `TenantDataTable.tsx` (Admin): Loại bỏ hardcode tĩnh, tích hợp `TablePagination` động.
3. **Kiểm thử:**
   - Unit test kiểm tra thuật toán sinh dải phân trang (`pagination.utils.test.ts`).
   - Kiểm thử hiển thị và tương tác trên tất cả các bảng được refactor.

### Out-of-Scope
- Thay đổi cấu trúc API Backend hay DTO response phân trang của .NET Core Backend.
- Sửa đổi logic lọc (Filter), tìm kiếm (Search) hay sắp xếp (Sort) nghiệp vụ của các module.

## 4. Người dùng & Tác động (Target Users)
- **Người dùng cuối (Store Owner, Admin, Cashier, Staff):** Trải nghiệm nhất quán trên mọi màn hình; dễ dàng điều hướng dữ liệu lớn, linh hoạt chọn số dòng hiển thị theo kích thước màn hình.
- **Lập trình viên trong team:** Tái sử dụng component một cách dễ dàng, giảm thời gian code màn hình mới từ 30 phút xuống 1 dòng khai báo prop.

## 5. Tiêu chí thành công đo lường được (Success Criteria)
1. **Đồng bộ hóa 100%:** 5 bảng dữ liệu trọng yếu (`CustomerTable`, `ExpenseTable`, `SupplierTable`, `SupplierProductTable`, `TenantDataTable`) đều sử dụng chung một component `TablePagination`.
2. **Loại bỏ nợ kỹ thuật (Tech Debt):** Không còn bất kỳ mã inline style hay hardcode số trang tĩnh nào liên quan đến phân trang trong các component bảng.
3. **Chính xác thuật toán:** Thuật toán dải số trang hoạt động chính xác với mọi trường hợp (totalPages = 1, totalPages <= 7, và totalPages > 7 với trang hiện tại ở đầu, giữa, cuối).
4. **Bảo toàn chức năng (Zero Regression):** Mọi chức năng hiện tại của các bảng (chọn dòng, thao tác sửa/xóa/xem chi tiết) hoạt động bình thường, không sinh lỗi runtime hay lỗi TypeScript build.
