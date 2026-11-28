# Guardian Review: attendance-faceid-checkin-checkout

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Mọi truy vấn lịch làm việc, ca POS và nhân viên đều bắt buộc lọc qua `TenantId` và `BranchId`. Endpoint `today-descriptors` kiểm tra `BranchId` và `TenantId` từ token đăng nhập. |
| AuthN/AuthZ | OK | Điểm danh FaceID tại POS yêu cầu token nhân viên hợp lệ hoặc token quầy POS. Chấm công thủ công và đăng ký avatar giới hạn cho vai trò `STORE_OWNER`, `ADMIN`, `STORE_MANAGER`. |
| Validation | OK | Dữ liệu `FaceDescriptor` kiểm tra đúng cấu trúc chuỗi JSON mảng số thực 128 phần tử. Snapshot ảnh được nén client-side, backend kiểm tra kích thước trước khi stream lên Cloudinary. |
| Toàn vẹn dữ liệu | OK | Giao dịch check-in / check-out bọc trong Entity Framework Transaction, kiểm tra trạng thái ca `InShift`, `Completed` tránh ghi đè dữ liệu. Ràng buộc `ShiftZReport` bắt buộc `Closed` mới cho Check-out. |
| Vận hành & audit | OK | Lưu trữ đầy đủ `CheckInTime`, `CheckOutTime`, `CheckInMethod`, `CheckOutMethod`, `CheckInFaceImageUrl`, `CheckOutFaceImageUrl`, và `FaceMatchScore` phục vụ kiểm tra đối soát chéo bất kỳ lúc nào. |

## Vấn đề
- [LOW] Cần đảm bảo Cloudinary credentials được cấu hình qua biến môi trường an toàn, có fallback nếu Cloudinary tạm thời mất kết nối (ghi nhận điểm danh thành công với thông báo ảnh chờ đồng bộ).

## Kết luận: An toàn
