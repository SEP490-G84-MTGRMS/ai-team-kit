# Đánh giá phản biện (Skeptic Review) — pos-cash-control-and-pos-ux-refinements

## 1. Đánh giá 5 chiều (5 Dimensions Evaluation)

### D1: Completeness (Tính đầy đủ) — 9.5/10
- Bộ 10 Requirements bao quát triệt để tất cả các điểm đau (pain points) mà người dùng nêu ra: từ tinh chỉnh UX (xóa nút thừa, mockup, lặp lại) đến nghiệp vụ cốt lõi (kiểm soát âm két, chọn đơn vị tính quy đổi, khóa POS khi chưa mở ca, xem chi tiết phiên ca kèm lý do chênh lệch, và cơ chế thu nợ tiền mặt độc lập theo ca trực).

### D2: Correctness (Tính đúng đắn) — 10/10
- Root cause đã được định vị chính xác tới từng dòng code:
  - `PosHeader.tsx` (L536-L565): Nút mockup alert.
  - `InvoiceManagementPage.tsx` (L1235-L1277): Accordion lặp nút action bar ngoài bảng.
  - `CashMovementModal.tsx` & `ShiftService.cs`: Thiếu invariant `OUT <= DrawerCash`.
  - `PosCheckoutPage.tsx` (L400): Thiếu guard `!currentShift`.
  - `CollectDebtModal.tsx`: Hardcode cashier name, chưa đẩy tiền vào ca mở.
- Giải pháp sửa đúng tận gốc nguyên nhân, không chắp vá.

### D3: Coherence (Tính nhất quán) — 10/10
- Hoàn toàn nhất quán với Clean Architecture của Backend (`ShiftService`, `ProductUnits`, `ShiftCashMovements`) và kiến trúc phân hệ Frontend (`pos`, `store-owner-dashboard`).
- Kế toán tiền két tách biệt rõ ràng giữa Snapshot người tạo đơn ban đầu và Người thu nợ tại ca hiện tại, tuân thủ nguyên tắc kế toán kép.

### D4: Constraints (Ràng buộc hệ thống) — 10/10
- Không làm thay đổi schema database (không cần EF Core migration mới).
- Giữ vững toàn vẹn logic bán hàng, chiết khấu, quét barcode và lô FEFO.

### D5: Blast Radius (Tác động lan tỏa) — Thấp / An toàn (2/10)
- Tác động chủ yếu khu trú ở giao diện POS và một hàm nghiệp vụ trong `ShiftService.cs` (`AddCashMovementAsync`).
- Không ảnh hưởng đến các module nhân sự, kho vận hay nhà cung cấp.

---

## 2. Phân tích chi tiết rủi ro & giải pháp phòng ngừa

| Hạng mục rủi ro | Mức độ | Biện pháp phòng ngừa |
|---|---|---|
| Khóa POS khi chưa mở ca có làm gián đoạn chủ cửa hàng khi chỉ muốn vào xem giao diện? | LOW | Hiển thị modal/banner mở ca với nút "Về Dashboard" rõ ràng để Chủ có thể quay lại trang quản trị nếu không muốn mở ca bán hàng. |
| Kiểm tra tiền két khi lập phiếu chi có tính nhầm tiền chuyển khoản? | LOW | Công thức kiểm tra chỉ lấy tiền mặt: `shift.OpeningFloat + cashSales + shift.TotalCashIn - shift.TotalCashOut` (không tính `bankRevenue`). |
| Đơn vị tính quy đổi của sản phẩm chưa có trong DB thì sao? | LOW | Mặc định fallback về đơn vị cơ sở `unitName = item.unitName || 'Cái'`, `conversionRate = 1`, đảm bảo không bao giờ bị lỗi NaN hoặc undefined. |

---

## 3. Kết luận
- **Trạng thái**: **CHẤP NHẬN (PASS)**
- Đã sẵn sàng lập danh sách công việc (`tasks.md`) và triển khai code.
