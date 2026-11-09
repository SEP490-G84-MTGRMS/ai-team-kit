---
change: pos-db-sync-owner-shiftless-and-branch-catalog
schema: bug-fix
verdict: PASS
date: 2026-11-10
---

# Test Report: pos-db-sync-owner-shiftless-and-branch-catalog

## 1. Tổng quan Verdict
- **Verdict**: **PASS**
- **Capability**: `pos-sales-checkout`
- **Môi trường kiểm chứng**:
  - **Backend Test Suite**: `.NET 8` (`MT_GRMS.UnitTests` + `MT_GRMS.IntegrationTests`)
  - **Live PostgreSQL & E2E API Smoke Test**: `MT_GRMS.Api` chạy thực tế trên PostgreSQL `mtgrms_db` (`http://127.0.0.1:5299`)
  - **Frontend Static Analysis & Production Build**: `oxlint` + `tsc -b && vite build` (`MT_GRMS_FRONTEND`)

---

## 2. Ma trận Kiểm thử Tái hiện Lỗi (Trước FAIL → Sau PASS) & Độ phủ Đặc tả (`specs.md`)

| Req / Scenario trong `specs.md` | Hiện trạng Trước khi sửa (FAIL) | Test Case / Kịch bản Kiểm chứng thực tế | Kết quả Sau khi sửa |
|---|---|---|---|
| **REQ-DB-SYNC-01** — Khởi động Backend trên PostgreSQL cũ thiếu `Tenants.WalletBalance`, `OrderDetails.ConversionRate`, `EmployeeSchedules.FaceMatchScore` và bảng `SupplierDeliveryConfigs` đã bị xóa | **FAIL**: Crash lúc startup `42703: column t.WalletBalance does not exist` và rollback dây chuyền | Khởi chạy thực tế `MT_GRMS.Api` trên CSDL `mtgrms_db` (`verify_live_api.ps1` bước `[1]`): chạy Migration `20261110014500_SyncTenantWalletAndBranchCatalogSchema` + `EnsureTenantSubscriptionColumnsAsync` + `EnsureBranchProductsSchemaAsync` + `EnsureMissingModelSchemaAsync` (tự động đồng bộ 20 cột thiếu khớp `AppDbContext.Model`) | **PASS** (`Has42703=False`, `HasWalletErr=False`, `HasConversionErr=False`, `DatabaseSeeded=True`) |
| **REQ-DB-SYNC-01** — Thanh toán đơn hàng POS lưu `OrderDetails.ConversionRate`, `ProductUnitID`, `UnitName` | **FAIL**: Alert lỗi trên POS `42703: column "ConversionRate" of relation "OrderDetails" does not exist` | E2E `POST /api/orders` trên `mtgrms_db` (`verify_live_api.ps1` bước `[4]`): tạo đơn thực tế `HD261109193208844` (`FinalAmount = 55,000.00 VND`, `Status = Completed`) trừ kho FEFO thành công | **PASS** (`200 OK`, không còn lỗi `42703`) |
| **REQ-DB-SYNC-01** — Backfill `BranchProducts` idempotent không bật lại SP `Inactive` và không rò rỉ chéo Tenant/Barcode | **FAIL**: Truy vấn seed khớp nhầm `Barcode` của `tenant_mt_mart_01` khiến An Nhiên Mart chỉ có `1 / 1 / 0` SP | E2E kiểm tra lại sau nhiều lần khởi động `DbInitializer` (`verify_live_api.ps1` bước `[3]`): Unique Index `IX_BranchProducts_TenantId_BranchId_ProductId` + mã vạch riêng `8936099880011..8936099880059` giữ đúng **Ba Đình = 5 SP**, **Cầu Giấy = 5 SP**, **Đống Đa = 3 SP** | **PASS** (`5 / 5 / 3` Active Products, idempotent 100%) |
| **REQ-SEED-AUTH-02** — Đăng nhập Chủ cửa hàng `0918889999` / `123456` bằng PBKDF2 ổn định trên DB cũ | **FAIL**: Tài khoản cũ lệch mật khẩu / bị khóa tạm, không có cơ chế đồng bộ idempotent PBKDF2 | Live API `POST /api/auth/login` (`0918889999` / `123456`) (`verify_live_api.ps1` bước `[2]`) | **PASS** (`200 OK`, `role=STORE_OWNER`, `tenant=tenant_an_nhien_02`, `branchId=null`) |
| **REQ-SEED-AUTH-02** — 2 Nhân viên all-time (`0917778888`, `0914445555`) cùng chi nhánh Ba Đình (`BR-AN-01`) đăng nhập nhận `branchId` + claim `"branch_id"`, lịch `00:00:00 - 23:59:59`, `Guid` SHA-256 tất định & lưu đúng họ tên khi mở ca | **FAIL**: Lịch cũ `06:00 - 23:00` chặn mở ca ban đêm; user chuỗi sinh `Guid.Empty` hoặc trùng ID; thiếu `branchId` khi login | - Unit tests: `ResolveDeterministicGuid_ForStringUserIds_ReturnsDistinctDeterministicNonEmptyGuids`, `LoginAsync_ReturnsEmployeeBranchIdAndEmbedsBranchIdClaimInJwt`, `CheckCashierShiftEligibility_WithStringUserIdAndAllTime235959Schedule_AllowsAndOpenShiftStoresEmployeeName`<br>- Live API (`verify_live_api.ps1` bước `[2]` & `[5]`): cả `0917778888` và `0914445555` trả `branchId = b1000000-0000-0000-0000-000000000001` và `CashierEligible = True` | **PASS** (`Unit + Live API PASS`) |
| **REQ-SEED-AUTH-02 (Regression)** — Nhân viên không có lịch trực (`0915556666` / không phân ca) vẫn bị chặn mở ca | Đang PASS (cần bảo toàn) | Unit test `ShiftManagementServiceTests.CheckCashierShiftEligibility_WhenNoScheduleToday_ReturnsNotAllowed` | **PASS** (`IsAllowed = false`) |
| **REQ-EMP-ATTENDANCE-POS-03** — Tự chấm công `POST /api/schedules/{id}/self-check-in` cho NV chưa có FaceID & hiển thị nút **"Vào màn hình Bán hàng POS"** (`/employee/pos`) | **FAIL**: Không có API tự chấm công cho tài khoản test không có webcam/FaceDescriptor; thiếu nút vào nhanh POS sau khi chấm công | - Unit test: `SelfCheckInAsync_EnforcesOwnershipIdempotencyAndFaceDescriptorGuard` (happy path `SELF_CHECK_IN` + `InProgress`)<br>- Live API (`verify_live_api.ps1` bước `[5]`): cả `0917778888` và `0914445555` gọi `self-check-in` thành công (`200 OK`, `CheckInMethod = SELF_CHECK_IN`)<br>- Frontend build/lint cho `AttendancePage.tsx`, `FaceIdAttendanceModal.tsx`, `AppTopNav.tsx` | **PASS** (`Unit + Live API + FE Build PASS`) |
| **REQ-EMP-ATTENDANCE-POS-03 (Edge & Security)** — Chặn gọi lặp `ALREADY_CHECKED_IN` (`409`), chặn chấm hộ người khác (`403`) và chặn bypass khi đã đăng ký `FaceDescriptor` (`FACE_ID_REQUIRED` `400`) | Chưa có chốt chặn | Unit test `SelfCheckInAsync_EnforcesOwnershipIdempotencyAndFaceDescriptorGuard` (kiểm chứng đủ 3 nhánh từ chối và bảo toàn `CheckInTime` gốc) | **PASS** |
| **REQ-OWNER-SHIFTLESS-04** — Chủ cửa hàng (`STORE_OWNER`) bán hàng POS không cần mở/đóng ca & cách ly tiền mặt vào `FinanceAccountType.Safe` (kể cả khi ca nhân viên đang `Closing`) | **FAIL**: `STORE_OWNER` bị chặn bởi modal/banner mở ca và lỗi `SHIFT_NOT_OPEN` / `SHIFT_CLOSING_LOCKDOWN`, hoặc làm lệch `Till` của thu ngân | - Unit test: `CreateOrderAsync_StoreOwnerShiftless_BypassesClosingShiftAndRoutesCashToSafeWithoutTouchingTillOrParticipants`<br>- Live API (`verify_live_api.ps1` bước `[4]`): `0918889999` tạo đơn Tiền mặt với `shiftId = null` trả `200 OK` (`HD261109193208844`, `Status = Completed`)<br>- Frontend `PosCheckoutPage.tsx`, `PosHeader.tsx` ẩn toàn bộ điều khiển mở/chốt ca cho `isStoreOwner` | **PASS** (`ShiftId = null`, tiền vào `Safe`, không chạm `Till` hay `ShiftParticipants`) |
| **REQ-OWNER-SHIFTLESS-04 (Regression & Security)** — Nhân viên `STAFF` giả mạo `creatorRole: "STORE_OWNER"` trong body khi chưa mở ca vẫn bị chặn `SHIFT_NOT_OPEN` | Nguy cơ leo thang đặc quyền nếu tin body request | Unit test `CreateOrderAsync_StoreOwnerShiftless_BypassesClosingShiftAndRoutesCashToSafeWithoutTouchingTillOrParticipants` (nhánh `staffOrderService` gửi `CreatorRole: "STORE_OWNER"`) | **PASS** (bị chặn `SHIFT_NOT_OPEN` theo `_tenantContext.CurrentRole`) |
| **REQ-POS-BRANCH-SWITCH-05** — Chọn/đổi chi nhánh trên POS chỉ hiển thị đúng sản phẩm Active của chi nhánh đó, hỗ trợ `pageSize` tới `1000`, dọn sạch mọi `tabs` hóa đơn và giới hạn quét mã vạch theo chi nhánh | **FAIL**: Clamp `pageSize <= 100`, tự reset `activeBranch` hoặc lộ sản phẩm toàn chuỗi / giữ nguyên giỏ hàng ở tab nền khi đổi chi nhánh | - Unit test: `GetBranchProductsAsync_SupportsPageSizeAbove100ForPosCatalog` (`pageSize = 500`, trả đủ `250` SP)<br>- Live API (`verify_live_api.ps1` bước `[3]`): `GET /api/branches/{id}/products?PageSize=500&Status=Active` trả đúng **Ba Đình = 5 SP**, **Cầu Giấy = 5 SP**, **Đống Đa = 3 SP**<br>- Frontend `PosCheckoutPage.tsx`: `AbortController`, lọc toàn bộ `tabs` (kể cả quà KM) và tra cứu barcode nội bộ chi nhánh | **PASS** (`Unit + Live API + FE Build PASS`) |

---

## 3. Các lệnh Kiểm thử & Kết quả Thực tế

### 3.1. Backend Unit & Integration Regression Suite (`MT_GRMS_BACKEND.sln`)
Lệnh thực thi:
```powershell
dotnet test "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --no-restore -v minimal
```
Kết quả thực tế (Exit code `0`):
- `MT_GRMS.UnitTests`: **Passed! - Failed: 0, Passed: 601, Skipped: 0, Total: 601** (bao gồm 6 test mới trong `PosDbSyncOwnerShiftlessAndBranchCatalogTests` và toàn bộ 595 test hồi quy hiện hữu).
- `MT_GRMS.IntegrationTests`: **Passed! - Failed: 0, Passed: 47, Skipped: 0, Total: 47**.

### 3.2. Live PostgreSQL Startup & End-to-End HTTP Smoke Verification (`mtgrms_db`)
Khởi chạy `MT_GRMS.Api` kết nối PostgreSQL thật (`mtgrms_db`) tại `http://127.0.0.1:5299` và thực thi kịch bản kiểm thử tự động `verify_live_api.ps1` (Exit code `0`):
```text
[1] Startup Log Check -> Has42703=False, HasWalletErr=False, HasConversionErr=False, DatabaseSeeded=True
[2] Login Check:
  - 0918889999 -> role=STORE_OWNER, tenant=tenant_an_nhien_02, branchId=, name=Trần Quốc An (Chủ tiệm An Nhiên)
  - 0917778888 -> role=STAFF, tenant=tenant_an_nhien_02, branchId=b1000000-0000-0000-0000-000000000001, name=Phạm Thị Yến (Nhân viên bán hàng An Nhiên)
  - 0914445555 -> role=STAFF, tenant=tenant_an_nhien_02, branchId=b1000000-0000-0000-0000-000000000001, name=Trần Minh Quân (Nhân viên Ba Đình)
[3] Branch-Scoped Catalog Check:
  - An Nhiên Mart - Chi nhánh Ba Đình (b1000000-0000-0000-0000-000000000001): Active Products Count = 5, TotalItems = 5
  - An Nhiên Mart - Chi nhánh Cầu Giấy (01a1ac70-b750-78d0-aa09-b4b1de071de5): Active Products Count = 5, TotalItems = 5
  - An Nhiên Mart - Chi nhánh Đống Đa (01a1ac70-b7ab-7b84-90b8-5fbacc1fd45d): Active Products Count = 3, TotalItems = 3
[4] Store Owner Shiftless Checkout -> OrderCode=HD261109193208844, FinalAmount=55000.00, Status=Completed
[5] All-Time Employee 0917778888 -> CashierEligible=True, SelfCheckIn=checked-in (method=SELF_CHECK_IN)
[5] All-Time Employee 0914445555 -> CashierEligible=True, SelfCheckIn=checked-in (method=SELF_CHECK_IN)
ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!
```

### 3.3. Frontend Lint & Production Build (`MT_GRMS_FRONTEND`)
Lệnh thực thi:
```powershell
npx oxlint src/features/auth/authService.ts src/features/employee/api/scheduleApi.ts src/layouts/EmployeeLayout/AppTopNav.tsx src/features/employee/pages/AttendancePage.tsx src/features/employee/components/FaceIdAttendanceModal.tsx src/features/pos/api/posOrderApi.ts src/features/pos/components/PosHeader.tsx src/features/pos/pages/PosCheckoutPage.tsx
npm --prefix "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_FRONTEND" run build
```
Kết quả thực tế (Exit code `0`):
- `oxlint`: **`Found 15 warnings and 0 errors`**
- `tsc -b && vite build`: **`✓ 2589 modules transformed ... ✓ built in 796ms`**

---

## 4. Lỗi còn tồn đọng (Remaining Issues)
- **Không có (`0` lỗi tồn đọng).** Tất cả 5 nhóm yêu cầu (`REQ-DB-SYNC-01` .. `REQ-POS-BRANCH-SWITCH-05`), các kịch bản biên/bảo mật và bộ kiểm thử hồi quy đều vượt qua 100%.
