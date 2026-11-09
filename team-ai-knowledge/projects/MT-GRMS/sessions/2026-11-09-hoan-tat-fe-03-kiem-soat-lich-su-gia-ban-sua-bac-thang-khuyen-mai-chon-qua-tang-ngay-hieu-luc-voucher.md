---
id: SES-2026-11-09-759
date: '2026-11-09'
author: sonnguyenn10
project: MT-GRMS
goals:
  - Sửa lỗi lưu trữ nhiều bậc thang khuyến mãi (ORDER_DISCOUNT)
  - Sửa lỗi chọn sản phẩm quà tặng kèm ĐVT trong chương trình Mua X tặng Y
  - Sửa lỗi kiểm tra ngày bắt đầu hiệu lực mã Voucher tại POS
  - >-
    Hiện thực hóa FE-03.1 Below-Cost Warning & FE-03.2 Price Change History
    Tracking (Master & Branch) với Zero-Friction UX
status: completed
files_changed:
  - MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Catalog/ProductPriceHistory.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/Configurations/Catalog/ProductPriceHistoryConfiguration.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/DbInitializer.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/ProductPriceHistoryRepository.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Catalog/CatalogService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Branches/BranchProductService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductsController.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/Promotions/PromotionService.cs
  - >-
    MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/PromotionRepository.cs
  - MT_GRMS_FRONTEND/src/features/product/components/PriceHistoryModal.tsx
  - MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx
  - MT_GRMS_FRONTEND/src/features/product/components/EditStoreProductModal.tsx
  - >-
    MT_GRMS_FRONTEND/src/features/promotion/components/promotions/PromotionModal.tsx
  - MT_GRMS_FRONTEND/src/features/promotion/pages/PromotionListPage.tsx
tags:
  - session
  - summary
---

# Session Summary: Hoàn tất FE-03 Kiểm soát & Lịch sử giá bán + Sửa bậc thang khuyến mãi, chọn quà tặng & ngày hiệu lực Voucher

Hoàn thành trọn vẹn 6/6 bước OpenSpec change `fe-03-price-controls-and-promotions-sync`. Đã bổ sung bảng ProductPriceHistories lưu vết biến động giá bán theo phạm vi MASTER (toàn chuỗi) và BRANCH (chi nhánh) với Zero-Friction UX (tự động điền lý do mặc định 'Điều chỉnh giá bán' cho thay đổi thông thường, cảnh báo FE-03.1 khi bán dưới giá vốn), cung cấp API GET /api/products/{id}/price-history và giao diện PriceHistoryModal. Đồng thời khắc phục triệt để lỗi lưu nhiều bậc thang khuyến mãi qua metadata [TIERS_JSON], sửa lỗi stale closure khi chọn quà tặng Mua X tặng Y và chuẩn hóa kiểm tra ngày hiệu lực Voucher theo múi giờ +07:00. Xác minh 577/577 test cases Backend PASS và Frontend build PASS 0 lỗi.
