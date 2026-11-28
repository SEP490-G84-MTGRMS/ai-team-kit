# Skeptic Review: store-owner-dashboard-real-data

| Chiều | Điểm (1–5) | Nhận xét |
|---|---:|---|
| D1 Completeness | 4 | Đủ 5 nhóm dữ liệu, filter, empty/error, sai quyền và khác tenant. |
| D2 Correctness | 4 | Đã làm rõ trạng thái PO và cách tính giá trị GRN; cần đối chiếu enum thực khi code. |
| D3 Coherence | 4 | Phù hợp proposal; spec chốt quyền StoreOwner rõ hơn design brief. |
| D4 Constraints | 4 | Tenant lấy từ auth context, API đọc; có giới hạn preview. |
| D5 Blast Radius | 4 | Thay dashboard hiện có và thêm truy vấn đọc; không đụng luồng ghi hay DB schema. |

## Vấn đề

- [HIGH — Đã xử lý] REQ-DASH-REAL-04 trước đây dùng cụm 'PO chờ nhận' và 'giá trị hàng đã nhận' chưa định nghĩa. Specs đã chốt tập trạng thái PO, dùng GRN COMPLETED theo ConfirmedAtUtc/GrandTotal và đổi nhãn thành 'Giá trị phiếu nhập đã hoàn tất'.
- [MEDIUM] Design brief còn viết 'role quản trị cửa hàng được phép' trong khi REQ-DASH-REAL-06 đã chốt StoreOwner/STORE_OWNER. Khi triển khai lấy specs làm chuẩn; có thể đồng bộ lại diễn đạt design brief nếu cần.
- [LOW] Bộ lọc '7 ngày gần nhất' cần kiểm tra chính xác ranh giới ngày Việt Nam khi code, nhất là thời điểm sát nửa đêm.

## Kết luận: Chấp nhận

Không còn vấn đề HIGH chưa xử lý. Rà soát này đánh giá specs, chưa kết luận code chạy đúng.
