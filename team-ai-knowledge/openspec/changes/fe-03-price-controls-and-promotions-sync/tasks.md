# Tasks: fe-03-price-controls-and-promotions-sync

## Database & Domain Entities

- [x] T1 — Tạo entity `ProductPriceHistory.cs` và cấu hình EF Core `ProductPriceHistoryConfiguration.cs`, thêm `DbSet<ProductPriceHistory>` vào `AppDbContext.cs` (REQ-PRICE-HISTORY-02)

## Backend Services & APIs

- [x] T2 — Cập nhật `PromotionService.cs` chuẩn hóa ngày hiệu lực voucher theo `Date` (REQ-VOUCHER-DATE-VALIDATION-05) và hỗ trợ lưu/đọc `tiers` an toàn từ metadata `Description` (REQ-PROMO-TIERS-PERSISTENCE-03)
- [x] T3 — Hiện thực hóa dịch vụ `ProductPriceHistoryRepository` và tích hợp tự động ghi audit log biến động giá (Master/Branch), kiểm soát cảnh báo bán dưới giá vốn trong `CatalogService` & `BranchProductService` (REQ-PRICE-CONTROL-01, REQ-PRICE-HISTORY-02)
- [x] T4 — Bổ sung API `GET /api/products/{id}/price-history` trong `ProductsController.cs` tra cứu lịch sử thay đổi giá bán (REQ-PRICE-HISTORY-02)

## Frontend UI Components & Modals

- [x] T5 — Xây dựng component `PriceHistoryModal.tsx` xem dòng thời gian biến động giá và tích hợp Below-Cost Warning trong `ProductFormModal.tsx` và `EditStoreProductModal.tsx` (REQ-PRICE-CONTROL-01, REQ-PRICE-HISTORY-02)
- [x] T6 — Nâng cấp `PromotionModal.tsx` cho phép chọn sản phẩm quà tặng từ kho hàng kèm ĐVT; cập nhật `PromotionListPage.tsx` và `PromotionTable.tsx` nạp và hiển thị đầy đủ các bậc thang khuyến mãi (REQ-PROMO-TIERS-PERSISTENCE-03, REQ-PROMO-GIFT-INVENTORY-PICKER-04)

## Verification & Testing

- [x] T7 — Chạy kiểm tra TypeScript và biên dịch Frontend (`npm run build`) đảm bảo 0 lỗi biên dịch (REQ-ALL)
- [x] T8 — Chạy toàn bộ Backend test suites (`dotnet test MT_GRMS_BACKEND.sln`) xác nhận 100% test cases thành công (REQ-ALL)
