# Đánh Giá Phản Biện (Skeptic Review): pos-strict-employee-schedule-check

## 1. Chấm Điểm 5 Chiều Chất Lượng (Dimensions Evaluation)

| Chiều Đánh Giá | Điểm (1–5) | Nhận Xét Của Skeptic |
|---|:---:|---|
| **D1: Completeness (Đầy đủ)** | 5/5 | Đặc tả đã bao phủ đủ các kịch bản: nhân viên đúng ca, nhân viên sai ca/sai giờ, đến sớm/ở lại muộn trong dung sai, và trường hợp chủ cửa hàng miễn trừ. |
| **D2: Correctness (Đúng đắn)** | 5/5 | Logic thời gian UTC+7 chuyển đổi chính xác, phân định rõ ràng giữa ca ban ngày thông thường và ca qua đêm (`IsCheckInNextDay`). |
| **D3: Coherence (Nhất quán)** | 5/5 | Khớp hoàn toàn với cấu trúc bảng `EmployeeSchedules`, hồ sơ `Employee` và kiến trúc `OrderService`, `ShiftService`. |
| **D4: Constraints (Ràng buộc)** | 5/5 | Không can thiệp vào chấm công AI FaceID hay tính lương `Payslip`; đảm bảo multi-tenancy `TenantId` và phân quyền role. |
| **D5: Blast Radius (Phạm vi ảnh hưởng)** | 5/5 | Phạm vi ảnh hưởng khu trú tại khâu kiểm tra điều kiện mở ca và tạo đơn POS, không gây tác động tiêu cực đến các luồng bán hàng khác hay luồng của Quản lý / Chủ. |

## 2. Các Vấn Đề Xem Xét (Findings & Mitigations)

### Vấn Đề 1 (Medium): Múi Giờ Máy Chủ vs Múi Giờ Việt Nam
- **Rủi ro**: Nếu server chạy UTC mà lấy `DateTime.UtcNow.Date` so sánh với `WorkDate` thì từ 00:00 đến 07:00 sáng giờ VN sẽ bị lệch 1 ngày.
- **Giải pháp**: Bắt buộc cộng thêm 7 tiếng (`nowUtc.AddHours(7)`) hoặc sử dụng `TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")` trước khi trích xuất `Date` và `TimeOfDay`.

### Vấn Đề 2 (Low): Dung Sai Mở / Chốt Ca
- **Rủi ro**: Thu ngân đến sớm 10 phút để nhận bàn giao két hoặc ở lại thêm 15 phút để kiểm đếm nếu bị chặn thì không thể mở/chốt ca.
- **Giải pháp**: Thiết lập dung sai cố định 30 phút trước giờ bắt đầu ca và 30 phút sau giờ kết thúc ca.

## 3. Kết Luận (Conclusion)
**CHẤP NHẬN (APPROVED)**. Đặc tả và thiết kế chặt chẽ, sẵn sàng phân chia tasks để lập trình.
