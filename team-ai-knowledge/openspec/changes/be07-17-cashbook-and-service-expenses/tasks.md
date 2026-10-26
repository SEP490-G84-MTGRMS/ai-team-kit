# Danh Sách Công Việc Triển Khai (Implementation Tasks)
## Change: be07-17-cashbook-and-service-expenses

### Phase 1: Domain Entities & Database Schema
- [x] T1 — Tạo các Enums tài chính (`FinanceAccountType`, `CashbookEntryType`, `ExpenseVoucherStatus`, `CashInTransitStatus`, `ShiftState`) tại `MT_GRMS.Domain/Enums/FinanceEnums.cs` (REQ-CB-01, REQ-EXP-01)
- [x] T2 — Nâng cấp `CashbookTransaction.cs` thành `CashbookEntry.cs` bất biến (Append-Only) với `BalanceAfter`, `AuditHash`, `ReversedEntryId` (REQ-SEC-01)
- [x] T3 — Tạo các Entities tài khoản quỹ: `BranchCashTill.cs`, `BranchSafe.cs`, `CashInTransit.cs`, `ShiftZReport.cs` tại `MT_GRMS.Domain/Entities/Finance/` (REQ-CB-01, REQ-CB-02, REQ-CB-03)
- [x] T4 — Tạo Entity `ExpenseVoucher.cs` với vòng đời 5 bước và các cờ phân loại thuế, nghi vấn tách bill (REQ-EXP-01, REQ-EXP-02)
- [x] T5 — Cập nhật `AppDbContext.cs` đăng ký các `DbSet`, áp dụng Global Query Filter và cấu hình EF Core Fluent API (REQ-CB-01)
- [x] T6 — Tạo cấu hình Fluent API `FinanceConfigurations.cs` định dạng `DECIMAL(18,2)` và các Composite Indexes (REQ-SEC-01)
- [x] T7 — Triển khai `CashbookRepository.cs` với phương thức đọc kèm khóa bi quan `UPDLOCK, ROWLOCK` (REQ-CB-01)

### Phase 2: Application Services & Core Logic
- [x] T8 — Định nghĩa các DTOs cho Sổ Quỹ và Chi Phí (`CashbookDtos.cs`, `ExpenseDtos.cs`) kèm FluentValidation (REQ-CB-01, REQ-EXP-01)
- [x] T9 — Xây dựng `AuditHashService.cs` tính toán chuỗi băm HMAC-SHA256 bất biến cho sổ cái (REQ-SEC-01)
- [x] T10 — Triển khai `CashbookService.cs`: Mở ca kế thừa `RetainedFloat`, Chốt ca Z-report và tính chênh lệch thừa/thiếu, Cash drop 2 chữ ký (REQ-CB-02)
- [x] T11 — Triển khai `CashbookService.cs`: Lệnh nộp tiền ngân hàng 2 bước qua `CashInTransit` có định danh `CarrierUserId` và cảnh báo trễ (REQ-CB-03)
- [x] T12 — Triển khai `ExpenseService.cs`: Động cơ Anti-Splitting kiểm tra hạn mức đơn lẻ, ca, ngày và tần suất 60 phút (REQ-EXP-02)
- [x] T13 — Triển khai `ExpenseService.cs`: Vòng đời chi phí 5 bước, duyệt chi, và lệnh xuất quỹ an toàn chống âm két (REQ-EXP-01)

### Phase 3: API Controllers & Middleware
- [x] T14 — Xây dựng Filter `IdempotencyAttribute.cs` kiểm tra Header `Idempotency-Key` 24h và chống trùng lặp giao dịch (REQ-SEC-02)
- [x] T15 — Xây dựng `CashbookController.cs` exposing các endpoints: Mở/chốt ca, Cash drop, Nộp ngân hàng 2 bước, Lịch sử sổ cái (REQ-CB-01, REQ-CB-02, REQ-CB-03)
- [x] T16 — Xây dựng `ExpensesController.cs` exposing các endpoints: Tạo phiếu chi, Duyệt chi, Xuất quỹ chi tiền, Danh sách chi phí (REQ-EXP-01, REQ-EXP-02)
- [x] T17 — Đăng ký Dependency Injection trong `MT_GRMS.Application/DependencyInjection.cs` và `MT_GRMS.Infrastructure/DependencyInjection.cs`

### Phase 4: Unit Testing & Verification
- [x] T18 — Viết 15 Unit Tests cho `CashbookServiceTests.cs` (chống âm két, mở ca kế thừa, chốt ca thừa/thiếu, 2-phase nộp tiền, khóa bi quan...) (REQ-CB-01, REQ-CB-02, REQ-CB-03)
- [x] T19 — Viết 10 Unit Tests cho `ExpenseServiceTests.cs` (ranh giới T1 500k vs 500.001đ, gộp đối tượng cùng ngày, mẫu hình 60 phút, xuất quỹ thất bại...) (REQ-EXP-01, REQ-EXP-02)
- [x] T20 — Viết Integration Tests kiểm tra Idempotency Header và Multi-Tenant Query Filter (REQ-SEC-01, REQ-SEC-02)
- [x] T21 — Chạy toàn bộ test suite, kiểm tra Code Coverage $\ge 85\%$ và xác nhận build không có lỗi
