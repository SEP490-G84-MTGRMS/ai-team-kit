# Design Brief: Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ (`store-settings-subscription`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/subscriptions`, `/store-owner/settings`
- **Entry Page**: `src/pages/store/StoreSettingsHubPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `StoreSidebarNav`
  - `StoreTopStatusBar`
  - `StoreInfoTab`
  - `SubscriptionPricingCards`
  - `SubscriptionCheckoutModal`
  - `StaffAddonModal`
  - `OrderHistoryTab`
  - `TermsOfServiceTab`
  - `TrialStatusBanner`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/tenant/subscriptions/staff-addon/quote` | `TenantStoreController.GetStaffAddonQuote` | JSON DTO / ProblemDetails |
| `POST` | `/api/tenant/subscriptions/staff-addon/purchase` | `TenantStoreController.PurchaseStaffAddon` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/store-info` | `TenantStoreController.GetStoreInfo` | JSON DTO / ProblemDetails |
| `PUT` | `/api/tenant/store-info` | `TenantStoreController.UpdateStoreInfo` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/pricing-plans` | `TenantStoreController.GetPricingPlans` | JSON DTO / ProblemDetails |
| `POST` | `/api/tenant/subscriptions/pro-quote` | `TenantStoreController.QuoteProUpgrade` | JSON DTO / ProblemDetails |
| `POST` | `/api/tenant/subscriptions/purchase` | `TenantStoreController.PurchaseSubscription` | JSON DTO / ProblemDetails |
| `POST` | `/api/tenant/subscriptions/trial` | `TenantStoreController.ActivateTrialSubscription` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/subscriptions/trial-status` | `TenantStoreController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/subscriptions/access-status` | `TenantStoreController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Tenant`, `SubscriptionPlan`, `WalletTransaction`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
