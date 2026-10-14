# Exploration: admin-service-plans-management

## 1. Hiện trạng & Bối cảnh
- **Hệ thống hiện tại**:
  - `MT_GRMS_FRONTEND` đã có trang Quản lý Tenant (`/admin/tenants`), Quản lý Nhà cung cấp (`/admin/suppliers`), Quản lý Đơn hàng (`/admin/purchase-orders`), Chi phí (`/admin/expenses`), Khách hàng CRM (`/admin/customers`).
  - Trong `src/styles/admin.css`, dự án đã thiết lập hoàn chỉnh hệ thống class và design token cho quản trị viên:
    - Bảng dữ liệu chuẩn `.admin-data-table`, `.admin-table-card` với viền `#e2e8f0`.
    - Thanh công cụ lọc `.admin-toolbar-card` với viền `1px solid #cbd5e1`, bo góc `10px`.
    - Ô nhập liệu `.admin-search-input` với viền `#cbd5e1`, bo góc `8px`.
    - Nút bấm `.admin-btn`, `.admin-btn-primary` (Deep Teal `#0F766E`), `.admin-table-btn` (bo góc `6px`).
    - Hệ thống modal chuẩn `.admin-modal-backdrop`, `.admin-modal-box`.
    - Thẻ KPI `.admin-kpi-grid`, `.admin-kpi-card`.
- **Thiết kế mẫu gốc (`Html/demo/admin/`)**:
  - `subscriptions.html`: Trang danh sách gói dịch vụ SaaS với bảng so sánh giá tháng/năm, quota chi nhánh, nhân sự và danh sách tenant đang thuê.
  - `create_plan.html`: Form khởi tạo gói dịch vụ mới gồm 3 phần: Thông tin cơ bản & bảng giá, Định ngạch kỹ thuật (Quota chi nhánh, nhân viên, dung lượng database, sao lưu), Cấu hình 6 module tính năng bán lẻ cốt lõi.
  - `update_plan.html`: Form cập nhật thông tin và điều chỉnh hạn mức tài nguyên cho gói đã tồn tại.
  - `subscription_detail.html`: Màn hình xem chi tiết gói cước, quota và danh sách các tenant đang sử dụng gói.

## 2. Assumptions & Non-Goals
- **Assumptions**:
  - Phân hệ này dành riêng cho Super Admin nền tảng, truy cập qua route `/admin/subscriptions`.
  - Sử dụng React Query và Mock Data chuẩn (`mockSubscriptionPlans`) mô phỏng đầy đủ dữ liệu thực tế trước khi backend API hoàn tất.
  - Toàn bộ giao diện tái sử dụng 100% các class có sẵn trong `src/styles/admin.css`, tuyệt đối không viết CSS tùy tiện hoặc phá vỡ bảng màu Deep Teal.
- **Non-Goals**:
  - Chưa tích hợp cổng thanh toán trực tuyến tự động (VNPay/Momo/Stripe) hay webhook ngân hàng tự động trừ tiền kỳ hạn.
  - Chưa xử lý việc tự động hạ cấp tài nguyên vật lý trên cloud cluster (Kubernetes/AWS) khi tenant chuyển gói.

## 3. Khảo sát & Đánh giá các Phương án Triển khai

### Phương án A: Tách thành 4 trang Route độc lập (`/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id/edit`, `/admin/subscriptions/:id`)
- **Ưu điểm**: Giống cấu trúc các tệp HTML rời trong `Html/demo/admin/`.
- **Nhược điểm**: Trải nghiệm ứng dụng SPA (Single Page Application) bị gián đoạn, mỗi thao tác tạo/sửa/xem phải chuyển trang toàn phần, người dùng mất ngữ cảnh danh sách bảng dữ liệu.

### Phương án B: Single Page kết hợp Modal Dialogs cao cấp (Recommended)
- **Cấu trúc**:
  - Trang chính `/admin/subscriptions` (`SubscriptionPlanPage.tsx`): Bao gồm Banner KPI thống kê, Thanh lọc tìm kiếm `.admin-toolbar-card`, Bảng dữ liệu gói `.admin-data-table`.
  - Các thao tác Create, Edit, Detail được mở dưới dạng **Modal Box chuyên dụng** (`CreatePlanModal.tsx`, `UpdatePlanModal.tsx`, `PlanDetailModal.tsx`) tái sử dụng khung modal `.admin-modal-box` của `admin.css`.
- **Ưu điểm**:
  - Trải nghiệm mượt mà, phản hồi tức thì (Instant feedback), không bị tải lại trang.
  - Nhất quán 100% với cách trang Quản lý Tenant (`TenantManagementPage.tsx`) đang vận hành (`TenantDetailModal`, `ApplyLockModal`, `ExtendGraceModal`).
  - Dễ quản lý state (thêm/sửa trực tiếp vào React Query cache / local state).
  - Tận dụng tối đa các class modal chuẩn trong `src/styles/admin.css`.
- **Nhược điểm**: Form tạo/sửa gói cước có nhiều trường cấu hình quota nên modal cần có `max-width: 760px` và thanh cuộn nội dung mượt mà.

### Phương án C: Master-Detail trên 2 cột chia đôi màn hình (Split Pane)
- **Ưu điểm**: Xem danh sách bên trái, chi tiết bên phải.
- **Nhược điểm**: Không đủ không gian hiển thị bảng cấu hình Quota chi nhánh và 6 module tính năng bán lẻ; giao diện bị chật chội trên màn hình laptop tiêu chuẩn.

## 4. Phương án Được Lựa Chọn & Lý Do
👉 **Lựa chọn Phương án B (Single Page kết hợp Modal Dialogs chuyên dụng)**:
- Đảm bảo tính nhất quán cao nhất với toàn bộ hệ thống quản trị hiện tại (`TenantManagementPage`, `SupplierListPage`, `CustomerManagementPage`).
- Tận dụng triệt để hệ thống CSS có sẵn tại `src/styles/admin.css` (đã chuẩn hóa viền `1px solid #cbd5e1`, bo góc `8px - 10px`, màu Deep Teal `#0F766E`).
- Tách nhỏ từng component theo đúng nguyên tắc component-hóa, dễ bảo trì và mở rộng khi gắn API thực tế.

## 5. Rủi ro & Phương án Kiểm soát
1. **Rủi ro Form Quota quá dài**:
   - *Kiểm soát*: Chia form thành 3 Tabs hoặc 3 Khối rõ ràng (`1. Thông tin cơ bản & Giá` &rarr; `2. Hạn mức Quota kỹ thuật` &rarr; `3. Module tính năng kích hoạt`) giống mẫu `create_plan.html`.
2. **Rủi ro trùng mã gói (Plan Code Collision)**:
   - *Kiểm soát*: Validation tự động chuyển mã sang chữ IN HOA (`PLAN_...`), kiểm tra tính duy nhất so với danh sách hiện có.
3. **Rủi ro đồng bộ router**:
   - *Kiểm soát*: Đăng ký đầy đủ route `/admin/subscriptions` trong `src/app/router.tsx` và gắn link tương ứng trên Topbar/Sidebar.
