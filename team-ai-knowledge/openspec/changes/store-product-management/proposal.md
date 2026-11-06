# Proposal: store-product-management

## 1. Vấn đề
Màn `/store-owner/stores/products` đã có khung list / gán / sửa, nhưng còn thiếu để Store Owner vận hành đủ:
1. Bảng thiếu **ảnh sản phẩm** và thiếu **tổng hợp giá bán theo từng đơn vị tính (ĐVT)**.
2. Popup gán: chọn chi nhánh còn khó tìm (dropdown); địa chỉ chưa rõ dạng text + input.
3. Giá vốn / MOQ dễ bị hiểu là chỉnh được tại màn cửa hàng — nguồn đúng là **SupplierProduct** / điều khoản NCC.
4. Khi gán SP, giá bán chưa gắn mặc định từ **Master / ProductUnit**; popup edit chưa hỗ trợ sửa **giá bán theo từng ĐVT**.

## 2. Mục tiêu (đã có + bổ sung hoàn thiện)
### Đã có (phase trước)
- Màn Store Product Management theo layout chuẩn suppliers/products.
- Filter chip-token, Assign modal, Edit modal, đổi trạng thái / gỡ SP.

### Bổ sung hoàn thiện (phase này)
1. **Table**: thêm cột **Ảnh**; thêm cột **Giá bán theo ĐVT** (tổng hợp, vd. `chai: 10.000 · lốc: 60.000 · thùng: 180.000`).
2. **Popup gán**: Chi nhánh = ô **input tìm kiếm text**; địa chỉ = text + input (theo CN đã chọn, read-only).
3. **Giá vốn**: lấy từ **SupplierProduct** (giá thỏa thuận hiệu lực) — **không cho sửa** tại màn này.
4. **MOQ**: chỉ xem — **không cho sửa** tại màn này.
5. **Gán mới**: giá bán mặc định từ **Master Product / ProductUnit**.
6. **Popup Edit**: cho sửa **giá bán từng ĐVT**; không sửa giá nhập / MOQ.

## 3. Phạm vi

### In Scope
- FE: `StoreProductTable`, `AssignStoreProductModal`, `EditStoreProductModal`, types/API.
- BE BranchProduct: trả `imageUrl` + unit prices; cost từ SupplierProduct; update giá bán (base/ĐVT); không nhận sửa MOQ/Agreed/giá nhập từ màn CN.

### Out of Scope
- Master Product CRUD / form “Tạo hàng hóa” (teammate).
- Sửa AgreedPrice / MOQ tại màn Suppliers/Products.
- PO Matrix / Goods Receipt (chỉ regression nhẹ).

## 4. Người dùng liên quan
- **Store Owner**: gán SP, chỉnh giá bán theo ĐVT, bật/tắt kinh doanh tại CN.
- Role khác: xem danh sách; không đổi giá nhập / MOQ tại màn này.

## 5. Tiêu chí thành công
1. Table có cột ảnh và cột tổng hợp giá bán theo ĐVT.
2. Popup gán: tìm chi nhánh bằng text; địa chỉ hiện theo CN đã chọn.
3. Giá vốn list/edit = SupplierProduct (hiệu lực), read-only.
4. MOQ read-only; API update CN không đổi MOQ/Agreed.
5. Assign: giá bán mặc định từ Master/ProductUnit.
6. Edit: lưu được giá bán từng ĐVT; reload list phản ánh giá mới.
7. Không có path sửa giá nhập tại màn này.
8. Build FE/BE + test smoke màn stores/products pass.
