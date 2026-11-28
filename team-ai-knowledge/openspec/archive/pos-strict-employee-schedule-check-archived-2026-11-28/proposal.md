# Đề Xuất (Proposal): Chặn Cứng Nhân Viên Không Có Lịch Trực Vào Bán Hàng POS (Strict Schedule Block)

## 1. Vấn Đề (Problem Statement)
Hiện tại trên hệ thống MT-GRMS:
- Phân hệ bán hàng POS (`ShiftZReport` / `OrderService`) chỉ kiểm tra xem chi nhánh có ca két tiền mặt đang mở hay chưa, mà **chưa kiểm tra đối soát** với lịch phân ca nhân sự (`EmployeeSchedule`).
- Bất kỳ tài khoản nhân viên nào thuộc chi nhánh (kể cả nhân viên đang trong ngày nghỉ, làm ca khác, hoặc chưa được xếp lịch) khi đăng nhập vào hệ thống đều có thể truy cập màn hình POS và bấm thanh toán tạo đơn hàng.
- Rủi ro phát sinh: Khó quy trách nhiệm cá nhân đối với sai lệch tiền két, gian lận tạo đơn ngoài giờ làm việc, và mất tính nhất quán giữa dữ liệu chấm công thực tế với lịch sử giao dịch POS.

## 2. Mục Tiêu (Goal)
Triển khai cơ chế **Chặn cứng (Strict Block)**:
- Khi nhân viên đăng nhập vào màn hình POS hoặc bấm thanh toán đơn hàng, Backend và Frontend sẽ tự động kiểm tra xem nhân viên đó có lịch làm việc hợp lệ (`EmployeeSchedule`) tại chi nhánh hiện tại, trong ngày hôm nay và khung giờ hiện tại hay không.
- Nếu không có lịch trực hợp lệ $\rightarrow$ Hệ thống chặn không cho phép bán hàng và hiển thị thông báo rõ ràng: *"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh"*.
- Đảm bảo tính linh hoạt cần thiết cho quản trị viên: Miễn trừ kiểm tra lịch trực cho tài khoản có vai trò Chủ cửa hàng (`STORE_OWNER`) và Quản trị viên (`ADMIN`).

## 3. Phạm Vi Triển Khai (Scope)

### Trong phạm vi (In Scope):
1. **Kiểm tra lịch trực tại Backend**:
   - Thêm phương thức xác thực lịch làm việc `ValidateEmployeeScheduleAsync` đối soát `CurrentUserId`, `BranchId`, ngày hiện tại (`WorkDate`) và khung giờ làm việc (`PlannedStartTime` đến `PlannedEndTime` hoặc `AllowedCheckInStart` đến `AllowedCheckInEnd` kèm dung sai buffer 30 phút).
   - Ràng buộc tại `OrderService.CreateOrderAsync`: Ném lỗi `BusinessException("EMPLOYEE_NOT_SCHEDULED", "Bạn không có lịch làm việc trong ca hiện tại của chi nhánh.")` nếu nhân viên vi phạm.
   - Ràng buộc tại `ShiftService.OpenShiftAsync`: Không cho phép nhân viên mở ca nếu không có lịch làm việc trong khung giờ mở ca.
   - Miễn trừ xác thực lịch phân ca đối với vai trò `STORE_OWNER`, `OWNER`, `ADMIN`.
2. **Kiểm tra và cảnh báo tại Frontend POS**:
   - Khi vào màn POS ([`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx)), kiểm tra trước lịch trực của nhân viên hiện tại.
   - Nếu không có ca trực, hiển thị Alert/Banner thông báo rõ ràng và vô hiệu hóa nút thanh toán đơn hàng.
3. **Dữ liệu hạt giống (Seed Data)**:
   - Cung cấp dữ liệu mẫu lịch phân ca cho 2 nhân viên Ba Đình (`0917778888` và `0915556666`) để hỗ trợ kiểm thử đối chứng (1 nhân viên có lịch ca hợp lệ và 1 nhân viên không có lịch ca).

### Ngoài phạm vi (Out of Scope):
- Không thay đổi nghiệp vụ tính lương (`Payslip`) hay chấm công FaceID.
- Không thay đổi giao diện quản lý xếp lịch tại [`WorkSchedulePage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/employee/pages/WorkSchedulePage.tsx).

## 4. Người Dùng & Quyền Hạn (Target Users & Roles)
- **Nhân viên thu ngân (`EMPLOYEE`)**: Bắt buộc phải có lịch làm việc hợp lệ trong ngày và đúng khung giờ mới được thực hiện các thao tác mở ca và thanh toán đơn POS.
- **Chủ cửa hàng (`STORE_OWNER`) / Quản trị viên (`ADMIN`)**: Được phép bán hàng mọi lúc mọi nơi mà không bị chặn lịch trực.

## 5. Tiêu Chí Thành Công Đo Được (Success Metrics)
- 100% yêu cầu tạo đơn từ tài khoản `EMPLOYEE` không có lịch làm việc hợp lệ trong khung giờ hiện tại bị chặn với mã lỗi `EMPLOYEE_NOT_SCHEDULED`.
- Nhân viên có lịch làm việc hợp lệ được mở ca và bán hàng thông suốt.
- Chủ cửa hàng (`STORE_OWNER`) bán hàng bình thường không gặp bất kỳ cảnh báo nào.
- Toàn bộ test suite Backend (`dotnet test`) và Frontend Build (`npm run build`) đạt 100% PASS.
