# Summary: pos-branch-pricing-and-fefo

## Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-04 15:57

Phê duyệt Proposal: Chốt mục tiêu lấy giá bán chi nhánh từ BranchProduct, giá đơn vị quy đổi từ BranchProductUnitPrice, trừ kho BranchStock theo FEFO, lưu Order/OrderDetail, dropdown chọn đơn vị tính trên UI POS và seed dữ liệu An Nhiên với 4 sản phẩm thực tế.

## Brainstorm — ✅ Approve bởi @sonnguyenn10 · 2026-11-04 16:06

Phê duyệt Brainstorm: Thống nhất luồng phân giải giá BranchProduct / BranchProductUnitPrice, nhân hệ số ConversionRate để trừ kho BranchStocks FEFO, dropdown chọn ĐVT trên giỏ hàng POS, và bộ 4 sản phẩm mẫu seed vào CSDL An Nhiên.

## Verify Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-04 16:07

Phê duyệt Verify Spec: Chốt bảng phản biện Skeptic 5/5 và checklist 8 tasks theo thứ tự Seeding -> Backend -> Unit Tests -> Frontend -> Verification. Chuyển sang bước Apply để code.

## Apply — ✅ Approve bởi @sonnguyenn10 · 2026-11-04 16:34

Hoàn thành toàn bộ 8/8 tasks trong tasks.md: Seed 4 sản phẩm thực tế kèm đa đơn vị tính và tồn kho FEFO cho cửa hàng An Nhiên, phân giải giá chi nhánh và ĐVT trong OrderService, trừ kho BranchStocks theo FEFO khi bán hàng, thêm 6 unit tests mới (347/347 PASS), bổ sung dropdown chọn ĐVT trên giỏ hàng POS cập nhật giá tức thì (build frontend PASS).

## Test — ✅ Approve bởi @sonnguyenn10 · 2026-11-04 16:35

Toàn bộ 8 yêu cầu REQ-POS-09 đến REQ-POS-13 đều PASS. 347/347 unit tests backend thành công, frontend build sạch lỗi, CSDL cửa hàng An Nhiên đã có đầy đủ 4 sản phẩm mẫu thực tế.
