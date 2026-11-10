# Đề Xuất (Proposal): pos-owner-shift-mode-prompt-and-cashier-history

## 1. Vấn đề (Problem Statement)
1. **Thiếu sự phối hợp dòng tiền quầy giữa Chủ cửa hàng và Nhân viên thu ngân**:
   - Khi Chủ cửa hàng (`STORE_OWNER` / `ADMIN`) vào POS tại một chi nhánh đang có ca bán hàng mở của nhân viên thu ngân, theo cơ chế Shiftless trước đây (`REQ-OWNER-SHIFTLESS-04`), toàn bộ đơn hàng của chủ cửa hàng mặc định bị tách khỏi ca (`ShiftId = null`) và dòng tiền mặt ghi nhận thẳng vào Két sắt (`Safe`).
   - Nếu chủ cửa hàng đứng cùng quầy và bỏ tiền mặt nhận từ khách vào ngăn kéo quầy thu ngân (`Till`), cuối ca nhân viên kiểm đếm tiền sẽ thấy tiền thực tế thừa so với số liệu phần mềm, trong khi két sắt lại thiếu. Ngược lại, nếu chủ cửa hàng tự cầm tiền mang đi mà không thông báo, nhân viên sẽ hoang mang. Cần có sự minh bạch và lựa chọn chủ động cho chủ cửa hàng ngay khi truy cập POS.
2. **Lịch sử ca làm việc và Bàn giao quầy chỉ hiển thị 1 nhân viên thu ngân**:
   - Màn hình Lịch sử chốt ca (`/pos/shift`, `/store-owner/shifts`) và modal Bàn giao quầy trước đây chỉ ghi nhận/hiển thị nhân viên mở ca (`cashierUserId`), dù ca đó có nhiều nhân viên cùng làm việc hoặc được xếp lịch làm việc chung ca. Cần hiển thị đầy đủ mọi nhân viên tham gia ca.
3. **Phông chữ hiển thị số trên POS có dấu chấm ở giữa số 0**:
   - Các trường giá tiền trên thẻ sản phẩm POS và ô nhập tiền mặt tại modal đang sử dụng kiểu chữ monospace (`JetBrains Mono`) có đặc điểm số 0 có chấm ở giữa (dotted zero), gây cảm giác lạ lẫm và khó đọc cho người dùng tạp hóa thông thường. Cần chuẩn hóa về font chữ tự nhiên chuẩn `Be Vietnam Pro` (`font-variant-numeric: tabular-nums`).

## 2. Mục tiêu (Objectives)
1. **Modal Lựa Chọn Chế Độ Bán Cho Chủ Cửa Hàng (Owner Shift Mode Modal)**:
   - Khi Chủ cửa hàng/Admin truy cập POS tại chi nhánh đang có ca nhân viên hoạt động, hiển thị thông báo với 2 lựa chọn rõ ràng:
     - **Chế độ 1: "Bỏ chung ngăn kéo quầy (Bán vào ca)"**: Đơn hàng tự động gắn `ShiftId = currentShift.Id`, tiền mặt ghi nhận vào ngăn kéo thu ngân (`Till`), cập nhật `ExpectedCash` của ca, tự động ghi nhận chủ cửa hàng vào `ShiftParticipants` của ca.
     - **Chế độ 2: "Tự giữ / Cất két sắt (Bán riêng)"**: Đơn hàng giữ cơ chế Shiftless (`ShiftId = null`), tiền mặt ghi nhận vào Két sắt (`Safe`), tiền ngăn kéo quầy thu ngân của nhân viên hoàn toàn biệt lập.
   - Hiển thị badge trạng thái chế độ bán trên Header POS để chủ cửa hàng có thể xem lại hoặc chuyển đổi chế độ bất cứ lúc nào.
2. **Hiển Thị Đầy Đủ Toàn Bộ Nhân Viên Trong Ca Làm Việc**:
   - Khi mở ca, hệ thống tự động ghi nhận các nhân viên được xếp lịch làm việc tại chi nhánh trong ngày vào `ShiftParticipants`.
   - Khi nhân viên phát sinh đơn hàng trong ca, tự động đảm bảo nhân viên đó có mặt trong `ShiftParticipants`.
   - Trên bảng Lịch sử ca và modal Bàn giao quầy, hiển thị danh sách badges đầy đủ cho toàn bộ nhân viên tham gia ca thay vì chỉ 1 người.
3. **Chuẩn Hóa Font Số Tự Nhiên Không Chấm Giữa**:
   - Đồng bộ toàn bộ phông chữ giá sản phẩm, ô nhập tiền mặt và các chỉ số tiền tệ sang font `Be Vietnam Pro` chuẩn với thuộc tính `font-variant-numeric: tabular-nums`, loại bỏ hoàn toàn số 0 có chấm giữa.

## 3. Phạm vi (Scope)
- **Trong phạm vi (In Scope)**:
  - Frontend:
    - Component `OwnerShiftModeModal.tsx` bật lên khi chủ cửa hàng vào POS tại chi nhánh có ca mở.
    - Header Badge hiển thị chế độ hiện tại ("Bán chung ca #..." hoặc "Bán riêng két sắt") kèm nút đổi nhanh.
    - Truyền `shiftId` phù hợp trong request tạo đơn hàng (`POST /api/orders`).
    - CSS styling loại bỏ font dotted-zero, áp dụng `var(--font-sans)` + `tabular-nums`.
    - Giao diện Lịch sử ca và Bàn giao quầy hiển thị đầy đủ danh sách nhân viên tham gia ca.
  - Backend:
    - `OrderService.CreateOrderAsync`: Cho phép chủ cửa hàng chọn gắn đơn vào `activeShift` hoặc bán riêng shiftless. Ghi nhận `ShiftParticipants` và cập nhật tiền `Till` khi bán vào ca.
    - `ShiftService.OpenShiftAsync`, `GetCurrentShiftAsync`, `GetShiftHistoryAsync`: Tự động đồng bộ và trả về đầy đủ danh sách nhân viên trong ca làm việc.
- **Ngoài phạm vi (Out of Scope)**:
  - Không thay đổi quy trình bán hàng của nhân viên thường (`STAFF` bắt buộc phải có ca mở mới được bán).
  - Không thay đổi quy tắc tính toán chênh lệch tiền mặt cuối ca.

## 4. Người Dùng & Vai Trò (User Roles)
- **Chủ cửa hàng (`STORE_OWNER`) & Quản trị viên (`ADMIN`)**: Có toàn quyền lựa chọn bán chung vào ngăn kéo quầy của nhân viên hoặc bán riêng giữ tiền cá nhân / két sắt.
- **Nhân viên thu ngân (`STAFF`)**: Minh bạch dòng tiền ngăn kéo quầy khi chủ cửa hàng tham gia bán, không bị lệch tiền không rõ nguyên nhân khi chốt ca.

## 5. Tiêu chí thành công (Success Criteria)
1. Khi chủ cửa hàng chuyển đến chi nhánh có ca nhân viên đang mở: modal chọn chế độ hiển thị tự động, giải thích rõ ràng tiền sẽ đi vào đâu.
2. Chọn "Bỏ chung ngăn kéo quầy": đơn tạo ra có `ShiftId`, tiền mặt tăng `ExpectedCash` của ca, danh sách người tham gia ca có tên chủ cửa hàng.
3. Chọn "Tự giữ / Cất két sắt": đơn tạo ra có `ShiftId = null`, tiền mặt vào tài khoản Két sắt chi nhánh, tiền quầy của ca không thay đổi.
4. Lịch sử chốt ca và modal Bàn giao quầy hiển thị đầy đủ tên các nhân viên tham gia ca (badges phân tách rõ ràng).
5. Các số tiền trên POS hiển thị số 0 tròn bình thường, không có dấu chấm ở tâm.
