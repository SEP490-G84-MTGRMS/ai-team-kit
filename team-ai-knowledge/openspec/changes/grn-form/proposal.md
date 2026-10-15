# Proposal: grn-form

## Vấn đề
Hiện tại, hệ thống MT-GRMS đã có màn hình danh sách phiếu nhập kho và lịch nhận hàng (`/store-owner/goods-receipts`), tuy nhiên chưa có màn hình chi tiết form để Thủ kho / Nhân viên chi nhánh thực hiện quy trình nhập kho thực tế khi xe hàng của nhà cung cấp đến điểm bán.
Quá trình kiểm đếm hàng thực tế phát sinh các rủi ro:
1. Hàng giao thực tế bị thừa/thiếu so với đơn đặt hàng PO gốc nhưng không có cơ chế đối soát ngay tại kho.
2. Không ghi nhận được Mã Lô (Batch Code) và Hạn sử dụng (EXP Date) dẫn đến không quản lý được chuẩn xuất nhập FEFO (First Expired, First Out) và để lọt hàng cận date (<30 ngày).
3. Thiếu việc hạch toán các chi phí kèm theo (chi phí vận chuyển Landed Cost, chiết khấu NCC, thuế VAT) làm sai lệch giá vốn nhập kho thực tế.

## Mục tiêu
Xây dựng giao diện **Form Lập Phiếu Nhập Kho (Goods Receipt Note Form)** dựa trên prototype `design_ui/grn_form.html` và thiết kế nhất quán với design system của MT-GRMS:
1. Hỗ trợ nhập kho xuất phát từ Đơn mua hàng PO (Purchase Order): chọn PO gốc hoặc mở trực tiếp từ lịch nhận hàng hôm nay, tự động load danh sách SKU và số lượng đặt.
2. Cho phép kiểm đếm số lượng thực nhận, tự động phát hiện và cảnh báo chênh lệch (Difference Qty).
3. Nhập Mã Lô hàng (Batch Code), Hạn sử dụng (EXP Date) và tự động gắn nhãn cảnh báo hàng cận date FEFO (<30 ngày).
4. Tính toán chi phí kèm theo (Chi phí vận chuyển Landed Cost, Chiết khấu NCC, Thuế VAT) và tổng giá trị thanh toán thực tế của phiếu nhập.
5. Cung cấp các hành động nghiệp vụ: Lưu nháp (Draft), Hoàn tất nhập kho (Confirmed) và Hoàn tất & In tem mã vạch.

## Phạm vi
### In scope:
- Giao diện Form lập phiếu nhập kho chuẩn React 19 / TypeScript / CSS nhất quán với MT-GRMS.
- Header phiếu: Chi nhánh nhận, Mã GRN tự sinh (`GRN-YYYYMMDD-XXX`), Đơn PO tham chiếu, Nhà cung cấp, Ngày giờ nhận, Số hóa đơn/phiếu giao hàng NCC, Người lập phiếu, Hạn thanh toán và Phương thức thanh toán (Công nợ AP, Tiền mặt, Chuyển khoản).
- Bảng chi tiết hàng hóa:
  - Ô quét mã vạch barcode / tìm kiếm SKU nhanh để định vị dòng hàng.
  - Các cột: STT, Mã SKU, Tên sản phẩm, ĐVT, SL đặt (theo PO), SL thực nhận (input kiểm đếm), Chênh lệch (tự động tính), Mã Lô hàng (input), Hạn sử dụng (date picker), Cảnh báo FEFO cận date, Đơn giá nhập, Thành tiền.
  - Chức năng thêm dòng hàng bổ sung / xóa dòng hàng (nếu có biên bản cho phép).
- Khu vực tổng hợp chi phí:
  - Ghi chú nhập kho.
  - Landed Cost (phí vận chuyển/bốc dỡ), Chiết khấu, Thuế VAT (%).
  - Tổng tiền hàng và Tổng giá trị phiếu nhập (Grand Total).
- Thanh công cụ hành động (Action Bar): Hủy bỏ, Lưu nháp (Draft), Hoàn tất nhập kho (Confirmed), Hoàn tất & In tem.
- Hỗ trợ xem lại phiếu nhập kho đã xác nhận (View/Read-only mode).
- Tích hợp route `/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id` và liên kết điều hướng từ màn hình GRN List.

### Out of scope:
- Kết nối API phần cứng máy in tem barcode thực tế (chỉ mô phỏng notification / print dialog).
- Nhập kho trực tiếp không qua PO (nghiệp vụ hệ thống quy định 100% nhập kho từ đơn PO).
- Tích hợp thanh toán ngân hàng trực tuyến (chỉ ghi nhận phương thức thanh toán cho công nợ AP).

## Người dùng liên quan
- **Thủ kho / Nhân viên chi nhánh (Warehouse Staff / Branch Employee)**: Trực tiếp nhận hàng tại cửa hàng, kiểm đếm số lượng, nhập thông tin lô date FEFO, lập biên bản nếu lệch và hoàn tất nhập kho.
- **Chủ cửa hàng / Quản lý kho (Store Owner / Inventory Manager)**: Xem chi tiết phiếu nhập kho, theo dõi tổng tiền, đối soát chi phí vận chuyển Landed Cost và duyệt các phiếu có chênh lệch.

## Tiêu chí thành công
- [ ] Giao diện tái hiện đầy đủ và nâng cấp thẩm mỹ từ prototype `design_ui/grn_form.html` theo chuẩn enterprise UI của MT-GRMS.
- [ ] Tự động tính toán tức thời: Thành tiền từng dòng, Tổng tiền hàng, Chênh lệch SL đặt vs thực nhận, Chi phí Landed Cost, Chiết khấu, VAT và Grand Total.
- [ ] Tự động cảnh báo FEFO khi hạn sử dụng còn dưới 30 ngày so với ngày hiện tại.
- [ ] Đầy đủ các luồng trạng thái: `Draft` (Lưu nháp tiếp tục kiểm đếm) và `Confirmed` (Chốt phiếu nhập kho).
- [ ] Build TypeScript và Vite thành công 100% không có lỗi, tương thích trên các kích thước màn hình.
