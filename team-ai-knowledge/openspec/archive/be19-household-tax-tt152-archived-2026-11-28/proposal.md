# Đề xuất tính năng: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## 1. Vấn đề (Problem Statement)
- Các hệ thống bán lẻ và POS truyền thống thường áp dụng các quy định cũ (Thông tư 40/2021/TT-BTC với ngưỡng miễn thuế 100 triệu đồng/năm) không còn hiệu lực.
- Kể từ ngày 01/01/2026, hệ thống pháp lý thuế đối với Hộ kinh doanh có bước ngoặt quan trọng:
  - **Luật Quản lý thuế số 108/2025/QH15** và **Nghị định 141/2026/NĐ-CP** quy định ngưỡng doanh thu không chịu thuế GTGT và miễn thuế TNCN nâng lên **1.000.000.000 VNĐ/năm** (1 tỷ đồng/năm).
  - Phân loại rõ 4 nhóm Hộ kinh doanh:
    - **Nhóm 1** (Doanh thu năm $\le 1$ tỷ đồng): Miễn thuế GTGT & TNCN (thuế suất 0%).
    - **Nhóm 2** (Doanh thu năm từ 1 tỷ đến 3 tỷ đồng): Nộp thuế theo phương pháp tỷ lệ trên doanh thu (Bán lẻ: GTGT 1%, TNCN 0.5%, tổng 1.5%).
    - **Nhóm 3** (Doanh thu năm từ 3 tỷ đến 50 tỷ đồng): Áp dụng tỷ lệ trên doanh thu hoặc phương pháp kê khai.
    - **Nhóm 4** (Doanh thu năm $> 50$ tỷ đồng): Bắt buộc phương pháp kê khai (doanh thu trừ chi phí hợp lệ) hoặc chuyển đổi thành doanh nghiệp.
  - **Thông tư 152/2025/TT-BTC** chuẩn hóa chế độ kế toán HKD với 4 sổ chi phí trọng yếu:
    - `S2b-HKD`: Sổ chi tiết doanh thu bán hàng hóa, dịch vụ.
    - `S2c-HKD`: Sổ chi tiết chi phí tiền lương, tiền công.
    - `S2d-HKD`: Sổ chi phí vật liệu, dụng cụ, sản phẩm, hàng hóa.
    - `S2e-HKD`: Sổ chi tiết chi phí dịch vụ mua ngoài và chi phí bằng tiền khác.
    - *(Không áp dụng mẫu S3a cho lĩnh vực bán lẻ tạp hóa).*
- Backend hiện tại chưa có dịch vụ tự động hóa việc tính toán thuế HKD theo các văn bản mới nhất này, gây rủi ro thất thoát hoặc kê khai sai cho chủ cửa hàng.

## 2. Mục tiêu (Objectives)
- Xây dựng hệ thống Backend hoàn chỉnh (`HouseholdTaxService`, `HouseholdTaxRepository`, `HouseholdTaxController`) tính toán và trích xuất báo cáo thuế HKD chính xác 100%.
- Tự động xác định nhóm Hộ kinh doanh dựa trên doanh thu lũy kế trong năm tài chính.
- Phân loại và tổng hợp tự động doanh thu bán lẻ thuần (`Orders`) vào sổ `S2b-HKD` và các chi phí hợp lệ (`ExpenseVouchers`) vào 3 sổ chi phí `S2c`, `S2d`, `S2e` theo TT 152/2025/TT-BTC.
- Tự động loại trừ 100% các khoản giao dịch Vốn chủ sở hữu (`CAPITAL`, `EQUITY`) khỏi sổ chi phí thuế.
- Cung cấp API chốt kỳ thuế (Tax Snapshot) theo tháng/quý/năm để phục vụ kê khai và thanh tra thuế.

## 3. Phạm vi (Scope)
### In Scope
- **Domain & DTOs**:
  - `HouseholdTaxGroup` enum (Group1_Under1B, Group2_1BTo3B, Group3_3BTo50B, Group4_Over50B).
  - DTOs báo cáo thuế: `HouseholdTaxSummaryDto`, `TaxVatTncnCalculationDto`, `AccountingBookDto` cho 4 sổ S2b, S2c, S2d, S2e.
  - Snapshot Entity `HouseholdTaxSnapshot` lưu trữ số liệu đã chốt định kỳ.
- **Application & Service**:
  - `IHouseholdTaxService` và `HouseholdTaxService` tính toán thuế dựa trên Doanh thu thuần và Chi phí hợp lệ.
  - Thuật toán phân nhóm HKD dựa trên doanh thu lũy kế năm của Tenant.
  - Phân loại chi phí vận hành sang mã sổ sách TT 152:
    - Loại chi phí `SALARY`, `BONUS` -> `S2c-HKD`
    - Loại chi phí `PACKAGING`, `CONSUMABLES`, `TOOLS` -> `S2d-HKD`
    - Loại chi phí `RENT`, `UTILITIES`, `TELECOM`, `LOGISTICS`, `MARKETING`, `OTHER_EXPENSE` -> `S2e-HKD`
- **Persistence & Repository**:
  - `IHouseholdTaxRepository` và `HouseholdTaxRepository` truy vấn dữ liệu từ `Orders`, `OrderItems`, `ExpenseVouchers` và `HouseholdTaxSnapshots`.
- **API Controller**:
  - `GET /api/v1/tax/household/summary`: Báo cáo tổng hợp thuế và xác định nhóm HKD.
  - `GET /api/v1/tax/household/books`: Trích xuất số liệu 4 sổ kế toán S2b, S2c, S2d, S2e.
  - `POST /api/v1/tax/household/snapshots`: Chốt kỳ tính thuế (Idempotent).
  - `GET /api/v1/tax/household/snapshots`: Xem lịch sử snapshot.
- **Tests**:
  - Unit tests cho các kịch bản ngưỡng doanh thu: $\le 1$ tỷ (thuế = 0), $> 1$ tỷ (thuế 1.5%), và phân loại sổ sách TT 152.
  - Integration tests với DbContext và multi-tenancy.

### Out of Scope
- Giao diện Web Frontend (thuộc package Frontend riêng).
- Tích hợp API trực tiếp cổng điện tử Tổng cục Thuế (dành cho module Hóa đơn điện tử riêng).

## 4. Người dùng liên quan
- **Chủ hộ kinh doanh (Owner/Tenant Admin)**: Xem tổng hợp nghĩa vụ thuế, nhóm HKD, quyết định chốt kỳ thuế.
- **Kế toán trưởng / Kế toán thuế (Accountant)**: Xuất số liệu 4 sổ kế toán TT 152 để nộp cơ quan thuế.
- **Quản lý chi nhánh (Store Manager)**: Theo dõi doanh thu và chi phí hợp lệ của từng chi nhánh.

## 5. Tiêu chí thành công
- 100% công thức tính thuế chính xác theo TT 152/2025/TT-BTC và NĐ 141/2026/NĐ-CP.
- Doanh thu năm $\le 1$ tỷ VNĐ: Thuế GTGT = 0 VNĐ, Thuế TNCN = 0 VNĐ.
- Doanh thu năm $> 1$ tỷ VNĐ: Thuế GTGT = $1\% \times$ Doanh thu bán lẻ chịu thuế, Thuế TNCN = $0.5\% \times$ Doanh thu bán lẻ chịu thuế.
- Tự động chặn và loại trừ toàn bộ chi phí vốn chủ sở hữu (`CAPITAL`, `EQUITY`) khỏi các sổ chi phí thuế.
- Toàn bộ test suite pass 100% với 0 warnings/errors.
