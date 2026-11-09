---
verdict: PASS
tested_at: 2026-11-09
tester: '@sonnguyenn10'
---

# Test Report: pos-bank-cashbook-promo-conflict-and-ui-polish

| Mã Test Case | Tên kịch bản | Tiêu chí (Cô) | Loại Test | Mức ưu tiên | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Dữ liệu test (Test Data) | Expected Results (THEN) | Người viết | Người chạy | Report Type | Kết quả | Ghi chú |
|---|---|---|---|:---:|---|---|---|---|---|---|:---:|:---:|---|
| TC-UT-POS-CB-01 | REQ-POS-BANK-01: Tự động khởi tạo quỹ Bank cho Tenant thứ 2 đã mở ca (có Till, chưa có Bank) | Luồng nghiệp vụ | Happy | P0 | Tenant `tenant_an_nhien_02` đã có 1 tài khoản `Till` (`Két quầy chính`), chưa có tài khoản `Bank` | Gọi `GetAccountsAsync` / `GetOrCreateBankAccountAsync` rồi gọi `ReceiveCashAsync` cho đơn POS chuyển khoản | `TenantId = "tenant_an_nhien_02"`, `Amount = 150.000đ`, `OrderCode = "HD-TEST-01"` | Tạo mới 1 tài khoản `Bank` với `Guid.NewGuid()` khác `DefaultBankId`, ghi thu thành công `BalanceAfter = 150.000đ` (Trước sửa: FAIL `null`; Sau sửa: PASS) | Nguyễn Bá Sơn | Đặng Đỗ Minh Đức | 5.1 | PASS | xUnit `CashbookServiceTests` |
| TC-IT-POS-CB-02 | REQ-POS-BANK-01: Tái sử dụng quỹ Bank hiện có & bảo vệ đơn hàng 0 VND | Số liệu / Công thức | Edge | P1 | Tenant đã có sẵn tài khoản `Bank` số dư `10.000.000đ`; hoặc đơn hàng khấu trừ 100% `finalAmount = 0đ` | Thanh toán đơn chuyển khoản `3.000.000đ` và đơn giảm giá hết `0đ` | `Amount = 3.000.000đ` / `finalAmount = 0đ`, `PaymentMethod = "BANK"` | Tái sử dụng đúng tài khoản `Bank` (số dư `13.000.000đ`, không tạo trùng); đơn `0đ` bỏ qua `ReceiveCashAsync` không lỗi `INVALID_AMOUNT` | Nguyễn Bá Sơn | Nguyễn Trường An | 5.2 | PASS | xUnit `CashbookServiceTests` & `PosOrderServiceTests` |
| TC-UT-PROMO-01 | REQ-POS-PROMO-02: Giải mã bậc thang `[TIERS_JSON]` chọn bậc ưu đãi cao nhất | Số liệu / Công thức | Happy | P0 | Chương trình `KM-TIERS` có Bậc 1 (`100.000đ` giảm `5%`) và Bậc 2 (`300.000đ` giảm `10%`, trần `50.000đ`) | Gọi `EvaluateCartAsync` với giỏ hàng đạt Bậc 2 | `SubTotal = 350.000đ`, 1 SP Gạo lứt huyết rồng | Hệ thống chọn Bậc 2 giảm `35.000đ` (`FinalAmount = 315.000đ`) (Trước sửa: FAIL `17.500đ`; Sau sửa: PASS `35.000đ`) | Nguyễn Bá Sơn | Đặng Đỗ Minh Đức | 5.1 | PASS | xUnit `PromotionEvaluationTests` |
| TC-UT-PROMO-02 | REQ-POS-PROMO-02: Giải quyết xung đột Best-Offer giữa nhiều chiến dịch giảm giá đơn | Số liệu / Công thức | Edge | P0 | Hai chiến dịch cùng Active: `KM-10PCT` (giảm `10%` đơn từ `200k`) và `KM-30K` (giảm `30.000đ` đơn từ `200k`) | Gọi `EvaluateCartAsync` với giỏ hàng `200.000đ` | `SubTotal = 200.000đ`, Sữa bột `200.000đ` | Chỉ áp dụng Best-Offer `KM-30K` giảm `30.000đ` (`FinalAmount = 170.000đ`), không cộng dồn `50.000đ` (Trước sửa: FAIL `50.000đ`; Sau sửa: PASS `30.000đ`) | Nguyễn Bá Sơn | Nguyễn Minh Tâm | 5.1 | PASS | xUnit `PromotionEvaluationTests` |
| TC-SYS-POS-03 | REQ-POS-PROMO-02: Tự động trừ tiền khuyến mãi trên dòng Giảm giá [KM] & khóa điểm khi cấu hình cấm gộp | Giao diện (UI) | Happy | P1 | Mở màn hình POS, có chương trình tự động giảm giá & `allowPointsWithPromotions = false` | Thêm sản phẩm vào giỏ hàng, mở `OrderDiscountModal` và kiểm tra ô `Dùng điểm` | Giỏ hàng `350.000đ`, `autoPromoDiscount = 35.000đ`, KH có `500` điểm | Dòng `Giảm giá tự động [KM]:` tự trừ `-35.000 đ` vào `KHÁCH CẦN TRẢ`; modal hiện đúng `35.000 đ`; checkbox `Dùng điểm` tự khóa | Nguyễn Bá Sơn | Nguyễn Long Nhật | 5.3 | PASS | Typecheck + UI verification |
| TC-SEC-TENANT-04 | REQ-POS-BANK-01: Cô lập tài khoản Sổ quỹ Ngân hàng theo TenantId | Security | Security | P0 | Đăng nhập JWT của `tenant_an_nhien_02`, DB có `DefaultBankId` thuộc `tenant_default_01` | Thanh toán đơn POS `paymentMethod = "BANK"` | `DefaultBankId = 01a19664-6741-7f3d-9be7-cb4c7b876559` | Không đọc/ghi chéo sang tài khoản `Bank` của Tenant 1; chỉ ghi bút toán vào tài khoản thuộc `tenant_an_nhien_02` | Nguyễn Bá Sơn | Nguyễn Trường An | 5.4 | PASS | Multi-tenant isolation check |
| TC-E2E-UI-05 | REQ-PROD-UI-03 & REQ-UI-NAV-04: Nghiệm thu giao diện Lịch sử giá, xóa nhãn FE-03 và tinh gọn điều hướng POS / Khuyến mãi | Giao diện (UI) | Happy | P1 | Đăng nhập Store Owner & Cashier trên trình duyệt | Mở `Chỉnh sửa sản phẩm tại chi nhánh` → `Lịch sử giá`; kiểm tra `PosHeader` và `AppTopNav` mục Khuyến mãi | SP `"Gạo lứt huyết rồng An Nhiên 2kg"`, CN `"An Nhiên Mart - Chi nhánh Ba Đình"` | Modal cân đối sắc nét, không đè badge, sạch nhãn `(FE-03.1)`/`(FE-03.2)`; POS gọn nút `← Về Dashboard` vào trong `☰ Thao tác`; Top Nav Khuyến mãi còn đúng 3 tab chính | Nguyễn Bá Sơn | Toàn bộ nhóm | 5.5 | PASS | Build + UI acceptance |

## Lệnh đã chạy
- **TDD Red Phase (trước khi sửa code)**:
  - `dotnet test tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj --filter "FullyQualifiedName~REQ_POS_BANK_01|FullyQualifiedName~REQ_POS_PROMO_02"` → **FAIL (3/3 failed)** — chứng minh tái hiện chính xác cả 3 lỗi gốc.
- **TDD Green Phase & Full Regression Suite (sau khi sửa code)**:
  - `dotnet test MT_GRMS_BACKEND.sln`: **PASS (580/580 tests passed — 536 UnitTests + 44 IntegrationTests, 0 failed)**.
  - `npm --prefix MT_GRMS_FRONTEND run build` (`tsc -b && vite build`): **PASS (2580 modules transformed, 0 TypeScript errors)**.
  - `npx --prefix MT_GRMS_FRONTEND oxlint <8 modified frontend files>`: **PASS (0 errors, exit code 0)**.

## Đối chiếu specs ↔ code
- **`REQ-POS-BANK-01`** ✅: Đã triển khai `GetOrCreateBankAccountAsync` trong `ICashbookService` / `CashbookService` (sinh `Guid.NewGuid()`, gán `TenantId`), chuẩn hóa `GetAccountsAsync` và tích hợp đồng bộ `StorePaymentConfig` + chặn `finalAmount == 0` tại `OrderService.CreateOrderAsync`.
- **`REQ-POS-PROMO-02`** ✅: Đã cập nhật `PromotionService.EvaluateCartAsync` giải mã `[TIERS_JSON]`, kẹp trần `BudgetLimit - TotalDiscountGiven` và chọn duy nhất Best-Offer; cập nhật `PosCheckoutPage.tsx`, `PosPaymentPanel.tsx`, `OrderDiscountModal.tsx` tự trừ `autoPromoDiscount` và khóa điểm khi `allowPointsWithPromotions === false`.
- **`REQ-PROD-UI-03`** ✅: Đã chuẩn hóa khung giao diện `PriceHistoryModal.tsx` đồng bộ toàn hệ thống và gỡ sạch nhãn `(FE-03.1)`, `(FE-03.2)` trên `PriceHistoryModal.tsx`, `ProductFormModal.tsx`, `EditStoreProductModal.tsx`.
- **`REQ-UI-NAV-04`** ✅: Đã gỡ nút `← Về Dashboard` rời bên ngoài `PosHeader.tsx` và xóa 3 mục con thừa trên `AppTopNav.tsx`.
- Không phát sinh thay đổi ngoài phạm vi `specs.md`; mọi lưu ý trong `review/skeptic.md` và `review/guardian.md` đều đã được giải quyết trọn vẹn.

## Lỗi còn tồn đọng
- Không còn lỗi tồn đọng trong phạm vi change (`0` open issues).
