# Tasks: store-owner-inventory-list

## Frontend
- [ ] T1 — Khởi tạo module `src/features/inventory/` và định nghĩa DTO types (`inventory.types.ts`) (REQ-01, REQ-02, REQ-03, REQ-04)
- [ ] T2 — Xây dựng mock dataset 25+ sản phẩm đa chi nhánh (`BR-01`, `BR-02`), đầy đủ số liệu tồn và danh sách lô FEFO (`mockInventoryData.ts`) (REQ-01, REQ-03, REQ-04)
- [ ] T3 — Xây dựng component `InventoryKpiCards.tsx` hiển thị 5 thẻ chỉ số động theo bộ lọc (REQ-01)
- [ ] T4 — Xây dựng component `InventoryFilterBar.tsx` với dropdown Chi nhánh, Ngành hàng, Kệ, Trạng thái, ô tìm kiếm, nút Xuất Excel & In báo cáo (REQ-02, REQ-05)
- [ ] T5 — Xây dựng component `InventoryTable.tsx` bảng dữ liệu 16 cột với status badges, tính toán tự động, sắp xếp, empty state và phân trang (REQ-03)
- [ ] T6 — Xây dựng component `InventoryBatchDrawer.tsx` slide-over drawer xem chi tiết các lô hàng FEFO và mức độ rủi ro cận date (REQ-04)
- [ ] T7 — Xây dựng trang tổng hợp `StoreOwnerInventoryPage.tsx` tích hợp toàn bộ các component, reactive filtering, role switcher (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06)
- [ ] T8 — Đăng ký route `/store-owner/inventory` trong `router.tsx` và gắn liên kết điều hướng trong `AppTopNav.tsx` (REQ-06)

## Test
- [ ] T9 — Kiểm thử tương tác giao diện: Responsive layout, 5 thẻ KPI, lọc chi nhánh, ngành hàng, tìm kiếm từ khóa, drawer lô date và in báo cáo (REQ-01..06)
- [ ] T10 — Kiểm tra TypeScript build (`npm run build`) và lint để đảm bảo 0 lỗi biên dịch.
