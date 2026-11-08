# Đề xuất sửa lỗi: Tối ưu POS Header Owner, hiển thị chi nhánh thực tế và bảo toàn người tạo đơn hàng

## 1. Mô tả lỗi và bất cập
Trong hệ thống bán hàng POS và quản lý hóa đơn/đơn hàng:
1. **Dropdown POS Header thừa nút**: Khi đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`), dropdown góc phải màn hình bán hàng POS vẫn hiển thị nút "Lịch sử ca cửa hàng", trong khi menu chính ngoài dashboard đã có trang quản lý ca cửa hàng (`/store-owner/shifts`).
2. **Nhãn chi nhánh không rõ ràng**: Trên thanh thông tin của trang danh sách hóa đơn (`InvoiceManagementPage.tsx`), hệ thống hiển thị chuỗi tĩnh `"Chi nhánh: Chi nhánh được phân công"` do lỗi so khớp `branchId` (ID dạng GUID thực tế không khớp với mock hardcode `"BR-AN-01"`), không hiển thị được tên thật của chi nhánh.
3. **Chủ cửa hàng bị giới hạn chi nhánh ở danh sách đơn hàng**: Khi đăng nhập Chủ cửa hàng, trang quản lý hóa đơn/đơn hàng chưa mặc định hiển thị toàn bộ đơn hàng của tất cả chi nhánh và thiếu bộ lọc linh hoạt tất cả chi nhánh.
4. **Sai lệch tên người tạo đơn hàng khi chuyển tài khoản**: Đơn hàng do nhân viên bán hàng (ví dụ: `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`) thanh toán. Tuy nhiên khi tài khoản Chủ cửa hàng đăng nhập để xem danh sách đơn hàng, cột "Người tạo" lại bị đổi thành tên của Chủ cửa hàng. Nguyên nhân do `Order` entity và `OrderResponse` ở backend chưa lưu vết snapshot `CashierName`, khiến frontend fallback lấy `user?.fullName` của người đang đăng nhập.

---

## 2. Các bước tái hiện lỗi (Steps to Reproduce)
- **Lỗi 1 (Nút lịch sử ca)**: Đăng nhập tài khoản Chủ cửa hàng -> Vào màn hình POS bán hàng -> Nhấn mở menu dropdown người dùng góc phải trên POS Header -> Thấy xuất hiện nút "Lịch sử ca cửa hàng".
- **Lỗi 2 (Tên chi nhánh)**: Đăng nhập vào trang Quản lý hóa đơn / Đơn hàng -> Nhìn lên thanh tiêu đề/thông tin chi nhánh -> Thấy hiển thị `"Chi nhánh: Chi nhánh được phân công"`.
- **Lỗi 3 (Bộ lọc chi nhánh cho Owner)**: Đăng nhập Chủ cửa hàng -> Vào Quản lý hóa đơn -> Bộ lọc chi nhánh bị gán cứng chi nhánh đầu tiên thay vì mặc định xem "Tất cả chi nhánh".
- **Lỗi 4 (Người tạo đơn bị đổi)**:
  1. Đăng nhập tài khoản Nhân viên bán hàng `Nguyễn Văn Minh` -> Bán hàng tạo đơn POS thành công.
  2. Đăng xuất -> Đăng nhập tài khoản Chủ cửa hàng -> Vào danh sách hóa đơn / đơn hàng.
  3. Cột "Người tạo" của đơn hàng vừa tạo bị hiển thị tên của Chủ cửa hàng thay vì giữ nguyên `Nguyễn Văn Minh`.

---

## 3. Kết quả thực tế vs Kết quả mong đợi
| Tính năng | Hiện trạng (Thực tế) | Mong đợi |
|---|---|---|
| Dropdown POS Header (Owner) | Hiển thị nút "Lịch sử ca cửa hàng" | Ẩn nút "Lịch sử ca cửa hàng" khi là `STORE_OWNER` (vì dashboard đã có) |
| Nhãn chi nhánh ở trang đơn hàng | `"Chi nhánh: Chi nhánh được phân công"` | Hiển thị đúng tên chi nhánh thật: `"Chi nhánh: An Nhiên Mart - Chi nhánh Ba Đình"` (hoặc theo chi nhánh tương ứng) |
| Phạm vi xem đơn hàng của Owner | Bị khóa vào 1 chi nhánh được gán | Cho phép Owner xem "Tất cả chi nhánh" (`ALL`) mặc định, và chọn xem từng chi nhánh |
| Cột Người tạo đơn hàng | Hiển thị theo `user?.fullName` của người đang đăng nhập xem trang | Hiển thị chính xác tên nhân viên bán hàng đã tạo đơn (snapshot `CashierName` lưu trong DB) |

---

## 4. Mức độ ảnh hưởng (Impact Assessment)
- **Nghiệp vụ & Báo cáo**: Sai lệch nghiêm trọng về trách nhiệm bán hàng (audit log/trách nhiệm đơn hàng) khi chủ cửa hàng xem lại thấy tên mình lập thay vì nhân viên bán hàng thực tế.
- **Trải nghiệm người dùng**: Gây khó chịu khi không biết đang xem đơn hàng của chi nhánh nào ("Chi nhánh được phân công") và không xem được tổng quan toàn bộ chuỗi cửa hàng.

---

## 5. Tiêu chí thành công (Acceptance Criteria)
1. Dropdown POS Header không còn hiển thị nút "Lịch sử ca cửa hàng" đối với tài khoản `STORE_OWNER` / `ADMIN`.
2. Trang Quản lý hóa đơn hiển thị đúng tên thật của chi nhánh từ API/Context thay vì chuỗi fallback `"Chi nhánh được phân công"`.
3. Tài khoản Chủ cửa hàng (`STORE_OWNER`) mặc định xem đơn hàng của tất cả chi nhánh (`branchFilter = 'ALL'`) và có thể lọc theo từng chi nhánh.
4. Backend lưu `CashierName` vào `Order` entity khi tạo đơn, trả về qua `OrderResponse`.
5. Frontend hiển thị đúng `CashierName` thực tế của người bán hàng, không bị đổi thành tên người đang xem.
6. Build backend & frontend thành công, 100% test pass.
