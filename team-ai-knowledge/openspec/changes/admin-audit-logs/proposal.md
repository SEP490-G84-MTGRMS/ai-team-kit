# Proposal: Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs) (`admin-audit-logs`)

## Vấn đề
Nền tảng đa người thuê cần khả năng truy vết đầy đủ mọi hành động nhạy cảm (khóa gian hàng, thay đổi gói cước, sửa cấu hình, đăng nhập quản trị) theo chuẩn giờ Việt Nam.

## Mục tiêu
Cung cấp màn hình tra cứu, lọc và xem chi tiết payload trước/sau của toàn bộ nhật ký kiểm toán hệ thống.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/audit-logs`, `/admin/system-logs` (`src/pages/admin/AuditLogPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `AuditLogTable`, `AuditLogDetailModal`, `TablePagination`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminAuditLogsController`) và thực thể nghiệp vụ (`AuditLog`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/audit-logs`, `/admin/system-logs` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/audit-logs`, `/admin/system-logs`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-06` (FE-21).
