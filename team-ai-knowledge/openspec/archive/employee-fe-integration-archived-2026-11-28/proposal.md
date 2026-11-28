# Proposal: employee-fe-integration

## Vấn đề
Hiện tại, ngoài việc hồ sơ nhân viên cần đồng bộ dữ liệu thật từ Backend, chức năng **Cấu hình Ca làm việc chuẩn (`ShiftConfig`)** phía Frontend (`ShiftConfigPage.tsx`, `ShiftFormModal.tsx`, `ShiftConfigModal.tsx`, `ShiftInfoModal.tsx`) cũng cần được kết nối chính thức với các API Backend đã sẵn sàng của Cụm 2 (`/api/v1/hr/shift-configs` và `/api/v1/shift-configs`).

Nếu không tích hợp cấu hình ca làm việc vào đợt này:
1. Người dùng không thể tạo hoặc chỉnh sửa danh mục ca làm việc thực tế cho từng chi nhánh (khung giờ, thời lượng, khung chấm công, ca qua đêm, áp dụng đa chi nhánh).
2. Thiếu dữ liệu nền tảng ca chuẩn (Master Data) để chuyển tiếp sang giai đoạn Lập lịch tuần (`WorkSchedulePage`) và Chấm công (`AttendancePage`).
3. Trải nghiệm người dùng bị phân mảnh giữa dữ liệu nhân viên thực tế và danh mục ca tĩnh.

## Mục tiêu
- Mở rộng phạm vi tích hợp Frontend bao gồm cả **Quản lý Hồ sơ Nhân sự** và **Danh mục Cấu hình Ca làm việc (`ShiftConfig`)**.
- Tích hợp trọn vẹn module `shiftConfigApi.ts` với các màn hình `ShiftConfigPage`, `ShiftFormModal`, `ShiftConfigModal` và `ShiftInfoModal`.
- Hỗ trợ đầy đủ các nghiệp vụ ca nâng cao từ Backend: ca làm việc qua đêm (`IsCheckInNextDay`), phạm vi áp dụng đa chi nhánh (`BranchIds`), tự sinh mã ca (`ShiftCode`), và tính toán thời lượng giờ công chuẩn.
- Đồng bộ các phản hồi hành động (Thêm ca, Cập nhật ca, Bật/Tắt trạng thái, Xóa ca) thông qua bộ Modal thông báo & xác nhận dùng chung hệ thống (`ConfirmModal`, `NotificationModal`).

## Phạm vi (Scope)

### In Scope
1. **Quản lý Hồ sơ Nhân viên & Đồng bộ Phụ cấp (`employeeApi.ts`)**:
   - `getEmployeesPaged(filter)`: Lấy danh sách nhân viên có phân trang server-side, tìm kiếm debounce và bộ lọc chi nhánh/trạng thái.
   - `getEmployeeById(id)`: Lấy chi tiết hồ sơ 360 độ (Optimistic Pre-fill, format ngày `DD/MM/YYYY`).
   - `createEmployee(payload)` & `updateEmployee(id, payload)`: Tạo mới và cập nhật thông tin nhân viên, upload ảnh đại diện Cloudinary qua `POST /api/v1/media/upload`.
   - Thuật toán khớp nối ID phụ cấp (Regex UUID) tránh lỗi `DbUpdateConcurrencyException`.
   - `deleteEmployee(id)`: Xóa nhân viên qua `ConfirmModal` và xử lý bắt lỗi nghiệp vụ `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03) qua `NotificationModal`.
   - `createIdentityAccount(id, payload)`: Cấp tài khoản người dùng đăng nhập hệ thống.
2. **Quản lý Danh mục Cấu hình Ca làm việc (`shiftConfigApi.ts`)**:
   - `getShiftConfigsByBranch(branchId, isActive)`: Gọi `GET /api/v1/hr/shift-configs` nạp danh mục ca theo chi nhánh hoặc toàn hệ thống.
   - `getShiftConfigById(id)`: Gọi `GET /api/v1/hr/shift-configs/{id}` xem chi tiết ca.
   - `createShiftConfig(payload)`: Gọi `POST /api/v1/hr/shift-configs` tạo mới ca làm việc (hỗ trợ tự sinh mã hoặc nhập tùy chỉnh, khung giờ, giờ công).
   - `updateShiftConfig(id, payload)`: Gọi `PUT /api/v1/hr/shift-configs/{id}` cập nhật thông tin ca.
   - `updateShiftConfigStatus(id, isActive)`: Gọi `PATCH /api/v1/hr/shift-configs/{id}/status` bật/tắt trạng thái hoạt động của ca.
   - `deleteShiftConfig(id)`: Gọi `DELETE /api/v1/hr/shift-configs/{id}` xóa mềm ca làm việc có xác nhận an toàn.
   - Hỗ trợ nghiệp vụ ca qua đêm (`isCheckInNextDay = true`) và chọn nhiều chi nhánh áp dụng (`branchIds`).
3. **Bộ Modal Thông báo & Xác nhận Dùng chung (`src/components/common/`)**:
   - `ConfirmModal.tsx`: Hộp thoại xác nhận các thao tác nguy hiểm (Xóa nhân viên, Xóa ca làm việc).
   - `NotificationModal.tsx`: Popup thông báo kết quả tức thời (Thành công, Lỗi nghiệp vụ BR-EMP-03, Cảnh báo).
4. **Chuẩn hóa Kích thước Modal**:
   - Đồng bộ kích thước chuẩn `900px × 85vh` cho toàn bộ các modal và submodal trong phân hệ.

### Out of Scope
- Lập lịch làm việc tuần cụ thể cho từng nhân viên (`WorkSchedulePage` - phân ca batch `EmployeeSchedule`), Chấm công số GPS/FaceID (`AttendancePage`) và Tính lương tự động (`PayslipManagementPage`) sẽ được nối Backend ở các change tiếp theo khi Cụm 3, 4, 5 hoàn thiện.

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner)**: Toàn quyền cấu hình ca làm việc áp dụng cho tất cả chi nhánh, quản lý nhân viên toàn chuỗi.
- **Quản lý chi nhánh (Branch Manager)**: Thiết lập và tùy chỉnh các ca làm việc đặc thù tại chi nhánh phụ trách.
- **Nhân viên (Employee)**: Được phân ca dựa trên các ca chuẩn đã được định nghĩa.

## Tiêu chí thành công
- [ ] 100% dữ liệu nhân viên và danh mục cấu hình ca được nạp từ Backend API thực tế.
- [ ] Tạo mới và chỉnh sửa ca làm việc thành công, hỗ trợ ca qua đêm và multi-branch lưu chuẩn xác vào DB.
- [ ] Bật/tắt trạng thái ca (`isActive`) và xóa ca gọi đúng API Backend và phản hồi mượt mà qua `NotificationModal`.
- [ ] Đồng bộ phụ cấp nhân viên an toàn tuyệt đối với kiểm tra Regex UUID.
- [ ] Bắt lỗi `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03) và hiển thị cảnh báo giải thích rõ ràng khi xóa nhân viên có lịch ca/phiếu lương.
- [ ] Toàn bộ dự án Frontend build sạch 0 lỗi (`npm run build`) và unit tests pass 100%.
