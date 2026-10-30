# Design Brief: purchase-order-grid-creation (FE-05 Ordering)

## 1. Luồng Giao diện & Kiến trúc Thành phần (Vite + React 19 + TypeScript)

### Hierarchy Thành phần Giao diện
- **OrderMatrixPage** (`/store-owner/purchase-orders/create-matrix`): Container chính quản lý State toàn cục của ma trận.
  - **OrderMatrixHeader**: Tiêu đề trang, trạng thái Draft, nút Quay lại, nút Lưu nháp, nút mở Hub Cutoff, và nút Chốt Đơn & Tách PO (`⚡ Chốt Đơn & Tách PO`).
  - **OrderMatrixFilterBar**: Thanh công cụ 1 dòng gọn gàng đáp ứng `RULE_UI_DESIGN_SYSTEM.md`:
    - Bộ chọn Chi nhánh nhận hàng (`Select` Branch).
    - Bộ chọn Nhà cung cấp (`Select` Supplier - bao gồm option Tất cả NCC).
    - Điều hướng & Khoảng thời gian: Preset thời gian (7 ngày, 14 ngày, 21 ngày, 31 ngày), Điều hướng tuần (Hôm nay, tuần trước, tuần tới), Bộ chọn ngày custom (tối đa 31 ngày).
    - Tìm kiếm nhanh (Tên / SKU).
    - Checkboxes lọc: "Dòng đã nhập", "Cảnh báo vi phạm (MOQ)", "Chủ đã sửa" (chỉ hiện các dòng có ghi đè từ Store Owner).
    - Nút thao tác: "Gợi ý số lượng" (Auto-suggest), "Copy tuần trước", Xuất/Nhập Excel CSV/XLSX.
  - **OrderMatrixTable**: Bảng ma trận dữ liệu phân cấp:
    - **Header Ngày Giao Hàng**:
      - Hiển thị Thứ (T2, T3...), Ngày/Tháng (DD/MM).
      - Badge Trạng thái Cutoff: `Mở (Còn X ngày)`, `⚡ Đến hạn Cutoff`, `Đã chốt PO` (Khóa), `NCC Nghỉ` (Off).
      - Tooltip hiển thị giờ chốt đơn chi tiết (`Cutoff lúc 15:00`).
    - **Cột Cố Định Bên Trái**: Tên sản phẩm + SKU, Đơn vị tính, Đơn giá nhập snapshot, MOQ, (tùy chọn Tồn kho SOH & Tốc độ bán/ngày).
    - **Ô Nhập Số Lượng 3 Lớp**:
      - Hiển thị `final_qty`.
      - Chỉ báo trực quan khi Store Owner ghi đè (`store_qty !== null && store_qty !== employee_qty`): viền màu nổi bật, icon chỉ báo, tooltip/popover hiển thị `EmployeeQty` ban đầu, `StoreQty` và nút "↩ Khôi phục đề xuất nhân viên".
      - Ô vi phạm MOQ (`0 < final_qty < MOQ`): viền đỏ + tooltip cảnh báo.
      - Ô bị khóa (Đã chốt PO / Ngoài ngày giao NCC): hiển thị disabled `—` kèm lý do.
    - **Dòng Tổng**: Subtotal theo từng Nhà cung cấp & Footer Grand Total theo ngày giao.
  - **OrderMatrixSplitModal**: Modal xem trước và thực hiện bóc tách PO độc lập:
    - Hiển thị danh sách các PO dự kiến được tạo phân tách theo `[Chi nhánh + Nhà cung cấp + Ngày giao hàng]`.
    - Phân loại rõ ràng: "Ngày đến hạn Cutoff (Sẵn sàng chốt)" vs "Ngày dự kiến tương lai (Tiếp tục lập kế hoạch)".
    - Chức năng: "⚡ Chốt các ngày đến hạn Cutoff (Khuyến nghị)" hoặc "Chốt tất cả các ngày".
  - **AdminToast**: Thông báo phản hồi trực quan.

## 2. Quy tắc Nghiệp vụ Chính
1. **Phân biệt Ngày Nhập - Ngày Giao - Ngày Chốt**:
   - Ngày nhập: ngày thao tác.
   - Ngày giao: ngày NCC giao hàng đến chi nhánh.
   - Ngày chốt: Cutoff tính theo từng ngày giao.
2. **Quy tắc 3 Trường Số Lượng**:
   - `final_qty = (store_qty !== null) ? store_qty : employee_qty`.
   - `store_qty = 0`: chủ động không đặt sản phẩm này, không tạo dòng PO.
3. **Quy tắc Tách PO**:
   - 1 PO cho mỗi `[BranchId + SupplierId + DeliveryDate]`.
   - Tuyệt đối không gộp chung các ngày giao hàng khác nhau vào một PO.
4. **Quy tắc Giới hạn Thời gian**:
   - Tối đa 31 ngày (1 tháng).

## 3. Database & Entity Schema Impact
- `BranchOrderItems`: lưu `branch_id`, `supplier_id`, `product_id`, `delivery_date`, `employee_qty`, `store_qty`, `final_qty`, `modified_by`, `row_version`.
- `PurchaseOrders`: lưu `branch_id`, `supplier_id`, `delivery_date`, `order_date`, `status`, `total_quantity`, `total_amount`.
- `PurchaseOrderDetails`: lưu snapshot `product_id`, `ordered_qty`, `unit_price`, `order_unit`, `line_total`.
