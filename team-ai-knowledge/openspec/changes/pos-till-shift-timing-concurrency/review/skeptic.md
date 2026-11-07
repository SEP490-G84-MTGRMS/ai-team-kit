# Skeptic Review: pos-till-shift-timing-concurrency

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 Requirements chi tiết bao phủ toàn bộ vòng đời ca dùng chung: mở ca, tự vào ca, khóa bán khi closing, xác nhận chốt ca, chủ bán hàng, và kịch bản concurrency trừ tồn kho FEFO. |
| D2 Correctness | 5/5 | Logic nghiệp vụ khớp 100% với tài liệu đặc tả `BO_SUNG_CA_DUNG_CHUNG_CHI_NHANH_NHIEU_QUAY_MOT_KET.md`. Các trạng thái chuyển dịch rõ ràng (`Open` -> `Closing` -> `Closed`, hoặc `Closing` -> `Open`). |
| D3 Coherence | 5/5 | Thống nhất hoàn toàn giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. Thuật ngữ dùng chung chuẩn xác. |
| D4 Constraints | 5/5 | Cách ly đa tenant với `TenantId`, phân quyền RBAC rõ ràng (chỉ Owner mới được `force-close`), bảo vệ an toàn kho bằng PostgreSQL Row-level locking `FOR UPDATE`. |
| D5 Blast Radius | 4/5 | Chỉ mở rộng thêm trường trên `ShiftZReport` và thêm 2 bảng mới (`ShiftParticipants`, `ShiftCloseConfirmations`), không làm breaking change các API hiện có. |

## Vấn đề & Khuyến nghị
- [MEDIUM] REQ-SHIFT-SHARED-03: Khi chuyển ca sang `Closing`, cần đảm bảo giao diện POS của các máy khác nhận biết được trạng thái này ngay khi thu ngân thao tác (qua polling nhẹ hoặc khi gửi request tạo đơn bị chặn 409) để hiển thị thông báo rõ ràng cho thu ngân biết máy đang tạm khóa bán.
  → *Đề xuất*: Khi API trả về 409 với message Closing, POS giao diện tự động bật banner thông báo và khóa nút thanh toán.
- [LOW] REQ-STOCK-CONCURRENCY-01: Cần đảm bảo cú pháp `FOR UPDATE` trong PostgreSQL được gọi trong transaction của UnitOfWork để lock được giải phóng ngay sau khi `SaveChangesAsync()` hoàn tất.
  → *Đề xuất*: Sử dụng `_context.Database.BeginTransactionAsync()` hoặc quản lý transaction trong Service khi trừ tồn kho.

## Kết luận: Chấp nhận
Spec đã hoàn thiện, rõ ràng, chặt chẽ và sẵn sàng chuyển sang lập kế hoạch triển khai (`tasks.md`).
