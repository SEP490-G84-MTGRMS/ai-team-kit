# EXP-2026-11-08-001: Khảo sát Kiến trúc Điểm danh Check-in / Check-out AI FaceID & Thủ công

## 1. Problem Statement
Tại các siêu thị mini và cửa hàng tạp hóa MT-GRMS, hoạt động điểm danh nhân viên vào ca (`Check-in`) và ra ca (`Check-out`) đối mặt với các vấn đề:
1. Gian lận chấm công (điểm danh hộ qua mã QR, quẹt thẻ hoặc ứng dụng GPS từ xa).
2. Tắc nghẽn tại quầy thu ngân nếu giải pháp nhận diện khuôn mặt gửi stream video lên máy chủ (Server-side) do băng thông mạng quầy bán lẻ yếu và chi phí máy chủ GPU Cloud quá tốn kém.
3. Rời rạc giữa việc điểm danh với phiên ca bán hàng POS (nhân viên chưa điểm danh vẫn bán hàng, hoặc về rồi nhưng chưa kết ca kiểm đếm tiền).
4. Sai lệch ngày công khi nhân viên nghỉ phép có lương (`PAID_LEAVE`) hoặc gặp sự cố nhận diện khuôn mặt dẫn đến bị trừ lương oan.

## 2. Context & Background
- **Hệ thống hiện tại:** Đã có lịch làm việc và bảng chấm công trong [`EmployeeSchedule.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/HR/EmployeeSchedule.cs). Quản lý phiên ca thu ngân qua [`ShiftZReport.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Finance/ShiftZReport.cs).
- **Tài liệu tham chiếu:**
  - BRS nhân sự: [`doc/Require/Nhan Vien/DacTa_NghiepVu_QuanLyNhanVien.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/DacTa_NghiepVu_QuanLyNhanVien.md)
  - Kiến trúc AI: [`doc/Require/Nhan Vien/GiaiPhap_CheckIn_KhuonMat_AI_FaceID.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/GiaiPhap_CheckIn_KhuonMat_AI_FaceID.md)
  - Đặc tả prompt: [`doc/Require/Nhan Vien/Prompt_TrienKhai_CheckIn_CheckOut_FaceID.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/Prompt_TrienKhai_CheckIn_CheckOut_FaceID.md)

## 3. Constraints
- Chi phí hạ tầng server máy chủ AI = 0 VNĐ (không đầu tư GPU Cloud đắt đỏ).
- Tốc độ nhận diện phản hồi $\le 1.0$ giây ngay tại màn hình Web POS để không làm gián đoạn dòng khách mua hàng.
- Bắt buộc tuân thủ nguyên tắc Privacy-First: không truyền video stream trực tiếp qua internet.
- Tương thích React 18 / 19, Vite, TypeScript, và ASP.NET Core 8 Web API.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi quầy thu ngân POS có trang bị webcam hoặc camera gắn liền với máy tính bán hàng với độ phân giải tối thiểu 720p.
- **[ASSUMPTION-02]**: Mỗi nhân viên làm việc đã được chụp ảnh chân dung chuẩn và đăng ký trích xuất mảng vector 128 số thực (`FaceDescriptor`) vào hồ sơ nhân viên `Employees`.
- **[ASSUMPTION-03]**: Số lượng nhân viên trực trong một ca tại 1 chi nhánh thường từ 2 đến 10 người, danh sách vector trong ngày có thể tải về bộ nhớ đệm (Cache) của trình duyệt POS rất nhẹ (< 50 KB).

## 5. Scope & Non-Goals

### In Scope
- Client-side AI trên nền tảng `@vladmandic/face-api` tải 3 pre-trained models (~6.8 MB) vào bộ nhớ cache trình duyệt.
- Cơ chế chống gian lận người thật (Liveness Detection) dựa trên tỷ lệ mí mắt chớp $\text{EAR} < 0.18$.
- So khớp vector Euclidean / Cosine Similarity với độ tin cậy $\ge 85.00\%$.
- Luồng Check-in kích hoạt quyền mở phiên thu ngân trên máy POS.
- Luồng Check-out ràng buộc bắt buộc phiên ca bán hàng `ShiftZReport` đã `Closed`.
- Chấm công thủ công 3 tiêu chí của Chủ cửa hàng (*Đi làm* tự động điền giờ ca mặc định nếu trống, *Nghỉ phép có lương* bảo toàn giờ công, *Nghỉ không lương* 0 giờ công).
- Cơ chế gửi đơn báo sự cố chấm công khi FaceID lỗi để Chủ duyệt bù công.

### Non-Goals (Out of Scope)
- Không dùng nhận diện khuôn mặt tập trung trên Cloud Server GPU.
- Không sử dụng điểm danh bằng GPS từ xa hoặc quét mã QR cá nhân.
- Không kết nối phần cứng máy chấm công vân tay độc lập của hãng thứ ba.

## 6. Khảo sát & So sánh các Phương án Kỹ thuật

| Tiêu chí | Phương án 1: Client-side AI (`@vladmandic/face-api`) | Phương án 2: Server-side AI (Gửi Stream/Ảnh lên Server) | Phương án 3: Quét QR Code / GPS từ xa |
|---|---|---|---|
| **Độ trễ (Latency)** | **< 1.0 giây** (Xử lý trực tiếp WebGL/Wasm) | 2–5 giây (Phụ thuộc băng thông upload) | < 1 giây |
| **Chi phí máy chủ** | **0 VNĐ** (Chạy trên CPU/iGPU máy POS) | Rất cao (GPU Cloud AWS G4dn / Azure NV) | Rất thấp |
| **Chống gian lận** | **Rất cao** (Kiểm tra chớp mắt Liveness + Đối soát camera quầy) | Trung bình (Khó bắt liveness frame mượt) | Rất kém (Chụp mã QR gửi nhau, fake GPS) |
| **Bảo mật quyền riêng tư** | **Tối đa** (Video không truyền qua mạng, chỉ gửi 1 ảnh snapshot) | Kém (Phải truyền luồng video qua internet) | Trung bình |
| **Độ tin cậy khi mạng chập chờn** | **Hoạt động ổn định tại chỗ** | Gián đoạn toàn bộ khi nghẽn mạng | Chậm |

### Phương án Lựa chọn:
**Chọn Phương án 1 (Client-side AI với `@vladmandic/face-api`) kết hợp Phương án Chấm công thủ công 3 tiêu chí của Chủ cửa hàng làm cơ chế dự phòng.**

## 7. Rủi ro Kỹ thuật & Biện pháp Giảm thiểu

1. **Rủi ro ánh sáng quầy tạp hóa bị tối hoặc lóa đèn:**
   - *Giảm thiểu:* Hướng dẫn đặt góc camera POS tiêu chuẩn; nếu điểm tin cậy $< 85\%$, hệ thống kích hoạt luồng ngoại lệ: Nhân viên gửi đơn sự cố chấm công kèm ảnh hiện trường để Chủ duyệt.
2. **Rủi ro nhân viên giơ ảnh chụp điện thoại của đồng nghiệp:**
   - *Giảm thiểu:* Thuật toán Liveness EAR bắt buộc có ít nhất 1 lần nháy mắt tự nhiên ($\text{EAR} < 0.18$) trong khung thời gian 100ms - 250ms thì mới kích hoạt so khớp.
3. **Rủi ro quên đóng ca bán hàng POS mà đã về:**
   - *Giảm thiểu:* Hệ thống chặn tuyệt đối nút Check-out nếu ca POS của nhân viên đang ở trạng thái `Open`.

## 8. Success Criteria
- [ ] Thời gian nhận diện và phản hồi $\le 1.0$ giây.
- [ ] Tỷ lệ chặn ảnh tĩnh đạt 100%.
- [ ] Ngưỡng tương đồng kiểm soát nghiêm ngặt $\ge 85.00\%$.
- [ ] Lưu vết đầy đủ 100% snapshot ảnh Check-in/Check-out.
- [ ] Chấm công thủ công tự động điền giờ ca mặc định khi để trống.
