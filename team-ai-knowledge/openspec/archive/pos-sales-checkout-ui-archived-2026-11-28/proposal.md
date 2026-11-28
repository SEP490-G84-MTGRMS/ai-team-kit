# Proposal: pos-sales-checkout-ui

## Vấn đề
Hiện tại hệ thống MT-GRMS tại repository `MT_GRMS_FRONTEND` mới chỉ có placeholder trống tại route `/pos` (`Màn hình Quầy Bán hàng POS Checkout`), chưa có giao diện thực tế cho phân hệ Bán hàng & Thu ngân (FE-12.2). Thu ngân không thể thao tác bán hàng, quét mã vạch, chọn chế độ bán nhanh / bán thường, quản lý đa tab hóa đơn, áp dụng khuyến mãi, tích điểm thành viên, thanh toán Tiền mặt / VietQR động và in hóa đơn nhiệt khổ K80 theo quy chuẩn nghiệp vụ của đồ án.

## Mục tiêu
Thiết kế và xây dựng hoàn chỉnh giao diện Quầy Bán Hàng & Thu Ngân (POS Checkout) và Mẫu In Hóa Đơn Nhiệt K80 tại `MT_GRMS_FRONTEND` dựa trên 2 file thiết kế mẫu `POS_Ban_Hang.html`, `Mau_In_Hoa_Don_K80.html`, sơ đồ quan hệ thực thể ERD và Từ điển Dữ liệu Toàn Hệ thống (`database-schema.md`). Đảm bảo kế thừa chuẩn Design System của dự án (Tone màu Deep Teal `#0F766E`, font `Be Vietnam Pro`, bo tròn chuẩn KiotViet, tái sử dụng component phân trang có sẵn).

## Phạm vi

### In Scope
1. **Bố cục Quầy POS Fullscreen**:
   - Header Toolbar: Thông tin Chi nhánh (`Branches`), Quầy thu ngân (#01), Thu ngân trực ca (`Employees`), chỉ dẫn phím tắt (F1-F12), nút Giữ đơn (Hold/Recall), In bill gần nhất, Chốt ca.
   - Quét mã vạch (Barcode / SKU / F2) & Chuyển đổi 2 chế độ bán hàng: **Bán nhanh** (quét mã tập trung) và **Bán thường** (danh mục chọn nhanh cảm ứng Touch Screen dạng lưới sản phẩm, có bộ lọc nhóm hàng `Categories` và phân trang có sẵn).
   - Hệ thống Đa tab đơn hàng (Multi-Tab Sessions: Hóa đơn 1, Hóa đơn 2, [+] thêm phiên mới F1).
2. **Khu vực Giỏ hàng & Thao tác món**:
   - Bảng giỏ hàng chi tiết: STT, Mã hàng (`SKU`/`Barcode`), Tên & quy cách sản phẩm, tồn kho khả dụng (`Inventory.QuantityOnHand`), ĐVT (`BaseUnit` / `ProductUnits`), Số lượng tăng/giảm, Đơn giá niêm yết, Thành tiền, Xóa món.
   - Popover điều chỉnh chiết khấu từng món (giảm tiền mặt VND hoặc %).
   - Modal Cảnh báo bán dưới giá vốn (COGS) kèm kiểm soát phân quyền nhập mã PIN Quản lý (FE-03.2).
   - Dải thông báo chương trình khuyến mãi tự động cho hóa đơn.
3. **Khu vực Khách hàng & Thanh toán (Cột phải)**:
   - Panel Khách hàng (F4): Tìm kiếm khách hàng theo SĐT/Tên (`Customers`), hiển thị thẻ khách hàng đã chọn (Mã KH, Điểm tích lũy, Hạng thẻ). Modal thêm nhanh khách hàng mới.
   - Bảng tính tiền hóa đơn: Tổng tiền hàng, Giảm giá khuyến mại, Mã Coupon/Voucher, Dùng điểm thưởng tích lũy trừ tiền, Tiền khách cần trả.
   - Hình thức thanh toán:
     - **Tiền mặt (F8)**: Nhập tiền khách đưa, tự động tính tiền thừa trả khách.
     - **Chuyển khoản VietQR (FE-13.2)**: Modal Dynamic VietQR Napas 247, chọn tài khoản nhận tiền, tạo mã QR theo số tiền hóa đơn và mã giao dịch.
   - Nút Thanh toán lớn toàn chiều rộng.
4. **Modal Bổ trợ**:
   - Modal Thêm nhanh hàng hóa chưa có trên hệ thống vào giỏ hàng.
   - Modal Chiết khấu toàn đơn (giảm giá % hoặc tiền mặt).
5. **Mẫu In Hóa Đơn Nhiệt K80 (Thermal Receipt ESC/POS)**:
   - Khổ in chuẩn 80mm (rộng 320px font monospace), hỗ trợ in trực tiếp `window.print()`.
   - Đầy đủ thông tin: Tên cửa hàng, chi nhánh, số HĐ (`OrderCode`), ngày giờ, nhân viên thu ngân, thông tin khách hàng, bảng món chi tiết kèm số Lô FEFO (`BatchCode`), tổng tiền hàng, chiết khấu, VAT, số tiền bằng chữ, mã VietQR chân bill.
6. **Tuân thủ Kiến trúc & Design System**:
   - Tái sử dụng bảng màu `:root` trong `src/index.css` (`--blue-primary: #0F766E`, v.v.).
   - Tái sử dụng phong cách phân trang sẵn có (`admin-pagination-footer`, `admin-page-btn`).
   - Khớp 100% các trường dữ liệu theo ERD: `Orders`, `OrderItems`, `Products`, `ProductUnits`, `Inventory`, `Customers`, `Batches`, `Promotions`.

### Out of Scope
- Backend API thực tế (.NET Web API) — Bước này tập trung hoàn thiện tầng UI Frontend với Mock Data chuẩn Schema để kiểm thử giao diện độc lập.
- Tích hợp máy quét Barcode phần cứng chuyên dụng qua Web Serial (dùng giả lập bàn phím/input scanner chuẩn Web).

## Người dùng & Vai trò liên quan
- **Thu ngân (Cashier)**: Thao tác quét mã, bán hàng, chọn khách hàng, nhận tiền mặt / VietQR, in hóa đơn K80.
- **Quản lý / Cửa hàng trưởng (StoreManager)**: Duyệt mã PIN khi bán dưới giá vốn, quản lý két và ca trực.
- **Khách hàng (Customer)**: Mua hàng, tích điểm thành viên, quét VietQR thanh toán.

## Tiêu chí thành công
- [ ] Giao diện POS hiển thị đầy đủ 100% các thành phần và trường dữ liệu từ `POS_Ban_Hang.html` và `Mau_In_Hoa_Don_K80.html`.
- [ ] Khớp toàn bộ các trường theo Master ERD & Database Schema (`database-schema.md`).
- [ ] Có đầy đủ 2 chế độ bán hàng: Bán nhanh (Barcode) và Bán thường (chọn danh mục có phân trang tái sử dụng).
- [ ] Thao tác mượt mà: Đa tab hóa đơn, tính tiền tự động, tích điểm, VietQR modal, in hóa đơn K80.
- [ ] `npm run build` trên `MT_GRMS_FRONTEND` biên dịch thành công 0 lỗi.
- [ ] **Tuyệt đối không push lên GitHub** để người dùng review trước tại local.
