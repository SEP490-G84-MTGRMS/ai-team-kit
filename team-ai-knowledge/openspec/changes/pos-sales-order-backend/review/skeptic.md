# Skeptic Review: pos-sales-order-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đầy đủ luồng POS bán lẻ: Tạo đơn, tính tiền, trừ kho FEFO, tra cứu barcode, in nhiệt ESC/POS 1-Click, kiểm soát hạn mức nợ và tích điểm. |
| D2 Correctness | 5/5 | Logic tài chính chính xác (tiền tệ decimal, VAT, chiết khấu, tiền thối); trừ kho tuần tự theo lô hạn sử dụng gần nhất; xử lý số tiền tỷ ngắt dòng khổ 58mm. |
| D3 Coherence | 5/5 | Khớp hoàn toàn giữa proposal, design-brief, specs và cấu trúc thực tế của Domain Entities (`Order`, `OrderDetail`, `BranchStock`, `Customer`). |
| D4 Constraints | 5/5 | Tuân thủ triệt để Clean Architecture 4 tầng, Multi-tenancy phân tách dữ liệu theo `TenantId`, P/Invoke Win32 Spooler kiểu RAW không popup. |
| D5 Blast Radius | 4/5 | Chỉ tác động đọc/ghi vào `Orders`, `OrderDetails`, cập nhật `BranchStocks.QuantityOnHand` và số dư nợ/điểm của `Customer`. Không phá vỡ migration hay các module khác. |

## Vấn đề & Ghi Chú Giảm Thiểu Rủi Ro
- [MEDIUM] Xung đột đồng thời khi 2 quầy POS cùng bán mặt hàng cuối cùng trong kho:
  → Đề xuất: Thực thi trừ kho trong Transaction và kiểm tra `QuantityOnHand >= qty` trước khi commit. Nếu không đủ thì rollback toàn bộ và báo lỗi "Hàng trong kho vừa được quầy khác bán hết".
- [LOW] Máy in nhiệt chưa cắm cáp USB hoặc tắt nguồn khi gọi API in:
  → Đề xuất: Bắt lỗi P/Invoke `OpenPrinter` an toàn, trả về message thân thiện và Frontend tự động hiển thị tùy chọn in dự phòng qua trình duyệt.

## Kết luận: Chấp nhận
Spec đã hoàn thiện, logic chặt chẽ, đầy đủ kịch bản kiểm thử và an toàn để triển khai mã nguồn.
