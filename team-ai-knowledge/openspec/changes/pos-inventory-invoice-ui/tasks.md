# Danh sách Công việc Thực thi (Tasks) — pos-inventory-invoice-ui

- [x] Định nghĩa các class DTO cho tồn kho FEFO và hóa đơn bán lẻ trong `src/features/pos/types/inventory.types.ts`
- [x] Xây dựng Mock Data phong phú cho tồn kho chi nhánh, lô FEFO, hóa đơn bán lẻ và đơn đặt trước trong `src/features/pos/mock/inventoryMockData.ts`
- [x] Xây dựng CSS styling đồng bộ (`inventory.css`, `invoices.css`) chuẩn Deep Teal `#0F766E`, font Be Vietnam Pro, rounded pill
- [x] Xây dựng Màn hình Tra cứu tồn kho & Lô FEFO `src/features/pos/pages/InventoryLookupPage.tsx`
- [x] Xây dựng Màn hình Quản lý hóa đơn & Đơn đặt trước `src/features/pos/pages/InvoiceManagementPage.tsx` tái sử dụng `TablePagination`
- [x] Cập nhật Menu Hamburger `[ ≡ Thao tác ]` trong `src/features/pos/components/PosHeader.tsx`
- [x] Cập nhật định tuyến Routing trong `src/app/router.tsx` cho các path `/employee/inventory-lookup`, `/employee/orders` và alias `/pos/...`
- [x] Xác minh toàn bộ bằng lệnh `npm run build` đảm bảo không phát sinh lỗi TypeScript
