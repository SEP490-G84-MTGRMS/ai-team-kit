# Spec: notifications

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-NOTIF-01 Bell Badge & Unread Counter
Hệ thống MUST hiển thị một biểu tượng chuông thông báo trên thanh `AppTopNav` kèm theo một Badge hiển thị số lượng thông báo chưa đọc (`unreadCount`).
Khi không có thông báo chưa đọc nào (`unreadCount === 0`), Badge đỏ MUST tự động ẩn đi.
Khi có thông báo chưa đọc lớn hơn 99, Badge MUST hiển thị định dạng `99+`.

#### Scenario: Hiển thị số lượng chưa đọc khi có thông báo mới
- **GIVEN**: Người dùng đang ở bất kỳ trang nào thuộc layout Store Owner và có 3 thông báo chưa đọc trong kho dữ liệu.
- **WHEN**: Trang web được nạp hoặc danh sách thông báo được cập nhật.
- **THEN**: Nút chuông trên `AppTopNav` hiển thị Badge màu đỏ với chữ số "3".

#### Scenario: Ẩn Badge khi không còn thông báo chưa đọc
- **GIVEN**: Người dùng đang mở popover thông báo và có 3 thông báo chưa đọc.
- **WHEN**: Người dùng nhấp vào nút "Đánh dấu tất cả đã đọc".
- **THEN**: Tất cả thông báo chuyển sang trạng thái `isRead = true`, Badge đỏ trên chuông biến mất ngay lập tức.

---

### Requirement: REQ-NOTIF-02 Quick Popover Dropdown & 2 Tabs
Khi người dùng nhấp vào nút chuông, hệ thống MUST hiển thị một Popover Dropdown nổi bên dưới nút chuông mà không làm thay đổi URL hiện tại.
Popover MUST chứa 2 Tab: "Chưa đọc" và "Tất cả".
- Tab "Chưa đọc" chỉ hiển thị các thông báo có `isRead === false`.
- Tab "Tất cả" hiển thị toàn bộ thông báo sắp xếp theo thời gian giảm dần (mới nhất lên đầu).
Popover MUST cung cấp nút "Đánh dấu tất cả đã đọc" ở header và nút "Xem tất cả thông báo" ở footer để mở Drawer.

#### Scenario: Chuyển đổi giữa 2 tab Chưa đọc và Tất cả
- **GIVEN**: Popover đang mở và người dùng đang ở Tab "Chưa đọc" (có 2 thông báo).
- **WHEN**: Người dùng nhấp vào Tab "Tất cả".
- **THEN**: Danh sách hiển thị chuyển sang toàn bộ 5 thông báo (cả đã đọc và chưa đọc) trong vòng < 50ms.

#### Scenario: Hiển thị Empty State khi không có thông báo chưa đọc
- **GIVEN**: Toàn bộ thông báo đã được đọc hết (`unreadCount === 0`).
- **WHEN**: Người dùng mở Popover và xem Tab "Chưa đọc".
- **THEN**: Giao diện hiển thị minh họa rỗng cùng thông điệp "Bạn đã đọc hết mọi thông báo!".

---

### Requirement: REQ-NOTIF-03 Quick Actions & Deep Link Navigation
Mỗi Card thông báo trong Popover và Drawer MUST hiển thị icon màu theo mức độ cảnh báo (`critical`, `warning`, `info`, `success`), tiêu đề, tóm tắt nội dung, thời gian tương đối (ví dụ: "5 phút trước") và nút Quick Action (nếu có cấu hình).
Khi người dùng nhấp vào nút Quick Action hoặc thân Card, hệ thống MUST tự động đánh dấu thông báo đó là đã đọc và điều hướng đến đường dẫn `actionUrl` tương ứng.

#### Scenario: Bấm nút Quick Action xem lô hàng cận date
- **GIVEN**: Có một thông báo cảnh báo "Lô sữa tươi Ba Vì cận date" với nút Quick Action "Xem lô hàng" liên kết tới `/admin/batches?batchId=L0492`.
- **WHEN**: Người dùng nhấp trực tiếp vào nút "Xem lô hàng".
- **THEN**: 
  - Thông báo được đánh dấu `isRead = true`.
  - Popover tự động đóng lại.
  - Ứng dụng chuyển hướng ngay đến trang `/admin/batches?batchId=L0492`.

#### Scenario: Ngăn chặn nổi bọt sự kiện (Event Bubbling)
- **GIVEN**: Người dùng nhấp vào nút Quick Action nằm bên trong Card.
- **WHEN**: Sự kiện click được kích hoạt trên nút Quick Action.
- **THEN**: Hệ thống gọi `e.stopPropagation()` để đảm bảo action được thực hiện duy nhất một lần và không bị kích hoạt kép với sự kiện click của thân Card.

---

### Requirement: REQ-NOTIF-04 Full-history Slide Drawer
Khi người dùng nhấp vào nút "Xem tất cả thông báo" tại footer của Popover, hệ thống MUST đóng Popover và trượt mở một Slide Drawer từ cạnh phải màn hình.
Drawer MUST cung cấp:
1. Ô tìm kiếm theo từ khóa trong tiêu đề và nội dung.
2. Bộ lọc theo mức độ cảnh báo (Tất cả, Cảnh báo 🔴, Nhắc nhở 🟡, Giao dịch 🟢).
3. Nút xóa từng thông báo và nút "Xóa tất cả đã đọc".

#### Scenario: Mở Drawer xem toàn bộ lịch sử
- **GIVEN**: Người dùng đang mở Popover thông báo.
- **WHEN**: Người dùng nhấp vào nút "Xem tất cả thông báo" ở chân Popover.
- **THEN**: Popover đóng lại và Drawer trượt mở từ bên phải với animation mượt mà (60fps), hiển thị toàn bộ lịch sử thông báo kèm thanh tìm kiếm.

#### Scenario: Lọc thông báo theo mức độ khẩn cấp trong Drawer
- **GIVEN**: Drawer đang hiển thị 10 thông báo gồm nhiều loại khác nhau.
- **WHEN**: Người dùng nhấp vào chip lọc "Cảnh báo" (critical).
- **THEN**: Danh sách lập tức lọc lại chỉ hiển thị các thông báo có `severity === 'critical'` (ví dụ: cận date, lệch quỹ tiền mặt).

---

### Requirement: REQ-NOTIF-05 Local State Persistence & Mutations
Hệ thống MUST lưu trữ danh sách thông báo và trạng thái đọc vào `localStorage` dưới khóa `mt_grms_notifications_v1`.
Khi người dùng tải lại trang (F5), trạng thái thông báo (đã đọc, chưa đọc, các tin đã xóa) MUST được bảo lưu chính xác.

#### Scenario: Bảo toàn trạng thái đã đọc qua các lần reload trang
- **GIVEN**: Người dùng đã đánh dấu đọc 2 thông báo.
- **WHEN**: Người dùng bấm F5 làm mới trình duyệt.
- **THEN**: Dữ liệu từ `localStorage` được nạp lại, 2 thông báo đó vẫn giữ trạng thái `isRead = true` và Badge đếm số lượng không bị nhảy lại về số cũ.

---

## Lịch sử
- 2026-10-20 · `fe-notification-center` · +5 ~0 -0
