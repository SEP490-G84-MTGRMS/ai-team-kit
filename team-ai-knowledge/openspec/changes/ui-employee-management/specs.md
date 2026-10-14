# Delta Specs: ui-employee-management
## Capability: employee (Phân hệ Quản trị Nhân sự & Tiền lương Chuỗi Cửa hàng)

### ADDED Requirements

#### [UC-EMP-01] Quản lý & Lọc Hồ sơ Nhân viên (`EmployeeListPage`)
- Hệ thống SHALL hiển thị danh sách nhân viên phân trang với các cột: Checkbox, Avatar, Mã nhân viên (`NVxxxxxx`), Mã chấm công, Tên nhân viên (kèm tag cảnh báo), Số điện thoại, Nợ & tạm ứng (VNĐ), và Trạng thái hoạt động.
- Hệ thống SHALL hỗ trợ tìm kiếm tức thời theo Tên, Mã NV, hoặc Số điện thoại.
- Hệ thống SHALL cung cấp Sidebar bộ lọc đa tiêu chí: Trạng thái (Đang làm việc / Đã nghỉ / Tất cả), Chi nhánh làm việc, Chi nhánh trả lương, Phòng ban, Chức danh.
- Hệ thống SHALL hiển thị badge đếm số lượng yêu cầu chờ xử lý trên nút "Duyệt yêu cầu".

#### [UC-EMP-02] Khởi tạo & Cập nhật Hồ sơ Nhân viên (`EmployeeFormModal`)
- Hệ thống SHALL kiểm tra tính hợp lệ của các trường bắt buộc: Tên nhân viên, Số điện thoại, Chi nhánh trả lương chính.
- Hệ thống SHALL tự động sinh mã nhân viên định dạng `NVxxxxxx` khi để trống.
- Hệ thống SHALL cho phép gán một nhân viên vào nhiều chi nhánh làm việc, và 1 chi nhánh trả lương chính.
- Hệ thống SHALL hỗ trợ liên kết hoặc tạo nhanh tài khoản người dùng (`CreateUserModal`).
- Hệ thống SHALL cho phép thiết lập chế độ lương (Lương tháng cố định, Lương theo giờ, Lương theo ca), hệ số tăng ca OT và bảng phụ cấp (`CreateAllowanceModal`).

#### [UC-EMP-03] Xem Hồ sơ Nhân viên Toàn diện 360 độ (`EmployeeDetailModal`)
- Hệ thống SHALL hiển thị Panel / Drawer chi tiết gồm 5 tab chức năng:
  - **Tab 1 - Thông tin:** Chi tiết liên hệ, công việc, tài khoản đăng nhập, thông tin ngân hàng.
  - **Tab 2 - Lịch làm việc:** Xem lịch phân ca tuần/tháng của riêng nhân viên.
  - **Tab 3 - Thiết lập lương:** Xem cơ cấu lương hiện hành, hệ số OT, danh mục phụ cấp.
  - **Tab 4 - Phiếu lương:** Lịch sử các kỳ phiếu lương đã chốt, số tiền thực lĩnh, trạng thái thanh toán.
  - **Tab 5 - Nợ và tạm ứng:** Số dư công nợ hiện tại, lịch sử thanh toán / tạm ứng lương.

#### [UC-EMP-04] Xếp Lịch làm việc & Quản lý Ca (`WorkSchedulePage`)
- Hệ thống SHALL cung cấp giao diện lưới phân ca theo tuần (Thứ 2 đến Chủ nhật) trực quan theo từng nhân viên.
- Hệ thống SHALL cho phép cấu hình danh mục ca làm việc qua `ShiftFormModal` (Giờ bắt đầu, giờ kết thúc, thời gian nghỉ giữa ca, dung sai check-in trước/sau, mã màu ca).
- Hệ thống SHALL hỗ trợ phân ca linh hoạt qua `AddScheduleModal` cho một hoặc nhiều nhân viên, lặp lại theo tuần.
- Khi chỉnh sửa hoặc đổi ca, hệ thống SHALL mở `ScheduleScopeConfirmModal` cho phép người dùng chọn phạm vi: "Chỉ ca này" hoặc "Tất cả các ca lặp lại trong tương lai".

#### [UC-EMP-05] Chấm công & Tích hợp Kiểm soát GPS / Mã QR (`AttendancePage`)
- Hệ thống SHALL hiển thị bảng chấm công tổng hợp theo tuần cho toàn bộ nhân sự theo chi nhánh.
- Hệ thống SHALL hiển thị mã QR Check-in động tại cửa hàng để nhân viên quét bằng app di động ghi nhận chấm công.
- Hệ thống SHALL cho phép quản lý tọa độ GPS và bán kính check-in cho phép của từng chi nhánh qua `GpsLocationsModal`.
- Hệ thống SHALL hiển thị trạng thái chấm công chi tiết: Đúng giờ (Xanh), Đi muộn (Vàng kèm số phút muộn), Về sớm (Nâu cam), Vắng mặt (Đỏ).

#### [UC-EMP-06] Điều chỉnh Chấm công & Thưởng Phạt Tích hợp (`AttendanceDetailModal`)
- Hệ thống SHALL tích hợp 4 chức năng chấm công trong một popup duy nhất:
  - **Tab 1 - Thiết lập chấm công:** Cho phép đánh dấu Đi làm, Nghỉ phép hưởng lương, hoặc Nghỉ không lương; cấu hình bật/tắt và thời gian Vào/Ra thực tế.
  - **Tab 2 - Lịch sử chấm công:** Xem nhật ký vị trí GPS (tọa độ, khoảng cách so với shop), thông tin thiết bị (máy, IMEI), tổng giờ làm việc tính toán.
  - **Tab 3 - Bảng phạt vi phạm:** Ghi nhận các loại vi phạm trong ca (Đi muộn, về sớm, quên check-in, sai đồng phục...), tự tính tiền phạt.
  - **Tab 4 - Bảng thưởng ca:** Ghi nhận các khoản thưởng nóng (Chuyên cần, tăng ca giờ cao điểm, khách khen ngợi...).

#### [UC-EMP-07] Phê duyệt Yêu cầu Chấm công & Hồ sơ (`ApprovalRequestsModal`)
- Hệ thống SHALL phân loại các yêu cầu chờ duyệt thành 2 nhóm: Tab Nhân viên (cập nhật hồ sơ, đổi số điện thoại) và Tab Chấm công (quên chấm công, đổi máy, check-in ngoài GPS).
- Hệ thống SHALL hỗ trợ phê duyệt hoặc từ chối từng yêu cầu hoặc hàng loạt.

#### [UC-EMP-08] Quản lý Bảng Tính lương & KPI Tài chính (`PayslipManagementPage`)
- Hệ thống SHALL hiển thị 4 thẻ KPI tài chính tổng hợp: Số phiếu lương, Tổng quỹ thực nhận, Tổng tiền chưa chi trả, Tổng tiền đã thanh toán.
- Hệ thống SHALL cung cấp bộ lọc chuyên sâu: Lọc theo tháng (`Tháng MM/YYYY`), lọc trạng thái thanh toán, lọc chi nhánh qua ô tìm kiếm live dropdown.
- Bảng phiếu lương SHALL hiển thị chuẩn kế toán không ngắt dòng: Mã NV (Badge teal), Nhân viên (Avatar + Tên + Chi nhánh), Kỳ lương, Lương cơ sở, Thực nhận (Net), Trạng thái (Text + Color + Icon), Ngày trả.
- Bấm vào bất kỳ dòng nào trên bảng SHALL mở `PayslipDetailModal`.

#### [UC-EMP-09] Chi trả Lương Đơn lẻ & Hàng loạt (`PayslipPaymentModal`)
- Hệ thống SHALL hỗ trợ thanh toán phiếu lương qua 2 hình thức: Mã VietQR ngân hàng tự động và Tiền mặt.
- Hệ thống SHALL hỗ trợ nút "Chi trả hàng loạt" để duyệt chi đồng loạt các phiếu lương chưa thanh toán được chọn trên bảng.
- Sau khi thanh toán thành công, hệ thống SHALL cập nhật trạng thái phiếu lương thành "Đã thanh toán" kèm ngày giờ ghi nhận bút toán chi.

#### [UC-EMP-10] Nhập & Xuất Dữ liệu Excel Nhân sự (`ImportEmployeeModal`)
- Hệ thống SHALL cho phép tải file Excel mẫu chuẩn (`Mau_nhan_vien.xlsx`).
- Hệ thống SHALL hỗ trợ tải lên file danh sách nhân sự với 2 cơ chế xử lý lỗi: Dừng lại khi gặp lỗi hoặc Bỏ qua dòng lỗi tiếp tục.
- Hệ thống SHALL cho phép xuất bảng danh sách nhân viên và bảng tính lương ra file Excel.

---

### ADDED Business Rules

- **BR-EMP-01 (Mã nhân viên duy nhất):** Mỗi nhân viên có một mã duy nhất trên toàn hệ thống. Nếu không nhập, hệ thống tự sinh theo định dạng `NVxxxxxx`.
- **BR-EMP-02 (Ràng buộc Chi nhánh trả lương):** Nhân viên bắt buộc phải có 1 Chi nhánh trả lương chính nằm trong danh sách các chi nhánh làm việc được phân công.
- **BR-EMP-03 (Phạm vi Lịch làm việc):** Khi thay đổi một ca làm việc lặp lại, hệ thống bắt buộc người dùng xác nhận thay đổi "Chỉ ca này" hay "Tất cả các ca tương lai" để bảo toàn lịch sử chấm công quá khứ.
- **BR-EMP-04 (Bán kính Hợp lệ GPS):** Check-in GPS được xem là hợp lệ khi khoảng cách từ thiết bị đến tọa độ chi nhánh nhỏ hơn hoặc bằng bán kính cho phép (mặc định 200m). Vượt bán kính sẽ đưa vào danh sách yêu cầu chờ duyệt.
- **BR-EMP-05 (Cấn trừ Công nợ / Tạm ứng):** Khoản chi lương phát sinh khi công nợ bằng 0 sẽ tự động chuyển thành Tạm ứng và được trừ tự động vào cột "Trừ tạm ứng" trong bảng tính lương kỳ kế tiếp.
- **BR-EMP-06 (Công thức Tính lương Thực nhận):** $\text{Thực nhận (Net)} = \text{Lương ngày công} + \text{Lương tăng ca OT} + \text{Phụ cấp} + \text{Thưởng} - (\text{BHXH} + \text{Phạt vi phạm} + \text{Trừ tạm ứng})$.
- **BR-EMP-07 (Quy chuẩn Trạng thái Phiếu lương):** Trạng thái phiếu lương chỉ gồm `UNPAID` (Chưa thanh toán - Cam `#D97706` + icon Clock) và `PAID` (Đã thanh toán - Xanh lục `#059669` + icon Check).
- **BR-EMP-08 (Giới hạn Nhập Excel):** Giới hạn tối đa 500 bản ghi nhân viên cho một lần nạp file để bảo đảm hiệu năng hệ thống.
