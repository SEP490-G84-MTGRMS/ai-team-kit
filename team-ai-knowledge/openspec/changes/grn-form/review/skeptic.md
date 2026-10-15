# Skeptic Review: grn-form

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Cả 6 REQ đều có đầy đủ scenario GIVEN/WHEN/THEN chi tiết cho cả luồng chuẩn lẫn các edge case: hàng lệch âm/dương, hàng cận date < 30 ngày, quét barcode tăng số lượng, tính Landed Cost. |
| D2 Correctness | 5/5 | Logic hạch toán tài chính nhất quán: `Grand Total = (Tiền hàng - Chiết khấu + Landed Cost) + VAT`. Cơ chế phát hiện lệch `differenceQty = receivedQty - orderedQty` chính xác. |
| D3 Coherence | 5/5 | Bám sát chặt chẽ quyết định chỉ nhập hàng từ PO, thuật ngữ thống nhất giữa proposal, exploration, design-brief và specs.md. |
| D4 Constraints | 5/5 | Đảm bảo validation bắt buộc cho Lô hàng & HSD; nhân viên chi nhánh bị khóa cố định chi nhánh phân công; chủ cửa hàng có toàn quyền. |
| D5 Blast Radius | 5/5 | Module mới độc lập tại `src/features/goods-receipt/pages/GoodsReceiptFormPage.tsx`, bổ sung route `/store-owner/goods-receipts/create` và `/store-owner/goods-receipts/:id`, không gây breaking change cho màn hình GRN list hay PO list. |

## Vấn đề
- [MEDIUM] UX khi quét barcode chưa có trong đơn PO: Khi nhân viên quét barcode một sản phẩm ngoài PO, cần thông báo rõ ràng là sản phẩm không thuộc đơn PO này thay vì tự ý thêm dòng.
  - *Đề xuất*: Hiển thị toast thông báo cảnh báo màu vàng/cam: "Mã vạch [SKU-XXX] không có trong đơn đặt hàng PO này!" và ngăn tự động thêm dòng để tránh sai lệch đơn đặt.
- [LOW] Hiển thị định dạng tiền tệ: Đảm bảo toàn bộ các ô nhập tiền (Landed cost, đơn giá, chiết khấu) đều có format phân cách hàng nghìn `vi-VN` rõ ràng.

## Kết luận: Chấp nhận
Các vấn đề nêu trên là hoàn thiện trải nghiệm UX, không có vấn đề nghiêm trọng [HIGH]. Specs đã sẵn sàng để lập task và tiến hành triển khai code.
