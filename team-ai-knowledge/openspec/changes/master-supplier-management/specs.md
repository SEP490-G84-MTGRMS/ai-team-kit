# Specs: master-supplier-management

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/suppliers` | `QueryParams (SearchTerm, SupplierType, Status, CategoryId, PageIndex, PageSize)` | `PagedResult<SupplierSummaryDto>` | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/v1/suppliers/{id}` | Route `id (Guid)` | `SupplierDetailDto` | `200 OK`, `404 Not Found` |
| `POST` | `/api/v1/suppliers` | `CreateSupplierCommand` | `SupplierDetailDto` | `201 Created`, `400 Bad Request (Duplicate Code/TaxCode)` |
| `PUT` | `/api/v1/suppliers/{id}` | Route `id`, `UpdateSupplierCommand` | `SupplierDetailDto` | `200 OK`, `400 Bad Request (BR-S07 Violation)`, `404 Not Found` |
| `PATCH` | `/api/v1/suppliers/{id}/status` | Route `id`, `UpdateSupplierStatusRequest` | `SupplierDetailDto` | `200 OK`, `400 Bad Request (BR-S03 Guard)`, `404 Not Found` |
| `GET` | `/api/v1/suppliers/{id}/delivery-config` | Route `id (Guid)` | `SupplierDeliveryConfigDto` | `200 OK`, `404 Not Found` |
| `PUT` | `/api/v1/suppliers/{id}/delivery-config` | Route `id`, `UpdateSupplierDeliveryConfigCommand` | `SupplierDeliveryConfigDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/api/v1/suppliers/{id}/ap/ledger` | Route `id`, `FromDate`, `ToDate`, `PageIndex`, `PageSize` | `PagedResult<SupplierAPLedgerDto>` | `200 OK`, `404 Not Found` |
| `POST` | `/api/v1/suppliers/{id}/ap/transactions` | Route `id`, `RecordAPTransactionCommand` | `SupplierAPLedgerDto` | `201 Created`, `400 Bad Request`, `409 Conflict (IdempotencyKey Exists)` |
| `POST` | `/api/v1/suppliers/{id}/link-customer` | Route `id`, `LinkCustomerRequest` | `SupplierDetailDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-01 Master Supplier Creation & Code Uniqueness
Hệ thống MUST cho phép tạo mới hồ sơ Nhà cung cấp với Mã NCC (`Code`) duy nhất trong phạm vi từng Tenant. Nếu không nhập Mã NCC, hệ thống MUST tự động sinh mã theo quy tắc `SUP-{YYYYMMDD}-{XXXX}`.

#### Scenario: Tạo mới Nhà cung cấp hợp lệ thành công (Happy Path)
- **GIVEN** Người dùng có quyền `Owner` hoặc `Accountant` thuộc Tenant A.
- **WHEN** Gửi request `POST /api/v1/suppliers` với thông tin: `Name` = "Công ty Thực phẩm Fresh Farm", `SupplierType` = `Goods` (1), `Phone` = "0901234567", `PaymentTermDays` = 30, `CreditLimit` = 50000000.
- **THEN** Hệ thống lưu NCC vào CSDL với `TenantId` = Tenant A, `CurrentDebt` = 0, `Status` = `Active` (1), tự động sinh `Code` dạng `SUP-...` và trả về `201 Created` kèm `SupplierDetailDto`.

#### Scenario: Tạo mới thất bại do trùng Mã Nhà cung cấp trong cùng Tenant (Edge Case)
- **GIVEN** Trong Tenant A đã tồn tại Nhà cung cấp với `Code` = "SUP-001".
- **WHEN** Người dùng gửi request `POST /api/v1/suppliers` với `Code` = "SUP-001".
- **THEN** Hệ thống từ chối lưu và trả về `400 Bad Request` với mã lỗi `DUPLICATE_SUPPLIER_CODE` và ProblemDetails theo chuẩn RFC 7807.

#### Scenario: Cùng Mã Nhà cung cấp nhưng ở hai Tenant khác nhau (Multi-tenancy Isolation)
- **GIVEN** Tenant A đã có Nhà cung cấp với `Code` = "SUP-001".
- **WHEN** Người dùng thuộc Tenant B gửi request `POST /api/v1/suppliers` tạo NCC với `Code` = "SUP-001".
- **THEN** Hệ thống tạo mới thành công cho Tenant B và trả về `201 Created`.

---

### Requirement: REQ-02 Supplier Type Management & Narrowing Restrictions (BR-S07)
Hệ thống MUST hỗ trợ 3 loại Nhà cung cấp: `Goods` (1 - Hàng hóa), `Service` (2 - Dịch vụ), `Both` (3 - Cả hai). Hệ thống MUST từ chối mọi yêu cầu thu hẹp loại NCC nếu NCC đó đã từng phát sinh giao dịch thuộc loại hình bị thu hẹp.

#### Scenario: Mở rộng loại Nhà cung cấp từ Goods sang Both (Cho phép)
- **GIVEN** Nhà cung cấp "NCC Hàng Khai Anh" đang có `SupplierType` = `Goods` (1) và đã từng phát sinh Đơn nhập hàng (GRN).
- **WHEN** Người dùng gửi request `PUT /api/v1/suppliers/{id}` cập nhật `SupplierType` thành `Both` (3).
- **THEN** Hệ thống cập nhật thành công và trả về `200 OK`.

#### Scenario: Thu hẹp loại Nhà cung cấp từ Both về Goods khi đã từng phát sinh hóa đơn dịch vụ (BR-S07 Violation Guard)
- **GIVEN** Nhà cung cấp "Công ty Tiện ích Green" có `SupplierType` = `Both` (3) và đã từng phát sinh Hóa đơn Dịch vụ Tiện ích (`DocType` = `ServiceInvoice`).
- **WHEN** Người dùng gửi request `PUT /api/v1/suppliers/{id}` cố gắng thu hẹp `SupplierType` về `Goods` (1).
- **THEN** Hệ thống từ chối cập nhật và trả về `400 Bad Request` với thông báo lỗi "Cannot narrow supplier type when historical service transactions exist".

---

### Requirement: REQ-03 Soft Inactivation Guard & Status Transition (BR-S03)
Hệ thống MUST cho phép chuyển trạng thái giữa `Active` (1) và `Inactive` (2). Tuy nhiên, hệ thống MUST từ chối chuyển sang `Inactive` hoặc xóa nếu NCC đang có dư nợ AP (`CurrentDebt` > 0) hoặc đang có Đơn đặt hàng (PO) chưa hoàn tất.

#### Scenario: Chuyển trạng thái Inactive thành công khi không còn công nợ hay PO mở
- **GIVEN** Nhà cung cấp "NCC Rau Củ Quả" có `CurrentDebt` = 0 và không có Đơn đặt hàng PO nào đang ở trạng thái `Pending` / `Approved`.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{id}/status` với `Status` = `Inactive` (2).
- **THEN** Hệ thống cập nhật trạng thái NCC thành `Inactive` và trả về `200 OK`.

#### Scenario: Từ chối chuyển Inactive khi Nhà cung cấp còn dư nợ AP (BR-S03 Guard)
- **GIVEN** Nhà cung cấp "Công ty Đông Lạnh Frozen Food" đang có `CurrentDebt` = 15,000,000 VND.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{id}/status` với `Status` = `Inactive` (2).
- **THEN** Hệ thống từ chối và trả về `400 Bad Request` với mã lỗi `SUPPLIER_HAS_OUTSTANDING_DEBT`.

---

### Requirement: REQ-04 Idempotent AP Ledger & Debt Balance Updates (BR-S08)
Hệ thống MUST ghi nhận mọi biến động nợ AP vào bảng `SupplierAPLedgers` đồng thời cập nhật `CurrentDebt` của NCC trong cùng một Database Transaction. Hệ thống MUST đảm bảo tính Idempotent thông qua `IdempotencyKey`.

#### Scenario: Ghi nhận Hóa đơn nhập hàng tăng nợ AP (Tăng nợ)
- **GIVEN** Nhà cung cấp A có `CurrentDebt` = 10,000,000 VND.
- **WHEN** Gửi request `POST /api/v1/suppliers/{id}/ap/transactions` với `Amount` = 5,000,000, `Direction` = +1 (Increase), `DocType` = `PurchaseInvoice`, `IdempotencyKey` = "GRN-20261010-001".
- **THEN** Hệ thống tạo bản ghi `SupplierAPLedger` với `BalanceAfter` = 15,000,000 VND, cập nhật `CurrentDebt` = 15,000,000 VND cho NCC, và trả về `201 Created`.

#### Scenario: Retry API ghi nhận công nợ bị trùng IdempotencyKey (Idempotent Retry)
- **GIVEN** Bảng `SupplierAPLedgers` đã lưu giao dịch với `IdempotencyKey` = "GRN-20261010-001".
- **WHEN** Client gửi lại request `POST /api/v1/suppliers/{id}/ap/transactions` với cùng `IdempotencyKey` = "GRN-20261010-001".
- **THEN** Hệ thống phát hiện trùng lặp, không cộng thêm tiền vào `CurrentDebt`, và trả về kết quả giao dịch đã tạo trước đó với status `200 OK` (hoặc `409 Conflict` nếu cấu hình strict).

---

### Requirement: REQ-05 Dual-role Customer Linkage & Independent Debt Tracking (BR-S11)
Hệ thống MUST cho phép liên kết một Hồ sơ Nhà cung cấp với một Hồ sơ Khách hàng (`LinkedCustomerId`). Công nợ AP (Phải trả NCC) và AR (Phải thu Khách hàng) MUST duy trì độc lập hoàn toàn, không tự động cấn trừ.

#### Scenario: Liên kết Hồ sơ Khách hàng cho Nhà cung cấp Dual-role thành công
- **GIVEN** Trong hệ thống có Nhà cung cấp "Đại lý Bán lẻ & Cung ứng An Bình" (ID: `Supp-123`) và Hồ sơ Khách hàng "Khách hàng An Bình" (ID: `Cust-456`).
- **WHEN** Người dùng gửi request `POST /api/v1/suppliers/Supp-123/link-customer` với `CustomerId` = `Cust-456`.
- **THEN** Hệ thống lưu `LinkedCustomerId` = `Cust-456` cho NCC `Supp-123` và trả về `200 OK`. Dư nợ AP và dư nợ AR giữ nguyên giá trị riêng biệt.

---

### Requirement: REQ-06 Multi-tenant Data Isolation
Hệ thống MUST đảm bảo dữ liệu Nhà cung cấp, Danh mục NCC, và Sổ cái AP Ledger được cô lập tuyệt đối theo `TenantId`. Người dùng ở Tenant này không được xem hoặc thao tác trên dữ liệu của Tenant khác.

#### Scenario: Truy vấn danh sách Nhà cung cấp bị chặn truy cập cross-tenant
- **GIVEN** Người dùng X thuộc Tenant A.
- **WHEN** Người dùng X gửi request `GET /api/v1/suppliers/Supp-TenantB-999` (thuộc Tenant B).
- **THEN** Hệ thống áp dụng Global Query Filter `TenantId` = Tenant A và trả về `404 Not Found`.

---

### Requirement: REQ-DEL01 Delivery Schedule & Cutoff Time Configuration (BR-S12)
Hệ thống MUST cho phép cấu hình lịch giao hàng chi tiết cho từng Nhà cung cấp hàng hoá (`Goods` hoặc `Both`):
1. **Thời gian chuẩn bị (Lead Time)**: Tính theo giờ hoặc ngày.
2. **Thời gian chốt đơn (Cutoff Time)**: Định dạng `HH:mm` (mặc định 17:00).
3. **Các ngày nhận giao hàng trong tuần (Delivery Weekdays)**: Cho phép chọn Thứ 2 đến Chủ nhật (lưu dưới dạng bitmask).
4. **Quy định đơn hàng tối thiểu**: Giá trị đơn tối thiểu (MOV) và số lượng tối thiểu (MOQ).
5. **Giao hàng hoả tốc (Urgent Delivery)**: Cho phép bật/tắt, cấu hình Lead time hoả tốc và phụ phí % nếu áp dụng.

#### Scenario: Cập nhật lịch giao hàng và Cutoff Time thành công
- **GIVEN** Nhà cung cấp "Công ty Thực phẩm Xanh" (ID: `Supp-Fresh-01`).
- **WHEN** Quản lý kho gửi request `PUT /api/v1/suppliers/Supp-Fresh-01/delivery-config` với `LeadTimeHours` = 24, `CutoffTime` = "16:00", `DeliveryDays` = [Mon, Tue, Wed, Thu, Fri, Sat], `MinOrderValue` = 1,000,000 VND.
- **THEN** Hệ thống lưu cấu hình và trả về `200 OK` kèm `SupplierDeliveryConfigDto`.

#### Scenario: Đơn đặt hàng (PO) tạo sau Cutoff Time tự động tính dời ngày giao
- **GIVEN** NCC có `CutoffTime` = "16:00", `LeadTimeHours` = 24, nhận giao Thứ 2 - Thứ 7 (Nghỉ Chủ nhật).
- **WHEN** Nhân viên tạo đơn PO vào Thứ 6 lúc 16:30 (sau Cutoff Time).
- **THEN** Hệ thống tự động tính ngày giao hàng sớm nhất là Thứ 2 tuần kế tiếp (bỏ qua ngày Chủ nhật không nhận giao).

---

### Requirement: REQ-DEL02 Holidays & Blackout Dates Management (BR-S13)
Hệ thống MUST cho phép quản lý danh sách các kỳ nghỉ lễ, ngày tạm ngưng giao hàng (`Blackout Dates`) của từng Nhà cung cấp trong tab riêng biệt. Các ngày này MUST được tự động loại trừ khi hệ thống tính toán ngày giao hàng khả dụng cho Đơn đặt hàng (PO).

#### Scenario: Thêm kỳ nghỉ lễ cho Nhà cung cấp thành công
- **GIVEN** Nhà cung cấp "Công ty Hải sản Miền Nam".
- **WHEN** Người dùng thêm kỳ nghỉ lễ: `StartDate` = "2026-12-31", `EndDate` = "2027-01-02", `Reason` = "Nghỉ Tết Dương Lịch 2027", `IsRecurringAnnual` = true.
- **THEN** Hệ thống lưu bản ghi vào `SupplierBlackoutDates` và trả về `200 OK`.

#### Scenario: Hệ thống tự động bỏ qua Blackout Date khi tính ngày giao hàng sớm nhất
- **GIVEN** NCC có Blackout Date từ 2026-09-01 đến 2026-09-03 (Nghỉ lễ Quốc khánh).
- **WHEN** Nhân viên tạo đơn PO vào ngày 2026-08-31 với `LeadTimeHours` = 24.
- **THEN** Hệ thống xác định ngày giao hàng sớm nhất là ngày 2026-09-04 (ngày đầu tiên sau kỳ nghỉ lễ mà NCC có nhận giao).

---

## Acceptance checklist

- [ ] **REQ-01**: Tạo mới NCC thành công, tự động sinh mã `SUP-...` khi để trống, bắt lỗi trùng `Code` cùng Tenant.
- [ ] **REQ-02**: Đổi `SupplierType` mở rộng thành công; chặn thu hẹp type (BR-S07) nếu có lịch sử giao dịch tương ứng.
- [ ] **REQ-03**: Đổi trạng thái Active/Inactive; chặn Inactive/Delete (BR-S03) khi còn dư nợ AP hoặc PO mở.
- [ ] **REQ-04**: Ghi nhận biến động AP Ledger chính xác `BalanceAfter`, cập nhật `CurrentDebt`; chống trùng lặp bằng `IdempotencyKey` (BR-S08).
- [ ] **REQ-05**: Liên kết Dual-role `LinkedCustomerId` (BR-S11); giữ công nợ AP và AR độc lập.
- [ ] **REQ-06**: Cô lập tuyệt đối theo `TenantId` trên tất cả API (Query Filter & Authorization).
- [ ] **REQ-DEL01**: Quản lý cấu hình giao hàng (Lead Time, Cutoff Time, Weekdays mask, MOQ/MOV, Urgent Delivery); tự động tính ngày giao hàng khả dụng.
- [ ] **REQ-DEL02**: Quản lý kỳ nghỉ lễ / Blackout dates riêng biệt; tự động bỏ qua ngày nghỉ lễ khi lập kế hoạch giao hàng PO.
