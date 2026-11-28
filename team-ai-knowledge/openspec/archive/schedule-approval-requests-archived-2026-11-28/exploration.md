# Exploration: schedule-approval-requests

## 1. Hiện trạng Code & Bối cảnh (Current State)
- **Thực thể hiện tại:** `MT_GRMS_BACKEND\src\MT_GRMS.Domain\Entities\HR\EmployeeSchedule.cs` chứa các trường duyệt đơn trực tiếp trên bảng dạng 1-1 (`ApprovalType`, `ApprovalStatus`, `ApprovalReason`, `EvidenceImageUrl`, `ApprovedBy`, `ApprovedAt`).
- **Enums:** `MT_GRMS.Domain\Enums\HREnums.cs` mới có `ScheduleStatus` (Draft, Scheduled, Published, InProgress, Completed, Cancelled) và `ScheduleApprovalStatus` (None, Pending, Approved, Rejected). Chưa có các enum phân loại: `ScheduleRequestType`, `ShiftSwapType`, `LeaveType`, và trạng thái ca `OnLeave`.
- **Giao diện hiện tại:** 
  - `MT_GRMS_FRONTEND\src\layouts\EmployeeLayout\AppTopNav.tsx` đang có icon chuông thông báo nhưng xử lý mock bằng `setTimeout(..., 500)`.
  - `WorkSchedulePage.tsx` và `AttendancePage.tsx` chưa có nút để nhân viên gửi đơn đổi ca, xin nghỉ hoặc giải trình sự cố FaceID.

## 2. Giả định (Assumptions)
- **[ASSUMPTION-01]**: Mọi nhân viên tham gia đổi ca (`SHIFT_SWAP`) phải thuộc cùng một chi nhánh (`BranchId`) và cùng Tenant (`TenantId`).
- **[ASSUMPTION-02]**: Một ca làm việc một khi đã chốt bảng lương (`PayslipId != null`) thì nghiêm cấm mọi hành động tạo đơn mới hoặc chỉnh sửa/duyệt đơn.
- **[ASSUMPTION-03]**: Nhân viên có thể gửi nhiều đơn khác loại trong cùng một ca (ví dụ: đầu ca gửi đơn `CheckInIncident`, cuối ca gửi đơn `Overtime`), nhưng không được gửi 2 đơn cùng loại khi đơn trước vẫn đang `Pending`.
- **[ASSUMPTION-04]**: Đơn đổi ca chéo yêu cầu cả 2 ca đều phải ở trạng thái `Scheduled` (chưa check-in).

## 3. Ranh giới & Non-Goals
### In Scope
- Xây dựng mô hình quan hệ 1 - N giữa `EmployeeSchedule` và `ScheduleApprovalRequest`.
- Hỗ trợ đầy đủ 4 loại đơn: `LeaveRequest` (Xin nghỉ), `ShiftSwap` (Đổi ca), `CheckInIncident` (Sự cố chấm công), `Overtime` (Làm thêm giờ).
- Chuẩn hóa Enums cho Backend C# và Frontend TypeScript.
- API RESTful đầy đủ: Tạo đơn, lấy danh sách theo ca, lấy danh sách chờ duyệt, duyệt/từ chối đơn, xác nhận đổi ca đồng nghiệp.
- Giao diện chuông thông báo + Modal duyệt 4 tabs trên TopNav; nút gửi đơn trên Lịch làm việc và Điểm danh.

### Out of Scope (Non-Goals)
- Không xây dựng module tự động tính trừ quỹ phép năm tồn từ các năm trước (sẽ làm trong phân hệ quản lý hợp đồng/phép năm chuyên sâu sau).
- Không tích hợp cơ chế phần cứng IoT/FaceID tự động mở cửa quầy.
- Không gửi tin nhắn SMS/Email thông báo ngoài ứng dụng (chỉ gửi notification nội bộ hệ thống).

## 4. Đánh giá các phương án (Options Evaluation)

### Phương án 1: Giữ nguyên bảng phẳng 1-1 trên `EmployeeSchedule` và áp dụng logic tuần tự
- **Mô tả:** Giữ nguyên các cột `ApprovalType`, `ApprovalStatus`... trên `EmployeeSchedule`. Ép nhân viên phải xử lý xong đơn thứ nhất mới được gửi đơn thứ hai, hoặc gộp chung vào 1 đơn.
- **Ưu điểm:** Không cần tạo thêm bảng mới, không cần migration tạo bảng.
- **Nhược điểm:** Mất hoàn toàn lịch sử đối soát; đơn sau đè mất thông tin đơn trước; không thể biểu diễn một ca vừa có đơn được Approved vừa có đơn đang Pending; code xử lý tuần tự rất dễ gây lỗi dữ liệu.

### Phương án 2: Tách bảng con `ScheduleApprovalRequest` quan hệ 1 - N (ĐƯỢC CHỌN)
- **Mô tả:** Tạo entity mới `ScheduleApprovalRequest : BaseTenantEntity` lưu từng đơn yêu cầu độc lập. `EmployeeSchedule` lưu danh sách `ApprovalRequests` và đóng vai trò cập nhật kết quả công cuối cùng sau khi đơn được duyệt.
- **Ưu điểm:**
  - Chuẩn hóa CSDL (Database Normalization), đảm bảo tính toàn vẹn dữ liệu.
  - Lưu trữ đầy đủ lịch sử (Audit Trail) phục vụ đối soát lương và giải trình thanh tra lao động.
  - Cho phép 1 ca có đồng thời nhiều đơn khác loại (ví dụ vừa báo lỗi FaceID vừa xin OT).
  - Sử dụng Enums C# & TypeScript strongly-typed thay vì magic string.
- **Nhược điểm:** Cần migration thêm bảng mới và viết thêm endpoints quản lý.

## 5. Rủi ro & Cách giảm thiểu
- **Rủi ro 1: Race condition khi đổi ca:** Hai nhân viên hoặc quản lý cùng thao tác đồng thời trên ca đổi.  
  *Giải pháp:* Dùng Database Transaction (`BeginTransactionAsync`), kiểm tra lại trạng thái ca và `RowVersion`/trạng thái `Scheduled` trước khi hoán đổi.
- **Rủi ro 2: Gian lận sửa giờ làm cho ca đã tính lương:**  
  *Giải pháp:* Kiểm tra cứng điều kiện `PayslipId == null` ở mức Domain Service & FluentValidation; nếu khác null từ chối ngay lập tức với lỗi HTTP 400.
