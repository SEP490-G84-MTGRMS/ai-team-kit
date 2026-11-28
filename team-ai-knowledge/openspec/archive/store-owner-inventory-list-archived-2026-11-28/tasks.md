# Tasks: store-owner-inventory-list

## Frontend
- [x] T1 — Khởi tạo module `src/features/inventory/` và định nghĩa DTO types (`inventory.types.ts`) (REQ-01, REQ-02, REQ-03, REQ-04)
- [x] T2 — Xây dựng mock dataset 25+ sản phẩm đa chi nhánh (`BR-01`, `BR-02`), đầy đủ số liệu tồn và danh sách lô FEFO (`mockInventoryData.ts`) (REQ-01, REQ-03, REQ-04)
- [x] T3 — Xây dựng component `InventoryKpiCards.tsx` hiển thị 5 thẻ chỉ số động theo bộ lọc (REQ-01)
- [x] T4 — Xây dựng component `InventoryFilterBar.tsx` với dropdown Chi nhánh, Ngành hàng, Kệ, Trạng thái, ô tìm kiếm, nút Xuất Excel & In báo cáo (REQ-02, REQ-05)
- [x] T5 — Xây dựng component `InventoryTable.tsx` bảng dữ liệu 16 cột với status badges, tính toán tự động, sắp xếp, empty state và phân trang (REQ-03)
- [x] T6 — Xây dựng component `InventoryBatchDrawer.tsx` slide-over drawer xem chi tiết các lô hàng FEFO và mức độ rủi ro cận date (REQ-04)
- [x] T7 — Xây dựng trang tổng hợp `StoreOwnerInventoryPage.tsx` tích hợp toàn bộ các component, reactive filtering, role switcher (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06)
- [x] T8 — Đăng ký route `/store-owner/inventory` trong `router.tsx` và gắn liên kết điều hướng trong `AppTopNav.tsx` (REQ-06)

## Test
- [x] T9 — Kiểm thử tương tác giao diện: Responsive layout, 5 thẻ KPI, lọc chi nhánh, ngành hàng, tìm kiếm từ khóa, drawer lô date và in báo cáo (REQ-01..06)
- [x] T10 — Kiểm tra TypeScript build (`npm run build`) và lint để đảm bảo 0 lỗi biên dịch.

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: inventory-dashboard -->
# Tasks: Inventory Dashboard

- [x] T1 — Thêm index `(BranchId, ExpiryDate)` trên `ProductBatches`
- [x] T2 — `InventoryDashboardQuery` + handler (filter `TenantId`, `BranchId`)
- [x] T3 — Endpoint `GET /api/inventory/dashboard`
- [x] T4 — Script seed 50k lô cho dev
- [ ] T5 — Trang React: KPI cards + chart + table
- [ ] T6 — Test: đổi chi nhánh, màu cảnh báo HSD, đo thời gian phản hồi
