# Exploration: grn-form

## 1. Hiện trạng code liên quan
- **Màn hình danh sách (`src/features/goods-receipt/pages/GoodsReceiptListPage.tsx`)**: Đã có nút `+ Nhập kho từ PO`, các action `Nhập kho ngay` (với phiếu `TODAY`), `Sửa` (với phiếu `DRAFT`), nhưng hiện tại các nút này chỉ hiển thị toast thông báo, chưa điều hướng sang trang form cụ thể.
- **Dữ liệu & Types (`src/features/goods-receipt/types/grn.types.ts`)**: Đã có `GoodsReceiptListItem`, `GrnItemDetail`, `GrnStatus` (`TODAY`, `DRAFT`, `CONFIRMED`, `MISMATCH`, `CANCELED`). Cần mở rộng thêm DTO/Form state cho các trường tài chính: `landedCost`, `discountAmount`, `vatPercent`, `invoiceNo`, `paymentTerm`, `paymentMethod`.
- **Dữ liệu mock PO (`src/features/purchase-order/lib/mockData.ts`)**: Đã có sẵn danh sách các đơn PO trạng thái `CONFIRMED` có thể liên kết để tải dữ liệu mặt hàng đặt vào form nhập kho.
- **Prototype tham khảo (`design_ui/grn_form.html`)**: Cung cấp cấu trúc bố cục chuẩn gồm 4 khối chính: Header thông tin phiếu, Bảng danh sách hàng nhập thực tế, Khối chi phí & tổng tiền, và Thanh nút hành động cố định chân trang.

## 2. Assumptions (Giả định)
1. 100% phiếu nhập kho đều có nguồn gốc từ Đơn mua hàng PO (hệ thống không cho phép nhập trôi nổi không rõ nguồn gốc).
2. Khi mở form với tham số `?poCode=PO-XXX` hoặc người dùng chọn mã PO từ dropdown, hệ thống tự động điền Nhà cung cấp, Chi nhánh nhận và danh sách mặt hàng đặt tương ứng.
3. Số lượng thực nhận ban đầu mặc định bằng số lượng đặt trong PO (để hỗ trợ kiểm nhanh), thủ kho có thể sửa lại theo số lượng đếm thực tế trên thùng/kiện.
4. Cảnh báo FEFO tự động kích hoạt khi `(HSD - Ngày nhập) < 30 ngày` để nhân viên lưu ý hàng cận hạn sử dụng.
5. Khi bấm **Lưu nháp (Draft)**: Phiếu được lưu lại với trạng thái `DRAFT` để kiểm đếm tiếp sau, chưa cộng tồn kho.
6. Khi bấm **Hoàn tất nhập kho (Confirmed)**: Phiếu chuyển sang `CONFIRMED`, nếu có lệch số lượng thì hệ thống tự động gắn cờ `MISMATCH` và sinh biên bản chênh lệch.

## 3. Non-Goals
- Không tích hợp máy quét mã vạch chuyên dụng phần cứng qua WebHID/Serial (chỉ bắt sự kiện Enter từ input Barcode thông thường).
- Không gửi lệnh in trực tiếp đến máy in tem nhãn nhiệt TSC/Xprinter (chỉ mô phỏng dialog xem trước tem và in tiêu chuẩn trình duyệt).
- Không tích hợp cổng thanh toán trực tuyến (chỉ lưu vết hạn thanh toán và hình thức thanh toán cho kế toán công nợ AP).

## 4. Các phương án kiến trúc & Lựa chọn

### Phương án A: Form một trang duy nhất (Single Page Form - All-in-one Layout) — *ĐƯỢC CHỌN*
- **Cấu trúc**:
  - Khối 1: Header thông tin phiếu (Chi nhánh, Mã GRN, Chọn PO, NCC, Ngày giờ, Hóa đơn NCC, Thanh toán).
  - Khối 2: Bảng hàng hóa kiểm đếm (Barcode search, SKU, Tên, ĐVT, SL đặt, SL thực nhận, Lệch, Lô, HSD, Cảnh báo FEFO, Đơn giá, Thành tiền).
  - Khối 3: Ghi chú nhập kho & Tổng kết chi phí kèm theo (Landed cost, Chiết khấu, VAT, Grand total).
  - Khối 4: Fixed Bottom Bar chứa các nút Hủy, Lưu nháp, Nhập kho & In tem, Hoàn tất nhập kho.
- **Ưu điểm**:
  - Giữ trải nghiệm liền mạch, bám sát prototype `design_ui/grn_form.html`.
  - Phù hợp với thao tác tại kho: nhân viên vừa quét hàng vừa nhìn được tổng quan chi phí và trạng thái đối soát.
  - Tốc độ nhập liệu nhanh nhất, không phải bấm chuyển step.
- **Nhược điểm**: Trang dài khi đơn PO có nhiều mặt hàng (giải quyết bằng sticky header và table scroll).

### Phương án B: Form dạng Wizard đa bước (Multi-step Wizard)
- **Cấu trúc**: Bước 1 (Chọn PO & Thông tin chung) -> Bước 2 (Kiểm đếm hàng & Gán lô/HSD) -> Bước 3 (Chi phí phụ & Xác nhận).
- **Ưu điểm**: Chia nhỏ thông tin, gọn màn hình.
- **Nhược điểm**: Bất tiện cho thủ kho vì khi kiểm hàng xe tải thường cần sửa lại thông tin hóa đơn hoặc xem tổng tiền ngay; thao tác chuyển bước gây trễ.

### Quyết định lựa chọn:
Chọn **Phương án A (Single Page Form)** vì tối ưu tốc độ tác nghiệp thực tế tại điểm bán/kho hàng, đồng thời thừa hưởng trọn vẹn phong cách thiết kế UI đã được duyệt trên prototype `grn_form.html`.

## 5. Rủi ro & Cách giảm thiểu
1. **Rủi ro người dùng quên nhập Lô/HSD cho mặt hàng thực phẩm**:
   - *Cách giảm thiểu*: Kiểm tra validation trước khi bấm "Hoàn tất nhập kho". Nếu dòng hàng chưa có Mã Lô hoặc HSD thì hiển thị cảnh báo đỏ và focus vào ô tương ứng.
2. **Rủi ro lệch số lượng lớn (thất thoát/thiếu hàng) nhưng nhân viên vô tình bấm hoàn tất**:
   - *Cách giảm thiểu*: Nếu `Difference Qty != 0`, nút Hoàn tất sẽ hiển thị modal xác nhận lập biên bản chênh lệch số lượng trước khi chuyển trạng thái sang `MISMATCH`.
3. **Rủi ro nhập sai chi phí vận chuyển hoặc VAT làm sai lệch tổng tiền**:
   - *Cách giảm thiểu*: Tính toán tự động theo thời gian thực (reactive formula) với hiển thị rõ ràng từng bước cộng trừ.
