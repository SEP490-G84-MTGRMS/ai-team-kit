# EXP-2026-10-26-BE19: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## 1. Problem Statement
Hệ thống bán lẻ tạp hóa MT-GRMS cần module Backend xử lý nghĩa vụ thuế và trích xuất sổ sách kế toán cho Hộ kinh doanh (HKD) theo khung pháp lý mới nhất áp dụng từ năm 2026:
- **Luật Quản lý thuế 108/2025/QH15** & **Nghị định 141/2026/NĐ-CP**: Nâng mức ngưỡng doanh thu không chịu thuế GTGT và miễn thuế TNCN lên **1.000.000.000 VNĐ/năm**.
- **Thông tư 152/2025/TT-BTC**: Quy định chế độ kế toán HKD với 4 sổ kế toán trọng yếu (`S2b-HKD`, `S2c-HKD`, `S2d-HKD`, `S2e-HKD`), loại bỏ hoàn toàn biểu mẫu `S3a` đối với ngành bán lẻ tạp hóa.
- Yêu cầu hệ thống phải tính toán tự động, chính xác thuế GTGT (1%) và TNCN (0.5%), tự động phân loại chi phí hợp lệ vào đúng sổ sách và loại trừ 100% dòng tiền vốn chủ sở hữu (`CAPITAL`, `EQUITY`).

## 2. Context & Background
- Hệ thống đã hoàn thành các module cốt lõi:
  - `CashbookService` (`FE-17` & `FE-07`): Quản lý phiếu chi `ExpenseVoucher` phân loại theo `ExpenseCategory`.
  - `CustomerDebtService` (`FE-08`): Quản lý công nợ khách hàng và hoàn tiền hàng trả lại.
  - `PnLReportService` (`FE-10`): Quản lý doanh thu thuần (`Orders`), giá vốn COGS và chi phí vận hành OPEX.
- Dữ liệu đầu vào để tính thuế đã có sẵn trong cơ sở dữ liệu, cần một tầng tổng hợp thuế (`HouseholdTaxService`) và lưu trữ chốt kỳ (`HouseholdTaxSnapshot`).

## 3. Constraints
- **Framework & Architecture**: .NET 8, Clean Architecture 4 tầng, EF Core 8 + SQL Server.
- **Multi-Tenancy**: Mọi dữ liệu phải gắn `TenantId` và kế thừa `BaseTenantEntity` với Global Query Filter. Hỗ trợ lọc theo từng `BranchId` hoặc toàn bộ hộ kinh doanh (`All Branches`).
- **Data Precision**: Tiền tệ VND dùng `decimal(18,2)` làm tròn `AwayFromZero`.
- **Integrity**: Không bao giờ phân bổ các khoản chi vốn chủ sở hữu (`CAPITAL`, `EQUITY`) vào các sổ chi phí kế toán `S2c`, `S2d`, `S2e`.

## 4. Assumptions
- **[ASSUMPTION-1]**: Ngành nghề kinh doanh trọng yếu của MT-GRMS là phân phối bán lẻ hàng tiêu dùng/tạp hóa, thuộc nhóm ngành "Phân phối, cung cấp hàng hóa":
  - Tỷ lệ thuế GTGT trên doanh thu tính thuế: **1.0%**.
  - Tỷ lệ thuế TNCN trên doanh thu tính thuế: **0.5%**.
  - Tổng tỷ lệ thuế trên doanh thu tính thuế: **1.5%**.
- **[ASSUMPTION-2]**: Doanh thu lũy kế để phân nhóm HKD được tính từ ngày đầu tiên của năm tài chính (01/01) đến ngày kết thúc của kỳ tính thuế.
- **[ASSUMPTION-3]**: 4 nhóm HKD được phân loại theo doanh thu năm:
  - **Nhóm 1**: $\le 1.000.000.000$ VNĐ $\rightarrow$ Miễn thuế (Thuế = 0).
  - **Nhóm 2**: Từ $1.000.000.001$ đến $3.000.000.000$ VNĐ $\rightarrow$ Thuế khoán/tỷ lệ (1% GTGT + 0.5% TNCN).
  - **Nhóm 3**: Từ $3.000.000.001$ đến $50.000.000.000$ VNĐ $\rightarrow$ Tỷ lệ hoặc Kê khai.
  - **Nhóm 4**: $> 50.000.000.000$ VNĐ $\rightarrow$ Bắt buộc Kê khai.

## 5. Scope & Non-Goals
### In Scope
- Triển khai Entity `HouseholdTaxSnapshot` để lưu kỳ chốt thuế.
- Triển khai Service & Repository tính thuế và trích xuất 4 sổ kế toán TT 152 (`S2b`, `S2c`, `S2d`, `S2e`).
- Mapping tự động các loại `ExpenseCategory` sang sổ TT 152 tương ứng.
- Cung cấp API endpoints cho Frontend xem báo cáo, tra cứu 4 sổ và chốt kỳ snapshot.
- Unit Tests và Integration Tests toàn diện.

### Out of Scope (Non-Goals)
- Không triển khai cổng kết nối XML/JSON trực tiếp với hệ sinh thái Tổng cục Thuế (phần này thuộc chức năng Hóa đơn điện tử riêng).
- Không tự ý sinh bút toán đảo trong sổ thuế (số liệu thuế chỉ đọc từ nguồn `Orders` và `ExpenseVouchers` hoặc đọc từ `Snapshots` đã khóa).

## 6. Giải pháp kiến trúc & So sánh
### Phương án A: Chỉ tính toán động (Pure Real-time Dynamic Calculation)
- **Ưu điểm**: Không cần tạo bảng mới, code nhẹ.
- **Nhược điểm**: Khi kiểm tra lại các kỳ thuế của các năm trước, nếu có thay đổi hoặc xóa chứng từ (mặc dù cấm xóa), số liệu thuế quá khứ sẽ bị lệch so với tờ khai đã nộp cho Chi cục thuế.

### Phương án B (Chọn): Hybrid - Real-time Preview + Immutable Periodic Snapshot
- **Ưu điểm**:
  - Hỗ trợ xem số liệu thời gian thực (Live Preview) cho kỳ thuế hiện tại.
  - Cho phép Kế toán bấm "Chốt kỳ tính thuế" (`POST /snapshots`), hệ thống tạo một bản ghi `HouseholdTaxSnapshot` bất biến kèm JSON chi tiết 4 sổ sách để lưu vết vĩnh viễn phục vụ thanh tra thuế.
- **Nhược điểm**: Cần thêm bảng `HouseholdTaxSnapshots` và migration tương ứng.

## 7. Success Criteria
- Tính đúng 100% thuế GTGT và TNCN: Nếu doanh thu lũy kế $\le 1$ tỷ $\rightarrow$ Thuế = 0; Nếu $> 1$ tỷ $\rightarrow$ Thuế = $1.5\% \times$ Doanh thu tính thuế.
- Trích xuất đầy đủ 4 sổ chi tiết theo đúng cấu trúc mẫu biểu TT 152/2025/TT-BTC.
- Toàn bộ test suite pass 100% với 0 warning/error.
