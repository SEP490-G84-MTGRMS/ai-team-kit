# EXP-2026-11-02-HR-BACKEND: Khám phá & Đánh giá Kiến trúc Backend Phân hệ Quản lý Nhân viên & Ca làm việc (MT-GRMS)

## 1. Problem Statement
Hiện tại hệ thống MT-GRMS đã có các bảng Entity cơ sở trong Domain (`Employee`, `EmployeeSchedule`, `EmployeeBonusViolation`, `Payslip`, `ShiftZReport`), cùng với giao diện Frontend tương ứng (change `ui-employee-management`). Tuy nhiên, tầng Backend (`MT_GRMS.Application` và `MT_GRMS.Api`) hoàn toàn chưa có DTOs, Business Services, Validators và Controllers để hiện thực 5 cụm nghiệp vụ cốt lõi:
1. **CRUD Nhân viên & Cấp tài khoản**: Chưa có API quản lý hồ sơ, cấp tài khoản `Users`, sinh mã `NVxxxx` tự động, thiết lập lương.
2. **Lập lịch & Ban hành ca**: Chưa có logic phân ca tuần/tháng, kiểm tra trùng lặp thời gian ca.
3. **Chấm công số (Attendance)**: Chưa có xử lý Check-in/Check-out qua GPS Geofencing (bán kính chi nhánh), chưa tự tính phút trễ/sớm và giờ công.
4. **Đóng ca POS, Đối soát 9 mệnh giá & Z-Report**: Chưa có xử lý mở ca với `OpeningFloat`, đóng ca đếm 9 mệnh giá, đối soát chênh lệch `GBR-POS-04`, và tự động sinh Phiếu thu Sổ quỹ (`Cashbooks` type `INCOME`) khi chủ duyệt.
5. **Bảng lương & Chi trả (Payroll Engine)**: Chưa có động cơ tổng hợp công tự động theo tháng, tính NetSalary và sinh Phiếu chi Sổ quỹ (`Cashbooks` type `EXPENSE`) khi thanh toán.

## 2. Context & Background
- **Dự án**: MT-GRMS (Multi-tenant Grocery Retail Management System), Backend .NET 8 LTS Clean Architecture.
- **Tài liệu căn cứ nghiệp vụ**:
  + [HR_Flow_NghiepVu.md](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/HR_Flow_NghiepVu.md): Quy trình TO-BE Swimlane 7 giai đoạn, quy tắc đóng ca `GBR-POS-04`, đối soát dòng tiền Sổ quỹ.
  + [HR_Sequence_Diagram.md](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/HR_Sequence_Diagram.md): 8 luồng Sequence Diagram chi tiết, bao quát đầy đủ hợp đồng API giữa Frontend và Backend.
- **Hiện trạng mã nguồn**:
  + `MT_GRMS.Domain/Entities/HR`: Đã có `Employee.cs`, `EmployeeSchedule.cs`, `EmployeeBonusViolation.cs`, `Payslip.cs`.
  + `MT_GRMS.Domain/Entities/Finance`: Đã có `ShiftZReport.cs`, `BranchCashTill.cs`, `BranchSafe.cs`, `CashBook.cs`, `CashbookEntry.cs`.
  + `MT_GRMS.Infrastructure/Persistence/AppDbContext.cs`: Đã đăng ký các DbSets tương ứng.
  + `MT_GRMS.Application`: Chưa có thư mục `HR/` hay dịch vụ xử lý.
  + `MT_GRMS.Api/Controllers`: Chưa có các controllers HR.

## 3. Constraints
- Tuân thủ nghiêm ngặt **Clean Architecture**: Domain $\rightarrow$ Application (Services/DTOs/Validators) $\rightarrow$ Infrastructure (EF Core Repositories) $\rightarrow$ Api (Controllers).
- Cơ chế Multi-tenancy: Mọi truy vấn bắt buộc lọc theo `TenantId` (thông qua `ICurrentUserService` / EF Core Query Filters).
- Tích hợp tài chính kế toán: Đóng ca được duyệt phải tạo Phiếu thu Sổ quỹ; Thanh toán lương phải tạo Phiếu chi Sổ quỹ.
- Định dạng tiền tệ VND: Sử dụng `decimal(18,2)`.
- Thời gian lưu trữ: Chuẩn UTC khi lưu DB, chuyển đổi hiển thị múi giờ `Asia/Ho_Chi_Minh`.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi nhân viên (`Employee`) thuộc về một Tenant và được gán vào một Chi nhánh chính (`BranchId`), có thể có hoặc chưa có tài khoản đăng nhập (`UserId`).
- **[ASSUMPTION-02]**: Chi nhánh (`Branch`) có cấu hình tọa độ địa lý (`Latitude`, `Longitude`) và bán kính cho phép chấm công (`CheckinRadiusMeters`, mặc định 100m).
- **[ASSUMPTION-03]**: Két tiền quầy thu ngân (`BranchCashTill`) và két an toàn chi nhánh (`BranchSafe`) đã có trong cơ sở dữ liệu.
- **[ASSUMPTION-04]**: 9 mệnh giá tiền mặt Việt Nam chuẩn bao gồm: 500,000đ, 200,000đ, 100,000đ, 50,000đ, 20,000đ, 10,000đ, 5,000đ, 2,000đ, 1,000đ.
- **[ASSUMPTION-05]**: Cổng thanh toán VietQR hỗ trợ sinh mã dynamic QR dựa trên tài khoản ngân hàng thụ hưởng của nhân viên và nội dung chuyển khoản định danh.

## 5. Scope & Non-Goals

### In Scope (5 Cụm chức năng Backend)
- **Cụm 1**: CRUD hồ sơ nhân viên, sinh mã `NV0001` tuần tự tự động, thiết lập cấu hình lương/phụ cấp, cấp tài khoản đăng nhập (`Users`) và liên kết vai trò.
- **Cụm 2**: Quản lý định nghĩa ca làm việc mẫu (`WorkShifts`), lập lịch tuần/tháng theo chi nhánh (`EmployeeSchedules`), ban hành lịch (`publish`) và validation chống trùng ca.
- **Cụm 3**: Chấm công vào/ra ca (Check-in/Check-out) với xác thực GPS Geofencing (Haversine formula), mã PIN, tự động tính `LateMinutes`, `EarlyMinutes`, và `ActualWorkHours`.
- **Cụm 4**: Mở phiên ca POS (`OpeningFloat`), tích lũy doanh thu tiền mặt, đóng ca khai báo 9 mệnh giá tiền mặt, đối soát thừa/thiếu `GBR-POS-04`, khóa sổ Z-Report, và tự động sinh Phiếu thu Sổ quỹ (`Cashbooks` type `INCOME`) khi chủ duyệt.
- **Cụm 5**: Khởi tạo bảng lương tháng (`Generate Payroll`), tính lương thưởng/phạt tự động, chi trả Tiền mặt / VietQR và tự động sinh Phiếu chi Sổ quỹ (`Cashbooks` type `EXPENSE`).

### Out of Scope (Non-Goals)
- Không can thiệp vào giao diện Frontend (sử dụng giao diện đã xây dựng ở `ui-employee-management`).
- Không tích hợp phần cứng máy quét vân tay vật lý ngoài cổng (chỉ hỗ trợ GPS, QR, PIN, Face embeddings).
- Không sửa đổi logic tính giá bán sản phẩm hoặc quy tắc trừ kho FEFO của phân hệ bán hàng POS.

## 6. Đánh giá Phương án Kiến trúc (Architecture Options)

### Phương án 1: Monolithic HR Service
Gộp toàn bộ logic của cả 5 cụm (nhân viên, lịch ca, chấm công, ca POS, bảng lương) vào duy nhất một service lớn `HrService` và 1 controller `HrController`.
- **Ưu điểm**: Tạo nhanh, ít file, tập trung 1 nơi.
- **Nhược điểm**: Vi phạm nghiêm trọng nguyên tắc Đơn trách nhiệm (SRP), file service sẽ vượt hàng nghìn dòng, cực kỳ khó bảo trì, khó viết Unit Test độc lập, xung đột lớn khi làm việc nhóm.

### Phương án 2: Modular Clean Architecture (Được chọn)
Tách thành 5 Application Services và 5 Controllers tương ứng với 5 cụm chức năng:
1. `EmployeeService` & `EmployeesController`: Quản lý hồ sơ, cấu hình lương, cấp tài khoản.
2. `ScheduleService` & `SchedulesController`: Quản lý ca mẫu, lập lịch tuần, ban hành lịch.
3. `AttendanceService` & `AttendanceController`: Chấm công GPS/PIN, tính công, xử lý duyệt điều chỉnh công.
4. `CashierShiftService` & `CashierShiftsController`: Mở ca, tích lũy doanh thu, kiểm đếm 9 mệnh giá, Z-Report, tích hợp sinh Phiếu thu Sổ quỹ.
5. `PayrollService` & `PayrollController`: Động cơ tổng hợp ngày công, tính lương thưởng/phạt, chi trả lương và tích hợp sinh Phiếu chi Sổ quỹ.

- **Ưu điểm**:
  + Tuân thủ chặt chẽ Clean Architecture & Single Responsibility Principle.
  + Khớp 100% với 5 cụm chức năng người dùng yêu cầu và bảng API Sequence Diagram.
  + Dễ dàng viết Unit Tests & Mocking độc lập cho từng use case.
  + Dễ phân rã tasks thực thi và rà soát lỗi.
- **Nhược điểm**: Số lượng file DTOs và Interfaces nhiều hơn, nhưng có cấu trúc rõ ràng và tính mở rộng cao.

## 7. Rủi ro & Giải pháp Giảm thiểu (Risks & Mitigations)
1. **Trùng mã nhân viên khi tạo đồng thời**:
   - *Rủi ro*: 2 quản lý cùng tạo nhân viên sinh trùng mã `NV0005`.
   - *Giải pháp*: Dùng cơ chế `GetMaxSequentialCodeAsync` với retry pattern và partial unique index `IX_Employees_TenantId_EmployeeCode`.
2. **Sai lệch GPS hoặc gian lận vị trí chấm công**:
   - *Rủi ro*: Nhân viên chấm công giả mạo tọa độ ngoài cửa hàng.
   - *Giải pháp*: Sử dụng công thức toán học Haversine tính khoảng cách đường thẳng chính xác giữa tọa độ GPS gửi lên và tọa độ chi nhánh. Nếu khoảng cách > `CheckinRadiusMeters`, đánh dấu `IsGpsValid = false` và đưa vào luồng cần duyệt giải trình.
3. **Sinh đúp Phiếu thu/chi Sổ quỹ**:
   - *Rủi ro*: Nhấn duyệt ca hoặc bấm thanh toán lương 2 lần dẫn đến sinh 2 phiếu sổ quỹ.
   - *Giải pháp*: Kiểm tra tính duy nhất qua `ReferenceType` ('CASHIER_SHIFT' / 'PAYSLIP') và `ReferenceId`. Nếu đã có phiếu thu/chi tương ứng thì chặn hoặc trả về bản ghi hiện có (Idempotency).
