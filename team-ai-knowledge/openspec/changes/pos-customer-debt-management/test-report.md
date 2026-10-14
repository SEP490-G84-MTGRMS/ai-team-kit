---
verdict: PASS
date: 2026-10-14
tester: Nguyễn Bá Sơn
change: pos-customer-debt-management
---

# Báo cáo Kiểm thử: pos-customer-debt-management

## 1. Kết quả kiểm thử các kịch bản (Scenario Matrix)

| Mã REQ | Mô tả kịch bản kiểm thử | Dữ liệu đầu vào / Thao tác | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
|--------|------------------------|---------------------------|-------------------|-----------------|----------|
| REQ-01 | Thêm lựa chọn thanh toán "Ghi nợ (Bán nợ)" tại quầy POS | Chọn radio "Ghi nợ (Bán nợ)" trong `PosPaymentPanel` | Hiển thị thẻ thông tin hạn mức, nợ hiện tại, nợ dự kiến sau đơn | Hiển thị chính xác thẻ thông tin công nợ realtime | PASS |
| REQ-02 | Chặn bán nợ đối với khách vãng lai | Bấm "Ghi nợ đơn hàng" khi chưa chọn khách hàng | Báo lỗi nhắc nhở chọn khách hàng định danh | Bật cảnh báo yêu cầu tìm/chọn khách hàng | PASS |
| REQ-03 | Cảnh báo khi nợ vượt hạn mức tín dụng | Chọn khách hàng Trần Văn Đức (Hạn mức 500k, nợ cũ 450k, đơn 200k) | Bật modal `DebtLimitWarningModal` màu đỏ cam, hiển thị số tiền vượt 150k | Modal bật chuẩn xác, hiển thị chi tiết số tiền vượt và ô ghi chú phê duyệt | PASS |
| REQ-03b | Duyệt ngoại lệ bán nợ vượt hạn mức | Nhập lý do và bấm "Xác Nhận Duyệt Bán Nợ" | Đơn hàng được xuất nợ thành công, cập nhật nợ khách hàng và in bill K80 | Cập nhật nợ mới thành 650k, in bill K80 ghi nhận hình thức "Ghi nợ" | PASS |
| REQ-04 | Lọc và hiển thị hóa đơn công nợ trong Quản lý hóa đơn | Vào `InvoiceManagementPage`, lọc phương thức "Ghi nợ" | Hiển thị các hóa đơn còn nợ với badge đỏ "Còn nợ: [số tiền] đ" | Hiển thị đúng hóa đơn nợ HD000043, HD000042 với badge còn nợ | PASS |
| REQ-05 | Thu nợ hóa đơn bán lẻ bằng Tiền mặt / VietQR | Bấm nút "Thu nợ" tại dòng hóa đơn hoặc accordion | Mở modal `CollectDebtModal` hiển thị số nợ còn lại, cho phép thu toàn bộ hoặc một phần | Modal hoạt động chuẩn, nhập số tiền, chọn hình thức và ghi chú thành công | PASS |
| REQ-05b | Cập nhật số dư nợ và lưu lịch sử phiếu thu | Thu 250k cho đơn còn nợ 450k | Nợ còn lại giảm còn 200k, ghi nhận bản ghi vào `debtPaymentRecords` | Cập nhật số dư tức thì, hiển thị bảng lịch sử thanh toán nợ | PASS |
| REQ-05c | Tự động hoàn tất hóa đơn khi tất toán nợ | Thu hết toàn bộ số nợ còn lại | Trạng thái hóa đơn chuyển sang "Hoàn thành", badge xanh | Chuyển trạng thái sang Hoàn thành chính xác | PASS |
| REQ-06 | In bill nhiệt K80 và an toàn chốt ca | Xem trước in bill nhiệt K80 | Hiển thị rõ số tiền còn nợ, số đã trả; không làm lệch tiền két chốt ca | Bill K80 hiển thị chi tiết công nợ; không tính nợ vào tiền két lý thuyết | PASS |

## 2. Kiểm chứng kỹ thuật tự động
- **Lệnh build**: `npm run build` (`tsc -b && vite build`)
- **Kết quả**: Exit code 0, 2342 modules transformed, 0 lỗi TypeScript.
- **Git Push**: Nhánh `add/ui-pos-checkout-ver2` đã được đẩy lên `origin` thành công.

## 3. Lỗi tồn đọng
- Không có lỗi tồn đọng (0 bug).
