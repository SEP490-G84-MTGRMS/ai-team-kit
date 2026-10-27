# Specs: master-supplier-management

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/suppliers` | `SearchTerm`, `SupplierType`, `Status`, `PageIndex`, `PageSize` | `PagedResult<SupplierSummaryDto>` (`Code`, `Name`, `ContactPerson`, `Phone`, `Status`; `CurrentDebt` chỉ Store Owner) | `200`, `401` |
| `GET` | `/api/v1/suppliers/{id}` | Route `id` | `SupplierDetailDto` | `200`, `404` |
| `POST` | `/api/v1/suppliers` | `CreateSupplierCommand` | `SupplierDetailDto` | `201`, `400`, `403` |
| `PUT` | `/api/v1/suppliers/{id}` | `UpdateSupplierCommand` (không nhận `Code`) | `SupplierDetailDto` | `200`, `400`, `403`, `404` |
| `PATCH` | `/api/v1/suppliers/{id}/status` | `UpdateSupplierStatusRequest` | `SupplierDetailDto` + cảnh báo `openPurchaseOrderCount` | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/delivery-config` | — | `SupplierDeliveryConfigDto` (`LeadTimeDays`, `CutoffDayOffset`, `OrderCutoffTime`, `DeliveryDays`) | `200`, `404` |
| `PUT` | `/api/v1/suppliers/{id}/delivery-config` | `UpdateSupplierDeliveryConfigCommand` | `SupplierDeliveryConfigDto` | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/branches` | — | `List<BranchAssignmentDto>` | `200`, `403`, `404` |
| `PUT` | `/api/v1/suppliers/{id}/branches` | `{ branchIds: Guid[] }` rỗng = dùng chung | `List<BranchAssignmentDto>` | `200`, `400`, `403` |
| `GET` | `/api/v1/suppliers/{id}/transactions` | `PageIndex`, `PageSize` | Paged PO + GRN theo phạm vi chi nhánh | `200`, `403`, `404` |
| `GET` | `/api/v1/suppliers/{id}/ap/summary` | — | `totalPayable`, `totalPaid`, `outstandingBalance`, `due`/`overdue` | `200`, `403` |
| `GET` | `/api/v1/suppliers/{id}/ap/ledger` | `FromDate`, `ToDate`, paging | `PagedResult<SupplierAPLedgerDto>` | `200`, `403`, `404` |

---

## ADDED Requirements

### Requirement: REQ-RBAC-01 Two Roles Scope — Store Owner and Branch Employee
Hệ thống MUST chỉ dùng hai role trên màn FE-09: `StoreOwner` (toàn Tenant) và `BranchEmployee` (NCC được phép tại chi nhánh được phân công). Mọi query MUST lọc `TenantId`. Branch Employee MUST NOT xem NCC Tenant khác hoặc NCC không được gán (trừ NCC dùng chung khi không có assignment).

#### Scenario: Store Owner xem toàn bộ NCC Tenant
- **GIVEN** User role `StoreOwner` thuộc Tenant A có 12 NCC.
- **WHEN** `GET /api/v1/suppliers`.
- **THEN** Trả về toàn bộ NCC Tenant A, không gồm Tenant B.

#### Scenario: Branch Employee chỉ thấy NCC được phép tại chi nhánh
- **GIVEN** Branch Employee chi nhánh CN1. NCC X gán CN1, NCC Y gán CN2, NCC Z không có assignment (dùng chung).
- **WHEN** `GET /api/v1/suppliers`.
- **THEN** Kết quả gồm X và Z, không gồm Y.

#### Scenario: Branch Employee bị từ chối tạo/sửa/đổi trạng thái
- **GIVEN** Branch Employee.
- **WHEN** `POST /api/v1/suppliers` hoặc `PUT` hoặc `PATCH .../status`.
- **THEN** `403 Forbidden`.

---

### Requirement: REQ-LIST-01 View Supplier List Screen FE-09.01
Màn `/store-owner/suppliers` MUST hỗ trợ tìm theo mã NCC, tên, SĐT, MST; lọc loại NCC và trạng thái; phân trang server-side. Bảng MUST hiển thị mã, tên, người liên hệ, SĐT, trạng thái. Khi API lỗi MUST hiện error, MUST NOT render mock như dữ liệu thật. `SupplierSummaryDto` MUST gồm `ContactPerson`.

#### Scenario: Tìm theo MST thành công
- **GIVEN** NCC có `TaxCode` = "0312345678".
- **WHEN** User search `0312345678`.
- **THEN** List trả về NCC đó (`200`).

#### Scenario: Lọc loại Hàng hóa và trạng thái Active
- **GIVEN** Danh sách lẫn Goods/Service, Active/Inactive.
- **WHEN** `SupplierType=Goods` và `Status=Active`.
- **THEN** Chỉ NCC Goods + Active.

#### Scenario: API lỗi không fallback mock
- **GIVEN** `GET /api/v1/suppliers` thất bại.
- **WHEN** `SupplierListPage` nhận lỗi.
- **THEN** Hiện thông báo lỗi; bảng empty hoặc giữ trang lỗi; không đổ `INITIAL_SUPPLIERS`.

---

### Requirement: REQ-BRANCH-01 Assign Supplier to Branch FE-09.10
Hệ thống MUST cho Store Owner gán NCC với chi nhánh cùng Tenant. Không có assignment MUST hiểu là dùng chung. Đổi assignment MUST NOT xóa PO/GRN/công nợ lịch sử. Tenant một chi nhánh MAY tự gán chi nhánh duy nhất.

#### Scenario: Gán hai chi nhánh thành công
- **GIVEN** Store Owner, NCC S1, chi nhánh CN1 và CN2 cùng Tenant.
- **WHEN** `PUT /api/v1/suppliers/{S1}/branches` với `[CN1, CN2]`.
- **THEN** `200`; Branch Employee CN1 thấy S1, CN3 không thấy.

#### Scenario: Từ chối gán chi nhánh Tenant khác
- **GIVEN** CN-B thuộc Tenant B.
- **WHEN** Gán S1 Tenant A với CN-B.
- **THEN** `400` không lưu.

#### Scenario: Xóa hết assignment = dùng chung
- **GIVEN** S1 đang gán CN1.
- **WHEN** `PUT .../branches` với `[]`.
- **THEN** Mọi chi nhánh Tenant A dùng được S1; lịch sử PO cũ giữ nguyên.

---

### Requirement: REQ-PAY-01 Configure Payment Terms FE-09.06
Store Owner MUST cấu hình `PaymentTerms`, `PaymentDueDays` (>=0), `CreditLimit` (>=0), `BankName`, `BankAccountNumber`, `BankAccountName`. `CreditLimit` MUST là cấu hình, không phải số dư. Vượt hạn mức MUST NOT mặc định chặn PO. Đổi điều khoản MUST NOT sửa chứng từ đã phát sinh.

#### Scenario: Lưu điều khoản hợp lệ
- **GIVEN** Store Owner mở tab Payment Terms.
- **WHEN** `PaymentDueDays=30`, `CreditLimit=50000000`, ngân hàng hợp lệ.
- **THEN** `200`, cấu hình được lưu.

#### Scenario: Từ chối giá trị âm
- **GIVEN** Store Owner.
- **WHEN** `CreditLimit=-1` hoặc `PaymentDueDays=-5`.
- **THEN** `400`, không lưu.

---

### Requirement: REQ-HIST-01 View Transaction History FE-09.11
Hệ thống MUST hiển thị lịch sử PO và GRN: mã PO, chi nhánh, ngày đặt, ngày giao dự kiến, trạng thái, thông tin nhận hàng, tổng giá trị nếu được phép. Store Owner xem phạm vi Tenant; Branch Employee chỉ chi nhánh mình. MUST NOT hiện Tenant khác.

#### Scenario: Branch Employee chỉ thấy PO chi nhánh mình
- **GIVEN** PO của CN1 và CN2 cùng NCC.
- **WHEN** Branch Employee CN1 mở tab lịch sử.
- **THEN** Chỉ PO/GRN CN1.

---

### Requirement: REQ-AP-VIEW-01 Outstanding Balance Store Owner Only FE-09.12
Hệ thống MUST cho Store Owner xem tổng phải trả, đã trả, số dư, khoản đến hạn/quá hạn từ ledger/hóa đơn/nhận hàng/thanh toán — MUST NOT lấy từ `CreditLimit` hay tổng giá trị PO chưa xét nhận hàng. Branch Employee MUST NOT xem công nợ tổng hợp Tenant. List MUST ẩn cột AP và nút trả nợ với Branch Employee.

#### Scenario: Store Owner xem số dư từ ledger
- **GIVEN** Phải trả 10tr, đã trả 4tr trên ledger.
- **WHEN** `GET /api/v1/suppliers/{id}/ap/summary`.
- **THEN** `outstandingBalance=6000000`.

#### Scenario: Branch Employee bị từ chối AP summary
- **GIVEN** Branch Employee.
- **WHEN** `GET /api/v1/suppliers/{id}/ap/summary`.
- **THEN** `403`; UI list không cột Đang nợ / Quá hạn, không nút Trả.

---

### Requirement: REQ-NORETro-01 No Retroactive Apply On Confirmed Documents FE-09.04/07/09
Cập nhật hồ sơ NCC, giá nhập, điều khoản, lịch giao MUST NOT tự áp lên PO đã gửi hoặc đã xác nhận. Giá trên PO MUST là snapshot lúc đặt.

#### Scenario: Đổi giá NCC không đổi giá dòng PO đã xác nhận
- **GIVEN** PO CONFIRMED giá 20.000.
- **WHEN** Store Owner đổi giá NCC thành 22.000.
- **THEN** Dòng PO vẫn 20.000.

---

## MODIFIED Requirements

### Requirement: REQ-01 Master Supplier Creation & Code Uniqueness
Hệ thống MUST cho Store Owner tạo NCC. Tên MUST bắt buộc. Mã NCC MUST hệ thống tự sinh, duy nhất trong Tenant (`SUP-{YYYYMMDD}-{XXXX}` nếu user không nhập lúc tạo). Trường tài chính MUST NOT âm. Chỉ Store Owner được tạo.

#### Scenario: Tạo mới hợp lệ
- **GIVEN** Store Owner Tenant A.
- **WHEN** `POST /api/v1/suppliers` với `Name` bắt buộc, `SupplierType=Goods`.
- **THEN** `201`, `Code` dạng `SUP-...`, `Status=Active`, ghi nhận người tạo.

#### Scenario: Trùng mã cùng Tenant
- **GIVEN** Đã có `Code=SUP-001` Tenant A.
- **WHEN** Tạo với cùng mã.
- **THEN** `400` mã `DUPLICATE_SUPPLIER_CODE` (RFC 7807).

#### Scenario: Cùng mã hai Tenant
- **GIVEN** Tenant A có `SUP-001`.
- **WHEN** Tenant B tạo `SUP-001`.
- **THEN** `201` cho Tenant B.

---

### Requirement: REQ-03 Soft Inactivation Guard & Status Transition (BR-S03)
Hệ thống MUST cho Store Owner chuyển Active/Inactive. NCC Inactive MUST NOT được chọn cho PO mới. Hệ thống MUST NOT xóa cứng NCC đã có lịch sử. Ngừng hoạt động MUST NOT xóa PO/GRN/công nợ. Nếu còn PO đang xử lý, hệ thống MUST cảnh báo (`openPurchaseOrderCount`) và MUST NOT tự hủy đơn đã xác nhận. Cho phép Inactive khi còn dư nợ (có cảnh báo).

#### Scenario: Inactive thành công kèm cảnh báo PO mở
- **GIVEN** NCC có 2 PO CONFIRMED chưa hoàn tất và `CurrentDebt>0`.
- **WHEN** Store Owner `PATCH .../status` Inactive sau confirm.
- **THEN** `200`, `Status=Inactive`, PO CONFIRMED giữ nguyên, response có `openPurchaseOrderCount=2`.

#### Scenario: Inactive không dùng cho PO mới
- **GIVEN** NCC Inactive.
- **WHEN** Tạo PO mới chọn NCC này.
- **THEN** Hệ thống từ chối chọn NCC Inactive.

#### Scenario: Từ chối xóa cứng khi đã có lịch sử
- **GIVEN** NCC đã có PO hoặc GRN hoặc AP ledger.
- **WHEN** `DELETE /api/v1/suppliers/{id}`.
- **THEN** `400`, dữ liệu giữ nguyên.

---

### Requirement: REQ-DEL01 Delivery Schedule & Cutoff Time Configuration (BR-S12)
Hệ thống MUST cho Store Owner cấu hình `DeliveryDays`, `LeadTimeDays`, `CutoffDayOffset`, `OrderCutoffTime`. Thời điểm chốt MUST tính theo `Asia/Ho_Chi_Minh`. Tại hoặc sau giờ chốt của ngày (`deliveryDate - CutoffDayOffset`) hệ thống MUST NOT cho tạo/sửa đơn thường cho ngày giao đó. `LeadTimeDays` MUST chỉ mô tả thời gian dự kiến, không thay cutoff. Đổi cấu hình MUST NOT tự sửa PO đã gửi/xác nhận.

#### Scenario: Ví dụ chốt đơn T4
- **GIVEN** Giao Thứ Tư, `CutoffDayOffset=1`, `OrderCutoffTime=17:00`.
- **WHEN** Ngày giao 28/10/2026 (Thứ Tư).
- **THEN** Hạn chốt = 17:00 ngày 27/10/2026 (`Asia/Ho_Chi_Minh`).

#### Scenario: Sau cutoff không tạo đơn thường
- **GIVEN** Cấu hình như trên; hiện tại 27/10/2026 17:00 trở đi.
- **WHEN** User tạo PO thường cho giao 28/10/2026.
- **THEN** Hệ thống từ chối; không tự dời ngày giao.

#### Scenario: Đổi cutoff không sửa PO đã xác nhận
- **GIVEN** PO CONFIRMED giao 28/10.
- **WHEN** Store Owner đổi `OrderCutoffTime`.
- **THEN** Ngày giao PO giữ 28/10.

---

### Requirement: REQ-DEL02 Holidays & Blackout Dates Management (BR-S13)
Hệ thống MUST cho Store Owner thêm/xem/sửa ngày không giao kèm lý do. Đơn mới MUST loại blackout khỏi ngày giao hợp lệ. MUST NOT tự đổi ngày giao đơn đã xác nhận. Chỉ Store Owner quản lý blackout.

#### Scenario: Thêm blackout thành công
- **GIVEN** Store Owner, NCC hàng hóa.
- **WHEN** Thêm ngày 2026-12-31, lý do "Nghỉ Tết".
- **THEN** Lưu `SupplierBlackoutDates`, `200`.

#### Scenario: Đơn mới không đề xuất ngày blackout
- **GIVEN** Blackout 2026-09-02.
- **WHEN** Lấy danh sách ngày giao hợp lệ cho PO mới.
- **THEN** Không gồm 2026-09-02.

#### Scenario: Không tự đổi PO đã xác nhận
- **GIVEN** PO CONFIRMED giao đúng ngày sau đó bị khai blackout.
- **WHEN** Store Owner lưu blackout.
- **THEN** Ngày giao PO không đổi; hệ thống có thể cảnh báo.

---

## Unchanged Requirements (giữ nguyên từ bản Apply trước)

REQ-02 Supplier Type narrowing (BR-S07), REQ-04 AP Ledger idempotency (BR-S08), REQ-05 Dual-role linkage (BR-S11), REQ-06 tenant isolation — giữ hành vi đã Implement; Dual-role không phải thao tác chính trên list FE-09.

---

## Acceptance checklist

- [ ] **REQ-RBAC-01**: Store Owner thấy toàn Tenant; Branch Employee chỉ NCC gán/dùng chung; 403 khi Employee tạo/sửa/status.
- [ ] **REQ-LIST-01**: Search mã/tên/SĐT/MST; filter loại + trạng thái; cột mã/tên/liên hệ/SĐT/trạng thái; `ContactPerson` trên DTO; không fallback mock.
- [ ] **REQ-BRANCH-01**: Gán chi nhánh cùng Tenant; rỗng = dùng chung; không xóa lịch sử.
- [ ] **REQ-PAY-01**: Điều khoản + ngân hàng; không âm; Credit Limit không chặn PO mặc định.
- [ ] **REQ-HIST-01**: Lịch sử PO/GRN theo phạm vi chi nhánh.
- [ ] **REQ-AP-VIEW-01**: Store Owner xem số dư từ ledger; Employee 403 + ẩn cột AP trên list.
- [ ] **REQ-NORETro-01**: Đổi giá/điều khoản/lịch giao không áp ngược PO đã xác nhận.
- [ ] **REQ-01**: Tạo NCC, mã tự sinh, unique theo Tenant.
- [ ] **REQ-03**: Inactive không dùng PO mới; cảnh báo PO mở; không tự hủy; không xóa cứng khi có lịch sử.
- [ ] **REQ-DEL01**: CutoffDayOffset + timezone VN; sau cutoff không tạo đơn thường.
- [ ] **REQ-DEL02**: Blackout loại khỏi ngày giao mới; không tự sửa PO xác nhận.
- [ ] **REQ-02 / REQ-04 / REQ-05 / REQ-06**: Giữ regression.
