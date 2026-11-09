# Improvements: pos-db-sync-owner-shiftless-and-branch-catalog

## Brainstorm · 2026-11-09 18:29

Phát hiện sớm lỗi rollback giao dịch khi gộp nhiều lệnh DDL có bảng đã bị drop và bẫy User.Id dạng chuỗi làm CurrentUserId = Guid.Empty khi mở ca 24/7.
