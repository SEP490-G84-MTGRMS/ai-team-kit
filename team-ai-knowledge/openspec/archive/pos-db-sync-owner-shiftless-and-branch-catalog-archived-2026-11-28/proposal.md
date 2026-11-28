# Proposal: pos-db-sync-owner-shiftless-and-branch-catalog

## 1. Mô tả lỗi & Vấn đề hiện tại
Khi khởi chạy Backend và vận hành luồng bán hàng POS đa chi nhánh (Chủ cửa hàng `0918889999` và Nhân viên), hệ thống đang gặp chuỗi lỗi CSDL và bất cập luồng nghiệp vụ sau:
1. **Lỗi khởi động Backend (`42703: column t.WalletBalance does not exist`) & lỗi DDL gộp**:
   - `DbInitializer` chưa đồng bộ cột `Tenants.WalletBalance` (cùng bảng ví liên quan trên CSDL hiện hữu), khiến truy vấn `Tenants` ở bước nạp gói cước SaaS văng ngoại lệ và dừng toàn bộ quá trình seed dữ liệu mẫu phía sau.
   - Khối DDL nâng cấp bảng trong `DbInitializer` chạy gộp hàng chục lệnh trong một câu SQL duy nhất, trong đó có lệnh `ALTER TABLE "SupplierDeliveryConfigs"` trên bảng đã bị xóa trước đó khiến PostgreSQL **rollback toàn bộ khối DDL**.
2. **Lỗi thanh toán POS (`42703: column "ConversionRate" of relation "OrderDetails" does not exist`)**:
   - Do khối DDL trên bị rollback, các cột mới của `OrderDetails` (`ProductUnitID`, `UnitName`, `ConversionRate`) và `Orders` chưa được thêm vào CSDL thực tế, gây lỗi 500 khi bấm Thanh toán đơn hàng trên POS.
3. **Tài khoản test Chủ cửa hàng `0918889999` & 2 nhân viên all-time cùng chi nhánh**:
   - Tài khoản chủ cửa hàng `0918889999` cần được cố định (hardcode/seed idempotent) mật khẩu `123456` để luôn đăng nhập ổn định.
   - Dữ liệu mẫu An Nhiên Mart hiện mới có 1 nhân viên có ca từ `06:00 - 23:00` (bị chặn khi kiểm thử ban đêm/rạng sáng) và chưa có đủ **2 nhân viên lịch trực all-time (24/7)** ở cùng 1 chi nhánh để kiểm thử chấm công, mở/đóng ca nhiều nhân viên và bán hàng mọi khung giờ.
4. **Thiếu lối vào màn POS cho Nhân viên sau khi chấm công**:
   - Nhân viên đăng nhập vào Cổng Nhân Viên (`/employee/attendance`, `/employee/schedule`) sau khi chấm công vào ca chưa có nút điều hướng trực tiếp sang màn hình bán hàng POS (`/employee/pos`), đồng thời cần hỗ trợ chấm công vào ca thuận tiện khi kiểm thử.
5. **Chủ cửa hàng (`STORE_OWNER`) bị ép mở ca / hiện giao diện đóng mở ca khi bán hàng**:
   - Khi Chủ cửa hàng đăng nhập vào màn POS để trực tiếp bán hàng, giao diện vẫn hiện cảnh báo vàng bắt buộc mở ca và chặn thêm món / thanh toán nếu chưa mở ca (`!currentShift`), trái với nghiệp vụ chủ cửa hàng bán hàng trực tiếp không cần mở ca hay đóng ca.
6. **Chọn chi nhánh bán hàng trên POS chưa lọc lại đúng sản phẩm của chi nhánh đang chọn**:
   - Khi đổi chi nhánh trên thanh tiêu đề POS, danh sách sản phẩm không tự động tải lại theo `activeBranch.id` mới (và lúc đầu còn nạp dữ liệu mock), đồng thời dữ liệu seed các chi nhánh của An Nhiên Mart mới có `BranchStocks` mà chưa đồng bộ sang `BranchProducts`, làm sản phẩm hiển thị không khớp đúng chi nhánh đang chọn.

## 2. Bước tái hiện
1. Khởi chạy `MT_GRMS.Api` trên CSDL PostgreSQL hiện hữu → Console báo `fail: 42703: column t.WalletBalance does not exist` tại `DbInitializer.cs:line 971`.
2. Mở POS (`localhost:5174/pos`), thêm sản phẩm và bấm Thanh toán → Popup báo lỗi `42703: column "ConversionRate" of relation "OrderDetails" does not exist`.
3. Đăng nhập tài khoản Chủ cửa hàng `0918889999` vào `/pos` khi chi nhánh chưa có ca mở → Hiện banner cảnh báo chưa mở ca, bấm thêm hàng hoặc thanh toán bị chặn bắt mở ca.
4. Trên `/pos`, dùng tài khoản Chủ cửa hàng chuyển đổi giữa các chi nhánh (VD: Ba Đình ↔ Cầu Giấy ↔ Đống Đa) → Danh sách sản phẩm không cập nhật theo đúng danh mục `BranchProducts` của chi nhánh vừa chọn.
5. Đăng nhập tài khoản Nhân viên vào Cổng Nhân Viên, thực hiện chấm công vào ca → Không có nút chuyển nhanh sang màn bán hàng POS; test ngoài khung `06:00 - 23:00` bị chặn lịch trực.

## 3. Kết quả thực tế vs Mong đợi
| Hạng mục | Thực tế | Mong đợi |
|---|---|---|
| Khởi động Backend (`DbInitializer`) | Crash `42703: column t.WalletBalance does not exist` & warning/fail rollback khối DDL | Đồng bộ đầy đủ các cột/bảng thiếu (`Tenants.WalletBalance`, `OrderDetails.ConversionRate`, `BranchProductUnitPrices`, ...), chạy sạch không còn lỗi `fail:` DDL hay dừng seed |
| Thanh toán đơn POS | Lỗi `42703: column "ConversionRate" of relation "OrderDetails" does not exist` | Lưu đơn hàng, trừ kho FEFO và in hóa đơn thành công 100% |
| Chủ cửa hàng `0918889999` & 2 NV test | Mật khẩu có thể lệch nếu bản ghi cũ tồn tại; thiếu 2 NV all-time cùng 1 chi nhánh | `0918889999` / `123456` luôn đăng nhập thành công; có sẵn 2 nhân viên cùng chi nhánh Ba Đình (`0917778888` & `0914445555`, mật khẩu `123456`) trực ca all-time `00:00 - 23:59:59` mọi ngày |
| Cổng Nhân viên sau chấm công | Không có nút sang màn POS sau khi chấm công | Sau khi nhân viên chấm công vào ca hôm nay (hỗ trợ cả FaceID và chấm công vào ca nhanh trên bảng chấm công), hiển thị rõ nút **"Vào màn hình Bán hàng POS"** dẫn tới `/employee/pos` |
| Chủ cửa hàng (`STORE_OWNER`) bán trên POS | Bị hiện cảnh báo chưa mở ca và chặn thêm giỏ hàng / thanh toán khi `!currentShift` | Chủ cửa hàng bán hàng trực tiếp **không mở ca, không đóng ca**, ẩn hoàn toàn banner/modal mở-đóng ca và không bị chặn bởi trạng thái ca |
| Đổi chi nhánh bán hàng trên POS | Không gọi lại API sản phẩm theo `activeBranch.id`; dữ liệu seed thiếu `BranchProducts` | Mỗi khi chọn chi nhánh, tự động tải lại từ `/branches/{branchId}/products` (`Status=Active`), chỉ hiển thị đúng sản phẩm thuộc chi nhánh đó (kèm đồng bộ `BranchProducts` chuẩn cho từng chi nhánh seed) |

## 4. Mức độ ảnh hưởng
- **Ai bị ảnh hưởng**: Chủ cửa hàng (`STORE_OWNER`), Nhân viên bán hàng / Thu ngân (`STAFF`), và môi trường kiểm thử / triển khai tích hợp.
- **Dữ liệu**: Không làm mất dữ liệu hiện có; các lệnh nâng cấp schema đều dùng `IF NOT EXISTS` / idempotent an toàn.

## 5. Mục tiêu
- Khắc phục triệt để lỗi thiếu cột CSDL khi khởi động Backend và khi thanh toán đơn hàng POS.
- Đảm bảo bộ tài khoản kiểm thử (`0918889999` / `123456` và 2 nhân viên all-time cùng chi nhánh Ba Đình) hoạt động tức thì ở mọi khung giờ 24/7.
- Hoàn thiện luồng Nhân viên: Chấm công vào ca → Bấm nút vào thẳng màn bán hàng POS (`/employee/pos`).
- Hoàn thiện luồng Chủ cửa hàng: Bán hàng tự do không cần mở/đóng ca; chọn chi nhánh nào chỉ hiện và bán đúng sản phẩm Active của chi nhánh đó.

## 6. Phạm vi
**In scope**
- Backend `DbInitializer`: Bổ sung đồng bộ cột `Tenants.WalletBalance` (và các bảng/cột SaaS/POS/Catalog còn thiếu như `OrderDetails.ConversionRate`, `BranchProductUnitPrices`, backfill `BranchProducts` cho dữ liệu seed An Nhiên Mart); tách nhỏ khối DDL và dùng `IF EXISTS` an toàn để không bao giờ rollback dây chuyền.
- Backend `AuthService` & `DbInitializer`: Hardcode/đồng bộ mật khẩu `123456` cho chủ cửa hàng `0918889999`; seed 2 nhân viên all-time (`0917778888` và `0914445555`, mật khẩu `123456`) cùng thuộc *An Nhiên Mart - Chi nhánh Ba Đình (`BR-AN-01`)* với ca `00:00:00 - 23:59:59`; xử lý biên thời gian `23:59:59` trong `ShiftService.CheckCashierShiftEligibilityAsync`.
- Backend `OrderService`: Cho phép `STORE_OWNER` tạo đơn trực tiếp không phụ thuộc ca mở hay trạng thái `Closing` của ca nhân viên.
- Frontend Cổng Nhân Viên (`AttendancePage`, `FaceIdAttendanceModal`, `AppTopNav`, `authService`): Hỗ trợ chấm công vào ca và hiển thị nút **"Vào màn bán hàng POS"** (`/employee/pos`) ngay sau khi nhân viên đã chấm công vào ca trong ngày.
- Frontend POS (`PosCheckoutPage`, `PosHeader`): Bỏ toàn bộ kiểm tra/cảnh báo/modal mở ca – đóng ca đối với `STORE_OWNER`; nạp lại danh sách sản phẩm từ `/branches/{activeBranch.id}/products` mỗi khi đổi chi nhánh, loại bỏ hiển thị nhầm sản phẩm của chi nhánh khác hoặc mock data.

**Out of scope**
- Thay đổi công thức tính lương cuối tháng hoặc thuật toán nhận diện khuôn mặt AI FaceID.
- Thay đổi quy tắc mở/đóng ca và bàn giao két tiền đối với vai trò Nhân viên (`STAFF`).

## 7. Người dùng liên quan
- Chủ cửa hàng (`STORE_OWNER`)
- Nhân viên bán hàng / Thu ngân (`STAFF`)

## 8. Tiêu chí coi là đã sửa
- Backend khởi động sạch trên PostgreSQL, không còn lỗi `42703` (`WalletBalance`, `ConversionRate`) hay lỗi DDL rollback; `DbInitializer` chạy hoàn tất từ đầu đến cuối.
- Đăng nhập `0918889999` / `123456` thành công; vào POS không hiện bất kỳ cảnh báo/nút mở ca hay đóng ca nào và thanh toán đơn hàng thành công ngay lập tức.
- Chọn chuyển đổi giữa các chi nhánh trên POS (VD: Ba Đình 5 SP, Đống Đa 3 SP) chỉ hiển thị đúng các sản phẩm Active được gán cho chi nhánh đang chọn.
- Đăng nhập 2 nhân viên all-time cùng chi nhánh Ba Đình (`0917778888` / `123456` và `0914445555` / `123456`) ở bất kỳ giờ nào trong ngày (24/7): chấm công vào ca thành công, xuất hiện nút **"Vào màn bán hàng POS"**, bấm vào mở `/employee/pos` và mở ca/tham gia ca bán hàng thành công.
- Toàn bộ unit/integration test Backend và build Frontend (`tsc -b && vite build`) pass 100%.
