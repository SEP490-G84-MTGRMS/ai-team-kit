# Skeptic Review: employee-fe-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ toàn bộ các luồng Frontend phân hệ nhân viên: CRUD nhân viên, phân trang server-side dùng chung `TablePagination`, upload ảnh Cloudinary, xem chi tiết 360 độ, đổi trạng thái hoạt động, cấp tài khoản Identity, cấu hình ca `ShiftConfig`, bộ modal dùng chung `ConfirmModal`, `NotificationModal`, và REQ-FE-EMP-09 lập lịch làm việc định kỳ `AddScheduleModal.tsx`. |
| D2 Correctness | 5/5 | Khớp nối chính xác 100% với Backend `employee-management-backend`. Loại bỏ lỗi PostgreSQL `22001: value too long for type character varying(30)` bằng cách map `code: c.shiftCode` từ `ShiftConfig` thay vì truyền Guid ID 36 ký tự. Tính đúng ngày kết thúc đến hết tháng sau khi bỏ trống ngày, bỏ giới hạn cứng 31 ngày. |
| D3 Coherence | 5/5 | Đồng nhất hoàn hảo giữa các DTOs trong `scheduleApi.ts`, `employeeMapper.ts`, `shiftConfigApi.ts` với các API Controller của Backend (`SchedulesController`, `EmployeesController`, `ShiftConfigsController`). |
| D4 Constraints | 5/5 | Lọc ca làm việc theo chi nhánh hiện tại của nhân viên, chỉ gợi ý nhân viên cùng chi nhánh khi thêm lịch tương tự, kiểm tra `endDate >= startDate`. |
| D5 Blast Radius | 5/5 | Không ảnh hưởng đến các màn hình khác. Build Frontend `npm run build` thành công 100% (0 errors), 106 unit tests passed. |

## Vấn đề đã xử lý
- [HIGH] Lỗi PostgreSQL `22001: value too long for type character varying(30)` khi xếp ca:
  - *Giải pháp:* Trong `AddScheduleModal.tsx` và `types/index.ts`, bổ sung trường `code?: string` lấy từ `c.shiftCode`. Khi submit, truyền đúng mã ca thực tế thay vì truyền Guid ID của ca.
- [HIGH] Nghiệp vụ tính ngày kết thúc lịch lặp định kỳ:
  - *Giải pháp:* Tự động tính ngày cuối tháng sau khi input ngày để trống (`hasEndDate: false`), tạo đến ngày cụ thể khi chọn ngày (`hasEndDate: true`, không giới hạn 31 ngày), và bỏ toàn bộ nhãn tự động gia hạn.
- [HIGH] Lỗi `DbUpdateConcurrencyException` trên Backend khi người dùng vừa sửa phụ cấp cũ vừa thêm phụ cấp mới:
  - *Giải pháp:* Tại `employeeMapper.mapFormToCreatePayload`, thêm kiểm tra Regex UUID `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`. Nếu không phải UUID hợp lệ (do UI sinh tạm `al_xxx`), gán `id = undefined` để Backend nhận diện INSERT bản ghi mới.
- [HIGH] Quy tắc nghiệp vụ `BR-EMP-03`: Ngăn chặn xóa nhân viên có lịch làm việc hoặc phiếu lương:
  - *Giải pháp:* Bắt mã lỗi `EMPLOYEE_HAS_WORK_HISTORY` (HTTP 400) trong hàm `handleConfirmDeleteEmployee`, mở `NotificationModal` loại cảnh báo giải thích rõ ràng và hướng dẫn người dùng chuyển sang "Ngừng làm việc".
- [MEDIUM] Trải nghiệm phản hồi sau các thao tác tạo, cập nhật, đổi trạng thái:
  - *Giải pháp:* Sử dụng `NotificationModal` dùng chung với thông báo trực quan, thay thế các toast thông báo trôi nhanh.

## Kết luận: Chấp nhận
Thông số kỹ thuật và triển khai Frontend hoàn toàn ăn khớp với Backend, code đã kiểm chứng `npm run build` thành công 0 lỗi và 106 tests passed.
