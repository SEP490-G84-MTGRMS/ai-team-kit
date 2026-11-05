# Skeptic Review: pos-debt-validation-and-receipt-hotline-fix

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ toàn diện 4 requirement cho cả 5 vấn đề người dùng báo, có GIVEN/WHEN/THEN chi tiết. |
| D2 Correctness | 5/5 | Giải quyết đúng root cause (HTML5 min-max validation khi remainingDebt = 0, regex chặn ký tự chữ khi tìm khách hàng, xóa các dòng thừa chân bill, căn chỉnh cột bảng hàng hóa và hotline). |
| D3 Coherence | 5/5 | Khớp 100% giữa proposal.md, exploration.md và specs.md. |
| D4 Constraints | 5/5 | Không vi phạm quy tắc Karpathy (chỉ sửa tối thiểu đúng nơi cần sửa), không đụng vào schema DB hay breaking changes API. |
| D5 Blast Radius | 5/5 | Rất hẹp và an toàn (chỉ tác động đến frontend POS + hàm in ESC/POS backend). |

## Vấn đề
- [LOW] REQ-POS-CUST-02: Để tìm kiếm tiếng Việt không dấu chuẩn xác nhất (ví dụ gõ "Son" vẫn ra "Sơn"), cần dùng kỹ thuật chuẩn hóa Unicode NFD `str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` kết hợp với `toLowerCase()`. → Đề xuất: cài đặt helper `removeVietnameseTones()` trong `PosPaymentPanel`.
- [LOW] REQ-POS-DEBT-01: Tại `CollectDebtModal`, khi `remainingDebt <= 0`, ngoài việc vô hiệu hóa ô input thì nút "Thu toàn bộ (0 đ)" cũng cần được disable hoặc ẩn để tránh gây hiểu nhầm. → Đề xuất: disable nút "Thu toàn bộ" khi `remainingDebt <= 0`.

## Kết luận: Chấp nhận
