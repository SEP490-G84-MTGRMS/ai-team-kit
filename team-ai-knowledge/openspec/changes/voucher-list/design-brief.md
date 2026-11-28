# Design Brief: Màn hình Quản lý Đợt Phát hành Mã Giảm giá Voucher / Coupon (`voucher-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/vouchers`, `/promotions/vouchers`
- **Entry Page**: `src/features/promotion/pages/VoucherListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `VoucherBatchTable`
  - `VoucherBatchModal`
  - `GenerateCodesModal`
  - `ConfirmDialog`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/vouchers` | `VouchersController.GetBatches` | JSON DTO / ProblemDetails |
| `GET` | `/api/vouchers/{id:guid}` | `VouchersController.GetBatchById` | JSON DTO / ProblemDetails |
| `PUT` | `/api/vouchers/{id:guid}` | `VouchersController.UpdateBatch` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/vouchers/{id:guid}` | `VouchersController.DeleteBatch` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/vouchers/{id:guid}/status` | `VouchersController.ToggleBatchStatus` | JSON DTO / ProblemDetails |
| `POST` | `/api/vouchers` | `VouchersController.CreateBatch` | JSON DTO / ProblemDetails |
| `POST` | `/api/vouchers/{id:guid}/generate-codes` | `VouchersController.GenerateCodes` | JSON DTO / ProblemDetails |
| `GET` | `/api/vouchers/{id:guid}/codes` | `VouchersController.GetCodes` | JSON DTO / ProblemDetails |
| `POST` | `/api/vouchers/validate` | `VouchersController.ValidateVoucher` | JSON DTO / ProblemDetails |
| `POST` | `/api/vouchers/redeem` | `VouchersController.RedeemVoucher` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `VoucherCode`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
