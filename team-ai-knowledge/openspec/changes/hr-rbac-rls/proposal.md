# Proposal: Áp dụng RBAC & Row-Level Security (RLS) cho Phân hệ Quản lý Nhân sự MT-GRMS

## 1. Bối cảnh & Vấn đề (Problem Statement)
Phân hệ Quản lý Nhân sự (HR & Shift Management) của MT-GRMS bao gồm các chức năng cốt lõi: Hồ sơ nhân viên, Danh mục ca làm việc, Xếp lịch phân ca, Bảng chấm công và Bảng tính lương & Chi trả.
Hiện tại:
- Một số API Controllers chưa được áp dụng triệt để thuộc tính xác thực và phân quyền (`[Authorize(Roles = ...)]`), hoặc chỉ xác thực danh tính mà chưa kiểm tra chặt chẽ vai trò người dùng.
- Chưa có cơ chế **Row-Level Security (RLS)** ở tầng Service/Repository để ngăn chặn việc nhân viên (`EMPLOYEE`) tra cứu hoặc can thiệp chéo vào hồ sơ, ca làm việc và phiếu lương của đồng nghiệp khác.
- Phía Frontend, giao diện người dùng cần được bảo vệ đồng bộ: chỉ hiển thị các nút thao tác, modal và route phù hợp với vai trò của người đang đăng nhập.

## 2. Mục tiêu (Goals)
1. **Chuẩn hóa phân quyền (RBAC):** Thực thi nghiêm ngặt quyền hạn giữa 2 vai trò tại Tenant theo đúng tài liệu [`Matrix_PhanQuyen_NhanVien.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/Matrix_PhanQuyen_NhanVien.md):
   - **`STORE_OWNER`:** Toàn quyền quản trị nhân sự, ca làm việc, cấu hình chính sách chấm công, chốt bảng lương và thực hiện chi trả qua Sổ quỹ.
   - **`EMPLOYEE`:** Chỉ được phép tự phục vụ (Self-Service) gồm tra cứu lịch làm việc của mình, check-in/out cá nhân, gửi giải trình và xem phiếu lương của chính bản thân.
   - **`SYSTEM_ADMIN`:** Quản trị nền tảng SaaS.
2. **Triển khai Row-Level Security (RLS):**
   - Ràng buộc tự động `TenantId` cho mọi truy vấn dữ liệu.
   - Khi tài khoản mang role `EMPLOYEE`, hệ thống tự động lọc dữ liệu chỉ trả về dữ liệu gắn liền với `CurrentUser.UserId` hoặc `CurrentUser.EmployeeId`.
   - Ngăn chặn triệt để hành vi trích xuất ID trái phép (IDOR - Insecure Direct Object References) đối với phiếu lương và thông tin cá nhân.
3. **Đồng bộ hóa Frontend UI:**
   - Ẩn/hiện các nút hành động (Tạo nhân viên, Xếp ca, Ban hành, Tạo bảng lương, Chi trả) dựa theo role người dùng hiện tại.
   - Bảo vệ các đường dẫn router thông qua route guards tương ứng với vai trò.

## 3. Phạm vi (Scope)
- **Trong phạm vi (In Scope):**
  - **Backend API Controllers:**
    1. `EmployeesController` (`/api/employees`)
    2. `ShiftConfigsController` (`/api/shift-configs`)
    3. `SchedulesController` (`/api/schedules`)
    4. `PayslipsController` (`/api/payslips`)
    5. `BranchAttendancePoliciesController` (`/api/attendance-policies`)
  - **Backend Application Services & Security Filters:** Kiểm tra quyền sở hữu bản ghi (Data Ownership Validation).
  - **Frontend UI & Components:**
    - Cổng quản trị Store Owner (`/store-owner/employees/*`)
    - Cổng nhân viên (`/employee/*`)
    - Các Modal nhạy cảm: `CreateUserModal`, `PayslipPaymentModal`, `AttendanceConfigModal`, `ApprovalRequestsModal`.
- **Ngoài phạm vi (Out of Scope):**
  - Các phân hệ ngoài HR (Quản lý kho hàng, Bán hàng POS, Khách hàng, Nhà cung cấp).
  - Đổi mới thuật toán tính lương hay cơ chế AI FaceID đã hoàn thành trước đó.

## 4. Tác nhân & Vai trò liên quan (Actors & Roles)
1. **`STORE_OWNER`:** Người dùng có quyền cao nhất trong cửa hàng, quản lý mọi chi nhánh thuộc tenant.
2. **`EMPLOYEE`:** Nhân viên trực tiếp (Thu ngân, Bán hàng, Kho) đăng nhập cổng nhân viên để xem ca và bảng lương.
3. **`SYSTEM_ADMIN`:** Quản trị viên SaaS quản lý gói đăng ký và tenant.

## 5. Tiêu chí thành công (Success Criteria)
- [ ] 100% các endpoint của 5 Controllers HR được bảo vệ bởi Authorize / Role validation đúng theo `Matrix_PhanQuyen_NhanVien.md`.
- [ ] Nhân viên (`EMPLOYEE`) khi gọi `GET /api/employees/{otherEmployeeId}` hoặc `GET /api/payslips/{otherPayslipId}` sẽ bị từ chối với mã lỗi `403 Forbidden` hoặc `404 Not Found`.
- [ ] Nhân viên không thể thực hiện các hành động quản trị: Phân ca (`/batch`), Ban hành (`/publish`), Chấm công hộ (`/attendance`), Khởi tạo lương (`/generate-batch`), Chi trả (`/pay`, `/batch-pay`) — hệ thống trả về `403 Forbidden`.
- [ ] Toàn bộ hệ thống test suite hiện tại (`dotnet test` 486 unit tests) vẫn tiếp tục PASS, bổ sung unit/integration test cho RBAC & RLS.
- [ ] Frontend build thành công (`tsc -b && vite build`), giao diện phân biệt rõ ràng màn hình và quyền hạn giữa Chủ cửa hàng và Nhân viên.
