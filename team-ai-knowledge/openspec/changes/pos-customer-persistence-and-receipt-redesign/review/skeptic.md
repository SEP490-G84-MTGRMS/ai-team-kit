# Skeptic Review: pos-customer-persistence-and-receipt-redesign

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đầy đủ scenarios cho trường hợp tạo thành công, trùng SĐT, bỏ chọn rồi tìm lại, in hóa đơn không VAT và hiển thị động thông tin Tenant/Chi nhánh. |
| D2 Correctness | 5 | Logic chuẩn hóa hoàn toàn: gỡ bỏ VAT ở POS receipt và ESC/POS print; gọi API `POST /api/customers` để persist khách hàng vào PostgreSQL với ID GUID thật. |
| D3 Coherence | 5 | Nhất quán chặt chẽ giữa proposal.md, exploration.md, design-brief.md và specs.md; tuân thủ đúng yêu cầu thực tế từ ảnh hóa đơn người dùng cung cấp. |
| D4 Constraints | 5 | Tuân thủ triệt để Multi-tenancy (TenantId cách ly), không thay đổi schema CSDL, giữ nguyên giới hạn 32 ký tự của khổ giấy 58mm/43mm. |
| D5 Blast Radius | 5 | Tác động khu trú (surgical) tại các component POS (`AddCustomerModal`, `PosReceiptModal`, `PosCheckoutPage`) và `ThermalPrintService`; không gây breaking changes cho API khác. |

## Vấn đề
- [MEDIUM] `AddCustomerModal.tsx`: Khi submit form, cần đảm bảo nút bấm bị disable và có spinner để tránh người dùng click đúp gửi liên tiếp 2 request tạo khách hàng trùng nhau. → Đề xuất: Thêm state `isSubmitting` và disable nút "Lưu khách hàng" trong lúc request đang xử lý.
- [LOW] `ThermalPrintService.cs`: Đối với tên cửa hàng hoặc tên sản phẩm quá dài, cần đảm bảo hàm `FormatTwoColumns` hoặc ngắt dòng không làm méo mó các cột số lượng và thành tiền. → Đề xuất: Cắt ngắn tên sản phẩm hoặc in tên sản phẩm ở dòng riêng và in dòng thông số ở dòng kế tiếp như chuẩn in nhiệt hiện tại.

## Kết luận: Chấp nhận
Tài liệu đặc tả và thiết kế đã hoàn chỉnh, giải quyết triệt để vấn đề mất thông tin khách hàng và form hóa đơn không chuẩn. Sẵn sàng lập tasks và tiến hành áp dụng code.
