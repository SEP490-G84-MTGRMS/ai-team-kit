# Exploration: create-purchase-order

## 1. Hiện trạng Code & Hệ thống

### 1.1. Giao diện người dùng & Mockup liên quan
- **Mockup thiết kế chuẩn**: `d:\FPT UNIVERSITY\FALL_2026_SEASON9\SEP490\design_ui\create_po_grid.html` cung cấp cấu trúc hoàn chỉnh cho **Order Matrix Grid**:
  - Thanh chọn phạm vi: Nhà cung cấp (`Supplier`), Chi nhánh nhận hàng (`Branch`), Khoảng thời gian (`From Date` - `To Date`), Chế độ xem (`7 ngày` / `14 ngày`).
  - Thanh hạn mức tín dụng: Hiển thị Dư nợ AP hiện tại (`Open AP`), Giá trị đơn hàng mới (`New Order Amt`), Tổng nợ dự kiến so với Hạn mức tín dụng (`Credit Limit`), cảnh báo vượt hạn mức.
  - Thanh cấu hình giao hàng NCC: `Lead Time`, `Cutoff Time`, `Lock Hour`, các ngày giao hoạt động trong tuần (`ActiveDeliveryDays`), ngày lễ (`Holidays`).
  - Lưới ma trận (Grid Table): Dòng là Sản phẩm theo nhóm ngành hàng (`Category`), Cột là các ngày giao hàng (có hiển thị thứ trong tuần, ngày tháng, trạng thái: Mở, Khóa, Off).
  - Cột bổ sung: `Unit`, `Price (VND)`, `MOQ`, `Stock (SOH)`, `Sales/Day`, `Total Qty`, `Total Amt`.
  - Hàng tổng: `Subtotal` theo từng ngành hàng, `Daily Total Qty` theo từng ngày giao, `Grand Total Qty`, `Grand Total Amount`.
  - Phím tắt điều hướng nhanh trong lưới (mũi tên ↑ ↓ ← →, Enter).
  - Tiện ích: Copy tuần trước (`Copy Prev Week`), Dịch chuyển tuần (`Prev/This/Next Week`), Tải/Nhập Excel (`Excel Download/Upload`), Lưu nháp (`Save Draft`), Gửi đơn (`Submit POs`).
- **Frontend hiện tại (`MT_GRMS_FRONTEND`)**:
  - Đã có module Supplier (`src/features/supplier/`): Quản lý danh sách NCC (`SupplierListPage`), Sản phẩm theo NCC (`SupplierProductManagementPage`).
  - Đã có dữ liệu Mock Data: `INITIAL_SUPPLIERS`, `MASTER_PRODUCTS`, `MOCK_SUPPLIER_PRODUCTS`.
  - Đã có bảng giá thỏa thuận NCC (`SupplierProducts.AgreedPrice` / `importPrice`), `deliveryUoM`, `moq`.
  - Chưa có module Tạo đơn mua hàng PO dạng ma trận (`src/features/purchase-order/`).

### 1.2. Backend hiện tại (`MT_GRMS_BACKEND`)
- Đã có thực thể `Supplier` (có `CreditLimit`, `PaymentTermDays`), `SupplierProduct` (có `AgreedWholesalePrice`, `MinimumOrderQuantity`, `DeliveryUoM`).
- Cần mô hình hóa cấu hình giao hàng của NCC (`SupplierDeliveryConfig` hoặc các trường `LeadTimeDays`, `CutoffTime`, `LockHour`, `ActiveDeliveryDays`, `Holidays`).
- Cần thực thể `PurchaseOrder` và `PurchaseOrderDetail` hỗ trợ lưu trữ trạng thái PO theo từng ngày giao hàng độc lập.

---

## 2. Assumptions (Các giả định)
- **[ASSUMPTION-01]**: Mỗi đơn PO được sinh ra từ ma trận có định danh độc lập duy nhất: $\mathbf{1\ PO = 1\ NCC + 1\ Chi\ Nhánh + 1\ Ngày\ Giao\ Hàng}$. Nếu một ngày trong ma trận có tổng số lượng đặt bằng 0, hệ thống không sinh đơn PO cho ngày đó.
- **[ASSUMPTION-02]**: Giá mua trong đơn PO luôn lấy từ giá sỉ thỏa thuận hiện hành của NCC (`AgreedPrice`). Nếu giá trên bảng thỏa thuận thay đổi sau khi PO được phát hành, giá trên PO đã chốt không bị thay đổi hồi tố (Snapshot price).
- **[ASSUMPTION-03]**: Giờ Cutoff Time và Lock Hour được tính toán dựa trên múi giờ địa phương của cửa hàng (`Asia/Ho_Chi_Minh`, UTC+7).
- **[ASSUMPTION-04]**: Dư nợ AP hiện tại (`Open AP`) của NCC được tổng hợp từ các hóa đơn nợ chưa thanh toán trong sổ cái công nợ AP của Tenant.
- **[ASSUMPTION-05]**: Chi nhánh chỉ có quyền tạo bản thảo nhu cầu (`Draft Store Demand` -> PO trạng thái `PENDING_APPROVAL`). Store Owner có toàn quyền duyệt, ghi đè và phát hành PO sang trạng thái `APPROVED` / `SENT`.

---

## 3. Scope & Non-Goals (Phạm vi & Những gì không làm)

### 3.1. In Scope
- Giao diện Ma trận đặt hàng (Order Matrix Grid) chu kỳ 7 ngày / 14 ngày.
- Cơ chế Auto PO Splitting khi bấm Submit: Tách ma trận thành các đơn PO độc lập theo từng ngày giao có đặt hàng.
- Kiểm soát trọn vẹn 5 quy tắc nghiệp vụ:
  - **BR-1**: Lịch giao, Lead Time, vô hiệu hóa ngày Off/lễ, khóa chỉnh sửa ô ngày quá giờ Lock Hour.
  - **BR-2**: Kiểm soát hạn mức nợ thời gian thực ($\text{Open AP} + \text{New Order Amt} \le \text{Credit Limit}$), chặn gửi đơn khi vượt.
  - **BR-3**: Cảnh báo viền đỏ vi phạm MOQ (`qty-bad`), lọc nhanh `MOQ Failures`.
  - **BR-4**: Hiển thị gợi ý số lượng, tồn kho chi nhánh (SOH) và doanh số bán/ngày (Sales/Day).
  - **BR-5**: Tính toán thành tiền theo giá thỏa thuận NCC.
- Hỗ trợ phím tắt bàn phím (mũi tên, Enter), Copy tuần trước, Tải/Nhập Excel, Lưu nháp.

### 3.2. Out of Scope (Non-Goals)
- **Quy trình nhập kho thực tế (GRN / Goods Receipt)**: Không xử lý kiểm đếm, đối soát hàng thừa/thiếu tại cửa bốc dỡ của chi nhánh (nằm ở module Kho/Nhập kho).
- **Nghiệp vụ chi trả công nợ NCC (AP Payment Voucher - FE-17)**: Màn hình PO chỉ đọc số dư nợ và điều hướng người dùng sang trang thanh toán nợ khi bị chặn tín dụng; không thực hiện tạo phiếu chi tiền mặt/ngân hàng tại màn hình này.
- **Tự động gửi email/EDI sang hệ thống NCC**: Chỉ chuyển trạng thái đơn PO sang `APPROVED` / `SENT` trong nội bộ hệ thống SaaS; cổng tích hợp EDI/Email nhà cung cấp nằm ở giai đoạn mở rộng.

---

## 4. Đề xuất Phương án Kỹ thuật (≥2 Phương án)

### Phương án 1: Client-Side Matrix State + Batch API Creation (Được đề xuất)
- **Kiến trúc**:
  - Frontend quản lý toàn bộ trạng thái Ma trận lưới (Grid State: `Record<productId, Record<dateKey, number>>`) cục bộ với React State / TanStack Query.
  - Khi người dùng thay đổi số lượng ở bất kỳ ô nào, tính toán thời gian thực tổng số lượng, tổng tiền và trạng thái Credit Limit, MOQ ngay trên trình duyệt (phản hồi tức thì < 16ms, không giật lag).
  - Khi người dùng bấm **Submit POs**, Frontend thực hiện Auto Splitting: Lọc các ngày có $\text{DailyQty} > 0$, đóng gói thành danh sách các đơn PO độc lập và gửi 1 request `POST /api/v1/purchase-orders/batch-from-grid` xuống Backend trong một Database Transaction duy nhất.
- **Ưu điểm**:
  - Trải nghiệm người dùng cực kỳ mượt mà: Nhập liệu hàng trăm ô số lượng, di chuyển bằng phím mũi tên nhanh chóng mà không bị phụ thuộc vào độ trễ mạng từng ô.
  - Phù hợp hoàn hảo với thiết kế mẫu trong `create_po_grid.html`.
  - Đảm bảo tính toàn vẹn dữ liệu: Backend kiểm tra lại Credit Limit và Lock Hour trong transaction trước khi commit tạo hàng loạt PO.
- **Nhược điểm**:
  - Cần xử lý đồng bộ thời gian thực khi nhiều người cùng mở ma trận (giải quyết bằng Optimistic Concurrency hoặc cơ chế khóa đơn bản thảo).

### Phương án 2: Server-Side Cell Persisting (Lưu từng ô số lượng trực tiếp qua WebSocket / Cell API)
- **Kiến trúc**:
  - Mỗi lần người dùng gõ số lượng vào 1 ô, Frontend bắn 1 request PATCH lên Server để lưu trạng thái ô vào một bảng tạm `DraftOrderMatrixCell`.
  - Server tính toán lại và trả về tổng tiền, hạn mức công nợ.
- **Ưu điểm**:
  - Tránh mất dữ liệu nếu trình duyệt bị tắt đột ngột giữa chừng.
- **Nhược điểm**:
  - Quá tải server khi người dùng nhập liệu liên tục bằng phím mũi tên (hàng chục request mỗi giây).
  - Độ trễ cao, gây cảm giác giật lag khi gõ nhanh.
  - Phức tạp hóa kiến trúc không cần thiết so với quy mô bán lẻ siêu thị mini.

### 👉 Lựa chọn phương án
Chọn **Phương án 1 (Client-Side Matrix State + Batch API Creation)** vì đáp ứng tối đa hiệu năng nhập liệu bảng tính chuyên nghiệp (như Excel/KiotViet), phản hồi tức thì và đảm bảo giao dịch bóc tách PO toàn vẹn qua Backend Transaction.

---

## 5. Rủi ro & Cách giảm thiểu
1. **Rủi ro vượt hạn mức nợ do đơn hàng khác được tạo đồng thời (Race Condition)**:
   - *Rủi ro*: Khi mở ma trận, hạn mức nợ còn an toàn, nhưng trước khi Submit, chi nhánh khác đã phát sinh đơn làm cạn kiệt hạn mức tín dụng.
   - *Cách giảm thiểu*: Backend kiểm tra lại một lần nữa điều kiện $\text{Open AP} + \text{Batch New Orders Amount} \le \text{Credit Limit}$ ngay trong transaction trước khi lưu PO. Nếu vi phạm, rollback và trả về lỗi `400 CreditLimitExceeded`.
2. **Rủi ro người dùng nhập ô ngày đã quá Cutoff / Lock Hour do đồng hồ máy khách lệch**:
   - *Rủi ro*: Client chỉnh giờ máy tính để né Lock Hour.
   - *Cách giảm thiểu*: Client hiển thị theo giờ server (`UTC+7`), Backend bắt buộc kiểm tra lại `DeliveryDate` so với `Server Time` + `LeadTime` / `CutoffTime`. Nếu quá hạn, từ chối tạo PO cho ngày đó.
3. **Rủi ro mất dữ liệu khi mất điện hoặc vô tình đóng tab**:
   - *Cách giảm thiểu*: Cung cấp nút **Lưu nháp (Save Draft)** và tự động lưu dự phòng vào `localStorage` theo key `draft_po_matrix_{tenantId}_{supplierId}_{branchId}`.
