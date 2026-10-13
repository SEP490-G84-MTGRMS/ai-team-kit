# Proposal: ui-employee-management
## Phân hệ Quản lý Nhân sự (Employee Management UI)

## 1. Vấn đề
Trong hệ thống bán lẻ và chuỗi siêu thị mini đa tenant (**MT-GRMS**), quản lý nhân sự là mắt xích vận hành cốt lõi:
- **Tập trung hóa thông tin nhân sự:** Cần lưu trữ và quản lý tập trung thông tin cá nhân, hồ sơ công việc, chi nhánh làm việc, phòng ban và chức danh của toàn bộ nhân viên trên toàn chuỗi hoặc theo từng chi nhánh.
- **Cơ sở cho chấm công và tính lương:** Dữ liệu nhân sự là đầu vào quyết định cho việc xếp ca làm việc, chấm công vào/ra, thiết lập cơ cấu lương (lương cứng, làm thêm giờ, phụ cấp, hoa hồng, giảm trừ) và chốt bảng lương định kỳ.
- **Kiểm soát dòng tiền chi lương và tạm ứng:** Cần theo dõi công nợ lương, lịch sử các lần thanh toán lương, tạo phiếu chi tiền mặt/chuyển khoản và ghi nhận các khoản tạm ứng của nhân viên.
- **Quy trình phê duyệt phân cấp:** Nhân viên phát sinh các yêu cầu điều chỉnh hồ sơ, đổi thiết bị chấm công hoặc xin chấm công ngoài phạm vi cửa hàng cần được quản lý/chủ shop xem xét và duyệt/từ chối kịp thời.

Hiện tại trên nền tảng Frontend MT-GRMS, chưa có phân hệ giao diện Quản lý Nhân sự hoàn chỉnh đáp ứng các đặc tả trong tài liệu `quan_ly_nhan_vien.md` và bộ mockup `Screen Design/Employee Management`.

---

## 2. Mục tiêu
- Xây dựng giao diện Quản lý Nhân sự (**Employee Management UI**) hoàn chỉnh, hiện đại, tuân thủ Design System KiotViet/Deep Teal (`#0F766E`), tích hợp vào `StoreOwnerLayout` tại route `/employees` (cùng các route alias tương ứng).
- Hiện thực hóa đầy đủ các nghiệp vụ nhân sự chuẩn theo tài liệu yêu cầu:
  - **Quản lý danh sách nhân viên:** Tìm kiếm tức thì, bộ lọc đa tiêu chí (Chi nhánh, Phòng ban, Chức danh, Trạng thái làm việc).
  - **Khởi tạo & Cập nhật hồ sơ:** Form thông tin đa tab (Thông tin cá nhân, Công việc, Tài khoản đăng nhập, Thiết lập lương, Thuế TNCN & BHXH).
  - **Hồ sơ chi tiết 360 độ:** Xem chi tiết nhân viên kèm các tab Lịch làm việc, Thiết lập lương, Lịch sử phiếu lương (In/Xuất phiếu, chi tiết hoa hồng), Quản lý nợ & Tạm ứng (Tạo phiếu chi lương).
  - **Duyệt yêu cầu chờ duyệt:** Modal quản lý các yêu cầu Nhân viên & Chấm công, duyệt/từ chối đơn lẻ hoặc hàng loạt kèm badge cảnh báo trên thanh công cụ.
  - **Nhập/Xuất Excel:** Hỗ trợ tải file mẫu Excel, import danh sách tối đa 500 nhân viên với cơ chế xử lý lỗi (Dừng lại hoặc Bỏ qua dòng lỗi), xuất danh sách ra file Excel.
- Cung cấp bộ Mock Data phong phú, phục vụ kiểm thử toàn diện các luồng nghiệp vụ trước khi kết nối API Backend.

---

## 3. Phạm vi

### 3.1. In scope
1. **Màn hình Danh sách Nhân viên (`EmployeeListPage`):**
   - Bảng dữ liệu phân trang hiển thị: Mã nhân viên, Ảnh đại diện/Avatar, Tên nhân viên, Số điện thoại, Email, Chi nhánh làm việc, Phòng ban, Chức danh, Trạng thái (Đang làm việc / Đã nghỉ).
   - Thanh công cụ phía trên: Ô tìm kiếm tức thì theo Tên/Mã/SĐT, Nút "+ Nhân viên", Nút "Duyệt yêu cầu" (kèm badge đỏ số lượng yêu cầu chờ xử lý), Menu dropdown "Nhập file" / "Xuất file".
   - Sidebar bộ lọc bên trái: Lọc theo Trạng thái (Tất cả, Đang làm việc, Đã nghỉ việc), Lọc theo Chi nhánh, Lọc theo Phòng ban, Lọc theo Chức danh.
   - Thao tác trên từng dòng: Xem chi tiết (mở Drawer/Panel chi tiết), Sửa thông tin, Ngừng làm việc / Kích hoạt lại.
2. **Form Thêm mới & Cập nhật Nhân viên (`EmployeeFormModal` / `EmployeeFormPage`):**
   - **Tab Thông tin khởi tạo & Công việc:**
     + Mã nhân viên (tự sinh nếu để trống, VD: `NV00001`), Tên nhân viên (bắt buộc), Số điện thoại (bắt buộc), Email, Ngày sinh, Giới tính, CMND/CCCD, Địa chỉ, Ảnh đại diện.
     + Chi nhánh trả lương (bắt buộc), Danh sách Chi nhánh làm việc (cho phép chọn nhiều chi nhánh).
     + Phòng ban (Dropdown kèm nút thêm nhanh phòng ban), Chức danh (Dropdown kèm nút thêm nhanh).
     + Tài khoản đăng nhập: Liên kết tài khoản người dùng có sẵn hoặc cấp tài khoản mới.
     + Thông tin ngân hàng: Số tài khoản, Ngân hàng, Chi nhánh.
   - **Tab Thiết lập lương:**
     + Cấu hình 6 nhóm mục lương: Lương chính (theo tháng/theo giờ), Lương làm thêm giờ (hệ số OT ngày thường/cuối tuần/lễ), Thưởng, Hoa hồng doanh số/sản phẩm, Phụ cấp cố định, Các khoản giảm trừ.
   - **Tab Thuế TNCN & Bảo hiểm xã hội:**
     + Mã số thuế cá nhân, Số người phụ thuộc, Cấu hình đóng BHXH/BHYT/BHTN.
   - Nút hành động: `Lưu` và `Lưu & Thêm mới`.
3. **Panel / Drawer Chi tiết Nhân viên 360 độ (`EmployeeDetailModal`):**
   - Phần đầu: Avatar, Họ tên, Mã NV, Chức vụ, Phòng ban, Trạng thái, Số điện thoại, Nút Cập nhật, Nút Ngừng làm việc.
   - **Tab 1: Thông tin:** Toàn bộ thông tin cá nhân, công việc, ngân hàng, thuế & bảo hiểm.
   - **Tab 2: Lịch làm việc:** Xem lịch phân ca của nhân viên theo tuần/tháng (chế độ xem Bảng biểu và Danh sách).
   - **Tab 3: Thiết lập lương:** Hiển thị chi tiết bảng lương và các chế độ phụ cấp hiện hành, nút Cập nhật cấu hình lương.
   - **Tab 4: Phiếu lương:** Danh sách các kỳ phiếu lương đã chốt; xem chi tiết phiếu lương (Lương chính, Phụ cấp, Giảm trừ, Thực lĩnh); tính năng In phiếu lương (in chung, in kèm hoa hồng hóa đơn/sản phẩm) và Xuất file.
   - **Tab 5: Nợ & Tạm ứng:** Hiển thị số dư công nợ hiện tại; Danh sách các kỳ thanh toán; Nút "Thanh toán lương" mở popup tạo phiếu chi trả lương hoặc tạm ứng; Xuất file nợ lương.
4. **Modal Duyệt yêu cầu (`ApprovalRequestsModal`):**
   - Badge hiển thị số lượng yêu cầu chờ duyệt trên header danh sách.
   - Tab 1: Yêu cầu Nhân viên (Tạo hồ sơ, Sửa thông tin, v.v.).
   - Tab 2: Yêu cầu Chấm công (Đổi thiết bị chấm công, Chấm công ngoài phạm vi, Quên chấm công vào/ra).
   - Thao tác: Nút Phê duyệt (Check icon) và Từ chối (Cross icon) cho từng yêu cầu; hỗ trợ chọn nhiều để duyệt/từ chối hàng loạt.
5. **Modal Nhập / Xuất dữ liệu Excel (`ImportEmployeeModal`):**
   - Hướng dẫn tải file mẫu Excel `.xlsx`.
   - Chọn cách xử lý khi gặp dòng dữ liệu lỗi: Dừng nhập file hoặc Bỏ qua dòng lỗi để tiếp tục.
   - Validate dung lượng và giới hạn tối đa 500 nhân viên mỗi lần nạp.
   - Báo cáo kết quả nạp: Số bản ghi thành công, danh sách dòng lỗi chi tiết.
   - Xuất file: Tải toàn bộ danh sách hoặc danh sách đang lọc ra định dạng Excel.
6. **Tích hợp Kiến trúc & Routing:**
   - Tạo module độc lập tại `src/features/employee/`.
   - Tích hợp điều hướng trên thanh `AppTopNav` (mục Nhân viên -> Quản lý nhân viên).
   - Cấu hình routes: `/employees`, `/employees/create`, `/employees/:id`.

### 3.2. Out of scope
- Backend API thực tế kết nối cơ sở dữ liệu PostgreSQL (sẽ thực hiện trong change tích hợp backend).
- Xếp lịch làm việc tự động bằng thuật toán AI/Machine Learning.
- Máy quét vân tay / Face ID phần cứng tích hợp trực tiếp tại cửa hàng vật lý.
- Cổng thanh toán chuyển tiền tự động liên ngân hàng qua Open Banking.

---

## 4. Người dùng liên quan (Actors & Roles)
- **Chủ cửa hàng (Store Owner):**
  - Toàn quyền xem, thêm, sửa, cho thôi việc nhân sự trên toàn bộ các chi nhánh.
  - Phê duyệt các yêu cầu nhân viên gửi lên.
  - Cấu hình thang bảng lương, phụ cấp, hoa hồng và thực hiện chi trả lương / tạm ứng.
  - Import/Export dữ liệu nhân sự hàng loạt.
- **Quản lý cửa hàng (Store Manager):**
  - Quản lý danh sách nhân viên thuộc chi nhánh mình phụ trách.
  - Xem lịch làm việc và bảng chấm công của nhân sự chi nhánh.
  - Duyệt các yêu cầu chấm công trong phạm vi phân quyền.
- **Nhân viên thu ngân / Bán hàng (Cashier / Sales Staff):**
  - Đối tượng được quản lý thông tin trong hệ thống.
  - Gửi các đề xuất điều chỉnh thông tin hoặc xin duyệt chấm công.

---

## 5. Tiêu chí thành công (Acceptance Criteria)
- [ ] Bảng danh sách nhân viên hiển thị đầy đủ thông tin: Mã, Tên, Ảnh, SĐT, Chi nhánh, Phòng ban, Chức danh, Trạng thái; hỗ trợ phân trang và tìm kiếm nhanh dưới 200ms.
- [ ] Bộ lọc Sidebar (Trạng thái làm việc, Chi nhánh, Phòng ban, Chức danh) hoạt động đồng bộ và chính xác.
- [ ] Form thêm mới / cập nhật nhân viên cung cấp đầy đủ các trường thông tin cơ bản, công việc, ngân hàng, liên kết tài khoản đăng nhập và cấu hình lương.
- [ ] Drawer / Modal Chi tiết nhân viên 360 độ hiển thị đầy đủ 5 tab nghiệp vụ (Thông tin, Lịch làm việc, Mức lương, Phiếu lương, Nợ & tạm ứng).
- [ ] Thao tác Thanh toán lương mở modal Tạo phiếu chi, hỗ trợ cả 2 kịch bản: Thanh toán nợ lương định kỳ và Tạm ứng lương (khi công nợ = 0).
- [ ] Modal Duyệt yêu cầu hiển thị trực quan các yêu cầu chờ xử lý với 2 tab (Nhân viên, Chấm công), cho phép duyệt/từ chối đơn lẻ và hàng loạt.
- [ ] Modal Import Excel cho phép tải file mẫu, chọn chính sách xử lý lỗi và kiểm tra giới hạn 500 nhân viên.
- [ ] Giao diện tuân thủ 100% Design System của dự án (KiotViet style, Deep Teal `#0F766E`, bo góc 24-28px, phông `Be Vietnam Pro`, tương thích StoreOwnerLayout và responsive).
