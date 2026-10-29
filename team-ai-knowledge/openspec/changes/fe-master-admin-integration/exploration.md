# Khảo sát Kỹ thuật (Exploration): Tích hợp Frontend Master Admin Portal

## 1. Hiện trạng code liên quan (Current State)
- **Frontend Core**:
  - `src/api/httpClient.ts`: Đã có Axios instance với interceptor chèn Bearer Token từ `localStorage.getItem('access_token')` và tự động xử lý redirect login khi nhận HTTP 401.
  - `src/features/admin/data/mockAdminData.ts` & `mockPlanData.ts`: Chứa dữ liệu mock tĩnh đang được import trực tiếp vào các component.
  - `src/features/admin/types/plan.types.ts` & `admin.types.ts`: Định nghĩa types của gói cước, tenant, KPI, filters.
  - Các trang:
    - `src/pages/admin/AdminDashboardPage.tsx`
    - `src/pages/admin/SubscriptionPlanPage.tsx`
    - `src/pages/admin/SubscriptionPlanDetailPage.tsx`
    - `src/pages/admin/SubscriptionPlanCreatePage.tsx`
    - `src/pages/admin/SubscriptionPlanEditPage.tsx`
    - `src/pages/admin/TenantManagementPage.tsx`
    - `src/pages/admin/TenantDetailPage.tsx`
- **Backend APIs sẵn sàng**:
  - `AdminPlansController` (`/api/v1/admin/plans`)
  - `AdminTenantsController` (`/api/v1/admin/tenants`)
  - `AdminDashboardController` (`/api/v1/admin/dashboard`)
  - Tất cả bọc trong `ApiResponse<T>` (`success`, `data`, `message`, `errorCode`).

## 2. Giả định (Assumptions)
- Người dùng truy cập phân hệ Admin đã đăng nhập với vai trò `ADMIN` và có token hợp lệ trong `localStorage`.
- Backend Web API đang chạy trên `localhost:5000` hoặc qua reverse proxy / Vite dev server proxy `/api/v1`.
- Quản lý trạng thái dữ liệu trên UI nên hỗ trợ cả Server-side pagination (cho Tenants) lẫn Client-side caching mượt mà.

## 3. Những gì không làm (Non-Goals)
- Không viết lại cấu trúc giao diện hoặc viết lại các component CSS/Tailwind đã hoàn thiện.
- Không thay đổi hành vi của các module POS, Kho, Catalog của Store Owner.
- Không lưu mật khẩu hoặc token admin vào mã nguồn.

## 4. Các phương án kỹ thuật (Options Analysis)

### Phương án A: Sử dụng TanStack Query (`useQuery`, `useMutation`)
- **Ưu điểm**:
  - Đã có sẵn trong `package.json` (`@tanstack/react-query: ^5.104.0`).
  - Tự động quản lý caching, background refetch, loading, error, stale-time và invalidation sau mutation (ví dụ khi tạo/xóa gói cước, tự động gọi lại query `plans`).
- **Nhược điểm**:
  - Cần bọc QueryClientProvider ở `App.tsx` (nếu chưa có).

### Phương án B: Sử dụng Custom Hooks + `useEffect` + `httpClient`
- **Ưu điểm**:
  - Trực tiếp, dễ kiểm soát luồng state, không phụ thuộc cache lifecycle.
  - Ít boilerplate cấu hình ban đầu.
- **Nhược điểm**:
  - Phải tự quản lý `isLoading`, `error` và tự kích hoạt refetch thủ công sau khi gọi API mutation.

### Phương án lựa chọn: **Phương án A kết hợp Service API Client module hóa**
Xây dựng module `src/features/admin/api/adminApi.ts` đóng gói toàn bộ HTTP calls, kết hợp với các hooks trực quan (hoặc TanStack Query / React hooks) để nạp và refetch dữ liệu linh hoạt, đồng thời giữ nguyên giao diện người dùng hiện tại mà không làm gãy type definitions.

## 5. Rủi ro & Giải pháp giảm thiểu (Risks & Mitigation)
- **Rủi ro 1: Lệch kiểu dữ liệu (Type Mismatch) giữa Frontend & Backend**:
  - *Giải pháp*: Viết mapper functions chuyển đổi giữa `ApiResponse<T>` của Backend và `SubscriptionPlan` / `Tenant` của Frontend types (ví dụ: `priceMonthly` $\leftrightarrow$ `monthlyPrice`, `planCode` $\leftrightarrow$ `code`).
- **Rủi ro 2: Lỗi 400 `PLAN_IN_USE` khi xóa gói đang dùng**:
  - *Giải pháp*: Bắt lỗi `error.response?.data?.message` và hiển thị thông báo cảnh báo màu đỏ (`AdminToast` hoặc Antd `message.error`) cho Admin biết chính xác số lượng cửa hàng đang dùng gói đó.
