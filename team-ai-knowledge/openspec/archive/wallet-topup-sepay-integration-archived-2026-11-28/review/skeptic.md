# Skeptic Review: wallet-topup-sepay-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4.5/5 | Các requirement REQ-WAL-01 đến REQ-WAL-05 đã đầy đủ kịch bản Scenario GIVEN/WHEN/THEN cho luồng chính và edge case (nạp trùng, thiếu tiền, sai token, polling). |
| D2 Correctness | 5.0/5 | Luồng Webhook SePay + Idempotency check + DB Transaction đảm bảo chuẩn xác toán học và tính toàn vẹn tài chính, chống nạp tiền 2 lần. |
| D3 Coherence | 5.0/5 | Tính nhất quán cao giữa proposal, exploration, design-brief và specs.md về cấu trúc dữ liệu và API endpoints. |
| D4 Constraints | 5.0/5 | Tuân thủ bảo mật token SePay, đa tenant theo TenantId, kiểu dữ liệu tiền tệ `decimal(18,2)`, UTC timestamp. |
| D5 Blast Radius | 4.8/5 | Thêm cột `WalletBalance numeric(18,2) DEFAULT 0` vào `Tenants` và 2 bảng mới `WalletTransactions`, `WalletTopupOrders` không làm breaking change các bảng hiện hữu. |

## Vấn đề

- **[MEDIUM] REQ-WAL-01: Tránh tạo thừa đơn nạp PENDING khi người dùng đổi nhanh mệnh giá**
  - *Mô tả*: Trong modal `StoreWalletTopupModal`, người dùng có thể bấm liên tục giữa các nút 500.000 đ, 1.000.000 đ hoặc gõ từng phím số tiền tự nhập. Nếu mỗi lần đổi đều gọi API tạo đơn ngay thì database sẽ phát sinh nhiều đơn PENDING rác.
  - *Đề xuất*: Phía Frontend dùng debounce 400ms trước khi gọi `POST /api/v1/tenant/wallet/topup-order`. Phía backend thiết lập `ExpiresAt` sau 15 phút cho các đơn nạp để tự động loại bỏ các đơn cũ.

- **[LOW] REQ-WAL-03: Độ phủ Regex của nội dung chuyển khoản SePay**
  - *Mô tả*: Các ngân hàng khác nhau có thể thêm tiền tố vào nội dung (ví dụ: `MBVCB.1234.WAL 9281` hoặc `WAL9281` dính liền).
  - *Đề xuất*: Biểu thức chính quy trích xuất mã đơn cần hỗ trợ linh hoạt cả dấu cách lẫn viết liền: `(?:WAL|wal)\s*([0-9A-Za-z]+)`.

## Kết luận: Chấp nhận
Specs đã đủ độ chín muồi, rõ ràng và an toàn để triển khai chia task và lập trình.
