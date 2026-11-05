# Skeptic Review: pos-receipt-layout-cashier-and-preorder-units

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ cả 3 lỗi được người dùng nêu: bố cục in 2 dòng, tên người tạo/thu ngân theo vai trò, và chọn đơn vị cho đơn đặt trước. |
| D2 Correctness | 5/5 | Logic tính toán số lượng khả dụng theo `floor(tồn / rate)` và layout 2 dòng cho máy in 58mm đảm bảo không bị đè dòng số liệu. |
| D3 Coherence | 5/5 | Đồng nhất giữa `proposal.md`, `exploration.md` và `specs.md`. Thuật ngữ chuẩn xác. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối giới hạn `LineWidth = 40` (Font B ESC/POS), không phá vỡ schema database. |
| D5 Blast Radius | 5/5 | Phạm vi sửa đổi khoanh vùng hẹp trong `ThermalPrintService`, `InvoiceManagementPage`, `CreatePreOrderModal` và `OrderService`. Không gây breaking change cho các đơn hàng cũ. |

## Vấn đề
- [LOW] `CreatePreOrderModal.tsx`: Trường hợp sản phẩm không có đơn vị quy đổi (`unitPrices` null hoặc rỗng hoặc chỉ có 1 đơn vị) cần hiển thị text đơn vị tĩnh (`item.product.baseUnit`) thay vì render dropdown rỗng. → Đề xuất: Kiểm tra `item.product.unitPrices && item.product.unitPrices.length > 1` trước khi render `<select>`.

## Kết luận: Chấp nhận
