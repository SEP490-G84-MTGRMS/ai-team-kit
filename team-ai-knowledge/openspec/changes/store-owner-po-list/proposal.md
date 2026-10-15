# Proposal: store-owner-po-list

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, sau khi Store Owner / Branch Manager tạo đơn qua Bảng lưới đặt hàng (Order Matrix Grid) hoặc chốt đơn phân tách PO theo nhà cung cấp (Dispatch Hub), Store Owner chưa có một màn hình danh sách tập trung để theo dõi, tra cứu, quản lý vòng đời và trạng thái của tất cả các đơn mua hàng (Purchase Orders - PO) đã phát hành hoặc đang xử lý.
Việc thiếu màn hình này khiến Store Owner không thể:
- Nắm bắt tổng quan các đơn PO đã gửi cho nhà cung cấp (`SENT`), nhà cung cấp đã xác nhận (`CONFIRMED`), đang giao/nhận một phần (`PARTIALLY_RECEIVED`), đã hoàn tất nhập kho (`RECEIVED`) hay bị hủy (`CANCELLED`).
- Lọc đơn theo từng chi nhánh nhận hàng, theo từng nhà cung cấp, hoặc theo khoảng ngày đặt/giao hàng.
- Nhanh chóng điều hướng đến xem chi tiết PO, theo dõi tiến độ giao hàng hoặc điều chỉnh thông tin đơn hàng khi cần.

## Mục tiêu
Xây dựng màn hình "Danh sách đơn mua hàng (Purchase Order List)" dành riêng cho vai trò Store Owner, dựa trên prototype chuẩn `po_list.html` và tích hợp hài hòa với Design System hiện tại của MT-GRMS (B2B SaaS ERP, bảng dữ liệu phân trang, sticky header, unified filter toolbar, status badge chuẩn hóa, modal/drawer xem chi tiết).

## Phạm vi
### In scope:
- **Header**: Tiêu đề trang "Danh sách đơn mua hàng (PO)", breadcrumb / quick links liên kết tới các nghiệp vụ lân cận ("Chốt đơn với nhà cung cấp", "Bảng lưới đặt hàng").
- **Unified Filter Bar**:
  - Lọc theo Chi nhánh nhận (`Chi nhánh nhận: BR-01, BR-02, BR-03, Kho tổng DC1...`)
  - Lọc theo Nhà cung cấp (`Nhà cung cấp: TươiSạch, SnackVN, Vissan, CP Foods...`)
  - Lọc theo Trạng thái PO: `Tất cả`, `SENT` (Đã gửi NCC), `CONFIRMED` (NCC đã chốt đơn), `PARTIALLY_RECEIVED` (Đã nhận một phần), `RECEIVED` (Đã nhập kho xong), `CANCELLED` (Đã hủy)
  - Lọc theo Khoảng thời gian: `Từ ngày` - `Đến ngày` (dựa trên ngày sửa cuối / ngày tạo)
  - Ô tìm kiếm linh hoạt (Keyword search: Mã PO, Mã tham chiếu, Tên NCC, Tên chi nhánh, Người nhập)
  - Nút "Tìm kiếm" và "Đặt lại" bộ lọc.
- **Data Table**:
  - Cột 1: Mã PO (Mã hệ thống + Mã cửa hàng, link mở chi tiết)
  - Cột 2: Nhà cung cấp (Tên + Mã NCC badge)
  - Cột 3: Chi nhánh nhận hàng (Tên + Mã chi nhánh)
  - Cột 4: Nguồn tạo / Người tạo đơn (Người nhập grid, chi nhánh hoặc Store Owner)
  - Cột 5: Ngày sửa cuối (thời gian timestamp định dạng DD/MM/YYYY HH:mm)
  - Cột 6: Dự kiến giao hàng (Ngày giao hàng dự kiến)
  - Cột 7: Số mặt hàng (Số lượng SKU / mặt hàng trong PO, căn giữa)
  - Cột 8: Tổng tiền (VNĐ) (Căn phải, định dạng tiền tệ vi-VN, font tabular nums)
  - Cột 9: Trạng thái PO (Badge màu chuẩn UI Design System: SENT vàng, CONFIRMED xanh lá nhạt, PARTIALLY_RECEIVED chàm, RECEIVED xanh dương, CANCELLED đỏ)
  - Cột 10: Thao tác (Xem chi tiết, Sửa / Huỷ tuỳ theo trạng thái PO)
- **Footer Phân trang (Paging)**:
  - Hiển thị dải bản ghi "Hiển thị X - Y trên Z đơn hàng"
  - Lựa chọn bản ghi / trang: 10, 20, 30, 50
  - Cụm nút chuyển trang: [Trước], [Trang X / Y], [Sau]
- **Modal / Drawer Xem nhanh chi tiết PO**: Cho phép Store Owner xem danh sách mặt hàng, số lượng, đơn giá, thành tiền mà không làm mất ngữ cảnh lọc của bảng danh sách.
- **Mock Data**: Dữ liệu mẫu phong phú phản ánh đầy đủ các trạng thái và nghiệp vụ thực tế của MT-GRMS.
- **Routing**: Cấu hình route `/store-owner/purchase-orders` (hoặc `/store-owner/purchase-orders/list`).

### Out of scope:
- Nghiệp vụ kiểm đếm nhận hàng thực tế tại kho / scan barcode (thuộc module Inbound Receiving / Kho).
- Tích hợp cổng thanh toán trực tuyến hoặc hạch toán kế toán chi tiết (thuộc module Finance / Sổ quỹ).
- Backend API kết nối thật (trong pha này tập trung hoàn thiện UI/UX chuẩn Enterprise ERP).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi / Chủ cửa hàng)**: Người theo dõi tổng thể mọi đơn PO từ tất cả các chi nhánh gửi đến các nhà cung cấp, kiểm tra tiến độ giao hàng và tổng giá trị mua hàng.
- **Store Manager / Branch Manager**: Tham khảo để tra cứu danh sách PO của chi nhánh mình phụ trách.

## Tiêu chí thành công
- [ ] Màn hình danh sách đơn PO hiển thị đầy đủ thông tin chuẩn xác theo prototype `po_list.html` và quy chuẩn design system của MT-GRMS.
- [ ] Bộ lọc đa tiêu chí (Chi nhánh, NCC, Trạng thái, Khoảng ngày, Keyword) hoạt động tức thì, mượt mà và chính xác.
- [ ] Data Table có sticky header, định dạng số tiền chuẩn, badge trạng thái trực quan với màu sắc ngữ nghĩa rõ ràng.
- [ ] Phân trang hoạt động mượt mà với lựa chọn kích thước trang (10, 20, 30, 50).
- [ ] Click vào dòng hoặc nút "Xem chi tiết" mở xem thông tin PO nhanh chóng.
- [ ] Giao diện responsive, tuân thủ đúng CSS theme tokens của dự án (`--text-main`, `--blue-primary`, `--border-light`), không vỡ layout trên desktop và laptop.
- [ ] Build thành công với `npm run build` không lỗi TypeScript hay ESLint.
