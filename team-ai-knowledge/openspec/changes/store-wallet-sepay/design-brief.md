# Design Brief: Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR (`store-wallet-sepay`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`
- **Entry Page**: `src/pages/store/StoreSettingsHubPage.tsx`, `src/pages/store/AccountManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `WalletLedgerTab`
  - `StoreWalletTopupModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/tenant/wallet/topup-order` | `WalletController.CreateTopupOrder` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/wallet/topup-status/{orderCode}` | `WalletController.GetTopupStatus` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/wallet/balance` | `WalletController.GetBalance` | JSON DTO / ProblemDetails |
| `GET` | `/api/tenant/wallet/transactions` | `WalletController.GetTransactions` | JSON DTO / ProblemDetails |
| `POST` | `/api/webhooks/sepay` | `SepayWebhookController.ReceiveSepayWebhook` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Tenant`, `WalletTransaction`, `IdempotencyRecord`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
