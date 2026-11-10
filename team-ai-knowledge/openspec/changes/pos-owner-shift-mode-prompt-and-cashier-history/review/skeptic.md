# Skeptic Review: pos-owner-shift-mode-prompt-and-cashier-history

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| **D1 Completeness** | 5/5 | Đầy đủ mọi kịch bản: chọn bán vào ca, bán riêng, chi nhánh chưa có ca, fallback khi ca bị thu ngân đóng giữa chừng, và bảo toàn template in hóa đơn. |
| **D2 Correctness** | 5/5 | Đã đính chính chính xác mô hình schema `ShiftParticipants` (Zero Migration, sử dụng `FullName`/`UserName`), công thức tính động của `ExpectedCash`, và cơ chế định tuyến dòng tiền `Till` vs `Safe`. |
| **D3 Coherence** | 5/5 | Đồng nhất hoàn toàn giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. |
| **D4 Constraints** | 5/5 | Đã bổ sung validation chặt chẽ cho `request.ShiftId` tại `OrderService.cs` (từ chối ca đã đóng hoặc không hợp lệ); lưu session key có tiền tố `branchId`. |
| **D5 Blast Radius** | 5/5 | Khoanh vùng chính xác phạm vi đổi font số (chỉ áp dụng cho POS catalog, input modal, shift history), giữ nguyên font monospace cho template in nhiệt tránh vỡ layout. |

## Các Vấn Đề Đã Xử Lý
- [HIGH] Schema `ShiftParticipants` không có cột `Role`: Đã cập nhật spec dùng trường `FullName`/`UserName` sẵn có, cam kết Zero Migration.
- [HIGH] Lỗ hổng validation `request.ShiftId`: Đã bổ sung ràng buộc kiểm tra `activeShift != null`, `Status == Open`, và `Id == request.ShiftId`.
- [MEDIUM] Cơ chế `ExpectedCash`: Đã làm rõ đây là metric tính toán động từ orders và cash movements, không gán đè trực tiếp trong `OrderService`.
- [MEDIUM] Ca đóng giữa chừng & scope session key: Đã bổ sung scenario tự động fallback về `shiftless` và scope key theo `${branchId}`.
- [MEDIUM] Nguy cơ vỡ layout in nhiệt: Đã khoanh vùng chỉ đổi font trên UI, giữ nguyên monospace cho bill in nhiệt.
- [LOW] Đóng modal không chọn: Đã quy định modal `maskClosable={false}`, `closable={false}`.

## Kết luận: Chấp nhận (Approved)
Specs đã hoàn thiện, logic chặt chẽ, an toàn về mặt dữ liệu và sẵn sàng triển khai lập trình.
