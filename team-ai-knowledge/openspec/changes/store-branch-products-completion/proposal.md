# Proposal: Hoàn thiện màn Sản phẩm theo cửa hàng

## Vấn đề
Màn `/store-owner/stores/products` chưa đủ để Store Owner vận hành giá bán theo chi nhánh:
- Bảng thiếu ảnh và thiếu tổng hợp giá bán theo từng đơn vị tính (ĐVT).
- Popup gán/sửa: chọn chi nhánh còn dạng dropdown khó tìm; địa chỉ chưa rõ kiểu text + input.
- Giá vốn / MOQ dễ bị hiểu nhầm là chỉnh được tại màn cửa hàng, trong khi nguồn đúng là SupplierProduct / điều khoản NCC.
- Khi gán SP vào cửa hàng, giá bán chưa gắn rõ mặc định từ Master; khi sửa chưa hỗ trợ chỉnh giá bán theo từng ĐVT.

## Mục tiêu
Chốt và hoàn thiện nghiệp vụ màn D (Store/Branch Products) để:
1. **Danh sách**: thêm cột **Ảnh** và cột **Giá bán theo ĐVT** (tổng hợp các mức giá theo đơn vị tính của sản phẩm).
2. **Popup gán**: Chi nhánh = ô input tìm kiếm theo text; địa chỉ = text + ô input hiển thị (read-only theo chi nhánh đã chọn).
3. **Giá vốn**: lấy từ **SupplierProduct** (giá thỏa thuận hiệu lực / Agreed), **không cho sửa** tại màn này.
4. **MOQ**: chỉ xem, **không cho sửa** tại màn này (nguồn từ điều khoản NCC).
5. **Gán mới (assign)**: giá bán khởi tạo / mặc định từ **Master Product** (và/hoặc `ProductUnit.Price` theo ĐVT).
6. **Popup Edit**: cho phép sửa **giá bán theo từng đơn vị tính**; không cho sửa giá nhập / MOQ.

## Phạm vi

### In scope
- FE màn `/store-owner/stores/products`: table + Assign popup + Edit popup.
- BE BranchProduct API: trả thêm `imageUrl` / danh sách unit prices; nguồn cost từ SupplierProduct; assign không nhận sửa MOQ/Agreed; update cho phép ghi override giá bán (base và/hoặc theo ĐVT tùy design brainstorm).
- Validate: không sửa giá nhập & MOQ từ màn cửa hàng.

### Out of scope
- Master Product CRUD / form “Tạo hàng hóa” (teammate).
- Sửa AgreedPrice / MOQ tại màn Suppliers/Products (đã thuộc màn C).
- PO Matrix / Goods Receipt (chỉ regression nhẹ nếu ảnh hưởng DTO).
- Engine giá phức tạp, phân bổ phí vận chuyển.

## Người dùng & role
- **Store Owner**: gán SP vào chi nhánh, chỉnh giá bán theo ĐVT, bật/tắt kinh doanh tại CN.
- Nhân viên / role khác: xem danh sách (không đổi giá/MOQ/giá nhập tại màn này).

## Tiêu chí thành công
1. Table có cột ảnh sản phẩm và cột tổng hợp giá bán theo ĐVT (vd. `chai: 10.000 · lốc: 60.000 · thùng: 180.000`).
2. Popup gán: gõ text tìm chi nhánh; địa chỉ hiện theo chi nhánh đã chọn dạng text/input.
3. Giá vốn trên list/edit = giá từ SupplierProduct (hiệu lực), field read-only.
4. MOQ read-only trên edit; API update từ màn CN không đổi MOQ/Agreed.
5. Assign: giá bán mặc định từ Master / ProductUnit; không bắt user nhập giá vốn.
6. Edit: đổi được giá bán từng ĐVT và lưu thành công; reload list phản ánh giá mới.
7. Không có input/API path cho phép sửa giá nhập tại màn này.
