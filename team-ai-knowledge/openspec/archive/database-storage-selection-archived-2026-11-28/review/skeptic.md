# Skeptic Review: database-storage-selection

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bổ sung scenario chi tiết về DateTime UTC cho Npgsql 8 và persistent named volume cho Docker. |
| D2 Correctness | 5/5 | Kiến trúc EF Core Code-First với Npgsql Provider hoàn toàn chuẩn xác cho .NET 8. |
| D3 Coherence | 5/5 | Khớp 100% giữa Proposal, Exploration và Specs về lựa chọn PostgreSQL 16. |
| D4 Constraints | 5/5 | Đảm bảo tính bất biến của Global Query Filter cho đa người thuê và chuẩn tiền tệ `decimal(18,2)`. |
| D5 Blast Radius | 5/5 | Thay đổi cục bộ trong tầng hạ tầng Data Access (`Infrastructure` và `appsettings.json`), không ảnh hưởng Application/Domain logic. |

## Vấn đề đã soi & xử lý
- [MEDIUM] Npgsql 8 mặc định ném ngoại lệ với `DateTime` có `Kind=Unspecified` khi ghi vào `timestamptz`.  
  👉 **Đã xử lý**: Bổ sung scenario trong REQ-DB-01 yêu cầu chuẩn hóa `DateTimeKind.Utc` hoặc kích hoạt legacy timestamp switch.
- [MEDIUM] Container Docker có nguy cơ mất dữ liệu khi restart nếu thiếu volume.  
  👉 **Đã xử lý**: Bổ sung scenario trong REQ-DB-04 yêu cầu named persistent volume `postgres_data`.
- [LOW] Khả năng xung đột cổng 5432 nếu máy trạm đã có PostgreSQL cài sẵn.  
  👉 **Đã xử lý**: Ghi chú rõ cổng cấu hình trong `docker-compose.yml` và `appsettings.json`.

## Kết luận: Chấp nhận
Specs đã hoàn thiện, không còn bất kỳ vấn đề HIGH nào tồn đọng. Đủ điều kiện lập `tasks.md`.
