# EXP-2026-10-13-SHARED-PAGINATION: Khảo sát và Tái Cấu Trúc Component Phân Trang Dùng Chung (TablePagination)

## 1. Bản đồ Code Bị Ảnh Hưởng (Impact Map)
Hiện tại dự án có 5 bảng dữ liệu độc lập đang tự triển khai phân trang:
1. `src/features/customer-crm/components/CustomerTable.tsx` (FE-08): Chưa có phân trang, đang render 100% danh sách. Caller: `CustomerManagementPage.tsx`.
2. `src/features/service-expenses/components/ExpenseTable.tsx` (FE-07): Dùng CSS riêng `.expense-pagination`, chỉ có nút Prev/Next và text `Trang X / Y`. Caller: `ExpenseManagementPage.tsx`.
3. `src/features/supplier/components/SupplierTable.tsx` (FE-01): Dùng `.admin-pagination-footer`, có chọn pageSize nhưng thiếu nút Prev/Next. Caller: `SupplierListPage.tsx`.
4. `src/features/supplier/components/products/SupplierProductTable.tsx`: Viết 100% inline CSS trong JSX, thiếu chọn pageSize. Caller: `SupplierDetailPage.tsx`.
5. `src/features/admin/components/tenants/TenantDataTable.tsx` (Admin): Hardcode tĩnh số trang `1, 2, 3 ... 7`. Caller: `TenantsPage.tsx`.

## 2. Hiện Trạng & Ràng Buộc Kỹ Thuật (Constraints)
- **Công nghệ:** React 19, TypeScript, Lucide React icons, CSS variables / tokens định nghĩa sẵn trong `src/styles/admin.css` và `src/index.css`.
- **Ràng buộc:**
  - Không phá vỡ bất biến nghiệp vụ: Dữ liệu lọc, tìm kiếm và callback của các màn hình phải giữ nguyên 100%.
  - Hiển thị mượt mà trên cả desktop và tablet (responsive khi màn hình hẹp thì thu gọn hoặc bọc xuống dòng gọn gàng).
  - Không cài thêm thư viện UI nặng (giữ kiến trúc Vanilla CSS / Design Tokens hiện có).

## 3. Giả định (Assumptions)
- `[ASSUMPTION-01]`: Tất cả các màn hình danh sách đều có thể chuẩn hóa về bộ 3 thông số phân trang cơ bản: `currentPage` (bắt đầu từ 1), `pageSize` (mặc định 10 hoặc 20), và `totalItems`.
- `[ASSUMPTION-02]`: Bộ chọn số dòng hợp lý nhất cho người dùng là `[10, 20, 50]` dòng / trang.

## 4. Các Phương Án Kỹ Thuật (Evaluation of Options)

### Phương án A: All-in-One Controlled Component (`<TablePagination />`) (Đề xuất)
- **Thiết kế:** Tạo duy nhất một component `<TablePagination />` nhận props chuẩn (`currentPage`, `pageSize`, `totalItems`, `onPageChange`, `onPageSizeChange`, `itemLabel`). Logic sinh dải trang (có `...`) được xử lý bởi helper thuần túy `pagination.utils.ts`.
- **Ưu điểm:**
  - Tối giản tối đa: Chỉ cần 1 dòng JSX ở cuối bất kỳ bảng nào là có đầy đủ bộ chọn dòng, thông tin tổng số, nút điều hướng Prev/Next và dải số trang.
  - Đảm bảo 100% tính đồng nhất về giao diện (UI) và hành vi (UX) trên mọi màn hình.
  - Dễ viết unit test độc lập cho helper và component.
- **Nhược điểm:** Ít tùy biến vị trí các nút con (nhưng dự án cần đồng bộ 1 kiểu nên đây lại là lợi thế).

### Phương án B: Compound Component Pattern (`<Pagination.Root>`, `<Pagination.Pages>`, ...)
- **Thiết kế:** Chia nhỏ thành các component con và custom hook `usePagination`.
- **Ưu điểm:** Cho phép tự do sắp xếp thứ tự từng nút trên từng trang khác nhau.
- **Nhược điểm:** Boilerplate dài dòng, vi phạm mục tiêu "đồng bộ 1 kiểu duy nhất", dễ bị lệch UI nếu mỗi trang sắp xếp một kiểu.

➔ **Lựa chọn:** **Phương án A** (All-in-One Component) để đảm bảo đồng nhất tuyệt đối và giảm thiểu code lặp.

## 5. Kế Hoạch Từng Bước Nhỏ (Phased Plan)
- **Bước 1:** Viết helper `pagination.utils.ts` và unit test `pagination.utils.test.ts` (kiểm tra dãy số trang khi tổng trang <= 7, khi ở đầu, giữa, cuối).
- **Bước 2:** Xây dựng `TablePagination.tsx` và stylesheet `TablePagination.css` dùng design tokens.
- **Bước 3:** Export qua `src/components/common/index.ts`.
- **Bước 4:** Refactor tích hợp từng bảng:
  - 4.1. `CustomerTable.tsx` (FE-08) + cập nhật state trong `useCustomerCrm`.
  - 4.2. `ExpenseTable.tsx` (FE-07).
  - 4.3. `SupplierTable.tsx` (FE-01).
  - 4.4. `SupplierProductTable.tsx`.
  - 4.5. `TenantDataTable.tsx`.
- **Bước 5:** Chạy kiểm tra build và test xanh (`npm test` / `npm run build`).

## 6. Rủi ro & Cách Giảm Thiểu (Risks & Mitigation)
- **Rủi ro:** Khi đổi `pageSize`, trang hiện tại có thể vượt quá `totalPages` mới.
  - *Giảm thiểu:* Tự động reset về trang 1 hoặc tính lại `Math.min(currentPage, newTotalPages)` khi `pageSize` thay đổi.
- **Rủi ro:** Một số component đang đặt tên `pageIndex` (bắt đầu từ 1) thay vì `page` hoặc `currentPage`.
  - *Giảm thiểu:* Chuẩn hóa props rõ ràng, adapter mapping nhẹ nhàng nếu cần để không phá vỡ hook cha.
