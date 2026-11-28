# Design Brief: Triển khai RBAC & Row-Level Security (RLS) cho Phân hệ Nhân sự

## 1. Luồng người dùng & Ranh giới vai trò (User Flows & Role Boundaries)

### 1.1. Luồng của Chủ cửa hàng (`STORE_OWNER`)
1. **Đăng nhập:** Đăng nhập tài khoản chủ cửa hàng $\rightarrow$ Hệ thống cấp JWT Token có claim `role: "STORE_OWNER"`.
2. **Quản trị Nhân sự:** Truy cập `/store-owner/employees` để xem toàn bộ danh sách, tạo mới nhân viên, cập nhật mức lương cơ sở, cấp tài khoản đăng nhập.
3. **Quản trị Ca & Lịch làm việc:** Truy cập `/store-owner/employees/schedule` và `/store-owner/employees/shifts` để tạo ca mẫu, xếp ca cho toàn bộ nhân viên, ban hành lịch tuần (`Publish`).
4. **Giám sát chấm công & Duyệt giải trình:** Truy cập `/store-owner/employees/attendance` để xem bảng công, ghi nhận công trực tiếp, duyệt đơn xin nghỉ/đi muộn của nhân viên.
5. **Kỳ lương & Chi trả:** Truy cập `/store-owner/employees/payroll` để kích hoạt tính toán bảng lương tháng, kiểm tra đối soát, thực hiện chi trả qua tiền mặt hoặc VietQR, tự động hạch toán phiếu chi Sổ quỹ.

### 1.2. Luồng của Nhân viên (`EMPLOYEE` / `STAFF`)
1. **Đăng nhập:** Đăng nhập tài khoản nhân viên $\rightarrow$ Hệ thống cấp JWT Token có claim `role: "EMPLOYEE"` hoặc `"STAFF"`.
2. **Cổng tự phục vụ:** Chuyển hướng tới `/employee/schedule` hoặc `/employee/attendance`.
3. **Xem ca làm việc:** Chỉ xem các ca làm việc của chính mình thông qua API `GET /api/schedules/my-schedule`. Bị chặn truy cập bảng phân ca tổng hợp của cửa hàng.
4. **Chấm công:** Thực hiện Check-in / Check-out, xem lịch sử điểm danh của mình, gửi đơn giải trình công khi có sự cố.
5. **Phiếu lương cá nhân:** Chỉ xem chi tiết phiếu lương của chính mình qua `GET /api/payslips/{id}` (nếu `payslip.Employee.UserId == currentUserId`). Bị chặn truy cập danh sách phiếu lương toàn cửa hàng (`GET /api/payslips`).

---

## 2. Thiết kế API Endpoints & Ràng buộc RBAC / RLS (API Security Contracts)

### 2.1. `EmployeesController` (`/api/employees`)
| Method | Path | Required Role | RLS Rule (Kiểm soát sở hữu dữ liệu) | Mã lỗi khi vi phạm |
|---|---|---|---|---|
| `GET` | `/api/employees` | `STORE_OWNER, ADMIN` | Toàn bộ nhân viên trong Tenant | `403 Forbidden` nếu là `EMPLOYEE` |
| `GET` | `/api/employees/{id}` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Nếu `EMPLOYEE`: bắt buộc `id == CurrentUser.EmployeeId` hoặc `UserId == CurrentUser.Id` | `403 Forbidden` nếu xem nhân viên khác |
| `POST` | `/api/employees` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |
| `PUT` | `/api/employees/{id}` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |
| `PATCH`| `/api/employees/{id}/status` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |
| `POST` | `/api/employees/{id}/identity-account` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |
| `PUT` | `/api/employees/{id}/identity-account` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |
| `DELETE`| `/api/employees/{id}` | `STORE_OWNER, ADMIN` | — | `403 Forbidden` |

### 2.2. `ShiftConfigsController` (`/api/shift-configs`)
| Method | Path | Required Role | Ghi chú |
|---|---|---|---|
| `GET` | `/api/shift-configs` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Cho phép nhân viên đọc thông tin ca |
| `GET` | `/api/shift-configs/{id}` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Cho phép nhân viên đọc chi tiết ca |
| `POST` | `/api/shift-configs` | `STORE_OWNER, ADMIN` | Chỉ Owner được tạo ca |
| `PUT` | `/api/shift-configs/{id}` | `STORE_OWNER, ADMIN` | Chỉ Owner được sửa ca |
| `PATCH`| `/api/shift-configs/{id}/status` | `STORE_OWNER, ADMIN` | Chỉ Owner được bật/tắt ca |
| `DELETE`| `/api/shift-configs/{id}` | `STORE_OWNER, ADMIN` | Chỉ Owner được xóa ca |

### 2.3. `SchedulesController` (`/api/schedules`)
| Method | Path | Required Role | RLS Rule |
|---|---|---|---|
| `GET` | `/api/schedules` | `STORE_OWNER, ADMIN` | Xem danh sách ca toàn cửa hàng |
| `GET` | `/api/schedules/my-schedule` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Trích xuất `UserId` từ JWT Claims để truy vấn đúng ca cá nhân |
| `GET` | `/api/schedules/{id}` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Nếu `EMPLOYEE`: chỉ xem nếu ca thuộc về chính mình |
| `POST` | `/api/schedules` | `STORE_OWNER, ADMIN` | Chỉ Owner được tạo ca |
| `POST` | `/api/schedules/batch` | `STORE_OWNER, ADMIN` | Chỉ Owner được phân ca theo lô |
| `POST` | `/api/schedules/recurring` | `STORE_OWNER, ADMIN` | Chỉ Owner tạo lịch lặp lại |
| `PUT` | `/api/schedules/{id}` | `STORE_OWNER, ADMIN` | Chỉ Owner cập nhật ca |
| `DELETE`| `/api/schedules/{id}` | `STORE_OWNER, ADMIN` | Chỉ Owner xóa ca |
| `POST` | `/api/schedules/publish` | `STORE_OWNER, ADMIN` | Chỉ Owner ban hành ca |
| `POST` | `/api/schedules/{id}/attendance` | `STORE_OWNER, ADMIN` | Chỉ Owner chấm công thủ công hộ |

### 2.4. `PayslipsController` (`/api/payslips`)
| Method | Path | Required Role | RLS Rule |
|---|---|---|---|
| `GET` | `/api/payslips` | `STORE_OWNER, ADMIN` | Chỉ Owner tra cứu danh sách lương |
| `GET` | `/api/payslips/{id}` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Nếu `EMPLOYEE`: chỉ xem nếu phiếu lương thuộc về mình (`Employee.UserId == CurrentUserId`) |
| `POST` | `/api/payslips/generate-batch` | `STORE_OWNER, ADMIN` | Chỉ Owner tính lương |
| `POST` | `/api/payslips/recalculate` | `STORE_OWNER, ADMIN` | Chỉ Owner tính lại lương |
| `POST` | `/api/payslips/{id}/pay` | `STORE_OWNER, ADMIN` | Chỉ Owner chi trả lương |
| `POST` | `/api/payslips/batch-pay` | `STORE_OWNER, ADMIN` | Chỉ Owner chi trả hàng loạt |
| `DELETE`| `/api/payslips/{id}` | `STORE_OWNER, ADMIN` | Chỉ Owner xóa phiếu lương |

### 2.5. `BranchAttendancePoliciesController` (`/api/attendance-policies`)
| Method | Path | Required Role | Ghi chú |
|---|---|---|---|
| `GET` | `/api/attendance-policies/branch/{branchId}` | `STORE_OWNER, ADMIN, EMPLOYEE, STAFF` | Đọc quy chế chấm công |
| `PUT` | `/api/attendance-policies/branch/{branchId}` | `STORE_OWNER, ADMIN` | Chỉ Owner cấu hình chính sách |
| `POST` | `/api/attendance-policies/copy` | `STORE_OWNER, ADMIN` | Chỉ Owner sao chép chính sách |

---

## 3. Thiết kế Frontend & Giao diện người dùng (UI Component Design)

1. **Route Guard & Authorization Check:**
   - Hệ thống sử dụng vai trò lưu trong User State (`user.roleName` hoặc `user.role`).
   - Đường dẫn `/store-owner/employees/*` được bọc bởi guard chỉ cho phép `STORE_OWNER` và `ADMIN`. Nếu tài khoản là `EMPLOYEE` truy cập vào sẽ tự động redirect về `/employee/schedule` hoặc `/employee/pos`.
2. **Ẩn / Hiện Action Controls:**
   - Tại `PayslipManagementPage.tsx`: Nếu không phải Owner, ẩn các nút "Khởi tạo bảng lương", "Tính lại bảng lương", "Chi trả", "Chi trả hàng loạt".
   - Tại `WorkSchedulePage.tsx`: Nếu là màn hình của Employee (`isEmployeeView`), ẩn nút "Xếp ca", "Ban hành lịch", chỉ hiển thị giao diện xem ca dạng thẻ ngày/tuần.
   - Tại `AttendancePage.tsx`: Nhân viên chỉ thấy nút Check-in / Check-out cá nhân, ẩn nút "Chấm công thủ công" và "Cấu hình chính sách".

---

## 4. Thiết kế Cơ sở dữ liệu (Database Schema)
- Không yêu cầu thay đổi schema cơ sở dữ liệu và không cần migration mới.
- Tận dụng cấu trúc hiện có:
  - `TenantUsers (TenantId, UserId, Role)`
  - `Employees (Id, TenantId, UserId, FullName, ...)`
  - `EmployeeSchedules (Id, TenantId, EmployeeId, ...)`
  - `Payslips (Id, TenantId, EmployeeId, ...)`
