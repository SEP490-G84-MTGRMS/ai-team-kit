# Proposal: attendance-faceid-checkin-checkout

## Vấn đề
- Hiện tại, việc điểm danh nhân viên vào và ra ca tại cửa hàng bán lẻ tạp hóa MT-GRMS chủ yếu dựa vào ghi chép thủ công hoặc chưa có giải pháp chống gian lận hiệu quả (như quẹt thẻ, định vị GPS từ xa có thể nhờ người khác làm hộ).
- Các giải pháp AI Server-side nhận diện khuôn mặt yêu cầu chi phí máy chủ GPU đắt đỏ và đường truyền internet băng thông lớn, dễ gây nghẽn mạng và gián đoạn vận hành tại quầy thu ngân POS.
- Cần chuẩn hóa quy trình điểm danh độc lập, minh bạch, vận hành linh hoạt cho mọi vị trí nhân viên trong cửa hàng (thu ngân, kiểm kho, phụ việc) và liên thông chính xác với động cơ tính ngày công/giờ công trong bảng lương.

## Mục tiêu
- Xây dựng hệ thống chấm công vào ca (Check-in) và ra ca (Check-out) chuẩn hóa với đúng 2 phương thức:
  1. **AI FaceID Client-side trực tiếp trên trình duyệt Web POS**: Sử dụng `@vladmandic/face-api`, chi phí hạ tầng server 0 VNĐ, nhận diện tức thì (< 1 giây), cơ chế huấn luyện đa ảnh (tối đa 4 ảnh mẫu) trích xuất mảng vector 128 số thực, so khớp bằng `faceapi.FaceMatcher` với ngưỡng khoảng cách Euclid $\le 0.50$ (`DISTANCE_THRESHOLD = 0.5`), lưu snapshot ảnh thực tế vào `EmployeeSchedules`.
  2. **Chủ cửa hàng trực tiếp chấm công 3 tiêu chí**: (1) Đi làm (tự động lấy giờ ca ban đầu nếu để trống), (2) Nghỉ phép hưởng lương (tính đủ giờ công `PAID_LEAVE`), (3) Nghỉ không lương (`UNPAID_LEAVE`).
- Vận hành điểm danh độc lập, linh hoạt: Không áp đặt ràng buộc cứng nhắc với phiên thu ngân POS (`ShiftZReport`), đảm bảo phù hợp cho mọi vai trò nhân viên trong cửa hàng.
- Tự động hóa tính toán số phút đi muộn (`LateMinutes`), về sớm (`EarlyLeaveMinutes`), tổng giờ làm thực tế (`ActualWorkHours`) cập nhật trực tiếp inline trong `EmployeeSchedules` phục vụ tính bảng lương tự động.
- Cung cấp kênh giải trình sự cố chấm công khi FaceID gặp lỗi, chuyển tiếp cho Chủ cửa hàng duyệt bù công.

## Phạm vi

### In scope
- **Mô hình AI Client-side & Huấn luyện Đa ảnh:** Tích hợp bộ 3 pre-trained models (`TinyFaceDetector`, `FaceLandmark68Net`, `FaceRecognitionNet`) lưu trữ tĩnh tại client frontend. Huấn luyện đa ảnh (lên đến 4 ảnh mẫu góc mặt khác nhau) trích xuất mảng các vector đặc trưng 128 số thực `[[n1..n128], ...]`.
- **Tính năng Check-in:** Nhận diện khuôn mặt tại camera POS theo ngưỡng khoảng cách Euclid $\le 0.50$, đối chiếu vector với danh sách nhân viên có ca trong ngày, chụp snapshot lưu vết bằng chứng, tính phút đi muộn thực tế.
- **Tính năng Check-out:** Nhận diện khuôn mặt tại camera POS theo khoảng cách Euclid $\le 0.50$, chụp snapshot kết thúc ca, tính tổng số giờ làm việc thực tế `ActualWorkHours`, cập nhật trạng thái ca sang `Completed`.
- **Chấm công thủ công 3 tiêu chí:** Modal cho phép Chủ cửa hàng trực tiếp chấm công linh hoạt, hỗ trợ ca qua đêm và gán giờ mặc định khi để trống.
- **Đăng ký vector khuôn mặt đa ảnh (Face Registration):** Giao diện và API tải tối đa 4 ảnh chân dung nhân viên, trích xuất và lưu mảng vector 128 số thực vào hồ sơ nhân viên `Employees` (`FaceDescriptor`, `FaceImageUrls`, `FaceRegisteredAt`).
- **API Backend .NET 8:** Các endpoints cung cấp danh sách vector nhân viên trong ngày theo chi nhánh, tiếp nhận kết quả điểm danh FaceID kèm kiểm tra ngưỡng khoảng cách Euclid $\le 0.50m$, lưu trữ ảnh snapshot bằng chứng, và endpoint chấm công thủ công.

### Out of scope
- Ràng buộc chặn đóng/mở phiên bán hàng POS (`ShiftZReport`) theo trạng thái Check-in/Check-out (tách biệt để vận hành linh hoạt).
- Điểm danh bằng GPS từ xa hoặc quét mã QR cá nhân (đã loại bỏ khỏi kiến trúc để chống gian lận).
- Nhận diện khuôn mặt qua máy chủ GPU Cloud (server-side stream).
- Tích hợp máy chấm công vân tay phần cứng chuyên dụng độc lập của bên thứ ba.

## Người dùng liên quan
- **Nhân viên thu ngân / Bán hàng / Kho (Staff):** Tự điểm danh vào/ra ca nhanh chóng tại camera quầy POS trước và sau ca làm việc; gửi đơn sự cố chấm công nếu gặp trục trặc nhận diện.
- **Chủ cửa hàng (Store Owner):** Đăng ký khuôn mặt đa ảnh cho nhân viên; trực tiếp chấm công thủ công hoặc phê duyệt các yêu cầu sự cố chấm công của nhân viên trên Bảng chấm công.

## Tiêu chí thành công
- [ ] Thời gian nhận diện và phản hồi Check-in / Check-out trên trình duyệt POS $\le 1.0$ giây.
- [ ] Ngưỡng khoảng cách Euclid nhận diện khuôn mặt được kiểm soát chặt chẽ $\le 0.50$ (`FaceMatchScore` lưu khoảng cách Euclid $\le 0.50m$).
- [ ] Điểm danh vận hành độc lập, không bị chặn bởi trạng thái của ca bán hàng POS.
- [ ] 100% các ca điểm danh thành công đều lưu vết ảnh chụp thực tế (`CheckInFaceImageUrl`, `CheckOutFaceImageUrl`) trong `EmployeeSchedules`.
- [ ] Chấm công thủ công khi để trống giờ vào/ra tự động điền chính xác theo `PlannedStartTime` và `PlannedEndTime` của ca ban đầu.
- [ ] Dữ liệu giờ làm `ActualWorkHours` và các loại nghỉ phép `PAID_LEAVE` liên thông chính xác sang Động cơ tính bảng lương tháng.
