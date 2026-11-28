# Design Brief: employee-management-backend

## 1. Luồng nghiệp vụ & Tương tác API (API Flows)

```mermaid
flowchart TD
    subgraph C1 ["Cụm 1: Quản lý Nhân viên & Identity"]
        A1[Owner/Manager] -->|POST /api/v1/employees| B1[Tạo hồ sơ + Lương cơ bản]
        B1 -->|POST /api/v1/employees/{id}/identity-account| C1_Acc[Cấp tài khoản Users]
    end

    subgraph C2 ["Cụm 2: Cấu hình Ca & Lập lịch Ca làm việc"]
        A2[Owner/Manager] -->|POST/PUT /api/v1/shift-configs| B2_Cfg[Cấu hình Ca đa chi nhánh / qua đêm]
        A2 -->|POST /api/v1/schedules/batch| B2[Gán ca tuần/tháng theo ShiftConfig]
        B2 -->|POST /api/v1/schedules/publish| C2_Pub[Ban hành lịch]
        C2_Pub -->|GET /api/v1/schedules/my-schedule| D2[Nhân viên xem ca cá nhân]
    end

    subgraph C3 ["Cụm 3: Chấm công số (Attendance)"]
        A3[Nhân viên tại quầy] -->|POST /api/v1/attendance/check-in| B3{Kiểm tra GPS Geofencing}
        B3 -->|Hợp lệ <= 100m| C3_Rec[Ghi nhận Giờ vào + Tính LateMinutes]
        B3 -->|Không hợp lệ| C3_Warn[Đánh dấu IsGpsValid=false + Cần duyệt]
        A3 -->|POST /api/v1/attendance/check-out| D3[Ghi nhận Giờ ra + Tính ActualWorkHours]
    end

    subgraph C4 ["Cụm 4: Đóng ca POS & Z-Report"]
        A4[Thu ngân] -->|POST /api/v1/cashier-shifts/open| B4[Mở ca POS + Kế thừa Float]
        B4 -->|POST /api/v1/cashier-shifts/{id}/close| C4_Close[Đếm 9 mệnh giá + Tính Discrepancy]
        C4_Close -->|POST /api/v1/cashier-shifts/{id}/audit-approve| D4[Chủ duyệt ca]
        D4 -->|Auto Call| E4[(Tự động sinh Phiếu thu Sổ quỹ INCOME)]
    end

    subgraph C5 ["Cụm 5: Bảng lương & Chi trả"]
        A5[Owner] -->|POST /api/v1/payroll/generate| B5[Payroll Engine quét công & tính lương]
        B5 -->|POST /api/v1/payroll/payslips/{id}/pay| C5_Pay[Thanh toán Cash/VietQR]
        C5_Pay -->|Auto Call| D5[(Tự động sinh Phiếu chi Sổ quỹ EXPENSE)]
    end
```

## 2. Thiết kế Endpoints, Controllers & DTOs

### Cụm 1: Quản lý Hồ sơ Nhân viên (`EmployeesController` - `/api/v1/employees`)
1. `GET /api/v1/employees`: Danh sách nhân viên phân trang, tìm kiếm họ tên/mã/SĐT, lọc theo `branchId` và `status`.
2. `GET /api/v1/employees/{id}`: Chi tiết hồ sơ nhân viên, chi nhánh, thông tin lương và tài khoản liên kết.
3. `POST /api/v1/employees`: Tạo mới nhân viên. Tự sinh `EmployeeCode` tuần tự dạng `NV0001`, validate trùng CCCD/SĐT.
   - Body: `CreateEmployeeRequest` (`FullName`, `CitizenId`, `Phone`, `Email`, `BranchId`, `JobTitle`, `DateOfBirth`, `Gender`, `SalaryType`, `BaseRate`, `Allowances`, `BankName`, `BankAccountNumber`, `BankAccountHolder`).
4. `PUT /api/v1/employees/{id}`: Cập nhật thông tin hồ sơ nhân viên và mức lương kèm đồng bộ phụ cấp 3 chiều (Sync & Diffing).
5. `PATCH /api/v1/employees/{id}/status`: Đổi trạng thái (`active` / `inactive`).
6. `POST /api/v1/employees/{id}/identity-account`: Cấp tài khoản đăng nhập (`Users`), mã hóa mật khẩu BCrypt, gán quyền (`Role`).
7. `DELETE /api/v1/employees/{id}`: Xóa nhân viên theo quy tắc `BR-EMP-03` (chỉ cho phép xóa khi chưa có dữ liệu ca làm việc và phiếu lương; xóa sạch phụ cấp liên kết khi xóa hợp lệ).

### Cụm 2: Cấu hình Ca & Lập lịch Ca làm việc
#### A. Quản lý Danh mục & Cấu hình Ca (`ShiftConfigsController` - `/api/v1/shift-configs`)
1. `GET /api/v1/shift-configs`: Danh sách cấu hình ca làm việc, lọc theo `branchId` và `status`.
2. `GET /api/v1/shift-configs/{id}`: Xem chi tiết cấu hình ca.
3. `POST /api/v1/shift-configs`: Tạo mới cấu hình ca làm việc.
   - Body: `CreateShiftConfigRequest` (`Name`, `StartTime`, `EndTime`, `WorkHours`, `CheckInStart`, `CheckInEnd`, `IsNextDayCheckIn`, `BranchIds`, `ColorCode`, `Description`).
   - Hỗ trợ ca qua đêm (`IsNextDayCheckIn = true`) và áp dụng cho nhiều chi nhánh (`BranchIds` multi-branch JSONB).
4. `PUT /api/v1/shift-configs/{id}`: Cập nhật thông tin cấu hình ca làm việc.
5. `DELETE /api/v1/shift-configs/{id}`: Xóa hoặc vô hiệu hóa cấu hình ca làm việc (chặn xóa nếu đã có ca phân công `EmployeeSchedule` tham chiếu).

#### B. Lập lịch & Ban hành Ca (`SchedulesController` - `/api/v1/schedules`)
1. `GET /api/v1/schedules`: Lấy danh sách lịch làm việc theo dải ngày (`fromDate`, `toDate`) và `branchId`.
2. `GET /api/v1/schedules/my-schedule`: Dành cho nhân viên đang đăng nhập xem lịch ca cá nhân theo tuần.
3. `POST /api/v1/schedules/batch`: Phân ca hàng loạt theo nhân viên và dải ngày.
   - Body: `BatchAssignScheduleRequest` (`List<EmployeeScheduleItemRequest>`).
   - Validation: Kiểm tra trùng hoặc giao thoa khung giờ của cùng 1 nhân viên trong 1 ngày.
4. `PUT /api/v1/schedules/{id}`: Cập nhật ca hoặc đổi nhân viên trực.
5. `DELETE /api/v1/schedules/{id}`: Xóa ca đã lên lịch (chỉ khi ca chưa check-in).
6. `POST /api/v1/schedules/publish`: Ban hành lịch làm việc cho một tuần, chuyển trạng thái từ `draft` sang `scheduled`.

### Cụm 3: Chấm công số & Bảng công (`AttendanceController` - `/api/v1/attendance`)
1. `POST /api/v1/attendance/check-in`: Chấm công vào ca.
   - Body: `CheckInRequest` (`ScheduleId`, `Latitude`, `Longitude`, `PinCode`, `Method`: "GPS"|"PIN"|"QR"|"FACE").
   - Logic: Dùng công thức Haversine so sánh tọa độ thiết bị với tọa độ chi nhánh. Nếu khoảng cách > `CheckinRadiusMeters` $\rightarrow$ đánh dấu `IsGpsValid = false`. Ghi nhận `CheckInTime = UTC.Now`, tính `LateMinutes = Math.Max(0, CheckInTime - PlannedStartTime)`.
2. `POST /api/v1/attendance/check-out`: Chấm công ra ca.
   - Body: `CheckOutRequest` (`ScheduleId`, `Latitude`, `Longitude`).
   - Logic: Ghi nhận `CheckOutTime = UTC.Now`, tính `ActualWorkHours = (CheckOutTime - CheckInTime).TotalHours`, cập nhật `Status = "completed"`.
3. `POST /api/v1/attendance/{scheduleId}/request-approval`: Gửi yêu cầu giải trình sửa công (quên chấm công, lỗi GPS) kèm bằng chứng ảnh.
4. `POST /api/v1/attendance/{scheduleId}/approve`: Chủ cửa hàng / Quản lý duyệt điều chỉnh giờ công.

### Cụm 4: Quản lý Đóng ca, Bàn giao & Đối soát Két tiền (`CashierShiftsController` - `/api/v1/cashier-shifts`)
1. `POST /api/v1/cashier-shifts/open`: Mở ca thu ngân POS. Ghi nhận `OpeningFloat` (kế thừa từ ca trước hoặc nhập quỹ đầu ca).
2. `GET /api/v1/cashier-shifts/{id}/summary`: Lấy tóm tắt ca hiện tại (tổng tiền mặt đã thu từ đơn hàng POS, chi nóng, số dư tiền lý thuyết `ExpectedCash`).
3. `POST /api/v1/cashier-shifts/{id}/close`: Đóng ca và khai báo kiểm đếm.
   - Body: `CloseCashierShiftRequest`:
     + `Denominations`: Danh sách số lượng tờ tiền cho 9 mệnh giá (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k).
     + `ActualCashCounted`: Tổng tiền kiểm đếm thực tế.
     + `RetainedFloatAmount`: Tiền lẻ để lại cho ca sau.
     + `DiscrepancyNotes`: Bắt buộc nhập nếu $\text{Discrepancy} \neq 0$ (tuân thủ `GBR-POS-04`).
   - Xử lý: Lưu `ShiftZReport` với trạng thái `ShiftState.Closed`, tính toán `DroppedToSafeAmount`.
4. `GET /api/v1/cashier-shifts/pending-audit`: Danh sách các ca đã đóng chờ chủ duyệt kiểm đếm.
5. `POST /api/v1/cashier-shifts/{id}/audit-approve`: Chủ cửa hàng xác nhận nhận tiền bàn giao:
   - Cập nhật ca: `IsAudited = true`, `AuditedBy = UserId`, `AuditedAt = UtcNow`.
   - **Tích hợp Sổ quỹ**: Gọi `ICashbookService.ReceiveCashAsync()` tạo Phiếu thu loại `INCOME` (`SourceType = "CASHIER_SHIFT"`, `Amount = DroppedToSafeAmount`).

### Cụm 5: Bảng lương Tự động & Chi trả (`PayrollController` - `/api/v1/payroll`)
1. `POST /api/v1/payroll/generate`: Khởi tạo bảng lương cho kỳ làm việc (tháng).
   - Param: `periodMonth` (định dạng `YYYY-MM`), `branchId` (tùy chọn).
   - Engine: Quét toàn bộ `EmployeeSchedules` trong tháng của từng nhân viên, tính tổng giờ công, ngày công thực tế, trừ số phút đi trễ quy đổi. Đọc `BaseRate`, phụ cấp, và các khoản thưởng/phạt từ `EmployeeBonusViolation`.
   - Lưu vào bảng `Payslips` với trạng thái `UNPAID`.
2. `GET /api/v1/payroll/payslips`: Tra cứu danh sách phiếu lương theo kỳ tháng, chi nhánh, trạng thái.
3. `GET /api/v1/payroll/payslips/{id}`: Xem chi tiết phiếu lương và bảng công chi tiết đính kèm.
4. `POST /api/v1/payroll/payslips/{id}/pay`: Phê duyệt chi trả lương.
   - Body: `PayPayslipRequest` (`PaymentMethod`: "CASH"|"VIETQR", `PaidAmount`, `Note`).
   - Cập nhật `Payslip.Status = "PAID"`, `PaidAt = UtcNow`.
   - **Tích hợp Sổ quỹ**: Tự động gọi `ICashbookService.DisburseCashAsync()` tạo Phiếu chi loại `EXPENSE` (`SourceType = "SALARY"`, `ReferenceCode = PayslipCode`, `Amount = PaidAmount`).
5. `GET /api/v1/payroll/payslips/{id}/vietqr`: Sinh thông tin/hình ảnh mã VietQR thanh toán nhanh (kèm mã định danh nội dung chuyển khoản).

---

## 3. Thay đổi Cơ sở dữ liệu (Database Schema Details)

1. **Bổ sung cột kiểm soát duyệt ca vào bảng `ShiftZReports`**:
   - `IsAudited` (bool, default false)
   - `AuditedBy` (string?, null)
   - `AuditedAtUtc` (DateTime?, null)
   - `DenominationDetailsJson` (string?, null - lưu chi tiết số lượng 9 mệnh giá tiền mặt kiểm đếm)
2. **Cấu hình ca làm việc `ShiftConfigs`**:
   - Quản lý định nghĩa ca: `ShiftConfigId`, `Name`, `StartTime`, `EndTime`, `WorkHours`, `CheckInStart`, `CheckInEnd`, `IsNextDayCheckIn`, `BranchIds` (jsonb), `ColorCode`.
3. **Index & Multi-tenancy**:
   - Partial Unique Index `IX_Employees_TenantId_EmployeeCode` WHERE `IsDeleted = false`.
   - Unique Index `IX_Payslips_TenantId_EmployeeId_PeriodMonth` chống sinh đúp bảng lương trong cùng kỳ.

---

## 4. Quy tắc nghiệp vụ (Business Rules) & Phân quyền (RBAC)

1. **`GBR-POS-04` (Drawer Balancing Rule)**:
   - Độ lệch tiền mặt: $\Delta = \text{ActualCashCounted} - (\text{OpeningFloat} + \text{TotalCashIn} - \text{TotalCashOut})$.
   - Nếu $|\Delta| > 0$, nhân viên bắt buộc phải điền trường `DiscrepancyNotes` giải trình lý do trước khi bấm xác nhận chốt ca.
2. **`BR-EMP-03` (Employee Deletion Protection Rule)**:
   - Chỉ được phép xóa nhân viên khi chưa có dữ liệu `EmployeeSchedule` và `Payslip`.
   - Xóa sạch `EmployeeAllowances` khi xóa nhân viên hợp lệ.
3. **GPS Geofencing Rule**:
   - Khoảng cách được tính bằng công thức Haversine:
     $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
   - Nếu $d > \text{CheckinRadiusMeters}$ (mặc định 100m), hệ thống cảnh báo và gắn cờ `IsGpsValid = false`.
4. **Phân quyền truy cập (RBAC)**:
   - `STORE_OWNER`: Toàn quyền 5 cụm (tạo nhân viên, cấu hình ca, cấp tài khoản, duyệt ca Z-Report, khởi tạo bảng lương, chi trả Sổ quỹ).
   - `BRANCH_MANAGER`: Quản lý nhân viên chi nhánh, cấu hình ca áp dụng chi nhánh, lập lịch tuần, duyệt công bổ sung, kiểm đếm ca chi nhánh.
   - `CASHIER` / `STAFF`: Chỉ xem lịch cá nhân, chấm công ca của mình, mở/đóng ca POS của phiên mình phụ trách, xem phiếu lương cá nhân.
