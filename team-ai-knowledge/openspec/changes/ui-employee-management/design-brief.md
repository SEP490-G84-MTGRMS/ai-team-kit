# Design Brief: ui-employee-management
## Thiết kế Kiến trúc UI & Trải nghiệm Người dùng Phân hệ Quản lý Nhân sự

## 1. Cấu trúc Thư mục và File (`src/features/employee/`)

```
src/features/employee/
├── types/
│   └── index.ts               # Định nghĩa các TypeScript interfaces, Enums, DTOs
├── services/
│   └── mockData.ts            # Dữ liệu mẫu ban đầu: nhân viên, phòng ban, chức vụ, phiếu lương, yêu cầu duyệt
├── components/
│   ├── EmployeeFilterSidebar.tsx   # Sidebar lọc: Trạng thái, Chi nhánh, Phòng ban, Chức danh
│   ├── EmployeeFormModal.tsx       # Popup thêm mới & cập nhật nhân viên (Tab Thông tin, Thiết lập lương, Thuế/BHXH)
│   ├── EmployeeDetailModal.tsx     # Panel chi tiết 360 độ (Thông tin, Lịch làm việc, Mức lương, Phiếu lương, Nợ & tạm ứng)
│   ├── ApprovalRequestsModal.tsx   # Modal duyệt yêu cầu chờ xử lý (Tab Nhân viên & Chấm công, Duyệt/Từ chối hàng loạt)
│   ├── ImportEmployeeModal.tsx     # Modal nhập danh sách từ Excel (File mẫu, preview, validate lỗi)
│   ├── CreateUserModal.tsx         # Popup con: Cấp tài khoản đăng nhập nhanh cho nhân viên
│   └── CreateAllowanceModal.tsx    # Popup con: Tạo loại phụ cấp mới
├── pages/
│   └── EmployeeListPage.tsx        # Màn hình chính danh sách nhân viên
├── employee.css                    # Toàn bộ CSS quy chuẩn theo Design System KiotViet / Deep Teal
└── index.ts                        # Public export
```

---

## 2. Thiết kế Giao diện Chi tiết

### 2.1. Màn hình Danh sách Nhân viên (`EmployeeListPage`)
- **Header thanh công cụ:**
  - Tiêu đề "Danh sách nhân viên".
  - Ô tìm kiếm tức thời: Tìm theo Tên, Mã NV, Số điện thoại.
  - Nhóm nút thao tác:
    - `+ Nhân viên`: Mở modal `EmployeeFormModal`.
    - `💵 Bảng tính lương`: Điều hướng đến bảng lương tổng hợp.
    - `📋 Duyệt yêu cầu`: Nút có badge đỏ hiển thị số lượng yêu cầu chưa duyệt, mở `ApprovalRequestsModal`.
    - Dropdown `...`: Thao tác "Nhập file Excel", "Xuất file Excel", "Ngừng làm việc hàng loạt".
- **Sidebar bộ lọc bên trái (`EmployeeFilterSidebar`):**
  - Trạng thái: Radio button Đang làm việc / Đã nghỉ / Tất cả.
  - Chi nhánh làm việc: Lọc theo chi nhánh đang hoạt động.
  - Chi nhánh trả lương: Dropdown chọn chi nhánh.
  - Phòng ban: Danh sách phòng ban kèm số lượng nhân viên.
  - Chức danh: Dropdown chức danh (Quản lý, Thu ngân, Kiểm kho, Bán hàng...).
- **Bảng dữ liệu trung tâm:**
  - Cột: Checkbox, Avatar, Mã nhân viên, Mã chấm công, Tên nhân viên (kèm tag cảnh báo nếu có), Số điện thoại, Chi nhánh làm việc, Phòng ban, Chức danh, Nợ và tạm ứng (căn phải, định dạng tiền tệ VNĐ), Trạng thái, Thao tác.
  - Bấm vào hàng nhân viên mở `EmployeeDetailModal`.

### 2.2. Modal Thêm mới / Cập nhật Nhân viên (`EmployeeFormModal`)
- Modal kích thước lớn (950px), header Deep Teal `#0F766E`, 2 tabs chính:
  - **Tab 1 - Thông tin:**
    - Khối 1: Thông tin khởi tạo (Tên nhân viên *, Mã nhân viên tự sinh, Số điện thoại *, Khung upload Avatar).
    - Khối 2: Thông tin công việc (Phòng ban, Chức danh, Chi nhánh trả lương *, Các chi nhánh làm việc, Ngày bắt đầu làm việc, Tài khoản đăng nhập kèm nút Tạo tài khoản nhanh, Ghi chú).
    - Khối 3: Thông tin ngân hàng (Số tài khoản, Tên ngân hàng, Tên chủ tài khoản).
    - Khối 4: Thông tin cá nhân (Số CMND/CCCD, Ngày sinh, Giới tính, Địa chỉ, Tỉnh/Thành phố).
  - **Tab 2 - Thiết lập lương:**
    - Hình thức trả lương (Lương cố định tháng / Lương theo giờ / Lương theo ca).
    - Mức lương cơ bản (VNĐ).
    - Thiết lập tăng ca OT (Hệ số Ngày thường, Ngày nghỉ, Ngày lễ).
    - Danh sách phụ cấp: Bảng danh sách phụ cấp kèm nút bật/tắt, mức phụ cấp, nút thêm phụ cấp mới.
- Nút hành động: `Bỏ qua`, `Lưu`, `Lưu & Thêm mới`.

### 2.3. Panel Chi tiết Nhân viên 360 độ (`EmployeeDetailModal`)
- Thiết kế dạng Modal rộng (1050px) hoặc Drawer trượt, hiển thị thông tin toàn diện:
  - Header: Avatar, Họ tên, Mã NV, SĐT, Trạng thái hoạt động, Nút "Cập nhật", Nút "Ngừng làm việc".
  - **Tab 1: Thông tin:** Hiển thị 3 cột chi tiết (Thông tin liên hệ, Công việc, Ngân hàng & Giấy tờ).
  - **Tab 2: Lịch làm việc:** Lịch phân ca theo tuần/tháng (chế độ Bảng và Danh sách).
  - **Tab 3: Thiết lập lương:** Xem chi tiết cơ cấu lương hiện hành, hệ số OT, bảng phụ cấp.
  - **Tab 4: Phiếu lương:** Bảng các kỳ phiếu lương đã chốt, số tiền thực lĩnh, trạng thái thanh toán, nút In và Xuất file.
  - **Tab 5: Nợ và tạm ứng:** Hiển thị số dư công nợ hiện tại, lịch sử thanh toán, nút "Thanh toán lương" (mở modal tạo phiếu chi lương / tạm ứng).

### 2.4. Modal Duyệt Yêu cầu (`ApprovalRequestsModal`)
- Gồm 2 tabs:
  - **Tab Nhân viên:** Yêu cầu tạo mới hồ sơ, cập nhật số điện thoại, sửa thông tin.
  - **Tab Chấm công:** Đổi thiết bị chấm công, check-in ngoài phạm vi GPS, quên chấm công.
- Bộ lọc: Trạng thái (Chưa duyệt / Đã duyệt), Tìm kiếm nhân viên, Khoảng thời gian, Chi nhánh.
- Hành động: Checkbox chọn nhiều, nút Phê duyệt (Approve) và Từ chối (Reject) từng yêu cầu hoặc hàng loạt.

### 2.5. Modal Nhập / Xuất Excel (`ImportEmployeeModal`)
- Tải file mẫu `Mau_nhan_vien.xlsx`.
- Chọn cơ chế xử lý lỗi: Dừng lại khi gặp lỗi / Bỏ qua dòng lỗi tiếp tục.
- Upload file với thanh tiến trình và thông báo kết quả chi tiết.

---

## 3. Quy chuẩn Design System Tuân thủ
- **Màu sắc:**
  - Primary: Deep Teal `#0F766E` / Hover `#115E59` / Dark `#134E4A` / Light `#CCFBF1`.
  - Accent / Trạng thái: Xanh lá `#10B981` (Đang làm việc), Đỏ `#EF4444` (Đã nghỉ / Từ chối), Vàng cam `#F59E0B` (Chờ duyệt).
  - Background: `#F8FAFC` / Surface: `#FFFFFF` / Border: `#E2E8F0`.
- **Bo góc (Border Radius):** Nút và ô nhập liệu Full Pill (`9999px`) hoặc Card / Modal bo góc mềm `16px` – `24px`.
- **Phông chữ:** `Be Vietnam Pro`, `system-ui`, sans-serif.
- **Tương thích:** Tích hợp mượt mà với `StoreOwnerLayout` và `AppTopNav`.
