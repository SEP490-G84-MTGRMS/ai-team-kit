# EXP-2026-11-10-001: Quản Lý Chế Độ Bán Của Chủ Cửa Hàng Khi Có Ca Nhân Viên & Hiển Thị Đầy Đủ Nhân Viên Ca

## 1. Problem Statement
1. **Mâu thuẫn dòng tiền quầy giữa Chủ cửa hàng và Ca nhân viên**:
   - Khi Chủ cửa hàng (`STORE_OWNER` / `ADMIN`) vào POS tại chi nhánh đang có ca nhân viên mở, nếu chủ cửa hàng mặc định bán shiftless (`ShiftId = null`, tiền vào `Safe`) nhưng thực tế đứng bán cùng quầy và bỏ tiền mặt vào ngăn kéo quầy thu ngân (`Till`), nhân viên khi chốt ca kiểm đếm tiền sẽ thấy tiền thực tế bị thừa (surplus), trong khi sổ sách két sắt bị lệch.
   - Ngược lại, nếu ép chủ cửa hàng vào ca nhân viên thì chủ cửa hàng không thể bán riêng khi muốn tự giữ tiền cá nhân hoặc cất vào két sắt.
2. **Thiếu sót danh sách nhân viên tham gia ca trên màn hình Lịch sử chốt ca & Bàn giao quầy**:
   - Lịch sử ca và modal Bàn giao quầy trước đây chỉ hiển thị 1 nhân viên thu ngân mở ca (`cashierUserId`), bỏ sót các nhân viên khác cùng trực và cùng bán trong ca.
3. **Phông chữ số 0 có chấm giữa (Dotted Zero) trên giao diện POS**:
   - Thẻ sản phẩm POS và ô nhập tiền mặt dùng font monospace (`JetBrains Mono`) hiển thị số 0 có chấm tròn ở tâm, gây khó nhìn và xa lạ với người dùng tạp hóa thông thường.

## 2. Context & Background
- Hệ thống đã có `REQ-OWNER-SHIFTLESS-04` cho phép Chủ cửa hàng bán không cần mở ca (tiền vào Két sắt `Safe`).
- Hệ thống đã có `REQ-SHIFT-SHARED-01` & `REQ-SHIFT-SHARED-02` quản lý 1 ca duy nhất cho chi nhánh và hỗ trợ nhiều thu ngân cùng tham gia (`ShiftParticipants`).
- Tuy nhiên, giao diện POS hiện tại tự động ngắt `currentShift = null` đối với Chủ cửa hàng, không kiểm tra ca mở của chi nhánh và không cho phép lựa chọn chế độ bán.

## 3. Constraints
- Không phá vỡ luồng bán hàng của `STAFF` (nhân viên bắt buộc phải có ca mở).
- Tương thích hoàn toàn với kiến trúc sổ quỹ hiện tại (`FinanceAccount`: `Till` vs `Safe`).
- Không phát sinh migration DB mới (sử dụng cấu trúc `ShiftParticipants` và trường `ShiftId` trên `Order` sẵn có).
- Giao diện đáp ứng chuẩn thiết kế bo tròn, trực quan, hỗ trợ chuyển đổi nhanh.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi chi nhánh tại một thời điểm chỉ có tối đa 1 ca bán hàng ở trạng thái `Open`.
- **[ASSUMPTION-02]**: Khi Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy", tiền mặt nhận từ đơn hàng sẽ thuộc về quầy thu ngân của ca và chủ cửa hàng chấp nhận cùng chịu trách nhiệm đối soát tiền mặt với nhân viên ca đó.
- **[ASSUMPTION-03]**: Khi Chủ cửa hàng chọn "Tự giữ / Cất két sắt", nhân viên thu ngân không chịu trách nhiệm về tiền mặt của các đơn hàng này khi kiểm đếm chốt ca.

## 5. Scope & Non-Goals
### In Scope
- Thêm modal hỏi chế độ bán `OwnerShiftModeModal` khi Chủ cửa hàng vào POS tại chi nhánh có ca nhân viên đang mở.
- Thêm badge hiển thị và nút chuyển đổi chế độ trên POS Header cho Chủ cửa hàng.
- Truyền `shiftId` phù hợp trong request tạo đơn hàng (`CreateOrderRequest`).
- Backend: Cập nhật `ShiftParticipants` và `activeShift.ExpectedCash` khi chủ cửa hàng bán gắn ca; định tuyến dòng tiền `Till` vs `Safe`.
- Backend: Đồng bộ tự động nhân viên có lịch làm việc trong ngày vào `ShiftParticipants`.
- Frontend: Hiển thị toàn bộ nhân viên tham gia ca dạng badges trong Lịch sử ca và Bàn giao quầy.
- Frontend: Chuẩn hóa font số về `Be Vietnam Pro` (`font-variant-numeric: tabular-nums`).

### Out of Scope (Non-Goals)
- Không tạo nhiều ca song song tại cùng 1 chi nhánh.
- Không cho phép nhân viên thường (`STAFF`) bán hàng chế độ Shiftless.
- Không thay đổi nghiệp vụ kiểm đếm mệnh giá tiền mặt khi đóng ca.

## 6. Các Phương Án & Lựa Chọn (Comparison of Options)
- **Phương án A: Luôn ép Chủ cửa hàng vào ca nhân viên đang mở**:
  - *Ưu điểm*: Đơn giản.
  - *Nhược điểm*: Vi phạm quyền tự do của chủ cửa hàng khi muốn bán riêng, tự giữ tiền hoặc cất két an toàn mà không muốn nhân viên biết doanh số cá nhân.
- **Phương án B: Luôn giữ Shiftless như cũ (mặc định vào Két sắt)**:
  - *Ưu điểm*: Tách biệt tuyệt đối.
  - *Nhược điểm*: Khi chủ bán cùng quầy và bỏ tiền vào ngăn kéo quầy, tiền mặt trong ngăn kéo sẽ thừa so với sổ sách ca, nhân viên bối rối khi kiểm đếm.
- **Phương án C (Được chọn): Cung cấp Modal hỏi chủ động & cho phép chuyển đổi linh hoạt**:
  - *Ưu điểm*: Phản ánh chính xác thực tế tại cửa hàng tạp hóa (chủ có lúc thu tiền bỏ vào quầy, có lúc thu tiền đút túi riêng/cất két sắt). Minh bạch tuyệt đối với nhân viên thu ngân.
  - *Nhược điểm*: Thêm một thao tác lựa chọn (được giải quyết bằng cách ghi nhớ lựa chọn trong phiên làm việc và hiển thị nút đổi nhanh trên header).

## 7. Success Criteria
1. Chủ cửa hàng vào POS khi có ca mở: modal hiển thị rõ 2 lựa chọn với giải thích đường đi của dòng tiền.
2. Lựa chọn "Bỏ chung ngăn kéo quầy": đơn tạo ra có `shiftId`, tiền vào `Till`, `ExpectedCash` ca tăng, chủ nằm trong `ShiftParticipants`.
3. Lựa chọn "Tự giữ / Cất két sắt": đơn tạo ra có `shiftId = null`, tiền vào `Safe`, `ExpectedCash` ca không đổi.
4. Lịch sử ca và Bàn giao quầy hiển thị đầy đủ mọi nhân viên trực ca dạng badges.
5. Số 0 trên các con số giá tiền và ô nhập tiền mặt là số 0 tròn bình thường, không có chấm giữa.
