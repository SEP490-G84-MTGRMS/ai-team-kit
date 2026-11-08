# Summary: pos-owner-order-cashier-and-branch-fixes

## Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-08 12:08

Duyệt proposal.md: Ẩn nút lịch sử ca ở POS Header cho Owner, hiển thị đúng tên chi nhánh thực tế, Owner xem đơn hàng toàn chuỗi, và lưu snapshot CashierName trên Order entity.

## Brainstorm — ✅ Approve bởi @sonnguyenn10 · 2026-11-08 12:12

Duyệt exploration.md và specs.md: xác định rõ root cause 4 lỗi và đặc tả delta REQ-POS-OWNER-HEADER-01 đến REQ-POS-ORDER-CASHIER-SNAPSHOT-04.

## Verify Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-08 12:13

Duyệt review/skeptic.md và tasks.md (6 tasks T1-T6 tuần tự từ DB, Domain, Application đến Frontend và Test).

## Apply — ✅ Approve bởi @sonnguyenn10 · 2026-11-08 12:20

Duyệt bước Apply: Hoàn thành 6/6 tasks, thêm CashierName vào Order entity & OrderResponse, sửa dropdown POS Header ẩn lịch sử ca cho Owner, sửa tên chi nhánh động và xem đơn hàng toàn chuỗi, loại bỏ fallback user.fullName.
