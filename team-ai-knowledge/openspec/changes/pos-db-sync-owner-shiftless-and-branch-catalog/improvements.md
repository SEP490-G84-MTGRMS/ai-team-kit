# Improvements: pos-db-sync-owner-shiftless-and-branch-catalog

## Brainstorm · 2026-11-09 18:29

Phát hiện sớm lỗi rollback giao dịch khi gộp nhiều lệnh DDL có bảng đã bị drop và bẫy User.Id dạng chuỗi làm CurrentUserId = Guid.Empty khi mở ca 24/7.

## Verify Spec · 2026-11-09 18:45

Chạy song song Skeptic và Guardian 2 vòng phát hiện chính xác lỗi hoa-thường tên cột PostgreSQL, giới hạn Math.Clamp(pageSize, 1, 100) và rủi ro trộn tiền mặt không ca của STORE_OWNER vào két Till thu ngân trước khi viết code.
