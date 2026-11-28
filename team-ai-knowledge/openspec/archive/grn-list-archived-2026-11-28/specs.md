# Specs: grn-list

## API / Contract (Frontend Mock & Client State)

| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/v1/goods-receipts` | Query: `keyword`, `branchId`, `supplierId`, `status`, `dateFrom`, `dateTo`, `tab`, `pageIndex`, `pageSize` | `{ items: GoodsReceiptListItem[], totalCount: number, pageIndex: number, pageSize: number }` | `400` Thiếu tenant, `403` Sai quyền chi nhánh |
| `GET` | `/api/v1/goods-receipts/:id` | Param: `id` (Mã GRN hoặc PO) | `{ order: GoodsReceiptListItem, items: GrnItemDetail[] }` | `404` Không tìm thấy phiếu |

---

## ADDED Requirements

### Requirement: REQ-01 Màn hình Danh sách Phiếu nhập kho & Lịch nhận hàng hôm nay (UI-05-03)
Hệ thống MUST hiển thị giao diện bảng 11 cột chuẩn MT-GRMS B2B SaaS ERP gồm:
1. `Mã GRN / Mã PO`: Link mở chi tiết.
2. `Loại`: *Lịch hôm nay*, *Từ PO*, *Trực tiếp*.
3. `Ngày nhận / Dự kiến`: Ngày giờ giao hàng hoặc giờ hoàn thành nhập kho.
4. `Chi nhánh`: Mã và tên chi nhánh tiếp nhận.
5. `Nhà cung cấp`: Tên và mã nhà cung cấp.
6. `Mã PO tham chiếu`: Mã PO gốc hoặc `-`.
7. `Số lượng dòng`: Số SKU (căn phải).
8. `Tổng tiền (VNĐ)`: Tiền tệ căn phải, font `tabular-nums`.
9. `Trạng thái`: Semantic Badges (`TODAY`, `DRAFT`, `CONFIRMED`, `MISMATCH`, `CANCELED`).
10. `Thủ kho nhận / Phân công`: Tên nhân viên phụ trách.
11. `Thao tác`: Nút theo ngữ cảnh trạng thái dòng.

#### Scenario: Hiển thị danh sách phiếu nhập kho
- GIVEN người dùng đã đăng nhập vào hệ thống
- WHEN người dùng truy cập trang danh sách phiếu nhập kho
- THEN hệ thống MUST hiển thị bảng dữ liệu với sticky header, các cột căn chỉnh chuẩn xác và badge trạng thái trực quan.

#### Scenario: Danh sách rỗng không có dữ liệu phù hợp
- GIVEN bộ lọc không khớp với bất kỳ phiếu nhập kho nào
- WHEN bảng dữ liệu không có dòng nào
- THEN hệ thống MUST hiển thị icon `PackageOpen`, thông báo rỗng kèm nút "Đặt lại bộ lọc tìm kiếm".

---

### Requirement: REQ-02 Phân quyền truy cập theo vai trò Store Owner & Employee
Hệ thống MUST kiểm soát phạm vi dữ liệu dựa trên vai trò người dùng:
1. Với Role `Store Owner`: Xem toàn bộ các phiếu nhập kho trên tất cả các chi nhánh (`Tenant-Wide Scope`). Dropdown chi nhánh cho phép chọn lọc từng chi nhánh hoặc chọn *"Tất cả chi nhánh"*.
2. Với Role `Employee`: Bị giới hạn phạm vi chi nhánh (`Branch-Specific Scope`). Chỉ xem và thao tác trên các phiếu thuộc chi nhánh của nhân viên đó. Dropdown chi nhánh bị vô hiệu hóa (disabled) hoặc chỉ hiển thị chi nhánh hiện tại.

#### Scenario: Nhân viên chi nhánh truy cập màn hình
- GIVEN người dùng có vai trò là Employee trực thuộc chi nhánh `BR-01`
- WHEN mở màn hình danh sách phiếu nhập kho
- THEN hệ thống MUST chỉ hiển thị các phiếu nhập kho và lịch nhận hàng của chi nhánh `BR-01`, dropdown chi nhánh bị khóa cố định là `BR-01`.

#### Scenario: Chủ cửa hàng truy cập màn hình
- GIVEN người dùng có vai trò là Store Owner
- WHEN mở màn hình danh sách phiếu nhập kho
- THEN hệ thống MUST hiển thị phiếu nhập của toàn bộ các chi nhánh, dropdown chi nhánh cho phép chuyển đổi giữa các chi nhánh hoặc xem tất cả.

---

### Requirement: REQ-03 Thẻ chuyển trạng thái nhanh (Quick View Tabs)
Hệ thống MUST cung cấp 4 thẻ chuyển nhanh ngay phía trên bảng:
1. `Tất cả phiếu nhập`: Hiển thị mọi trạng thái.
2. `🚚 Lịch nhận hàng hôm nay`: Highlight màu xanh dương, lọc các đơn có trạng thái `TODAY`.
3. `⏳ Chờ xác nhận nhập`: Lọc các phiếu trạng thái `DRAFT` đang kiểm đếm.
4. `⚠️ Lệch số lượng / Hàng lỗi`: Highlight màu đỏ, lọc các phiếu trạng thái `MISMATCH`.

Mỗi tab MUST hiển thị số lượng bản ghi tương ứng trong ngoặc đơn.

#### Scenario: Bấm vào thẻ "Lịch nhận hàng hôm nay"
- GIVEN người dùng đang ở danh sách đầy đủ
- WHEN bấm vào tab "Lịch nhận hàng hôm nay"
- THEN hệ thống MUST cập nhật bộ lọc trạng thái sang `TODAY`, bảng chỉ hiển thị các đơn có lịch giao hôm nay và tab được kích hoạt trực quan.

---

### Requirement: REQ-04 Bộ lọc hợp nhất đa tiêu chí (Unified Filter Bar)
Hệ thống MUST cung cấp thanh lọc hợp nhất `po-unified-bar` gồm:
- Ô tìm kiếm từ khóa (`keyword`): Tìm kiếm theo mã GRN, mã PO, mã lô, tên NCC, tên thủ kho.
- Dropdown Chi nhánh (`branch`): Danh sách chi nhánh (chỉ mở cho Store Owner).
- Dropdown Nhà cung cấp (`supplier`): Danh sách các đối tác cung cấp.
- Dropdown Trạng thái (`status`): Các trạng thái GRN.
- Khoảng ngày (`dateFrom`, `dateTo`): Lọc theo ngày nhận / dự kiến.
- Nút "Tìm kiếm" và nút "Đặt lại".

#### Scenario: Người dùng tìm kiếm kết hợp nhiều tiêu chí
- GIVEN người dùng chọn NCC "TươiSạch" và khoảng ngày từ `2026-10-01` đến `2026-10-09`
- WHEN người dùng bấm nút "Tìm kiếm"
- THEN hệ thống MUST lọc và chỉ hiển thị các phiếu thỏa mãn đồng thời tất cả các tiêu chí đã chọn.

#### Scenario: Người dùng bấm nút "Đặt lại"
- GIVEN các tiêu chí lọc đang được thiết lập
- WHEN người dùng bấm nút "Đặt lại"
- THEN hệ thống MUST xóa trắng từ khóa, đưa các dropdown về mặc định, khôi phục bảng về trạng thái ban đầu và hiển thị thông báo toast.

---

### Requirement: REQ-05 Slide-over Drawer xem chi tiết đối soát PO & Lô hạn FEFO
Hệ thống MUST cung cấp Drawer trượt từ bên phải khi người dùng bấm vào mã GRN/PO hoặc bấm "Chi tiết" / "Nhập kho ngay":
- Thông tin tiêu đề: Mã phiếu, Loại phiếu, Trạng thái badge, Ngày giờ nhận.
- Thông tin đối tác: Tên nhà cung cấp, Chi nhánh tiếp nhận, Mã PO tham chiếu.
- Bảng chi tiết mặt hàng:
  - Mã SKU, Tên sản phẩm, Đơn vị tính (ĐVT).
  - Số lượng đặt (PO Quantity).
  - Số lượng thực nhận (Actual Quantity).
  - Chênh lệch (Delta / Variance: tô đỏ nếu thiếu, xanh nếu đủ).
  - Đơn giá nhập và Thành tiền dòng sản phẩm.
  - Thông tin Lô (Batch No.) và Hạn sử dụng (Exp Date) theo chuẩn FEFO.
  - Ghi chú hoặc nguyên nhân chênh lệch (nếu có).
- Hỗ trợ đóng Drawer bằng nút X, bấm vào vùng mờ overlay hoặc nhấn phím `Escape`.

#### Scenario: Mở Drawer xem đơn hàng bị lệch số lượng (Mismatch)
- GIVEN người dùng bấm vào phiếu `GRN-20261007-02` có trạng thái `MISMATCH`
- WHEN Drawer trượt mở ra
- THEN hệ thống MUST hiển thị bảng đối soát chi tiết, làm nổi bật dòng hàng bị giao thiếu kèm lý do "Giao thiếu 5 thùng, đã lập biên bản".

---

### Requirement: REQ-06 Phân trang dữ liệu (Pagination Footer)
Hệ thống MUST cung cấp footer phân trang cho bảng dữ liệu:
- Hiển thị dòng tóm tắt: "Hiển thị X - Y trong tổng số Z phiếu".
- Dropdown tùy chọn kích thước trang: 10, 20, 30, 50 dòng/trang.
- Các nút chuyển trang: "Trước", các trang số, và "Sau".
- Tự động reset về trang 1 khi thay đổi điều kiện lọc hoặc thay đổi kích thước trang.

#### Scenario: Chuyển kích thước trang sang 20 dòng
- GIVEN bảng đang ở kích thước 10 dòng/trang
- WHEN người dùng chọn 20 dòng/trang
- THEN bảng MUST hiển thị tối đa 20 bản ghi và số trang tự động tính toán lại.

---

## Acceptance Checklist

- [ ] REQ-01: Bảng 11 cột hiển thị chính xác theo prototype `grn_list.html`, sticky header, format tiền tệ `tabular-nums`.
- [ ] REQ-02: Phân quyền vai trò hoạt động đúng: Employee cố định chi nhánh của mình; Store Owner xem toàn bộ và lọc tự do.
- [ ] REQ-03: 4 Quick View Tabs chuyển đổi trạng thái tức thì kèm số lượng đếm bản ghi.
- [ ] REQ-04: Bộ lọc hợp nhất đa tiêu chí (keyword, branch, supplier, status, date range) hoạt động mượt mà.
- [ ] REQ-05: Slide-over Drawer mở chi tiết đối soát PO vs thực nhận, Lô FEFO, ghi chú lệch, đóng bằng nút X / phím Escape.
- [ ] REQ-06: Footer phân trang chuyển trang và đổi kích thước (10, 20, 30, 50) chính xác.
