# Design Brief: Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán (`cashbook-ledger`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/cashbook`, `/cashbook`
- **Entry Page**: `src/features/cashbook/pages/CashbookPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `CashbookFilterToolbar`
  - `CashbookLedgerTable`
  - `CreateReceiptModal`
  - `CreatePaymentModal`
  - `InternalTransferModal`
  - `CashbookExportModal`
  - `PrintReceiptModal`
  - `ReverseTransactionModal`
  - `TriageInboxModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/cashbook/shifts/open` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/shifts/close` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/cash-drop` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/cashbook/entries` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/tills/init` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/cashbook/accounts` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/cashbook/summary` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/receipts` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/owner-safe-deposits` | `CashbookController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/cashbook/payments` | `CashbookController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `CashbookEntry`, `FinanceAccount`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
