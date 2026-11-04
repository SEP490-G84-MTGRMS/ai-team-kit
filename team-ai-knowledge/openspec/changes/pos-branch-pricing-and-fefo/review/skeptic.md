# Skeptic Review: pos-branch-pricing-and-fefo

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| D1 Completeness | 5/5 | Đặc tả đã bao phủ toàn bộ các góc cạnh: giá chi nhánh, giá ĐVT quy đổi, nhân hệ số trừ kho FEFO, giao diện dropdown trên giỏ hàng, nạp seed data và unit tests. |
| D2 Correctness | 5/5 | Logic quy đổi số lượng `baseQty = Quantity * ConversionRate` để trừ kho `BranchStocks` chuẩn xác về mặt toán học và vật lý kho hàng. |
| D3 Coherence | 5/5 | Khớp 100% giữa Proposal, Exploration, Design Brief và Delta Specs. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối quy tắc Multi-tenancy (`tenant_an_nhien_02`), không làm vỡ các API cũ nhờ các trường DTO nullable mặc định. |
| D5 Blast Radius | 5/5 | CSDL đã có sẵn đầy đủ 5 bảng (`Products`, `ProductUnits`, `BranchProducts`, `BranchProductUnitPrices`, `BranchStocks`), không cần tạo thêm migration mới. |

## Vấn đề
- [MEDIUM] Khi sản phẩm có nhiều đơn vị tính (ví dụ: Lon vs Thùng), nếu khách hàng mua 2 Lon VÀ 1 Thùng trong cùng một đơn hàng, giỏ hàng POS cần đảm bảo tách thành 2 dòng riêng biệt để người dùng có thể điều chỉnh số lượng và đơn vị độc lập.
  - *Đề xuất*: Khóa định danh của CartItem nên tính theo `product.id + '_' + unit` để tránh gộp đè khi cùng 1 sản phẩm nhưng khác ĐVT.
- [LOW] Cần kiểm tra kỹ trường hợp sản phẩm chỉ có 1 đơn vị tính duy nhất (BaseUnit) thì dropdown ĐVT nên hiển thị dạng nhãn tĩnh gọn gàng để không gây rối mắt thu ngân.
  - *Đề xuất*: Đã có điều kiện kiểm tra `unitPrices.length > 1` trong spec.

## Kết luận: Chấp nhận
Spec đã đủ chặt chẽ, an toàn và sẵn sàng để chuyển sang bước Apply & Code.
