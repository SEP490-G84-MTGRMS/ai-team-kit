# Tasks: grn-list

## Backend
- [x] B1 — Endpoint `GET /api/v1/goods-receipts`: Hỗ trợ lọc theo `branchId`, `supplierId`, `status` (`DRAFT`, `COMPLETED`, `CANCELLED`), tìm kiếm `keyword` theo mã phiếu, mã PO, tên NCC, phân trang `pageIndex`, `pageSize`
- [x] B2 — Endpoint `GET /api/v1/goods-receipts/{id}`: Trả về chi tiết phiếu nhập kho
- [x] B3 — Unit Test truy vấn danh sách phiếu nhập kho có phân trang và lọc chi nhánh

## Frontend
- [x] T1 — Tạo kiểu dữ liệu `GoodsReceiptListItem`, `GrnItemDetail`, `GrnFilterState`, `GrnStatus` trong `src/features/goods-receipt/types/grn.types.ts` (REQ-01, REQ-02)
- [x] T2 — Xây dựng API client `goodsReceiptApi.ts` & Mock Data `mockGrnData.ts` gồm 12 bản ghi chuẩn prototype với đầy đủ trạng thái TODAY, DRAFT, COMPLETED, MISMATCH, CANCELLED kèm chi tiết SKU và Lô hạn FEFO (REQ-01, REQ-05)
- [x] T3 — Phát triển component `GrnQuickTabs.tsx` với 4 thẻ chuyển nhanh kèm badge đếm số lượng bản ghi tương ứng (REQ-03)
- [x] T4 — Phát triển component `GrnFilterBar.tsx` dạng `po-unified-bar` gồm Ô tìm kiếm, Dropdown Chi nhánh (khóa khi ở role Employee), Nhà cung cấp, Trạng thái, Khoảng ngày, nút Tìm kiếm và Đặt lại (REQ-02, REQ-04)
- [x] T5 — Phát triển component `GrnTable.tsx` hiển thị bảng 11 cột dữ liệu, sticky header, sắp xếp cột, semantic status badges và footer phân trang linh hoạt (REQ-01, REQ-06)
- [x] T6 — Phát triển component `GrnDetailDrawer.tsx` trượt từ bên phải hiển thị đối soát số lượng đặt theo PO vs thực nhận, chênh lệch số lượng, đơn giá, thành tiền, Lô & HSD FEFO (REQ-05)
- [x] T7 — Phát triển trang container `GoodsReceiptListPage.tsx` quản lý bộ lọc, phân trang, Drawer chi tiết, Toast thông báo và Role Switcher kiểm thử 2 vai trò Store Owner & Employee (REQ-01, REQ-02, REQ-03, REQ-04)
- [x] T8 — Đăng ký route `/store-owner/goods-receipts` và `/employee/goods-receipts` trong `src/app/router.tsx`, cập nhật menu "Nhập hàng" trong `AppTopNav.tsx` (REQ-01, REQ-02)

## Verification & Build
- [x] T9 — Kiểm tra biên dịch `npm run build` đảm bảo không có lỗi TypeScript hoặc lint (REQ-01 đến REQ-06)
- [x] T10 — Kiểm thử đầy đủ các luồng nghiệp vụ trên UI: phân quyền theo vai trò, lọc nhanh theo tab, lọc đa tiêu chí, mở drawer đối soát PO, đóng drawer, phân trang (REQ-01 đến REQ-06)
- [x] T11 — Chạy dotnet test MT_GRMS.UnitTests đạt 100% PASS (64/64 tests)
