# Đặc Tả Delta: Tích hợp Frontend Master Admin Portal

## ADDED Requirements

### Requirement: REQ-FE-ADMIN-01 Tầng API Client Master Admin
Frontend MUST cung cấp module `adminApi.ts` đóng gói các hàm gọi API REST tới Backend thông qua `httpClient` (kèm Bearer Token từ `localStorage`).
Mọi response từ Backend MUST tuân thủ định dạng chuẩn `ApiResponse<T>`:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}
```

#### Scenario: Gửi request đính kèm Bearer Token
- **GIVEN** Người dùng đã đăng nhập với vai trò ADMIN và có `access_token` hợp lệ trong `localStorage`.
- **WHEN** Frontend gọi bất kỳ phương thức nào trong `planApi`, `tenantApi`, hoặc `dashboardApi`.
- **THEN** HTTP request gửi đi MUST có header `Authorization: Bearer <access_token>`.

#### Scenario: Bắt lỗi 401 Unauthorized
- **GIVEN** Người dùng chưa đăng nhập hoặc token đã hết hạn.
- **WHEN** Backend trả về HTTP 401 Unauthorized.
- **THEN** `httpClient` interceptor MUST tự động xóa token và chuyển hướng người dùng về trang `/login`.

---

### Requirement: REQ-FE-ADMIN-02 Tích hợp trang Quản lý Gói cước (Subscription Plans)
Trang `SubscriptionPlanPage` và các Form Modals/Pages SHALL nạp và đồng bộ dữ liệu thật với Backend qua `planApi`:
- Nạp danh sách gói cước và KPI banner từ Backend.
- Tạo mới gói cước với hạn ngạch Quotas và Features JSON.
- Cập nhật thông tin gói cước.
- Bật/tắt kích hoạt trạng thái (`IsActive`).
- Xóa gói cước kèm xử lý bắt lỗi nghiệp vụ.

#### Scenario: Nạp danh sách gói cước thật
- **GIVEN** Trang `SubscriptionPlanPage` được mount.
- **WHEN** Gọi `planApi.getPlans()` và `planApi.getKpis()`.
- **THEN** Giao diện hiển thị danh sách gói cước và 4 chỉ số KPI thật từ PostgreSQL.

#### Scenario: Bắt lỗi khi cố gắng xóa gói cước đang có khách thuê sử dụng
- **GIVEN** Gói cước `GROWTH` đang có 4 gian hàng hoạt động sử dụng.
- **WHEN** Admin bấm Xóa gói cước và xác nhận trên Modal.
- **THEN** Backend trả về HTTP 400 + `PLAN_IN_USE` kèm thông báo *"Không thể xóa gói dịch vụ đang có 4 cửa hàng sử dụng"*.
- **AND** Frontend MUST hiển thị thông báo lỗi màu đỏ rõ ràng, không làm crash giao diện và không xóa gói khỏi danh sách.

#### Scenario: Bật tắt kích hoạt gói cước
- **GIVEN** Gói cước đang ở trạng thái `ACTIVE`.
- **WHEN** Admin bấm Switch chuyển sang Tắt.
- **THEN** Gọi `planApi.toggleStatus(id)` thành công và nhãn trạng thái trên bảng chuyển thành `INACTIVE`.

---

### Requirement: REQ-FE-ADMIN-03 Tích hợp trang Quản lý Gian hàng (Tenant Management)
Trang `TenantManagementPage` và `TenantDetailPage` SHALL gọi `tenantApi` để thực hiện phân trang, lọc theo trạng thái và thực thi các nghiệp vụ bảo vệ hệ thống:

#### Scenario: Lọc gian hàng theo trạng thái
- **GIVEN** Admin chọn tab "Cần xử lý / Ân hạn" (`GRACE`) hoặc "Đang khóa" (`LOCKED`).
- **WHEN** Trigger chuyển tab.
- **THEN** Frontend gửi query `status=GRACE` hoặc `status=LOCKED` về `/api/v1/admin/tenants` và hiển thị đúng các gian hàng tương ứng.

#### Scenario: Khóa gian hàng Soft Lock (Chỉ đọc)
- **GIVEN** Gian hàng `mart-hanoi` đang hoạt động.
- **WHEN** Admin mở Modal khóa, chọn loại khóa "SOFT" và nhập lý do "Chậm thanh toán 15 ngày".
- **THEN** Gọi `tenantApi.lock(id, { lockType: "SOFT", reason: "Chậm thanh toán 15 ngày" })`.
- **AND** Modal đóng lại, danh sách gian hàng tự động reload với badge "LOCKED (SOFT)" và hiển thị Toast thông báo thành công.

#### Scenario: Mở khóa gian hàng
- **GIVEN** Gian hàng đang bị khóa.
- **WHEN** Admin chọn Mở khóa và bấm xác nhận.
- **THEN** Gọi `tenantApi.unlock(id)`, trạng thái gian hàng được khôi phục về `ACTIVE` và Toast thông báo hiển thị.

#### Scenario: Gia hạn ngày ân hạn (Extend Grace Period)
- **GIVEN** Gian hàng đang sắp hết hạn hoặc trong thời gian ân hạn.
- **WHEN** Admin mở Modal gia hạn, chọn thêm 7 ngày và nhập lý do "Chờ kế toán đối soát".
- **THEN** Gọi `tenantApi.extendGrace(id, { additionalDays: 7, reason: "..." })`.
- **AND** Số ngày ân hạn được cộng dồn và giao diện hiển thị badge "GRACE PERIOD".

---

### Requirement: REQ-FE-ADMIN-04 Tích hợp trang Master Dashboard
Trang `AdminDashboardPage` SHALL nạp dữ liệu từ `dashboardApi` để hiển thị:
- 4 thẻ KPI cards (`MRR`, `Khách thuê hoạt động`, `Tổng chi nhánh`, `Cần xử lý gấp`).
- Biểu đồ phân tích tài chính 6 tháng (MRR, ARR, ARPU, Churn Rate).
- Cơ cấu phân bổ gói cước thuê (Plan Distribution) kèm tỷ lệ phần trăm và màu sắc.
- Bảng cảnh báo khẩn cấp (Urgent Alert Table) kèm nút xử lý nhanh (Gia hạn / Khóa).

#### Scenario: Nạp dữ liệu Master Dashboard khi vào trang
- **GIVEN** Admin truy cập URL `/admin/dashboard`.
- **WHEN** Trang tải dữ liệu từ 4 endpoint của `dashboardApi`.
- **THEN** Các thẻ KPI, biểu đồ phân tích và bảng cảnh báo hiển thị số liệu thực tế được tính toán từ backend.

#### Scenario: Bấm nút Refresh trên Dashboard
- **GIVEN** Admin đang ở màn hình Dashboard.
- **WHEN** Admin bấm icon Refresh (Làm mới).
- **THEN** Toàn bộ số liệu KPI, biểu đồ và danh sách cảnh báo được gọi lại từ Backend và cập nhật tức thì.

---

## Acceptance Checklist
- [ ] `src/features/admin/api/adminApi.ts` được tạo đầy đủ các method tương ứng với 17 endpoints backend.
- [ ] `SubscriptionPlanPage` tải dữ liệu thật, CRUD và toggle status hoạt động trơn tru.
- [ ] `TenantManagementPage` hỗ trợ tìm kiếm, lọc theo status, phân trang, khóa Soft/Hard, mở khóa, gia hạn ngày ân hạn kết nối DB thật.
- [ ] `AdminDashboardPage` hiển thị 4 KPI cards, phân bổ gói cước, urgent alerts và biểu đồ tài chính thật.
- [ ] Lệnh kiểm tra build `npm run build` trên `MT_GRMS_FRONTEND` chạy thành công (0 errors).
