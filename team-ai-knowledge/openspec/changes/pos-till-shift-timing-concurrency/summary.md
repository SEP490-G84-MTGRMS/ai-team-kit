# Summary: pos-till-shift-timing-concurrency

## Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-07 15:07

Phê duyệt proposal thiết kế ca dùng chung theo chi nhánh (nhiều quầy thu ngân, 1 két tiền), khóa bán khi chốt ca (Closing state), chống race condition trừ tồn kho FEFO, và phân quyền chủ/nhân viên.

## Brainstorm — ✅ Approve bởi @sonnguyenn10 · 2026-11-07 15:09

Phê duyệt thiết kế Brainstorm: 1 chi nhánh 1 ca 1 két chung, cơ chế khóa bán hàng Closing, Pessimistic row-locking FEFO chống race condition tồn kho, và phân quyền chủ/thu ngân.
