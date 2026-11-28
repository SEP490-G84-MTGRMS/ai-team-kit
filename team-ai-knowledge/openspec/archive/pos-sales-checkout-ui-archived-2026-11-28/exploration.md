# Exploration: pos-sales-checkout-ui

## Hiện trạng Code liên quan
- `src/app/router.tsx`: Route `/pos` hiện tại chỉ chứa một placeholder tạm `<div className="p-4 text-emerald-400">Màn hình Quầy Bán hàng POS Checkout</div>`.
- `src/layouts/PosLayout.tsx`: Đã có shell cơ bản (Header tối màu và Outlet), nhưng chưa tối ưu cho không gian làm việc thực tế của quầy thu ngân.
- Thư mục `src/features/`: Đã có các phân hệ `supplier`, `purchase-order`, `service-expenses` theo mô hình feature modules. Chưa có `features/pos`.
- Nguyên mẫu và tài liệu nghiệp vụ:
  - `man_thiet_ke/POS_Ban_Hang.html`: Wireframe đầy đủ các tính năng quầy thu ngân, giỏ hàng, bảng danh mục sản phẩm, tính tiền, các modal bổ trợ.
  - `man_thiet_ke/Mau_In_Hoa_Don_K80.html`: Mẫu hóa đơn nhiệt chuẩn 80mm với mã VietQR chân bill.
  - `projects/MT-GRMS/design/database-schema.md` & Sơ đồ ERD: Quy định rõ các thực thể `Orders`, `OrderItems`, `Products`, `ProductUnits`, `Inventory`, `Customers`, `Batches`, `Promotions`.
- CSS & Design System: `src/index.css` chứa bảng màu chuẩn của dự án (`--blue-primary: #0F766E`, font `Be Vietnam Pro`, các biến bo tròn và shadow). Tái sử dụng phân trang `admin-pagination-footer` và `admin-page-btn`.

## Assumptions (Giả định)
1. Độ phân giải màn hình tối thiểu của quầy thu ngân là 1024x768 (Desktop hoặc màn hình cảm ứng Touch Screen POS).
2. Máy quét mã vạch (Barcode Scanner) hoạt động như một thiết bị nhập ký tự (HID Keyboard) - tự động điền vào ô tìm kiếm và kích hoạt sự kiện Enter/Submit.
3. Chức năng in hóa đơn K80 sử dụng chức năng in trình duyệt (`window.print()`) kết hợp với stylesheet `@media print` được tinh chỉnh chuẩn khổ 80mm (chiều rộng 320px).
4. Khách hàng có thể là Khách vãng lai (`CustomerId = null`) hoặc Khách thành viên thân thiết có lưu trữ trong hệ thống CRM (`Customers`).

## Non-Goals (Những gì không làm)
1. Không can thiệp driver máy in nhiệt phần cứng chuyên dụng qua WebUSB / WebSerial (chỉ dùng CSS Print chuẩn K80 để tương thích mọi máy in nhiệt).
2. Không gọi API thực tế tới Ngân hàng / Napas trong bước này (dùng mock transaction VietQR và timer tự động xác nhận để phục vụ kiểm thử giao diện).
3. Không thực hiện nghiệp vụ kế toán sâu hay báo cáo doanh thu cuối ngày (được thực hiện ở phân hệ khác: Sổ ca / Két `POS_Quan_Ly_Ca.html`).

## Phương án kỹ thuật

### Phương án 1: Monolithic Component
- Gom toàn bộ logic giỏ hàng, bảng danh mục, modal, thanh toán và in bill vào duy nhất 1 file `PosPage.tsx`.
- **Ưu điểm**: Tạo nhanh trong 1 file duy nhất.
- **Nhược điểm**: File phình to (> 1,500 dòng), cực kỳ khó bảo trì, khó tái sử dụng component (như modal khách hàng hay bill print), vi phạm nguyên tắc Clean Code và cấu trúc chuẩn của dự án.

### Phương án 2: Modular Feature Component Architecture (ĐƯỢC CHỌN)
- Xây dựng thư mục độc lập `src/features/pos/`:
  - `types/pos.types.ts`: Định nghĩa Interface và Type khớp 100% với ERD và schema (`Order`, `OrderItem`, `Product`, `Customer`, `Category`, `CartItem`, `OrderTab`).
  - `components/PosHeader.tsx`: Header quầy, thông tin chi nhánh/ca trực, phím tắt hướng dẫn, nút đa tab đơn hàng (Tab 1, Tab 2, Thêm mới F1), chuyển đổi chế độ bán nhanh/bán thường, giữ đơn, chốt ca.
  - `components/PosCartTable.tsx`: Bảng giỏ hàng hiển thị các mặt hàng trong đơn, STT, SKU, tên, ĐVT, số lượng, đơn giá, chiết khấu món, thành tiền, nút xoá, popover giảm giá món, nút cảnh báo bán dưới giá vốn.
  - `components/PosCatalogGrid.tsx`: Lưới sản phẩm chọn nhanh cảm ứng Touch Screen (chế độ Bán thường), thanh lọc theo danh mục `Categories`, lưới hiển thị sản phẩm kèm tồn kho, tái sử dụng component phân trang có sẵn.
  - `components/PosPaymentPanel.tsx`: Cột phải tính tiền: Tìm kiếm & chọn khách hàng (F4), hiển thị điểm tích lũy, bảng tính tiền (tổng tiền, giảm giá KM, coupon, trừ điểm thưởng, khách cần trả), lựa chọn phương thức thanh toán (Tiền mặt F8, Chuyển khoản VietQR), nút Thanh toán lớn.
  - `components/modals/`:
    - `AddCustomerModal.tsx`: Thêm nhanh khách hàng mới.
    - `VietQrModal.tsx`: Thanh toán VietQR Napas 247 động, đếm ngược, mã hóa đơn.
    - `QuickAddProductModal.tsx`: Thêm nhanh hàng hóa chưa có trên hệ thống vào giỏ.
    - `BelowCostWarningModal.tsx`: Cảnh báo bán dưới giá vốn & nhập PIN Quản lý mở khoá (FE-03.2).
    - `OrderDiscountModal.tsx`: Chiết khấu toàn đơn hàng (VND / %).
    - `ReceiptPrintModal.tsx`: Xem trước và in hóa đơn nhiệt K80 chuẩn ESC/POS.
  - `pages/PosCheckoutPage.tsx`: Trang điều phối tích hợp toàn bộ state: quản lý danh sách tab đơn hàng, chuyển tab, thêm sản phẩm bằng quét mã Barcode, tính toán tài chính.
  - `pos.css`: Tùy biến giao diện chuyên biệt cho POS, kế thừa toàn bộ biến CSS của `:root` (`--blue-primary`, `--bg-soft-blue`, v.v.).
- **Lý do chọn**: Đảm bảo tính module hóa cao, cấu trúc đồng nhất với các feature `supplier`, `service-expenses`, dễ kiểm thử và mở rộng.

## Rủi ro & Cách giảm thiểu
1. **Rủi ro tràn bố cục khi giỏ hàng có nhiều mặt hàng**:
   - *Cách giảm*: Bố cục Flexbox/Grid chia 2 cột rõ rệt, bảng giỏ hàng có `overflow-y: auto` độc lập, cố định phần Header và Cột thanh toán bên phải.
2. **Rủi ro sai lệch định dạng khi in hóa đơn nhiệt K80**:
   - *Cách giảm*: Thiết kế `ReceiptPrintModal` với chiều rộng chuẩn 320px (80mm), font `Courier New`/monospace, kẻ bảng liền mạch và CSS `@media print` ẩn toàn bộ giao diện xung quanh chỉ in phần hóa đơn.
