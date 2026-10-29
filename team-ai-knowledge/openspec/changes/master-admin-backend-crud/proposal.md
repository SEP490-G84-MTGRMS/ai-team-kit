# Proposal: master-admin-backend-crud

## Vấn đề
Hiện tại, màn hình Master Admin Portal phía Frontend (`MT_GRMS_FRONTEND`) đã được hoàn thiện đầy đủ giao diện (Dashboard KPI, Quản lý khách thuê Tenants, Quản lý gói cước Subscription Plans, Modals Khóa/Mở khóa/Gia hạn) nhưng toàn bộ dữ liệu đang phải sử dụng Mock Data (`mockAdminData.ts`, `mockPlanData.ts`).
Phía Backend (`MT_GRMS_BACKEND`) đã có sẵn mô hình thực thể (Domain Entities) `Tenant`, `SubscriptionPlan`, `TenantUser` và bảng cơ sở dữ liệu trên PostgreSQL, nhưng chưa có các tầng Application Services, DTOs, Repositories và Web API Controllers để cung cấp các nghiệp vụ CRUD, thống kê và điều hành cho Master Admin. Điều này khiến cho hệ thống SaaS chưa thể vận hành thực tế trên môi trường phân phối đa khách thuê (Multi-Tenancy).

## Mục tiêu
- Xây dựng đầy đủ các API RESTful phục vụ trọn vẹn các tính năng trên màn hình Master Admin:
  1. **Quản lý Gói dịch vụ (Subscription Plans)**: Xem danh sách, chi tiết, tạo mới gói, cập nhật giá, hạn mức (Quotas) và tính năng (Features), bật/tắt kích hoạt gói.
  2. **Quản lý Khách thuê (Tenants)**: Xem danh sách khách thuê kèm phân trang/lọc trạng thái/tìm kiếm, xem chi tiết thông tin gói và chi nhánh/nhân sự, cập nhật trạng thái Khóa (Soft Lock/Hard Lock kèm lý do), và Gia hạn ân hạn (Extend Grace Period).
  3. **Thống kê Master Dashboard & KPI**: Cung cấp số liệu tổng quan MRR, ARR, tỷ lệ tăng trưởng, phân bổ khách thuê theo gói cước, danh sách cảnh báo khẩn cấp (khách sắp hết hạn/trong diện ân hạn/bị khóa).
- Đảm bảo cơ chế phân quyền bảo mật: Chỉ tài khoản có vai trò `ADMIN` (Master Admin) mới được phép gọi các API thuộc phân hệ này.

## Phạm vi
- **In scope**:
  - Backend API cho Quản lý Gói cước SaaS (`SubscriptionPlan`):
    - `GET /api/admin/plans`: Lấy danh sách gói cước (kèm số tenant đang dùng).
    - `GET /api/admin/plans/{id}`: Xem chi tiết gói cước.
    - `POST /api/admin/plans`: Tạo mới gói cước SaaS.
    - `PUT /api/admin/plans/{id}`: Cập nhật thông tin gói cước, quotas, features.
    - `PATCH /api/admin/plans/{id}/status`: Bật/tắt kích hoạt gói cước.
  - Backend API cho Quản lý Khách thuê (`Tenant`):
    - `GET /api/admin/tenants`: Danh sách khách thuê (hỗ trợ phân trang, lọc trạng thái `active`, `expiring`, `grace`, `locked`, tìm kiếm theo tên/subdomain/taxCode).
    - `GET /api/admin/tenants/{id}`: Xem chi tiết khách thuê (thông tin chủ chuỗi, gói cước, số chi nhánh, số nhân viên).
    - `PUT /api/admin/tenants/{id}`: Cập nhật thông tin khách thuê.
    - `POST /api/admin/tenants/{id}/lock`: Khóa chuỗi cửa hàng (hỗ trợ Soft Lock / Hard Lock kèm lý do).
    - `POST /api/admin/tenants/{id}/unlock`: Mở khóa chuỗi cửa hàng.
    - `POST /api/admin/tenants/{id}/extend-grace`: Gia hạn thêm ngày ân hạn (Grace Period) cho khách thuê.
  - Backend API cho Master Dashboard:
    - `GET /api/admin/dashboard/kpis`: 4 thẻ chỉ số chính (MRR, Active Tenants, Total Branches, Expiring Tenants).
    - `GET /api/admin/dashboard/plan-distribution`: Tỷ lệ phân bổ khách thuê theo từng gói cước và doanh thu.
    - `GET /api/admin/dashboard/urgent-alerts`: Danh sách cảnh báo khẩn cấp cần xử lý.
    - `GET /api/admin/dashboard/analytics`: Biểu đồ tăng trưởng doanh thu 12 tháng gần nhất.
  - Xây dựng tầng Application (Services, DTOs, FluentValidation), tầng Infrastructure (Repositories) tuân thủ Clean Architecture.
  - Bộ kiểm thử tự động (Unit Tests & Integration Tests) bảo đảm độ tin cậy của API.
- **Out of scope**:
  - Tích hợp cổng thanh toán trực tuyến tự động (VNPay/MoMo/Stripe) cho việc thanh toán gói cước (thực hiện ở phase thanh toán chuyên biệt).
  - Tự động quét cron job định kỳ hàng đêm để tự động khóa tài khoản hết hạn (thuộc về Background Worker).
  - Sửa đổi giao diện Frontend (sẽ tích hợp gọi API ở bước tiếp theo).

## Người dùng liên quan
- **SaaS Master Admin (Super Admin)**: Người quản trị cấp cao nhất của hệ sinh thái SaaS MT-GRMS, quản lý chính sách gói cước, giám sát vận hành toàn hệ thống, và can thiệp hỗ trợ các chuỗi khách thuê.

## Tiêu chí thành công
- [ ] 100% các endpoint CRUD và nghiệp vụ Quản lý Gói cước (Plans) hoạt động chính xác, validate dữ liệu đầu vào chặt chẽ.
- [ ] 100% các endpoint Quản lý Khách thuê (Tenants - lọc, tìm kiếm, chi tiết, khóa/mở khóa, gia hạn) hoạt động chính xác và cập nhật đúng trạng thái CSDL.
- [ ] Endpoint Master Dashboard tổng hợp được số liệu thống kê thực tế từ CSDL PostgreSQL (thay vì mock).
- [ ] Bảo vệ toàn bộ endpoint bằng `[Authorize(Roles = "ADMIN")]` và middleware JWT đã thiết lập.
- [ ] Bộ kiểm thử Unit Test & Integration Test đạt 100% PASS, không có lỗi tiềm ẩn.
- [ ] `dotnet build` đạt 0 Warning, 0 Error.
