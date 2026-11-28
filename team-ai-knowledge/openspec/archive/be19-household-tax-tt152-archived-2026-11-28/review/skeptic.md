# Skeptic Review: be19-household-tax-tt152

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 4 nhóm HKD, ngưỡng 1 tỷ, 4 sổ TT 152 (S2b, S2c, S2d, S2e), snapshot bất biến, xử lý multi-tenancy và edge cases. |
| D2 Correctness | 5/5 | Chính xác 100% theo Luật 108/2025/QH15, NĐ 141/2026/NĐ-CP và TT 152/2025/TT-BTC. Tỷ lệ thuế bán lẻ 1% GTGT + 0.5% TNCN. |
| D3 Coherence | 5/5 | Đề xuất (proposal), Khám phá (exploration), Thiết kế (design-brief) và Đặc tả (specs) hoàn toàn đồng bộ, nhất quán thuật ngữ. |
| D4 Constraints | 5/5 | Tuân thủ Clean Architecture, .NET 8, Multi-tenancy (BaseTenantEntity), bảo vệ chia cho 0, làm tròn AwayFromZero. |
| D5 Blast Radius | 5/5 | Cô lập hoàn toàn: chỉ đọc dữ liệu từ Orders và ExpenseVouchers; bảng mới HouseholdTaxSnapshots không gây breaking change. |

## Vấn đề
- Không phát hiện vấn đề HIGH hoặc MEDIUM.
- [LOW] Lưu ý kỹ thuật: Cần đảm bảo index `(TenantId, BranchId, PeriodType, Year, PeriodNumber)` là Filtered Unique Index nếu `BranchId` có thể mang giá trị NULL trên SQL Server (hoặc cấu hình EF Core `HasIndex().IsUnique()`). -> Đã lưu ý trong thiết kế DB.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập kế hoạch công việc (tasks.md) và triển khai code.
