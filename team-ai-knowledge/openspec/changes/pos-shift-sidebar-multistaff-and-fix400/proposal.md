# Proposal: Cải Tiến Giao Diện Quản Trị Ca, Sửa Lỗi 400 Lịch Sử Ca & Bổ Sung Chuyển Thu Ngân Test Bán Hàng

## 1. Vấn Đề & Bước Tái Hiện

### 1.1. Lỗi HTTP 400 khi tra cứu lịch sử ca
* **Bước tái hiện**: Vào màn hình "Lịch Sử Chốt Ca & Bàn Giao Quầy", chọn chi nhánh "An Nhiên Mart - Chi nhánh Ba Đình" (hoặc mặc định tải trang).
* **Kết quả thực tế**: Màn hình hiển thị banner đỏ `Request failed with status code 400`. Bảng dữ liệu trống, các thẻ KPI hiển thị 0.
* **Nguyên nhân gốc rễ (Root Cause)**:
  * Trong `PosShiftPage.tsx`, state `selectedBranchId` đang lấy fallback từ mảng mock `AN_NHIEN_BRANCHES` có `id: 'BR-AN-01'` (chuỗi mã ký tự thay vì GUID).
  * Backend API `GET /api/v1/shifts/history?branchId=BR-AN-01` khai báo tham số kiểu `[FromQuery] Guid branchId`.
  * Bộ parse của ASP.NET Core MVC Model Binding phát hiện chuỗi `'BR-AN-01'` không đúng định dạng GUID nên trả về ngay lập tức lỗi `400 Bad Request` ("The value 'BR-AN-01' is not valid for Guid.").

### 1.2. Thiếu thanh Sidebar điều hướng ở trang Lịch sử chốt ca
* **Hiện trạng**: Màn hình `PosShiftPage.tsx` hiện được cấu hình route `/pos/shift` nằm trong `PosLayout` (layout toàn màn hình chỉ dành cho máy thu ngân bán hàng).
* **Bất cập**: Khi Chủ cửa hàng từ các màn hình quản trị (như Khuyến mãi, Hàng hóa, Lịch làm việc) bấm vào "Lịch sử giao ca", họ bị chuyển sang giao diện POS toàn màn hình và mất hoàn toàn thanh Sidebar bên trái, không thể điều hướng nhanh sang các module quản lý khác.

### 1.3. Khó khăn khi kiểm thử bán hàng đa nhân viên trong cùng 1 ca
* **Hiện trạng**: Hệ thống đã có cơ chế ca dùng chung chi nhánh (Shared Branch Shift), tự động ghi nhận nhân viên tham gia ca (`ShiftParticipant`) khi phát sinh đơn hàng. Tuy nhiên, trên giao diện Web POS hiện chỉ lấy cố định tên/tài khoản của người đang đăng nhập (`useAuthStore`).
* **Yêu cầu**: Cần có công cụ chọn / chuyển đổi nhanh nhân viên trực quầy (Cashier Switcher) ngay trên giao diện POS để Chủ shop / Tester có thể bán thử đơn hàng dưới tên nhiều nhân viên khác nhau trong cùng 1 ca và kiểm chứng danh sách tham gia khi chốt ca.

### 1.4. Dư thừa popup in báo cáo kết ca (Z-Report K80)
* **Hiện trạng**: Khi hoàn tất đóng ca ở POS hoặc xem lịch sử ca, hệ thống mở modal in phiếu K80 (`ZReportModal`).
* **Yêu cầu người dùng**: Xóa bỏ phần in báo cáo chốt ca này để quy trình nhanh gọn, chỉ cần thông báo hoàn tất đóng ca và hiển thị trong danh sách lịch sử.

### 1.5. Hiển thị "Quầy #01" gây hiểu nhầm
* **Hiện trạng**: Thanh header POS hiển thị `&bull; Quầy #01`.
* **Yêu cầu**: Vì cửa hàng tạp hóa quản lý dòng tiền và ca làm việc tập trung theo chi nhánh (không chia két/quầy riêng lẻ), việc hiển thị "Quầy" là thừa và gây hiểu nhầm. Cần ẩn/xóa nhãn Quầy.

---

## 2. Giải Đáp Nghiệp Vụ: Xử Lý Chênh Lệch Thừa Tiền Đầu Ca (+1.500.000 đ)

Khi mở ca, nếu tiền mặt thực đếm trong két ($A$) lớn hơn số tiền ca trước để lại bàn giao ($A_{expected}$), ví dụ: $+1.500.000$ đ:
1. **Ghi nhận kiểm toán độc lập**: Hệ thống lưu trường `OpeningDiscrepancy = +1.500.000đ` (Thừa tiền) vào bản ghi `ShiftZReport` để Chủ cửa hàng dễ dàng truy vết và đối soát với ca trước.
2. **Nguyên tắc tính toán tiền két trong ca**:
   * Tiền lý thuyết trong két $G$ của ca mới được bắt đầu từ chính số tiền **thực tế đếm được** ($A$), không bị méo mó theo số cũ:
     $$\text{ExpectedCash } (G) = \text{OpeningFloat } (A) + \text{Doanh thu tiền mặt} + \text{Thu két} - \text{Chi két}$$
   * Nhờ đó, việc thừa/thiếu tiền của ca trước sẽ không làm sai lệch doanh thu hoặc gây lỗi chênh lệch giả trong suốt phiên bán hàng của ca hiện tại.
3. **Quy trình khuyến nghị**: Thu ngân khi thấy thừa tiền đầu ca cần điền lý do vào ô **"Ghi chú mở ca"** (ví dụ: *Chủ cửa hàng bổ sung thêm 1.500.000 đ tiền lẻ đầu ngày*).

---

## 3. Mục Tiêu & Phạm Vi (Scope)

### Trong phạm vi (In Scope):
1. **Sửa lỗi 400 Lịch sử ca**:
   * Frontend: Lấy danh sách chi nhánh thật từ `employeeApi.getBranches()` (hoặc `branchApi.getBranches()`) chứa GUID chuẩn thay vì mock `AN_NHIEN_BRANCHES`.
   * Backend: Cải tiến `ShiftsController.GetShiftHistory` chấp nhận xử lý linh hoạt chi nhánh (nếu `branchId` rỗng thì fallback về chi nhánh hiện tại của tenant/user mà không quăng lỗi).
2. **Tích hợp thanh Sidebar (`StoreOwnerLayout`)**:
   * Chuyển route Lịch sử chốt ca thành route quản trị `/store-owner/shifts` nằm trong `StoreOwnerLayout` có Sidebar và TopNav hoàn chỉnh.
   * Cập nhật nút "Lịch sử giao ca" tại trang Lịch làm việc (`WorkSchedulePage.tsx`) điều hướng đến `/store-owner/shifts`.
3. **Bổ sung Bộ chuyển đổi thu ngân (Cashier Switcher) trên POS**:
   * Trên thanh header POS hoặc khung thanh toán: Cho phép chọn/nhập nhanh nhân viên thu ngân trực quầy (ví dụ: `Thu ngân 1 (Mai)`, `Thu ngân 2 (An)`, hoặc danh sách nhân viên từ API).
   * Khi đổi thu ngân và thanh toán đơn hàng: Đơn hàng mang tên thu ngân đó, và Backend tự động thêm thu ngân đó vào danh sách tham gia ca (`ShiftParticipants`).
4. **Xóa tính năng In Báo Cáo Chốt Ca (Z-Report)**:
   * Xóa modal/nút `ZReportModal` khi đóng ca ở POS và ở bảng lịch sử.
   * Sau khi chốt ca, hiển thị thông báo thành công và chuyển trạng thái ca rõ ràng.
5. **Ẩn thông tin Quầy**:
   * Loại bỏ chữ `&bull; Quầy #01` trên thanh Header POS.

### Ngoài phạm vi (Out of Scope):
* Không thay đổi logic phân bổ tiền két `RetainedFloat + DroppedToSafe == ActualCashCounted`.
* Không can thiệp vào logic trừ kho FEFO hay sổ quỹ tiền mặt.

---

## 4. Tiêu Chí Nghiệm Thu (Success Criteria)
* [ ] API lịch sử ca trả về HTTP 200 OK và hiển thị danh sách ca đúng chi nhánh đã chọn, không còn lỗi 400.
* [ ] Trang Lịch sử chốt ca hiển thị đầy đủ thanh Sidebar bên trái của Store Owner.
* [ ] Trên POS, người dùng có thể đổi nhanh thu ngân, bán đơn hàng thử nghiệm, và khi đóng ca kiểm tra lịch sử thấy ca ghi nhận cả 2 thu ngân.
* [ ] Không còn popup in Z-Report K80 khi đóng ca hoặc xem lịch sử.
* [ ] Thanh Header POS hiển thị gọn gàng thông tin chi nhánh, không còn chữ "Quầy".
