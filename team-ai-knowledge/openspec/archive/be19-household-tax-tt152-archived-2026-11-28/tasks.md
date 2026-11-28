# Kế hoạch triển khai: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## 1. Database & Domain
- [x] T1 — Định nghĩa Domain Enum `HouseholdTaxGroup`, `TaxPeriodType` và Entity `HouseholdTaxSnapshot` kế thừa `BaseTenantEntity` (REQ-TAX-01, REQ-TAX-04)
- [x] T2 — Cấu hình EF Core Fluent API cho `HouseholdTaxSnapshot` và đăng ký `DbSet<HouseholdTaxSnapshot>` trong `AppDbContext` (REQ-TAX-04, REQ-TAX-05)

## 2. Application Layer (DTOs & Service Interface)
- [x] T3 — Định nghĩa DTOs cho Báo Cáo Thuế HKD: `HouseholdTaxSummaryDto`, `TaxBooksSummaryDto`, `AccountingBookEntryDto`, `CreateTaxSnapshotRequest`, `HouseholdTaxSnapshotDto` (REQ-TAX-01, REQ-TAX-02, REQ-TAX-03)
- [x] T4 — Định nghĩa interface `IHouseholdTaxRepository` và `IHouseholdTaxService` (REQ-TAX-01, REQ-TAX-02, REQ-TAX-03, REQ-TAX-04)

## 3. Infrastructure Layer (Repository & Persistence)
- [x] T5 — Triển khai `HouseholdTaxRepository` trong `MT_GRMS.Infrastructure` truy vấn dữ liệu từ `Orders`, `ExpenseVouchers` và `HouseholdTaxSnapshots` có lọc Tenant (REQ-TAX-02, REQ-TAX-03, REQ-TAX-05)

## 4. Business Logic (Service Implementation)
- [x] T6 — Triển khai `HouseholdTaxService` trong `MT_GRMS.Application` tính toán thuế HKD theo 4 nhóm, áp dụng ngưỡng 1 tỷ, phân bổ 4 sổ TT 152 (S2b, S2c, S2d, S2e), loại trừ 100% chi phí Vốn chủ sở hữu, và tạo Snapshot bất biến (REQ-TAX-01, REQ-TAX-02, REQ-TAX-03, REQ-TAX-04)

## 5. API & Dependency Injection
- [x] T7 — Đăng ký DI cho `IHouseholdTaxRepository` và `IHouseholdTaxService` trong `Application` và `Infrastructure` (REQ-TAX-05)
- [x] T8 — Xây dựng `HouseholdTaxController` trong `MT_GRMS.Api` với các endpoints: `/summary`, `/books`, `/snapshots` (REQ-TAX-01, REQ-TAX-02, REQ-TAX-04, REQ-TAX-05)

## 6. Testing & Verification
- [x] T9 — Viết Unit Tests `HouseholdTaxServiceTests` kiểm thử toàn diện:
  - Ngưỡng 1 tỷ VNĐ: $\le 1$ tỷ miễn thuế, $> 1$ tỷ tính 1% GTGT và 0.5% TNCN
  - Phân loại 4 sổ TT 152 và loại bỏ chi phí vốn chủ sở hữu (`EQUITY`)
  - Chốt kỳ snapshot bất biến và kiểm tra idempotency
- [x] T10 — Viết Integration Tests `HouseholdTaxDatabaseIntegrationTests` kiểm thử truy vấn DB thực tế và Global Query Filter Multi-tenancy
