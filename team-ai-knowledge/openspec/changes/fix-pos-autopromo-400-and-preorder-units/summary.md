# Summary: fix-pos-autopromo-400-and-preorder-units

## Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 14:02

Duyệt phạm vi bug-fix: sửa lỗi 400 Bad Request trên evaluate-cart khi nhận BranchId/CustomerId chuỗi, đồng bộ trạng thái hiệu lực UPCOMING/EXPIRED và danh sách chi nhánh thật cho Khuyến mãi, đồng thời khôi phục chọn Đơn vị quy đổi và giữ/hoàn kho theo hệ số quy đổi trên Tạo đơn đặt trước.

## Brainstorm — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 14:06

Hoàn thành exploration.md và specs.md với 4 MODIFIED Requirements (REQ-FIX-PROMO-01, REQ-FIX-PROMO-02, REQ-FIX-PREUNIT-01, REQ-FIX-PREUNIT-02) cho tự động áp dụng khuyến mãi POS (hỗ trợ BranchId/CustomerId chuỗi), đồng bộ trạng thái Sắp diễn ra/Hết hạn + nạp chi nhánh thật, và khôi phục chọn Đơn vị quy đổi kèm giữ/hoàn kho FEFO theo ConversionRate trên Đơn đặt trước.
