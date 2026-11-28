# Design Brief: Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng (`store-finance-accounts`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/subscriptions?tab=finance-accounts`, `/store-owner/payment-config`
- **Entry Page**: `src/features/finance-accounts/pages/FinanceAccountsSettingsPage.tsx`, `src/features/pos/pages/StorePaymentConfigPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `SepayVisualGuide`
  - `TablePagination`
  - `SortableHeader`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/finance-accounts` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance-accounts/sepay/transactions` | `FinanceAccountsController.GetSepayTransactions` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance-accounts/{id:guid}/sepay/transactions` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance-accounts/vietqr-default` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/finance-accounts` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `PUT` | `/api/finance-accounts/{id:guid}` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/finance-accounts/{id:guid}/status` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/finance-accounts/{id:guid}/sepay/connect` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/finance-accounts/{id:guid}/sepay` | `FinanceAccountsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/payments/public-qr-config` | `PaymentsController.GetPublicQrConfig` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `FinanceAccount`, `PaymentTransaction`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
