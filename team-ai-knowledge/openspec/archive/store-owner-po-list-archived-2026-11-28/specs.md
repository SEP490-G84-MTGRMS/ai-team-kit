# Specs: store-owner-po-list (Đặc tả màn hình Danh sách đơn mua hàng PO)

## API / Contract (Frontend Mock & Client Contract)
| Method | Path / Action | Request Param / Body | Response DTO | Error / Status |
|---|---|---|---|---|
| GET | `/api/purchase-orders` | `PoListFilterState` (branchId, supplierId, status, dateFrom, dateTo, keyword, pageIndex, pageSize) | `{ items: PurchaseOrderListItem[], totalCount: number, pageIndex: number, pageSize: number }` | 400 (Lỗi validation), 401 (Chưa đăng nhập) |
| GET | `/api/purchase-orders/:id` | `id: string` | `PurchaseOrderListItem` (bao gồm `items: PurchaseOrderItemDetail[]`, `revisions: PurchaseOrderRevisionDto[]`) | 404 (Không tìm thấy PO) |
| GET | `/api/purchase-orders/:id/revisions` | `id: string` | `List<PurchaseOrderRevisionDto>` | 404 (Không tìm thấy PO) |

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

### Requirement: REQ-06 Lịch sử Điều chỉnh Đơn hàng (Purchase Order Revisions & Audit)
Hệ thống **MUST** theo dõi và ghi nhận đầy đủ lịch sử các lần điều chỉnh đơn hàng (`PurchaseOrderRevision`):
- Mỗi lần Store Owner điều chỉnh số lượng hoặc thông tin dòng PO sau khi đã gửi, hệ thống tự động sinh một bản ghi Revision gồm: Phiên bản (`RevisionNumber`), Người sửa (`ChangedBy`), Thời điểm sửa (`CreatedAt`), Lý do sửa (`ChangeReason`), và danh sách các dòng chi tiết thay đổi (`OldQty`, `NewQty`, `DeltaAmount`).
- Drawer xem chi tiết PO SHALL có tab hoặc khu vực "Lịch sử điều chỉnh" để Store Owner xem lại chi tiết sự khác biệt giữa các phiên bản đơn hàng.

#### Scenario: Xem lịch sử điều chỉnh PO
- **GIVEN** Đơn hàng `PO-20261014-002` đã được điều chỉnh số lượng từ 20 xuống 15 cho sản phẩm sữa tươi.
- **WHEN** Store Owner mở xem chi tiết đơn hàng và chuyển sang mục Lịch sử điều chỉnh.
- **THEN** Hệ thống hiển thị bản ghi Revision #1 với người sửa, thời gian và chỉ báo "Sữa tươi: 20 -> 15 (Giảm 5)".

---

## Acceptance Checklist
- [x] REQ-01: Bảng dữ liệu hiển thị đầy đủ 10 cột, sticky header, định dạng số tiền tiếng Việt tabular-nums.
- [x] REQ-02: Bộ lọc 5 tiêu chí (Chi nhánh, NCC, Trạng thái, Khoảng ngày, Từ khóa) hoạt động chính xác.
- [x] REQ-03: Phân trang mượt mà, hỗ trợ chọn 10/20/30/50 bản ghi/trang.
- [x] REQ-04: Slide-over Drawer xem chi tiết PO mở mượt mà, hiển thị bảng mặt hàng và tổng tiền chuẩn xác.
- [x] REQ-05: Toàn bộ 5 trạng thái PO (`SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`) được gắn badge màu chuẩn.
- [x] REQ-06: Quản lý lịch sử sửa đổi PO (PurchaseOrderRevision) hiển thị rõ ràng audit trail.
- [x] Route `/store-owner/purchase-orders/list` được tích hợp vào router của ứng dụng và hoạt động ổn định.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: branch-order-management -->
# Specs: branch-order-management

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/branches` | `keyword` (string), `branchCode` (string), `status` (string), `pageIndex` (int), `pageSize` (int) | `ApiResponse<PagedResult<BranchDto>>` | `200 OK`, `400 Bad Request` |
| `GET` | `/api/v1/branches/{id}` | `id` (UUID Path parameter) | `ApiResponse<BranchDto>` | `200 OK`, `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-BR-01 Quản lý và Truy vấn Danh sách Chi nhánh (Backend)
Hệ thống **MUST** cung cấp endpoint RESTful `GET /api/v1/branches` phục vụ việc truy vấn, lọc và phân trang danh sách các chi nhánh thuộc chuỗi bán lẻ của Tenant hiện tại:
- Hỗ trợ tham số phân trang: `pageIndex` (mặc định 1), `pageSize` (mặc định 10).
- Hỗ trợ tham số tìm kiếm `keyword`: Khớp mờ không phân biệt hoa thường theo `Code`, `Name`, `Address`, `ManagerName`, hoặc `Phone`.
- Hỗ trợ tham số lọc `branchCode` và `status` ('Active' | 'Inactive').
- **MUST** tự động áp dụng Global Query Filter theo `TenantId` để bảo đảm cô lập dữ liệu tuyệt đối giữa các cửa hàng/chuỗi khác nhau.
- Kết quả trả về đóng gói theo chuẩn `ApiResponse<PagedResult<BranchDto>>`.

#### Scenario: Truy vấn danh sách chi nhánh với phân trang mặc định
- **GIVEN** Cơ sở dữ liệu của Tenant có 5 chi nhánh đang hoạt động.
- **WHEN** Client gửi yêu cầu `GET /api/v1/branches?pageIndex=1&pageSize=10`.
- **THEN** Hệ thống trả về mã `200 OK` kèm `totalCount = 5`, danh sách 5 chi nhánh với đầy đủ thông tin `code`, `name`, `address`, `managerName`, `pendingOrdersCount`, `status`.

#### Scenario: Tìm kiếm chi nhánh theo từ khóa
- **GIVEN** Có các chi nhánh "Chi nhánh Cầu Giấy" (BR-01), "Chi nhánh Đống Đa" (BR-02).
- **WHEN** Client gửi yêu cầu `GET /api/v1/branches?keyword=cầu giấy`.
- **THEN** Hệ thống trả về `200 OK` với danh sách chỉ chứa duy nhất "Chi nhánh Cầu Giấy".

#### Scenario: Cô lập đa người thuê (Multi-Tenancy)
- **GIVEN** Tenant A có 3 chi nhánh và Tenant B có 2 chi nhánh.
- **WHEN** Người dùng thuộc Tenant A gửi yêu cầu `GET /api/v1/branches`.
- **THEN** Hệ thống chỉ trả về 3 chi nhánh của Tenant A, tuyệt đối không xuất hiện bất kỳ chi nhánh nào của Tenant B.

---

### Requirement: REQ-BR-02 Truy vấn Chi tiết Chi nhánh theo Định danh (ID)
Hệ thống **MUST** cung cấp endpoint `GET /api/v1/branches/{id}` để tra cứu thông tin cụ thể của một chi nhánh:
- Kiểm tra tính hợp lệ của `id` và sự tồn tại của chi nhánh trong phạm vi Tenant hiện tại.
- Nếu không tìm thấy hoặc chi nhánh đã bị đánh dấu xóa mềm (`IsDeleted = true`), hệ thống **MUST** trả về mã `404 Not Found`.

#### Scenario: Tra cứu chi nhánh hợp lệ
- **GIVEN** Chi nhánh có ID `11111111-1111-1111-1111-111111111111` thuộc Tenant hiện tại.
- **WHEN** Client gửi yêu cầu `GET /api/v1/branches/11111111-1111-1111-1111-111111111111`.
- **THEN** Hệ thống trả về `200 OK` kèm dữ liệu chi tiết của chi nhánh đó.

#### Scenario: Tra cứu chi nhánh không tồn tại
- **GIVEN** Định danh ID không tồn tại trong cơ sở dữ liệu.
- **WHEN** Client gửi yêu cầu `GET /api/v1/branches/99999999-9999-9999-9999-999999999999`.
- **THEN** Hệ thống trả về mã lỗi `404 Not Found` kèm thông điệp báo lỗi chuẩn ProblemDetails.

---

### Requirement: REQ-BR-03 Giao diện Đặt Hàng Theo Chi Nhánh chuẩn Format UI SupplierListPage (Frontend)
Hệ thống Frontend **MUST** tái cấu trúc màn hình `BranchOrderListPage.tsx` tại route `/store-owner/purchase-orders/branches` tuân thủ 100% định dạng giao diện của `SupplierListPage`:
1. **Bố cục khung (Container Layout)**: Sử dụng cấu trúc `po-matrix-container` với chiều cao tối đa, không cuộn tràn thanh cuộn trình duyệt, phân chia rõ ràng các khối giao diện.
2. **Page Header**:
   - Tiêu đề "Đặt hàng theo chi nhánh" kèm icon `Building2` màu xanh chủ đạo (`#0f766e`).
   - Icon xoay tải dữ liệu `Loader2` khi đang gọi API.
   - Các nút hành động: "Lịch sử đơn hàng" (chuyển hướng sang `/store-owner/purchase-orders/list`), "Xuất Excel".
3. **Thanh lọc tách biệt (`BranchFilterBar`)**:
   - Khung thẻ viền bo góc riêng biệt.
   - Ô nhập tìm kiếm từ khóa rộng rãi kèm icon `Search`.
   - Dropdown chọn Mã chi nhánh và dropdown Trạng thái hoạt động.
   - Nút "Tìm kiếm" và nút "Đặt lại". Chỉ kích hoạt tìm kiếm khi người dùng nhấn Enter hoặc bấm nút "Tìm kiếm".
4. **Bảng dữ liệu chuẩn hóa (`BranchOrderTable`)**:
   - Cố định dòng tiêu đề (Sticky/Fixed Header), vùng thân bảng `tbody` cuộn độc lập dọc và ngang.
   - Badge trạng thái trực quan: Màu xanh lá cho "Hoạt động", màu xám cho "Ngừng hoạt động".
   - Cột Thao tác: Nút "Đặt hàng" (chuyển sang `/store-owner/purchase-orders/create-matrix?branchId={id}`) và "Chi tiết".
5. **Thanh Footer Phân Trang (Pagination)**:
   - Tích hợp trực tiếp phía dưới bảng.
   - Hiển thị dải số bản ghi (ví dụ: "Hiển thị 1 - 5 trên 5 chi nhánh").
   - Dropdown chọn số bản ghi mỗi trang (10, 20, 30, 50).
   - Nút điều hướng "Trước", "Sau" và nhãn "Trang X / Y".
6. **API Integration & Fallback**:
   - Sử dụng client `branchApi.ts` để gọi API Backend.
   - Tự động fallback sang mock data an toàn khi Backend offline, đảm bảo không sập trang.

#### Scenario: Người dùng tìm kiếm và xem danh sách chi nhánh
- **GIVEN** Người dùng mở URL `http://localhost:5173/store-owner/purchase-orders/branches`.
- **WHEN** Trang tải xong dữ liệu từ API.
- **THEN** Bảng hiển thị danh sách các chi nhánh với đầy đủ các cột thông tin, header cố định và footer phân trang hoạt động chuẩn xác.

#### Scenario: Người dùng bấm nút "Đặt hàng" tại một chi nhánh
- **GIVEN** Dòng chi nhánh "Kho tổng DC1" hiển thị trên bảng.
- **WHEN** Người dùng bấm vào nút "Đặt hàng".
- **THEN** Ứng dụng điều hướng sang `/store-owner/purchase-orders/create-matrix?branchId={id}` để tiến hành tạo ma trận đặt hàng.

---

## Acceptance Checklist
- [ ] Backend: Entity `Branch` kế thừa `BaseTenantEntity`, tạo migration EF Core Code-First thành công.
- [ ] Backend: `IBranchService` và `BranchService` xử lý phân trang, tìm kiếm và lọc đúng yêu cầu.
- [ ] Backend: `BranchesController` cung cấp `GET /api/v1/branches` và `GET /api/v1/branches/{id}`.
- [ ] Backend: Unit tests xUnit kiểm thử toàn bộ nghiệp vụ BranchService và Controller đạt 100% PASS.
- [ ] Frontend: `BranchFilterBar` tách biệt, hoạt động đúng cơ chế draft state (bấm Tìm kiếm mới áp dụng).
- [ ] Frontend: `BranchOrderTable` có sticky header, body cuộn độc lập, footer phân trang tích hợp.
- [ ] Frontend: Màn hình hiển thị đồng bộ 100% layout `SupplierListPage`, không phát sinh lỗi build/lint.
