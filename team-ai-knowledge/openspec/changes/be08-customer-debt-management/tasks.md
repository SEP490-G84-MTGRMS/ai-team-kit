# Danh Sách Công Việc Triển Khai (Implementation Tasks)
## Change: be08-customer-debt-management — Phân Hệ Công Nợ Khách Hàng (FE-08)

### Phase 1: Domain Entities & Database Schema
- [ ] T1 — Tạo Enums công nợ (`CustomerDebtType`, `DebtInvoiceStatus`, `CustomerDebtStatus`) tại `MT_GRMS.Domain/Enums/DebtEnums.cs` (REQ-DEBT-01, REQ-DEBT-02)
- [ ] T2 — Tạo Entity `CustomerDebtProfile.cs` (CreditLimit, MaxDebtDays, CurrentDebtBalance, PrepaymentBalance, DebtStatus) (REQ-DEBT-01)
- [ ] T3 — Tạo Entity `CustomerDebtInvoice.cs` (OrderId, TotalDebtAmount, RemainingDebtAmount, DueDate, Status) (REQ-DEBT-03)
- [ ] T4 — Tạo Entity `CustomerDebtEntry.cs` (Append-Only ledger: EntryCode, EntryType, Amount, BalanceAfter, ReferenceCode, Notes) (REQ-DEBT-02)
- [ ] T5 — Tạo Entity `CustomerDebtAllocation.cs` (EntryId, InvoiceId, AllocatedAmount) ghi vết phân bổ (REQ-DEBT-03)
- [ ] T6 — Cấu hình Fluent API `DebtConfigurations.cs` (`DECIMAL(18,2)`, Composite Indexes) và đăng ký DbSets trong `AppDbContext.cs` (REQ-DEBT-01, REQ-DEBT-02)

### Phase 2: Application Services & FIFO Allocation Engine
- [ ] T7 — Định nghĩa các DTOs công nợ (`DebtDtos.cs`) kèm FluentValidation (REQ-DEBT-01, REQ-DEBT-03)
- [ ] T8 — Xây dựng `ICustomerDebtRepository.cs` và `CustomerDebtRepository.cs` với phương thức đọc kèm khóa bi quan `UPDLOCK, ROWLOCK` (REQ-DEBT-01)
- [ ] T9 — Triển khai `CustomerDebtService.RecordSaleDebtAsync`: Kiểm tra hạn mức, ngày nợ quá hạn, sinh hóa đơn nợ và bút toán sổ nợ (REQ-DEBT-01, REQ-DEBT-05)
- [ ] T10 — Triển khai `CustomerDebtService.RepayDebtAsync`: Thuật toán phân bổ thanh toán FIFO, cấn trừ hóa đơn cũ nhất, đồng bộ thu Sổ Quỹ (REQ-DEBT-03, REQ-DEBT-06)
- [ ] T11 — Triển khai `CustomerDebtService.OffsetGoodsReturnDebtAsync`: Cấn trừ nợ hóa đơn gốc $\rightarrow$ cấn trừ FIFO $\rightarrow$ chỉ cho phép hoàn tiền nếu sạch nợ (REQ-DEBT-04)
- [ ] T12 — Triển khai `CustomerDebtService.AdjustDebtAsync` & `WriteOffBadDebtAsync`: Điều chỉnh sai sót và xóa nợ xấu có thẩm quyền (REQ-DEBT-02)

### Phase 3: API Controllers & Credit Control Middleware
- [ ] T13 — Xây dựng `CustomerDebtController.cs` exposing các endpoints: Bán nợ, Thu nợ, Cấn trừ hàng trả, Điều chỉnh nợ, Hồ sơ nợ (REQ-DEBT-01 - REQ-DEBT-06)
- [ ] T14 — Tích hợp bộ lọc kiểm tra hạn mức và nợ quá hạn tại POS Check-out API kèm hỗ trợ Manager Bypass Code (REQ-DEBT-05)
- [ ] T15 — Áp dụng `IdempotencyFilter` cho các endpoints thu nợ và cấn trừ trả hàng (REQ-DEBT-03, REQ-DEBT-04)
- [ ] T16 — Đăng ký Dependency Injection trong `MT_GRMS.Application/DependencyInjection.cs` và `MT_GRMS.Infrastructure/DependencyInjection.cs`

### Phase 4: Unit Testing & Integration Verification
- [ ] T17 — Viết Unit Tests `CustomerDebtServiceTests.cs` (12 test cases: bán nợ thành công, chặn vượt hạn mức, chặn nợ quá hạn, Manager Bypass...) (REQ-DEBT-01, REQ-DEBT-05)
- [ ] T18 — Viết Unit Tests `CustomerDebtFifoTests.cs` (10 test cases: phân bổ FIFO nhiều hóa đơn, khách trả thừa vào Prepayment, cấn trừ hàng trả 2 tầng...) (REQ-DEBT-03, REQ-DEBT-04)
- [ ] T19 — Viết Integration Tests `CustomerDebtDatabaseIntegrationTests.cs` (sổ cái bất biến, khóa bi quan, tính toán số dư chính xác) (REQ-DEBT-02)
- [ ] T20 — Chạy toàn bộ test suite, kiểm tra Code Coverage $\ge 85\%$ và xác nhận build 0 Warning, 0 Error
