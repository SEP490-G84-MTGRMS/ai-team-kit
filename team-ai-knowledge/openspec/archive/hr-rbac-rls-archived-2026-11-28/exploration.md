# EXP-2026-11-08-001: Khảo sát Triển khai Phân quyền RBAC và Giới hạn dữ liệu RLS cho Phân hệ Nhân sự MT-GRMS

## 1. Problem Statement (Vấn đề)
Hiện tại, các API Controllers thuộc phân hệ Quản lý Nhân sự (`EmployeesController`, `ShiftConfigsController`, `SchedulesController`, `PayslipsController`, `BranchAttendancePoliciesController`) chưa có cơ chế kiểm soát vai trò (RBAC) chặt chẽ và thiếu Row-Level Security (RLS). 
- Bất kỳ tài khoản người dùng nào có JWT token hợp lệ đều có thể gọi các API nhạy cảm như xóa nhân viên, cấu hình chính sách chấm công, khởi tạo và chi trả bảng lương.
- Một tài khoản nhân viên (`EMPLOYEE` / `STAFF`) có thể gửi request để xem thông tin chi tiết hoặc bảng lương của nhân viên khác bằng cách đổi ID trong URL (Lỗ hổng Insecure Direct Object References - IDOR).
- Phía Frontend, giao diện chưa ẩn/hiện hoặc phân tách triệt để giữa màn hình quản trị của Chủ cửa hàng (`STORE_OWNER`) và giao diện tự phục vụ của Nhân viên (`EMPLOYEE`).

## 2. Context & Background (Bối cảnh)
Hệ thống MT-GRMS đã chuẩn hóa mô hình tổ chức gồm 2 cấp vai trò tương tác trực tiếp tại cửa hàng (Tenant):
1. **`STORE_OWNER`**: Chủ cửa hàng / Quản trị viên Tenant.
2. **`EMPLOYEE`** (hoặc `STAFF`): Nhân viên làm việc theo ca (Thu ngân, Bán hàng, Kho).
Cùng với **`SYSTEM_ADMIN`** / **`ADMIN`** quản trị hạ tầng nền tảng SaaS.

Tài liệu đặc tả nghiệp vụ: [`Matrix_PhanQuyen_NhanVien.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/Matrix_PhanQuyen_NhanVien.md).
Hệ thống xác thực hiện tại cấp JWT token chứa các claims:
- `ClaimTypes.NameIdentifier`: `userId`
- `ClaimTypes.Role`: `STORE_OWNER`, `EMPLOYEE`, `STAFF`, hoặc `ADMIN`
- `"tenant_id"`: Mã định danh tenant (`tenant_mt_mart_01`, ...)

## 3. Constraints (Ràng buộc)
- Phải tương thích với hạ tầng ASP.NET Core 8 Web API và kiến trúc Clean Architecture hiện tại mà không làm gãy 486 unit tests sẵn có.
- Hỗ trợ cả 2 tên role tương đương trong cơ sở dữ liệu cho nhân viên: `EMPLOYEE` và `STAFF`.
- Hiệu năng truy vấn không bị suy giảm: RLS phải áp dụng trực tiếp tại tầng truy vấn (EF Core query filter hoặc Service check).
- Frontend React 19 + TypeScript phải build thành công không có lỗi type (`tsc -b`).

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi tài khoản nhân viên khi đăng nhập sẽ có `UserId` ánh xạ 1-1 với hồ sơ `Employee` qua trường `Employee.UserId`.
- **[ASSUMPTION-02]**: `STORE_OWNER` và `ADMIN` có toàn quyền xem và thao tác trên mọi nhân viên và bảng lương thuộc tenant của họ.
- **[ASSUMPTION-03]**: Frontend lưu trữ thông tin User Role trong Auth Store / LocalStorage và có thể sử dụng để điều hướng hoặc ẩn các thành phần UI nhạy cảm.

## 5. Scope & Non-Goals
### In Scope (Trong phạm vi)
- Bảo vệ 5 Controllers Backend bằng `[Authorize(Roles = ...)]`:
  - Quyền quản trị (`STORE_OWNER, ADMIN`): Quản lý hồ sơ nhân viên (C/U/D), tạo ca làm việc, chấm công thủ công hộ, duyệt giải trình, cấu hình chính sách, tạo và chi trả lương.
  - Quyền tự phục vụ (`STORE_OWNER, ADMIN, EMPLOYEE, STAFF`): Tra cứu ca làm việc cá nhân (`my-schedule`), xem danh mục ca, xem hồ sơ cá nhân và phiếu lương của chính mình.
- Row-Level Security (RLS) kiểm soát dữ liệu:
  - `GET /api/employees/{id}`: Nhân viên chỉ xem được hồ sơ của mình.
  - `GET /api/payslips/{id}`: Nhân viên chỉ xem được phiếu lương của mình.
  - `GET /api/schedules/{id}`: Nhân viên chỉ xem được ca làm việc của mình.
- Frontend:
  - Ẩn/hiện các nút thao tác nghiệp vụ đặc quyền (Tạo nhân viên, Xếp ca, Ban hành, Tạo bảng lương, Chi trả) dựa trên role người dùng hiện tại.
  - Kiểm tra điều hướng route giữa `/store-owner/*` và `/employee/*`.

### Out of Scope / Non-Goals (Ngoài phạm vi)
- Không can thiệp vào cơ chế xác thực OTP hay đổi mật khẩu.
- Không sửa đổi logic tính lương hoặc tích hợp VietQR đã chạy ổn định.
- Không áp dụng RLS cho các phân hệ ngoài HR (như đơn hàng, kho bãi) trong change này.

## 6. Khảo sát & So sánh các phương án kỹ thuật (Options Comparison)

### Phương án A: Dùng ASP.NET Core Policy-based Authorization & Action Filters
- **Mô tả:** Định nghĩa các Authorization Requirement / Handler riêng (ví dụ `OwnerOnlyRequirement`, `EmployeeSelfOrOwnerRequirement`) và gắn attribute `[Authorize(Policy = "...")]`.
- **Ưu điểm:** Tách bạch logic phân quyền khỏi Controller.
- **Nhược điểm:** Phức tạp, sinh nhiều lớp trung gian, khó truyền động `id` từ Route vào Handler mà không cần Reflection/HttpContext lookup, làm tăng thời gian xử lý và rủi ro lỗi runtime.

### Phương án B: Role-based Authorization trên Controller + Service-level Ownership Validation (ĐỀ XUẤT CHỌN)
- **Mô tả:** 
  1. Dùng `[Authorize(Roles = "STORE_OWNER,ADMIN")]` trực tiếp cho các action quản trị trên Controller.
  2. Dùng `[Authorize(Roles = "STORE_OWNER,ADMIN,EMPLOYEE,STAFF")]` cho các action cho phép cả 2 vai trò.
  3. Tại tầng Controller / Service, trích xuất `CurrentUserId` từ JWT Claims để xác thực tính sở hữu đối với các action xem chi tiết (`id == employee.Id` hoặc `userId == employee.UserId`), nếu vi phạm trả về `403 Forbidden` (`FORBIDDEN`, "Bạn không có quyền truy cập dữ liệu của nhân sự khác.").
- **Ưu điểm:** 
  - Đơn giản, rõ ràng, tuân thủ nguyên tắc "Surgical" của Karpathy Coding.
  - Tận dụng cơ chế chuẩn có sẵn của ASP.NET Core, không cần đăng ký thêm DI handlers phức tạp.
  - Dễ viết unit test kiểm chứng từng kịch bản phân quyền.
- **Nhược điểm:** Cần kiểm tra quyền sở hữu bản ghi ở 3 endpoint xem chi tiết (`Employee`, `Payslip`, `Schedule`).

=> **Quyết định chọn: Phương án B.**

## 7. Rủi ro & Giải pháp giảm thiểu (Risks & Mitigations)
- **Rủi ro 1:** Nhân viên mới chưa liên kết `UserId` với `Employee` có thể bị lỗi khi truy vấn phiếu lương cá nhân.
  - *Giải pháp:* Kiểm tra nếu `UserId` chưa map với Employee thì trả về thông báo lỗi rõ ràng hoặc rỗng, không gây crash `NullReferenceException`.
- **Rủi ro 2:** Token cũ không có role chuẩn gây lỗi 403.
  - *Giải pháp:* Hỗ trợ cả 2 tên role `EMPLOYEE` và `STAFF` song song.

## 8. Success Criteria (Tiêu chí thành công)
1. 100% các endpoint thuộc 5 HR Controllers được bảo vệ bằng attribute `[Authorize]`.
2. Nhân viên truy cập dữ liệu của người khác bị trả lỗi HTTP 403 Forbidden.
3. Toàn bộ 486 unit tests hiện tại PASS. Bổ sung các test case kiểm tra RBAC.
4. Frontend build thành công không lỗi type.
