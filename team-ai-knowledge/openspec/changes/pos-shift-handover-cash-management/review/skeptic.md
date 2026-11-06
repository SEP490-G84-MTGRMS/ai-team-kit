# Báo Cáo Phản Biện Độc Lập (Skeptic Review): Quản Lý Ca POS & Thu Chi Két

## 1. Đánh Giá Theo 5 Tiêu Chí (D1 – D5)

| Tiêu chí (Dimension) | Điểm | Nhận xét chi tiết |
|---|:---:|---|
| **D1: Completeness (Đầy đủ)** | 5/5 | Bao quát toàn diện vòng đời ca: Mở ca, Thu chi lẻ trong ca, Gắn ShiftId vào đơn hàng, Chốt ca đếm tiền, Bàn giao ca và Xác nhận/Khiếu nại ca sau. |
| **D2: Correctness (Đúng đắn)** | 5/5 | Công thức tính tiền lý thuyết $G = A + B + C - D - E$ chuẩn xác; ràng buộc bất biến $Retained + Dropped = H$ chống thất thoát tiền mặt; chuỗi tiền khép kín nhờ `PrevShiftId` và `OpeningFloatExpected`. |
| **D3: Coherence (Nhất quán)** | 5/5 | Nhất quán với Clean Architecture 4 tầng của backend (.NET 8) và phân quyền vai trò POS (`STORE_OWNER` vs `EMPLOYEE`). |
| **D4: Constraints (Ràng buộc)** | 5/5 | Đảm bảo tính duy nhất: 1 quầy chỉ mở 1 ca tại 1 thời điểm; mọi giao dịch tiền mặt đều có người tạo `CreatedBy` và timestamp UTC. |
| **D5: Blast Radius (Phạm vi ảnh hưởng)** | 5/5 | An toàn: Chỉ thêm 1 thực thể con `ShiftCashMovement`, bổ sung trường trên `ShiftZReport` và thêm `Order.ShiftId` (nullable, không ảnh hưởng đơn cũ). |

## 2. Các Vấn Đề Phản Biện & Giải Pháp (Issues & Mitigations)

### Vấn đề 1: Đơn hàng thanh toán khi chưa mở ca (Severity: MEDIUM)
- **Rủi ro**: Nếu thu ngân bán hàng khi chưa mở ca, `Order.ShiftId` sẽ bị null và tiền bán hàng không vào két ca nào.
- **Giải pháp**: Trong `OrderService`, khi thực hiện tạo đơn bán lẻ tại quầy, kiểm tra nếu có ca đang mở thì tự động gán `ShiftId`; nếu quầy chưa mở ca, trả về thông báo lỗi hướng dẫn thu ngân mở ca trước khi thanh toán.

### Vấn đề 2: Bấm chốt ca đồng thời hoặc đơn hàng phát sinh đúng lúc đang chốt ca (Severity: LOW)
- **Rủi ro**: Race condition khi nhiều request tới cùng lúc.
- **Giải pháp**: Chuyển trạng thái ca sang `Closing` hoặc khóa transaction khi tính tổng $B$, sau đó ghi `Closed`.

## 3. Kết Luận
- **Kết luận**: **CHẤP NHẬN (PASS)**.
- Đủ điều kiện triển khai theo bảng nhiệm vụ `tasks.md`.
