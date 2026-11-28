# Proposal: fe-notification-center

## 1. Vấn Đề (Problem Statement)
- Hiện tại trên thanh điều hướng `AppTopNav` của MT-GRMS, biểu tượng chuông (`BellIcon`) chỉ là một button tĩnh với chấm đỏ cố định, chưa có luồng tương tác và chưa kết nối dữ liệu cảnh báo.
- Chủ cửa hàng (Store Owner) và Quản lý không nhận được các cảnh báo nghiệp vụ thời gian thực về:
  1. Hàng hóa cận date theo nguyên tắc FEFO (FE-02) dẫn đến rủi ro hết hạn và thất thoát vốn.
  2. Lệch tiền két kiểm kê ca POS (FE-17, GBR-CSH-04).
  3. Khách hàng nợ vượt hạn mức trần nợ (FE-08).
  4. Hóa đơn chi phí dịch vụ định kỳ đến hạn thanh toán (FE-07).
  5. Hạn nộp tờ khai thuế hộ kinh doanh theo quý (FE-19).
- Thiếu trung tâm thông báo tập trung khiến chủ cửa hàng phải đi từng trang để kiểm tra thủ công, làm chậm trễ các quyết định xử lý kịp thời.

## 2. Mục Tiêu (Goals)
- Xây dựng **Notification Center** chuyên nghiệp, thân thiện và hiệu năng cao dành cho Store Owner / Admin.
- Tích hợp **Badge đếm số thông báo chưa đọc** tự động trên `AppTopNav`.
- Cung cấp **Notification Popover Dropdown** mở nhanh với 2 tab "Chưa đọc" và "Tất cả", tích hợp nút hành động nhanh (Quick Action) và Deep Link chuyển trang.
- Cung cấp **Notification Drawer** trượt từ cạnh phải cho phép xem toàn bộ lịch sử thông báo, tìm kiếm, lọc theo mức độ nghiêm trọng và dọn dẹp thông báo.

## 3. Phạm Vi (Scope)

### Trong phạm vi (In-Scope):
- Thiết kế giao diện và component React: `NotificationBadge`, `NotificationPopover`, `NotificationDrawer`, `NotificationCard`.
- Thiết kế state management bằng hook/store (`useNotificationStore`) hỗ trợ persistent cache qua `localStorage`.
- Hỗ trợ 4 mức độ cảnh báo: Critical (Đỏ), Warning (Vàng), Info (Xanh dương), Success (Xanh lá).
- Tích hợp nút hành động nhanh (Quick Action) và Deep Link chuyển hướng chính xác đến các phân hệ: Lô hàng FEFO (FE-02), Sổ quỹ (FE-17), Khách hàng (FE-08), Mua sắm dịch vụ (FE-07), Kê khai thuế (FE-19).
- Bộ dữ liệu mẫu (mock data) đầy đủ 5 phân hệ để người dùng trải nghiệm thực tế ngay lập tức.
- Kiểm thử unit test và giao diện UI responsive.

### Ngoài phạm vi (Out-of-Scope):
- Server-side WebSocket / SignalR push notification (sẽ được đấu nối trong giai đoạn tích hợp backend chuyên sâu).
- Browser Web Push Notifications (Native Push API trên thiết bị di động).

## 4. Người Dùng & Vai Trò (Target Users & Roles)
- **Store Owner (Chủ cửa hàng):** Nhận toàn bộ cảnh báo về dòng tiền, thất thoát kho, nợ vượt trần và thuế.
- **Store Manager (Quản lý cửa hàng):** Nhận thông báo về xuất nhập kho, cận date và ca làm việc của nhân viên.

## 5. Tiêu Chí Thành Công (Success Criteria)
1. Bấm vào BellIcon mở Popover Dropdown trong vòng < 100ms, không lag, không giật màn hình.
2. Badge đếm số lượng tin chưa đọc chính xác; tự động giảm khi người dùng bấm xem hoặc bấm "Đánh dấu đã đọc".
3. Thao tác chuyển giữa 2 tab "Chưa đọc" và "Tất cả" diễn ra tức thì.
4. Bấm nút Quick Action (ví dụ: "Xem lô hàng", "Chi tiền ngay") kích hoạt đúng Deep Link đến trang phân hệ tương ứng.
5. Drawer trượt mở mượt mà (60fps), hỗ trợ tìm kiếm và lọc thông báo theo loại cảnh báo.
6. Tuân thủ 100% design system của dự án, đạt chuẩn TypeScript, không có console errors.
