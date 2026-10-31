# Spec: supplier

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-SP01 Assign Product to Supplier with Terms & Uniqueness Guard (BR-SP01)
Hệ thống MUST cho phép người dùng gán một sản phẩm từ Danh mục chung (`Products`) cho một Nhà cung cấp (`Suppliers`), kèm theo đơn vị giao hàng (`DeliveryUoM`), giá sỉ thỏa thuận (`AgreedWholesalePrice`), số lượng đặt tối thiểu (`MOQ`), và tùy chọn đặt làm NCC chính (`IsPrimarySupplier`). Hệ thống MUST từ chối gán nếu sản phẩm đã được liên kết với Nhà cung cấp này trong cùng một Tenant.

#### Scenario: Gán sản phẩm mới cho Nhà cung cấp thành công (Happy Path)
- **GIVEN** Người dùng có quyền `Owner` hoặc `PurchasingStaff` thuộc Tenant A.
- **WHEN** Gửi request `POST /api/v1/suppliers/{suppId}/products` với:
  - `ProductId` = `prd-fresh-milk-1l`
  - `DeliveryUoM` = "Thùng"
  - `AgreedWholesalePrice` = 280,000 VND
  - `MinimumOrderQuantity` = 5
  - `IsPrimarySupplier` = true
- **THEN** Hệ thống lưu bản ghi vào `SupplierProducts` với `TenantId` = Tenant A, `Status` = `Active`, và trả về `201 Created` kèm `SupplierProductDto`.

#### Scenario: Gán thất bại do sản phẩm đã được gán trước đó cho Nhà cung cấp này (BR-SP01 Violation)
- **GIVEN** Sản phẩm `prd-fresh-milk-1l` đã được gán cho Nhà cung cấp `{suppId}` trong Tenant A.
- **WHEN** Người dùng gửi lại request `POST /api/v1/suppliers/{suppId}/products` với cùng `ProductId` = `prd-fresh-milk-1l`.
- **THEN** Hệ thống từ chối và trả về `409 Conflict` với mã lỗi `PRODUCT_ALREADY_ASSIGNED_TO_SUPPLIER`.

#### Scenario: Gán thất bại do Giá thỏa thuận <= 0 hoặc MOQ < 1 (BR-SP03 Validation Guard)
- **GIVEN** Người dùng chọn sản phẩm hợp lệ.
- **WHEN** Gửi request với `AgreedWholesalePrice` = 0 hoặc `MinimumOrderQuantity` = 0.
- **THEN** Hệ thống từ chối lưu và trả về `400 Bad Request` kèm thông báo lỗi chi tiết từ FluentValidation.

---

### Requirement: REQ-SP02 Supplier Product Price & MOQ Modification
Hệ thống MUST cho phép cập nhật giá nhập thỏa thuận (`AgreedWholesalePrice`), số lượng đặt hàng tối thiểu (`MOQ`), đơn vị giao hàng (`DeliveryUoM`), và mã sản phẩm phía NCC (`SupplierProductCode`) cho một liên kết sẵn có.

#### Scenario: Cập nhật giá nhập thỏa thuận và MOQ thành công
- **GIVEN** Sản phẩm `prd-tomato` đang được liên kết với NCC với giá 18,000 VND và MOQ = 10.
- **WHEN** Gửi request `PUT /api/v1/suppliers/{suppId}/products/{prdId}` với `AgreedWholesalePrice` = 20,000 VND và `MinimumOrderQuantity` = 15.
- **THEN** Hệ thống cập nhật bản ghi trong CSDL và trả về `200 OK` kèm `AgreedWholesalePrice` mới là 20,000 VND.

---

### Requirement: REQ-SP03 Supplier Product Status Toggle (Soft Deactivation / Reactivation)
Hệ thống MUST cho phép chuyển đổi trạng thái giữa `Active` (1) và `Inactive` (2) của liên kết sản phẩm - nhà cung cấp. Khi ở trạng thái `Inactive`, sản phẩm MUST bị ẩn khỏi danh sách lựa chọn khi tạo đơn PO mới từ NCC đó, nhưng MUST bảo toàn lịch sử trên các đơn PO/GRN đã tạo trước đó.

#### Scenario: Tạm ngưng cung ứng một mặt hàng từ Nhà cung cấp thành công
- **GIVEN** Sản phẩm "Sữa chua Vinamilk 100g" đang có trạng thái `Active` đối với NCC A.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{suppId}/products/{prdId}/status` với `Status` = `Inactive`.
- **THEN** Hệ thống cập nhật trạng thái liên kết thành `Inactive` và trả về `200 OK`.

#### Scenario: Tái kích hoạt lại mặt hàng tạm ngưng thành công
- **GIVEN** Sản phẩm đang ở trạng thái `Inactive` đối với NCC A.
- **WHEN** Người dùng gửi request chuyển `Status` thành `Active`.
- **THEN** Hệ thống cập nhật trạng thái liên kết thành `Active` và trả về `200 OK`.

---

### Requirement: REQ-SP04 Primary Supplier Assignment & Exclusivity Guard (BR-SP02)
Hệ thống MUST đảm bảo mỗi sản phẩm trong một Tenant chỉ có duy nhất một Nhà cung cấp được gán cờ `IsPrimarySupplier = true`. Khi một Nhà cung cấp được đặt làm NCC chính cho sản phẩm, hệ thống MUST tự động gỡ cờ NCC chính của các Nhà cung cấp khác đối với sản phẩm đó.

#### Scenario: Chuyển đổi Nhà cung cấp chính cho sản phẩm thành công
- **GIVEN** Sản phẩm "Coca Cola 330ml" đang có NCC A là `IsPrimarySupplier = true`, và NCC B là `IsPrimarySupplier = false`.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{suppBId}/products/{cocaId}/primary` với `IsPrimarySupplier` = true.
- **THEN** Hệ thống cập nhật NCC B thành `IsPrimarySupplier = true` và tự động cập nhật NCC A thành `IsPrimarySupplier = false`.

---

### Requirement: REQ-SP05 Contextual Querying & Reverse Lookup for Purchase Orders
Hệ thống MUST hỗ trợ 2 cơ chế truy vấn:
1. Lấy danh sách sản phẩm theo Nhà cung cấp kèm bộ lọc đa tiêu chí (Ngành hàng, Trạng thái, Từ khoá tìm kiếm theo Tên, SKU, Barcode).
2. Tra cứu ngược danh sách tất cả các NCC cung ứng một sản phẩm (`GET /api/v1/products/{id}/suppliers`) phục vụ màn hình lập đơn đặt hàng (PO).

#### Scenario: Tìm kiếm sản phẩm theo Barcode trong danh mục của Nhà cung cấp
- **GIVEN** NCC "Công ty CP Sữa Vinamilk" đang cung cấp 50 sản phẩm.
- **WHEN** Người dùng gửi request `GET /api/v1/suppliers/{id}/products?SearchTerm=89312345601`.
- **THEN** Hệ thống trả về sản phẩm khớp chính xác Barcode `89312345601` với status `200 OK`.

#### Scenario: Tra cứu các NCC cung ứng khi lập đơn PO cho một sản phẩm
- **GIVEN** Sản phẩm "Gạo ST25" được cung ứng bởi NCC X (giá 180,000, Primary) và NCC Y (giá 185,000).
- **WHEN** Giao diện PO gửi request `GET /api/v1/products/{riceId}/suppliers?OnlyActive=true`.
- **THEN** Hệ thống trả về danh sách gồm cả NCC X và NCC Y, trong đó NCC X có `IsPrimarySupplier` = true.

---

### Requirement: REQ-SP06 Multi-tenant Data Isolation
Hệ thống MUST đảm bảo dữ liệu gán sản phẩm - nhà cung cấp được cô lập tuyệt đối theo `TenantId`. Không một người dùng nào có thể xem hoặc gán sản phẩm giữa các Tenant khác nhau.

#### Scenario: Truy vấn sản phẩm của NCC thuộc Tenant khác bị từ chối
- **GIVEN** Người dùng thuộc Tenant A.
- **WHEN** Gửi request `GET /api/v1/suppliers/{suppTenantBId}/products`.
- **THEN** Hệ thống lọc theo `TenantId = Tenant A` và trả về `404 Not Found`.

---

### Requirement: REQ-SEARCH-01 Multi-Entity Search with Text Highlighting & Multi-Select Tags (FE-09.01)
Thanh tìm kiếm tại màn hình `/store-owner/suppliers` MUST hỗ trợ gợi ý thời gian thực (Real-time Suggestions) với các đặc tả:
1. Khi người dùng nhập ký tự tìm kiếm vào ô input: hiển thị dropdown menu chứa kết quả gợi ý phân thành 4 nhóm rõ ràng:
   - **Nhà cung cấp**: Mã NCC và Tên NCC
   - **Sản phẩm**: Tên sản phẩm, SKU và tên NCC cung ứng tương ứng
   - **Người liên hệ**: Họ tên người đại diện và tên NCC
   - **Số điện thoại**: Số hotline/di động và tên NCC
2. Trong danh sách gợi ý dropdown, tất cả các ký tự/chuỗi con trùng khớp với từ khóa tìm kiếm MUST được highlight nổi bật (màu vàng nhạt hoặc KiotViet blue gạch chân, dễ nhận diện).
3. Người dùng MUST có thể click chọn bất kỳ gợi ý nào để thêm vào danh sách thẻ lọc (Multi-select Tags / Chips).
4. Hệ thống MUST hỗ trợ chọn đồng thời nhiều NCC, nhiều sản phẩm, nhiều người liên hệ và nhiều số điện thoại. Mỗi tag hiển thị nhãn loại (Badge: NCC, SP, Liên hệ, SĐT), giá trị và nút 'x' để xóa.
5. Danh sách thẻ lọc MUST có nút "Xóa tất cả" để hủy bỏ toàn bộ tiêu chí tìm kiếm đa thực thể.
6. Khi có các thẻ tag được chọn, danh sách NCC bảng chính MUST tự động truy vấn lại với các tiêu chí lọc tương ứng (hỗ trợ OR giữa các mục cùng loại, AND giữa các nhóm loại).

#### Scenario: Tìm kiếm và highlight gợi ý
- **GIVEN** Người dùng nhập từ khóa "Hà" vào ô tìm kiếm.
- **WHEN** Hệ thống trả về gợi ý NCC "Công ty Hà Nam", Liên hệ "Trần Văn Hà", Sản phẩm "Sữa chua Hà Lan".
- **THEN** Chuỗi "Hà" trong các kết quả đều được bọc trong thẻ `<mark>` hoặc CSS highlight nổi bật.

#### Scenario: Chọn nhiều thẻ lọc cùng lúc
- **GIVEN** Người dùng click chọn 2 NCC ("NCC A", "NCC B") và 1 sản phẩm ("Bánh gạo").
- **WHEN** Người dùng xác nhận tìm kiếm.
- **THEN** Thanh filter hiển thị 3 tag chips riêng biệt, bảng danh sách lọc đúng các NCC thỏa mãn.

---

### Requirement: REQ-EXPORT-01 Professional Excel Export (FE-09.01)
Chức năng xuất danh sách Nhà cung cấp ra tệp Excel (.xlsx) MUST tuân thủ định dạng bảng biểu báo cáo doanh nghiệp chuyên nghiệp:
1. **Header báo cáo (Metadata Banner)**:
   - Dòng 1: Tên đơn vị / Chi nhánh cửa hàng (In hoa, đậm).
   - Dòng 2: Tiêu đề báo cáo "BÁO CÁO DANH SÁCH NHÀ CUNG CẤP" (Cỡ chữ 16pt, chữ đậm, căn giữa).
   - Dòng 3: Thời gian xuất báo cáo (Định dạng `dd/MM/yyyy HH:mm:ss`) và Người xuất.
2. **Tiêu đề bảng (Table Header Row)**:
   - Nền màu KiotViet Brand Blue (`#0066FF`), màu chữ trắng sáng, in đậm (`font-weight: bold`).
   - Có đường viền kẻ ô (thin borders) cho toàn bộ bảng.
   - Gồm các cột: STT, Mã NCC, Tên Nhà Cung Cấp, Mã Số Thuế, Người Liên Hệ, Số Điện Thoại, Email, Loại NCC, Nhóm Ngành, Địa Chỉ, Trạng Thái.
3. **Căn lề chuẩn (Data Formatting & Alignment)**:
   - Căn giữa: STT, Mã NCC, Mã số thuế, Số điện thoại, Trạng thái.
   - Căn trái: Tên NCC, Người liên hệ, Email, Địa chỉ, Loại NCC, Nhóm ngành.
4. **Tối ưu kích thước cột (Auto Column Widths)**:
   - Độ rộng của từng cột trong file Excel MUST được tính toán tự động dựa trên độ dài lớn nhất của nội dung dòng (kể cả Header) cộng thêm lề an toàn tối thiểu 3-5 ký tự để đảm bảo không có cột nào bị che khuất nội dung hoặc hiển thị `###`.
5. **Quyền hạn**: Nút Xuất Excel chỉ hiển thị và cho phép thao tác đối với Store Owner và Admin.

#### Scenario: Xuất file Excel thành công
- **GIVEN** Store Owner xem danh sách 15 NCC đã lọc theo Loại Hàng hóa (`Goods`).
- **WHEN** Nhấn nút "Xuất Excel".
- **THEN** Trình duyệt tải xuống file `.xlsx` có đầy đủ header báo cáo, tiêu đề bảng màu xanh `#0066FF`, các cột có độ rộng vừa khít nội dung và đúng 15 dòng dữ liệu.

---

### Requirement: REQ-RBAC-01 Two Roles Scope — Store Owner and Branch Employee
Hệ thống MUST map Store Owner = role `STORE_OWNER`\|`ADMIN`; Branch Employee = user có `branchId` và không phải Store Owner. Mọi query MUST lọc `TenantId`. Write (create/update/status/delivery/blackout/branches) MUST Store Owner ở **Application layer** (403 nếu không). Branch Employee MUST chỉ thấy NCC có assignment chứa chi nhánh mình, hoặc NCC không có assignment (dùng chung). GET `{id}` ngoài phạm vi MUST `404` (không 403).

#### Scenario: Store Owner xem toàn Tenant
- **GIVEN** User `STORE_OWNER` Tenant A, 12 NCC.
- **WHEN** `GET /api/v1/suppliers`.
- **THEN** 12 NCC Tenant A, không Tenant B.

#### Scenario: Branch Employee chỉ NCC gán hoặc dùng chung
- **GIVEN** `MANAGER` chi nhánh CN1. X gán CN1, Y gán CN2, Z không assignment.
- **WHEN** `GET /api/v1/suppliers`.
- **THEN** X và Z, không Y. DTO không có `CurrentDebt`.

#### Scenario: Employee mở chi tiết NCC không được phép
- **GIVEN** Employee CN1, NCC Y chỉ gán CN2.
- **WHEN** `GET /api/v1/suppliers/{Y}`.
- **THEN** `404`.

#### Scenario: Employee bị 403 khi tạo/sửa/status
- **GIVEN** Branch Employee.
- **WHEN** POST/PUT/PATCH status.
- **THEN** `403`.

---

### Requirement: REQ-LIST-01 View Supplier List Screen FE-09.01
Màn `/store-owner/suppliers` MUST tìm theo mã, tên, SĐT, MST; hỗ trợ tìm kiếm đa thực thể theo REQ-SEARCH-01; lọc `SupplierType` và `Status`; phân trang server-side. Bảng MUST: mã, tên, người liên hệ, SĐT, trạng thái, hành động. MUST NOT cột công nợ / nút Trả stub. Hỗ trợ nút Xuất Excel chuyên nghiệp theo REQ-EXPORT-01 cho Store Owner. Nút Thêm/Sửa chỉ Store Owner. `SupplierSummaryDto` MUST có `ContactPerson`. API lỗi MUST error banner, MUST NOT `INITIAL_SUPPLIERS`.

#### Scenario: Tìm MST
- **GIVEN** TaxCode `0312345678`.
- **WHEN** search `0312345678`.
- **THEN** trả NCC đó.

#### Scenario: Lọc Goods + Active
- **GIVEN** lẫn type/status.
- **WHEN** Type=Goods, Status=Active.
- **THEN** chỉ Goods Active.

#### Scenario: API lỗi không mock
- **GIVEN** GET `/suppliers` fail.
- **WHEN** list nhận lỗi.
- **THEN** banner lỗi, không mock.

---

### Requirement: REQ-BRANCH-01 Assign Supplier to Branch FE-09.10
Store Owner MUST gán NCC với chi nhánh **cùng Tenant**. `branchIds=[]` = dùng chung. Branch khác Tenant MUST `400`. Đổi gán MUST NOT xóa lịch sử PO/GRN/AP.

#### Scenario: Gán CN1+CN2
- **GIVEN** Store Owner, S1, CN1 CN2 cùng Tenant.
- **WHEN** PUT branches `[CN1,CN2]`.
- **THEN** `200`; Employee CN1 thấy S1; CN3 không.

#### Scenario: Từ chối chi nhánh Tenant khác
- **GIVEN** CN-B Tenant B.
- **WHEN** gán S1 Tenant A với CN-B.
- **THEN** `400`.

#### Scenario: Rỗng = dùng chung
- **GIVEN** S1 đang gán CN1.
- **WHEN** PUT `[]`.
- **THEN** mọi chi nhánh Tenant A dùng S1; PO cũ giữ.

---

### Requirement: REQ-PAY-01 Configure Payment Terms FE-09.06
Store Owner MUST cấu hình PaymentTerms/DueDays (>=0), CreditLimit (>=0), bank fields. CreditLimit là cấu hình, không phải số dư. MUST NOT mặc định chặn PO khi vượt hạn mức. Đổi điều khoản MUST NOT sửa chứng từ cũ.

#### Scenario: Lưu hợp lệ
- **WHEN** DueDays=30, CreditLimit=50000000.
- **THEN** `200`.

#### Scenario: Từ chối âm
- **WHEN** CreditLimit=-1 hoặc DueDays=-5.
- **THEN** `400`.

---

### Requirement: REQ-HIST-01 View Transaction History FE-09.11
Tab lịch sử MUST PO+GRN: mã, chi nhánh, ngày đặt, ngày giao, trạng thái, GRN, tổng nếu được xem. Store Owner Tenant; Employee chỉ chi nhánh mình. Nếu chưa có API PO, tab MUST empty-state thật, không mock PO.

#### Scenario: Employee chỉ PO chi nhánh mình
- **GIVEN** PO CN1 và CN2.
- **WHEN** Employee CN1 mở lịch sử.
- **THEN** chỉ CN1.

---

### Requirement: REQ-AP-VIEW-01 Outstanding Balance Store Owner Only FE-09.12
Store Owner MUST xem phải trả / đã trả / số dư từ ledger (không từ CreditLimit, không từ tổng PO chưa nhận). Branch Employee MUST `403` trên `/ap/summary`. List MUST NOT cột AP cho mọi role.

#### Scenario: Số dư từ ledger
- **GIVEN** phải trả 10tr, đã trả 4tr.
- **WHEN** GET ap/summary Store Owner.
- **THEN** outstanding=6tr.

#### Scenario: Employee 403 AP
- **WHEN** Employee GET ap/summary.
- **THEN** 403; list không cột nợ, không nút Trả.

---

### Requirement: REQ-NORETro-01 No Retroactive Apply
Đổi giá/điều khoản/lịch giao MUST NOT tự sửa PO đã gửi/xác nhận. Apply change này MUST NOT viết code đổi dòng PO; snapshot thuộc FE-05.

#### Scenario: Đổi giá NCC không đụng PO confirmed
- **GIVEN** PO CONFIRMED giá 20.000.
- **WHEN** đổi giá NCC 22.000.
- **THEN** dòng PO 20.000 (không có API trong change này để overwrite).

---

### Requirement: REQ-01 Master Supplier Creation & Code Uniqueness
Chỉ Store Owner tạo. Tên bắt buộc. UI MUST NOT cho nhập mã lúc tạo; backend tự sinh `SUP-{yyyyMMdd}-{seq}` nếu Code trống. Code unique theo Tenant. Tài chính không âm.

#### Scenario: Tạo thành công
- **GIVEN** Store Owner.
- **WHEN** POST Name bắt buộc, Type=Goods, không gửi Code.
- **THEN** 201, Code `SUP-...`, Status Active.

#### Scenario: Trùng mã Tenant
- **THEN** 400 `DUPLICATE_SUPPLIER_CODE`.

#### Scenario: Cùng mã hai Tenant
- **THEN** 201 Tenant B.

---

### Requirement: REQ-03 Soft Inactivation (BR-S03 FE-09.05)
Store Owner chuyển Active/Inactive. Inactive MUST NOT chọn cho PO mới. MUST NOT xóa cứng khi đã có PO hoặc GRN hoặc AP ledger (không chỉ khi CurrentDebt>0). Inactive được phép khi còn nợ; response MUST `openPurchaseOrderCount`. MUST NOT tự hủy PO CONFIRMED. MUST NOT trả `SUPPLIER_HAS_OUTSTANDING_DEBT` khi Inactive.

#### Scenario: Inactive khi còn nợ và PO mở
- **GIVEN** CurrentDebt>0, 2 PO CONFIRMED.
- **WHEN** PATCH Inactive.
- **THEN** 200 Inactive; PO giữ; `openPurchaseOrderCount=2`.

#### Scenario: Từ chối xóa khi có lịch sử
- **GIVEN** đã có PO (dù nợ=0).
- **WHEN** DELETE.
- **THEN** 400, bản ghi còn.

---

### Requirement: REQ-DEL01 Delivery Schedule (BR-S12) — config only
Store Owner cấu hình DeliveryDays, LeadTimeDays>=0, CutoffDayOffset>=0, OrderCutoffTime HH:mm. Tính theo `Asia/Ho_Chi_Minh`. Change này MUST lưu và trả config; MAY trả `EarliestDeliveryDate` tham khảo. **Không** chặn tạo PO trong change này (FE-05).

#### Scenario: Ví dụ T4
- **GIVEN** giao Wed, offset=1, cutoff 17:00.
- **WHEN** delivery 28/10/2026.
- **THEN** hạn chốt 17:00 27/10/2026 TZ VN (ghi trên DTO/docs).

#### Scenario: Đổi cutoff không sửa PO confirmed
- **THEN** ngày giao PO không đổi (không có job rewrite).

---

### Requirement: REQ-DEL02 Blackout Dates (BR-S13)
Store Owner CRUD blackout + lý do. Đơn mới (FE-05) loại ngày này — change này lưu danh sách. MUST NOT tự đổi PO confirmed. Employee không CRUD blackout (403).

#### Scenario: Thêm blackout
- **THEN** 200 lưu ngày + lý do.

#### Scenario: Employee 403 blackout write
- **WHEN** Employee PUT delivery-config kèm blackout mới.
- **THEN** 403.

---

## Lịch sử
- 2026-10-19 · `supplier-product-management` · +6 ~0 -0
- 2026-10-31 · `master-supplier-management` · +9 ~4 -0
