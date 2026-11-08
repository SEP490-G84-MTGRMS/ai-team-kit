# Delta Specification: pos-shift-sidebar-multistaff-and-fix400

## MODIFIED Requirements

### Requirement: REQ-SHIFT-HISTORY-QUERY (Truy Vấn Lịch Sử Ca Hợp Lệ & An Toàn)
Hệ thống **MUST** hỗ trợ tra cứu lịch sử các phiên ca làm việc theo chi nhánh sử dụng định dạng `Guid` chuẩn từ CSDL thay vì mã chuỗi mock.
Giao diện người dùng **SHALL** tải danh sách chi nhánh hoạt động từ API (`employeeApi.getBranches()` hoặc `branchApi.getBranches()`) để người dùng lọc chi nhánh.
Backend `ShiftsController.GetShiftHistory` **MUST** cho phép tham số `branchId` là nullable (`Guid? branchId`). Nếu không truyền hoặc truyền `Guid.Empty`, backend **SHALL** tự động fallback về `CurrentBranchId` của Tenant/User mà không được trả lỗi `400 Bad Request`.

#### Scenario: Sửa lỗi 400 khi mở trang Lịch sử ca
* **GIVEN** Người dùng mở trang "Lịch Sử Chốt Ca & Bàn Giao Quầy"
* **WHEN** Trang khởi tạo và gọi API lấy danh sách chi nhánh và lịch sử ca
* **THEN** Chi nhánh được chọn mang GUID chuẩn (ví dụ của Chi nhánh Ba Đình)
* **AND** API `GET /api/v1/shifts/history?branchId={guid}` trả về HTTP 200 OK kèm danh sách các phiên ca
* **AND** Không còn xuất hiện banner đỏ `Request failed with status code 400`

#### Scenario: Fallback an toàn khi branchId không được chỉ định
* **GIVEN** Client gửi request `GET /api/v1/shifts/history` không truyền `branchId` hoặc truyền `branchId=00000000-0000-0000-0000-000000000000`
* **WHEN** Backend xử lý request
* **THEN** Backend lấy `_tenantContext.CurrentBranchId` hợp lệ
* **AND** Trả về HTTP 200 OK với danh sách ca thuộc chi nhánh mặc định của tenant

---

### Requirement: REQ-SHIFT-PAGE-LAYOUT (Tích Hợp Thanh Điều Hướng Sidebar Quản Trị)
Trang Lịch Sử Chốt Ca & Bàn Giao Quầy **MUST** được đặt tại đường dẫn quản trị `/store-owner/shifts` và nằm bên trong layout chuẩn `StoreOwnerLayout`.
Trang **SHALL** hiển thị đầy đủ thanh Sidebar điều hướng bên trái và thanh TopNav trên cùng để Chủ cửa hàng dễ dàng chuyển sang các module khác (Hàng hóa, Khuyến mãi, Nhân viên, Sổ quỹ...).
Nút "Lịch sử giao ca" tại trang Lịch làm việc (`WorkSchedulePage.tsx`) **SHALL** điều hướng đến `/store-owner/shifts`.

#### Scenario: Chủ cửa hàng xem lịch sử ca có thanh Sidebar
* **GIVEN** Chủ cửa hàng đang ở trang Lịch Làm Việc (`/store-owner/employees/schedule`)
* **WHEN** Chủ cửa hàng bấm nút "Lịch sử giao ca"
* **THEN** Hệ thống chuyển hướng đến `/store-owner/shifts?branchId={guid}`
* **AND** Trang hiển thị đầy đủ thanh Sidebar quản trị bên trái cùng bảng dữ liệu lịch sử ca và 4 thẻ KPI

---

### Requirement: REQ-SHIFT-CLOSE-UX-CLEANUP (Tinh Gọn Quy Trình Đóng Ca, Xóa Bỏ In Z-Report K80)
Hệ thống **MUST** loại bỏ hoàn toàn modal in phiếu kết ca K80 (`ZReportModal`) sau khi chốt ca POS cũng như nút in "Z-Report" trong bảng lịch sử ca.
Khi hoàn tất đóng ca tại POS, hệ thống **SHALL** hiển thị thông báo thành công (Toast), đóng modal chốt ca và cập nhật trạng thái ca làm việc mà không bật popup in ấn.
Trong bảng lịch sử ca, cột "Thao tác" **SHALL** chỉ hiển thị nút hành động "Nhận ca" nếu ca đang ở trạng thái `PendingHandover`.

#### Scenario: Đóng ca POS nhanh gọn không in Z-Report
* **GIVEN** Thu ngân đang mở modal "Chốt ca" tại màn hình bán hàng POS
* **WHEN** Thu ngân nhập số tiền thực đếm, phân bổ két và bấm "Xác Nhận & Hoàn Tất Đóng Ca"
* **THEN** Ca được đóng thành công với thông báo Toast xanh
* **AND** Modal đóng ca tự động tắt, không hiển thị popup "Báo Cáo Kết Ca Z-Report K80"
* **AND** Trạng thái trên header POS chuyển sang chưa mở ca

---

### Requirement: REQ-POS-HEADER-CLEANUP (Ẩn Hiển Thị Quầy Trên Header POS)
Thanh Header POS **MUST NOT** hiển thị nhãn `&bull; Quầy #01`.
Thanh Header **SHALL** chỉ hiển thị thông tin Chi nhánh: `Chi nhánh: [Tên chi nhánh]` để tránh gây hiểu nhầm về phân chia quầy/két vật lý.

#### Scenario: Header POS chỉ hiển thị Chi nhánh
* **GIVEN** Thu ngân truy cập màn hình bán hàng POS
* **WHEN** Màn hình POS hiển thị
* **THEN** Thanh tiêu đề hiển thị tên chi nhánh đã chọn
* **AND** Không xuất hiện bất kỳ nhãn nào chứa "Quầy #01"

---

## ADDED Requirements

### Requirement: REQ-MULTI-STAFF-SHIFT-TESTING (Cấu Hình 2 Tài Khoản Nhân Viên Test Bán Chung Ca)
Dữ liệu khởi tạo CSDL (Seed Data) **MUST** đảm bảo có sẵn ít nhất 2 tài khoản nhân viên thật thuộc Chi nhánh Ba Đình:
1. `0917778888` / `123456`: Phạm Thị Yến (Thu ngân 1, Role: EMPLOYEE, Chi nhánh Ba Đình)
2. `0915556666` / `123456`: Nguyễn Văn Minh (Thu ngân 2, Role: EMPLOYEE, Chi nhánh Ba Đình)
Cả 2 tài khoản **MUST** được phân công ca làm việc hoạt động (Active EmployeeSchedule) tại Chi nhánh Ba Đình.
Khi Thu ngân 1 mở ca và bán đơn hàng, rồi Thu ngân 2 đăng nhập vào POS bán đơn hàng tiếp theo trong cùng ngày/chi nhánh, hệ thống **MUST** cho phép Thu ngân 2 bán vào phiên ca chung đó và tự động ghi nhận Thu ngân 2 vào danh sách `ShiftParticipants`.

#### Scenario: Hai nhân viên bán chung ca và ghi nhận vào danh sách tham gia
* **GIVEN** Thu ngân 1 (`0917778888`) đăng nhập vào POS, mở ca với tiền đầu ca 1.500.000 đ và thanh toán đơn hàng HD01
* **WHEN** Thu ngân 2 (`0915556666`) đăng nhập vào POS trên cùng chi nhánh Ba Đình
* **THEN** POS tự động nhận diện ca đang mở và cho phép Thu ngân 2 bán hàng ngay
* **WHEN** Thu ngân 2 thanh toán đơn hàng HD02
* **THEN** Đơn hàng HD02 được lưu với `CreatedBy` là Thu ngân 2
* **AND** Bảng `ShiftParticipants` tự động ghi nhận Thu ngân 2 tham gia ca
* **WHEN** Thực hiện chốt ca và xem lại trong trang Lịch sử chốt ca
* **THEN** Cột "Thu ngân" hiển thị cả 2 nhân viên: `Phạm Thị Yến, Nguyễn Văn Minh`
