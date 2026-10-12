# Specifications: Frontend Quản Lý Chi Phí Dịch Vụ & Vận Hành (FE-07)

## Capability Summary
Cung cấp phân hệ giao diện chuyên nghiệp cho Chủ cửa hàng (Store Owner) và Quản lý cửa hàng (Store Manager) để theo dõi, ghi nhận, kiểm soát hạn nợ và thực hiện thanh toán các khoản chi phí vận hành thường nhật (Điện, Nước, Thuê mặt bằng, Internet, Sửa chữa...) với cơ chế tích hợp Sổ quỹ tiền mặt (FE-17) tự động.

## Architecture Map
`ServiceExpensesPage (React 19)`  
  └── `useServiceExpenses (TanStack Query)`  
        └── `expenseApi (Axios / httpClient)`  
              └── `ASP.NET Core Web API (/api/v1/service-expenses)`  
                    └── `ServiceExpenses Table (SQL Server / EF Core 8)`

---

## ADDED Requirements

### Requirement: REQ-07.1 Quản lý danh sách và KPI chi phí vận hành
Hệ thống Frontend MUST hiển thị bảng danh sách các khoản chi phí theo từng chi nhánh và kỳ kế toán, kèm theo 4 thẻ KPI tóm tắt tổng số tiền chi tiêu, tiền chờ thanh toán, tiền đã thanh toán và số khoản nợ quá hạn. Bảng MUST hỗ trợ tìm kiếm, lọc theo danh mục, trạng thái và khoảng ngày.

#### Scenario: Hiển thị danh sách và số liệu KPI tổng hợp mặc định
**GIVEN** Quản lý cửa hàng đã đăng nhập và truy cập trang `/dashboard/expenses`  
**WHEN** Trang tải dữ liệu thành công từ API  
**THEN** Hệ thống MUST hiển thị 4 thẻ KPI tương ứng với tháng hiện tại  
**AND** Bảng hiển thị danh sách các khoản chi phí được sắp xếp theo ngày phát sinh mới nhất giảm dần  
**AND** Các khoản chi quá hạn hiển thị kèm nhãn đỏ cảnh báo.

#### Scenario: Lọc danh sách theo trạng thái và chi nhánh
**GIVEN** Quản lý cửa hàng đang ở trang danh sách chi phí  
**WHEN** Quản lý chọn chi nhánh "Chi nhánh 1" và trạng thái "Pending" trên thanh lọc  
**THEN** URL SearchParams MUST được cập nhật thành `?branchId=...&status=Pending`  
**AND** Hệ thống SHALL gửi request truy vấn API kèm bộ lọc tương ứng và cập nhật lại bảng danh sách.

#### Scenario: Hiển thị trạng thái rỗng khi không có bản ghi nào phù hợp (Edge Case)
**GIVEN** Quản lý áp dụng một bộ lọc không khớp với bất kỳ khoản chi nào  
**WHEN** API trả về danh sách rỗng (`items: []`, `totalItems: 0`)  
**THEN** Giao diện MUST hiển thị Empty State với biểu tượng hóa đơn, thông điệp "Không tìm thấy khoản chi phí nào phù hợp" và nút "Đặt lại bộ lọc".

---

### Requirement: REQ-07.2 Ghi nhận khoản chi phí vận hành mới
Hệ thống Frontend MUST cung cấp Modal ghi nhận chi phí với biểu mẫu nhập liệu được kiểm tra hợp lệ bằng Zod schema trước khi gửi lên API Backend.

#### Scenario: Ghi nhận chi phí hợp lệ thành công
**GIVEN** Quản lý nhấn nút "+ Ghi nhận chi phí" và Modal hiển thị  
**WHEN** Quản lý chọn Danh mục "Điện", nhập số tiền 1.500.000 VNĐ, chọn Chi nhánh, Ngày phát sinh, Hạn thanh toán và bấm "Lưu chi phí"  
**THEN** Hệ thống MUST gửi `POST /api/v1/service-expenses` với DTO hợp lệ  
**AND** Khi API phản hồi thành công, Modal MUST tự động đóng, hiển thị thông báo Toast xanh "Đã ghi nhận chi phí thành công" và làm mới lại danh sách bảng cùng các thẻ KPI.

#### Scenario: Báo lỗi validation khi số tiền <= 0 hoặc để trống trường bắt buộc (Edge Case)
**GIVEN** Modal ghi nhận chi phí đang mở  
**WHEN** Quản lý để trống Nhà cung cấp hoặc nhập số tiền là 0 hoặc số âm và bấm "Lưu chi phí"  
**THEN** Hệ thống MUST ngăn chặn việc gửi request lên server  
**AND** Hiển thị thông báo lỗi chi tiết bằng chữ màu đỏ bên dưới từng ô nhập liệu không hợp lệ.

#### Scenario: Chặn gửi yêu cầu trùng lặp khi người dùng click liên tục (Edge Case)
**GIVEN** Người dùng đã bấm "Lưu chi phí" và request đang được xử lý (`isPending = true`)  
**WHEN** Người dùng cố tình click liên tục vào nút "Lưu chi phí"  
**THEN** Nút "Lưu chi phí" MUST bị vô hiệu hóa (disabled), hiển thị biểu tượng quay tròn Loading và không gửi thêm bất kỳ request nào.

---

### Requirement: REQ-07.3 Xác nhận thanh toán và liên kết Sổ quỹ (Cashbook)
Hệ thống Frontend MUST cung cấp Modal xác nhận thanh toán cho các khoản chi phí đang ở trạng thái `Pending`, cho phép chọn hình thức thanh toán và tùy chọn tự động sinh phiếu chi tiền mặt vào Sổ quỹ (FE-17).

#### Scenario: Thanh toán chi phí thành công và sinh phiếu chi Sổ quỹ
**GIVEN** Một khoản chi phí tiền nước 800.000 VNĐ đang ở trạng thái `Pending`  
**WHEN** Quản lý nhấn nút "Thanh toán", chọn hình thức "Tiền mặt", tích chọn "Tạo phiếu chi trong Sổ quỹ" và xác nhận  
**THEN** Hệ thống MUST gửi `POST /api/v1/service-expenses/{id}/pay` với `createCashBookEntry: true`  
**AND** Khi thành công, trạng thái khoản chi trên bảng MUST chuyển sang badge màu xanh lá "Đã thanh toán (Paid)" kèm mã phiếu chi liên kết  
**AND** Tổng tiền chờ thanh toán trên thẻ KPI MUST giảm tương ứng.

#### Scenario: Chặn thanh toán khoản chi đã ở trạng thái Paid hoặc Cancelled (Edge Case)
**GIVEN** Một khoản chi phí đã có trạng thái `Paid` hoặc `Cancelled`  
**WHEN** Quản lý xem dòng chi phí đó trên bảng  
**THEN** Nút "Thanh toán" MUST bị ẩn hoặc vô hiệu hóa để ngăn chặn thao tác thanh toán trùng lặp.

---

### Requirement: REQ-07.4 Hủy khoản chi phí vận hành
Hệ thống Frontend MUST cho phép Quản lý cửa hàng hủy bỏ một khoản chi phí chưa thanh toán (`Pending`) kèm lý do hủy cụ thể.

#### Scenario: Hủy khoản chi phí thành công
**GIVEN** Một khoản chi phí sai thông tin ở trạng thái `Pending`  
**WHEN** Quản lý chọn thao tác "Hủy chi phí", nhập lý do "Nhập sai số tiền hóa đơn" và xác nhận  
**THEN** Hệ thống MUST gửi `PUT /api/v1/service-expenses/{id}/cancel`  
**AND** Trạng thái khoản chi chuyển sang badge xám "Đã hủy (Cancelled)" và không thể hoàn tác.

---

### Requirement: REQ-07.5 Tuân thủ Design System KiotViet & Tính Đa Thiết Bị
Giao diện phân hệ FE-07 MUST tuân thủ nghiêm ngặt quy chuẩn thiết kế của dự án:
1. Nút bấm chính và Badge trạng thái có kiểu dáng bo tròn Full Pill (`rounded-full`).
2. Card và Khung viền có bán kính bo góc 24px (`rounded-[24px]`).
3. Màu chủ đạo là Electric Blue (`#0066FF`), không có hiệu ứng nhún nhảy vô tận.
4. Tương thích hoàn toàn trên Desktop màn hình rộng, Tablet và màn hình điện thoại (Responsive).

---

## Acceptance Checklist
- [ ] Màn hình `/dashboard/expenses` hiển thị đúng layout và tích hợp vào Router của dự án.
- [ ] 4 Thẻ KPI hiển thị đúng số liệu tổng hợp chi phí trong tháng.
- [ ] Bảng chi phí hiển thị đầy đủ thông tin: Mã, Ngày, Hạn trả, Danh mục, Số tiền (VND), Nhà cung cấp, Trạng thái (Pill Badge), Thao tác.
- [ ] Bộ lọc đa tiêu chí (Chi nhánh, Danh mục, Trạng thái, Từ khóa) hoạt động mượt mà và đồng bộ qua URL params.
- [ ] Modal tạo chi phí mới có Zod validation và ngăn chặn double-submit.
- [ ] Modal thanh toán cho phép chọn nguồn tiền và tùy chọn ghi nhận Sổ quỹ FE-17.
- [ ] Modal xem hóa đơn phóng to chứng từ đính kèm rõ ràng.
- [ ] Không có bất kỳ lỗi biên dịch TypeScript (`tsc -b`) và vượt qua lint (`oxlint`).
