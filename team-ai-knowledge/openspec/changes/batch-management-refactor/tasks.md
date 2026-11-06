# Tasks: Refactor & Hoàn thiện Màn hình Quản lý Lô Hàng & Hạn Dùng (FEFO)

- [ ] T1 (REQ-04) — Bổ sung EnsureBatchSchemaAsync trong DbInitializer.cs và nạp 12+ lô hàng mẫu phong phú với đủ 4 dải hạn dùng trong DatabaseSeeder.cs
- [ ] T2 (REQ-01) — Mở rộng BatchDtos.cs, BatchRepository.cs và BatchesController.cs hỗ trợ lọc đa tiêu chí (ProductName, Sku, BatchCode, SupplierName, Status, BranchId) và phân trang FEFO
- [ ] T3 (REQ-02) — Xây dựng batchApi.ts và batchExcelExporter.ts ở frontend kết nối httpClient và hỗ trợ xuất tệp Excel
- [ ] T4 (REQ-03) — Refactor BatchFilterBar.tsx theo cấu trúc chuẩn so-list-filter và so-list-filter-row--footer
- [ ] T5 (REQ-03) — Refactor BatchTable.tsx theo cấu trúc chuẩn so-list-table-card, so-list-table-head, so-list-table-body và so-list-pager
- [ ] T6 (REQ-02, REQ-03) — Refactor BatchListPage.tsx tích hợp API thật, tiêu đề so-list-header, actions bar, và xử lý trạng thái loading/toast
- [ ] T7 — Build xác minh cả Backend (.NET 8) và Frontend (Vite + TypeScript) không phát sinh lỗi biên dịch
