# Specs: fe17-cashbook-frontend

## ADDED Requirements

### Requirement: REQ-17.1 Quản lý danh sách tài khoản quỹ và Sổ quỹ tiền mặt / ngân hàng
Hệ thống Frontend MUST hiển thị danh sách tài khoản tiền mặt và ngân hàng theo từng chi nhánh, thẻ KPI số dư tổng hợp tức thời, và bảng sổ quỹ ghi nhận biến động tăng/giảm cùng số dư lũy kế. Bảng sổ quỹ MUST hỗ trợ phân trang chuẩn `TablePagination` và bộ lọc nhanh theo tài khoản, thời gian, loại giao dịch.

#### Scenario: Hiển thị số dư tức thời và bảng sổ quỹ mặc định
**GIVEN** Quản lý cửa hàng đã đăng nhập và truy cập trang `/store-owner/cashbook`  
**WHEN** Dữ liệu tải về từ hệ thống  
**THEN** Hệ thống MUST hiển thị các thẻ tài khoản quỹ kèm số dư hiện tại  
**AND** Bảng Sổ quỹ hiển thị danh sách các bút toán thu/chi kèm cột `Số dư sau giao dịch` (Balance After)  
**AND** Phân trang sử dụng component `TablePagination` với số dòng mặc định là 10.

#### Scenario: Lọc sổ quỹ theo tài khoản quỹ và khoảng thời gian
**GIVEN** Quản lý đang ở trang Sổ quỹ  
**WHEN** Quản lý chọn tài khoản "Két tiền mặt Chi nhánh 1" và chọn mốc thời gian "Tháng này"  
**THEN** Hệ thống SHALL lọc lại bảng bút toán tương ứng với tài khoản và thời gian đã chọn  
**AND** Hiển thị đúng số phát sinh thu, phát sinh chi và số dư cuối kỳ của tài khoản đó.

#### Scenario: Hiển thị trạng thái rỗng khi không có giao dịch trong kỳ (Edge Case)
**GIVEN** Quản lý chọn một khoảng thời gian chưa phát sinh giao dịch nào  
**WHEN** Dữ liệu trả về danh sách rỗng  
**THEN** Giao diện MUST hiển thị Empty State với biểu tượng ví tiền/sổ quỹ, thông điệp "Không có giao dịch nào trong khoảng thời gian này" và nút "Đặt lại bộ lọc".

---

### Requirement: REQ-17.2 Lập phiếu thu tiền thủ công
Hệ thống Frontend MUST cung cấp Modal `CreateReceiptModal` cho phép người dùng lập phiếu thu tiền mặt hoặc ngân hàng. Mọi giao dịch thu phải có số tiền > 0, chọn tài khoản nhận tiền, đối tượng nộp tiền, và danh mục thu hợp lệ.

#### Scenario: Lập phiếu thu thành công
**GIVEN** Quản lý nhấn nút "Lập Phiếu Thu"  
**WHEN** Quản lý nhập số tiền 2.000.000 VNĐ, chọn tài khoản "Két tiền mặt", người nộp "Khách hàng VIP", danh mục "Bán hàng", và nhấn "Lưu Phiếu Thu"  
**THEN** Hệ thống MUST ghi nhận bút toán loại `RECEIPT`  
**AND** Số dư của tài khoản "Két tiền mặt" tăng thêm 2.000.000 VNĐ  
**AND** Modal tự đóng và hiển thị `AdminToast` thành công màu xanh lá.

#### Scenario: Báo lỗi khi số tiền thu <= 0 hoặc thiếu trường bắt buộc (Edge Case)
**GIVEN** Modal lập phiếu thu đang mở  
**WHEN** Quản lý nhập số tiền 0 hoặc bỏ trống tài khoản thụ hưởng và nhấn "Lưu Phiếu Thu"  
**THEN** Hệ thống MUST ngăn chặn việc lưu dữ liệu  
**AND** Hiển thị thông báo lỗi chi tiết bên dưới trường nhập liệu tương ứng.

---

### Requirement: REQ-17.3 Lập phiếu chi tiền mặt và kiểm soát chống âm quỹ
Hệ thống Frontend MUST cung cấp Modal `CreatePaymentModal` cho phép lập phiếu chi. Đối với tài khoản tiền mặt, hệ thống MUST thực thi quy tắc nghiệp vụ `GBR-CSH-03`: ngăn chặn xuất chi vượt quá số dư hiện tại trong két.

#### Scenario: Lập phiếu chi hợp lệ thành công
**GIVEN** Tài khoản Két tiền mặt đang có số dư 5.000.000 VNĐ  
**WHEN** Quản lý lập phiếu chi tiền mặt số tiền 1.500.000 VNĐ cho nhà cung cấp và bấm "Xác Nhận Chi"  
**THEN** Hệ thống MUST tạo bút toán loại `PAYMENT`  
**AND** Số dư tài khoản giảm xuống còn 3.500.000 VNĐ  
**AND** Hiển thị `AdminToast` thành công.

#### Scenario: Chặn xuất chi khi số tiền chi vượt quá số dư két tiền mặt (Edge Case - Rule GBR-CSH-03)
**GIVEN** Két tiền mặt đang có số dư 1.000.000 VNĐ  
**WHEN** Quản lý nhập số tiền chi là 1.500.000 VNĐ  
**THEN** Hệ thống MUST ngay lập tức hiển thị cảnh báo màu đỏ: "Số tiền chi vượt quá số dư két tiền mặt hiện tại (1.000.000 đ)"  
**AND** Nút "Xác Nhận Chi" MUST bị vô hiệu hóa (disabled) để ngăn ngừa âm quỹ.

---

### Requirement: REQ-17.4 Kiểm kê đối soát két tiền mặt và điều chỉnh chênh lệch
Hệ thống Frontend MUST cung cấp Modal `CashReconciliationModal` cho phép kiểm kê số tiền thực tế trong két so với số dư trên sổ sách (`UC-17.4`). Nếu có chênh lệch, hệ thống MUST tuân thủ quy tắc `GBR-CSH-04`: bắt buộc nhập lý do giải trình và tự động sinh bút toán điều chỉnh `ADJUSTMENT`.

#### Scenario: Kiểm kê quỹ không có chênh lệch
**GIVEN** Két tiền mặt có số dư sổ sách là 10.000.000 VNĐ  
**WHEN** Quản lý nhập số tiền thực tế đếm được là 10.000.000 VNĐ và nhấn "Chốt Kiểm Kê"  
**THEN** Hệ thống MUST ghi nhận phiên kiểm kê khớp hoàn toàn  
**AND** Hiển thị `AdminToast` thành công màu xanh lá.

#### Scenario: Kiểm kê phát hiện chênh lệch và bắt buộc nhập lý do (Edge Case - Rule GBR-CSH-04)
**GIVEN** Két tiền mặt có số dư sổ sách là 10.000.000 VNĐ  
**WHEN** Quản lý nhập số tiền thực đếm là 9.800.000 VNĐ (lệch âm 200.000 VNĐ)  
**THEN** Hệ thống MUST hiển thị cảnh báo chênh lệch màu đỏ và bắt buộc nhập ô "Lý do giải trình chênh lệch"  
**AND** Nếu ô lý do để trống, nút "Chốt Kiểm Kê" MUST bị vô hiệu hóa  
**WHEN** Quản lý nhập lý do "Bù tiền thối nhầm ca sáng" và bấm "Chốt Kiểm Kê"  
**THEN** Hệ thống MUST cập nhật số dư két về 9.800.000 VNĐ  
**AND** Tự động tạo bút toán loại `ADJUSTMENT` trong Sổ quỹ với số tiền -200.000 VNĐ kèm lý do giải trình.

---

### Requirement: REQ-17.5 Khóa sửa/xóa giao dịch hệ thống và xuất báo cáo in ấn A4
Hệ thống Frontend MUST thực thi quy tắc `GBR-CSH-01`: các giao dịch tự động sinh từ đơn bán hàng POS hoặc thanh toán chi phí vận hành FE-07 (`IsAutomated = true`) MUST KHÔNG cho phép sửa hoặc xóa thủ công trên giao diện Sổ quỹ. Hệ thống MUST hỗ trợ xuất file Excel CSV UTF-8 có BOM và xem trước bản in phiếu thu/chi/sổ quỹ theo khổ A4 tiêu chuẩn.

#### Scenario: Khóa chức năng chỉnh sửa/xóa đối với bút toán tự động (Rule GBR-CSH-01)
**GIVEN** Bảng Sổ quỹ hiển thị một bút toán thu tiền từ đơn hàng POS (`IsAutomated = true`, `ReferenceDocType = 'POS_ORDER'`)
**WHEN** Quản lý xem chi tiết dòng bút toán đó  
**THEN** Hệ thống MUST hiển thị nhãn "Giao dịch hệ thống"  
**AND** Nút "Chỉnh sửa" và "Xóa" MUST bị ẩn hoặc vô hiệu hóa.

#### Scenario: Xuất dữ liệu Sổ quỹ ra file CSV UTF-8 và in ấn A4
**GIVEN** Quản lý đang xem danh sách giao dịch Sổ quỹ  
**WHEN** Quản lý bấm "Xuất & In Sổ Quỹ"  
**THEN** Hệ thống cung cấp tùy chọn tải file CSV có tiền tố UTF-8 BOM chống vỡ font tiếng Việt  
**AND** Tùy chọn xem trước bản in A4 có đầy đủ thông tin cửa hàng, bảng kê và chữ ký của Người lập phiếu, Kế toán, Thủ quỹ.
