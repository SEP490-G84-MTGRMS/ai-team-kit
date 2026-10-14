# Design Brief: ui-employee-management
## Thiết kế Kiến trúc UI & Trải nghiệm Người dùng Toàn diện Phân hệ Quản lý Nhân sự (MT-GRMS)

- **Change ID:** `ui-employee-management`
- **Capability:** `employee`
- **Dự án:** MT-GRMS (Chuỗi bán lẻ & Siêu thị Đa chi nhánh)
- **Design System:** KiotViet Standard / Deep Teal & Clean Modern SaaS

---

## 1. Cấu trúc Thư mục và File Thực tế (`src/features/employee/`)

```
src/features/employee/
├── types/
│   └── index.ts                         # Định nghĩa đầy đủ DTOs: Employee, WorkShift, ScheduleAssignment, AttendanceRecord, PayslipDetailedRecord, ApprovalRequest...
├── services/
│   └── mockData.ts                      # Bộ dữ liệu mẫu phong phú: danh sách nhân viên, ca làm việc, lịch phân ca tuần, dữ liệu chấm công GPS, bảng tính lương
├── components/
│   ├── EmployeeFilterSidebar.tsx        # Sidebar bộ lọc nhân viên: Trạng thái, Chi nhánh làm việc, Chi nhánh trả lương, Phòng ban, Chức danh
│   ├── EmployeeFormModal.tsx            # Popup thêm mới & cập nhật nhân viên (Tab Thông tin cơ bản, Thiết lập lương, Phụ cấp, Thuế/BHXH)
│   ├── EmployeeDetailModal.tsx          # Drawer / Popup chi tiết 360 độ (Thông tin cá nhân, Lịch làm việc, Mức lương, Phiếu lương, Nợ & tạm ứng)
│   ├── ApprovalRequestsModal.tsx        # Modal duyệt yêu cầu chờ xử lý (Tab Nhân viên & Chấm công, Duyệt/Từ chối từng cái hoặc hàng loạt)
│   ├── ImportEmployeeModal.tsx          # Modal nhập danh sách từ Excel (File mẫu, preview dữ liệu, validate lỗi)
│   ├── CreateUserModal.tsx              # Popup con: Cấp tài khoản đăng nhập nhanh cho nhân viên
│   ├── CreateAllowanceModal.tsx         # Popup con: Tạo loại phụ cấp mới linh hoạt
│   ├── ShiftFormModal.tsx               # Modal thêm mới và chỉnh sửa khung ca làm việc (giờ vào/ra, thời gian nghỉ, dung sai check-in, mã màu)
│   ├── ShiftInfoModal.tsx               # Popup xem nhanh chi tiết phân ca của nhân viên trong ngày
│   ├── AddScheduleModal.tsx             # Modal xếp lịch làm việc: Chọn nhân viên, ca làm việc, ngày áp dụng, lặp lại theo tuần
│   ├── ScheduleScopeConfirmModal.tsx    # Modal xác nhận phạm vi thay đổi lịch (Chỉ ca này / Tất cả ca lặp lại trong tương lai)
│   ├── GpsLocationsModal.tsx            # Modal quản lý địa chỉ chấm công GPS: Dropdown chọn chi nhánh, tự động điền tọa độ, bán kính cho phép
│   ├── AttendanceDetailModal.tsx        # Modal chi tiết chấm công tích hợp 4-in-1: (1) Thiết lập giờ vào/ra & nghỉ phép, (2) Lịch sử GPS & thiết bị, (3) Bảng phạt vi phạm, (4) Bảng thưởng ca làm việc
│   ├── CreatePayslipModal.tsx           # Modal khởi tạo bảng lương tháng theo chi nhánh
│   ├── PayslipDetailModal.tsx           # Popup xem chi tiết phiếu lương (Thu nhập, Các khoản trừ, Thực nhận, nút In và Trả lương)
│   └── PayslipPaymentModal.tsx          # Modal thanh toán lương (Hỗ trợ VietQR quét mã ngân hàng tự động hoặc Chi tiền mặt)
├── pages/
│   ├── EmployeeListPage.tsx             # Màn hình 1: Danh sách hồ sơ nhân sự & Công nợ
│   ├── WorkSchedulePage.tsx             # Màn hình 2: Lịch làm việc & Phân ca tuần/tháng
│   ├── AttendancePage.tsx               # Màn hình 3: Bảng chấm công tuần & Tích hợp GPS/QR
│   └── PayslipManagementPage.tsx        # Màn hình 4: Bảng tính lương, KPI chi trả & Phiếu lương
├── employee.css                         # Toàn bộ CSS quy chuẩn theo Design System KiotViet / Deep Teal (`.emp-*`)
└── index.ts                             # Barrel export public
```

---

## 2. Thiết kế Chi tiết 4 Màn hình Chính

### 2.1. Màn hình 1: Quản lý Hồ sơ Nhân sự (`EmployeeListPage`)
- **Header thanh công cụ:**
  - Tiêu đề "Danh sách nhân viên" kèm badge số lượng tổng.
  - Ô tìm kiếm tức thời: Tìm theo Tên, Mã NV, Số điện thoại.
  - Nhóm nút thao tác:
    - `+ Nhân viên`: Mở modal `EmployeeFormModal`.
    - `💵 Bảng tính lương`: Điều hướng sang `PayslipManagementPage`.
    - `📋 Duyệt yêu cầu`: Nút có badge đỏ hiển thị số lượng yêu cầu chờ duyệt, mở `ApprovalRequestsModal`.
    - Dropdown `...`: Thao tác "Nhập file Excel", "Xuất file Excel", "Ngừng làm việc hàng loạt".
- **Sidebar bộ lọc bên trái (`EmployeeFilterSidebar`):**
  - Trạng thái: Radio button Đang làm việc / Đã nghỉ / Tất cả.
  - Chi nhánh làm việc: Danh sách chi nhánh kèm switch/radio chọn nhanh.
  - Chi nhánh trả lương: Dropdown chọn chi nhánh chính.
  - Phòng ban: Danh sách phòng ban kèm số lượng nhân viên.
  - Chức danh: Dropdown chức danh (Quản lý, Thu ngân, Kiểm kho, Bán hàng...).
- **Bảng dữ liệu trung tâm:**
  - Cột: Checkbox, Avatar, Mã nhân viên (`NVxxxxxx`), Mã chấm công, Tên nhân viên (kèm tag cảnh báo nếu có), Số điện thoại, Nợ và tạm ứng (căn phải, định dạng tiền tệ VNĐ), Trạng thái hoạt động.
  - Bấm vào bất kỳ dòng nào mở `EmployeeDetailModal` (Panel chi tiết 360 độ).

### 2.2. Màn hình 2: Lịch làm việc & Phân ca (`WorkSchedulePage`)
- **Thanh điều hướng tuần/tháng:**
  - Bộ điều hướng Tuần (`<` `Tuần W - Th. M YYYY` `>`), nút "Hôm nay", dropdown chọn Chi nhánh áp dụng.
  - Nút `+ Phân ca`: Mở `AddScheduleModal` để xếp ca cho nhân viên hoặc nhóm nhân viên.
  - Nút `⚙️ Quản lý ca`: Mở danh sách ca và cấu hình ca làm việc mới qua `ShiftFormModal`.
- **Lưới lịch phân ca (Schedule Grid):**
  - Cột cố định bên trái: Thông tin nhân viên (Avatar, Tên, Mã NV, Tổng số ca/tuần).
  - 7 cột ngày trong tuần (T2 đến CN): Mỗi ô hiển thị các ca được phân công dưới dạng Card màu sắc trực quan (Ca sáng, Ca chiều, Ca đêm).
  - Thao tác trực tiếp trên ô ca:
    - Bấm vào ca để xem chi tiết ca làm việc qua `ShiftInfoModal`.
    - Nút đổi ca / sửa ca mở `ScheduleScopeConfirmModal` để hỏi phạm vi: "Chỉ ca này" hay "Tất cả các ca lặp lại trong tương lai".
    - Hỗ trợ sao chép lịch phân ca của tuần trước sang tuần hiện tại.

### 2.3. Màn hình 3: Bảng Chấm công & Tích hợp GPS/QR (`AttendancePage`)
- **Header điều khiển chấm công:**
  - Điều hướng tuần làm việc đồng bộ, dropdown lọc Chi nhánh.
  - Nút `📍 Địa chỉ chấm công`: Mở `GpsLocationsModal` để cấu hình tọa độ GPS, bán kính cho phép check-in theo từng chi nhánh.
  - Nút `📱 Mã QR Check-in`: Hiển thị Popup QR Code động cho nhân viên quét bằng app di động khi tới cửa hàng.
  - Nút `📋 Duyệt chấm công`: Mở `ApprovalRequestsModal` tab Chấm công để duyệt các yêu cầu quên check-in hoặc check-in ngoài GPS.
- **Bảng chấm công tổng hợp theo tuần:**
  - Hiển thị theo từng nhân viên và từng ngày trong tuần.
  - Trạng thái trực quan:
    - *Đúng giờ* (Xanh lục, giờ vào - ra cụ thể).
    - *Đi muộn* (Vàng cam, kèm số phút muộn: "Muộn 15p").
    - *Về sớm* (Nâu cam, "Về sớm 20p").
    - *Vắng mặt / Chưa chấm công* (Đỏ / Xám).
  - Bấm vào ô chấm công bất kỳ để mở `AttendanceDetailModal` tích hợp 4-in-1:
    1. **Thiết lập chấm công:** Chọn Đi làm / Nghỉ phép hưởng lương / Nghỉ không lương; bật/tắt và chỉnh sửa giờ Vào / Ra thực tế.
    2. **Lịch sử chấm công:** Xem nhật ký GPS (tọa độ, khoảng cách tới cửa hàng), thiết bị di động (Tên máy, mã IMEI), tổng số giờ công tính toán.
    3. **Phạt vi phạm:** Thêm/sửa các loại vi phạm trong ca (Đi muộn, về sớm, quên quét vân tay, vi phạm tác phong...), tự tính số tiền phạt.
    4. **Thưởng ca làm việc:** Thêm các khoản khen thưởng trong ca (Thưởng chuyên cần, tăng ca giờ cao điểm, khách khen ngợi...).

### 2.4. Màn hình 4: Bảng Tính lương & Chi trả (`PayslipManagementPage`)
- **Header & Thanh lọc nhanh:**
  - Ô tìm kiếm nhân viên tức thời bo tròn full-pill.
  - Bộ chọn kỳ tính lương theo tháng (`Tháng MM/YYYY`).
  - Nút `+ Khởi tạo bảng lương`: Mở `CreatePayslipModal`.
  - Nút `💳 Chi trả hàng loạt`: Thanh toán đồng loạt cho các phiếu lương được chọn qua VietQR / Tiền mặt.
  - Nút `🖨️ In danh sách` & Dropdown thao tác (`Xuất file Excel`, `Tính lại lương tháng`).
- **Sidebar bộ lọc chuyên sâu bên trái:**
  - Lọc kỳ tính lương (`type="month"`).
  - Lọc trạng thái chi trả: Tất cả / Chưa thanh toán / Đã thanh toán.
  - Lọc chi nhánh trả lương: Dropdown tìm kiếm chi nhánh thời gian thực (Searchable dropdown), hiển thị nhãn chi nhánh chính.
- **Thẻ KPI tài chính tổng hợp:**
  - Card 1: *Số phiếu lương* (Tổng nhân sự trong kỳ).
  - Card 2: *Tổng quỹ thực nhận* (Tổng Net Salary cần chi trả, màu xanh dương).
  - Card 3: *Chưa chi trả* (Số tiền còn nợ nhân viên, màu vàng cam cảnh báo).
  - Card 4: *Đã thanh toán* (Số tiền đã hoàn tất bút toán chi, màu xanh ngọc).
- **Bảng dữ liệu phiếu lương chuẩn kế toán (Tối ưu không vỡ dòng):**
  - Cột: Checkbox, Mã NV (Badge xanh ngọc `#0F766E`), Nhân viên (Avatar + Tên + Chi nhánh), Kỳ lương (`Tháng 10/2026`), Lương cơ sở (VNĐ), Thực nhận Net (VNĐ, đậm màu xanh lá `#047857`), Trạng thái (Text + Color + Icon: *Đã thanh toán* tick xanh, *Chưa thanh toán* đồng hồ cam), Ngày trả.
  - Bấm vào bất kỳ dòng nào mở popup chi tiết phiếu lương `PayslipDetailModal` để xem chi tiết cơ cấu thu nhập, giảm trừ BHXH, tạm ứng và bấm nút thanh toán trực tiếp qua `PayslipPaymentModal`.

---

## 3. Quy chuẩn Design System Tuân thủ
- **Bảng màu chủ đạo:**
  - Primary / Brand: Deep Teal `#0F766E` / Hover `#115E59` / Dark `#134E4A` / Soft Light `#CCFBF1`, `#F0FDFA`.
  - Financial Status: Xanh lá `#059669` (Đã thanh toán / Đang làm việc), Vàng cam `#D97706` (Chưa chi trả / Chờ duyệt), Đỏ `#DC2626` (Phạt / Vắng mặt / Đã nghỉ).
  - Neutral & Surface: Nền `#F8FAFC`, Khung Card `#FFFFFF`, Đường viền `#E2E8F0`, Chữ chính `#0F172A`, Chữ phụ `#64748B`.
- **Typography & Font:** Đồng bộ phông chữ `Be Vietnam Pro`, `sans-serif` trên toàn bộ các trang và modal; các ô số tiền sử dụng `fontVariantNumeric: 'tabular-nums'` và khoảng trắng không ngắt dòng `\u00A0₫` để số liệu kế toán luôn thẳng hàng.
- **Responsive & Table Layout:** Container bảng có `overflowX: 'auto'` và `minWidth: 0` trên layout grid cha, ngăn chặn hoàn toàn lỗi tràn góc hoặc che khuất nút bấm.
