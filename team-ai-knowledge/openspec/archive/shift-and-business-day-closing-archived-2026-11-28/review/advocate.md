# Advocate Review: shift-and-business-day-closing

## Người dùng & tình huống chính
- Thu ngân cần chốt nhanh, không hiểu thuật ngữ kỹ thuật.
- Nhiều người cùng bán nhưng tiền thuộc két.
- Chủ cần biết bán bao nhiêu, chi bao nhiêu, tiền ở đâu và lệch không.
- Cửa hàng qua đêm cần BusinessDate rõ ràng.

## Vấn đề
- [HIGH] REQ-SBDC-04 chưa tách giải trình mọi chênh lệch và phê duyệt khi vượt ngưỡng. → Mọi lệch khác 0 cần lý do; chỉ vượt ngưỡng cần quản lý duyệt.
- [HIGH] REQ-SBDC-08 chưa chọn tổng tiền hay kiểm đếm theo quỹ. → Chọn theo quỹ; tiền đang bàn giao là quỹ trung gian.
- [MEDIUM] STALE_PREVIEW có thể làm mất dữ liệu nhập. → Giữ draft local, chỉ refetch số hệ thống và yêu cầu xác nhận lại.
- [MEDIUM] Nếu một quỹ đích thì tự chọn read-only; không có quỹ thì chặn bàn giao > 0.
- [MEDIUM] Blocker cần tên ca/chứng từ, số tiền/trạng thái và nút xử lý.
- [MEDIUM] Ca sau cần xác nhận opening float và ghi opening discrepancy mà không sửa ca trước.
- [MEDIUM] Bổ sung keyboard/focus, label/aria, định dạng VND và modal cuộn trên màn hình thấp.
- [MEDIUM] Chốt mô hình reopen một bước hoặc hai bước.
- [LOW] UI dùng “Số liệu tạm tính”, “Việc cần xử lý”, “Lần chốt”, “Bản ghi đã khóa”.
- [LOW] Cho phép drill-down chứng từ từ từng dòng tổng.

## Đề xuất cắt giảm / để sau
- Chỉ hỗ trợ kiểm đếm theo quỹ, không hỗ trợ song song tổng chi nhánh.
- Chưa cần so sánh trực quan nhiều version; chỉ cần danh sách và xem snapshot.
- Không hiển thị lợi nhuận nếu chưa đủ giá vốn/chi phí.

## Kết luận: Cần sửa
