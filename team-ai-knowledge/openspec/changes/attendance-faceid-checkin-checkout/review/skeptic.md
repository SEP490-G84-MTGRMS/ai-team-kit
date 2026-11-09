# Skeptic Review: attendance-faceid-checkin-checkout

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đầy đủ các luồng: FaceMatcher theo khoảng cách Euclid, nút xác nhận luôn hiển thị, trích xuất vector tự động khi upload avatar, ràng buộc đóng ca POS Z-Report, và graceful fallback policy. |
| D2 Correctness | 5/5 | Chuẩn hóa theo `TUTORIAL.md`. Hằng số `DISTANCE_THRESHOLD = 0.6` đảm bảo tính toán khoảng cách Euclid chính xác; backend chấp nhận `FaceMatchScore >= 70%` tương ứng. |
| D3 Coherence | 5/5 | Thống nhất giữa `Prompt_TrienKhai_CheckIn_CheckOut_FaceID.md`, `specs.md` và mã nguồn triển khai thực tế. Loại bỏ đăng ký khuôn mặt thủ công riêng rẽ và điều kiện chớp mắt cứng. |
| D4 Constraints | 5/5 | Tối ưu hóa hiệu năng cao: tính vector 1 lần duy nhất tại avatar upload, lưu JSON 128 số thực. Điểm danh tại POS chỉ tải mảng vector, không load ảnh gốc. Ảnh snapshot nén Base64 JPEG trước khi upload. |
| D5 Blast Radius | 5/5 | Các cột dữ liệu mới là nullable, bảo toàn toàn vẹn dữ liệu ca làm và nhân sự cũ. Bộ kiểm thử 514/514 unit tests pass 100%. |

## Vấn đề
- [MEDIUM] REQ-ATT-04: Xử lý thông báo khi ảnh tải lên không phát hiện được khuôn mặt (hoặc góc nghiêng/quá mờ). → Đề xuất: Trong `EmployeeFormModal.tsx`, hiển thị thông báo toast màu vàng nếu không trích xuất được vector để quản lý chọn ảnh góc chụp thẳng rõ hơn.
- [LOW] REQ-ATT-01: Giải phóng WebCam stream và canvas context khi đóng modal để giải phóng bộ nhớ trên máy POS. → Đề xuất: Kiểm tra kỹ hàm cleanup `stream.getTracks().forEach(t => t.stop())` trong `FaceIdAttendanceModal.tsx`.

## Kết luận: Chấp nhận
