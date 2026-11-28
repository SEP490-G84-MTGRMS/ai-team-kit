# Đặc tả yêu cầu kỹ thuật: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## ADDED Requirements

### Requirement: REQ-TAX-01 Xác định Ngưỡng Miễn Thuế và Phân Nhóm Hộ Kinh Doanh
Hệ thống MUST tự động phân loại Hộ kinh doanh vào 1 trong 4 nhóm và xác định nghĩa vụ thuế GTGT & TNCN dựa trên doanh thu lũy kế năm tài chính (áp dụng từ 01/01/2026 theo Luật Quản lý thuế số 108/2025/QH15 và Nghị định 141/2026/NĐ-CP):
- **Nhóm 1 (Group1_Under1B)**: Doanh thu năm $\le 1.000.000.000$ VNĐ $\rightarrow$ `IsTaxExempt = true`, `VatRate = 0%`, `PitRate = 0%`, `TotalTaxAmount = 0 VNĐ`.
- **Nhóm 2 (Group2_1BTo3B)**: Doanh thu năm $> 1.000.000.000$ VNĐ và $\le 3.000.000.000$ VNĐ $\rightarrow$ `IsTaxExempt = false`, `VatRate = 1.0%`, `PitRate = 0.5%`. Số thuế tính trên doanh thu tính thuế trong kỳ: `VatAmount = Round(TaxableRevenue * 1%, 2)`, `PitAmount = Round(TaxableRevenue * 0.5%, 2)`.
- **Nhóm 3 (Group3_3BTo50B)**: Doanh thu năm $> 3.000.000.000$ VNĐ và $\le 50.000.000.000$ VNĐ $\rightarrow$ Áp dụng tỷ lệ trên doanh thu hoặc kê khai.
- **Nhóm 4 (Group4_Over50B)**: Doanh thu năm $> 50.000.000.000$ VNĐ $\rightarrow$ Bắt buộc phương pháp kê khai.

#### Scenario: Doanh thu lũy kế dưới 1 tỷ được miễn thuế hoàn toàn
- **GIVEN** Hộ kinh doanh có tổng doanh thu lũy kế năm 2026 là 850.000.000 VNĐ (dưới 1 tỷ VNĐ)
- **WHEN** Kế toán yêu cầu báo cáo thuế Quý 3/2026 với doanh thu trong quý là 300.000.000 VNĐ
- **THEN** Hệ thống xếp vào Nhóm 1 (`Group1_Under1B`), `IsTaxExempt = true`, thuế GTGT = 0 VNĐ, thuế TNCN = 0 VNĐ, tổng thuế phải nộp = 0 VNĐ.

#### Scenario: Doanh thu lũy kế vượt 1 tỷ phải nộp thuế theo tỷ lệ bán lẻ
- **GIVEN** Hộ kinh doanh có tổng doanh thu lũy kế năm 2026 là 1.500.000.000 VNĐ (vượt 1 tỷ VNĐ)
- **WHEN** Kế toán yêu cầu báo cáo thuế Quý 4/2026 với doanh thu trong quý là 400.000.000 VNĐ
- **THEN** Hệ thống xếp vào Nhóm 2 (`Group2_1BTo3B`), `IsTaxExempt = false`, thuế GTGT phải nộp = 4.000.000 VNĐ (1%), thuế TNCN phải nộp = 2.000.000 VNĐ (0.5%), tổng thuế phải nộp = 6.000.000 VNĐ.

---

### Requirement: REQ-TAX-02 Tính Thuế Đa Kỳ và Đa Chi Nhánh
Hệ thống MUST hỗ trợ tính toán báo cáo thuế theo:
- Kỳ tính thuế (`PeriodType`): Tháng (1-12), Quý (1-4), hoặc Cả Năm.
- Chi nhánh (`BranchId`): Nếu có `BranchId`, chỉ tính số liệu phát sinh tại chi nhánh đó; nếu `BranchId == null`, tổng hợp toàn bộ các chi nhánh thuộc Tenant.
- Doanh thu tính thuế trong kỳ: `TaxableRevenue = GrossRevenue - TotalDiscounts - TotalReturns`.

#### Scenario: Tổng hợp thuế toàn bộ chi nhánh của hộ kinh doanh
- **GIVEN** Hộ kinh doanh có Chi nhánh 1 (doanh thu 200M) và Chi nhánh 2 (doanh thu 300M) trong Tháng 1/2026
- **WHEN** Chủ cửa hàng truy vấn thuế với `BranchId = null`
- **THEN** Hệ thống trả về `TaxableRevenueInPeriod = 500.000.000 VNĐ` kèm thông tin tổng hợp của cả 2 chi nhánh.

---

### Requirement: REQ-TAX-03 Tự Động Phân Loại 4 Sổ Kế Toán Theo Thông Tư 152/2025/TT-BTC
Hệ thống MUST phân loại chính xác các chứng từ phát sinh vào 4 sổ kế toán HKD:
1. **Sổ `S2b-HKD`**: Sổ chi tiết doanh thu bán hàng hóa, dịch vụ (Lấy từ các hóa đơn bán hàng thành công `Orders`).
2. **Sổ `S2c-HKD`**: Sổ chi tiết chi phí tiền lương, tiền công (Lấy từ phiếu chi `ExpenseVouchers` thuộc danh mục `SALARY`, `WAGES`, `BONUS`, `ALLOWANCE`).
3. **Sổ `S2d-HKD`**: Sổ chi phí vật liệu, dụng cụ, sản phẩm, hàng hóa (Lấy từ phiếu chi danh mục `PACKAGING`, `CONSUMABLES`, `TOOLS`, `SUPPLIES`).
4. **Sổ `S2e-HKD`**: Sổ chi tiết chi phí dịch vụ mua ngoài và chi phí bằng tiền khác (Lấy từ phiếu chi danh mục `RENT`, `UTILITIES`, `ELECTRICITY`, `WATER`, `INTERNET`, `TELECOM`, `LOGISTICS`, `MARKETING`, `MAINTENANCE`, `OTHER_EXPENSE`).
5. **Loại trừ Vốn chủ sở hữu**: Hệ thống MUST loại trừ 100% các phiếu chi thuộc loại `EQUITY` hoặc `CAPITAL` (như rút vốn chủ, trả cổ tức, hoàn vốn) khỏi cả 3 sổ chi phí S2c, S2d, S2e.

#### Scenario: Phiếu chi tiền lương được đưa vào sổ S2c-HKD
- **GIVEN** Một phiếu chi đã duyệt số PC-001 trị giá 15.000.000 VNĐ thuộc danh mục "Lương nhân viên ca sáng" (`SALARY`)
- **WHEN** Trích xuất danh sách chứng từ sổ `S2c-HKD`
- **THEN** Phiếu chi PC-001 hiển thị trong sổ `S2c-HKD` với số tiền 15.000.000 VNĐ.

#### Scenario: Rút vốn chủ sở hữu không được ghi vào sổ chi phí thuế
- **GIVEN** Một phiếu chi đã duyệt số PC-002 trị giá 50.000.000 VNĐ thuộc danh mục "Chủ hộ rút vốn" (`EQUITY`)
- **WHEN** Trích xuất các sổ `S2c-HKD`, `S2d-HKD`, `S2e-HKD`
- **THEN** Phiếu chi PC-002 tuyệt đối KHÔNG xuất hiện trong bất kỳ sổ chi phí nào và không được tính vào tổng chi phí hợp lệ.

---

### Requirement: REQ-TAX-04 Đóng Băng và Lưu Trữ Kỳ Tính Thuế (Tax Snapshot)
Hệ thống MUST cung cấp chức năng chốt kỳ tính thuế bất biến (`HouseholdTaxSnapshot`):
- Khi kế toán chốt kỳ (`POST /snapshots`), hệ thống chụp lại trạng thái toàn bộ số liệu thuế và snapshot 4 sổ sách kế toán dưới dạng JSON (`BookDataJson`).
- Bản ghi snapshot là bất biến (Read-only), đảm bảo tính toàn vẹn khi cơ quan thuế thanh tra sau này.
- Hệ thống MUST chặn chốt trùng lặp kỳ tính thuế cho cùng một `(TenantId, BranchId, PeriodType, Year, PeriodNumber)` bằng Unique Constraint.

#### Scenario: Chốt kỳ tính thuế thành công
- **GIVEN** Kỳ tính thuế Quý 1/2026 của Tenant A chưa được chốt
- **WHEN** Kế toán gửi yêu cầu `POST /api/v1/tax/household/snapshots` với kỳ Quý 1/2026 và ghi chú "Đã đối chiếu với tờ khai thuế"
- **THEN** Hệ thống tạo bản ghi `HouseholdTaxSnapshot`, gán `IsFinalized = true` và lưu toàn bộ JSON dữ liệu 4 sổ sách.

#### Scenario: Chặn chốt trùng kỳ tính thuế đã khóa
- **GIVEN** Kỳ tính thuế Quý 1/2026 của Tenant A đã được chốt trước đó
- **WHEN** Kế toán gửi lại yêu cầu chốt kỳ Quý 1/2026
- **THEN** Hệ thống từ chối yêu cầu và trả về lỗi xung đột (HTTP 409 Conflict) với thông báo kỳ tính thuế đã được chốt.

---

### Requirement: REQ-TAX-05 Multi-Tenancy và Phân Quyền Bảo Mật
- Hệ thống MUST tự động áp dụng Global Query Filter theo `TenantId` cho mọi truy vấn liên quan đến thuế và sổ kế toán.
- Chỉ người dùng có vai trò `Owner` hoặc `Accountant` mới được phép chốt kỳ snapshot hoặc xem dữ liệu của toàn Tenant.

---

## Tiêu chí chấp nhận (Acceptance Checklist)
- [ ] Xác định đúng 4 nhóm HKD theo doanh thu năm lũy kế.
- [ ] Doanh thu lũy kế $\le 1$ tỷ: Thuế = 0 VNĐ.
- [ ] Doanh thu lũy kế $> 1$ tỷ: GTGT = 1%, TNCN = 0.5%.
- [ ] Phân bổ đúng 4 sổ kế toán TT 152 (`S2b`, `S2c`, `S2d`, `S2e`).
- [ ] Loại bỏ 100% chi phí Vốn chủ sở hữu (`EQUITY`) khỏi các sổ chi phí.
- [ ] Tạo và truy xuất Snapshot thành công, chặn trùng lặp kỳ.
- [ ] 100% test pass.
