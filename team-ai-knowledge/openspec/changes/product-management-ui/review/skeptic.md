# Skeptic Review: product-management-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5.0 | Đã bao phủ toàn diện cả 3 trường hợp của đơn vị quy đổi: thêm mới (ID tạm), sửa (GUID cũ), xóa (ghi nhận ID bị xóa), cùng việc khóa mã hàng SKU. |
| D2 Correctness | 5.0 | Cơ chế client-side diffing phân loại chính xác các request gọi đến REST API của Backend (`PUT /products/{id}`, `DELETE /product-units/{id}`, `POST /products/{id}/units`, `PUT /product-units/{id}`). |
| D3 Coherence | 5.0 | Thống nhất 100% giữa proposal, exploration, design-brief và specs delta (từ REQ-01 đến REQ-09). |
| D4 Constraints | 5.0 | Tôn trọng nghiêm ngặt tính bất biến của mã hàng SKU (`disabled` ô input), tuân thủ bảo mật giá vốn BR-SEC-01 cho vai trò Thu ngân. |
| D5 Blast Radius | 5.0 | Tận dụng hoàn hảo các REST endpoint có sẵn của Backend mà không cần sửa đổi backend API, logic gói gọn trong `productApi.ts`, `ProductFormModal.tsx` và `ProductListPage.tsx`. |

## Vấn đề đã ghi nhận & Xử lý
- [LOW] REQ-09: Cần đảm bảo nếu người dùng xóa một đơn vị mới tạo (chưa lưu vào DB, có ID dạng `uom-*`), không đưa ID này vào `deletedUnitIds` để tránh gửi request DELETE vô nghĩa lên Backend.
- [LOW] REQ-09: Thêm hàm `updateProductUnit` vào `productApi.ts` với đầy đủ types `ProductUnitUpdatePayload` khớp với `ProductUnitUpdateRequest` ở backend.

## Kết luận: Chấp nhận
Specs REQ-09 đã chặt chẽ, rõ ràng và sẵn sàng để lập tasks và thực thi code.
