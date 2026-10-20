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
