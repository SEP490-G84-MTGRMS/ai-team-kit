# EXP-2026-11-08-001: Khám Phá & Phân Tích Kỹ Thuật: Sửa Lỗi 400 Lịch Sử Ca, Sidebar Quản Trị & Cấu Hình Nhân Viên Test Bán Hàng

## 1. Problem Statement (Vấn Đề)
1. **Lỗi HTTP 400**: Trang Lịch Sử Chốt Ca & Bàn Giao Quầy gặp lỗi `Request failed with status code 400` do truyền mã chi nhánh mock `BR-AN-01` (string) lên API yêu cầu kiểu `Guid branchId`.
2. **Thiếu Sidebar quản trị**: Trang lịch sử ca đang dùng `PosLayout` thay vì `StoreOwnerLayout`, khiến Chủ cửa hàng mất thanh điều hướng Sidebar bên trái.
3. **Cần môi trường test 2 nhân viên bán chung ca**: Khách hàng cần 2 tài khoản nhân viên thật hoạt động cùng ca tại Chi nhánh Ba Đình để mở 2 tab/cửa sổ test bán hàng thực tế và kiểm chứng tính năng chốt ca.
4. **Dư thừa in Z-report**: Modal in phiếu K80 (`ZReportModal`) gây rườm rà khi chốt ca và trong lịch sử ca.
5. **Dư thừa hiển thị Quầy**: POS hiển thị `&bull; Quầy #01` gây hiểu nhầm về phân bổ dòng tiền.

## 2. Context & Root Cause Analysis (Nguyên Nhân Gốc Rễ)

### 2.1. Lỗi 400 Lịch sử ca
* **File/Dòng**: `MT_GRMS_FRONTEND/src/features/pos/pages/PosShiftPage.tsx` (dòng 25, 45, 305).
* **Root cause**: `selectedBranchId` dùng dữ liệu mock `AN_NHIEN_BRANCHES` với `id: 'BR-AN-01'`. Khi gửi request `GET /api/v1/shifts/history?branchId=BR-AN-01`, ASP.NET Core Model Binding (`ShiftsController.cs` dòng 148: `[FromQuery] Guid branchId`) không thể chuyển đổi chuỗi `BR-AN-01` sang kiểu `System.Guid`, trả về HTTP 400 Bad Request ngay trước khi vào controller action.

### 2.2. Về cấu trúc Layout
* **File/Dòng**: `MT_GRMS_FRONTEND/src/app/router.tsx` (dòng 861-864).
* **Root cause**: Route `shift` nằm trong nhóm `/pos` (sử dụng `PosLayout` không có sidebar). Trong khi đó, các trang quản trị của Store Owner đều nằm trong nhóm `/store-owner` (sử dụng `StoreOwnerLayout` tích hợp Sidebar và TopNav).

### 2.3. Về tài khoản kiểm thử 2 nhân viên
* **Hiện trạng**: Trong `DbInitializer.cs`, đã có sẵn 2 tài khoản nhân viên thuộc Chi nhánh Ba Đình:
  * `staffUser` (`0917778888` / `123456`): "Phạm Thị Yến (Nhân viên Ba Đình)"
  * `staffUser3` (`0915556666` / `123456`): "Nguyễn Văn Minh (Nhân viên Ba Đình)"
* **Cần đảm bảo**: Cả 2 tài khoản này có phân ca làm việc (Work Schedule) hợp lệ trên Chi nhánh Ba Đình để khi đăng nhập vào `/employee/pos` có thể tham gia bán hàng ngay lập tức.

### 2.4. Về in Z-Report & Hiển thị Quầy
* `PosCheckoutPage.tsx` (dòng 1137-1138) tự động bật `isZReportModalOpen(true)` sau khi chốt ca.
* `PosShiftPage.tsx` (dòng 551-572) có nút "Z-Report" mở modal in phiếu K80.
* `PosHeader.tsx` (dòng 298, 302) hiển thị cứng `&bull; Quầy #01`.

## 3. Assumptions (Giả Định)
- **[ASSUMPTION-01]**: Cửa hàng quản lý chung dòng tiền theo chi nhánh, các nhân viên cùng trực tại một chi nhánh sẽ ghi nhận doanh số vào cùng một phiên ca làm việc (`ShiftZReport`) đang mở của chi nhánh đó.
- **[ASSUMPTION-02]**: Hai tài khoản nhân viên `0917778888` và `0915556666` có quyền truy cập module POS nhân viên (`/employee/pos`) để thực hiện các giao dịch bán hàng.

## 4. Scope & Non-Goals
### In Scope
- Đổi cách lấy danh sách chi nhánh trong `PosShiftPage.tsx` sang gọi `employeeApi.getBranches()` (hoặc `branchApi.getBranches()`) để lấy GUID thật.
- Bổ sung fallback an toàn tại `ShiftsController.cs` để không bao giờ quăng lỗi 400 khi `branchId` rỗng hoặc không truyền.
- Thêm route `/store-owner/shifts` trong `StoreOwnerLayout` và cập nhật nút "Lịch sử giao ca" tại `WorkSchedulePage.tsx`.
- Loại bỏ toàn bộ `ZReportModal` và các trigger in ấn khi chốt ca POS cũng như trong bảng lịch sử.
- Xóa chữ `&bull; Quầy #01` trong `PosHeader.tsx`.
- Đảm bảo 2 tài khoản nhân viên `0917778888` và `0915556666` có dữ liệu phân ca đầy đủ trên Chi nhánh Ba Đình.

### Non-Goals
- Không thay đổi công thức tính tiền két lý thuyết $G = A + \text{CashSales} + \text{CashIn} - \text{CashOut}$.
- Không thay đổi logic phân bổ tiền `RetainedFloat + DroppedToSafe == ActualCashCounted`.

## 5. Phương Án Kỹ Thuật (Options Analysis)

* **Phương án 1 (Chỉ sửa cứng GUID trong mock data)**:
  * *Ưu điểm*: Nhanh chóng.
  * *Nhược điểm*: Dễ vỡ khi database được reset hoặc chạy trên các tenant khác có GUID chi nhánh khác nhau.
* **Phương án 2 (Được chọn - Toàn diện & Bền vững)**:
  * Gọi API `employeeApi.getBranches()` tải danh sách chi nhánh thật từ CSDL, lưu `selectedBranchId` bằng GUID thật.
  * Backend `ShiftsController.GetShiftHistory`: Cho phép `[FromQuery] Guid? branchId`, nếu `null` hoặc `Empty` thì tự động lấy `CurrentBranchId` của Tenant/User.
  * Đặt trang Lịch sử ca vào `StoreOwnerLayout` (có Sidebar và TopNav).
  * Xóa bỏ hoàn toàn phần in Z-Report K80 và nhãn Quầy.

## 6. Success Criteria (Tiêu Chí Thành Công)
1. Tải danh sách lịch sử ca HTTP 200 OK, hiển thị đầy đủ bảng dữ liệu và 4 thẻ KPI.
2. Trang Lịch sử chốt ca hiển thị hoàn hảo trong khung Sidebar quản trị của Chủ cửa hàng.
3. Đăng nhập 2 tài khoản `0917778888` và `0915556666`, bán hàng trong cùng 1 ca, kiểm tra ca chốt ghi nhận cả 2 nhân viên trong danh sách người tham gia (`Participants`).
4. Không còn popup in Z-Report K80 khi đóng ca hoặc xem lịch sử.
5. Header POS sạch sẽ, không còn chữ "Quầy".
