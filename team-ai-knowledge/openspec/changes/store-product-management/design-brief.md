# Design Brief: store-product-management (Phase 2 hoàn thiện)

## 1. UI

### StoreProductTable
- Thêm cột **Ảnh** (thumbnail `imageUrl`, fallback icon Package).
- Thêm cột **Giá bán theo ĐVT**: text tổng hợp từ `unitPrices` (vd. `chai 10.000 · lốc 60.000 · thùng 180.000`); tooltip full list nếu dài.
- Giữ cột Giá vốn (SupplierProduct), Giá bán lẻ base, MOQ (chỉ xem).

### AssignStoreProductModal
- **Chi nhánh**: ô input + suggestion/filter theo mã/tên (không chỉ `<select>`).
- **Địa chỉ**: label text + input read-only lấy từ `StoreSummary.address` khi đã chọn CN.
- Không cho nhập giá vốn / MOQ khi gán; giá bán mặc định Master (ẩn hoặc chỉ preview).

### EditStoreProductModal
- Khối chi nhánh/địa chỉ: input text (CN có thể search nếu cho đổi CN — mặc định read-only CN hiện tại + địa chỉ text).
- Khối **Giá bán theo ĐVT**: bảng/list `unitName | conversion | price (editable)`.
- Giá vốn + MOQ: read-only + chú thích nguồn NCC.
- Lưu: gửi danh sách override giá ĐVT / retail base tương ứng.

## 2. API / Data

### BranchProduct list DTO bổ sung
- `imageUrl?: string`
- `unitPrices: { unitName, conversionRate, price, isBaseUnit }[]`
- `costPrice`: effective từ SupplierProduct
- `retailPrice`: override ?? master selling
- `minOrderQuantity`: từ SupplierProduct (read)

### Update command
- Nhận `retailPrice` và/hoặc `unitPriceOverrides[]`.
- **Không** nhận `costPrice`, `moq`, `agreedPrice`.

### Assign
- `RetailPrice` khởi tạo null hoặc = Master SellingPrice theo exploration (hiển thị effective = master); không copy giá vốn.

## 3. Ràng buộc
- Chỉ Store Owner ghi (nếu AuthZ đã có sẵn thì tái sử dụng).
- Không sửa ProductUnit master từ màn CN (Phase 2).
