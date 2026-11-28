# Exploration: grn-list

## 1. Hiện trạng Code & Bối cảnh
- **Hệ thống Design System MT-GRMS**:
  - Bảng màu B2B Enterprise ERP với CSS variables (`--blue-primary`, `--bg-main`, `--border-color`, `--text-main`, `--text-muted`).
  - Phong cách thanh lọc hợp nhất `po-unified-bar` đã được chứng minh hiệu quả trong các màn hình `OrderMatrixPage`, `BranchOrderListPage`, `SupplierOrderDispatchHubPage`, `StoreOwnerPurchaseOrderListPage`.
- **Prototype `design_ui/grn_list.html` (UI-05-03)**:
  - Cung cấp layout quản lý danh sách phiếu nhập kho GRN và lịch nhận hàng hôm nay.
  - Các trạng thái nghiệp vụ cốt lõi:
    - `TODAY`: Lịch nhận hàng hôm nay (chờ xe giao đến).
    - `DRAFT`: Phiếu nháp (thủ kho đang kiểm đếm hàng).
    - `CONFIRMED`: Đã nhập kho thành công (hàng đã vào kho, cập nhật tồn lô FEFO).
    - `MISMATCH`: Lệch số lượng / Hàng lỗi (số giao thực tế khác PO, đã lập biên bản đối soát).
    - `CANCELED`: Phiếu đã hủy.
  - Quick View Tabs: Lọc nhanh *Tất cả*, *Lịch hôm nay*, *Chờ xác nhận*, *Lệch số lượng*.
  - Bảng 11 cột thông tin, phân trang và các nút hành động ngữ cảnh (Nhập kho ngay, Duyệt nhập kho, Xử lý lệch, In phiếu).

## 2. Assumptions (Giả định)
- **Hệ tiền tệ & Thời gian**: Định dạng tiền tệ VNĐ `Intl.NumberFormat('vi-VN')` với font monospace `tabular-nums`. Ngày giờ hiển thị theo giờ Việt Nam `DD/MM/YYYY HH:mm`.
- **Phân quyền người dùng (RBAC)**:
  - Role `Store Owner`: Quyền Tenant-Wide Scope, xem tất cả chi nhánh (`BR-01`, `BR-02`, `DC-01`,...) và được chọn lọc từng chi nhánh hoặc chọn tất cả.
  - Role `Employee` (Thủ kho / NV Chi nhánh): Quyền Branch-Specific Scope, bị giới hạn chỉ xem và thao tác trên phiếu nhập của chi nhánh mình đang trực ca.
- **Mock Data**: Cung cấp bộ mock data tối thiểu 10-12 bản ghi với đầy đủ các trạng thái, có kịch bản đơn hôm nay và đơn lệch hàng để kiểm thử nghiệp vụ.

## 3. Non-Goals (Ngoài phạm vi)
- Không lập trình chi tiết form nhập từng SKU từ đầu (`grn_form.html` thuộc change tiếp theo).
- Không tích hợp máy quét mã vạch USB phần cứng hay máy in nhiệt thật tại quầy (chỉ preview/toast thông báo).
- Không tự động cập nhật Database backend trong bước này (giai đoạn xây dựng UI frontend và mock state).

## 4. Các Phương án Kỹ thuật (Technical Approaches)

### Phương án A: Đặt chung trong `src/features/purchase-order/`
- **Mô tả**: Tạo các component GRN bên trong folder `src/features/purchase-order/components/grn/`.
- **Ưu điểm**: Tái sử dụng sẵn các type và CSS của purchase order.
- **Nhược điểm**: Vi phạm nguyên tắc Single Responsibility của DDD. Theo ERD hệ thống, `GoodsReceipts` và `PurchaseOrders` là 2 thực thể nghiệp vụ khác nhau (PO có thể có nhiều GRN do giao từng phần, hoặc có GRN trực tiếp không qua PO). Gộp chung gây phình to và khó bảo trì.

### Phương án B: Tạo phân hệ độc lập `src/features/goods-receipt/` (ĐƯỢC CHỌN)
- **Mô tả**: Khởi tạo folder `src/features/goods-receipt/` với cấu trúc chuẩn:
  - `types/grn.types.ts`: Định nghĩa kiểu `GoodsReceiptListItem`, `GoodsReceiptItemDetail`, `GrnFilterState`, `GrnStatus`.
  - `lib/mockGrnData.ts`: 12 bản ghi mẫu phản ánh đúng các tình huống thực tế của prototype.
  - `components/`: `GrnFilterBar.tsx`, `GrnTable.tsx`, `GrnDetailDrawer.tsx`, `GrnQuickTabs.tsx`.
  - `pages/`: `GoodsReceiptListPage.tsx`.
- **Ưu điểm**:
  - Tách bạch ranh giới domain hoàn hảo theo chuẩn Clean Architecture của dự án.
  - Sẵn sàng mở rộng cho các màn hình `grn_form.html`, `batch_list.html` tiếp theo mà không làm ảnh hưởng đến mã nguồn của `purchase-order`.
  - Hỗ trợ prop `role` hoặc URL query parameter `?role=employee&branch=BR-01` để dễ dàng giả lập và chuyển đổi giữa 2 góc nhìn Store Owner và Employee.
- **Nhược điểm**: Cần thiết lập mới file export và đăng ký route trong `router.tsx`.

## 5. Rủi ro & Cách Giảm Thiểu (Risks & Mitigation)
- **Rủi ro 1: Phân quyền vai trò không rõ ràng gây rò rỉ dữ liệu giữa các chi nhánh**:
  - *Giải pháp*: Trong component container `GoodsReceiptListPage.tsx`, kiểm tra role hiện tại; nếu là `employee`, khóa cứng trường Chi nhánh theo branch ID của nhân viên và tự động lọc danh sách chỉ thuộc branch đó.
- **Rủi ro 2: Số lượng cột bảng dữ liệu nhiều (11 cột) gây vỡ giao diện trên màn hình nhỏ**:
  - *Giải pháp*: Áp dụng container `overflow-x: auto`, thiết lập độ rộng tối thiểu `min-width: 1200px` cho bảng, `white-space: nowrap` cho các cột nhãn/tiền tệ/thao tác, và sticky header để cuộn trang mượt mà.
