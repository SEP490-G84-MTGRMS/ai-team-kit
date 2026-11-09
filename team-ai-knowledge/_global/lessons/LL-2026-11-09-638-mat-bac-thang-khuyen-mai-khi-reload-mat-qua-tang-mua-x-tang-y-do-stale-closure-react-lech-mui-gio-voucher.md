---
id: LL-2026-11-09-638
title: >-
  Mất bậc thang khuyến mãi khi reload, mất quà tặng Mua X tặng Y do stale
  closure React & lệch múi giờ Voucher
date: '2026-11-09'
author: sonnguyenn10
scope: fullstack
severity: high
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-09-638: Mất bậc thang khuyến mãi khi reload, mất quà tặng Mua X tặng Y do stale closure React & lệch múi giờ Voucher

## Problem
1) Khuyến mãi chiết khấu đơn hàng (ORDER_DISCOUNT) nhiều bậc thang không lưu được các bậc 2, 3... và bị reset về 1 bậc sau khi tải lại trang. 2) Tạo mới chương trình Mua X tặng Y không chọn được sản phẩm quà tặng từ kho hàng (giftProductId bị mất sau khi chọn). 3) Áp dụng mã voucher tại POS báo lỗi 'Voucher chỉ có hiệu lực từ ngày 09/11/2026' dù hôm nay đã là ngày 09/11/2026.

## Solution
Nguyên nhân gốc (Root Cause) & Giải pháp: 1) Bảng PromotionConditions có ràng buộc FK ProductId tới Products và Unique Index (TenantId, PromotionId, ProductId, ProductRole), nên ORDER_DISCOUNT truyền Guid.Empty cho nhiều bậc gây lỗi FK/Unique. Khắc phục: Backend bỏ qua điều kiện có ProductId == Guid.Empty khi ghi bảng PromotionConditions; tuần tự hóa mảng tiers dưới dạng metadata [TIERS_JSON]...[/TIERS_JSON] trong Promotion.Description và giải mã sạch khi nạp dữ liệu. 2) Dropdown quà tặng gọi handleUpdateTier 4 lần liên tiếp trong cùng một event handler trên biến state tiers cũ (stale closure), khiến lần gọi cuối ghi đè mất giftProductId. Khắc phục: Chuyển handleUpdateTier sang functional updater setTiers(prev => ...) hỗ trợ truyền object Partial<PromotionTier> để cập nhật nguyên tử (atomic update) trong 1 lần gọi. 3) ValidateVoucherAsync và GetActivePromotionsAsync so sánh trực tiếp DateTime.UtcNow với StartDate local. Khắc phục: Chuẩn hóa so sánh theo Date với múi giờ địa phương (+07:00) cho StartDate và EndDate.Date.AddDays(1).AddTicks(-1) để voucher có hiệu lực trọn vẹn trong ngày bắt đầu và ngày kết thúc.
