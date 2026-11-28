# Design Brief: Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y (`promotion-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/promotions`, `/promotions`
- **Entry Page**: `src/features/promotion/pages/PromotionListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `PromotionFilterBar`
  - `PromotionTable`
  - `PromotionModal`
  - `ConfirmDialog`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/promotions` | `PromotionsController.GetPromotions` | JSON DTO / ProblemDetails |
| `GET` | `/api/promotions/{id:guid}` | `PromotionsController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/promotions` | `PromotionsController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/promotions/{id:guid}` | `PromotionsController.Update` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/promotions/{id:guid}/status` | `PromotionsController.ToggleStatus` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/promotions/{id:guid}` | `PromotionsController.Delete` | JSON DTO / ProblemDetails |
| `POST` | `/api/promotions/evaluate-cart` | `PromotionsController.EvaluateCart` | JSON DTO / ProblemDetails |
| `POST` | `/api/promotions/seed-sample-data` | `PromotionsController.SeedSampleData` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Promotion`, `PromotionCondition`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
