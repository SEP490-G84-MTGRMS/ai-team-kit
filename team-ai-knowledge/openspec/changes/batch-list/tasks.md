# Tasks: batch-list (Quản lý Lô Sản Phẩm & Hạn Sử Dụng - FEFO Expiry Management)

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
