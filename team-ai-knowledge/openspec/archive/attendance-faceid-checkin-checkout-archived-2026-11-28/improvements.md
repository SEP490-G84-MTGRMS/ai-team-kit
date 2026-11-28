# Improvements: attendance-faceid-checkin-checkout

## Spec · 2026-11-08 15:55

Bám sát Prompt_TrienKhai_CheckIn_CheckOut_FaceID.md và tài liệu BRS để triển khai đúng 2 phương thức điểm danh.

## Brainstorm · 2026-11-08 16:42

Tách riêng 2 loại đơn CheckInIncident (2) và CheckOutIncident (5), cơ chế Optimistic Bypass kích hoạt CheckInTime tức thì mở ca POS bán hàng

## Verify Spec · 2026-11-08 16:49

Bổ sung quy định xử lý khi Chủ từ chối đơn Check-in (bảo toàn hóa đơn POS, hủy giờ công) và nén ảnh snapshot client-side <= 500KB

## Verify Spec · 2026-11-09 08:30

Chuẩn hóa cơ chế FaceMatcher khoảng cách Euclid và tự động hóa trích xuất vector từ ảnh avatar
