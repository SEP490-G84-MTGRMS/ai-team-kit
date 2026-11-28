# Proposal: pos-cash-control-nav-and-shift-history

## Vấn đề
1. **Trải nghiệm bán hàng tại POS bị phân tán**: Giao diện bán hàng POS (`PosHeader.tsx`) dành cho Chủ cửa hàng (`StoreOwner`) hiện vẫn chứa nút "Hạn mức & Duyệt chi két" trong menu thao tác quầy (Hamburger Menu). Điều này làm rối màn hình thu ngân vốn cần tối giản, thao tác nhanh. Thiết lập hạn mức và phê duyệt chi quỹ két là tính năng quản trị hệ thống, cần nằm tập trung trong menu "Cài đặt & Thiết lập" (`AppTopNav.tsx`) của Portal Chủ cửa hàng như bản thiết kế.
2. **Thiếu liên kết giữa Lịch làm việc và Lịch sử giao ca**: Trang "Lịch làm việc" chi nhánh (`WorkSchedulePage.tsx` tại `/store-owner/employees/schedule`) hiện quản lý phân ca làm việc theo tuần cho nhân viên nhưng chưa có nút truy cập nhanh để kiểm tra "Lịch sử giao ca / chốt ca" thực tế phát sinh tại quầy POS của các nhân viên đó.
3. **Giao diện ca POS trên Front-end chưa tinh gọn**: Trang `PosShiftPage.tsx` vẫn còn giữ các tab mock dữ liệu kiểm đếm mệnh giá phức tạp (trong khi đã có modal chốt ca `CloseShiftModal.tsx` tại POS), chưa kết nối trọn vẹn với API `GetShiftHistory` và luồng xác nhận bàn giao (`ConfirmHandover`) của Back-end.

## Mục tiêu
1. **Tối ưu hóa POS Header**: Gỡ bỏ hoàn toàn nút/mục "Hạn mức & Duyệt chi két" khỏi màn hình bán hàng POS (`PosHeader.tsx` & `PosCheckoutPage.tsx`), xác nhận mục này đã hiện diện chuẩn xác và hoạt động tốt trong menu "Cài đặt & Thiết lập" (`/store-owner/pos-cash-control`).
2. **Bổ sung lối tắt tại Lịch làm việc**: Thêm button "Lịch sử giao ca" (hoặc "Nhật ký ca quầy") tại thanh công cụ trang "Lịch làm việc" (`WorkSchedulePage.tsx`), cho phép Chủ cửa hàng / Quản trị viên mở xem nhanh lịch sử ca bán hàng và bàn giao theo chi nhánh.
3. **Tinh gọn giao diện Ca bán hàng**: Tinh chỉnh `PosShiftPage.tsx` để tập trung vào tra cứu lịch sử đóng ca, xem chi tiết báo cáo Z-Report, và xác nhận bàn giao chốt ca (`ConfirmHandover` / `ConfirmCloseShift`) sử dụng dữ liệu thực tế từ Backend.
4. **Kiểm chứng Backend & Unit Tests**: Kiểm tra các API `GetShiftHistory`, `ConfirmHandover`, `GetCashMovementSettings`, `ApproveCashMovement` trong `ShiftsController`, bổ sung unit test tự động đầy đủ và kết nối đồng bộ giữa Backend và Frontend.

## Phạm vi
### In Scope:
- **Front-end POS**: Xóa mục "Hạn mức & Duyệt chi két" khỏi Hamburger Menu của `PosHeader.tsx`, dọn dẹp state thừa `pendingApprovalCount` trong `PosCheckoutPage.tsx`.
- **Front-end Portal Settings**: Đảm bảo mục "Hạn Mức & Duyệt Chi Két POS" trong menu dropdown "Cài đặt & Thiết lập" trên `AppTopNav.tsx` liên kết tới trang `StorePosCashControlPage.tsx` (`/store-owner/pos-cash-control`) hoạt động chuẩn xác theo ảnh thiết kế.
- **Front-end Work Schedule**: Thêm button "Lịch sử giao ca" tại header toolbar của `WorkSchedulePage.tsx` cho phép điều hướng hoặc xem danh sách ca bán hàng theo chi nhánh.
- **Front-end Shift History**: Tinh gọn `PosShiftPage.tsx`, loại bỏ tab mock trùng lặp, tích hợp API `posShiftApi.getShiftHistory` lấy dữ liệu thật từ Backend (chi nhánh, thời gian mở/đóng, doanh thu tiền mặt, chênh lệch két, trạng thái bàn giao).
- **Back-end & Unit Tests**: Bổ sung unit tests cho `GetShiftHistoryAsync` và các nghiệp vụ liên quan trong `ShiftManagementServiceTests.cs`, đảm bảo toàn bộ test pass.

### Out of Scope:
- Không thay đổi luồng phân ca nhân viên tuần (HR Schedule CRUD) trên `WorkSchedulePage`.
- Không thay đổi thuật toán khóa dòng FEFO hay tính toán khuyến mãi/voucher trong đơn hàng.

## Người dùng liên quan
- **Store Owner (Chủ cửa hàng)**: Cấu hình hạn mức chi két, duyệt phiếu chi từ menu "Cài đặt & Thiết lập"; truy cập lịch sử ca và xác nhận bàn giao từ trang "Lịch làm việc".
- **Branch Manager / Cashier (Quản lý chi nhánh / Thu ngân)**: Thao tác bán hàng trên giao diện POS gọn gàng, xem lịch sử ca và xác nhận chốt ca dễ dàng.

## Tiêu chí thành công
- [ ] Giao diện bán hàng POS không còn hiển thị nút "Hạn mức & Duyệt chi két" cho cả Thu ngân lẫn Chủ cửa hàng.
- [ ] Menu "Cài đặt & Thiết lập" của Chủ cửa hàng hiển thị đúng mục "Hạn Mức & Duyệt Chi Két POS" (khớp ảnh thiết kế) và điều hướng chuẩn xác đến `/store-owner/pos-cash-control`.
- [ ] Trang "Lịch làm việc" (`WorkSchedulePage.tsx`) có button "Lịch sử giao ca" trực quan, hỗ trợ xem nhật ký chốt ca theo chi nhánh đang chọn.
- [ ] Giao diện lịch sử ca hiển thị dữ liệu thực từ Backend API `GET /api/pos/shifts/history`, hỗ trợ lọc theo chi nhánh, thời gian và xem Z-Report.
- [ ] Toàn bộ Backend Unit Tests đạt 100% pass, Frontend build sạch sẽ không lỗi TypeScript (`tsc -b && vite build`).
