# Proposal: grn-list

## Vấn đề
- Hiện tại nhân viên chi nhánh (Role Employee / Thủ kho) chưa có màn hình tập trung để theo dõi lịch nhận hàng dự kiến từ nhà cung cấp trong ngày hôm nay của chi nhánh mình, dẫn đến việc bỏ sót đơn giao, chậm trễ trong công tác kiểm đếm và đối soát hàng hóa.
- Chủ cửa hàng (Role Store Owner) không có cái nhìn tổng quan trên toàn chuỗi về tình hình nhập kho ở các chi nhánh, khó kiểm soát các đơn bị lệch số lượng (Mismatch) hoặc các phiếu đang treo ở trạng thái nháp (Draft) kéo dài.

## Mục tiêu
- Xây dựng giao diện màn hình Danh sách phiếu nhập kho (GRN) & Lịch nhận hàng hôm nay (UI-05-03) đáp ứng đầy đủ yêu cầu nghiệp vụ, thẩm mỹ enterprise ERP hiện đại của hệ thống MT-GRMS.
- Hỗ trợ phân quyền rõ ràng theo 2 vai trò:
  - **Employee (Nhân viên / Thủ kho)**: Xem danh sách phiếu nhập kho và lịch nhận hàng của chi nhánh được phân công; thực hiện nhanh thao tác "Nhập kho ngay", "Kiểm đếm", "Duyệt nhập kho".
  - **Store Owner (Chủ chuỗi cửa hàng)**: Xem toàn bộ phiếu nhập kho trên tất cả các chi nhánh, lọc đa chiều theo chi nhánh, nhà cung cấp, trạng thái, thời gian; nắm bắt tức thì các ca lệch hàng hoặc chậm trễ.

## Phạm vi
- **In scope**:
  - Giao diện danh sách GRN & Lịch nhận hàng chuẩn MT-GRMS (UI tokens, responsive, dark/light theme ready).
  - Quick View Tabs: Tất cả, Lịch hôm nay (Today delivery), Chờ xác nhận (Draft), Lệch số lượng / Hàng lỗi (Mismatch).
  - Thanh bộ lọc hợp nhất (`po-unified-bar`): Tìm kiếm từ khóa, Chi nhánh, Nhà cung cấp, Trạng thái, Khoảng ngày (từ ngày - đến ngày), Nút Tìm kiếm & Đặt lại.
  - Phân quyền theo vai trò (Employee: cố định theo branch; Store Owner: tùy chọn tất cả hoặc từng branch).
  - Bảng dữ liệu chi tiết 11 cột chuẩn prototype `grn_list.html`, sticky header, sort, badge trạng thái ngữ cảnh, phân trang footer (10, 20, 30, 50 dòng).
  - Slide-over Drawer xem nhanh chi tiết phiếu GRN (danh sách SKU, số lượng theo PO, số lượng thực nhận, chênh lệch, đơn giá, thành tiền, lô batch và hạn sử dụng).
  - Mock data phong phú cho đầy đủ các trạng thái và kịch bản (TODAY, DRAFT, CONFIRMED, MISMATCH, CANCELED).
  - Đăng ký routing phù hợp cho cả role Store Owner (`/store-owner/inventory/receipts`) và Employee (`/employee/inventory/receipts` hoặc tương ứng).
- **Out of scope**:
  - Form tạo phiếu GRN nhập chi tiết từng SKU từ đầu (`grn_form.html` - thuộc change tiếp theo).
  - Nghiệp vụ in hóa đơn vật lý qua máy in POS bằng phần cứng thật (chỉ hiển thị preview/toast demo).

## Người dùng liên quan
- **Store Owner (Chủ cửa hàng)**: Cần quản lý vĩ mô, theo dõi toàn bộ các đợt giao nhận của mọi chi nhánh trong chuỗi.
- **Employee / Warehouse Staff (Thủ kho / Nhân viên chi nhánh)**: Cần theo dõi công việc nhận hàng hàng ngày của chi nhánh mình, thực hiện kiểm đếm và nhận hàng trực tiếp.

## Tiêu chí thành công
- [ ] Giao diện tái hiện đầy đủ và nâng cấp thẩm mỹ từ prototype `design_ui/grn_list.html` theo hệ thống Design System của MT-GRMS (B2B SaaS ERP).
- [ ] Nhân viên chi nhánh chỉ thấy và thao tác trên phiếu nhập của chi nhánh mình; Chủ cửa hàng có thể chọn xem tất cả hoặc lọc từng chi nhánh.
- [ ] Bộ lọc đa tiêu chí (keyword, branch, supplier, status, date range) và Quick Tabs hoạt động mượt mà, phản hồi ngay lập tức.
- [ ] Bảng dữ liệu hiển thị đúng 11 cột, format tiền tệ VNĐ rõ ràng font số monospace `tabular-nums`, badge trạng thái trực quan.
- [ ] Drawer chi tiết trượt êm ái, hiển thị đối soát số lượng đặt vs thực nhận, có ghi nhận tình trạng lệch hàng (Mismatch).
- [ ] Biên dịch `npm run build` thành công 100% với 0 lỗi TypeScript hoặc lint.
