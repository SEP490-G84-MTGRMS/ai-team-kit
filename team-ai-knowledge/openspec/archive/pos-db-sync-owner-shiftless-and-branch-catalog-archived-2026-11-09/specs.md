---
capability: pos-sales-checkout
change: pos-db-sync-owner-shiftless-and-branch-catalog
schema: bug-fix
dependencies:
  - openspec/changes/pos-db-sync-owner-shiftless-and-branch-catalog/exploration.md
---

# Specs: pos-db-sync-owner-shiftless-and-branch-catalog

## Capability Summary
Bản đặc tả delta cho `pos-sales-checkout` nhằm khắc phục triệt để lỗi thiếu cột CSDL khi khởi động Backend (`Tenants.WalletBalance` cùng các cột SaaS/ví) và khi thanh toán đơn hàng POS (`OrderDetails.ConversionRate`), đồng bộ tài khoản kiểm thử Chủ cửa hàng `0918889999` (`123456`) kèm 2 nhân viên trực ca all-time 24/7 cùng chi nhánh Ba Đình (`0917778888`, `0914445555`), bổ sung thao tác tự chấm công vào ca cho nhân viên chưa đăng ký FaceID kèm nút **"Vào màn hình Bán hàng POS"** sau khi chấm công, gỡ bỏ hoàn toàn yêu cầu mở/đóng ca và cách ly két tiền khi Chủ cửa hàng (`STORE_OWNER`) trực tiếp bán hàng trên POS, và đảm bảo chọn/chuyển chi nhánh trên POS chỉ hiển thị và bán đúng sản phẩm Active của chi nhánh đó trên toàn bộ các tab hóa đơn.

## Architecture Map
- **Database / Infrastructure (`MT_GRMS.Infrastructure`)**: EF Core Migration `20261110014500_SyncTenantWalletAndBranchCatalogSchema` + `DbInitializer` (đồng bộ idempotent các cột/bảng PostgreSQL theo khối DDL độc lập, tạo Unique Index và backfill `"BranchProducts"` đúng tên cột `"TenantId"`, `"BranchId"`, `"ProductId"`, upsert lịch 24/7 cho An Nhiên Mart), `UserRepository` (truy vấn `Employee.BranchId` dùng `.IgnoreQueryFilters()` kèm điều kiện tường minh `TenantId`), `BranchProductRepository` (nâng giới hạn `pageSize` phục vụ danh mục POS).
- **API / Middleware / Application (`MT_GRMS.Api`, `MT_GRMS.Application`)**: `MultiTenantMiddleware` & `ITenantContext` (không cho phép header ghi đè JWT đã xác thực, bảo toàn `CurrentRawUserId` + UUID tất định SHA-256 cho user chuỗi), `AuthService` (gắn `BranchId` và claim `"branch_id"` vào JWT), `ShiftService` (hỗ trợ biên ca `00:00:00 - 23:59:59` đến `24:00:00`, lưu tên thật nhân viên mở ca), `ScheduleService` / `SchedulesController` (`POST /api/schedules/{id}/self-check-in`), `BranchProductService` (hỗ trợ `pageSize` tới `1000`), `OrderService` & `CashbookService` (cho phép `STORE_OWNER` bán không mở ca, hạch toán tiền mặt vào `FinanceAccountType.Safe` tách biệt hoàn toàn khỏi `Till` và `ShiftParticipants` của thu ngân).
- **Frontend (`MT_GRMS_FRONTEND`)**: `PosCheckoutPage.tsx`, `PosPaymentPanel.tsx` & `PosHeader.tsx` (bỏ kiểm tra/banner/modal/khóa nút thanh toán theo ca cho `STORE_OWNER`, tách luồng khởi tạo chi nhánh và tải lại sản phẩm từ `/api/branches/{branchId}/products` có chống race condition, lọc lại toàn bộ `tabs` hóa đơn khi đổi chi nhánh), `AttendancePage.tsx`, `FaceIdAttendanceModal.tsx`, `AppTopNav.tsx` & `scheduleApi.ts` (nút chấm công vào ca hôm nay & nút **"Vào màn hình Bán hàng POS"** dẫn tới `/employee/pos`).

## API / Contract

| Method | Path | Request | Response | Lỗi (ProblemDetails / ApiResponse) |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `LoginRequest` (`usernameOrEmail`, `password`) | `ApiResponse<UserInfo>` (`200 OK`, kèm `branchId` của nhân viên, claim `"branch_id"` trong cookie JWT) | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/auth/me` | Cookie / Bearer JWT | `ApiResponse<UserInfo>` (`200 OK`, kèm `branchId` lọc theo `TenantId`) | `401 Unauthorized` |
| `POST` | `/api/schedules/{id}/self-check-in` | Path `id: Guid`, Body `{ note?: string (<= 500 ký tự) }` (Role: `AllStaffAndOwner`, lọc theo `TenantId` & `CurrentRawUserId`) | `ApiResponse<ScheduleResponse>` (`200 OK`, `CheckInMethod = "SELF_CHECK_IN"`) | `401/403` (khác tenant/không chính chủ), `404 Not Found`, `400/409` (`ALREADY_CHECKED_IN`, `FACE_ID_REQUIRED`, sai trạng thái/khung giờ) |
| `GET` | `/api/shifts/cashier-eligibility` | Query `?branchId=<Guid>` (Role: `STAFF` / `STORE_OWNER`, lọc theo `TenantId`) | `ApiResponse<CashierShiftEligibilityResponse>` (`200 OK`, `canOpenShift: true` cho NV trực ca `00:00:00 - 23:59:59`) | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/branches/{branchId}/products` | Query `?pageIndex=1&pageSize=500&status=Active&searchTerm=...` (hỗ trợ `pageSize` tối đa `1000`, lọc theo `TenantId` & `BranchId`) | `ApiResponse<PagedResult<BranchProductDto>>` (`200 OK`, giá tiền `decimal(18,2)`) | `401 Unauthorized`, `404 Not Found` |
| `POST` | `/api/orders` | `OrderCreateRequest` (`branchId`, `items`, `paymentMethod`, `shiftId?: Guid \| null`, tiền tệ `decimal(18,2)`) | `ApiResponse<OrderResponse>` (`200 OK`, lưu đầy đủ `OrderDetails.ConversionRate`, `ProductUnitID`, `UnitName`) | `400 Bad Request`, `401/403`, `409 Conflict` (`SHIFT_NOT_OPEN` / `SHIFT_CLOSING_LOCKDOWN` chỉ áp dụng cho `STAFF`) |

---

## ADDED Requirements

### Requirement: REQ-DB-SYNC-01 Migration EF Core, Đồng bộ Idempotent Schema PostgreSQL lúc khởi động & Backfill Danh mục Chi nhánh
Hệ thống **MUST** bổ sung EF Core Migration chuẩn (không sửa các migration đã merge) và đồng bộ idempotent trong `DbInitializer.InitializeAsync` trước khi thực thi bất kỳ truy vấn EF Core hay nạp dữ liệu mẫu nào:
1. Bảng `"Tenants"` (khóa chính `"TenantID"`) **MUST** được đảm bảo có đầy đủ cả 7 cột mở rộng khớp `TenantConfiguration`: `"WalletBalance" numeric(18,2) NOT NULL DEFAULT 0`, `"SubscriptionExpiresAt" timestamp with time zone NULL`, `"GracePeriodExpiresAt" timestamp with time zone NULL`, `"LockType" character varying(50) NULL`, `"LockReason" character varying(500) NULL`, `"LockedAt" timestamp with time zone NULL`, `"LockedBy" character varying(100) NULL`. Các bảng `"WalletTransactions"`, `"WalletTopupOrders"`, `"BranchProductUnitPrices"`, `"LoyaltySettings"` **MUST** được đảm bảo tồn tại bằng `CREATE TABLE IF NOT EXISTS` khớp cấu hình Entity.
2. Bảng `"OrderDetails"` **MUST** có đầy đủ `"ProductUnitID" uuid NULL`, `"UnitName" character varying(50) NULL` (khớp `OrderDetailConfiguration`), và `"ConversionRate" numeric(18,4) NOT NULL DEFAULT 1.00` (chuẩn hóa mọi dòng cũ có giá trị `NULL` hoặc `<= 0` về `1.00` trước khi đặt `NOT NULL`); bảng `"Orders"` **MUST** có đầy đủ các cột khuyến mãi/voucher/điểm thưởng.
3. Hệ thống **MUST** tách riêng từng khối lệnh DDL nâng cấp bảng, bắt buộc dùng `ALTER TABLE IF EXISTS` cho các bảng có khả năng đã bị gỡ bỏ (như `"SupplierDeliveryConfigs"`), không nuốt lỗi câm khi đồng bộ schema cốt lõi và chỉ ghi nhận vào `"__EFMigrationsHistory"` sau khi khối schema tương ứng đã thực thi thành công.
4. Trên bảng `"BranchProducts"` (sử dụng đúng tên cột phân biệt hoa-thường **`"TenantId"`**, **`"BranchId"`**, **`"ProductId"`**), hệ thống **MUST** khử trùng lặp (nếu có) và tạo `UNIQUE INDEX IF NOT EXISTS "IX_BranchProducts_TenantId_BranchId_ProductId" ON "BranchProducts" ("TenantId", "BranchId", "ProductId") WHERE "IsDeleted" = false`. Hệ thống **MUST** backfill idempotent vào `"BranchProducts"` (`"Status" = 'Active'`) từ `"BranchStocks"` có join đối chiếu khớp `"TenantId"` của `"Branches"` và `"Products"`, **chỉ chèn khi chưa tồn tại bất kỳ dòng `(TenantId, BranchId, ProductId)` nào** (kể cả dòng `Inactive` hoặc `IsDeleted = true` để không bật lại sản phẩm chủ cửa hàng đã tắt), đồng thời seed rõ danh mục `"BranchProducts"` theo từng chi nhánh An Nhiên Mart (`BR-AN-01`: 5 SP, `BR-AN-02`: 5 SP, `BR-AN-03`: 3 SP).

#### Scenario: Tái hiện lỗi cũ — Khởi động Backend trên CSDL PostgreSQL cũ thiếu cột của Tenants, OrderDetails và bảng SupplierDeliveryConfigs đã bị xóa
- **GIVEN** CSDL PostgreSQL hiện hữu đã có bảng `"Tenants"` và `"OrderDetails"` nhưng thiếu `"Tenants"."WalletBalance"` (cùng các cột khóa/hạn gói cước), thiếu `"OrderDetails"."ConversionRate"`, và bảng `"SupplierDeliveryConfigs"` đã bị drop
- **WHEN** Ứng dụng `MT_GRMS.Api` khởi chạy và gọi `DbInitializer.InitializeAsync`
- **THEN** Hệ thống bổ sung đầy đủ 7 cột của `"Tenants"`, các bảng ví, các cột đơn vị của `"OrderDetails"`, bỏ qua an toàn lệnh trên `"SupplierDeliveryConfigs"` không gây rollback dây chuyền, và hoàn tất toàn bộ quá trình seed không còn lỗi `42703`.

#### Scenario: Tái hiện lỗi cũ — Thanh toán đơn hàng POS lưu chi tiết đơn vị tính và hệ số quy đổi
- **GIVEN** Backend đã đồng bộ schema trên PostgreSQL và người dùng thêm sản phẩm vào giỏ hàng trên POS (`localhost:5174`)
- **WHEN** Người dùng nhấn **Thanh toán** gửi `POST /api/orders`
- **THEN** Hệ thống lưu `"Orders"` và `"OrderDetails"` (`"ConversionRate"`, `"ProductUnitID"`, `"UnitName"`) thành công, trừ kho FEFO trên `"BranchStocks"` và trả về `200 OK`.

#### Scenario: Edge case — Backfill BranchProducts nhiều lần không bật lại sản phẩm đã ngừng kinh doanh và không rò rỉ chéo Tenant
- **GIVEN** Chi nhánh `BR-AN-01` của `"tenant_an_nhien_02"` có 1 mặt hàng đã được chủ cửa hàng chuyển sang `Status = 'Inactive'` (hoặc xóa mềm) nhưng vẫn còn tồn trong `"BranchStocks"`
- **WHEN** Khởi động lại `MT_GRMS.Api` chạy `DbInitializer.InitializeAsync`
- **THEN** Không có dòng `"BranchProducts"` trùng lặp nào được tạo thêm, mặt hàng `Inactive` vẫn giữ nguyên trạng thái `Inactive`, và không có sản phẩm nào của Tenant khác bị chèn chéo.

---

### Requirement: REQ-SEED-AUTH-02 Đồng bộ tài khoản Chủ cửa hàng 0918889999, Upsert 2 Nhân viên All-Time cùng Chi nhánh & Định danh ổn định User/Branch
Trong quá trình khởi tạo dữ liệu mẫu kiểm thử (`DbInitializer` ở môi trường Development/Test, **MUST NOT** tạo nhánh bypass mật khẩu cứng trong `AuthService.VerifyPasswordAsync` để không tạo backdoor Production hay làm hỏng luồng Đổi mật khẩu), hệ thống **MUST** đồng bộ idempotent `PasswordHash = PasswordHasher.HashPassword("123456")` (PBKDF2), `IsActive = true`, `FailedLoginAttempts = 0`, `LockedUntil = null` cho:
1. Chủ cửa hàng An Nhiên Mart: SĐT `"0918889999"` (`Trần Quốc An`, `TenantId = "tenant_an_nhien_02"`, `Role = "STORE_OWNER"`).
2. Nhân viên all-time 1 tại **An Nhiên Mart - Chi nhánh Ba Đình (`BR-AN-01`)**: SĐT `"0917778888"` (`Phạm Thị Yến`, `NV-AN-01`, `Role = "STAFF"`).
3. Nhân viên all-time 2 tại **An Nhiên Mart - Chi nhánh Ba Đình (`BR-AN-01`)**: SĐT `"0914445555"` (`Trần Minh Quân`, `NV-AN-04`, `Role = "STAFF"`).
Hệ thống **MUST** thực hiện **upsert (tạo mới hoặc cập nhật cả các bản ghi lịch `06:00 - 23:00` đã tồn tại chưa hoàn thành trong DB)** cho cả 2 nhân viên `0917778888` và `0914445555` sang khung giờ `00:00:00 - 23:59:59` (`AllowedCheckInStart = 00:00:00`, `AllowedCheckInEnd = 23:59:59`, `Status = Scheduled` nếu chưa `InProgress`/`Completed`) từ `-7` đến `+30` ngày quanh ngày hiện tại; giữ nguyên `"0915556666"` (`Nguyễn Văn Minh`, `NV-AN-03`) không phân ca để kiểm thử chặn ngoài ca, đồng thời đồng bộ danh sách `DEMO_ACCOUNTS` trên Frontend `authService.ts`.
Khi xử lý `POST /api/auth/login`, `POST /api/auth/refresh` và `GET /api/auth/me`, hệ thống **MUST** tra cứu `BranchId` của hồ sơ `Employee` bằng truy vấn có `.IgnoreQueryFilters()` kèm điều kiện tường minh `!e.IsDeleted && e.TenantId == resolvedTenantId && e.UserId == user.Id && e.Status == EmployeeStatus.Active` (với `STORE_OWNER` không có hồ sơ `Employee` thì `BranchId = null`), trả về trong `UserInfo` và ghi claim `"branch_id"` vào JWT khi `BranchId.HasValue`.
Khi `HttpContext.User.Identity.IsAuthenticated == true`, `MultiTenantMiddleware` **MUST** lấy `TenantId`, `Role`, `BranchId`, `CurrentRawUserId` từ JWT (không cho header `X-Tenant-Id` / `X-User-Role` ghi đè); nếu claim định danh user là chuỗi không phải UUID chuẩn, hệ thống **MUST** bảo toàn `CurrentRawUserId` và sinh `CurrentUserId` (`Guid`) tất định bằng **16 byte đầu của `SHA256("mt-grms-user:" + rawUserId.Trim())`** (khác `Guid.Empty`, bất biến qua mọi lần restart). Trong `ShiftService`, hệ thống **MUST** tra cứu nhân viên theo `CurrentRawUserId`, lưu đúng `FullName`/`UserName` của nhân viên mở ca vào `ShiftParticipants`, và xử lý cửa sổ `AllowedCheckInEnd >= 23:59:00` bao phủ đến hết ngày (`TimeSpan.FromDays(1)` = `24:00:00`).

#### Scenario: Đăng nhập Chủ cửa hàng 0918889999 bằng mật khẩu 123456 trên CSDL đã có sẵn bản ghi cũ
- **GIVEN** Bảng `"Users"` trong môi trường kiểm thử đã có sẵn bản ghi `0918889999` từ trước
- **WHEN** Người dùng gửi `POST /api/auth/login` với `usernameOrEmail = "0918889999"` và `password = "123456"`
- **THEN** Hệ thống xác thực thành công qua `PasswordHash` PBKDF2, trả về `200 OK` với `role = "STORE_OWNER"`, `tenantId = "tenant_an_nhien_02"`, `branchId = null`.

#### Scenario: Hai nhân viên all-time cùng chi nhánh Ba Đình đăng nhập trên CSDL từng có lịch cũ 06:00-23:00 và mở/tham gia ca lúc rạng sáng (01:30 sáng)
- **GIVEN** CSDL trước đó từng lưu lịch `06:00 - 23:00` cho `0917778888`, sau khi khởi động lại `DbInitializer` đã upsert lịch sang `00:00:00 - 23:59:59`, và đồng hồ hệ thống đang ở `01:30` sáng (`Asia/Ho_Chi_Minh`)
- **WHEN** Nhân viên 1 (`0917778888` / `123456`) và Nhân viên 2 (`0914445555` / `123456`) đăng nhập
- **THEN** Cả 2 nhận được đúng `branchId` của **Chi nhánh Ba Đình** trong `UserInfo` và trong claim `"branch_id"` của JWT; `GET /api/shifts/cashier-eligibility` trả về `canOpenShift = true`; Nhân viên 1 mở ca và Nhân viên 2 tham gia ca với 2 `Guid` SHA-256 tất định khác nhau và hiển thị đúng họ tên từng nhân viên trong `ShiftParticipants`.

#### Scenario: Regression — Nhân viên không có lịch trực (0915556666) vẫn bị chặn mở ca
- **GIVEN** Nhân viên `0915556666` (`Nguyễn Văn Minh`) không có lịch trực trong ngày hôm nay
- **WHEN** Nhân viên này gọi `GET /api/shifts/cashier-eligibility` hoặc `POST /api/shifts/open`
- **THEN** Hệ thống từ chối mở ca với lý do chưa có lịch phân công trực ca hợp lệ.

---

### Requirement: REQ-EMP-ATTENDANCE-POS-03 Tự chấm công vào ca có kiểm soát & Hiển thị nút Vào màn hình Bán hàng POS cho Nhân viên
Hệ thống **MUST** cung cấp endpoint `POST /api/schedules/{id}/self-check-in` (`[Authorize(Roles = SystemRoles.AllStaffAndOwner)]`) cho phép nhân viên tự ghi nhận giờ vào ca (`CheckInTime`) với đầy đủ các chốt chặn bảo mật và toàn vẹn dữ liệu:
1. **Xác thực chính chủ & Đa tenant**: Bắt buộc kiểm tra `CurrentRawUserId` từ JWT không rỗng, `schedule.TenantId == CurrentTenantId`, `schedule.Employee.UserId == CurrentRawUserId` và `schedule.Employee.Status == EmployeeStatus.Active`; nếu vi phạm **MUST** từ chối với `401/403`.
2. **Bảo vệ luồng AI FaceID**: Chỉ cho phép `self-check-in` khi nhân viên chưa đăng ký mẫu khuôn mặt (`string.IsNullOrWhiteSpace(schedule.Employee.FaceDescriptor)`); nếu nhân viên đã đăng ký `FaceDescriptor`, hệ thống **MUST** từ chối với `400 Bad Request` (`FACE_ID_REQUIRED`) để bắt buộc dùng nhận diện khuôn mặt AI.
3. **Kiểm tra trạng thái, khung giờ & chống gọi lặp**: Chỉ chấp nhận khi `schedule.Status == ScheduleStatus.Scheduled` (từ chối `Draft`, `Completed`, `Cancelled`, `Absent`, `OnLeave`), `schedule.WorkDate.Date == vnNow.Date` (`vnNow = DateTime.UtcNow.AddHours(7)` theo chuẩn `DateTimeKind.Unspecified` đồng nhất tuyệt đối với `CheckInFaceIdAsync` / `CheckOutFaceIdAsync`), thời điểm hiện tại nằm trong cửa sổ `[startWindow, endWindow]`, và `note` dài tối đa `500` ký tự. Nếu `schedule.CheckInTime.HasValue` đã tồn tại, hệ thống **MUST** từ chối `409 Conflict` (`ALREADY_CHECKED_IN`), tuyệt đối không ghi đè `CheckInTime` hay `LateMinutes` ban đầu. Khi hợp lệ, hệ thống ghi `CheckInTime = vnNow`, `CheckInMethod = "SELF_CHECK_IN"`, tính `LateMinutes` theo `BranchAttendancePolicy`, chuyển `Status = ScheduleStatus.InProgress`.
4. **Giao diện Cổng Nhân Viên & Điều hướng sang POS**: Trên `AttendancePage` và `FaceIdAttendanceModal`, với mỗi ca `Scheduled` trong ngày hôm nay chưa có `checkInTime` (và nhân viên chưa có FaceID hoặc cần chọn phương thức), hệ thống **SHALL** hiển thị nút **"Chấm công vào ca"** bên cạnh **"Chấm công AI FaceID"**. Ngay khi nhân viên có ít nhất một ca trong ngày hôm nay đang ở trạng thái đã vào ca (`checkInTime != null && !checkOutTime`), hệ thống **MUST** hiển thị nổi bật nút **"Vào màn hình Bán hàng POS"** dẫn tới `/employee/pos` trên `AttendancePage`, `FaceIdAttendanceModal` và đồng bộ tức thời lên `EmployeeLayout/AppTopNav` qua sự kiện trạng thái chấm công mà không cần tải lại trang.

#### Scenario: Nhân viên kiểm thử (chưa đăng ký FaceDescriptor) tự chấm công vào ca và vào màn POS
- **GIVEN** Nhân viên `0917778888` (`FaceDescriptor == null`) đăng nhập vào `/employee/attendance` và có ca `Scheduled` hôm nay chưa có `checkInTime`
- **WHEN** Nhân viên nhấn nút **"Chấm công vào ca"**
- **THEN** `POST /api/schedules/{id}/self-check-in` lưu `CheckInTime` (cùng hệ quy chiếu giờ với `CheckOutFaceIdAsync`), `CheckInMethod = "SELF_CHECK_IN"`, chuyển `Status = InProgress`, và cả `AttendancePage` lẫn `AppTopNav` lập tức hiển thị nút **"Vào màn hình Bán hàng POS"** điều hướng tới `/employee/pos`.

#### Scenario: Edge case — Chặn gọi lặp self-check-in, chặn chấm hộ người khác và chặn bypass khi đã đăng ký FaceID
- **GIVEN** Nhân viên A đã chấm công vào ca (`CheckInTime` đã có), hoặc gọi `self-check-in` vào lịch của Nhân viên B, hoặc Nhân viên C đã đăng ký `FaceDescriptor` gọi `self-check-in`
- **WHEN** Request gửi tới `POST /api/schedules/{id}/self-check-in`
- **THEN** Hệ thống lần lượt từ chối với `ALREADY_CHECKED_IN` (`409`), `403 Forbidden`, và `FACE_ID_REQUIRED` (`400`), giữ nguyên toàn vẹn dữ liệu chấm công.

---

### Requirement: REQ-OWNER-SHIFTLESS-04 Chủ cửa hàng (STORE_OWNER) bán hàng POS trực tiếp không cần mở/đóng ca & Cách ly hoàn toàn khỏi Két thu ngân
Hệ thống **MUST** xác định quyền bán hàng không cần ca (`isOwnerOrAdmin`) duy nhất dựa trên vai trò đã xác thực trong `_tenantContext.CurrentRole` (`STORE_OWNER` hoặc `ADMIN`), tuyệt đối **MUST NOT** tin vào trường `request.CreatorRole` từ payload client.
Khi người dùng có vai trò `STORE_OWNER` (hoặc `ADMIN`) truy cập màn hình POS (`/pos`):
1. **Frontend (`PosCheckoutPage`, `PosPaymentPanel`, `PosHeader`)**: Hệ thống **MUST NOT** tự bật modal Mở ca / Đóng ca, **MUST** ẩn hoàn toàn banner vàng `"Chưa mở ca làm việc"`, banner đỏ `"Ca làm việc đang trong quá trình kiểm đếm chốt sổ"` và các mục Mở ca / Kết thúc ca trên `PosHeader`, đồng thời `PosPaymentPanel` **MUST NOT** khóa nút **Thanh toán** (`isCheckoutDisabled = false` cho `isStoreOwner`) và gửi `shiftId: undefined` khi tạo đơn.
2. **Backend (`OrderService` & `CashbookService`)**: Khi `isOwnerOrAdmin` thực hiện bán lẻ (`CreateOrderAsync`), đặt trước (`CreatePreOrderAsync`), giao đơn đặt trước (`FulfillPreOrderAsync`) hoặc đổi/trả hàng (`ProcessReturnOrExchangeAsync`) mà không truyền `ShiftId`:
   - Hệ thống **MUST** bỏ qua kiểm tra chặn `SHIFT_CLOSING_LOCKDOWN`, giữ `Order.ShiftId = null`, và **MUST NOT** thêm `STORE_OWNER` vào bảng `ShiftParticipants` của bất kỳ ca thu ngân nào đang mở tại chi nhánh;
   - Với thanh toán/hoàn tiền **Tiền mặt (`CASH`)** của đơn không gắn ca (`ShiftId == null`), hệ thống **MUST** hạch toán vào **Két sắt chi nhánh (`FinanceAccountType.Safe` qua `GetOrCreateSafeAsync`)** thay vì `FinanceAccountType.Till`, tuyệt đối **MUST NOT** làm thay đổi `till.CurrentBalance`, `shift.TotalCashIn`, `shift.TotalCashOut` hay `shift.ExpectedCash` của ca nhân viên (và không bị ghi đè mất tiền khi thu ngân đóng ca); với chuyển khoản vẫn hạch toán vào `FinanceAccountType.Bank`.
3. **Giữ nguyên kiểm soát đối với Thu ngân (`STAFF`)**: Với vai trò `STAFF`, hệ thống **MUST** bắt buộc có ca đang mở tại chi nhánh (`SHIFT_NOT_OPEN` nếu chưa mở ca, `SHIFT_CLOSING_LOCKDOWN` nếu ca đang `Closing`) cả trên giao diện và trong `OrderService`.

#### Scenario: Tái hiện lỗi cũ — Chủ cửa hàng đăng nhập POS bán hàng ngay khi chi nhánh chưa có ca mở
- **GIVEN** Chủ cửa hàng `0918889999` (`STORE_OWNER`) mở màn `/pos` tại chi nhánh Ba Đình đang không có ca mở (`currentShift == null`)
- **WHEN** Chủ cửa hàng thêm hàng vào giỏ và nhấn **Thanh toán** bằng Tiền mặt `100,000` VND
- **THEN** Giao diện không hiện banner/modal mở ca, nút Thanh toán hoạt động bình thường, `POST /api/orders` lưu đơn với `ShiftId = null` và ghi bút toán thu `+100,000.00` VND vào `FinanceAccountType.Safe` của chi nhánh Ba Đình.

#### Scenario: Edge case — Chủ cửa hàng bán tiền mặt trong lúc ca nhân viên đang Open hoặc Closing không làm lệch két thu ngân
- **GIVEN** Nhân viên thu ngân tại chi nhánh Ba Đình đang có ca ở trạng thái `Closing` với `ExpectedCash = 500,000` VND trong `Till`
- **WHEN** Chủ cửa hàng `0918889999` tạo đơn bán lẻ Tiền mặt `200,000` VND trên `/pos` và sau đó nhân viên hoàn tất chốt ca với tiền giữ lại đầu ca `300,000` VND
- **THEN** Đơn của Chủ cửa hàng không bị chặn bởi `SHIFT_CLOSING_LOCKDOWN` hay nút disabled, `STORE_OWNER` không bị thêm vào `ShiftParticipants`, `ExpectedCash` của ca nhân viên giữ nguyên `500,000` VND, và khoản `200,000` VND của Chủ cửa hàng nằm an toàn trong `Safe` (không bị ghi đè khi `Till` reset về `300,000` VND).

#### Scenario: Regression & Security — Nhân viên STAFF gửi giả mạo creatorRole = "STORE_OWNER" khi chưa mở ca vẫn bị chặn
- **GIVEN** Nhân viên `0917778888` (`JWT role = STAFF`) tại chi nhánh chưa mở ca gửi `POST /api/orders` kèm body `creatorRole: "STORE_OWNER"`
- **WHEN** `OrderService.CreateOrderAsync` kiểm tra quyền theo `_tenantContext.CurrentRole`
- **THEN** Hệ thống bỏ qua `request.CreatorRole`, từ chối tạo đơn với lỗi `SHIFT_NOT_OPEN` và không ghi đơn hàng.

---

### Requirement: REQ-POS-BRANCH-SWITCH-05 Tự động tải & chỉ hiển thị đúng sản phẩm Active của Chi nhánh đang chọn trên toàn bộ Tab POS
Hệ thống **MUST** nâng giới hạn `pageSize` tối đa trong `BranchProductService.GetBranchProductsAsync` và `BranchProductRepository.GetPagedBranchProductsAsync` lên `1000` (`Math.Clamp(pageSize, 1, 1000)`) để đáp ứng truy vấn danh mục POS của chi nhánh có trên 100 mặt hàng.
Trên màn hình POS (`PosCheckoutPage`), hệ thống **MUST**:
1. Khởi tạo danh sách sản phẩm rỗng `[]` (**MUST NOT** khởi tạo từ `mockProducts` / `mockProductsAnNhien` và **MUST NOT** gọi `/api/products` toàn chuỗi khi `activeBranch.id` chưa có GUID hợp lệ).
2. Tách bạch `useEffect` khởi tạo danh sách chi nhánh (chạy theo phiên đăng nhập/tenant, không tự reset `activeBranch` khi người dùng đổi chi nhánh) với `useEffect` tải sản phẩm từ `GET /api/branches/{activeBranch.id}/products?pageSize=500&status=Active`, có `AbortController` / cờ chống race condition để phản hồi chậm của chi nhánh cũ không bao giờ ghi đè lên chi nhánh vừa chọn.
3. Khi chuyển đổi từ Chi nhánh A sang Chi nhánh B, hệ thống **MUST** rà soát trên **toàn bộ các tab hóa đơn (`tabs`, không chỉ `currentTab`)**: tự động gỡ bỏ mọi dòng sản phẩm (kể cả hàng khuyến mãi tặng kèm) không thuộc danh mục Active của Chi nhánh B kèm thông báo cho người dùng, cập nhật lại đơn giá bán lẻ / `unitPrices` / tồn kho theo Chi nhánh B cho các mặt hàng còn hợp lệ và tính lại khuyến mãi tự động.
4. Khi quét mã vạch lúc đã có `activeBranch.id`: ưu tiên khớp trong danh mục Active đã tải của chi nhánh; nếu chưa thấy trong bộ nhớ thì chỉ được truy vấn bổ sung `GET /api/branches/{activeBranch.id}/products?searchTerm={barcode}&status=Active&pageSize=20` (cô lập chặt theo `TenantId` + `BranchId`), tuyệt đối **MUST NOT** gọi `/api/products/barcode/{code}` toàn chuỗi.

#### Scenario: Tái hiện lỗi cũ — Chủ cửa hàng chuyển đổi qua lại giữa các chi nhánh trên POS
- **GIVEN** Chủ cửa hàng `0918889999` đang ở màn `/pos` của An Nhiên Mart: Chi nhánh Ba Đình (`BR-AN-01`) có 5 sản phẩm Active, Chi nhánh Đống Đa (`BR-AN-03`) chỉ có 3 sản phẩm Active
- **WHEN** Chủ cửa hàng đổi chi nhánh trên `PosHeader` từ **Chi nhánh Ba Đình** sang **Chi nhánh Đống Đa**
- **THEN** Màn hình POS gọi `GET /api/branches/{idDongDa}/products` và lưới sản phẩm chỉ hiển thị đúng 3 sản phẩm Active của Chi nhánh Đống Đa, không bị nhảy ngược `activeBranch` về Ba Đình và không hiện sản phẩm của chi nhánh khác.

#### Scenario: Edge case — Đổi chi nhánh khi nhiều Tab hóa đơn đang giữ sản phẩm của chi nhánh cũ và chi nhánh có > 100 SKU
- **GIVEN** Trên POS đang mở `Hóa đơn 1` và `Hóa đơn 2`, trong đó `Hóa đơn 2` chứa mặt hàng chỉ bán tại Ba Đình; hoặc một chi nhánh có `250` sản phẩm Active
- **WHEN** Người dùng chuyển sang Chi nhánh Đống Đa (hoặc chọn chi nhánh có `250` sản phẩm)
- **THEN** Mặt hàng không thuộc Chi nhánh Đống Đa trong cả `Hóa đơn 1` và `Hóa đơn 2` đều được gỡ sạch kèm thông báo; với chi nhánh có `250` sản phẩm, API trả về đủ cả `250` sản phẩm (không bị cắt ở `100`) và quét mã vạch mặt hàng thứ `201` hoạt động chính xác.

#### Scenario: Edge case — Quét mã vạch sản phẩm thuộc chi nhánh khác
- **GIVEN** POS đang chọn **Chi nhánh Đống Đa** và người dùng quét mã vạch của sản phẩm thuộc cùng Tenant nhưng chỉ gán Active ở **Chi nhánh Ba Đình**
- **WHEN** Sự kiện quét mã vạch hoàn tất
- **THEN** Hệ thống chỉ kiểm tra trong phạm vi Chi nhánh Đống Đa, thông báo sản phẩm không kinh doanh tại chi nhánh hiện tại và không thêm vào giỏ hàng.

---

## Acceptance checklist
- [ ] **REQ-DB-SYNC-01**: Có EF Core Migration mới + `DbInitializer` đồng bộ đầy đủ 7 cột mở rộng của `"Tenants"`, các bảng ví, các cột đơn vị `"OrderDetails"` (`varchar(50)`), khối DDL độc lập `IF EXISTS`, Unique Index và backfill `"BranchProducts"` đúng cột `"TenantId"`, `"BranchId"`, `"ProductId"`.
- [ ] **REQ-SEED-AUTH-02**: `0918889999` / `123456` xác thực PBKDF2 ổn định (không backdoor `AuthService`); upsert lịch 24/7 (`00:00:00 - 23:59:59`) cho 2 nhân viên `0917778888` và `0914445555` cùng chi nhánh Ba Đình; trả `BranchId` (`.IgnoreQueryFilters()` + `TenantId`) kèm claim `"branch_id"` trong JWT và sinh `Guid` SHA-256 tất định cho user chuỗi.
- [ ] **REQ-EMP-ATTENDANCE-POS-03**: `POST /api/schedules/{id}/self-check-in` kiểm tra chặt chính chủ `CurrentRawUserId`, `TenantId`, chặn gọi lặp `ALREADY_CHECKED_IN`, chặn bypass khi đã có `FaceDescriptor`, khớp múi giờ `CheckInTime` với `CheckOutFaceIdAsync`, và hiển thị ngay nút **"Vào màn hình Bán hàng POS"** (`/employee/pos`) trên cả `AttendancePage`, `FaceIdAttendanceModal`, `AppTopNav`.
- [ ] **REQ-OWNER-SHIFTLESS-04**: Chủ cửa hàng (`STORE_OWNER`) xét theo JWT role bán POS không hiện bất kỳ banner/modal/khóa nút mở-đóng ca nào, `Order.ShiftId = null`, không ghi `ShiftParticipants`, và hạch toán tiền mặt vào `FinanceAccountType.Safe` tách biệt hoàn toàn khỏi `Till` của thu ngân (cả bán lẻ, đặt trước, đổi trả).
- [ ] **REQ-POS-BRANCH-SWITCH-05**: Nâng clamp `pageSize` lên `1000`, tách `useEffect` chi nhánh & sản phẩm có `AbortController`, làm sạch toàn bộ `tabs` hóa đơn khi đổi chi nhánh và giới hạn quét mã vạch trong đúng danh mục chi nhánh đang chọn.
