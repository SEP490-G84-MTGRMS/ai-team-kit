# Skeptic Review: pos-customer-debt-management

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ scenarios từ quầy POS (chưa chọn khách, trong hạn mức, vượt hạn mức) đến Quản lý hóa đơn (lọc nợ, thu nợ từng phần, tất toán). |
| D2 Correctness | 5/5 | Công thức tính nợ dự kiến và giảm trừ nợ chuẩn xác: ProjectedDebt = CurrentDebt + OrderAmount. RemainingDebt = DebtAmount - PaymentAmount. |
| D3 Coherence | 5/5 | Thuật ngữ đồng nhất giữa proposal, design-brief và specs (Bán nợ, Ghi nợ, Hạn mức nợ, Thu nợ hóa đơn). |
| D4 Constraints | 5/5 | Tuân thủ nghiêm ngặt design system POS, chỉ dùng Lucide icon hợp lệ, không thực hiện git push lên remote repo. |
| D5 Blast Radius | 5/5 | Mở rộng độc lập cho phương thức 'debt', không ảnh hưởng đến luồng thanh toán Tiền mặt hay VietQR sẵn có. |

## Vấn đề & Ghi chú kiểm soát
- [MEDIUM] Kiểm tra trường hợp thu nợ vượt quá số tiền còn nợ → Đề xuất: Trong modal Thu nợ, disable nút Xác nhận hoặc báo lỗi nếu số tiền nhập lớn hơn số nợ còn lại.
- [LOW] Khi in hóa đơn K80 cho đơn bán nợ, cần ghi rõ dòng "HÌNH THỨC: BÁN NỢ / CÔNG NỢ" và "SỐ TIỀN CÒN NỢ" để khách ký nhận.

## Kết luận: Chấp nhận
