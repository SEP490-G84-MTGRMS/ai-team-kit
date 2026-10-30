# Tasks: Phân hệ Quản lý Khuyến mại & Voucher Backend (BE-16)

## 1. Database & Domain Models
- [ ] T1 — Cập nhật `Promotion.cs` (bổ sung MinOrderValue, MaxDiscountAmount, UsageLimit, BudgetLimit, TargetBranches... ID GUIDv7) (REQ-PV01, REQ-PV06)
- [ ] T2 — Tạo mới entity `PromotionCondition.cs` biểu diễn quan hệ $M:N$ `eligible_for` (ProductRole, MinQty, Note, ID GUIDv7) (REQ-PV02, REQ-PV06)
- [ ] T3 — Tạo mới entity `VoucherCode.cs` quản lý vòng đời mã voucher (Status UNUSED/USED/EXPIRED, OrderCode, ID GUIDv7) (REQ-PV04, REQ-PV05, REQ-PV06)
- [ ] T4 — Cấu hình EF Core: `PromotionConfiguration`, `PromotionConditionConfiguration`, `VoucherCodeConfiguration` và đăng ký DbSet trong `AppDbContext.cs` (REQ-PV01, REQ-PV02)

## 2. Application Layer & DTOs & Validators
- [ ] T5 — Xây dựng DTOs cho Promotion và Voucher: `PromotionDtos.cs`, `VoucherDtos.cs`, `CartEvaluationDtos.cs` khớp với Frontend contract (REQ-PV01, REQ-PV03, REQ-PV04)
- [ ] T6 — Xây dựng FluentValidation Validators: `PromotionValidators.cs`, `VoucherValidators.cs` (REQ-PV01, REQ-PV04)
- [ ] T7 — Định nghĩa interfaces: `IPromotionRepository.cs`, `IPromotionService.cs` (REQ-PV01 đến REQ-PV06)
- [ ] T8 — Hiện thực `PromotionService.cs`: CRUD promotion, cart evaluation (giảm giá % có chặn trần, giảm tiền mặt, Buy X Get Y), batch code generator, validate & redeem coupon tại POS (REQ-PV01, REQ-PV03, REQ-PV04, REQ-PV05)

## 3. Infrastructure & Repository Layer
- [ ] T9 — Hiện thực `PromotionRepository.cs` (truy vấn phân trang, lọc, eager loading conditions & codes, atomic voucher status update) (REQ-PV01, REQ-PV04, REQ-PV05)
- [ ] T10 — Đăng ký Dependency Injection trong `MT_GRMS.Infrastructure/DependencyInjection.cs` và `MT_GRMS.Application/DependencyInjection.cs` (REQ-PV01)

## 4. API Controllers
- [ ] T11 — Tạo `PromotionsController.cs` (`/api/v1/promotions`): CRUD, toggle active, evaluate-cart (REQ-PV01, REQ-PV02, REQ-PV03)
- [ ] T12 — Tạo `VouchersController.cs` (`/api/v1/vouchers`): CRUD đợt voucher, sinh mã batch, validate & redeem cho POS (REQ-PV04, REQ-PV05)

## 5. Automated Tests (xUnit)
- [ ] T13 — Viết Unit Tests `PromotionManagementTests.cs`: CRUD promotion, validation ngày giờ, trùng mã, phân trang (REQ-PV01, REQ-PV06)
- [ ] T14 — Viết Unit Tests `VoucherManagementTests.cs`: Batch generator, mã duy nhất, validate điều kiện, redeem atomic (REQ-PV04, REQ-PV05)
- [ ] T15 — Viết Unit Tests `PromotionEvaluationTests.cs`: Tính chiết khấu %, chặn trần MaxDiscountAmount, min order value, Mua X tặng Y, an toàn số âm (REQ-PV03)
- [ ] T16 — Chạy kiểm thử toàn bộ `dotnet test` và xác minh 100% tests PASS (REQ-PV01 đến REQ-PV06)
