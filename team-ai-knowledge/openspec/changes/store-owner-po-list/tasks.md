# Tasks: store-owner-po-list

## Frontend
- [ ] T1 — Tạo kiểu dữ liệu `PurchaseOrderListItem`, `PurchaseOrderItemDetail`, `PoListFilterState` trong `src/features/purchase-order/types/po-list.types.ts` (REQ-01, REQ-02)
- [ ] T2 — Xây dựng Mock Data phong phú `mockPoListData.ts` với các đơn hàng PO đa dạng trạng thái SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED (REQ-01, REQ-05)
- [ ] T3 — Phát triển component `PoListFilterBar.tsx` với bộ lọc hợp nhất gồm Chi nhánh, Nhà cung cấp, Trạng thái PO, Khoảng ngày, Ô tìm kiếm và nút Tìm kiếm/Đặt lại (REQ-02)
- [ ] T4 — Phát triển component `PoListTable.tsx` hiển thị bảng 10 cột dữ liệu, sticky header, sort indicators, badge màu trạng thái và footer phân trang (REQ-01, REQ-03, REQ-05)
- [ ] T5 — Phát triển component `PoDetailDrawer.tsx` trượt từ bên phải hiển thị danh sách chi tiết mặt hàng, số lượng đặt, đơn giá, thành tiền và ghi chú đơn hàng (REQ-04)
- [ ] T6 — Tích hợp container page `StoreOwnerPurchaseOrderListPage.tsx`, quản lý state bộ lọc, phân trang, hiển thị Drawer chi tiết và thông báo Toast (REQ-01, REQ-02, REQ-03, REQ-04)
- [ ] T7 — Đăng ký route `/store-owner/purchase-orders/list` và alias trong `src/app/router.tsx`, export các components trong `src/features/purchase-order/index.ts` (REQ-01)
- [ ] T8 — Bổ sung liên kết điều hướng từ màn hình Chi nhánh (`BranchOrderListPage`) nút "Lịch sử đơn hàng" chuyển sang màn hình danh sách PO (REQ-01)

## Verification & Build
- [ ] T9 — Kiểm tra biên dịch `npm run build` đảm bảo không có lỗi TypeScript hoặc lint (REQ-01 đến REQ-05)
- [ ] T10 — Kiểm thử các luồng nghiệp vụ: lọc đa tiêu chí, phân trang, mở Drawer xem chi tiết PO, đóng drawer (REQ-01 đến REQ-05)
