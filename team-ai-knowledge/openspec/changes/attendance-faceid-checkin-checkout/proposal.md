# Proposal: attendance-faceid-checkin-checkout

## Vấn đề
- Hiện tại, việc điểm danh nhân viên vào và ra ca tại cửa hàng bán lẻ tạp hóa MT-GRMS chủ yếu dựa vào ghi chép thủ công hoặc chưa có giải pháp chống gian lận hiệu quả (như quẹt thẻ, định vị GPS từ xa có thể nhờ người khác làm hộ).
- Các giải pháp AI Server-side nhận diện khuôn mặt yêu cầu chi phí máy chủ GPU đắt đỏ và đường truyền internet băng thông lớn, dễ gây nghẽn mạng và gián đoạn vận hành tại quầy thu ngân POS.
- Thiếu sự liên thông tự động và minh bạch giữa hành động điểm danh vào/ra ca, việc mở/đóng phiên thu ngân POS và động cơ tính ngày công/giờ công trong bảng lương.

## Mục tiêu
- Xây dựng hệ thống chấm công vào ca (Check-in) và ra ca (Check-out) chuẩn hóa với đúng 2 phương thức:
  1. **AI FaceID Client-side trực tiếp trên trình duyệt Web POS**: Sử dụng `@vladmandic/face-api`, chi phí hạ tầng server 0 VNĐ, nhận diện tức thì (< 1 giây), kiểm tra người thật qua chớp mắt (Liveness EAR < 0.18) chống gian lận giơ ảnh tĩnh, so khớp vector đặc trưng 128 chiều với độ tin cậy $\ge 85\%$.
  2. **Chủ cửa hàng trực tiếp chấm công 3 tiêu chí**: (1) Đi làm (tự động lấy giờ ca ban đầu nếu để trống), (2) Nghỉ phép hưởng lương (tính đủ giờ công `PAID_LEAVE`), (3) Nghỉ không lương (`UNPAID_LEAVE`).
- Ràng buộc chặt chẽ với quy trình bán hàng POS: Nhân viên chỉ được mở ca POS sau khi đã Check-in hợp lệ, và bắt buộc phải hoàn tất Đóng ca Z-Report mới được phép Check-out ra ca.
- Tự động hóa tính toán số phút đi muộn (`LateMinutes`), về sớm (`EarlyLeaveMinutes`), tổng giờ làm thực tế (`ActualWorkHours`) cập nhật trực tiếp inline trong `EmployeeSchedules` phục vụ tính bảng lương tự động.
- Cung cấp kênh giải trình sự cố chấm công khi FaceID gặp lỗi, chuyển tiếp cho Chủ cửa hàng duyệt bù công.

## Phạm vi

### In scope
- **Mô hình AI Client-side:** Tích hợp bộ 3 pre-trained models (`TinyFaceDetector`, `FaceLandmark68Net`, `FaceRecognitionNet`) lưu trữ tĩnh tại client frontend.
- **Tính năng Check-in:** Nhận diện khuôn mặt tại camera POS, kiểm tra liveness chớp mắt, đối chiếu vector với danh sách nhân viên có ca trong ngày, chụp snapshot lưu vết bằng chứng, tính phút đi muộn, kích hoạt quyền mở phiên thu ngân.
- **Tính năng Check-out:** Kiểm tra điều kiện phiên ca POS đã `Closed`, nhận diện khuôn mặt, chụp snapshot kết thúc ca, tính tổng số giờ làm việc thực tế `ActualWorkHours`, cập nhật trạng thái ca sang `Completed`.
- **Chấm công thủ công 3 tiêu chí:** Modal cho phép Chủ cửa hàng trực tiếp chấm công linh hoạt, hỗ trợ ca qua đêm và gán giờ mặc định khi để trống.
- **Đăng ký vector khuôn mặt (Face Registration):** Giao diện và API chụp/tải ảnh chân dung nhân viên, trích xuất và lưu vector 128 số thực vào hồ sơ nhân viên `Employees`.
- **API Backend .NET 8:** Các endpoints cung cấp danh sách vector nhân viên trong ngày theo chi nhánh, tiếp nhận kết quả điểm danh FaceID, lưu trữ ảnh snapshot bằng chứng, và endpoint chấm công thủ công.

### Out of scope
- Điểm danh bằng GPS từ xa hoặc quét mã QR cá nhân (đã loại bỏ khỏi kiến trúc để chống gian lận).
- Nhận diện khuôn mặt qua máy chủ GPU Cloud (server-side stream).
- Tích hợp máy chấm công vân tay phần cứng chuyên dụng độc lập của bên thứ ba.

## Người dùng liên quan
- **Nhân viên thu ngân / Bán hàng (Staff):** Tự điểm danh vào/ra ca nhanh chóng tại camera quầy POS trước và sau ca làm việc; gửi đơn sự cố chấm công nếu gặp trục trặc nhận diện.
- **Chủ cửa hàng (Store Owner):** Đăng ký khuôn mặt cho nhân viên; trực tiếp chấm công thủ công hoặc phê duyệt các yêu cầu sự cố chấm công của nhân viên trên Bảng chấm công.

## Tiêu chí thành công
- [ ] Thời gian nhận diện và phản hồi Check-in / Check-out trên trình duyệt POS $\le 1.0$ giây.
- [ ] Tỷ lệ phát hiện gian lận ảnh tĩnh qua cơ chế chớp mắt (Liveness) đạt 100% (ảnh chụp smartphone không thể điểm danh).
- [ ] Ngưỡng độ tương đồng khuôn mặt được kiểm soát chặt chẽ $\ge 85.00\%$ (`FaceMatchScore`).
- [ ] Chặn tuyệt đối 100% hành vi Check-out ra ca khi phiên thu ngân POS chưa hoàn tất đóng ca (`ShiftState != Closed`).
- [ ] 100% các ca điểm danh thành công đều lưu vết ảnh chụp thực tế (`CheckInFaceImageUrl`, `CheckOutFaceImageUrl`) trong `EmployeeSchedules`.
- [ ] Chấm công thủ công khi để trống giờ vào/ra tự động điền chính xác theo `PlannedStartTime` và `PlannedEndTime` của ca ban đầu.
- [ ] Dữ liệu giờ làm `ActualWorkHours` và các loại nghỉ phép `PAID_LEAVE` liên thông chính xác sang Động cơ tính bảng lương tháng.
