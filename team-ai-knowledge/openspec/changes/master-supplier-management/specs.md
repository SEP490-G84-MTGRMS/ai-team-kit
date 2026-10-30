# Specs: master-supplier-management

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/suppliers` | `SearchTerm`, `SupplierType`, `Status`, `PageIndex`, `PageSize`, `SupplierIds`, `ProductIds`, `ContactPersons`, `Phones` | `PagedResult<SupplierSummaryDto>` (`Code`, `Name`, `ContactPerson`, `Phone`, `TaxCode`, `SupplierType`, `Status`). Không trả `CurrentDebt` cho Branch Employee | `200`, `401` |
| `GET` | `/api/v1/suppliers/search-suggestions` | `query` (chuỗi tìm kiếm), `limit` (số kết quả tối đa, mặc định 10) | `SupplierSearchSuggestionsDto`: danh sách phân nhóm gợi ý (Suppliers, Products, ContactPersons, Phones) | `200`, `401` |
| `GET` | `/api/v1/suppliers/{id}` | Route `id` | `SupplierDetailDto`. Ngoài phạm vi chi nhánh → `404` | `200`, `404` |
| `POST` | `/api/v1/suppliers` | `CreateSupplierCommand` (bỏ qua `Code` nếu trống — hệ thống sinh) | `SupplierDetailDto` | `201`, `400`, `403` |
| `PUT` | `/api/v1/suppliers/{id}` | `UpdateSupplierCommand` (không nhận `Code`) | `SupplierDetailDto` | `200`, `400`, `403`, `404` |
| `PATCH` | `/api/v1/suppliers/{id}/status` | `UpdateSupplierStatusRequest` | `SupplierDetailDto` + `openPurchaseOrderCount` | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/delivery-config` | — | `SupplierDeliveryConfigDto` (`LeadTimeDays`, `CutoffDayOffset`, `OrderCutoffTime`, `DeliveryDays`) | `200`, `404` |
| `PUT` | `/api/v1/suppliers/{id}/delivery-config` | command; `LeadTimeDays>=0`, `CutoffDayOffset>=0`, `OrderCutoffTime` HH:mm | DTO | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/branches` | — | `List<BranchAssignmentDto>` | `200`, `403`, `404` |
| `PUT` | `/api/v1/suppliers/{id}/branches` | `{ branchIds: Guid[] }` rỗng = dùng chung; chỉ Branch cùng Tenant | list | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/transactions` | paging | PO + GRN theo phạm vi chi nhánh | `200`, `403`, `404` |
| `GET` | `/api/v1/suppliers/{id}/ap/summary` | — Store Owner | `totalPayable`, `totalPaid`, `outstandingBalance` | `200`, `403` |

Map role JWT (`UserProfile.role` / claim):
- **Store Owner**: `STORE_OWNER` hoặc `ADMIN`.
- **Branch Employee**: không phải Store Owner và có `branchId` (thường `MANAGER`).

Change này **không** implement tạo/sửa PO. Cutoff được expose qua delivery-config để FE-05 dùng sau.

---

## ADDED Requirements

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

## MODIFIED Requirements

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

## Unchanged Requirements
REQ-02 type narrowing BR-S07; REQ-04 AP ledger idempotency; REQ-05 Dual-role (không hiện trên list); REQ-06 tenant isolation.

---

## Acceptance checklist
- [ ] REQ-SEARCH-01 Gợi ý đa thực thể Real-time + Highlight chữ khớp + Multi-select Tags (NCC, Sản phẩm, Liên hệ, SĐT) + Xóa từng tag / xóa tất cả
- [ ] REQ-EXPORT-01 Xuất Excel (.xlsx) chuẩn doanh nghiệp: Header báo cáo, Tiêu đề màu Brand Blue #0066FF, viền ô, căn lề và tự động tính kích thước cột (Auto Column Widths)
- [ ] REQ-RBAC-01 role map JWT + 404 ngoài phạm vi + 403 write Employee
- [ ] REQ-LIST-01 search MST, filter type+status, cột FE-09.01, không AP/nút Trả stub, không mock
- [ ] REQ-BRANCH-01 gán chi nhánh cùng Tenant; rỗng = dùng chung
- [ ] REQ-PAY-01 điều khoản không âm
- [ ] REQ-HIST-01 lịch sử theo chi nhánh, không mock nếu API trống
- [ ] REQ-AP-VIEW-01 summary Store Owner; list không AP
- [ ] REQ-NORETro-01 không rewrite PO
- [ ] REQ-01 tạo + mã tự sinh
- [ ] REQ-03 Inactive khi còn nợ; không xóa khi có lịch sử
- [ ] REQ-DEL01 lưu cutoff fields; không implement chặn PO
- [ ] REQ-DEL02 blackout Store Owner
- [ ] REQ-02/04/05/06 regression
