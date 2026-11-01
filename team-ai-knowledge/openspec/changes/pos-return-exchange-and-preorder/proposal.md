# Proposal: Quy Trình Đổi/Trả Hàng Chuẩn KiotViet, Phân Quyền Hủy Hóa Đơn & Quy Tắc Đơn Đặt Trước Giữ Kho

## 1. Bối cảnh & Vấn đề (Problem Statement)
Trong quá trình vận hành chuỗi siêu thị mini / tiệm tạp hóa MT-GRMS:
1. **Nghiệp vụ Đổi / Trả hàng chưa có quy trình chuẩn**: Khi khách hàng mua đồ mang về và quay lại đổi sang mặt hàng khác (ví dụ: đổi lon sữa lấy bánh kẹo), hệ thống chưa có cơ chế bù trừ chênh lệch tự động (Net Settlement). Nếu nhân viên chọn giải pháp "Hủy đơn cũ rồi tạo đơn mới", doanh thu của ngày hôm trước / ca trước sẽ bị méo mó, sai lệch dòng tiền và mất dấu vết đối soát.
2. **Nguy cơ thất thoát do phân quyền Hủy đơn chưa chặt chẽ**: Nếu cho phép nhân viên Thu ngân (`CASHIER`) tự do bấm hủy các hóa đơn đã thanh toán thành công (`Completed`), có thể phát sinh gian lận (thu ngân thu tiền mặt của khách rồi sau đó bấm hủy hóa đơn để bỏ túi tiền mặt).
3. **Thiếu ràng buộc cọc giữ kho cho Đơn đặt trước (Pre-Order)**: Khách đặt giữ kho số lượng lớn nhưng không cọc hoặc cọc quá ít dẫn đến nguy cơ khách "bỏ bom", găm giữ tồn kho FEFO khiến cửa hàng mất cơ hội bán cho người khác; đồng thời chưa có quy định rõ ràng về chi nhánh nhận hàng trong mô hình chuỗi nhiều chi nhánh.

## 2. Mục tiêu (Objectives)
* Xây dựng luồng **Đổi / Trả hàng chuẩn KiotViet & Sapo POS**: Thu ngân thao tác trực quan trên một màn hình (chọn hàng trả + chọn hàng đổi), hệ thống tự động tính tiền bù trừ chênh lệch, tự động hoàn kho hàng trả và trừ kho hàng mới.
* **Bảo toàn dữ liệu lịch sử**: Hóa đơn gốc đã hoàn thành được giữ nguyên vẹn; hệ thống sinh Phiếu trả hàng và Hóa đơn đổi bù trừ có liên kết chứng từ.
* **Phân quyền chống gian lận**: Chỉ tài khoản Chủ cửa hàng (`STORE_OWNER`) và Quản lý (`MANAGER` / `ADMIN`) mới có quyền hủy các hóa đơn đã hoàn thành (`Completed`) kèm theo lý do bắt buộc; Thu ngân chỉ được quyền hủy/làm mới đơn nháp tại quầy.
* **Quy chuẩn Đơn đặt trước giữ kho**: Bắt buộc tiền đặt cọc tối thiểu $\ge 10\%$ tổng giá trị đơn hàng; tồn kho giữ cố định tại chi nhánh tiếp nhận; khách nhận hàng tại đúng chi nhánh đã đăng ký.

## 3. Phạm vi (Scope)
### In-Scope:
* **Giao diện & Nghiệp vụ Đổi / Trả hàng**:
  * Nút "Đổi / Trả hàng" trên danh sách/chi tiết hóa đơn `Completed` tại `InvoiceManagementPage` (hoặc POS).
  * Modal Đổi/Trả hàng: Cho phép chọn món trả (số lượng $\le$ số lượng đã mua) + Chọn món lấy mới.
  * Tự động tính chênh lệch: Khách nộp thêm tiền hoặc Cửa hàng hoàn tiền / cấn trừ vào sổ nợ khách hàng.
* **Phân quyền Hủy hóa đơn**:
  * Chặn quyền bấm nút "Hủy đơn" đối với role `CASHIER` khi hóa đơn ở trạng thái `Completed`.
  * Yêu cầu role `STORE_OWNER` / `MANAGER` hoặc popup xác nhận của Quản lý khi hủy hóa đơn đã thanh toán.
* **Ràng buộc Đơn đặt trước giữ kho**:
  * Validation: `DepositAmount >= 0.10 * FinalAmount`.
  * Hiển thị rõ tên chi nhánh nhận hàng và ngày giờ hẹn lấy.
  * Backend API cập nhật trạng thái và xuất hàng (`Fulfill`).

### Out-of-Scope:
* Tích hợp thiết bị phần cứng Loa thông báo Ting Ting vật lý qua cổng COM/Bluetooth (dùng âm thanh Web Audio và Toast notification trên trình duyệt).
* Nghiệp vụ vận chuyển điều phối xe tải giữa các kho chi nhánh (thuộc phân hệ Logistic riêng).

## 4. Người dùng & Tác tử liên quan (Actors & Roles)
* **Thu ngân (`CASHIER`)**: Thao tác đổi/trả hàng tại quầy, tạo đơn đặt cọc, thực hiện xuất hàng khi khách đến nhận.
* **Chủ cửa hàng (`STORE_OWNER`) / Quản lý (`MANAGER`)**: Toàn quyền hủy hóa đơn đã hoàn thành, duyệt các trường hợp đổi trả đặc biệt hoặc miễn giảm cọc.
* **Khách hàng (`Customer`)**: Được đổi trả hàng minh bạch, cấn trừ công nợ hoặc nhận lại tiền thừa chính xác.

## 5. Tiêu chí thành công (Success Criteria)
1. **Trải nghiệm thu ngân 1 bước**: Đổi hàng bù trừ hoàn tất chỉ trong 1 thao tác xác nhận, không cần gõ lại các món hàng cũ khách giữ lại.
2. **Toàn vẹn tồn kho & sổ sách**: Tồn kho món trả tự động `+Qty`, tồn kho món đổi tự động `-Qty` theo FEFO; doanh thu ngày cũ không bị thay đổi.
3. **Kiểm soát bảo mật 100%**: Thu ngân không thể tự ý hủy hóa đơn `Completed`; hệ thống lưu vết người hủy và lý do hủy.
4. **Không bị "bỏ bom" kho**: Đơn đặt trước không thể tạo nếu cọc $< 10\%$.
5. **Chất lượng kỹ thuật**: `dotnet test` Backend 100% pass, Frontend `npm run build` không có lỗi Type/Lint.
