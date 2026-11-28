# EXP-2026-11-09-POS-FIX: Khảo sát Root Cause Lỗi Quỹ Chuyển Khoản POS, Tự Động Trừ Khuyến Mãi Chống Conflict & Tinh Chỉnh UI Lịch Sử Giá / Điều Hướng

- **Change**: `pos-bank-cashbook-promo-conflict-and-ui-polish`
- **Schema**: `bug-fix`
- **Capability**: `pos-sales-checkout`

## 1. Problem Statement & Khả Năng Tái Hiện (Reproduction)
Trong quá trình kiểm thử thực tế trên tenant **An Nhiên Mart (`tenant_an_nhien_02` — Chi nhánh Ba Đình)**, phát hiện **5 vấn đề nối tiếp nhau** ảnh hưởng trực tiếp tới luồng thu ngân POS và quản trị cửa hàng:

1. **Lỗi chặn đứng thanh toán Chuyển khoản POS (`"Lỗi tạo đơn hàng: Không tìm thấy tài khoản quỹ."`)**:
   - **Tái hiện**: Mở ca bán hàng tại chi nhánh của tenant thứ 2 (`tenant_an_nhien_02`), thêm hàng vào giỏ, chọn phương thức **Chuyển khoản / VietQR (`BANK`)** và bấm Thanh toán → API `POST /api/v1/pos/orders` trả lỗi `404 NotFoundException: Không tìm thấy tài khoản quỹ.`.
2. **Khuyến mãi tự động không tự trừ tiền & chồng chéo (Conflict) nhiều chiến dịch trên POS**:
   - **Tái hiện**: Tạo chương trình `ORDER_DISCOUNT` đang hoạt động (bao gồm cấu hình nhiều bậc thang `[TIERS_JSON]` hoặc 2 chương trình giảm giá đơn chạy song song). Trên POS, dòng `Giảm giá (0%) [KM]:` hiển thị nhãn `🎁 Tên chương trình` nhưng cột số tiền vẫn là `-0 đ`, không trừ vào `KHÁCH CẦN TRẢ`. Đồng thời trên Backend, nếu có nhiều chiến dịch `ORDER_DISCOUNT` cùng khớp sẽ bị cộng dồn thay vì chọn ưu đãi tốt nhất (Best-Offer), và chỉ đọc bậc 1 (`MinOrderValue`) thay vì bậc cao nhất trong `[TIERS_JSON]`.
3. **Vỡ giao diện Modal Lịch sử giá & còn nhãn mã kỹ thuật `(FE-03.1)`, `(FE-03.2)`**:
   - **Tái hiện**: Mở `Chỉnh sửa sản phẩm tại chi nhánh` → bấm `Lịch sử giá` → tiêu đề hiển thị `Lịch sử biến động giá bán (FE-03.2)`, huy hiệu chi nhánh đè sát tên sản phẩm, nút `X` và `Đóng` hiển thị viền mặc định thô của trình duyệt do dùng class Tailwind chưa đồng bộ với hệ thống style modal chuẩn. Ngoài ra cảnh báo bán dưới giá vốn vẫn hiện nhãn `(FE-03.1)`.
4. **Dư thừa nút `← Về Dashboard` nằm lộ bên ngoài Header POS**:
   - **Tái hiện**: Đăng nhập nhân viên thu ngân/quản lý trên màn hình POS → cạnh chip tên nhân viên xuất hiện nút `← Về Dashboard` riêng lẻ trong khi bên trong menu `☰ Thao tác` ngay kế bên đã có sẵn mục điều hướng về Dashboard.
5. **Dư thừa 3 tab con trên thanh điều hướng Khuyến mãi của Chủ cửa hàng**:
   - **Tái hiện**: Vào phân hệ Khuyến mãi (Store Owner) → thanh Top Navigation hiển thị thừa 3 mục không thuộc phạm vi sử dụng (`Khuyến mãi theo khung giờ`, `Phát hành mã quà tặng`, `Hạng thành viên & Chiết khấu`).

---

## 2. Context, Root Cause (File / Dòng) & Các Chỗ Có Cùng Lỗi

### 2.1. Lỗi Quỹ Ngân Hàng Khi Thanh Toán Chuyển Khoản POS
- **Root Cause**:
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/OrderService.cs` (dòng 34 & 466–481): Khi `paymentMethodUpper != "CASH"` và khác `"CREDIT"/"DEBT"`, hệ thống gọi `_cashbookService.GetAccountsAsync(order.BranchId)` tìm tài khoản `AccountType == "Bank"`, nếu không có thì fallback về hằng số cứng `DefaultBankId = Guid.Parse("01a19664-6741-7f3d-9be7-cb4c7b876559")`.
  - `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/DbInitializer.cs` (dòng 3285): `DefaultBankId` chỉ được seed duy nhất cho `DefaultTenantId` (Tenant 1).
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/Cashbook/CashbookService.cs` (dòng 327–376): `GetAccountsAsync` chỉ khởi tạo tài khoản mẫu khi `accounts.Count == 0` **và** dùng lại chính `Guid.Parse("01a19664-...")` làm khóa chính `Id` (gây trùng PK `PK_FinanceAccounts` nếu chạy cho tenant thứ 2). Hơn nữa, khi thu ngân mở ca POS, `GetOrCreateTillAsync` đã tạo 1 bản ghi `Till` (`accounts.Count == 1`), khiến khối `if (accounts.Count == 0)` bị bỏ qua hoàn toàn → tenant thứ 2 không bao giờ có tài khoản `Bank`.
  - Khi `ReceiveCashAsync(DefaultBankId, ...)` chạy tại `CashbookService.cs` (dòng 248–249), `_cashbookRepo.GetAccountWithLockAsync(accountId)` áp Global Query Filter `TenantId == CurrentTenantId` nên trả về `null` → ném `NotFoundException("Không tìm thấy tài khoản quỹ.")`.
- **Các chỗ lân cận có cùng rủi ro**:
  - `CashbookService.GetAccountsAsync` (`CashbookService.cs:327–376`): Dùng `Guid` cố định khi seed runtime và không đảm bảo tồn tại tài khoản `Bank` khi tenant đã có `Till` hoặc `Safe` (ảnh hưởng cả màn hình Sổ quỹ, Thu nợ chuyển khoản và Phiếu chi ngân hàng).
  - `OrderService.CreateOrderAsync` (`OrderService.cs:450`): Nếu đơn hàng được giảm giá 100% (`finalAmount == 0`), gọi `ReceiveCashAsync` sẽ bị chặn bởi điều kiện `amount <= 0` (`INVALID_AMOUNT`).

### 2.2. Khuyến Mãi Tự Động Không Trừ Tiền & Conflict Giữa Các Chiến Dịch
- **Root Cause Backend**:
  - `MT_GRMS_BACKEND/src/MT_GRMS.Application/Promotions/PromotionService.cs` (`EvaluateCartAsync`, dòng 186–212):
    1. Chỉ đọc `promo.MinOrderValue` và `promo.DiscountValue` (tương ứng bậc 1) mà chưa parse metadata `[TIERS_JSON]...[/TIERS_JSON]` trong `promo.Description` để chọn bậc thang cao nhất mà `request.SubTotal` đạt ngưỡng.
    2. Cộng dồn `totalDiscount += discount` cho **mọi** chương trình `ORDER_DISCOUNT` đang active thay vì giải quyết xung đột theo nguyên tắc **Best-Offer (chỉ áp dụng 1 chương trình giảm giá đơn có mức giảm cao nhất, không cộng dồn chồng chéo)**.
- **Root Cause Frontend**:
  - `MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx` (dòng 595 & 634–645): Nhận kết quả `evaluateCart` nhưng chỉ lưu `appliedPromotions` (chuỗi mô tả) và `giftItems`, hoàn toàn **bỏ qua** giá trị tiền giảm tự động (`res.totalDiscountAmount` trừ phần voucher). Công thức `orderDiscountAmount` chỉ tính theo `%` nhập tay `currentTab.orderDiscountPercent` (mặc định `0%` → `0 đ`).
  - `MT_GRMS_FRONTEND/src/features/pos/components/PosPaymentPanel.tsx` (dòng 93 & 292–304): Tự tính lại `orderDiscountAmount = Math.round((totalItemAmount * orderDiscountPercent) / 100)` nội bộ thay vì nhận mức giảm thực tế đã giải quyết conflict từ trang POS.
  - `MT_GRMS_FRONTEND/src/features/pos/components/modals/OrderDiscountModal.tsx` (dòng 29): Hardcode `const autoPromotion = Math.round(totalItemAmount * 0.05)` (demo 5% giả lập) thay vì hiển thị số tiền khuyến mãi tự động thực tế.
  - `PosCheckoutPage.tsx` (dòng 600–607): Chưa kiểm tra cờ `loyaltyConfig.allowPointsWithPromotions === false` để khóa đổi điểm khi đơn hàng đã hưởng khuyến mãi/voucher.

### 2.3. Giao Diện `PriceHistoryModal` & Nhãn Kỹ Thuật `FE-03`
- **Root Cause**:
  - `MT_GRMS_FRONTEND/src/features/product/components/PriceHistoryModal.tsx` (dòng 48–178): Viết bằng các utility class kiểu Tailwind v3 (`fixed inset-0`, `rounded-lg bg-gray-200`, ...) không tương thích hoàn toàn với hệ thống CSS (`modal-overlay`, `modal-content` + inline `CSSProperties`) đang dùng ở `EditStoreProductModal.tsx` và `ProductFormModal.tsx`.
  - Còn sót chuỗi `(FE-03.2)` tại `PriceHistoryModal.tsx:55` và `(FE-03.1)` tại `ProductFormModal.tsx:582`, `EditStoreProductModal.tsx:266`.

### 2.4. Điều Hướng Dư Thừa Trên POS Header & Top Nav Khuyến Mãi
- **Root Cause**:
  - `MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx` (dòng 494–518): Render thêm nút `.pos-back-dashboard-btn` bên ngoài cho nhân viên (`!isStoreOwner`), bị trùng chức năng với mục `Về Dashboard` bên trong dropdown `☰ Thao tác` (dòng 556–569).
  - `MT_GRMS_FRONTEND/src/layouts/StoreOwnerLayout/AppTopNav.tsx` (dòng 317–350): Cấu hình cứng 6 mục con cho nhóm Khuyến mãi, trong đó 3 mục (`Khuyến mãi theo khung giờ`, `Phát hành mã quà tặng`, `Hạng thành viên & Chiết khấu`) bị thừa so với phạm vi nghiệp vụ.

---

## 3. Constraints & Đánh Giá Toàn Vẹn Dữ Liệu (Data Integrity Check)
- **Constraints**:
  - Tuyệt đối tuân thủ cô lập dữ liệu đa tenant (`TenantId`), không bao giờ dùng hằng số Primary Key `Guid` tĩnh dùng chung giữa nhiều tenant.
  - Không thay đổi schema CSDL hoặc tạo EF Core Migration mới (sử dụng đúng cấu trúc bảng `FinanceAccounts`, `StorePaymentConfigs`, `Promotions` hiện có).
  - Giữ tương thích ngược với toàn bộ 577 unit tests hiện hành của Backend.
- **Đánh giá dữ liệu đã hỏng (Data Integrity)**:
  - Các giao dịch POS chuyển khoản bị lỗi `NotFoundException` trước đó đều dừng trước `SaveChangesAsync`, nên CSDL tự động rollback và **không phát sinh đơn hàng mồ côi hay lệch số dư sổ quỹ**. Không cần chạy script vá dữ liệu lịch sử.

---

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi cửa hàng (Tenant) sử dụng tối thiểu 1 tài khoản quỹ Ngân hàng (`FinanceAccountType.Bank`) chung cho toàn cửa hàng (hoặc theo cấu hình `StorePaymentConfig` của Tenant) để ghi nhận dòng tiền thu từ thanh toán POS không dùng tiền mặt (`BANK` / `VIETQR` / `TRANSFER`).
- **[ASSUMPTION-02]**: Quy tắc chống xung đột (Conflict Resolution) cho các chương trình giảm giá tự động trên hóa đơn (`ORDER_DISCOUNT` / `PERCENT` / `FIXED_AMOUNT`) là **Best-Offer không cộng dồn** — hệ thống tự động chọn duy nhất 1 chương trình (và bậc thang cao nhất đạt điều kiện của chương trình đó) mang lại số tiền giảm lớn nhất cho khách.
- **[ASSUMPTION-03]**: Khi thu ngân chủ động nhập chiết khấu tay toàn đơn (`manualOrderDiscount > 0`), hệ thống không cộng chồng lên khuyến mãi đơn tự động mà lấy mức giảm hiệu lực cao hơn (hoặc ghi đè rõ ràng trên modal chiết khấu) để bảo vệ biên lợi nhuận cửa hàng; mã Voucher hợp lệ vẫn được áp dụng trên phần tiền còn lại sau chiết khấu đơn theo đúng luồng `EvaluateCartAsync`.

---

## 5. Scope & Non-Goals

### In Scope
- Tự động phân giải hoặc khởi tạo an toàn tài khoản quỹ `Bank` theo từng Tenant (kế thừa thông tin ngân hàng từ `StorePaymentConfig` nếu có) khi thanh toán POS chuyển khoản và khi truy vấn danh sách quỹ.
- Cập nhật bộ máy tính khuyến mãi giỏ hàng (`EvaluateCartAsync`) đọc đầy đủ bậc thang `[TIERS_JSON]` và giải quyết xung đột theo nguyên tắc Best-Offer; tự động trừ tiền khuyến mãi trên giao diện POS (`PosCheckoutPage`, `PosPaymentPanel`, `OrderDiscountModal`) và tuân thủ cờ `allowPointsWithPromotions`.
- Chuẩn hóa lại giao diện `PriceHistoryModal` đồng bộ với thiết kế modal toàn hệ thống và gỡ bỏ toàn bộ nhãn `(FE-03.1)`, `(FE-03.2)`.
- Xóa nút `← Về Dashboard` nằm ngoài trên `PosHeader` và xóa 3 mục con dư thừa trên `AppTopNav` phân hệ Khuyến mãi.

### Out of Scope (Non-Goals)
- Không thay đổi cổng đối soát biến động số dư tự động qua SePay Webhook hoặc chữ ký bảo mật ngân hàng.
- Không xây dựng mới các tính năng Khuyến mãi theo khung giờ (Happy Hour), Phát hành thẻ quà tặng vật lý hoặc Phân hạng thành viên tự động.
- Không thay đổi cấu trúc sổ sách kế toán thuế TT152 (`HouseholdTaxRepository`).

---

## 6. Phân Tích Phương Án (≥2 Options) & Lựa Chọn

### Vấn đề A: Xử lý thiếu tài khoản quỹ `Bank` cho các Tenant mới trên POS
- **Phương án A1 (Thủ công — Bắt buộc Chủ cửa hàng tạo quỹ trước khi bán)**: Chặn thanh toán POS và hiển thị hướng dẫn yêu cầu Chủ cửa hàng vào Sổ quỹ tạo tài khoản Ngân hàng.
  - *Ưu điểm*: Không tự sinh bản ghi tài khoản quỹ.
  - *Nhược điểm*: Gây gián đoạn quầy thu ngân ngay lúc khách đã quét mã QR chuyển tiền; hiện tại `GetAccountsAsync` còn lỗi trùng `Guid` tĩnh nếu tự seed.
- **Phương án A2 (Tự động — Provisioning `GetOrCreateBankAccountAsync` theo Tenant + đồng bộ `StorePaymentConfig`) — ĐƯỢC CHỌN**:
  - *Ưu điểm*: Tương đồng 100% với cơ chế `GetOrCreateTillAsync` và `GetOrCreateSafeAsync` sẵn có của hệ thống; sinh `Guid.NewGuid()` độc lập cho từng Tenant; tự động lấy tên ngân hàng/số tài khoản từ `StorePaymentConfig` của cửa hàng nếu đã cấu hình VietQR; không bao giờ làm đứt gãy luồng bán hàng tại quầy.
  - *Nhược điểm*: Cần kiểm tra điều kiện `finalAmount > 0` trước khi ghi bút toán thu tiền.

### Vấn đề B: Tự động trừ khuyến mãi & chống Conflict trên POS
- **Phương án B1 (Chỉ tính toán conflict ở Frontend)**: Tải toàn bộ danh sách khuyến mãi về trình duyệt POS để tự parse và trừ tiền.
  - *Ưu điểm*: Không cần sửa Backend.
  - *Nhược điểm*: Lệch logic giữa API `evaluate-cart` và UI, lộ quy tắc ngân sách (`BudgetLimit` / `UsageLimit`), khó kiểm thử đơn vị.
- **Phương án B2 (Backend `EvaluateCartAsync` chuẩn hóa Multi-Tier + Best-Offer & Frontend đồng bộ số tiền giảm) — ĐƯỢC CHỌN**:
  - *Ưu điểm*: Nguồn chân lý duy nhất (Single Source of Truth) nằm ở `PromotionService.EvaluateCartAsync` (kiểm tra đầy đủ hạn dùng, chi nhánh, ngân sách, bậc thang `[TIERS_JSON]`, chọn Best-Offer cao nhất); Frontend POS chỉ nhận kết quả chuẩn xác để tự động trừ vào dòng `Giảm giá [KM]` và hóa đơn thanh toán.
  - *Nhược điểm*: Cần tách rõ phần tiền giảm tự động (`autoPromoDiscount`) khỏi tiền giảm `voucherResult` ở Frontend để tránh trừ trùng mã Voucher.

---

## 7. Success Criteria
1. Thanh toán đơn hàng POS bằng Chuyển khoản (`BANK` / `VietQR`) trên bất kỳ Tenant/Chi nhánh nào đều thành công `200 OK`, tự động ghi nhận đúng bút toán thu vào tài khoản quỹ `Bank` của đúng Tenant đó.
2. Khi giỏ hàng POS đạt điều kiện khuyến mãi tự động, dòng `Giảm giá [KM]` tự động hiển thị số tiền giảm và trừ trực tiếp vào `KHÁCH CẦN TRẢ`; khi có nhiều bậc thang hoặc nhiều chương trình `ORDER_DISCOUNT` trùng thời gian, hệ thống chỉ áp dụng duy nhất mức ưu đãi cao nhất (không cộng dồn sai).
3. Modal `Lịch sử biến động giá bán` hiển thị chuẩn khung/nút/bảng đồng nhất hệ thống, không đè chữ, không còn nhãn `(FE-03.1)` hay `(FE-03.2)`.
4. Header POS không còn nút `← Về Dashboard` bên ngoài (vẫn truy cập được từ `☰ Thao tác`), và thanh điều hướng Khuyến mãi chỉ hiển thị đúng 3 tab cốt lõi.
