---
id: REV-2026-11-09-140
date: '2026-11-09'
author: sonnguyenn10
project: MT-GRMS
tags:
  - review
  - verification
---

# Verification Report: Verify Spec Review: fix-pos-autopromo-400-and-preorder-units

## 5-Dimension Assessment
| Dimension | Status |
|-----------|--------|
| D1: Completeness | PASS - Đã bổ sung đầy đủ edge cases: tách nhiều lô FEFO khi đặt theo Thùng, nhiều dòng cùng ProductId khác ĐVT, BOGO theo ConversionRate, NewItems khi Đổi/Trả, và nút Hủy đơn đặt trước. |
| D2: Correctness | PASS - Tách 2 bước trừ kho FEFO và tạo OrderDetail khử triệt để lỗi đội thành tiền gấp ConversionRate lần; lưu cờ isActive độc lập tránh tắt nhầm CTKM UPCOMING khi chỉnh sửa. |
| D3: Coherence | PASS - proposal.md, exploration.md, specs.md và tasks.md (T1-T6) thống nhất 100% về phạm vi và tên cột/đường dẫn file. |
| D4: Constraints | PASS - Dùng 1 constructor duy nhất trên EvaluateCartRequest tránh CS0121/System.Text.Json error, lọc tường minh TenantId và đối khớp token Split(',', ';'), bọc transaction FEFO. |
| D5: Blast Radius | PASS - Đã khóa an toàn cột mới trên OrderDetails (ConversionRate mặc định 1.00, bọc IsNpgsql() trong DbInitializer), nạp chi nhánh thật trên cả PosCheckoutPage & InvoiceManagementPage và đồng bộ quy đổi ĐVT sang cả CreateOrderAsync & ProcessReturnExchangeAsync. |

## Summary
Hoàn tất Verify Spec 2 vòng (Skeptic + Guardian song song) cho change fix-pos-autopromo-400-and-preorder-units. Toàn bộ 5 điểm HIGH phát hiện ở vòng 1 đã được đối chiếu code thật và cập nhật đầy đủ vào specs.md + tasks.md (0 HIGH tồn đọng, điểm 5/5 trên cả D1-D5).
