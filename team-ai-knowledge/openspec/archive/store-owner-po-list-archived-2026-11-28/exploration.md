# EXP-2026-10-14-PO-LIST: Khám phá màn hình Danh sách đơn mua hàng PO (Store Owner PO List)

## 1. Problem Statement (Vấn đề)
Trong hệ thống MT-GRMS, luồng đặt hàng đã có bước tạo đơn theo ma trận chi nhánh (`OrderMatrixPage`), đặt hàng theo chi nhánh (`BranchOrderListPage`) và phân tách chốt PO gửi nhà cung cấp theo khung giờ cutoff (`SupplierOrderDispatchHubPage`). Tuy nhiên, Store Owner đang thiếu một màn hình trung tâm để:
- Theo dõi toàn bộ danh sách các Purchase Order (PO) đã được tạo và phát hành từ tất cả các chi nhánh đến các NCC.
- Tra cứu tức thời trạng thái thực tế của từng đơn PO (`SENT` - Đã gửi NCC, `CONFIRMED` - NCC đã chốt nhận đơn, `PARTIALLY_RECEIVED` - Đã nhận hàng một phần, `RECEIVED` - Đã nhập kho hoàn tất, `CANCELLED` - Đã hủy).
- Lọc đa chiều: theo Chi nhánh nhận, theo Nhà cung cấp, theo Trạng thái PO, theo Khoảng ngày (Từ ngày - Đến ngày) và Tìm kiếm từ khóa (Keyword search).
- Xem nhanh chi tiết đơn hàng (các mặt hàng, số lượng đặt, đơn giá, thành tiền) ngay trong giao diện mà không bị mất dấu bộ lọc hiện tại.

## 2. Context & Background (Hiện trạng & Bối cảnh)
- **Tài liệu prototype tham chiếu:** Tệp thiết kế HTML prototype `design_ui/po_list.html` (màn hình UI-05-02a).
- **Hiện trạng code Frontend (`MT_GRMS_FRONTEND`):**
  - Đã có module `src/features/purchase-order` với các types cơ bản, mock data (`MOCK_BRANCHES`, `MOCK_BRANCH_LIST`, `MOCK_DISPATCH_SUPPLIERS`).
  - Đã có stylesheet `purchase-order.css` chứa các class chuẩn Enterprise UI (`po-matrix-container`, `po-unified-bar`, `po-ctrl-*`, `po-branch-container`, `po-branch-table`, table pagination styles).
  - Định dạng bảng và thanh phân trang (paging footer) đã được chuẩn hóa tại `BranchOrderTable.tsx` và `SupplierDispatchTable.tsx`.
- **Vai trò người dùng:** Store Owner (Chủ chuỗi cửa hàng / Giám đốc chuỗi bán lẻ).

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
- Phải tuân thủ triệt để UI/UX Design System của MT-GRMS: font chữ `Be Vietnam Pro` & monospace `JetBrains Mono` / `Roboto Mono` cho mã PO và số tiền; màu sắc semantic (`--blue-primary: #0f766e`, green `#059669`, amber `#d97706`, red `#dc2626`).
- Hiển thị tiền tệ định dạng tiếng Việt (`vi-VN`, ví dụ `3.450.000 đ`), căn phải cho cột số liệu, tabular-nums.
- Hỗ trợ phân trang mượt mà (chọn `10, 20, 30, 50` bản ghi/trang).
- Không phá vỡ hay can thiệp vào các màn hình PO khác đang hoạt động ổn định.

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi PO sinh ra gắn liền với một Chi nhánh nhận hàng cụ thể và một Nhà cung cấp cụ thể.
- **[ASSUMPTION-02]**: Trạng thái PO tuân theo vòng đời chuẩn: `SENT` → `CONFIRMED` → `PARTIALLY_RECEIVED` → `RECEIVED` (hoặc `CANCELLED` ở các bước đầu).
- **[ASSUMPTION-03]**: Trong giai đoạn hiện tại, dữ liệu được cấp từ Mock Data phong phú (`mockPoListData.ts`) với đầy đủ các trạng thái, sẵn sàng chuyển đổi sang REST API của backend `.NET 8` khi tích hợp.

## 5. Scope & Non-Goals
### In Scope
- Màn hình danh sách PO tại route `/store-owner/purchase-orders/list` (và redirect/alias từ menu quản lý PO).
- Page Header tinh gọn: Tiêu đề "Danh sách đơn mua hàng (PO)" + nút liên kết nghiệp vụ ("Chốt đơn với nhà cung cấp", "Đặt hàng theo chi nhánh").
- Unified Filter Bar:
  - Select box Chi nhánh nhận (`BR-01, BR-02, BR-03, DC1...`)
  - Select box Nhà cung cấp (`TươiSạch, SnackVN, Vissan, CP Foods...`)
  - Select box Trạng thái PO (`Tất cả, SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED`)
  - Date inputs: Từ ngày (`dateFrom`) - Đến ngày (`dateTo`)
  - Text input tìm kiếm từ khóa linh hoạt (`keyword`)
  - Cụm nút `[Tìm kiếm]` và `[Đặt lại]` bộ lọc.
- Enterprise Data Table chuẩn 9 cột:
  1. Mã PO (Link mở modal chi tiết)
  2. Nhà cung cấp (Tên + Mã badge)
  3. Chi nhánh nhận (Tên + Mã chi nhánh)
  4. Người tạo đơn / Nguồn tạo (NV nhập Grid / Store Owner)
  5. Ngày sửa cuối (Timestamp DD/MM/YYYY HH:mm)
  6. Dự kiến giao hàng (Ngày giao)
  7. Số mặt hàng (Số lượng SKU, căn giữa)
  8. Tổng tiền (định dạng tiền tệ, căn phải)
  9. Trạng thái (Badge màu rõ ràng)
  10. Thao tác (`Xem chi tiết`, `Sửa` nếu hợp lệ)
- Pagination footer chuẩn MT-GRMS: Hiển thị dải bản ghi + chọn bản ghi/trang + nút trước/sau.
- Modal / Slide Drawer xem chi tiết PO hiển thị danh sách mặt hàng, số lượng đặt, đơn giá, thành tiền và ghi chú đơn hàng.

### Out of Scope (Non-Goals)
- Không can thiệp vào nghiệp vụ scan mã vạch hay kiểm đếm hàng thực tế tại cầu bốc hàng (thuộc phân hệ Nhận hàng - Inbound Receiving).
- Không thực hiện thanh toán online hay hạch toán vào sổ quỹ kế toán (thuộc phân hệ Finance).

## 6. Phương án Kỹ thuật & Đánh giá

### Phương án 1: Bảng dữ liệu chuẩn Enterprise + Slide-over Drawer xem chi tiết (Khuyên dùng)
- **Mô tả:** Sử dụng bảng dữ liệu phân trang đồng bộ với layout `BranchOrderTable.tsx`, kết hợp Drawer trượt từ bên phải hoặc Modal xem chi tiết PO ngay trên màn hình.
- **Ưu điểm:**
  - Cực kỳ tối ưu không gian màn hình, đồng bộ hoàn hảo với các màn hình hiện có của MT-GRMS (`BranchOrderListPage`, `SupplierOrderDispatchHubPage`).
  - Store Owner có thể xem nhanh nội dung chi tiết của nhiều đơn PO liên tiếp mà không bị gián đoạn hay phải tải lại trang.
  - Phù hợp nhất với prototype `po_list.html` nhưng được nâng tầm trải nghiệm theo chuẩn SaaS ERP hiện đại.
- **Nhược điểm:** Cần xây dựng component Drawer/Modal chi tiết đồng bộ dữ liệu.

### Phương án 2: Chuyển hướng sang trang chi tiết riêng biệt (`/purchase-orders/:id`)
- **Mô tả:** Khi click xem chi tiết, điều hướng sang một page riêng biệt hoàn toàn.
- **Ưu điểm:** Tách biệt rõ ràng từng page.
- **Nhược điểm:**
  - Gây gián đoạn trải nghiệm người dùng, mất bộ lọc và vị trí phân trang khi bấm nút Quay lại (Back).
  - Tốn thao tác chuyển trang liên tục khi Store Owner cần kiểm tra lướt qua 5-10 đơn PO trong ca làm việc.

👉 **Lựa chọn:** **Phương án 1** (Bảng dữ liệu Enterprise + Slide-over Drawer / Modal chi tiết).

## 7. Rủi ro & Cách giảm thiểu
- **Rủi ro:** Số lượng đơn PO trong thực tế lớn, có thể gây lag nếu lọc client-side.
  - *Cách giảm thiểu:* Cấu trúc state và helper lọc được tối ưu bằng `useMemo`, chuẩn bị sẵn cấu trúc phân trang `pageIndex` / `pageSize` tương thích 100% với phân trang server-side của API `.NET 8`.
- **Rủi ro:** Trạng thái đơn đa dạng dễ gây nhầm lẫn thị giác.
  - *Cách giảm thiểu:* Định nghĩa palette màu ngữ nghĩa chuẩn: SENT (hổ phách/cam nhạt), CONFIRMED (xanh lá), PARTIALLY_RECEIVED (chàm/indigo), RECEIVED (xanh dương sáng), CANCELLED (đỏ pastel).

## 8. Success Criteria (Tiêu chí thành công)
- Giao diện khớp hoàn toàn với nghiệp vụ prototype `po_list.html`, kế thừa các tokens và layout của MT-GRMS.
- Bảng lọc tức thì theo 5 tiêu chí: Chi nhánh, NCC, Trạng thái, Khoảng ngày, Từ khóa.
- Xem chi tiết PO mượt mà, đầy đủ thông tin mặt hàng.
- Build kiểm tra TypeScript không có lỗi.
