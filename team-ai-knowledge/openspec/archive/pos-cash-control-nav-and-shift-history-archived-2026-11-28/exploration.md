# Exploration: pos-cash-control-nav-and-shift-history

## 1. Hiện trạng code & Bối cảnh (Current State & Context)
- **POS Checkout & Header (`PosHeader.tsx`, `PosCheckoutPage.tsx`)**:
  - `PosHeader.tsx` hiện chứa nút "Hạn mức & Duyệt chi két" trong Hamburger Menu khi user đăng nhập là `STORE_OWNER`.
  - Nút này dẫn ra `/store-owner/pos-cash-control`. Việc đặt nút này tại màn hình bán hàng POS vi phạm nguyên tắc tập trung: thu ngân/chủ cửa hàng khi đứng tại quầy POS chỉ cần tập trung thao tác nghiệp vụ bán hàng, kiểm đếm và chốt ca nhanh. Thiết lập hạn mức và phê duyệt chi quỹ két là tính năng quản trị cấp cao.
  - Phía ngoài portal quản trị của Chủ cửa hàng (`StoreOwnerLayout`), thanh điều hướng `AppTopNav.tsx` đã có sẵn menu "Cài đặt & Thiết lập" với mục "Hạn Mức & Duyệt Chi Két POS" (như ảnh mockup).
- **Lịch làm việc chi nhánh (`WorkSchedulePage.tsx`)**:
  - Trang `/store-owner/employees/schedule` hiển thị lịch làm việc, phân ca theo tuần của nhân viên từng chi nhánh nhưng chưa có lối tắt sang "Lịch sử giao ca / chốt ca" thực tế phát sinh tại quầy POS.
- **Trang Ca bán hàng (`PosShiftPage.tsx`)**:
  - Hiện chứa 2 tab: Tab 1 "Kiểm đếm két & Bàn giao ca" (sử dụng mock data bảng mệnh giá, vốn đã được thay thế hoàn toàn bởi modal chốt ca `CloseShiftModal.tsx` tại POS), và Tab 2 "Báo cáo sổ quỹ & Lịch sử đóng ca" (dùng mock data `mockShiftHistory`).
  - Trang này cần được tinh giản thành màn hình tập trung cho việc tra cứu lịch sử ca bán hàng, xem báo cáo Z-Report và xác nhận bàn giao (`ConfirmHandover`), kết nối API thật `GET /api/pos/shifts/history`.
- **Backend (`ShiftsController.cs`, `ShiftService.cs`, `ShiftRepository.cs`)**:
  - Backend đã có sẵn endpoint `GET /api/pos/shifts/history` và `POST /api/pos/shifts/{id}/confirm-handover`.
  - `ShiftRepository.GetHistoryAsync` hiện chưa eager load `Participants` và `CloseConfirmations`, cần bổ sung `.Include()` để dữ liệu lịch sử phản ánh đầy đủ nhân viên tham gia ca và xác nhận đóng ca.

## 2. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Chủ cửa hàng chỉ cấu hình hạn mức chi két và duyệt chi tiền mặt ngoài giờ bán hàng hoặc từ giao diện quản trị (`/store-owner/pos-cash-control`), không cần thao tác trực tiếp trên màn hình quầy bán hàng.
- **[ASSUMPTION-02]**: Khi nhấn "Lịch sử giao ca" từ trang Lịch làm việc (`WorkSchedulePage.tsx`), người dùng muốn xem danh sách các phiên ca POS đã diễn ra tại chi nhánh đang chọn trên bộ lọc lịch làm việc.
- **[ASSUMPTION-03]**: Thu ngân hoặc nhân viên ca sau khi nhận bàn giao ca cũ có thể xác nhận bàn giao trực tiếp từ trang Lịch sử ca hoặc modal chi tiết.

## 3. Non-Goals (Những gì không làm)
- Không thay đổi luồng nghiệp vụ xếp lịch làm việc (Work Schedule CRUD / ca tuần) của phân hệ HR.
- Không thay đổi logic tính toán doanh thu đơn hàng, khuyến mãi hoặc phân bổ lô FEFO trong đơn hàng.
- Không viết lại toàn bộ giao diện `StorePosCashControlPage.tsx` vì trang này đã hoạt động tốt, chỉ đảm bảo kết nối nhất quán và chuẩn hóa định tuyến.

## 4. Đánh giá các phương án (Options Analysis)

### Phương án 1: Giữ nguyên button trong POS nhưng thêm điều kiện phân quyền, mở Drawer xem lịch sử tại trang Lịch làm việc
- **Ưu điểm**: Không thay đổi luồng điều hướng trang.
- **Nhược điểm**: Màn hình bán hàng POS vẫn bị phân mảnh và cồng kềnh; việc mở Drawer lớn tại trang Lịch làm việc sẽ che khuất bảng lịch và làm nặng DOM; trang `PosShiftPage.tsx` vẫn duy trì dữ liệu mock gây nhầm lẫn.

### Phương án 2 (Được chọn): Chuyển dứt điểm quản trị Hạn mức sang menu Cài đặt & Thiết lập, bổ sung button điều hướng Lịch sử ca tại Lịch làm việc, tinh gọn trang PosShiftPage
- **Ưu điểm**:
  - Màn hình POS được làm sạch hoàn toàn khỏi các thao tác quản trị tài chính cấp cao, đúng tinh thần POS bán nhanh.
  - Khớp 100% với ảnh giao diện menu "Cài đặt & Thiết lập" mà người dùng yêu cầu.
  - Trang Lịch làm việc có nút "Lịch sử giao ca" rõ ràng, điều hướng sang trang `PosShiftPage` đã được tinh gọn (chỉ còn danh sách ca thật, KPI doanh thu/chênh lệch, xem Z-Report và xác nhận bàn giao).
  - Tận dụng triệt để API Backend có sẵn, tăng độ tin cậy nhờ bổ sung Unit Tests.
- **Nhược điểm**: Cần dọn dẹp nhẹ các component và mock data không còn sử dụng trong `PosShiftPage.tsx`.

## 5. Rủi ro & Cách giảm thiểu (Risks & Mitigations)
- **Rủi ro**: Khi từ trang Lịch làm việc điều hướng sang Lịch sử ca, chi nhánh đang chọn có thể bị mất.
  - *Giải pháp*: Truyền query parameter `?branchId=...` trên URL điều hướng và lưu trữ chi nhánh đồng bộ qua URL params.
- **Rủi ro**: Dữ liệu lịch sử ca có thể chậm nếu nhiều ca cũ.
  - *Giải pháp*: API đã có sẵn lọc theo dải ngày (`fromDate`, `toDate`) và sắp xếp `OrderByDescending(s => s.OpenedAtUtc)`.
