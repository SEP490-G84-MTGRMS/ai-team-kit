# Skeptic Review: attendance-faceid-checkin-checkout

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4.5/5 | Đầy đủ 6 requirements chi tiết, có scenario GIVEN/WHEN/THEN cho cả trường hợp bình thường và ngoại lệ (chống giả mạo ảnh, quên đóng ca POS, chưa có policy). Cần làm rõ xử lý ca khi Chủ từ chối đơn Check-in đã mở ca. |
| D2 Correctness | 5/5 | Logic nghiệp vụ chính xác, công thức tính ActualWorkHours và LateMinutes rõ ràng, phân định đúng vai trò mở ca POS và kiểm soát gian lận. |
| D3 Coherence | 5/5 | Hoàn toàn nhất quán giữa proposal, exploration, design-brief, specs và 2 tài liệu đặc tả nghiệp vụ nhân viên. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối Privacy-First (Client-side AI, 0 VNĐ máy chủ GPU), đa tenant (TenantId/BranchId), nén ảnh snapshot. |
| D5 Blast Radius | 4.5/5 | Mở rộng tương thích ngược trên EmployeeSchedule và ScheduleApprovalRequest, liên thông chặt chẽ nhưng an toàn với ShiftZReport và PayrollManagement. |

## Vấn đề

- [MEDIUM] REQ-ATT-06: Khi nhân viên gửi đơn `CheckInIncident`, hệ thống áp dụng Optimistic Bypass để kích hoạt `CheckInTime = UtcNow` và mở ca POS ngay lập tức. Cần quy định rõ hậu quả nếu sau đó Chủ cửa hàng kiểm tra camera phát hiện gian lận và bấm **Từ chối (Reject)** đơn này.
  - *Đề xuất:* Khi Chủ Reject đơn CheckInIncident, hệ thống **bảo toàn 100% doanh thu hóa đơn bán lẻ** phát sinh trong ca POS để không sai lệch sổ sách tiền mặt/kho, nhưng **chuyển trạng thái ca chấm công thành Cancelled / Disputed với `ActualWorkHours = 0.00`** để không tính lương giờ công đó cho nhân viên vi phạm, đồng thời lưu vết lý do từ chối để làm căn cứ kỷ luật.

- [LOW] REQ-ATT-01: Quy định kích thước và định dạng ảnh snapshot tải lên (`CheckInFaceImageUrl`, `CheckOutFaceImageUrl`) để tránh làm nặng bộ nhớ lưu trữ và nghẽn băng thông quầy thu ngân.
  - *Đề xuất:* Client-side POS tự động nén ảnh từ Canvas thành định dạng JPEG tỉ lệ nén 0.8, kích thước tối đa 1280x720 và dung lượng $\le 500\text{ KB}$ trước khi gửi MultipartForm lên Backend.

## Kết luận: Chấp nhận
Specs đã rất chặt chẽ, giải quyết triệt để bài toán vận hành thực tế tại chuỗi tạp hóa (không để quầy thu ngân bị tê liệt khi lỗi camera, đồng thời vẫn giữ được chốt chặn đối soát của Chủ cửa hàng). Đã đủ điều kiện lập Tasks và triển khai.
