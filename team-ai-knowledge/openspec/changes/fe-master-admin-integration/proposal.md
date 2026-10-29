# Đề xuất: Tích hợp Frontend Master Admin Portal với Backend APIs thật

## 1. Vấn đề (Problem)
Hiện tại giao diện Master Admin Portal của MT-GRMS (`AdminDashboardPage`, `SubscriptionPlanPage`, `TenantManagementPage`, `TenantDetailPage`, v.v.) đang nạp dữ liệu tĩnh từ `mockAdminData.ts` và `mockPlanData.ts`. Các hành động thêm mới gói dịch vụ, cập nhật bảng giá, thay đổi hạn ngạch Quotas/Features, xóa gói cước, khóa gian hàng (Soft/Hard lock), mở khóa và gia hạn ân hạn chỉ cập nhật trên Local State tạm thời, chưa được kết nối và đồng bộ với cơ sở dữ liệu PostgreSQL thông qua Backend APIs đã hoàn thiện.

## 2. Mục tiêu (Goals)
1. Xây dựng tầng API Client chuyên trách (`adminApi.ts` hoặc các module services tương ứng) giao tiếp với các endpoint Backend thật:
   - `/api/v1/admin/plans` (CRUD, KPIs, Toggle Status, Delete)
   - `/api/v1/admin/tenants` (List/Pagination/Filter, Detail, Update, Lock, Unlock, Extend Grace)
   - `/api/v1/admin/dashboard` (KPIs, Plan Distribution, Urgent Alerts, Monthly Analytics)
2. Thay thế dữ liệu mock trong toàn bộ các React components và pages của phân hệ Admin bằng dữ liệu động qua React Hooks (`useState`, `useEffect` hoặc query service).
3. Đảm bảo trải nghiệm người dùng (UX) mượt mà với Skeleton / Loading Spinners, xử lý lỗi chi tiết từ backend (như `PLAN_IN_USE`, `PLAN_DUPLICATE_CODE`, `VALIDATION_ERROR`) qua Ant Design `message` / `notification`.

## 3. Phạm vi (Scope)
### In Scope
- Tạo `src/features/admin/api/adminApi.ts` sử dụng `httpClient` (kèm Bearer Token từ `localStorage`).
- Kết nối `AdminDashboardPage`: Nạp 4 thẻ KPIs thật, biểu đồ phân tích 6 tháng, cơ cấu gói cước, bảng cảnh báo khẩn cấp.
- Kết nối `SubscriptionPlanPage` & các form modals/pages: Danh sách gói cước, tạo mới, chỉnh sửa, bật/tắt kích hoạt, xóa gói (có modal confirm và bắt lỗi chặn xóa).
- Kết nối `TenantManagementPage` & `TenantDetailPage`: Tìm kiếm từ khóa, lọc theo tab trạng thái, phân trang, Modal khóa gian hàng (Soft/Hard lock kèm lý do), Modal mở khóa, Modal gia hạn ân hạn.
- Đảm bảo tương thích 100% với contract backend `ApiResponse<T>`.

### Out of Scope
- Các trang quản lý của Store Owner (Kho hàng, Bán lẻ POS, Khách hàng, Nhà cung cấp).
- Thay đổi cấu trúc CSS / Theme Ant Design gốc.

## 4. Người dùng & Phân quyền
- **Role**: `ADMIN` (Master Admin hệ thống).
- Người dùng chưa đăng nhập hoặc không có role ADMIN sẽ bị chặn bởi Interceptor hoặc Router Guard (chuyển hướng `/login` hoặc hiển thị 403 Forbidden).

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Mọi hành động CRUD trên Master Admin Portal đọc/ghi trực tiếp tới PostgreSQL Backend.
- [ ] Gói cước đang có tenant sử dụng khi bấm xóa hiển thị thông báo lỗi thân thiện từ Backend thay vì crash UI.
- [ ] Khóa / Mở khóa / Gia hạn gian hàng phản ánh ngay lập tức trên UI và cập nhật trạng thái trong database.
- [ ] Lệnh kiểm tra `npm run build` trên thư mục `MT_GRMS_FRONTEND` hoàn thành 100% không có lỗi TypeScript.
