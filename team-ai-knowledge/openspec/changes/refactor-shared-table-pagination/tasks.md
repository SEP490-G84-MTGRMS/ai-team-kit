# Tasks: refactor-shared-table-pagination

- [ ] T1: Xây dựng helper thuần túy `pagination.utils.ts` sinh dải số trang và unit test `pagination.utils.test.ts`
- [ ] T2: Xây dựng component `TablePagination.tsx`, stylesheet `TablePagination.css` và export qua `src/components/common/index.ts`
- [ ] T3: Tích hợp phân trang vào `CustomerTable.tsx` & `useCustomerCrm.ts` (FE-08)
- [ ] T4: Thay thế phân trang cũ trong `ExpenseTable.tsx` (FE-07) bằng `TablePagination`
- [ ] T5: Thay thế phân trang trong `SupplierTable.tsx` và `SupplierProductTable.tsx` (FE-01) bằng `TablePagination`
- [ ] T6: Loại bỏ hardcode tĩnh trong `TenantDataTable.tsx` (Admin), tích hợp `TablePagination` động
- [ ] T7: Chạy lint, test suite và build xác nhận không có lỗi biên dịch hoặc suy giảm chức năng
