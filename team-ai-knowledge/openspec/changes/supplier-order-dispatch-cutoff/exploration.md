# EXP-2026-10-13-PO-DISPATCH: Khám phá Trung tâm Chốt Đơn & Tách PO theo Nhà Cung Cấp (Supplier Order Dispatch & Cutoff Hub)

## 1. Problem Statement
Sau khi người dùng (Store Owner hoặc Quản lý chi nhánh) lên số lượng đặt hàng thành công trên bảng lưới ma trận (Order Grid/Matrix), dữ liệu cần được phân tách và gom nhóm theo từng Nhà cung cấp (NCC) để chuẩn bị phát hành Đơn mua hàng (Purchase Order - PO) chính thức.
Tuy nhiên, trong chuỗi bán lẻ tạp hóa:
- Mỗi NCC có một chính sách **Giờ chốt đơn (Cutoff Time)** hoàn toàn khác nhau: hàng tươi sống (thịt, rau củ) thường cutoff hàng ngày vào buổi chiều (ví dụ 15:00 hôm nay) để kịp sơ chế và giao vào 06:00 sáng mai; trong khi hàng khô, gia vị, đông lạnh hoặc bao bì chỉ nhận đơn và cutoff 1–2 lần/tuần (ví dụ Thứ 3, Thứ 6 lúc 11:00).
- Mỗi NCC cũng áp dụng điều kiện **Giá trị đơn hàng tối thiểu (Min Order Value - MOV)** (ví dụ tối thiểu 1.000.000 đ/đơn để được freeship).
- Nếu chỉ hiển thị một danh sách phẳng không có phân cấp mức độ khẩn cấp (Urgency) và đếm ngược thời gian (Countdown Timer), người quản lý rất dễ bị lỡ giờ cutoff của các NCC gấp hôm nay, dẫn đến thiếu hụt hàng hóa nghiêm trọng vào ngày hôm sau.

Do đó, cần có một trung tâm điều phối chuyên biệt: **Supplier Order Dispatch & Cutoff Hub** để ưu tiên xử lý các đơn hàng theo mức độ khẩn cấp, hỗ trợ kiểm tra điều kiện MOV, cho phép tinh chỉnh số lượng trực tiếp và phát hành PO độc lập cho từng NCC.

## 2. Context & Background
- Màn hình khởi nguồn: Bảng ma trận đặt hàng `/store-owner/purchase-orders/create-matrix`.
- Dữ liệu hiện có trong hệ thống (`src/features/purchase-order/lib/mockData.ts` & `po.types.ts`):
  - Danh sách NCC: `MOCK_PO_SUPPLIERS` (có cấu hình `leadDays`, `activeDeliveryDays`, `holidays`).
  - Danh mục sản phẩm: `MOCK_MATRIX_PRODUCTS` (có giá, đơn vị, MOQ, nhà cung cấp).
  - Chi nhánh: `MOCK_BRANCHES`.
- Hiện tại chưa có màn hình tập trung cho quy trình Cutoff & Dispatch theo từng NCC trước khi phát hành PO.

## 3. Constraints
- **UI/UX Consistency**: Tuân thủ tuyệt đối quy chuẩn `RULE_UI_DESIGN_SYSTEM.md` (bảng số liệu căn phải, compact enterprise layout, button rõ ràng, không clipping, phân cấp màu sắc chuẩn: Đỏ khẩn cấp, Vàng cảnh báo, Xanh an toàn).
- **Tính toán thời gian thực**: Cần có cơ chế đếm ngược (Countdown) hoặc tính khoảng thời gian còn lại đến giờ cutoff chính xác so với thời điểm hiện tại (hoặc mốc mock date `BASE_TODAY = '2026-09-26' / '2026-10-14'`).
- **Tương thích dữ liệu**: Dễ dàng liên kết và chuyển đổi số liệu từ Order Matrix sang Dispatch Hub.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi NCC có giờ Cutoff cố định (ví dụ 15:00 hàng ngày đối với thực phẩm tươi sống; 11:00 Thứ 4 đối với hàng khô; 17:00 Thứ 6 đối với bao bì/vật tư).
- **[ASSUMPTION-02]**: Mỗi NCC có định mức MOV (Min Order Value, ví dụ: 1.000.000 đ đến 5.000.000 đ). Nếu tổng tiền đơn nháp < MOV, hệ thống cảnh báo và yêu cầu xác nhận hoặc bổ sung.
- **[ASSUMPTION-03]**: Trong phạm vi frontend mock, việc "Chốt & Gửi PO" sẽ tạo một bản ghi PO độc lập, hiển thị modal tóm tắt và cập nhật trạng thái thẻ NCC sang "Đã phát hành PO".

## 5. Scope & Non-Goals
### In Scope
- Xây dựng trang `SupplierOrderDispatchHubPage.tsx` tại route `/store-owner/purchase-orders/dispatch-hub` (và `/store-owner/purchase-orders/cutoff-hub`).
- **Khu vực 1 - Top Urgency Bar**:
  - Thống kê tổng số NCC nháp, tổng số mặt hàng, tổng tiền dự kiến.
  - Phân loại trực quan: 🔴 Sắp hết hạn (< 2 giờ), 🟡 Trong hôm nay, ⚪ Các ngày sau trong tuần.
  - Nút hành động nhanh: "Chốt nhanh các đơn hết hạn hôm nay".
- **Khu vực 2 - Filter & Grouping Toolbar**:
  - Tabs lọc nhanh: Tất cả (8) | 🔴 Cần chốt gấp | Hôm nay | Đợt tới | Đã chốt PO.
  - Tìm kiếm NCC theo tên, mã hoặc nhóm hàng.
- **Khu vực 3 - Supplier Order Accordion Cards (2 tầng)**:
  - Tầng 1 (Header/Summary): Tên NCC, Tag ngành hàng, Cutoff time & Countdown timer, Ngày giao dự kiến, Số SKU, Tổng SL, Tổng tiền, Trạng thái MOV, nút "Chốt & Tạo PO", nút "Xem chi tiết SKU".
  - Tầng 2 (Expanded Grid): Bảng chi tiết SKU cho phép sửa nhanh số lượng inline, thành tiền tự động tính lại, ghi chú riêng cho NCC.
- **Xử lý Edge Cases**:
  - Tách nhóm hàng ngày vs hàng tuần nếu cùng 1 NCC có cả 2 loại sản phẩm.
  - Cảnh báo quá giờ cutoff (Overdue).
  - Cảnh báo chưa đạt giá trị đơn tối thiểu (MOV).
  - Modal xác nhận phát hành Purchase Order (tóm tắt NCC, ngày giao, phương thức gửi, tổng tiền).
- Liên kết điều hướng trong TopNav và breadcrumb.

### Out of Scope (Non-Goals)
- Không kết nối API gửi email SMTP hoặc Zalo ZNS thật ra ngoài trong change này (mô phỏng xác nhận trên UI).
- Không can thiệp sửa đổi các màn hình quản trị khác ngoài purchase-order.

## 6. So sánh các Phương án Kỹ thuật

### Phương án 1: Bảng dữ liệu phẳng truyền thống (Flat Table)
- **Mô tả**: Liệt kê tất cả NCC và các dòng sản phẩm trong một bảng dữ liệu thông thường với cột cutoff.
- **Ưu điểm**: Đơn giản khi code bảng thông thường.
- **Nhược điểm**: Rất rối mắt khi có hàng chục sản phẩm thuộc nhiều NCC; khó làm nổi bật tính khẩn cấp (Urgency) của thời gian cutoff; không tạo được trải nghiệm điều phối trung tâm như mong đợi của nghiệp vụ nhà hàng/chuỗi siêu thị.

### Phương án 2 (Được chọn): Trung tâm Điều phối dạng Thẻ Accordion 2 tầng phân cấp theo Mức độ khẩn cấp (Urgency-driven Two-Tier Cards)
- **Mô tả**:
  - Chia 3 khu vực rõ ràng: Top Urgency Bar -> Filter Tabs -> Danh sách Thẻ Accordion 2 tầng.
  - Tầng 1 hiển thị thẻ lớn cho từng NCC với huy hiệu màu khẩn cấp (🔴 đỏ, 🟡 vàng, 🟢 xanh) và đồng hồ đếm ngược Cutoff Time.
  - Tầng 2 thu gọn/mở rộng hiển thị bảng SKU với ô input sửa nhanh số lượng inline và tự động re-calculate tổng tiền, kiểm tra lại MOV ngay lập tức.
  - Có modal xác nhận phát hành PO trước khi gửi chính thức.
- **Ưu điểm**:
  - Trải nghiệm người dùng vượt trội, giải quyết đúng nỗi đau "sợ lỡ giờ cutoff" của Store Owner.
  - Rõ ràng, trực quan, hỗ trợ thao tác nhanh (Chốt nhanh toàn bộ đơn hôm nay chỉ với 1 click).
  - Khả năng mở rộng cao khi tích hợp backend sau này.
- **Rủi ro & Cách giảm thiểu**:
  - *Rủi ro*: Tính toán countdown timer có thể gây giật lag nếu re-render liên tục.
  - *Giải pháp*: Cập nhật countdown mỗi 30–60 giây hoặc dùng hook tối ưu `useMemo`/`useEffect` nhẹ nhàng.

## 7. Success Criteria
- [ ] Giao diện thể hiện chuẩn xác 3 khu vực theo wireframe.
- [ ] Countdown timer và màu sắc hiển thị đúng theo khoảng thời gian đến deadline.
- [ ] Cho phép sửa số lượng trực tiếp trong bảng SKU và cập nhật tức thì tổng tiền, trạng thái MOV.
- [ ] Nút chốt đơn mở modal xác nhận và chuyển đổi trạng thái đơn mượt mà.
- [ ] Dự án biên dịch thành công 100% với `npm run build`.
