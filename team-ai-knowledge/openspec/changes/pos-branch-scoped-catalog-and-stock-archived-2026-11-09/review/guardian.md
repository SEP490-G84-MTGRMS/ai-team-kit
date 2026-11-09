# Guardian Review: pos-branch-scoped-catalog-and-stock

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | `BranchProduct` và `BranchStock` đều kế thừa `BaseTenantEntity` có global query filter `TenantId`. Việc cô lập thêm theo `BranchId` ngăn chặn triệt để đọc/bán chéo chi nhánh và chéo tenant. |
| AuthN/AuthZ | OK | Mọi endpoint POS (`/orders`, `/orders/pre-order`, `/orders/{id}/return-exchange`) yêu cầu quyền tương ứng. Chi nhánh thao tác lấy từ `request.BranchId` (đối chiếu người dùng) hoặc `originalOrder.BranchId`. |
| Validation | OK | Xác thực tồn tại và trạng thái Active của `BranchProduct` được thực hiện trước khi tạo order, trừ tồn FEFO, trừ ngân sách khuyến mãi, hoặc dùng voucher. Báo lỗi `PRODUCT_NOT_IN_BRANCH`. |
| Toàn vẹn dữ liệu | OK | Không tạo migration, không đổi schema. Giao dịch toàn vẹn trong Transaction scope của EF Core / Npgsql. Trừ tồn FEFO vẫn giữ khóa `FOR UPDATE`. |
| Vận hành & audit | OK | Lỗi trả về `ProblemDetails` theo chuẩn RFC 7807 với thông điệp rõ ràng, không làm lộ stack trace hay dữ liệu nhạy cảm. Quà tặng không hợp lệ được log/bỏ qua an toàn mà không làm sập giao dịch. |

## Vấn đề
- Không phát hiện vấn đề HIGH. Các biện pháp bảo vệ dữ liệu và multi-tenant đều đạt chuẩn an toàn.

## Kết luận: An toàn
Spec đáp ứng đầy đủ yêu cầu an toàn, bảo mật và toàn vẹn dữ liệu.
