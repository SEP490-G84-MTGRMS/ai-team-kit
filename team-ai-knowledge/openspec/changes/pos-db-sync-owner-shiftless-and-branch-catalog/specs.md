---
capability: pos-sales-checkout
change: pos-db-sync-owner-shiftless-and-branch-catalog
schema: bug-fix
dependencies:
  - openspec/changes/pos-db-sync-owner-shiftless-and-branch-catalog/exploration.md
---

# Specs: pos-db-sync-owner-shiftless-and-branch-catalog

## Capability Summary
Bản đặc tả delta cho `pos-sales-checkout` nhằm khắc phục triệt để lỗi thiếu cột CSDL khi khởi động Backend (`Tenants.WalletBalance`) và khi thanh toán đơn hàng POS (`OrderDetails.ConversionRate`), cố định tài khoản kiểm thử Chủ cửa hàng `0918889999` (`123456`) kèm 2 nhân viên trực ca all-time 24/7 cùng chi nhánh Ba Đình (`0917778888`, `0914445555`), bổ sung thao tác tự chấm công vào ca và nút **"Vào màn hình Bán hàng POS"** cho Nhân viên sau khi chấm công, gỡ bỏ hoàn toàn yêu cầu mở/đóng ca khi Chủ cửa hàng (`STORE_OWNER`) trực tiếp bán hàng trên POS, và đảm bảo chọn/chuyển chi nhánh trên POS chỉ hiển thị đúng sản phẩm Active được gán tại chi nhánh đó.

## Architecture Map
- **Database / Infrastructure (`MT_GRMS.Infrastructure`)**: `DbInitializer` (đồng bộ idempotent các cột/bảng PostgreSQL theo khối DDL độc lập, backfill `BranchProducts` từ `BranchStocks` và seed An Nhiên Mart), `UserRepository` (truy vấn `Employee.BranchId` theo `TenantId` + `UserId`).
- **API / Middleware / Application (`MT_GRMS.Api`, `MT_GRMS.Application`)**: `MultiTenantMiddleware` & `ITenantContext` (chuẩn hóa `CurrentRawUserId` + `Guid` tất định cho user chuỗi), `AuthService` (hardcode/seed mật khẩu `123456` cho `0918889999`, gắn `BranchId`), `ShiftService` (hỗ trợ biên ca `00:00:00 - 23:59:59` và tra cứu nhân viên theo `CurrentRawUserId`), `ScheduleService` / `SchedulesController` (`POST /api/schedules/{id}/self-check-in`), `OrderService` (cho phép `STORE_OWNER` tạo đơn độc lập không phụ thuộc ca thu ngân).
- **Frontend (`MT_GRMS_FRONTEND`)**: `PosCheckoutPage.tsx` & `PosHeader.tsx` (bỏ kiểm tra/banner/modal mở-đóng ca cho `STORE_OWNER`, tải lại sản phẩm từ `/api/branches/{branchId}/products` theo `activeBranch.id`), `AttendancePage.tsx`, `FaceIdAttendanceModal.tsx`, `AppTopNav.tsx` & `scheduleApi.ts` (nút chấm công vào ca hôm nay & nút **"Vào màn hình Bán hàng POS"** dẫn tới `/employee/pos`).

## API / Contract

| Method | Path | Request | Response | Lỗi (ProblemDetails / ApiResponse) |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `LoginRequest` (`usernameOrEmail`, `password`) | `ApiResponse<UserInfo>` (`200 OK`, kèm `branchId` của nhân viên và cookie JWT) | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/auth/me` | Cookie / Bearer JWT | `ApiResponse<UserInfo>` (`200 OK`, kèm `branchId` lọc theo `TenantId`) | `401 Unauthorized` |
| `POST` | `/api/schedules/{id}/self-check-in` | Path `id: Guid`, Body `{ note?: string }` (Role: `AllStaffAndOwner`, lọc theo `TenantId` & chính chủ `Employee.UserId`) | `ApiResponse<ScheduleResponse>` (`200 OK`, ghi nhận `checkInTime` theo giờ Việt Nam `Asia/Ho_Chi_Minh`, lưu audit UTC) | `401/403` (khác tenant hoặc chấm hộ người khác), `404 Not Found`, `400/422` (không phải lịch ngày hôm nay hoặc ca đã hủy) |
| `GET` | `/api/shifts/cashier-eligibility` | Query `?branchId=<Guid>` (Role: `STAFF` / `STORE_OWNER`, lọc theo `TenantId`) | `ApiResponse<CashierShiftEligibilityResponse>` (`200 OK`, `canOpenShift: true` cho NV trực ca `00:00:00 - 23:59:59`) | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/branches/{branchId}/products` | Query `?PageSize=500&Status=Active` (lọc theo `TenantId` & `BranchId`) | `ApiResponse<PagedResult<BranchProductResponse>>` (`200 OK`, giá tiền `decimal(18,2)`) | `401 Unauthorized`, `404 Not Found` |
| `POST` | `/api/orders` | `OrderCreateRequest` (`branchId`, `items`, `paymentMethod`, `shiftId?: Guid | null`, tiền tệ `decimal(18,2)`) | `ApiResponse<OrderResponse>` (`200 OK`, lưu đầy đủ `OrderDetails.ConversionRate`, `ProductUnitID`, `UnitName`) | `400 Bad Request`, `401/403`, `409 Conflict` — **KHÔNG** còn lỗi SQL `42703` và **KHÔNG** chặn `STORE_OWNER` vì trạng thái ca |

---

## ADDED Requirements

### Requirement: REQ-DB-SYNC-01 Đồng bộ Idempotent Schema PostgreSQL lúc khởi động & Cô lập khối DDL kèm Backfill Danh mục Chi nhánh
Khi khởi chạy ứng dụng (`DbInitializer.InitializeAsync`), hệ thống **MUST** đồng bộ đầy đủ các cột và bảng còn thiếu trước khi thực thi bất kỳ truy vấn EF Core hay nạp dữ liệu mẫu nào, bao gồm:
1. Bảng `"Tenants"` **MUST** có cột `"WalletBalance" numeric(18,2) NOT NULL DEFAULT 0` (cùng các cột quản lý gói cước/khóa tenant liên quan) và các bảng ví `"WalletTransactions"`, `"WalletTopupOrders"`, `"BranchProductUnitPrices"`, `"LoyaltySettings"` **MUST** được đảm bảo tồn tại bằng `CREATE TABLE IF NOT EXISTS`.
2. Bảng `"OrderDetails"` **MUST** có đầy đủ các cột `"ProductUnitID" uuid NULL`, `"UnitName" character varying(100) NULL`, và `"ConversionRate" numeric(18,4) NOT NULL DEFAULT 1.00`; bảng `"Orders"` **MUST** có đầy đủ các cột khuyến mãi/voucher/điểm thưởng tương ứng với `OrderConfiguration`.
3. Hệ thống **MUST** tách riêng các khối lệnh DDL nâng cấp bảng và bắt buộc dùng `ALTER TABLE IF EXISTS` cho các bảng có khả năng đã bị gỡ bỏ (như `"SupplierDeliveryConfigs"`), tuyệt đối **MUST NOT** để lỗi ở một bảng cũ làm PostgreSQL rollback dây chuyền các câu lệnh `ALTER TABLE` của bảng khác.
4. Hệ thống **MUST** backfill idempotent dữ liệu `"BranchProducts"` (`Status = 'Active'`, lọc đúng `"TenantID"` và `"BranchID"`) cho các mặt hàng đang có tồn kho trong `"BranchStocks"` nhưng chưa có bản ghi `"BranchProducts"`, đồng thời khởi tạo rõ ràng danh mục `"BranchProducts"` khác biệt giữa các chi nhánh của An Nhiên Mart (`BR-AN-01`: 5 SP, `BR-AN-02`: 5 SP, `BR-AN-03`: 3 SP) để kiểm chứng lọc sản phẩm theo chi nhánh.

#### Scenario: Tái hiện lỗi cũ — Khởi động Backend trên CSDL PostgreSQL cũ thiếu cột WalletBalance và bảng SupplierDeliveryConfigs đã bị xóa
- **GIVEN** CSDL PostgreSQL hiện hữu đã có bảng `"Tenants"` và `"OrderDetails"` từ phiên bản trước nhưng chưa có cột `"Tenants"."WalletBalance"`, chưa có cột `"OrderDetails"."ConversionRate"`, và bảng `"SupplierDeliveryConfigs"` đã bị drop
- **WHEN** Ứng dụng `MT_GRMS.Api` khởi chạy và gọi `DbInitializer.InitializeAsync`
- **THEN** Hệ thống tự động bổ sung `"Tenants"."WalletBalance"` và `"OrderDetails"."ConversionRate"` thành công, bỏ qua an toàn lệnh trên bảng `"SupplierDeliveryConfigs"` không gây rollback, chạy hoàn tất toàn bộ bước seed dữ liệu mẫu mà không phát sinh bất kỳ lỗi `42703` nào trên log.

#### Scenario: Tái hiện lỗi cũ — Thanh toán đơn hàng POS lưu chi tiết đơn vị tính và hệ số quy đổi
- **GIVEN** Backend đã khởi chạy đồng bộ schema trên PostgreSQL và người dùng thêm sản phẩm vào giỏ hàng trên màn POS (`localhost:5174`)
- **WHEN** Người dùng nhấn **Thanh toán** gửi `POST /api/orders`
- **THEN** Hệ thống lưu bản ghi `"Orders"` và `"OrderDetails"` (gồm `"ConversionRate"`, `"ProductUnitID"`, `"UnitName"`) thành công, trừ tồn kho FEFO trên `"BranchStocks"` và trả về `200 OK` (không còn lỗi `42703: column "ConversionRate" of relation "OrderDetails" does not exist`).

#### Scenario: Edge case — Chạy lại DbInitializer nhiều lần liên tiếp (Idempotency & Multi-Tenant)
- **GIVEN** CSDL đã được đồng bộ đầy đủ cột và đã có dữ liệu `"BranchProducts"` của nhiều `TenantId` khác nhau
- **WHEN** Khởi động lại `MT_GRMS.Api` lần thứ 2 trở đi
- **THEN** Không có bản ghi `"BranchProducts"` nào bị nhân bản, giá bán riêng tại chi nhánh đã chỉnh sửa trước đó được giữ nguyên, và dữ liệu giữa các `TenantId` hoàn toàn tách biệt.

---

### Requirement: REQ-EMP-ATTENDANCE-POS-03 Tự chấm công vào ca trong ngày & Hiển thị nút Vào màn hình Bán hàng POS cho Nhân viên
Hệ thống **MUST** cung cấp endpoint `POST /api/schedules/{id}/self-check-in` cho phép nhân viên đã đăng nhập (`STAFF` / `AllStaffAndOwner`) tự ghi nhận giờ vào ca (`CheckInTime`) cho chính lịch phân công của mình trong ngày hiện tại (theo múi giờ `Asia/Ho_Chi_Minh`), đồng thời vẫn giữ nguyên luồng chấm công AI FaceID hiện có.
Hệ thống **MUST** kiểm tra nghiêm ngặt `schedule.TenantId == CurrentTenantId` và `schedule.Employee.UserId == CurrentUserId`; nếu nhân viên cố tình gọi check-in cho lịch của nhân viên khác hoặc khác Tenant hoặc lịch không thuộc ngày hôm nay, hệ thống **MUST** từ chối với mã lỗi `403 Forbidden` / `400 Bad Request` / `404 Not Found`.
Trên giao diện Cổng Nhân Viên (`AttendancePage`, `FaceIdAttendanceModal`, `AppTopNav`), khi nhân viên chưa chấm công cho ca làm việc hôm nay, hệ thống **SHALL** hiển thị nút **"Chấm công vào ca"** bên cạnh **"Chấm công AI FaceID"**; ngay sau khi lịch làm việc hôm nay của nhân viên đã có `checkInTime` hợp lệ (`checkOutTime` chưa đóng), hệ thống **MUST** hiển thị nổi bật nút **"Vào màn hình Bán hàng POS"** điều hướng trực tiếp tới `/employee/pos`.

#### Scenario: Nhân viên chấm công vào ca hôm nay và chuyển sang màn hình POS
- **GIVEN** Nhân viên `0917778888` (`Phạm Thị Yến`, chi nhánh Ba Đình) đăng nhập vào Cổng Nhân Viên (`/employee/attendance`) và có lịch trực ngày hôm nay chưa có `checkInTime`
- **WHEN** Nhân viên nhấn nút **"Chấm công vào ca"** (hoặc hoàn tất chấm công FaceID)
- **THEN** API `POST /api/schedules/{id}/self-check-in` ghi nhận `checkInTime` thành công, trạng thái ca chuyển sang đã chấm công, và giao diện lập tức hiển thị nổi bật nút **"Vào màn hình Bán hàng POS"**; khi nhấn vào nút này hệ thống chuyển hướng sang `/employee/pos`.

#### Scenario: Edge case — Chặn nhân viên chấm công hộ lịch của nhân viên khác hoặc khác ngày
- **GIVEN** Nhân viên A (`0917778888`) đang đăng nhập và gửi `POST /api/schedules/{scheduleOfEmployeeB}/self-check-in` (hoặc gửi ID lịch của ngày mai)
- **WHEN** Hệ thống kiểm tra quyền sở hữu lịch và ngày làm việc
- **THEN** Hệ thống từ chối yêu cầu (trả lỗi `403`/`400`), không cập nhật `CheckInTime` của lịch đó.

---

## MODIFIED Requirements

### Requirement: REQ-SEED-AUTH-02 Cố định tài khoản Chủ cửa hàng 0918889999, 2 Nhân viên All-Time cùng Chi nhánh & Định danh ổn định User/Branch
Hệ thống **MUST** đảm bảo tài khoản Chủ cửa hàng An Nhiên Mart `0918889999` (`Trần Quốc An`, `TenantId = "tenant_an_nhien_02"`, `Role = "STORE_OWNER"`) luôn xác thực thành công với mật khẩu cố định `"123456"` (đồng bộ lại `PasswordHash` idempotent trong `DbInitializer` kể cả khi bản ghi user đã tồn tại từ trước và đảm bảo xác thực trong `AuthService`).
Hệ thống **MUST** khởi tạo idempotent **2 tài khoản nhân viên trực ca all-time 24/7 ở cùng một chi nhánh** là **An Nhiên Mart - Chi nhánh Ba Đình (`BR-AN-01`)** thuộc `"tenant_an_nhien_02"`:
1. Nhân viên 1: SĐT `"0917778888"` / mật khẩu `"123456"` (`Phạm Thị Yến`, `NV-AN-01`, `STAFF`).
2. Nhân viên 2: SĐT `"0914445555"` / mật khẩu `"123456"` (`Trần Minh Quân`, `NV-AN-04`, `STAFF`).
Cả 2 nhân viên này **MUST** được gán lịch trực hàng ngày (từ `-7` đến `+30` ngày quanh ngày hiện tại) với khung giờ `00:00:00 - 23:59:59` (`AllowedCheckInStart = 00:00:00`, `AllowedCheckInEnd = 23:59:59`, `Status = Scheduled`). Tài khoản `"0915556666"` (`Nguyễn Văn Minh`, `NV-AN-03`) **MUST** giữ nguyên không có lịch phân ca để kiểm thử kịch bản chặn ngoài ca.
Khi đăng nhập (`POST /api/auth/login`), làm mới phiên (`POST /api/auth/refresh`) hoặc lấy thông tin phiên (`GET /api/auth/me`), hệ thống **MUST** trả về đúng `BranchId` của hồ sơ `Employee` tương ứng với `UserId` và `TenantId`.
Đối với các tài khoản có `User.Id` dạng chuỗi không phải chuẩn UUID (ví dụ `"usr_employee_annhien_02"`), `MultiTenantMiddleware` và `ShiftService` **MUST** bảo toàn `CurrentRawUserId` để tra cứu đúng hồ sơ `Employee` và sinh `Guid` tất định (deterministic UUID từ chuỗi `User.Id`) cho `CurrentUserId` để 2 nhân viên cùng mở/tham gia/xác nhận đóng ca trên cùng một chi nhánh không bao giờ bị trùng `Guid.Empty` hay sinh `Guid` ngẫu nhiên qua mỗi request. Trong `ShiftService.CheckCashierShiftEligibilityAsync`, cửa sổ kết thúc ca có mốc `>= 23:59:00` **MUST** bao phủ đến hết ngày (`24:00:00`) để kiểm thử lúc `23:59` hoặc `00:00 - 05:59` luôn hợp lệ.

#### Scenario: Đăng nhập Chủ cửa hàng 0918889999 bằng mật khẩu 123456 trên CSDL đã tồn tại bản ghi cũ
- **GIVEN** Bảng `"Users"` đã có sẵn bản ghi `0918889999` từ lần chạy trước
- **WHEN** Người dùng gửi `POST /api/auth/login` với `usernameOrEmail = "0918889999"` và `password = "123456"`
- **THEN** Hệ thống xác thực thành công `200 OK`, trả về vai trò `STORE_OWNER` thuộc `"tenant_an_nhien_02"`.

#### Scenario: Hai nhân viên all-time cùng chi nhánh Ba Đình đăng nhập và mở/tham gia ca lúc rạng sáng (01:30 sáng)
- **GIVEN** Đồng hồ hệ thống đang ở khung rạng sáng `01:30` (`Asia/Ho_Chi_Minh`)
- **WHEN** Nhân viên 1 (`0917778888` / `123456`) và Nhân viên 2 (`0914445555` / `123456`) lần lượt đăng nhập
- **THEN** Cả 2 đều nhận được đúng `branchId` của **An Nhiên Mart - Chi nhánh Ba Đình**, `GET /api/shifts/cashier-eligibility` trả về `canOpenShift = true` cho cả hai, Nhân viên 1 mở ca thành công và Nhân viên 2 tham gia cùng ca đang mở tại chi nhánh Ba Đình với 2 định danh người tham gia riêng biệt, ổn định.

#### Scenario: Regression — Nhân viên không có lịch trực (0915556666) vẫn bị chặn mở ca
- **GIVEN** Nhân viên `0915556666` (`Nguyễn Văn Minh`) không được phân lịch làm việc trong ngày hôm nay
- **WHEN** Nhân viên này gọi `GET /api/shifts/cashier-eligibility` hoặc `POST /api/shifts/open`
- **THEN** Hệ thống từ chối mở ca với thông báo chưa có lịch phân công trực ca hợp lệ.

---

### Requirement: REQ-OWNER-SHIFTLESS-04 Chủ cửa hàng (STORE_OWNER) bán hàng POS trực tiếp không cần mở ca / đóng ca
Khi người dùng có vai trò `STORE_OWNER` truy cập màn hình bán hàng POS (`/pos`), hệ thống **MUST NOT** yêu cầu mở ca, **MUST NOT** tự động bật modal Mở ca hay Đóng ca, và **MUST** ẩn hoàn toàn các thanh cảnh báo/nút thao tác mở ca – đóng ca trên giao diện POS (bao gồm banner vàng `"Chưa mở ca làm việc"`, banner đỏ `"Ca làm việc đang trong quá trình kiểm đếm chốt sổ"`, và các mục Mở ca / Kết thúc ca trong menu thao tác POS của Chủ cửa hàng).
Người dùng `STORE_OWNER` **SHALL** được phép thêm sản phẩm vào giỏ hàng, quét mã vạch và nhấn **Thanh toán** (`POST /api/orders`) ngay lập tức bất kể chi nhánh đang chọn chưa có ca mở hay đang có ca thu ngân ở trạng thái `Open` / `Closing`.
Khi `STORE_OWNER` tạo đơn hàng mà không truyền `ShiftId`, `OrderService.CreateOrderAsync` **MUST** bỏ qua kiểm tra chặn `SHIFT_CLOSING_LOCKDOWN` của ca thu ngân và **MUST NOT** tự động gán `activeShift.Id` của nhân viên vào đơn hàng của Chủ cửa hàng (để không làm sai lệch tiền mặt lý thuyết trong két bàn giao ca của thu ngân), nhưng **MUST** vẫn trừ tồn kho FEFO tại `BranchStocks` và ghi nhận đầy đủ bút toán thu vào Sổ quỹ (`Cashbook`) của `TenantId` hiện hành.
Đối với người dùng vai trò `STAFF` (Thu ngân), hệ thống **MUST** giữ nguyên toàn bộ quy tắc bắt buộc mở ca, khóa tạo đơn mới khi ca đang `Closing` và đối soát đóng ca.

#### Scenario: Tái hiện lỗi cũ — Chủ cửa hàng đăng nhập POS bán hàng ngay khi chi nhánh chưa có ca mở
- **GIVEN** Chủ cửa hàng `0918889999` (`STORE_OWNER`) đăng nhập và mở màn `/pos` tại chi nhánh Ba Đình đang không có ca làm việc nào mở (`currentShift == null`)
- **WHEN** Chủ cửa hàng chọn sản phẩm thêm vào giỏ và nhấn **Thanh toán** (Tiền mặt hoặc Chuyển khoản)
- **THEN** Giao diện không hiển thị banner cảnh báo chưa mở ca, không bật modal mở ca, nút Thanh toán hoạt động bình thường và API `POST /api/orders` tạo đơn thành công với `ShiftId = null`.

#### Scenario: Edge case — Chủ cửa hàng vẫn bán hàng bình thường khi ca của nhân viên tại chi nhánh đang ở trạng thái Closing
- **GIVEN** Tại chi nhánh Ba Đình đang có một ca của nhân viên thu ngân ở trạng thái `Closing` (đang kiểm đếm tiền cuối ca)
- **WHEN** Chủ cửa hàng `0918889999` tạo đơn bán lẻ trực tiếp trên `/pos`
- **THEN** Đơn hàng của Chủ cửa hàng vẫn được tạo thành công độc lập (`ShiftId = null`), không bị chặn bởi `SHIFT_CLOSING_LOCKDOWN` và không cộng dồn tiền mặt vào két đang chốt của nhân viên.

#### Scenario: Regression — Nhân viên thu ngân (STAFF) chưa mở ca vẫn bị chặn bán hàng
- **GIVEN** Nhân viên `0917778888` (`STAFF`) vào `/employee/pos` tại chi nhánh chưa có ca mở
- **WHEN** Nhân viên nhấn thêm món vào giỏ hoặc nhấn Thanh toán khi chưa mở ca
- **THEN** Hệ thống hiển thị cảnh báo yêu cầu mở ca và mở modal Mở ca theo đúng quy trình kiểm soát thu ngân.

---

### Requirement: REQ-POS-BRANCH-SWITCH-05 Tự động tải & chỉ hiển thị đúng sản phẩm Active của Chi nhánh đang chọn trên POS
Trên màn hình POS (`PosCheckoutPage`), hệ thống **MUST** khởi tạo danh sách sản phẩm rỗng `[]` (tuyệt đối **MUST NOT** hiển thị dữ liệu giả lập `mockProducts` / `mockProductsAnNhien` hay gọi API `/api/products` toàn chuỗi khi chưa xác định `activeBranch.id`).
Mỗi khi `activeBranch.id` được xác lập lần đầu hoặc khi người dùng chọn chuyển sang một chi nhánh khác trên `PosHeader`, hệ thống **MUST** tự động gọi lại `GET /api/branches/{activeBranch.id}/products` (`Status=Active`, lọc theo `TenantId`) và chỉ hiển thị đúng các sản phẩm đang kinh doanh (`Active`) tại chi nhánh đó cùng giá bán và tồn kho `BranchStocks` của đúng chi nhánh đó.
Khi người dùng chuyển đổi từ Chi nhánh A sang Chi nhánh B trên POS:
1. Các sản phẩm trong giỏ hàng hiện tại không thuộc danh mục Active của Chi nhánh B **MUST** tự động được loại bỏ khỏi giỏ (kèm thông báo rõ cho người dùng nếu có mặt hàng bị gỡ), và các mặt hàng còn hợp lệ **MUST** được cập nhật lại đơn giá/tồn kho theo Chi nhánh B.
2. Khi quét mã vạch trên POS lúc đã có `activeBranch.id`, hệ thống **MUST** chỉ khớp trong danh mục sản phẩm Active của chi nhánh đang chọn, **MUST NOT** fallback sang `/api/products/barcode/{code}` toàn chuỗi để tránh chèn nhầm mặt hàng không bán tại chi nhánh đó vào giỏ.

#### Scenario: Tái hiện lỗi cũ — Chủ cửa hàng chuyển đổi qua lại giữa các chi nhánh trên POS
- **GIVEN** Chủ cửa hàng `0918889999` đang ở màn `/pos` với dữ liệu An Nhiên Mart: Chi nhánh Ba Đình (`BR-AN-01`) có 5 sản phẩm Active, Chi nhánh Đống Đa (`BR-AN-03`) chỉ có 3 sản phẩm Active
- **WHEN** Chủ cửa hàng đổi chi nhánh trên thanh Header từ **Chi nhánh Ba Đình** sang **Chi nhánh Đống Đa**
- **THEN** Màn hình POS lập tức gọi `GET /api/branches/{idDongDa}/products?PageSize=500&Status=Active` và lưới sản phẩm chỉ hiển thị đúng 3 sản phẩm của Chi nhánh Đống Đa (2 sản phẩm chỉ có ở Ba Đình không còn xuất hiện).

#### Scenario: Edge case — Đổi chi nhánh khi trong giỏ đang có sản phẩm không kinh doanh ở chi nhánh mới
- **GIVEN** Giỏ hàng tại **Chi nhánh Ba Đình** đang có mặt hàng `"Trà Ô Long túi lọc Phúc Long"` (chỉ bán ở Ba Đình, không bán ở Đống Đa)
- **WHEN** Chủ cửa hàng chuyển chi nhánh trên Header sang **Chi nhánh Đống Đa**
- **THEN** Mặt hàng `"Trà Ô Long túi lọc Phúc Long"` tự động được gỡ khỏi giỏ hàng hiện tại kèm thông báo cho người dùng, đảm bảo không thể thanh toán nhầm mặt hàng không thuộc Chi nhánh Đống Đa.

#### Scenario: Edge case — Quét mã vạch sản phẩm thuộc chi nhánh khác
- **GIVEN** POS đang chọn **Chi nhánh Đống Đa** và người dùng quét mã vạch của một sản phẩm thuộc cùng Tenant nhưng không được gán Active tại Chi nhánh Đống Đa
- **WHEN** Sự kiện quét mã vạch hoàn tất
- **THEN** Hệ thống báo không tìm thấy sản phẩm tại chi nhánh hiện tại và không thêm sản phẩm đó vào giỏ hàng.

---

## Acceptance checklist
- [ ] **REQ-DB-SYNC-01**: Khởi động Backend sạch 100% không lỗi `42703` (`WalletBalance`, `ConversionRate`), các khối DDL độc lập an toàn `IF EXISTS` / `IF NOT EXISTS`, và backfill đầy đủ `BranchProducts` theo từng chi nhánh.
- [ ] **REQ-SEED-AUTH-02**: `0918889999` / `123456` đăng nhập ổn định; 2 nhân viên `0917778888` và `0914445555` (cùng chi nhánh Ba Đình) có lịch trực all-time `00:00:00 - 23:59:59`, trả đúng `BranchId` khi login và có định danh `UserId` tất định khi mở/tham gia ca.
- [ ] **REQ-EMP-ATTENDANCE-POS-03**: Nhân viên tự chấm công vào ca hôm nay (`POST /api/schedules/{id}/self-check-in` hoặc FaceID) thành công và thấy ngay nút **"Vào màn hình Bán hàng POS"** dẫn tới `/employee/pos`.
- [ ] **REQ-OWNER-SHIFTLESS-04**: Chủ cửa hàng (`STORE_OWNER`) vào POS không thấy bất kỳ banner/modal mở-đóng ca nào, bán hàng & thanh toán trực tiếp không cần mở ca và không bị khóa bởi trạng thái `Closing` của ca nhân viên.
- [ ] **REQ-POS-BRANCH-SWITCH-05**: Chọn/đổi chi nhánh trên POS tự động tải lại đúng sản phẩm `Active` của chi nhánh đó, không dính mock data hay sản phẩm của chi nhánh khác trong lưới hàng, giỏ hàng và quét mã vạch.
