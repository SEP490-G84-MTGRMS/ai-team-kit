# EXP-2026-11-08-001: Khám Phá Cơ Chế Chặn Cứng Nhân Viên Không Có Lịch Trực Vào Bán Hàng POS

## 1. Problem Statement (Vấn Đề)
Hiện tại trên hệ thống bán lẻ MT-GRMS:
- Phân hệ bán hàng POS chỉ kiểm tra phiên ca tiền mặt chung (`ShiftZReport`) của chi nhánh đang `Open`.
- Bất kỳ nhân viên nào có tài khoản thuộc chi nhánh, dù hôm nay không có lịch làm việc hoặc không trực trong khung giờ hiện tại, vẫn có thể đăng nhập POS và tạo đơn bán hàng.
- Điều này gây rủi ro thất thoát hàng hóa, gian lận két tiền, không thể quy trách nhiệm thu ngân và làm sai lệch dữ liệu đối soát giữa phân hệ Nhân sự (HR) và phân hệ Bán hàng (POS).

## 2. Context & Background (Bối Cảnh)
- Hệ thống quản lý lịch trực nhân viên lưu tại bảng `EmployeeSchedules` (thuộc phân hệ HR) với các trường:
  - `EmployeeId`: Mã định danh nhân viên (bảng `Employees` liên kết với `Users` qua `UserId`).
  - `BranchId`: Chi nhánh được phân công trực.
  - `WorkDate`: Ngày làm việc (chỉ tính phần ngày, ví dụ `2026-11-08`).
  - `PlannedStartTime`: Thời gian bắt đầu ca (ví dụ `08:00:00`).
  - `PlannedEndTime`: Thời gian kết thúc ca (ví dụ `17:00:00`).
  - `AllowedCheckInStart`, `AllowedCheckInEnd`: Khung giờ cho phép check-in.
  - `Status`: Trạng thái ca (`Scheduled`, `InProgress`, `Completed`).
- Khách hàng yêu cầu áp dụng **Phương án 1 — Chặn cứng (Strict Block)**:
  - Khi nhân viên vào màn POS hoặc bấm thanh toán đơn hàng, Backend và Frontend đối soát `CurrentUserId`, `BranchId`, ngày hôm nay và khung giờ hiện tại.
  - Nếu không có lịch trực hợp lệ $\rightarrow$ Chặn tạo đơn và thông báo: *"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh"*.

## 3. Constraints (Ràng Buộc Kỹ Thuật & Nghiệp Vụ)
- **Miễn trừ Chủ cửa hàng (Exemption)**: Tài khoản có vai trò `STORE_OWNER`, `OWNER`, `ADMIN` không có bản ghi trong `EmployeeSchedules` nhưng có toàn quyền quản trị, do đó hệ thống **bắt buộc miễn trừ kiểm tra lịch trực** cho các vai trò này để không làm tê liệt quyền hạn của chủ.
- **Dung sai thời gian (Buffer Tolerance)**: Nhân viên thu ngân cần đến sớm khoảng 15-30 phút để kiểm đếm két mở ca, và cần ở lại sau giờ tan ca 15-30 phút để bàn giao/chốt két. Do đó, khung giờ hợp lệ cần tính dung sai:
  $$\text{StartTime} - 30\text{ phút} \le \text{CurrentTime} \le \text{EndTime} + 30\text{ phút}$$
  (Hoặc sử dụng `AllowedCheckInStart` đến `AllowedCheckInEnd` nếu đã được cấu hình).
- **Múi giờ Việt Nam (UTC+7)**: Hệ thống lưu trữ `DateTime.UtcNow`, cần chuyển đổi sang múi giờ Việt Nam (`SE Asia Standard Time` / `+07:00`) để so khớp chính xác với `WorkDate` và `TimeOfDay`.
- **Hiệu năng POS**: Quá trình kiểm tra lịch trực không được làm chậm thao tác quét mã vạch và thanh toán tại quầy thu ngân.

## 4. Assumptions (Giả Định)
- **[ASSUMPTION-01]**: Mỗi nhân viên thu ngân có một tài khoản `User` liên kết 1-1 với hồ sơ `Employee` qua trường `Employee.UserId`.
- **[ASSUMPTION-02]**: Vai trò người dùng được lưu trong `_tenantContext.CurrentRole` hoặc claim JWT (`STORE_OWNER`, `EMPLOYEE`, `ADMIN`).
- **[ASSUMPTION-03]**: Một nhân viên có thể có nhiều ca trực trong 1 ngày (ví dụ ca gãy: sáng 08:00-12:00 và tối 18:00-22:00). Chỉ cần thời điểm bán hàng rơi vào 1 trong các ca hợp lệ thì được chấp nhận.

## 5. Scope & Non-Goals (Phạm Vi & Những Gì Không Làm)

### In Scope
- Tạo phương thức kiểm tra hợp lệ ca trực: `IScheduleService.ValidateCashierWorkingShiftAsync(Guid userId, Guid branchId, DateTime currentUtc)`.
- Ràng buộc tại `OrderService.CreateOrderAsync`: Chặn tạo đơn nếu vai trò là `EMPLOYEE` mà không có lịch trực hợp lệ, trả về mã lỗi `EMPLOYEE_NOT_SCHEDULED`.
- Ràng buộc tại `ShiftService.OpenShiftAsync`: Chặn nhân viên mở ca két nếu không có lịch trực trong ca hiện tại.
- Frontend POS ([`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx)): Gọi API kiểm tra lịch trực khi tải màn hình bán hàng, hiển thị thông báo cảnh báo rõ ràng nếu nhân viên không có lịch trực và vô hiệu hóa nút thanh toán.
- Bổ sung dữ liệu seed ca trực mẫu cho nhân viên Ba Đình để phục vụ kiểm thử đối chứng.

### Out of Scope (Non-Goals)
- Không can thiệp vào quy trình chấm công FaceID (`CheckInMethod`, `FaceMatchScore`).
- Không can thiệp vào quy trình tính lương `Payslip`.
- Không tạo UI xếp lịch mới (giữ nguyên module HR hiện có).

## 6. Success Criteria (Tiêu Chí Đo Lường)
- 100% nhân viên `EMPLOYEE` không có lịch trực hôm nay hoặc nằm ngoài khung giờ bị chặn khi bấm thanh toán với lỗi `EMPLOYEE_NOT_SCHEDULED`.
- Nhân viên có lịch trực hợp lệ bán hàng bình thường không gặp trở ngại.
- Chủ cửa hàng (`STORE_OWNER`) và Quản trị viên (`ADMIN`) hoàn toàn không bị ảnh hưởng.
- Toàn bộ unit/integration test suite backend và frontend build đạt 100% PASS.
