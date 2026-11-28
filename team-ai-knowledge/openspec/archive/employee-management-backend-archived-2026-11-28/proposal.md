# Proposal: employee-management-backend

## Vấn đề
Hiện tại, hệ thống MT-GRMS đã có giao diện quản lý nhân viên và ca làm việc (Frontend `ui-employee-management`), nhưng tầng Backend (.NET 8 Clean Architecture) chưa có đầy đủ API Endpoints, DTOs, Business Services và logic xử lý nghiệp vụ tích hợp để vận hành chu trình nhân sự khép kín:
1. Chưa có các API phục vụ quản lý hồ sơ nhân viên (CRUD), tự sinh mã nhân viên tuần tự theo tenant, kiểm soát CCCD/SĐT và liên kết cấp tài khoản Identity (`Users`).
2. Chưa có hệ thống lập lịch ca làm việc theo tuần/tháng, chưa hỗ trợ cấu hình ca linh hoạt và chưa có cơ chế kiểm tra chống trùng ca làm việc.
3. Chấm công nhân viên chưa có API xác thực tọa độ GPS Geofencing chi nhánh, chưa tự động tính toán số phút đi muộn, về sớm và tổng giờ công thực tế.
4. Nghiệp vụ thu ngân POS chưa có phiên ca mở/đóng hoàn chỉnh: thiếu cơ chế kiểm đếm 9 mệnh giá tiền mặt, đối soát thừa/thiếu tiền mặt theo quy tắc `GBR-POS-04`, khóa sổ sinh dữ liệu Z-Report, và chưa tự động hạch toán Phiếu thu vào Sổ quỹ (`Cashbooks`) khi chủ duyệt ca.
5. Chưa có Payroll Engine tổng hợp ngày công tự động từ ca làm việc, tính toán lương thưởng/phạt và tự động hạch toán Phiếu chi lương vào Sổ quỹ khi chi trả qua Tiền mặt hoặc VietQR.

## Mục tiêu
Xây dựng phân hệ Backend toàn diện cho Quản lý Nhân viên & Ca làm việc (`MT_GRMS_BACKEND`), triển khai chuẩn Clean Architecture (Domain - Application - Infrastructure - Web API), chia thành 5 cụm chức năng độc lập nhưng liên kết chặt chẽ:
- Cung cấp trọn bộ RESTful API cho quản lý nhân viên, lịch làm việc, chấm công, ca thu ngân và bảng lương.
- Tự động hóa việc đối soát tiền mặt tại quầy POS với Z-Report và tự động sinh chứng từ Sổ quỹ tương ứng (Phiếu thu doanh thu ca, Phiếu chi thanh toán lương).
- Khép kín luồng dữ liệu từ lúc nhân viên nhận ca, bán hàng, đóng ca, chấm công cho đến khi nhận lương tháng.

## Phạm vi (Scope)

### In Scope (Chia thành 5 Cụm chức năng Backend)

#### Cụm 1: Quản lý Hồ sơ Nhân viên & Cấp tài khoản (Employee Profile & Identity Management)
- CRUD hồ sơ nhân viên (`Employees`): Họ tên, CCCD, SĐT, Email, ngày sinh, chức danh, chi nhánh làm việc (`BranchId`), trạng thái (`active`/`inactive`).
- Cơ chế tự sinh mã nhân viên tuần tự định dạng chuẩn theo tenant (`NV0001`, `NV0002`...).
- Thiết lập cấu hình lương (`SalaryType`: monthly/hourly/shift, `BaseRate`), các khoản phụ cấp (`LunchAllowance`, `TravelAllowance`), thông tin tài khoản ngân hàng nhận lương.
- Cấp tài khoản đăng nhập hệ thống (`Users` / `TenantUser`) liên kết trực tiếp với nhân viên, phân quyền vai trò (`CASHIER`, `STAFF`, `BRANCH_MANAGER`).
- Kiểm tra trùng lặp CCCD, SĐT trong cùng tenant scope.

#### Cụm 2: Lập lịch & Ban hành Ca làm việc (Work Scheduling & Shift Publishing)
- Quản lý định nghĩa ca làm việc mẫu (`WorkShifts` / cấu hình ca): Giờ bắt đầu, giờ kết thúc, khung thời gian cho phép check-in (`AllowedCheckInStart`, `AllowedCheckInEnd`).
- Phân lịch ca tuần/tháng cho nhân viên (`EmployeeSchedules`): gán ca đơn lẻ hoặc batch theo danh sách nhân viên và dải ngày.
- Ban hành lịch làm việc (`Publish Schedule`): đổi trạng thái ca sang sẵn sàng, hỗ trợ nhân viên tra cứu lịch làm việc cá nhân theo tuần.
- Validation ràng buộc nghiệp vụ: ngăn chặn phân 1 nhân viên vào 2 ca trùng nhau hoặc giao thoa khung giờ trong cùng ngày.

#### Cụm 3: Chấm công số & Bảng công (Digital Attendance & Timesheet Tracking)
- API Chấm công vào ca (`Check-in`) và ra ca (`Check-out`):
  + Kiểm tra tính hợp lệ GPS Geofencing (tọa độ nhân viên so với tọa độ chi nhánh trong bán kính quy định `CheckinRadiusMeters`).
  + Hỗ trợ phương thức bổ trợ: Mã PIN cá nhân / Face Embedding đối soát khi tích hợp camera quầy POS.
- Tự động tính toán số phút đi muộn (`LateMinutes`), về sớm (`EarlyMinutes`), và tổng giờ công thực tế (`ActualWorkHours`).
- Hỗ trợ giải trình sự cố chấm công và phê duyệt điều chỉnh công (`ApprovalStatus`, `ApprovalReason`, `ApprovedBy`).

#### Cụm 4: Quản lý Đóng ca, Bàn giao & Đối soát Két tiền (Cashier Shift Closing, Z-Report & Cashbook Inflow)
- Mở phiên ca thu ngân (`Open Shift`): ghi nhận tiền lẻ đầu ca (`OpeningFloat`) từ két chi nhánh (`BranchCashTill`).
- Tích lũy doanh thu tiền mặt trong ca (`TotalCashIn`), chi tạm ứng/chi nóng (`TotalCashOut`), tính số tiền lý thuyết trong két (`ExpectedCash`).
- Đóng ca thu ngân (`Close Shift`): nhập kiểm đếm 9 mệnh giá tiền mặt VNĐ (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k), nhập số tiền lẻ để lại ca sau (`RetainedFloatAmount`).
- Tự động tính chênh lệch thừa/thiếu (`Discrepancy`), bắt buộc ghi chú giải trình nếu phát hiện chênh lệch (tuân thủ `GBR-POS-04`).
- Khóa sổ phiên ca, sinh dữ liệu báo cáo chốt ca **Z-Report** (`ShiftZReport`).
- Quy trình Chủ cửa hàng / Quản lý kiểm đếm duyệt ca (`Audit Approve`): Tự động sinh **Phiếu thu tiền mặt** vào Sổ quỹ (`Cashbooks` type `INCOME`, category `DOANH_THU_BAN_HANG`), điều chuyển tiền vào két chính (`BranchSafe`).

#### Cụm 5: Bảng lương Tự động & Chi trả Tích hợp Sổ quỹ (Payroll Engine & Cashbook Outflow)
- Khởi tạo bảng lương tháng (`Generate Payroll`): tự động tổng hợp toàn bộ ngày công, giờ công, số lần đi trễ/về sớm từ `EmployeeSchedules` trong tháng của từng nhân viên.
- Engine tính lương tự động theo công thức:
  $$\text{Lương thực nhận} = \text{Lương cơ bản} + \text{Lương OT} + \text{Phụ cấp} + \text{Thưởng} - \text{Phạt đi trễ} - \text{Tạm ứng}$$
- Lưu bản ghi bảng lương (`Payslips`) với trạng thái ban đầu `UNPAID`.
- Chi trả lương (`Pay Salary`):
  + Chi trả bằng Tiền mặt (`CASH`).
  + Hỗ trợ chi trả VietQR chuẩn NAPAS 247 qua thông tin tài khoản ngân hàng của nhân viên.
- Tự động sinh **Phiếu chi lương** vào Sổ quỹ (`Cashbooks` type `EXPENSE`, category `CHI_TRA_LUONG`) và cập nhật trạng thái phiếu lương thành `PAID`.

### Out of Scope
- Không làm lại giao diện Frontend (đã có ở change `ui-employee-management`).
- Không can thiệp vào nghiệp vụ bán hàng POS và tính toán tồn kho FEFO (đã có ở phân hệ POS & Inventory).
- Không tích hợp thiết bị phần cứng chấm công vân tay vật lý ngoài cổng (chỉ hỗ trợ GPS, QR, PIN và AI Face vector).

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner)**: Lập lịch làm việc, duyệt báo cáo ca & đối soát két tiền, khởi tạo bảng lương tháng, duyệt chi trả lương.
- **Quản lý chi nhánh (Branch Manager)**: Quản lý hồ sơ nhân viên tại chi nhánh, sắp xếp và điều chỉnh ca làm việc, hỗ trợ kiểm đếm ca.
- **Nhân viên thu ngân / Bán hàng (Cashier / Staff)**: Xem lịch làm việc, chấm công vào/ra ca, mở ca POS, đếm 9 mệnh giá tiền mặt khi đóng ca, xem phiếu lương điện tử.

## Tiêu chí thành công
- [ ] Cung cấp đầy đủ 5 Controllers với chuẩn RESTful API, phân quyền Tenant và Role:
  + `EmployeesController`
  + `SchedulesController`
  + `AttendanceController`
  + `CashierShiftsController`
  + `PayrollController`
- [ ] Tự động sinh mã nhân viên tuần tự dạng `NV0001`, `NV0002` không trùng lặp khi chạy concurrent.
- [ ] Chấm công GPS kiểm tra đúng khoảng cách với bán kính chi nhánh, tính chính xác `LateMinutes` và `ActualWorkHours`.
- [ ] Đóng ca thu ngân tính toán chính xác số dư lý thuyết và độ lệch tiền mặt 9 mệnh giá; bắt buộc giải trình khi `Discrepancy != 0`.
- [ ] Phê duyệt ca thu ngân tự động sinh Phiếu thu Sổ quỹ (`INCOME`) với đúng số tiền mặt bàn giao.
- [ ] Payroll Engine tổng hợp chính xác dữ liệu công tháng và sinh các bản ghi `Payslips`.
- [ ] Xác nhận thanh toán lương tự động sinh Phiếu chi Sổ quỹ (`EXPENSE`) và cập nhật trạng thái `PAID`.
- [ ] 100% mã nguồn backend biên dịch thành công (`dotnet build` 0 errors) và có bộ Unit/Integration Tests kiểm chứng các ca nghiệp vụ chính.
