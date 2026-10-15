# Exploration: grn-detail

## 1. Hiện trạng & Bối cảnh
Dự án MT-GRMS đã hoàn thiện:
- Trang danh sách phiếu nhập kho (`grn-list` tại `/store-owner/goods-receipts`).
- Form lập phiếu nhập hàng & kiểm đếm lô FEFO (`grn-form` tại `/store-owner/goods-receipts/create`).

Tuy nhiên, quy trình nhập kho của cửa hàng bán lẻ tạp hóa / mini-mart đòi hỏi một bước chốt duyệt và xem chi tiết phiếu nhập (GRN Detail & Confirmation) dựa trên prototype `grn_confirm.html`:
- Thủ kho và Chủ cửa hàng cần xem lại toàn bộ số lượng thực nhận so với đơn PO gốc.
- Khi hàng giao thiếu, cần quyết định hướng xử lý phần thiếu: yêu cầu NCC giao bù ở đợt giao sau (`backorder`) hay hủy phần thiếu và chốt đơn (`cancel`).
- Cần biết chính xác Giá vốn mới (`Landed Unit Cost`) sau khi cộng phân bổ chi phí vận chuyển (`Landed Cost`) để so sánh với giá bán lẻ và biên lợi nhuận (`Margin %`).
- Cần màn hình chi tiết hoàn chỉnh khi click vào một mã phiếu nhập bất kỳ trên danh sách GRN List hoặc xem lại phiếu đã hoàn tất (`CONFIRMED`).

## 2. Giả định (Assumptions)
- Mọi phiếu nhập đều phát sinh từ Purchase Order (`FROM_PO`).
- Khi `receivedQty < orderedQty`, người dùng phải chọn 1 trong 2 hướng xử lý cho từng dòng thiếu:
  - `backorder`: Nhà cung cấp sẽ giao bù trong đợt sau (PO giữ trạng thái `PARTIALLY_RECEIVED`).
  - `cancel`: Hủy phần thiếu, không nhận thêm (dòng PO được đóng).
- Trạng thái tổng thể của PO sau khi duyệt:
  - Nếu tất cả các dòng đều nhận đủ HOẶC các dòng thiếu đều chọn `cancel` -> Trạng thái PO là `COMPLETED`.
  - Nếu còn ít nhất 1 dòng thiếu chọn `backorder` -> Trạng thái PO là `PARTIALLY_RECEIVED`.
- Phân bổ chi phí vận chuyển (`Landed Cost`):
  - Phí VC phân bổ cho mỗi ĐVT = `Tổng phí VC / Tổng số lượng nhận`.
  - Giá vốn mới (`Landed Unit Cost`) = `Đơn giá mua gốc + Phí VC/ĐVT`.
  - Margin % = `(Giá bán lẻ niêm yết - Giá vốn mới) / Giá bán lẻ niêm yết * 100%`.
- Màn hình hỗ trợ 2 chế độ:
  - `CONFIRMATION`: Dành cho phiếu nháp (`DRAFT`) chuẩn bị duyệt hoàn tất nhập kho.
  - `DETAIL_VIEW`: Dành cho phiếu đã hoàn tất (`CONFIRMED`), khóa các input/radio và hiển thị chứng từ, lịch sử, nút in ấn.

## 3. Non-Goals
- Không tích hợp trực tiếp driver USB máy in công nghiệp (dùng modal in ấn giả lập và browser print preview).
- Không gọi backend API thực tế (sử dụng reactive mock data nhất quán trong `mockGrnData.ts`).

## 4. Khảo sát các phương án kiến trúc
### Phương án 1: Tạo trang độc lập `GoodsReceiptDetailPage.tsx` (Recommended)
- Định tuyến: `/store-owner/goods-receipts/:id` và `/employee/goods-receipts/:id`.
- Tự động nhận diện trạng thái phiếu (DRAFT -> hiển thị chế độ xác nhận duyệt; CONFIRMED -> hiển thị chế độ xem chi tiết).
- **Ưu điểm**:
  - Tuân thủ chuẩn kiến trúc của MT-GRMS (giống `SupplierDetailPage`, `TransferDetailPage`).
  - URL rõ ràng, bookmarkable, có thể mở trực tiếp từ danh sách GRN, thông báo, hoặc sau khi tạo form.
  - Tách bạch logic giữa Form kiểm đếm chi tiết (`grn-form`) và Rà soát chốt duyệt (`grn-detail`).
- **Nhược điểm**: Cần thêm 1 route và 1 page container mới.

### Phương án 2: Tích hợp Confirmation Modal / Step 2 bên trong `GoodsReceiptFormPage.tsx`
- Giữ chung trong `GoodsReceiptFormPage.tsx` dưới dạng wizard 2 bước.
- **Ưu điểm**: Giảm số lượng file page.
- **Nhược điểm**:
  - Khi xem lại phiếu cũ từ danh sách `/goods-receipts/:id`, file form sẽ phải chứa cả logic xem chi tiết, logic kiểm đếm, logic duyệt gây phình to component (>1000 dòng).
  - Khó phân tách quyền giữa nhân viên chỉ xem chi tiết và thủ kho có quyền duyệt.

### Quyết định lựa chọn:
**Chọn Phương án 1**. Xây dựng `GoodsReceiptDetailPage.tsx` độc lập, chuyên trách cho nghiệp vụ Chi tiết & Xác nhận duyệt, kết hợp với các sub-component tái sử dụng sạch sẽ.

## 5. Rủi ro & Giải pháp
1. **Rủi ro chia cho 0 khi tính Landed Cost / Margin**:
   - Nếu `receivedQty === 0` hoặc `retailPrice === 0`: fallback hiển thị `0đ` hoặc `-` an toàn.
2. **Rủi ro người dùng không biết đơn PO sẽ chuyển sang trạng thái gì**:
   - Tự động tính và hiển thị ngay preview `Trạng thái PO sau khi duyệt: PARTIALLY_RECEIVED / COMPLETED` trong hộp nổi bật.
