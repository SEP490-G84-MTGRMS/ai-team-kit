# Proposal: Sửa Lỗi 400 Lịch Sử Ca, Tích Hợp Sidebar Quản Trị, Cấu Hình 2 Tài Khoản Nhân Viên Cùng Ca Để Test & Tinh Gọn UI POS

## 1. Vấn Đề & Yêu Cầu

### 1.1. Sửa lỗi HTTP 400 tại màn hình Lịch sử chốt ca
* **Hiện trạng**: Màn hình "Lịch Sử Chốt Ca & Bàn Giao Quầy" báo lỗi đỏ `Request failed with status code 400`. Bảng dữ liệu trống, KPI hiển thị 0.
* **Nguyên nhân gốc rễ**: State `selectedBranchId` đang lấy fallback từ mảng mock `AN_NHIEN_BRANCHES` có mã chuỗi `BR-AN-01` thay vì GUID. ASP.NET Core Model Binding từ chối tham số `[FromQuery] Guid branchId` với mã chuỗi.
* **Giải pháp**: Lấy danh sách chi nhánh thực tế từ database qua `branchApi.getBranches()` (hoặc `employeeApi.getBranches()`) chứa GUID chuẩn; đồng thời Backend hỗ trợ fallback an toàn nếu `branchId` rỗng.

### 1.2. Tích hợp thanh Sidebar quản trị cho Lịch sử chốt ca
* **Hiện trạng**: Trang lịch sử chốt ca hiện nằm dưới `PosLayout` (toàn màn hình quầy bán hàng) nên thiếu Sidebar bên trái.
* **Yêu cầu**: Đưa trang này vào hệ thống quản trị của Chủ cửa hàng (`/store-owner/shifts`) sử dụng layout chuẩn `StoreOwnerLayout` với đầy đủ **Sidebar và TopNav** đồng bộ như Khuyến mãi, Hàng hóa, Lịch làm việc. Cập nhật nút "Lịch sử giao ca" ở trang Lịch làm việc (`WorkSchedulePage.tsx`) điều hướng về đây.

### 1.3. Cung cấp 2 tài khoản nhân viên cùng ca để test bán hàng chung ca
* **Yêu cầu người dùng**: Không cần làm bộ chuyển đổi thu ngân ảo trên UI, mà **cung cấp 2 tài khoản nhân viên thực sự trong hệ thống và phân công họ vào cùng một ca làm việc (hoặc cùng chi nhánh Ba Đình)**.
* **Mục đích**: Người dùng có thể mở 2 tab/cửa sổ trình duyệt, đăng nhập Nhân viên 1 vào POS mở ca và bán hàng, sau đó đăng nhập Nhân viên 2 vào POS bán tiếp trong cùng ca đó. Cuối cùng thực hiện chốt ca để kiểm tra thực tế xem ca có ghi nhận đầy đủ cả 2 nhân viên và các đơn hàng hay không.
* **Tài khoản được chuẩn bị (Chi nhánh Ba Đình - An Nhiên Mart)**:
  * **Nhân viên 1**: Số điện thoại / Tên đăng nhập: `0917778888` · Mật khẩu: `123456` (Phạm Thị Yến - Thu ngân 1)
  * **Nhân viên 2**: Số điện thoại / Tên đăng nhập: `0915556666` · Mật khẩu: `123456` (Nguyễn Văn Minh - Thu ngân 2)
  * Đảm bảo cả 2 nhân viên đều được gắn vào Chi nhánh Ba Đình và có ca làm việc tương ứng trong hệ thống.

### 1.4. Xóa bỏ phần in báo cáo chốt ca (Z-Report K80)
* **Yêu cầu**: Xóa bỏ modal / tính năng in báo cáo kết ca Z-Report K80 (`ZReportModal`) khi đóng ca ở POS và nút in Z-Report trong bảng lịch sử ca.
* **Quy trình mới**: Khi hoàn tất chốt ca, hệ thống hiển thị thông báo thành công ngắn gọn (Toast/Alert) và cập nhật trạng thái ca, không bật popup in phiếu K80 nữa.

### 1.5. Ẩn thông tin Quầy trên màn hình bán hàng POS
* **Yêu cầu**: Cửa hàng quản lý tập trung theo chi nhánh (két dùng chung), không phân biệt quầy riêng lẻ.
* **Giải pháp**: Xóa bỏ phần hiển thị `&bull; Quầy #01` trên thanh Header POS ([`PosHeader.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx)).

---

## 2. Giải Đáp Nghiệp Vụ: Chênh Lệch Thừa Tiền Đầu Ca (+1.500.000 đ)

Khi mở ca, nếu tiền mặt thực đếm trong két ($A$) lớn hơn số tiền ca trước để lại ($A_{expected}$), ví dụ: $+1.500.000$ đ (Thừa tiền):
1. **Lưu vết đối soát độc lập**: Hệ thống lưu trường `OpeningDiscrepancy = +1.500.000đ` vào bản ghi `ShiftZReport` để Chủ cửa hàng thấy rõ ca trước để lại thừa tiền.
2. **Nguyên tắc tính toán tiền két trong ca**:
   * Tiền lý thuyết trong két $G$ của ca mới được bắt đầu từ chính số tiền **thực tế đếm được** ($A$), không bị lệch theo số cũ:
     $$\text{ExpectedCash } (G) = \text{OpeningFloat } (A) + \text{Doanh thu tiền mặt} + \text{Thu két} - \text{Chi két}$$
   * Nhờ đó, việc thừa/thiếu tiền từ ca trước không làm sai lệch doanh thu hoặc gây chênh lệch ảo trong phiên bán hàng ca này.
3. **Quy trình**: Thu ngân ghi chú lý do vào ô "Ghi chú mở ca" (ví dụ: *Chủ cửa hàng bỏ thêm 1.500.000đ tiền lẻ*).

---

## 3. Mục Tiêu & Phạm Vi (Scope)

### Trong phạm vi (In Scope):
1. **Frontend**:
   * Lấy danh sách chi nhánh thật từ API cho `PosShiftPage.tsx` để sửa dứt điểm lỗi 400.
   * Chuyển `PosShiftPage` vào route `/store-owner/shifts` trong `StoreOwnerLayout` (có thanh Sidebar và TopNav).
   * Cập nhật điều hướng từ Lịch làm việc (`WorkSchedulePage.tsx`) đến `/store-owner/shifts`.
   * Xóa bỏ `ZReportModal` và các trigger in báo cáo kết ca khi chốt ca POS và tại bảng lịch sử.
   * Xóa hiển thị `&bull; Quầy #01` trên `PosHeader.tsx`.
2. **Backend / Seed Data**:
   * Đảm bảo 2 tài khoản nhân viên `0917778888` và `0915556666` đều thuộc Chi nhánh Ba Đình (`BR-AN-01`), có phân ca làm việc hoạt động, sẵn sàng đăng nhập test bán cùng ca.
   * Cải tiến `ShiftsController.GetShiftHistory` chấp nhận branchId linh hoạt, an toàn.

### Ngoài phạm vi (Out of Scope):
* Không sửa logic nghiệp vụ trừ kho FEFO hay tính sổ quỹ tiền mặt.

---

## 4. Tiêu Chí Nghiệm Thu (Success Criteria)
* [ ] Lịch sử ca tải thành công 200 OK với chi nhánh hợp lệ, không còn lỗi 400.
* [ ] Trang Lịch sử chốt ca hiển thị đầy đủ thanh Sidebar bên trái của Store Owner tại route `/store-owner/shifts`.
* [ ] Cả 2 tài khoản nhân viên `0917778888` và `0915556666` đăng nhập được, cùng vào POS bán hàng trong 1 ca, và khi chốt ca ghi nhận cả 2 nhân viên trong `Participants`.
* [ ] Khi chốt ca ở POS hoặc xem lịch sử ca, không còn bật popup in Z-Report K80.
* [ ] Màn hình bán hàng POS không còn hiển thị nhãn Quầy.
