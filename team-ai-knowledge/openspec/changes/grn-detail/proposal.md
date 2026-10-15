# Proposal: grn-detail

## Vấn đề
Hiện tại trong luồng nhập hàng từ đơn đặt hàng PO:
1. Sau khi nhân viên kiểm đếm và lập phiếu nhập kho (GRN Form), hệ thống thiếu **Màn hình Chi tiết Phiếu nhập kho kiêm Xác nhận tổng quan (GRN Detail & Confirmation)** để:
   - Thủ kho / Chủ cửa hàng rà soát lại thông tin tổng thể trước khi bấm "HOÀN TẤT & DUYỆT NHẬP KHO".
   - Xem chi tiết lịch sử phiếu nhập kho đã hoàn tất (`CONFIRMED`) từ danh sách GRN List hoặc drawer.
2. Thiếu cơ chế chốt trạng thái đơn mua hàng gốc (`PO Status Update`):
   - Khi giao thiếu hàng (Under-delivery), người kiểm đếm cần chọn hướng xử lý cho từng dòng thiếu:
     - `backorder`: Nhà cung cấp sẽ giao bù vào đợt sau (PO giữ trạng thái `PARTIALLY_RECEIVED` để tiếp tục nhận hàng lần sau).
     - `cancel`: Hủy phần thiếu (Đóng dòng này, không nhận thêm).
   - Tự động suy ra trạng thái đơn PO sau khi duyệt: Nếu tất cả dòng đã đủ hoặc các phần thiếu đều chọn `cancel` -> Trạng thái PO tự động chuyển thành `COMPLETED`; nếu còn dòng thiếu chọn `backorder` -> PO là `PARTIALLY_RECEIVED`.
3. Thiếu tính toán phân bổ chi phí Landed Cost (chi phí vận chuyển) vào từng ĐVT và tự động tính **Giá vốn mới (Landed Unit Cost)** cũng như Margin % theo giá bán lẻ niêm yết.
4. Thiếu xác nhận các hành động tự động sau khi duyệt:
   - Tự động ghi nhận Sổ nợ / Công nợ phải trả Nhà cung cấp (AP - Accounts Payable) theo điều khoản thanh toán (Credit Term).
   - Đặt lệnh in tem giá / mã vạch dán kệ theo tổng số lượng sản phẩm nhập.
   - Quản lý tệp đính kèm hóa đơn VAT / biên bản giao nhận hàng hóa.

## Mục tiêu
1. Xây dựng màn hình **Chi tiết phiếu nhập kho & Xác nhận tổng quan (Goods Receipt Note Detail & Confirmation)** theo chuẩn prototype `grn_confirm.html` và đồng bộ với hệ thống giao diện MT-GRMS hiện hành.
2. Hỗ trợ hiển thị 2 chế độ:
   - **Chế độ Xác nhận duyệt (Confirmation Mode)**: Dành cho phiếu DRAFT đang trong bước chốt duyệt, cho phép thủ kho/chủ cửa hàng điều chỉnh hướng xử lý lượng thiếu của PO (`backorder` vs `cancel`), chọn tạo công nợ AP, chọn in tem dán kệ, và bấm nút "HOÀN TẤT & DUYỆT NHẬP KHO".
   - **Chế độ Xem chi tiết (Detail / View Mode)**: Dành cho phiếu đã CONFIRMED, hiển thị trạng thái đã duyệt, thông tin lô FEFO đã nhập, liên kết chứng từ hóa đơn, và các nút chức năng "In phiếu nhập kho", "In tem mã vạch", "Quay lại danh sách".
3. Tích hợp bảng FEFO Management: hiển thị rõ Mã Lô (Batch No), Hạn sử dụng (EXP Date), Phí VC/ĐVT phân bổ, Giá vốn mới (Landed Unit Cost), Giá bán niêm yết, Margin %, và Ghi chú thực tế (thiếu, cân thực tế, hàng khuyến mãi / free goods).
4. Đồng bộ bảng Cập nhật trạng thái đơn PO (`PO Status Update`): Cho phép chọn `backorder` hoặc `cancel` với từng dòng thiếu, tự động preview trạng thái PO cuối cùng (`PARTIALLY_RECEIVED` vs `COMPLETED`).
5. Liên kết điều hướng từ `grn-list` (bấm vào mã GRN hoặc icon xem chi tiết) và `grn-form` (khi bấm Hoàn tất kiểm đếm chuyển sang xác nhận tổng quan).

## Phạm vi
### In scope:
- Màn hình React 19 / TypeScript `GoodsReceiptDetailPage.tsx` dùng chung layout `StoreOwnerLayout`.
- Hỗ trợ routing:
  - `/store-owner/goods-receipts/:id`
  - `/employee/goods-receipts/:id`
  - `/store-owner/goods-receipts/:id/confirm`
- Box thông tin chung: Mã GRN, Chi nhánh, Nhà cung cấp, Mã PO gốc, Người duyệt/kiểm đếm, Trạng thái (`Draft -> CONFIRMED` hoặc `CONFIRMED`), Tổng tiền hàng, Phí VC (Landed Cost), Giảm giá, VAT, Tổng công nợ AP.
- Bảng 1: Tồn kho sẽ cộng & Quản lý lô FEFO (Stock & FEFO Table) với tính toán Giá vốn mới và Margin %.
- Bảng 2: Cập nhật trạng thái PO (PO Update & Remaining Handling) với radio `backorder` / `cancel` và preview dropdown PO Status.
- Khung tùy chọn sau hoàn tất: Checkbox tạo công nợ AP, Checkbox in tem giá/mã vạch (tự tính tổng số tem), đính kèm ảnh hóa đơn giao hàng.
- Action bar chân trang: Nút "Quay lại sửa", "HOÀN TẤT & DUYỆT NHẬP KHO", và thông báo kết quả thành công với các liên kết nhanh (Xem quản lý hạn sử dụng FEFO, Quay về danh sách GRN).
- Phân quyền vai trò: Chủ cửa hàng (toàn chuỗi) vs Nhân viên (kho chi nhánh).

### Out of scope:
- Gọi REST API backend thật (dùng mock store reactive / local state tương tự các màn khác của frontend).
- Trực tiếp kết nối phần cứng máy in nhiệt qua driver USB (giả lập preview in tem và in phiếu).

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner)**: Rà soát tổng giá trị nhập hàng, công nợ AP phát sinh, kiểm tra margin và duyệt nhập kho toàn bộ các chi nhánh.
- **Thủ kho / Nhân viên nhận hàng (Warehouse / Branch Employee)**: Thực hiện chốt số lượng thực nhận, chọn phương án cho phần hàng thiếu (giao bù hay hủy), in tem dán kệ hàng ngay tại chi nhánh.

## Tiêu chí thành công
- [ ] Giao diện tái hiện đầy đủ và nâng cấp trực quan từ prototype `grn_confirm.html`, ăn khớp với Design System hiện tại của MT-GRMS (màu sắc, component card, table, typography).
- [ ] Khi có mặt hàng thiếu (Ordered > Received), hiển thị bảng xử lý lượng thiếu với radio `backorder` và `cancel`; thay đổi lựa chọn sẽ tự động cập nhật preview trạng thái PO (`PARTIALLY_RECEIVED` vs `COMPLETED`).
- [ ] Tính toán đúng Giá vốn mới = `(Tiền hàng dòng + Phí VC phân bổ) / SL thực nhận` và Margin % = `(Giá bán - Giá vốn mới) / Giá bán * 100%`.
- [ ] Tích hợp mượt mà với danh sách `GoodsReceiptListPage`: nhấn vào mã GRN hoặc nút "Xem chi tiết" / "Duyệt phiếu" mở ra màn hình detail này.
- [ ] `npm run build` (`tsc -b && vite build`) hoàn toàn không có lỗi cú pháp hoặc TypeScript.
