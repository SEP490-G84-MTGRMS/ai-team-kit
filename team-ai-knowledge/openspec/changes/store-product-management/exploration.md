# Exploration: store-product-management

## 1. Hiện trạng (đã có sau Phase 1)
- Màn `/store-owner/stores/products` đã chạy: list, filter chip-token, Assign/Edit modal, đổi trạng thái/gỡ.
- Giá vốn trên list/edit đã hướng tới SupplierProduct; MOQ trên Edit đã read-only một phần.
- Còn thiếu so với nghiệp vụ chốt (Phase 2):
  - Cột **Ảnh** và cột **Giá bán theo ĐVT** (tổng hợp).
  - Assign: Chi nhánh tìm bằng **input text**; địa chỉ dạng text/input.
  - Edit: sửa **giá bán từng ĐVT**; khóa cứng giá nhập + MOQ.
  - Assign: giá bán mặc định từ Master/ProductUnit.

## 2. Phương án Phase 2

### Ảnh & giá bán theo ĐVT trên table
- **A**: Chỉ base retail + thumbnail từ `Product.ImageUrl` — thiếu tổng hợp ĐVT.
- **B [CHỌN]**: API trả `imageUrl` + `unitPrices[]` (`unitName`, `conversionRate`, `price`); FE cột tổng hợp dạng `chai: 10k · lốc: 60k`.

### Nguồn giá vốn
- **A**: Master `CostPrice`.
- **B [CHỌN]**: SupplierProduct effective purchase (Agreed nếu có, else Master Cost) — khớp pricing-layers; **read-only** tại màn CN.

### Giá bán khi gán / khi sửa
- Assign: mặc định từ Master `SellingPrice` / `ProductUnit.Price`; không nhập giá vốn/MOQ.
- Edit: cho sửa giá theo từng ĐVT.  
  - **B1**: Ghi đè thẳng `ProductUnit.Price` (ảnh hưởng mọi CN) — rủi ro.
  - **B2 [CHỌN]**: Override tại CN: base `BranchStock.RetailPrice` + map giá ĐVT = base × conversion (hoặc lưu JSON override nếu đã có); hiển thị tổng hợp từ override ?? Master unit price.

### Popup chọn chi nhánh
- Đổi dropdown → **combobox input** tìm theo mã/tên; địa chỉ = input text read-only theo CN chọn.

## 3. Quyết định chốt
1. Table: +Ảnh, +Giá bán theo ĐVT (tổng hợp).
2. Cost = SupplierProduct effective; không sửa giá nhập / MOQ tại màn này.
3. Assign: default bán từ Master/Unit; CN search text + địa chỉ text.
4. Edit: sửa giá bán theo ĐVT (override CN), không đụng Master unit catalog trừ khi product chỉ có 1 CN và design sau cho phép — mặc định **không** sửa ProductUnit master từ màn này.
