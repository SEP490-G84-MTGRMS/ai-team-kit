# Proposal: batch-list (Quản lý Lô Sản Phẩm & Hạn Sử Dụng - FEFO Expiry Management)

## Vấn đề
- MT-GRMS là hệ thống quản lý chuỗi bán lẻ siêu thị mini và tạp hóa đa chi nhánh. Các mặt hàng tiêu dùng nhanh (FMCG), thực phẩm tươi sống, sữa, đồ lạnh có hạn sử dụng (Shelf Life) biến động liên tục theo từng đợt nhập hàng.
- Hiện tại hệ thống đã hoàn thiện màn hình **Danh sách phiếu nhập kho (Goods Receipts)** tại `http://localhost:5173/store-owner/goods-receipts` và Form lập phiếu nhập (`grn-form`), nơi nhân viên ghi nhận số lượng thực nhận kèm Mã lô (Batch Code) và Hạn sử dụng (Expiry Date) từ nhà cung cấp.
- Tuy nhiên, sau khi duyệt nhập kho (GRN CONFIRMED), hàng hóa vào tồn kho nhưng hệ thống **chưa có màn hình tập trung chuyên biệt để theo dõi, quản trị vòng đời của từng Lô hàng (Batch/Lot) theo nguyên lý FEFO (First Expired, First Out)**.
- Hậu quả thực tế:
  - Nhân viên cửa hàng bán hàng theo thói quen tiện tay lấy hàng mới, dẫn đến lô cũ bị tồn đọng và cận date.
  - Chủ chuỗi cửa hàng không nắm được lượng hàng sắp hết hạn trên từng chi nhánh để kịp thời kích cầu, xả hàng hoặc trả nhà cung cấp.
  - Tỷ lệ hàng quá hạn phải tiêu hủy (Write-off / Damaged Goods) tăng cao, gây thất thoát chi phí lớn.

## Mục tiêu
- Xây dựng màn hình **Quản lý Lô & Hạn sử dụng (Batch & Expiry Management - FE-02 / UI-02-01)** đáp ứng đầy đủ yêu cầu nghiệp vụ và thẩm mỹ Enterprise B2B SaaS hiện đại của MT-GRMS dựa trên prototype `batch_list.html`.
- Kết nối chặt chẽ dòng chảy dữ liệu với phân hệ **Goods Receipts (FE-05)**:
  - Dữ liệu lô sinh ra từ các phiếu nhập hàng GRN đã xác nhận (Mã lô, SKU, Ngày sản xuất, Hạn sử dụng, Chi nhánh, Nhà cung cấp, Giá vốn nhập).
  - Cho phép người dùng chuyển đổi mượt mà giữa Phiếu nhập kho (GRN) và Danh sách lô hàng (Batch List).
- Cung cấp cơ chế cảnh báo sớm và phân tầng rủi ro hạn dùng (4 cấp độ: Expired, Critical, Warning, Normal) đi kèm các hành động xử lý tức thời: Bán FEFO, Áp dụng chiết khấu xả hàng (FEFO Markdown Discount), và Lập phiếu xuất hủy (Write-off).

## Phạm vi (Scope)
- **In scope**:
  - **KPI Summary Cards**: 4 thẻ phân tầng rủi ro hạn dùng trực quan:
    1. ☠️ *Expired (≤ 0 ngày)*: Đã hết hạn, cần lập tức xuất hủy / tiêu hủy.
    2. 🚨 *Critical (1 - 3 ngày)*: Cực kỳ cận date, nguy cơ thất thoát cao, cần xả gấp.
    3. ⚠️ *Warning (4 - 30 ngày)*: Cận date, đề xuất áp dụng giảm giá khuyến mãi kích cầu (FEFO Discount).
    4. ✅ *Normal (> 30 ngày)*: Vòng đời an toàn, lưu thông bình thường.
  - **Bộ lọc hợp nhất (Unified Filter Bar)**:
    - Lọc theo Chi nhánh (All Branches, BR-01 Main Store, BR-02 Thu Duc Hub...).
    - Lọc theo Trạng thái hạn dùng (All Statuses, Expired, Critical, Warning, Normal).
    - Tìm kiếm từ khóa theo Tên sản phẩm, Mã SKU, Mã lô hàng (Batch Code), Nhà cung cấp.
    - Hỗ trợ tham số URL `?sku=...` và `?batch=...` để liên kết từ màn hình Danh sách sản phẩm và Chi tiết phiếu nhập GRN.
    - Nút Tìm kiếm, Đặt lại bộ lọc (Reset) và In báo cáo kiểm kê hạn dùng (Print Report).
  - **Bảng dữ liệu Lô hàng chi tiết**:
    - Hiển thị đầy đủ các cột nghiệp vụ: `#`, Tên sản phẩm, Mã lô & SKU, Chi nhánh, Nhà cung cấp, Ngày nhập & Hạn sử dụng, Số ngày còn lại (Days Left) định dạng số màu nổi bật, Số lượng tồn khả dụng của lô, Giá vốn nhập kho (VNĐ), Badge trạng thái hạn dùng, Thao tác nhanh (Xem chi tiết lô, Giảm giá FEFO, Xuất hủy).
  - **Slide-over Drawer / Modal xem chi tiết lô (`UI-02-02`)**:
    - Hiển thị thông tin tổng quan, số lượng nhập ban đầu vs số lượng tồn hiện tại, vị trí quầy kệ/kho lưu trữ, phiếu GRN gốc và lịch sử xuất/nhập của lô.
  - **Đăng ký định tuyến & Tích hợp Điều hướng**:
    - Route: `/store-owner/batches` (và alias `/store-owner/expiry`).
    - Menu item trong `AppTopNav.tsx` tại mục **Hàng hóa -> Kho & Hạn dùng (FEFO) -> Quản lý lô & Hạn sử dụng**.
    - Mock data phong phú mô phỏng đầy đủ các kịch bản sản phẩm và tình trạng date.
- **Out of scope**:
  - Giao diện form chi tiết xuất hủy phế phẩm FE-06 (`damaged_goods_form.html` - sẽ liên kết hoặc mở dialog xác nhận demo).
  - Máy in nhiệt chuyên dụng in tem mã vạch vật lý (chỉ hỗ trợ giao diện Print layout chuẩn trình duyệt).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi siêu thị/cửa hàng)**: Giám sát toàn diện tình trạng hạn sử dụng của hàng tồn kho tại mọi chi nhánh, quyết định chính sách chiết khấu xả hàng hoặc xuất hủy định kỳ.
- **Store Manager / Branch Staff (Quản lý cửa hàng / Nhân viên chi nhánh)**: Theo dõi danh sách lô của chi nhánh mình, ưu tiên đưa các lô có HSD ngắn nhất ra trưng bày phía trước quầy kệ theo nguyên tắc FEFO, kiểm tra thực tế hàng cận date.
- **Warehouse Staff / Thủ kho**: Tra cứu vị trí lưu kho của từng lô, đối soát với phiếu nhập kho gốc khi có nghi vấn về chất lượng hàng.

## Tiêu chí thành công
- [ ] Giao diện tái hiện trọn vẹn và nâng cấp thẩm mỹ từ prototype `batch_list.html` theo chuẩn Enterprise Design System của MT-GRMS.
- [ ] Bảng dữ liệu và KPI Summary Cards tính toán tự động `Days Left` và phân loại đúng 4 trạng thái (Expired, Critical, Warning, Normal).
- [ ] Bộ lọc (Chi nhánh, Trạng thái, Tìm kiếm) và URL sync hoạt động tức thời, hỗ trợ deep-link từ các màn hình khác qua query string.
- [ ] Drawer chi tiết hiển thị nguồn gốc lô từ phiếu nhập kho GRN, số lượng tồn và vị trí kho kệ.
- [ ] Biên dịch `npm run build` thành công 100% với 0 lỗi TypeScript hoặc cảnh báo.
