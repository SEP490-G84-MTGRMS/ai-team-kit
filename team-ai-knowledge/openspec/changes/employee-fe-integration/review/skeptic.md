# Skeptic Review: employee-fe-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ toàn bộ các luồng Frontend phân hệ nhân viên: CRUD nhân viên, phân trang server-side dùng chung `TablePagination`, upload ảnh Cloudinary, xem chi tiết 360 độ, đổi trạng thái hoạt động, cấp tài khoản Identity, cấu hình ca `ShiftConfig`, và bộ modal dùng chung `ConfirmModal`, `NotificationModal`. Xử lý trọn vẹn lỗi nghiệp vụ `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03). |
| D2 Correctness | 5/5 | Khớp nối chính xác 100% với Backend `employee-management-backend`. Loại bỏ triệt để 2 lỗi EF Core nghiêm trọng từ phía Frontend bằng cách kiểm tra Regex UUID trên `allowance.id`: phụ cấp mới sinh ID tạm `al_timestamp` được gán thành `undefined` (tránh lỗi 0 rows affected / `DbUpdateConcurrencyException`), phụ cấp cũ giữ nguyên ID UUID, và phụ cấp bị bỏ chọn/xóa bị loại khỏi payload. |
| D3 Coherence | 5/5 | Đồng nhất hoàn hảo giữa các DTOs trong `employeeMapper.ts`, `employeeApi.ts`, `shiftConfigApi.ts` với các API Controller của Backend (`EmployeesController`, `ShiftConfigsController`, `MediaController`). |
| D4 Constraints | 5/5 | Kiểm tra định dạng ảnh $\le 5\text{MB}$, chuẩn hóa ngày hiển thị theo `DD/MM/YYYY`, bảo vệ thao tác xóa bằng `ConfirmModal` bắt buộc xác nhận. |
| D5 Blast Radius | 5/5 | Các component `ConfirmModal` và `NotificationModal` được thiết kế dùng chung trong `src/components/common/`, kế thừa phong cách từ `product` và có thể tái sử dụng rộng rãi mà không gây xung đột css hay phá vỡ layout. |

## Vấn đề đã xử lý
- [HIGH] Lỗi `DbUpdateConcurrencyException` trên Backend khi người dùng vừa sửa phụ cấp cũ vừa thêm phụ cấp mới:
  - *Giải pháp:* Tại `employeeMapper.mapFormToCreatePayload`, thêm kiểm tra Regex UUID `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`. Nếu không phải UUID hợp lệ (do UI sinh tạm `al_xxx`), gán `id = undefined` để Backend nhận diện INSERT bản ghi mới.
- [HIGH] Quy tắc nghiệp vụ `BR-EMP-03`: Ngăn chặn xóa nhân viên có lịch làm việc hoặc phiếu lương:
  - *Giải pháp:* Bắt mã lỗi `EMPLOYEE_HAS_WORK_HISTORY` (HTTP 400) trong hàm `handleConfirmDeleteEmployee`, mở `NotificationModal` loại cảnh báo giải thích rõ ràng và hướng dẫn người dùng chuyển sang "Ngừng làm việc".
- [MEDIUM] Trải nghiệm phản hồi sau các thao tác tạo, cập nhật, đổi trạng thái:
  - *Giải pháp:* Sử dụng `NotificationModal` dùng chung với thông báo trực quan, thay thế các toast thông báo trôi nhanh.

## Kết luận: Chấp nhận
Thông số kỹ thuật và triển khai Frontend hoàn toàn ăn khớp với Backend, code đã kiểm chứng `npm run build` thành công 0 lỗi.
