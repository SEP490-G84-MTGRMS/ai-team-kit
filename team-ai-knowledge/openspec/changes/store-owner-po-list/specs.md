# Specs: store-owner-po-list (Đặc tả màn hình Danh sách đơn mua hàng PO)

## API / Contract (Frontend Mock & Client Contract)
| Method | Path / Action | Request Param / Body | Response DTO | Error / Status |
|---|---|---|---|---|
| GET | `/api/purchase-orders` | `PoListFilterState` (branchId, supplierId, status, dateFrom, dateTo, keyword, pageIndex, pageSize) | `{ items: PurchaseOrderListItem[], totalCount: number, pageIndex: number, pageSize: number }` | 400 (Lỗi validation), 401 (Chưa đăng nhập) |
| GET | `/api/purchase-orders/:id` | `id: string` | `PurchaseOrderListItem` (bao gồm `items: PurchaseOrderItemDetail[]`) | 404 (Không tìm thấy PO) |

---

## ADDED Requirements

### Requirement: REQ-01 Hiển thị Bảng danh sách Đơn mua hàng PO
Hệ thống **MUST** hiển thị danh sách tất cả các đơn mua hàng (PO) dạng bảng dữ liệu chuẩn Enterprise ERP với Sticky Header, bo góc `rounded-xl`, đổ bóng nhẹ `shadow-sm`, bao gồm đầy đủ 10 cột dữ liệu: Mã PO/Mã cửa hàng, Nhà cung cấp, Chi nhánh nhận, Nguồn tạo/Người nhập, Ngày sửa cuối, Ngày dự kiến giao, Số mặt hàng (SKU), Tổng tiền (VNĐ), Trạng thái PO và Cột Thao tác.

#### Scenario: Hiển thị bảng PO đầy đủ
- **GIVEN** Store Owner đã đăng nhập và truy cập màn hình Danh sách PO.
- **WHEN** Trang tải dữ liệu danh sách đơn hàng thành công.
- **THEN** Hệ thống hiển thị danh sách đơn hàng có phân trang, định dạng số tiền tiếng Việt (`vi-VN`), cột số căn phải, font monospace tabular nums.

#### Scenario: Danh sách rỗng không có bản ghi nào
- **GIVEN** Hệ thống chưa có đơn PO nào được tạo.
- **WHEN** Trang hiển thị bảng dữ liệu.
- **THEN** Hệ thống hiển thị hàng thông báo rỗng `"Chưa có đơn mua hàng PO nào trong hệ thống"` kèm hình ảnh minh họa thân thiện.

---

### Requirement: REQ-02 Bộ lọc đa tiêu chí hợp nhất (Unified Filter Bar)
Hệ thống **MUST** cung cấp thanh bộ lọc hợp nhất cho phép lọc linh hoạt theo:
1. Chi nhánh nhận hàng (`branchId`: Tất cả hoặc từng chi nhánh cụ thể).
2. Nhà cung cấp (`supplierId`: Tất cả hoặc từng NCC cụ thể).
3. Trạng thái PO (`status`: Tất cả, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`).
4. Khoảng thời gian (`dateFrom` - `dateTo`).
5. Từ khóa tìm kiếm (`keyword`: tìm theo mã PO, mã NCC, tên NCC, tên chi nhánh, người nhập, tên SKU).
Kèm nút `[Tìm kiếm]` để áp dụng bộ lọc và nút `[Đặt lại]` để xóa trắng tất cả tiêu chí về mặc định.

#### Scenario: Lọc đơn hàng theo Chi nhánh và Trạng thái
- **GIVEN** Danh sách có các đơn từ chi nhánh `BR-01`, `BR-02`, `DC1` với nhiều trạng thái khác nhau.
- **WHEN** Store Owner chọn `Chi nhánh: BR-01` và `Trạng thái: SENT`, sau đó nhấn `[Tìm kiếm]`.
- **THEN** Bảng chỉ hiển thị các đơn PO của chi nhánh `BR-01` có trạng thái `SENT`. Số lượng bản ghi trên footer phân trang cập nhật tương ứng.

#### Scenario: Tìm kiếm từ khóa không có kết quả phù hợp
- **GIVEN** Bảng đang hiển thị danh sách đơn hàng.
- **WHEN** Store Owner nhập từ khóa `"NCC_KHONG_TON_TAI_999"` và nhấn `[Tìm kiếm]`.
- **THEN** Bảng hiển thị giao diện rỗng `"Không tìm thấy đơn mua hàng nào phù hợp với bộ lọc"` và cung cấp nút `"Đặt lại bộ lọc"`.

---

### Requirement: REQ-03 Phân trang bảng dữ liệu (Pagination Footer)
Hệ thống **MUST** tích hợp footer phân trang ở cuối bảng dữ liệu đồng bộ với layout chuẩn của hệ thống:
- Hiển thị dải bản ghi: `Hiển thị X - Y trên Z đơn mua hàng PO`.
- Cho phép chọn số bản ghi trên một trang: `10`, `20`, `30`, `50`.
- Cho phép chuyển trang thông qua nút `[Trước]`, `Trang X / Y`, `[Sau]`.
- Nút `[Trước]` **MUST** bị vô hiệu hóa (disabled) khi đang ở trang 1; nút `[Sau]` **MUST** bị vô hiệu hóa khi ở trang cuối cùng.

#### Scenario: Chuyển trang và thay đổi kích thước trang
- **GIVEN** Danh sách có tổng cộng 25 đơn PO, kích thước trang hiện tại là `10` (tổng 3 trang).
- **WHEN** Store Owner nhấn nút `[Sau]`.
- **THEN** Bảng hiển thị các đơn PO từ vị trí thứ 11 đến 20, nhãn trang chuyển thành `Trang 2 / 3`.
- **WHEN** Store Owner thay đổi số bản ghi/trang thành `50`.
- **THEN** Bảng hiển thị toàn bộ 25 đơn hàng trên trang 1 và nhãn trang chuyển thành `Trang 1 / 1`.

---

### Requirement: REQ-04 Xem nhanh chi tiết PO qua Slide-over Drawer
Hệ thống **MUST** hỗ trợ mở Slide-over Drawer từ bên phải khi Store Owner click vào mã PO hoặc nút `"Xem chi tiết"` ở cột Thao tác.
Drawer **MUST** hiển thị:
- Header: Mã PO, Mã tham chiếu cửa hàng, Tên Nhà cung cấp, Chi nhánh nhận, Badge trạng thái đơn, Nút đóng `[X]`.
- Danh sách mặt hàng: Bảng chi tiết gồm STT, Tên mặt hàng, Mã SKU, Đơn vị tính (ĐVT), Số lượng đặt hàng, Số lượng đã nhận (nếu có), Đơn giá (VNĐ), Thành tiền (VNĐ).
- Footer: Ghi chú đơn hàng (nếu có) và Tổng tiền đơn hàng in đậm nổi bật.

#### Scenario: Mở và đóng Drawer xem chi tiết PO
- **GIVEN** Bảng dữ liệu đang hiển thị đơn `PO-20261008-001`.
- **WHEN** Store Owner click vào nút `"Xem chi tiết"` của đơn này.
- **THEN** Ngăn kéo trượt ra từ bên phải màn hình hiển thị danh sách 5 mặt hàng của đơn và tổng tiền `3.450.000 đ`.
- **WHEN** Store Owner nhấn nút `[X]` hoặc click vào lớp nền mờ (backdrop) hoặc nhấn phím `Escape`.
- **THEN** Drawer đóng lại mà không làm thay đổi các tiêu chí lọc hiện tại trên bảng danh sách.

---

### Requirement: REQ-05 Định dạng Huy hiệu Trạng thái (Status Badges)
Hệ thống **MUST** trực quan hóa trạng thái đơn hàng bằng huy hiệu (badge) có màu sắc ngữ nghĩa rõ ràng, đúng quy chuẩn:
- `SENT`: Nền `#fef3c7`, chữ `#b45309`, viền `#fde68a`, nhãn `"Đã gửi NCC"`.
- `CONFIRMED`: Nền `#dcfce7`, chữ `#15803d`, viền `#86efac`, nhãn `"NCC đã chốt"`.
- `PARTIALLY_RECEIVED`: Nền `#e0e7ff`, chữ `#4338ca`, viền `#c7d2fe`, nhãn `"Đã nhận 1 phần"`.
- `RECEIVED`: Nền `#e0f2fe`, chữ `#0369a1`, viền `#bae6fd`, nhãn `"Đã nhập kho xong"`.
- `CANCELLED`: Nền `#fee2e2`, chữ `#dc2626`, viền `#fca5a5`, nhãn `"Đã hủy"`.

#### Scenario: Hiển thị đúng màu và nhãn trạng thái PO
- **GIVEN** Một đơn hàng có thuộc tính `status: 'CONFIRMED'`.
- **WHEN** Dòng đơn hàng được render trên bảng hoặc drawer.
- **THEN** Hệ thống hiển thị badge màu xanh lá với văn bản `"NCC đã chốt"`.

---

## Acceptance Checklist
- [ ] REQ-01: Bảng dữ liệu hiển thị đầy đủ 10 cột, sticky header, định dạng số tiền tiếng Việt tabular-nums.
- [ ] REQ-02: Bộ lọc 5 tiêu chí (Chi nhánh, NCC, Trạng thái, Khoảng ngày, Từ khóa) hoạt động chính xác.
- [ ] REQ-03: Phân trang mượt mà, hỗ trợ chọn 10/20/30/50 bản ghi/trang.
- [ ] REQ-04: Slide-over Drawer xem chi tiết PO mở mượt mà, hiển thị bảng mặt hàng và tổng tiền chuẩn xác.
- [ ] REQ-05: Toàn bộ 5 trạng thái PO (`SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`) được gắn badge màu chuẩn.
- [ ] Route `/store-owner/purchase-orders/list` được tích hợp vào router của ứng dụng và hoạt động ổn định.
