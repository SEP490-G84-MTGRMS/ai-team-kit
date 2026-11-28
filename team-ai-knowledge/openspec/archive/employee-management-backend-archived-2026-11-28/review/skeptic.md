# Skeptic Review: employee-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 7 REQ trọng tâm. Cập nhật hoàn chỉnh REQ-03 với API đặt lịch lặp định kỳ (`/api/v1/schedules/recurring`), quy tắc tính ngày kết thúc đến hết tháng sau khi input để trống, và đặt ngày cụ thể khi có input. Đã loại bỏ hoàn toàn cơ chế tự động gia hạn (auto-extend) theo yêu cầu nghiệp vụ. |
| D2 Correctness | 5/5 | Đảm bảo tính đúng đắn: kiểm soát xung đột ca trong ngày (cho phép nhiều ca, max trùng $\le 12$h với mã lỗi `SCHEDULE_OVERLAP_EXCEEDED`). Chuẩn hóa độ dài `ShiftCode` không vượt quá 30 ký tự, triệt tiêu lỗi PostgreSQL `22001: value too long for type character varying(30)`. |
| D3 Coherence | 5/5 | Thống nhất tuyệt đối giữa Specs, DTO (`CreateRecurringScheduleRequest`), `ScheduleService`, Controller và giao diện Frontend (`AddScheduleModal.tsx`). |
| D4 Constraints | 5/5 | Đảm bảo ràng buộc Tenant, chi nhánh của nhân viên, `EndDate >= StartDate`, kiểm soát giới hạn trùng lặp thời gian trong ngày. |
| D5 Blast Radius | 5/5 | Thay đổi khoanh vùng trong module Schedules, không ảnh hưởng đến các module khác. 319 unit tests backend pass 100%. |

## Vấn đề đã xử lý
- [HIGH] REQ-03: Lỗi PostgreSQL `22001: value too long for type character varying(30)` khi lưu ca làm việc do truyền GUID 36 ký tự vào cột `ShiftCode` VARCHAR(30).
  - *Giải pháp:* Trong `ScheduleService.ResolveShiftInfo`, ưu tiên lấy `ShiftCode` từ cấu hình ca `ShiftConfig` trong DB, đồng thời cắt tối đa 30 ký tự (`code[..30]`) để bảo vệ dữ liệu.
- [HIGH] REQ-03: Nghiệp vụ sinh lịch lặp lại định kỳ: khi người dùng không chọn ngày kết thúc thì cần tự động sinh lịch đến hết tháng hiện tại và tháng sau (`DateTime.DaysInMonth` của tháng sau); khi có ngày kết thúc thì sinh chính xác đến ngày chỉ định (không bị chặn bởi mốc 31 ngày).
  - *Giải pháp:* Đã triển khai hoàn chỉnh trong `ScheduleService.CreateRecurringAsync` và unit tests `ScheduleServiceTests.cs`.
- [MEDIUM] REQ-03: Loại bỏ hoàn toàn tính năng tự động gia hạn (auto-extend).
  - *Giải pháp:* Xóa bỏ endpoint `POST /schedules/auto-extend`, các DTO, validator và test case liên quan.
- [HIGH] REQ-07: Vấn đề trùng lặp dữ liệu và bất tiện quản trị nếu nhúng cấu hình chấm công trực tiếp vào từng ca làm việc (`ShiftConfig`). → **Đã tách thành `BranchAttendancePolicy`**.
- [HIGH] REQ-01: Lỗi `DbUpdateConcurrencyException` và lỗi đứt gãy quan hệ (`severed relationship`) khi cập nhật/xóa phụ cấp. → **Đã xử lý triệt để trong `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Quy tắc nghiệp vụ `BR-EMP-03` bảo toàn dữ liệu lịch sử ca / phiếu lương khi xóa nhân viên. → **Đã xử lý trong `EmployeeService.cs`**.

## Kết luận: Chấp nhận
Specs và tasks của change backend đã được cập nhật chính xác và đồng bộ hoàn toàn với codebase thực tế.
