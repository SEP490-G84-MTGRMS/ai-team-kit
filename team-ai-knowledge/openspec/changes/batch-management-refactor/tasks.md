# Tasks: Refactor & Hoàn thiện Màn hình Quản lý Lô Hàng & Hạn Dùng (FEFO)

- [ ] T1 (REQ-04) — Bổ sung EnsureBatchSchemaAsync trong DbInitializer.cs và nạp 12+ lô hàng mẫu phong phú với đủ 4 dải hạn dùng trong DatabaseSeeder.cs
- [ ] T2 (REQ-01) — Mở rộng BatchDtos.cs, BatchRepository.cs và BatchesController.cs hỗ trợ lọc đa tiêu chí (ProductName, Sku, BatchCode, SupplierName, Status, BranchId) và phân trang FEFO
- [ ] T3 (REQ-02) — Xây dựng batchApi.ts và batchExcelExporter.ts ở frontend kết nối httpClient và hỗ trợ xuất tệp Excel
- [ ] T4 (REQ-03) — Refactor BatchFilterBar.tsx theo cấu trúc chuẩn so-list-filter và so-list-filter-row--footer
- [ ] T5 (REQ-03) — Refactor BatchTable.tsx theo cấu trúc chuẩn so-list-table-card, so-list-table-head, so-list-table-body và so-list-pager
- [ ] T6 (REQ-02, REQ-03) — Refactor BatchListPage.tsx tích hợp API thật, tiêu đề so-list-header, actions bar, và xử lý trạng thái loading/toast
- [ ] T7 — Build xác minh cả Backend (.NET 8) và Frontend (Vite + TypeScript) không phát sinh lỗi biên dịch

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: batch-list -->
# Tasks: batch-list (Quản lý Lô Sản Phẩm & Hạn Sử Dụng - FEFO Expiry Management)

## Backend
- [x] B1 — Xây dựng DTOs (`BatchDtos.cs`): `BatchFilterQuery`, `BatchKpiSummaryDto`, `BatchListItemDto`, `BatchPagedResultDto`, `ExpiryAlertDto`
- [x] B2 — Cập nhật Repository (`IBatchRepository.cs` / `BatchRepository.cs`): Truy vấn dữ liệu lô hàng, tính toán số ngày còn lại (`DaysLeft`), phân loại rủi ro FEFO (`Expired`, `Critical`, `Warning`, `Normal`), tính tổng định giá tồn kho và lọc cận date
- [x] B3 — Xây dựng Business Service (`BatchService.cs`): Tích hợp multi-tenant isolation, lọc theo chi nhánh/từ khóa/trạng thái và phân trang
- [x] B4 — Mở Controller Endpoints (`BatchesController.cs`): `GET /api/v1/batches`, `GET /api/v1/batches/{id}`, `GET /api/v1/batches/alerts`, `POST /api/v1/batches`
- [x] B5 — Viết bộ Unit Tests (`BatchExpiryTests.cs`): Kiểm thử phân trang, bộ lọc và cảnh báo cận date FEFO (100% tests passed)

## Frontend
- [x] T1 — Khởi tạo thư mục `src/features/batch/` và định nghĩa DTO types trong `types/batch.types.ts` (`BatchItem`, `BatchMovement`, `BatchFilterState`, `BatchKpiSummary`, `BatchStatus`) (REQ-01, REQ-02, REQ-03)
- [x] T2 — Xây dựng mock dataset 20+ lô hàng phong phú đa dạng sản phẩm, đầy đủ chi nhánh (`BR-01`, `BR-02`), nhà cung cấp và 4 trạng thái hạn sử dụng trong `lib/mockBatchData.ts` (REQ-01, REQ-03, REQ-04)
- [x] T3 — Xây dựng component `BatchKpiCards.tsx` hiển thị 4 thẻ chỉ số phân tầng rủi ro hạn dùng (Expired, Critical, Warning, Normal) kèm trạng thái click-to-filter (REQ-01)
- [x] T4 — Xây dựng component `BatchFilterBar.tsx` với dropdown Chi nhánh, Trạng thái, ô tìm kiếm từ khóa SKU/Tên/Mã lô, nút Tìm kiếm, Đặt lại và In báo cáo (REQ-02, REQ-06)
- [x] T5 — Xây dựng component `BatchTable.tsx` bảng dữ liệu 11 cột, Days Left highlight (đỏ/cam/xanh), status badges, phân trang và các nút thao tác nghiệp vụ (REQ-03, REQ-05)
- [x] T6 — Xây dựng component `BatchDetailDrawer.tsx` slide-over drawer xem chi tiết lượt hàng UI-02-02: vị trí kho kệ, chứng từ nhập gốc GRN và lịch sử luân chuyển lô (REQ-04)
- [x] T7 — Xây dựng component `BatchDiscountModal.tsx` hộp thoại cấu hình % chiết khấu FEFO kích cầu xả hàng cận date (REQ-05)
- [x] T8 — Xây dựng trang tổng hợp `BatchListPage.tsx` liên kết toàn bộ component, đồng bộ URL search params, xử lý role switcher và layout in báo cáo (REQ-01..07)
- [x] T9 — Đăng ký route `/store-owner/batches` (và alias `/store-owner/expiry`) trong `router.tsx` và tích hợp menu điều hướng trong `AppTopNav.tsx` mục "Kho & Hạn dùng (FEFO)" (REQ-07)

## Test
- [x] T10 — Kiểm thử tương tác giao diện người dùng: Kiểm tra bộ lọc đa chiều, click lọc nhanh từ KPI cards, mở Drawer chi tiết, mở Modal giảm giá FEFO, và chế độ in báo cáo khổ A4 (REQ-01..07)
- [x] T11 — Kiểm tra biên dịch TypeScript (`npm run build`) và lint oxlint để bảo đảm 100% 0 lỗi biên dịch hoặc xung đột thư viện.
- [x] T12 — Chạy dotnet test MT_GRMS.UnitTests đạt 100% PASS (66/66 tests)


<!-- Tasks sáp nhập từ: fefo-batch-tracking -->
# Tasks: fefo-batch-tracking

> ⚠️ Viết tasks khi chưa có design-brief.md và review/skeptic.md — TeamSpec đánh dấu BLOCKED.

## Backend
- [ ] T1 — `IBatchAllocationService.Allocate` phân bổ theo `ExpiryDate` tăng dần, `NULL` xếp cuối (REQ-1, REQ-2)
- [ ] T2 — Bọc phân bổ trong transaction, thiếu tồn → rollback + `409 InsufficientStock` (REQ-3)
- [ ] T3 — Ghi `StockMovements` `SaleOut` cho mỗi lô bị trừ (REQ-4)
- [ ] T4 — Job 00:05 cập nhật `AlertLevel` (REQ-5)

## API
- [ ] T5 — `GET /api/batches`, `GET /api/batches/expiring?days=30`

## Test
- [ ] T6 — Test các Scenario trong specs.md
