# Guardian Review: product-management-ui

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| **Multi-tenant** | OK | Backend tự động giải mã `TenantId` từ token phiên làm việc thông qua `CurrentTenantProvider`, frontend không truyền thủ công `tenantId`, loại bỏ hoàn toàn nguy cơ rò rỉ dữ liệu chéo tenant. |
| **AuthN/AuthZ** | OK | Mọi request đều đính kèm Bearer token thông qua Axios interceptor tại `httpClient.ts`. Quy tắc bảo mật giá vốn (BR-SEC-01) được bảo vệ 2 lớp: Backend trả `CostPrice = null`, Frontend ẩn cột và ô nhập liệu cho role không phải StoreOwner. |
| **Validation** | OK | Input được kiểm tra hợp lệ ở Frontend trước khi gửi (Tên không rỗng, Giá bán ≥ 0); Backend validate lại và trả lỗi 400 rõ ràng nếu vi phạm. |
| **Toàn vẹn dữ liệu** | OK | Xóa sản phẩm qua `DELETE /api/products/{id}` là xóa mềm (cập nhật trạng thái `Discontinued`), không làm mất dữ liệu sổ kho và hóa đơn lịch sử (BR-DATA-01). |
| **Vận hành & audit** | OK | Các thao tác tạo/sửa/xóa đều tự động kích hoạt cập nhật `CreatedAt`, `UpdatedAt` và audit logs tại Backend. |

## Vấn đề
- Không phát hiện vấn đề rủi ro an ninh hay mất an toàn dữ liệu.

## Kết luận: An toàn
