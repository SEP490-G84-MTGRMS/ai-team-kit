# Tasks: Đa Chi Nhánh, Phân Quyền Vai Trò POS & Tối Ưu Tra Cứu FEFO

## 1. Database & Seed Data (DB)
- [ ] T1: Mở rộng `DbInitializer.cs`: Thêm 2 chi nhánh mới cho An Nhiên Mart (`BR-AN-02` Cầu Giấy, `BR-AN-03` Đống Đa), gắn hồ sơ `Employee` cho `0917778888` (Ba Đình) và `0916667777` (Cầu Giấy), phân bổ tồn kho `BranchStock` & `Batches` đa chi nhánh (REQ-01).

## 2. Frontend UI & State Management
- [ ] T2: Nâng cấp `PosHeader.tsx`: Render dropdown chuyển chi nhánh khi user là `STORE_OWNER`, render badge cố định khi là `EMPLOYEE`, thêm nút công cụ "Tra cứu Lô FEFO" (REQ-02, REQ-04).
- [ ] T3: Xây dựng Component `PosInventoryLookupModal.tsx`: Quick modal tra cứu tồn kho đa chi nhánh và danh sách Lô date FEFO, có nút "✓ Chọn bán lô này" đưa món vào giỏ hàng POS (REQ-04).
- [ ] T4: Cập nhật `PosCheckoutPage.tsx`: Quản lý state chi nhánh làm việc, cập nhật giỏ hàng/tồn kho khi đổi chi nhánh, tiếp nhận sản phẩm và mã lô từ `PosInventoryLookupModal` (REQ-02, REQ-04).
- [ ] T5: Nâng cấp `InvoiceManagementPage.tsx`: Phân quyền bộ lọc chi nhánh theo role, chỉ cho phép `STORE_OWNER` thấy nút "Hủy hóa đơn", giữ nút "Đổi trả hàng" cho cả `EMPLOYEE` và `STORE_OWNER` (REQ-03).

## 3. Kiểm Thử & Xác Minh (Test)
- [ ] T6: Viết Unit Tests Backend kiểm thử Seed Data đa chi nhánh, phân quyền logic hóa đơn, và chạy kiểm thử `npm run build` Frontend không lỗi (REQ-01..REQ-04).
