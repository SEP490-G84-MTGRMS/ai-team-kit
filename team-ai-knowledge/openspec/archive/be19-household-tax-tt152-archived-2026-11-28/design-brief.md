# Bản thiết kế chi tiết: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## 1. Luồng nghiệp vụ & API Flow
1. **Truy vấn Tổng hợp Thuế (Live Summary)**:
   - Client gọi `GET /api/v1/tax/household/summary?year=2026&quarter=1&branchId=...`
   - Controller uỷ quyền cho `HouseholdTaxService.GetTaxSummaryAsync()`.
   - Service gọi `HouseholdTaxRepository` để tính:
     - Tổng doanh thu lũy kế năm của Tenant (từ 01/01/year đến ngày cuối của kỳ).
     - Xác định Nhóm HKD (`Nhóm 1` nếu $\le 1$ tỷ, `Nhóm 2` nếu $1$ tỷ - $3$ tỷ,...).
     - Doanh thu bán lẻ thuần trong kỳ (`NetRevenue` = `GrossRevenue` - `Discount` - `Return`).
     - Nghĩa vụ thuế:
       - Nếu Nhóm 1: `VatAmount = 0`, `PitAmount = 0` (Miễn thuế).
       - Nếu Nhóm 2+: `VatAmount = NetRevenue * 1%`, `PitAmount = NetRevenue * 0.5%`.
     - Tổng hợp số phát sinh của 4 sổ kế toán TT 152:
       - `S2b`: Tổng doanh thu bán hàng hóa.
       - `S2c`: Tổng chi phí tiền lương, tiền công.
       - `S2d`: Tổng chi phí vật liệu, dụng cụ, hàng hóa.
       - `S2e`: Tổng chi phí dịch vụ mua ngoài và chi phí bằng tiền khác.
2. **Truy vấn Chi tiết Sổ Kế Toán (Accounting Book Details)**:
   - Client gọi `GET /api/v1/tax/household/books?year=2026&periodType=Quarter&periodNumber=1&bookType=S2b`
   - Trả về danh sách chứng từ, ngày phát sinh, nội dung, số tiền phát sinh theo định dạng chuẩn của Thông tư 152/2025/TT-BTC.
3. **Chốt kỳ tính thuế (Finalize Tax Snapshot)**:
   - Kế toán / Chủ hộ bấm "Chốt kỳ tính thuế" $\rightarrow$ `POST /api/v1/tax/household/snapshots`.
   - Hệ thống kiểm tra xem kỳ này đã được chốt chưa (Idempotency).
   - Đóng băng số liệu tính toán và serialize toàn bộ dữ liệu 4 sổ vào cột `BookDataJson`.
   - Lưu trữ bản ghi bất biến `HouseholdTaxSnapshot`.
4. **Xem lịch sử Snapshot**:
   - Client gọi `GET /api/v1/tax/household/snapshots`.

## 2. API Endpoints & DTOs
### Endpoints
- `GET /api/v1/tax/household/summary`: Lấy tóm tắt thuế và nhóm HKD theo kỳ.
- `GET /api/v1/tax/household/books`: Xem chi tiết chứng từ của từng sổ TT 152 (S2b, S2c, S2d, S2e).
- `POST /api/v1/tax/household/snapshots`: Chốt kỳ tính thuế (Yêu cầu quyền Owner/Accountant).
- `GET /api/v1/tax/household/snapshots`: Lấy danh sách các kỳ đã chốt thuế.
- `GET /api/v1/tax/household/snapshots/{id}`: Xem chi tiết kỳ thuế đã chốt.

### Data Transfer Objects (DTOs)
```csharp
public enum TaxPeriodType { Month = 1, Quarter = 2, Year = 3 }
public enum HouseholdTaxGroup 
{ 
    Group1_Under1B = 1, // <= 1B VND: Exempt
    Group2_1BTo3B = 2,  // 1B - 3B VND: 1% VAT, 0.5% PIT
    Group3_3BTo50B = 3, // 3B - 50B VND: Revenue % or Declaration
    Group4_Over50B = 4  // > 50B VND: Mandatory Declaration
}

public class HouseholdTaxSummaryDto
{
    public int Year { get; set; }
    public TaxPeriodType PeriodType { get; set; }
    public int PeriodNumber { get; set; }
    public Guid? BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public decimal AnnualAccumulatedRevenue { get; set; }
    public HouseholdTaxGroup HouseholdGroup { get; set; }
    public string HouseholdGroupName { get; set; } = string.Empty;
    public bool IsTaxExempt { get; set; }
    public decimal TaxableRevenueInPeriod { get; set; }
    public decimal VatRate { get; set; } // 1.0% or 0%
    public decimal VatAmount { get; set; }
    public decimal PitRate { get; set; } // 0.5% or 0%
    public decimal PitAmount { get; set; }
    public decimal TotalTaxAmount { get; set; }
    public TaxBooksSummaryDto BooksSummary { get; set; } = new();
    public bool IsFinalized { get; set; }
    public Guid? SnapshotId { get; set; }
}

public class TaxBooksSummaryDto
{
    public decimal S2bTotalRevenue { get; set; } // Doanh thu bán hàng
    public decimal S2cTotalSalary { get; set; }  // Chi phí tiền lương, công
    public decimal S2dTotalSupplies { get; set; } // Chi phí vật tư, bao bì, công cụ
    public decimal S2eTotalServices { get; set; } // Chi phí dịch vụ mua ngoài
    public decimal TotalDeductibleExpenses => S2cTotalSalary + S2dTotalSupplies + S2eTotalServices;
}

public class AccountingBookEntryDto
{
    public string VoucherNumber { get; set; } = string.Empty;
    public DateTime VoucherDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string BookCode { get; set; } = string.Empty; // S2b, S2c, S2d, S2e
}

public class CreateTaxSnapshotRequest
{
    public int Year { get; set; }
    public TaxPeriodType PeriodType { get; set; }
    public int PeriodNumber { get; set; }
    public Guid? BranchId { get; set; }
    public string? Notes { get; set; }
}
```

## 3. Thay đổi Database (Database Changes)
### Bảng mới: `HouseholdTaxSnapshots`
```sql
CREATE TABLE [dbo].[HouseholdTaxSnapshots] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [TenantId] UNIQUEIDENTIFIER NOT NULL,
    [BranchId] UNIQUEIDENTIFIER NULL,
    [PeriodType] INT NOT NULL,
    [Year] INT NOT NULL,
    [PeriodNumber] INT NOT NULL,
    [AnnualAccumulatedRevenue] DECIMAL(18,2) NOT NULL,
    [HouseholdGroup] INT NOT NULL,
    [IsTaxExempt] BIT NOT NULL,
    [TaxableRevenueInPeriod] DECIMAL(18,2) NOT NULL,
    [VatRate] DECIMAL(5,2) NOT NULL,
    [VatAmount] DECIMAL(18,2) NOT NULL,
    [PitRate] DECIMAL(5,2) NOT NULL,
    [PitAmount] DECIMAL(18,2) NOT NULL,
    [TotalTaxAmount] DECIMAL(18,2) NOT NULL,
    [BookDataJson] NVARCHAR(MAX) NOT NULL,
    [Notes] NVARCHAR(500) NULL,
    [FinalizedBy] NVARCHAR(100) NOT NULL,
    [FinalizedAtUtc] DATETIME2 NOT NULL,
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [UpdatedAtUtc] DATETIME2 NULL,
    CONSTRAINT [FK_HouseholdTaxSnapshots_Tenants] FOREIGN KEY ([TenantId]) REFERENCES [dbo].[Tenants]([Id]),
    CONSTRAINT [FK_HouseholdTaxSnapshots_Branches] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches]([Id])
);

CREATE UNIQUE INDEX [IX_HouseholdTaxSnapshots_Period] 
ON [dbo].[HouseholdTaxSnapshots] ([TenantId], [BranchId], [PeriodType], [Year], [PeriodNumber]);
```

## 4. Phân loại Chi phí vào 4 Sổ theo Thông tư 152/2025/TT-BTC
1. **Loại trừ 100% Vốn chủ sở hữu**:
   - Nếu `Category.IsEquity == true` hoặc `CategoryType == Equity` $\rightarrow$ KHÔNG ghi nhận vào bất kỳ sổ chi phí nào (S2c, S2d, S2e).
2. **Sổ S2c-HKD (Tiền lương, tiền công)**:
   - Các khoản chi phí nhân sự: `SALARY`, `BONUS`, `ALLOWANCE`, `OVERTIME`.
3. **Sổ S2d-HKD (Vật liệu, dụng cụ, sản phẩm, hàng hóa)**:
   - Các khoản chi mua vật liệu đóng gói, bao bì, túi nylon, công cụ dụng cụ phục vụ bán lẻ: `PACKAGING`, `CONSUMABLES`, `TOOLS`, `SUPPLIES`.
4. **Sổ S2e-HKD (Dịch vụ mua ngoài & chi phí bằng tiền khác)**:
   - Các chi phí tiện ích và dịch vụ vận hành: `RENT`, `ELECTRICITY`, `WATER`, `INTERNET`, `TELECOM`, `LOGISTICS`, `SHIPPING`, `MARKETING`, `MAINTENANCE`, `OTHER_EXPENSE`.
5. **Sổ S2b-HKD (Doanh thu bán hàng hóa, dịch vụ)**:
   - Tự động lấy từ các đơn bán lẻ `Orders` hoàn thành (`Completed`), trừ đi chiết khấu và hàng trả lại.

## 5. Phân quyền (Authorization)
- `Owner`, `Accountant`: Toàn quyền xem báo cáo mọi chi nhánh, xem chi tiết sổ sách và chốt snapshot thuế.
- `StoreManager`: Xem báo cáo và sổ sách của chi nhánh được phân công. Không được chốt snapshot toàn tenant.
- `Cashier`, `Staff`: Bị từ chối truy cập (403 Forbidden).
