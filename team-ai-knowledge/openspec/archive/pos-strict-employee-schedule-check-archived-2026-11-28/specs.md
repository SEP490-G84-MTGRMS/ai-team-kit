# Đặc Tả Delta: pos-strict-employee-schedule-check

## ADDED Requirements

### Requirement: REQ-STRICT-SCHEDULE-VALIDATION (Xác Thực Lịch Phân Ca Khi Bán Hàng POS)
Hệ thống Backend MUST xác thực tính hợp lệ của lịch phân ca làm việc (`EmployeeSchedule`) của người dùng trước khi cho phép mở ca hoặc tạo đơn hàng POS mới.
1. Nếu người dùng mang vai trò Quản lý / Chủ cửa hàng (`STORE_OWNER`, `OWNER`, `ADMIN`), hệ thống MUST miễn trừ kiểm tra lịch trực và cho phép thực thi ngay.
2. Nếu người dùng mang vai trò Nhân viên thu ngân (`EMPLOYEE`), hệ thống MUST kiểm tra:
   - Hồ sơ nhân viên (`Employee`) tồn tại và gắn với tài khoản đang đăng nhập.
   - Tồn tại ít nhất 1 bản ghi `EmployeeSchedule` thuộc chi nhánh đang bán (`BranchId`), ngày hôm nay theo múi giờ Việt Nam (`WorkDate == nowVn.Date`), trạng thái không bị hủy (`Status != Cancelled`).
   - Thời điểm hiện tại `nowVn.TimeOfDay` nằm trong khung giờ làm việc của ca (kèm dung sai 30 phút trước giờ bắt đầu và sau giờ kết thúc ca).
3. Nếu không thỏa mãn điều kiện ca trực, hệ thống MUST ném `BusinessException("EMPLOYEE_NOT_SCHEDULED", "Bạn không có lịch làm việc trong ca hiện tại của chi nhánh.")`.

#### Scenario: Nhân viên có lịch trực hợp lệ trong ca tạo đơn thành công
**GIVEN** Thu ngân `Phạm Thị Yến` có lịch phân ca hôm nay từ 08:00 đến 12:00 tại Chi nhánh Ba Đình  
**AND** Thời điểm hiện tại là 09:30 sáng  
**WHEN** Thu ngân gửi yêu cầu tạo đơn hàng thanh toán POS (`POST /api/orders`)  
**THEN** Hệ thống xác thực lịch trực thành công và tạo đơn hoàn tất.

#### Scenario: Nhân viên không có lịch trực hôm nay bị chặn tạo đơn
**GIVEN** Thu ngân `Nguyễn Văn Minh` không có bất kỳ lịch trực nào hôm nay tại Chi nhánh Ba Đình  
**WHEN** Thu ngân gửi yêu cầu tạo đơn hàng thanh toán POS (`POST /api/orders`)  
**THEN** Hệ thống MUST chặn yêu cầu và trả về lỗi HTTP 400 Bad Request / 422 Unprocessable Entity với mã lỗi `EMPLOYEE_NOT_SCHEDULED` và thông báo `"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh."`.

#### Scenario: Nhân viên có lịch trực hôm nay nhưng ngoài khung giờ làm việc bị chặn
**GIVEN** Thu ngân `Phạm Thị Yến` có lịch ca chiều từ 13:00 đến 17:00  
**AND** Thời điểm hiện tại là 09:00 sáng (ngoài dung sai 30 phút)  
**WHEN** Thu ngân bấm mở ca hoặc gửi yêu cầu tạo đơn hàng  
**THEN** Hệ thống MUST chặn yêu cầu với mã lỗi `EMPLOYEE_NOT_SCHEDULED`.

#### Scenario: Nhân viên đến sớm trong phạm vi dung sai 30 phút được phép mở ca
**GIVEN** Thu ngân có lịch ca bắt đầu lúc 08:00 sáng  
**AND** Thời điểm hiện tại là 07:45 sáng (sớm 15 phút, nằm trong dung sai 30 phút)  
**WHEN** Thu ngân bấm mở ca kết két POS  
**THEN** Hệ thống chấp thuận cho phép mở ca.

#### Scenario: Chủ cửa hàng tạo đơn không bị chặn lịch làm việc
**GIVEN** Người dùng đăng nhập bằng tài khoản Chủ cửa hàng (`STORE_OWNER`)  
**AND** Người dùng không có bản ghi nào trong bảng `EmployeeSchedules`  
**WHEN** Người dùng thực hiện thanh toán đơn hàng trên POS  
**THEN** Hệ thống miễn trừ kiểm tra lịch làm việc và hoàn tất tạo đơn bình thường.

---

### Requirement: REQ-POS-UI-SCHEDULE-ALERT (Cảnh Báo & Khóa Nút Thanh Toán POS Khi Ngoài Ca)
Giao diện bán hàng POS ([`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx)) SHALL kiểm tra tính đủ điều kiện trực ca của người dùng qua API `GET /api/shifts/cashier-eligibility?branchId=...` khi màn hình tải.
1. Nếu `isAllowed === false`:
   - Giao diện MUST hiển thị Banner cảnh báo lỗi (`Alert type="error"`) với nội dung: *"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh này. Thao tác thanh toán bị khóa."*
   - Nút **"Thanh toán (F9)"** MUST bị vô hiệu hóa (`disabled={true}`).
2. Nếu `isAllowed === true`:
   - Không hiển thị banner cảnh báo và nút Thanh toán hoạt động bình thường.

#### Scenario: Màn hình POS tự động khóa khi nhân viên ngoài ca truy cập
**GIVEN** Nhân viên không có lịch trực ca đăng nhập vào `/employee/pos`  
**WHEN** Màn hình POS tải hoàn tất  
**THEN** Giao diện hiển thị Alert thông báo màu đỏ và nút "Thanh toán (F9)" bị vô hiệu hóa kèm Tooltip cảnh báo.

---

## Acceptance Checklist
- [ ] Backend `OrderService.CreateOrderAsync` ném lỗi `EMPLOYEE_NOT_SCHEDULED` khi nhân viên không có ca trực.
- [ ] Backend `ShiftService.OpenShiftAsync` chặn mở ca nếu nhân viên ngoài khung giờ ca.
- [ ] Backend cung cấp API `GET /api/shifts/cashier-eligibility?branchId=...`.
- [ ] Frontend POS hiển thị Alert và disable nút Thanh toán nếu ngoài ca.
- [ ] `STORE_OWNER` và `ADMIN` không bị ảnh hưởng.
- [ ] 100% test suite `dotnet test` và build frontend `npm run build` PASS.
