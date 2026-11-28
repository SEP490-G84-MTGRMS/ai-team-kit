---
change: pos-db-sync-owner-shiftless-and-branch-catalog
schema: bug-fix
status: draft
---

# EXP-2026-11-10-001: Đồng bộ schema PostgreSQL, tài khoản kiểm thử 24/7, luồng chấm công vào POS, bán hàng không mở ca cho Chủ cửa hàng và lọc danh mục đúng chi nhánh

## 1. Problem Statement
Hệ thống hiện gặp lỗi thiếu cột CSDL khi khởi chạy Backend (`Tenants.WalletBalance`) và khi thanh toán đơn hàng POS (`OrderDetails.ConversionRate`), đồng thời luồng kiểm thử bán hàng đa vai trò – đa chi nhánh đang vướng 4 điểm nghẽn: (1) tài khoản chủ cửa hàng `0918889999` cần mật khẩu cố định `123456` và thiếu 2 nhân viên trực all-time cùng 1 chi nhánh để kiểm thử mọi khung giờ; (2) nhân viên sau khi chấm công vào ca trên Cổng Nhân Viên chưa có nút chuyển sang màn POS (và thiếu thao tác tự chấm công vào ca khi thiết bị không có FaceID); (3) Chủ cửa hàng (`STORE_OWNER`) khi vào POS vẫn bị hiện cảnh báo/ép mở ca – đóng ca; (4) khi chuyển đổi chi nhánh bán hàng trên POS, danh sách sản phẩm không tự tải lại đúng các mặt hàng thuộc chi nhánh đang chọn.

## 2. Context & Background

### 2.1. Tái hiện thực tế
- **Khởi động Backend**: Chạy `MT_GRMS.Api` trên PostgreSQL hiện hữu → `DbInitializer.InitializeAsync` văng `Npgsql.PostgresException (42703): column t.WalletBalance does not exist` tại `DbInitializer.cs:line 971`, dừng toàn bộ quá trình seed phía sau.
- **Thanh toán POS**: Mở `localhost:5174/pos`, thêm hàng và bấm Thanh toán → API `POST /api/orders` trả lỗi `42703: column "ConversionRate" of relation "OrderDetails" does not exist`.
- **Chủ cửa hàng `0918889999` & 2 nhân viên**: Kiểm thử lúc rạng sáng (`01:10` UTC+7), ca mẫu `06:00 - 23:00` chặn nhân viên mở ca; chưa có nhân viên thứ 2 cùng chi nhánh trực 24/7.
- **Cổng Nhân Viên**: Nhân viên vào `/employee/attendance` chấm công xong không có nút dẫn sang `/employee/pos`; ngoài ra nếu chưa đăng ký FaceID thì không tự check-in được vì `/api/schedules/{id}/attendance` chỉ cho `OwnerOrAdmin`.
- **Chủ cửa hàng bán POS & đổi chi nhánh**: Đăng nhập `STORE_OWNER` vào `/pos` bị chặn bởi `!currentShift` ở `handleAddToCart` / `handleCheckoutSubmit` và hiện banner vàng bắt mở ca; chọn đổi chi nhánh trên dropdown không gọi lại API danh mục sản phẩm theo `activeBranch.id`.

### 2.2. Root Cause (file / dòng)
| # | Vị trí | Nguyên nhân gốc |
|---|---|---|
| 1 | `MT_GRMS.Infrastructure/Persistence/DbInitializer.cs` (dòng 263-279, 300-334, 971) | `DbInitializer` dùng `CREATE TABLE IF NOT EXISTS` và ghi nhận sẵn mọi tên migration vào `__EFMigrationsHistory` nên các migration `ALTER TABLE` không tự chạy trên bảng cũ; `EnsureTenantSubscriptionColumnsAsync` thiếu `WalletBalance` khiến câu lệnh LINQ tại dòng 971 vỡ. |
| 2 | `MT_GRMS.Infrastructure/Persistence/DbInitializer.cs` (dòng 358-530) | ~60 lệnh DDL đặt chung trong một `ExecuteSqlRawAsync`; dòng 485-486 gọi `ALTER TABLE "SupplierDeliveryConfigs"` trên bảng đã bị xóa ở dòng 182 khiến PostgreSQL rollback toàn bộ khối lệnh, làm mất `OrderDetails.ConversionRate`, `ProductUnitID`, `UnitName` và các cột `Orders`. |
| 3 | `DbInitializer.cs` (dòng 2118-2453) & `AuthService.cs` (dòng 62-71, 129-137) | `ownerUser` (`0918889999`) nếu đã tồn tại không được đồng bộ lại mật khẩu `123456`; `AuthService` trả `BranchId: null` khi login/getMe; mới có 1 nhân viên Ba Đình có lịch `06:00-23:00`. |
| 4 | `MultiTenantMiddleware.cs` (dòng 23), `ShiftsController.cs` (dòng 36, 387), `ShiftService.cs` (dòng 937, 977-980) | Tài khoản seed có `User.Id` dạng chuỗi (`usr_employee_annhien_02`) không parse được sang `Guid`, làm `CurrentUserId = Guid.Empty` và không tìm thấy `Employee` khi kiểm tra trực ca; ngoài ra `PlannedEndTime.Add(30 phút)` khi `23:59:59` vượt mốc `24:00:00`. |
| 5 | `AttendancePage.tsx`, `FaceIdAttendanceModal.tsx`, `AppTopNav.tsx`, `SchedulesController.cs` (dòng 253) | Chưa có nút điều hướng `/employee/pos` sau khi nhân viên đã có `checkInTime` hôm nay; nhân viên chưa có endpoint tự check-in vào ca của chính mình khi kiểm thử không camera. |
| 6 | `PosCheckoutPage.tsx` (dòng 508, 999, 1073, 1151) & `OrderService.cs` (dòng 100-107, 511) | `PosCheckoutPage` kiểm tra `!currentShift` cho mọi vai trò (kể cả `STORE_OWNER`), chặn thêm giỏ và thanh toán; `OrderService` chặn cả `STORE_OWNER` nếu ca của nhân viên đang `Closing` và tự gán `activeShift.Id` dù chủ cửa hàng bán độc lập. |
| 7 | `PosCheckoutPage.tsx` (dòng 102-116, 173-191, 291-380, 439) & `DbInitializer.cs` (dòng 2605-2784) | `useEffect` tải sản phẩm thiếu dependency `activeBranch.id` và tự ghi đè `activeBranch` về `summaries[0]`; khởi tạo state từ `mockProducts`; quét mã vạch fallback sang `/products/barcode` toàn chuỗi; dữ liệu seed An Nhiên có `BranchStocks` riêng từng chi nhánh nhưng chưa backfill sang `BranchProducts`. |

### 2.3. Các chỗ lân cận liên quan
- `InvoiceManagementPage.tsx`: Đã lọc sản phẩm đặt trước / đổi trả theo chi nhánh ở change trước; việc backfill `BranchProducts` cho An Nhiên sẽ giúp cả màn Quản lý đơn hoạt động đồng nhất.
- `ShiftParticipant` / `ShiftCloseConfirmation`: Cần `Guid` định danh ổn định cho từng nhân viên khi 2 nhân viên cùng tham gia mở/đóng 1 ca tại cùng chi nhánh.

## 3. Constraints
- Không xóa hoặc làm hỏng dữ liệu hiện có trong PostgreSQL; mọi câu lệnh đồng bộ schema phải idempotent (`IF NOT EXISTS` / `IF EXISTS`).
- Tuân thủ cách ly đa tenant (`TenantId`) và phân quyền vai trò (`STORE_OWNER` vs `STAFF`).
- Giữ nguyên toàn bộ nghiệp vụ mở/đóng ca, kiểm đếm két và kiểm tra lịch trực đối với vai trò Nhân viên (`STAFF`).
- Giữ nguyên quy tắc giá chi nhánh → giá chung và trừ tồn kho `BranchStocks` theo FEFO đã ban hành.

## 4. Assumptions
- **[ASSUMPTION]**: Hai tài khoản nhân viên all-time kiểm thử thuộc cùng chi nhánh **An Nhiên Mart - Chi nhánh Ba Đình (`BR-AN-01`)** là `0917778888` / `123456` (Phạm Thị Yến) và `0914445555` / `123456` (Trần Minh Quân); tài khoản `0915556666` được giữ nguyên không phân ca để phục vụ các bài kiểm thử chặn nhân viên ngoài lịch trực.
- **[ASSUMPTION]**: Khi Chủ cửa hàng (`STORE_OWNER`) trực tiếp tạo đơn bán hàng trên POS, đơn hàng không yêu cầu mở ca, không gắn vào `ShiftId` của nhân viên (tránh làm lệch tiền mặt lý thuyết trong két bàn giao ca của thu ngân), nhưng vẫn ghi nhận đầy đủ vào Sổ quỹ (`Cashbook`) và trừ tồn kho `BranchStocks` của chi nhánh đang chọn.
- **[ASSUMPTION]**: Khi Chủ cửa hàng chuyển đổi chi nhánh trên POS mà trong giỏ hàng đang có mặt hàng của chi nhánh cũ không thuộc danh mục Active của chi nhánh mới (hoặc khác ngữ cảnh kho chi nhánh), giỏ hàng tab hiện tại cần được làm mới/loại bỏ mặt hàng không thuộc chi nhánh mới để tránh lỗi thanh toán chéo chi nhánh.
- **[ASSUMPTION]**: Nhân viên chỉ thấy nút vào màn POS sau khi ca làm việc trong ngày hôm nay của nhân viên đó đã có `checkInTime` hợp lệ (qua FaceID hoặc tự chấm công vào ca trên Cổng Nhân Viên).

## 5. Scope & Non-Goals
### In Scope
- Đồng bộ đầy đủ cột/bảng còn thiếu trong CSDL lúc khởi động (`Tenants.WalletBalance`, `WalletTransactions`, `WalletTopupOrders`, `OrderDetails.ConversionRate`/`ProductUnitID`/`UnitName`, `BranchProductUnitPrices`, backfill `BranchProducts` cho dữ liệu mẫu) và cô lập lỗi từng khối DDL.
- Cố định mật khẩu `123456` cho chủ cửa hàng `0918889999`; seed 2 nhân viên all-time (`00:00:00 - 23:59:59`) cùng chi nhánh Ba Đình và trả đúng `BranchId` khi đăng nhập / lấy hồ sơ phiên; định danh ổn định `UserId` cho nhân viên mở/đóng ca.
- Bổ sung tự chấm công vào ca của chính nhân viên và hiển thị nút **"Vào màn bán hàng POS"** (`/employee/pos`) sau khi đã chấm công trong ngày.
- Bỏ hoàn toàn yêu cầu mở/đóng ca, cảnh báo ca và khóa chốt ca đối với `STORE_OWNER` khi bán hàng trên POS.
- Tự động tải lại đúng danh mục sản phẩm Active của chi nhánh đang chọn (`activeBranch.id`) mỗi khi khởi tạo hoặc chuyển chi nhánh trên POS.

### Out of Scope (Non-Goals)
- Không thay đổi công thức tính lương tháng (`Payslips`) hay thuật toán nhận diện khuôn mặt FaceID.
- Không bỏ quy định bắt buộc mở/đóng ca đối với vai trò Nhân viên thu ngân (`STAFF`).
- Không thay đổi giao diện quản trị gán sản phẩm chi nhánh của Chủ cửa hàng (`/store-owner/stores/products`).

## 6. Các phương án xử lý (≥ 2)
| Tiêu chí | Phương án 1: Sửa đồng bộ cả Backend (Schema + Auth + Shift/Order) & Frontend (POS + Attendance) | Phương án 2: Chỉ sửa cục bộ câu SQL thiếu cột và ẩn nút trên Frontend |
|---|---|---|
| Mô tả | Tách khối DDL an toàn, đồng bộ đầy đủ cột/bảng & seed `BranchProducts` + 2 NV all-time, chuẩn hóa `UserId`/`BranchId` ở Backend, bỏ phụ thuộc ca cho `STORE_OWNER` cả FE & BE, thêm self-check-in + nút vào POS sau chấm công, lắng nghe `activeBranch.id` để nạp đúng SP chi nhánh. | Chỉ thêm 2 câu `ALTER TABLE` cho `WalletBalance` và `ConversionRate`, sửa điều kiện ẩn modal ca trên UI. |
| Ưu điểm | Giải quyết tận gốc mọi lỗi dây chuyền (rollback DDL, nhân viên string ID bị chặn mở ca, ca 23:59:59 bị tràn giờ, đổi chi nhánh vẫn hiện SP cũ, chủ tiệm bị kẹt khi ca nhân viên đang Closing). | Thay đổi ít file hơn. |
| Nhược điểm | Cần kiểm thử kỹ cả 2 vai trò (`STORE_OWNER` và `STAFF`) trên nhiều chi nhánh. | Vẫn lỗi khi nhân viên mở ca lúc rạng sáng, không tự chấm công test được khi thiếu camera, và dữ liệu seed An Nhiên rỗng `BranchProducts`. |

**Chọn: Phương án 1.** Lý do: Đáp ứng trọn vẹn cả 6 yêu cầu kiểm thử thực tế từ đầu đến cuối mà không phát sinh lỗi nối tiếp.

## 7. Rủi ro & Biện pháp giảm thiểu
- **Rủi ro CSDL hiện hữu có trạng thái cột không đồng nhất**: Dùng `ALTER TABLE IF EXISTS ... ADD COLUMN IF NOT EXISTS ...` và tách riêng từng khối `ExecuteSqlRawAsync` để một bảng cũ không tồn tại không bao giờ làm rollback các bảng khác.
- **Rủi ro giỏ hàng lưu `localStorage` giữ sản phẩm của chi nhánh cũ khi Chủ cửa hàng đổi chi nhánh**: Khi danh mục sản phẩm của `activeBranch.id` tải xong, tự động lọc bỏ các dòng giỏ hàng không nằm trong danh mục Active của chi nhánh đang chọn và cập nhật lại giá/đơn vị theo chi nhánh mới.
- **Rủi ro đơn hàng của Chủ cửa hàng làm lệch két tiền ca của nhân viên**: Khi `STORE_OWNER` tạo đơn trên POS, gửi `shiftId: undefined` và Backend không tự gán `activeShift.Id` cho đơn của `STORE_OWNER`.

## 8. Success Criteria
- Backend khởi động hoàn tất 100% không có bất kỳ log `fail:` nào về CSDL; thanh toán đơn hàng trên POS thành công không còn lỗi `ConversionRate`.
- Đăng nhập `0918889999` / `123456` vào POS bán hàng ngay không hiện bất kỳ cảnh báo/nút mở ca hay đóng ca nào; chuyển chi nhánh nào chỉ hiển thị đúng sản phẩm Active của chi nhánh đó.
- Đăng nhập 2 nhân viên `0917778888` / `123456` và `0914445555` / `123456` (cùng chi nhánh Ba Đình) ở mọi thời điểm 24/7: chấm công vào ca thành công → hiện nút **"Vào màn bán hàng POS"** → vào `/employee/pos` mở ca / tham gia ca và thanh toán thành công.
- Toàn bộ test Backend (`dotnet test`) và build Frontend (`npm run build`) đạt 100%.
