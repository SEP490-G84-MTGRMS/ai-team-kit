# Specs: pos-shift-ui-role-and-cash-approval

## ADDED Requirements

### Requirement: REQ-POS-ROLE-01 Phân quyền giao diện POS giữa Chủ cửa hàng và Nhân viên
Hệ thống MUST phân biệt rõ giao diện và trải nghiệm quầy POS dựa trên vai trò người dùng (`useAuthStore().user?.role`):
- Nếu người dùng có vai trò `STORE_OWNER` hoặc `ADMIN`: Hệ thống MUST KHÔNG hiển thị modal bắt buộc mở ca (`OpenShiftModal`), ẩn các nút thao tác ca (Chốt ca, Thu/chi két) trên Header POS; đồng thời MUST hiển thị icon Chuông thông báo "Duyệt chi két" kèm Badge số lượng yêu cầu `PendingApproval`.
- Nếu người dùng có vai trò `CASHIER` hoặc `EMPLOYEE`: Hệ thống MUST kiểm tra trạng thái ca khi truy cập màn hình POS; nếu chưa có ca mở thì MUST chặn màn hình và hiển thị modal `OpenShiftModal`; trên Header POS hiển thị thông tin ca, nút "Thu/Chi Két" và menu chốt ca.

#### Scenario: Chủ cửa hàng truy cập POS bán hàng
GIVEN Người dùng đăng nhập với role `STORE_OWNER`
WHEN Truy cập trang `/pos` hoặc `/employee/pos`
THEN Không có modal mở ca nào hiển thị
AND Header POS hiển thị icon Chuông phê duyệt chi két với số lượng yêu cầu chờ duyệt
AND Các nút "Mở ca", "Thu/Chi Két", "Chốt ca" được ẩn khỏi Header

#### Scenario: Thu ngân truy cập POS khi chưa mở ca
GIVEN Người dùng đăng nhập với role `CASHIER`
AND Chi nhánh hiện tại chưa có ca nào đang mở cho quầy thu ngân
WHEN Truy cập trang `/pos`
THEN Modal `OpenShiftModal` bắt buộc mở ca hiển thị chặn màn hình bán hàng
AND Nút bắt đầu ca yêu cầu nhập số tiền đầu ca thực tế

---

### Requirement: REQ-POS-SHIFT-02 Kế thừa số tiền đầu ca từ ca liền trước
Khi mở ca mới, hệ thống MUST tự động truy vấn số tiền tồn két thực tế để lại từ ca trước $A_{expected}$ (`OpeningFloatExpected`) để hiển thị cho nhân viên. Nhân viên MUST đếm và nhập số tiền thực tế $A$ (`OpeningFloat`). Hệ thống SHALL tự động tính chênh lệch đầu ca $\Delta_{open} = A - A_{expected}$.

#### Scenario: Mở ca kế thừa tiền từ ca trước
GIVEN Ca liền trước chốt với số tiền để lại két `RetainedFloatAmount = 1,500,000 VND`
WHEN Nhân viên mở modal `OpenShiftModal`
THEN Hệ thống hiển thị `OpeningFloatExpected = 1,500,000 VND`
AND Khi nhân viên nhập `OpeningFloat = 1,500,000 VND`, chênh lệch đầu ca hiển thị `0 VND`
AND Nhân viên bấm "Bắt đầu ca bán hàng", hệ thống gọi API `POST /api/pos/shifts/open` thành công

---

### Requirement: REQ-POS-CASH-03 Kiểm tra hạn mức chi tiền két và luồng duyệt chi
Khi nhân viên lập phiếu xuất tiền (`CashOut` / `PettyExpense`):
- Nếu số tiền $\le$ hạn mức `CashOutApprovalThreshold` (mặc định 200,000 VND hoặc theo cấu hình chi nhánh): Hệ thống MUST tự động ghi nhận phiếu với trạng thái `Recorded` và trừ ngay vào quỹ tiền mặt lý thuyết của ca ($G$).
- Nếu số tiền $>$ `CashOutApprovalThreshold`: Hệ thống MUST hiển thị cảnh báo yêu cầu phê duyệt của Chủ, đổi nút tạo thành "Gửi yêu cầu phê duyệt", tạo phiếu với trạng thái `PendingApproval`. Phiếu này MUST KHÔNG được trừ vào quỹ $G$ cho đến khi được duyệt.
- Nhân viên SHALL có quyền bấm "Hủy yêu cầu" (`Cancelled`) với phiếu của mình khi còn `PendingApproval`.

#### Scenario: Lập phiếu chi nhỏ hơn hoặc bằng hạn mức
GIVEN Ca đang mở có hạn mức duyệt chi là `200,000 VND`
WHEN Nhân viên lập phiếu chi "Mua giấy in bill" số tiền `150,000 VND`
THEN Hệ thống tạo phiếu với trạng thái `Recorded`
AND Tiền lý thuyết trong ca $G$ giảm đi `150,000 VND` ngay lập tức

#### Scenario: Lập phiếu chi vượt hạn mức phê duyệt
GIVEN Ca đang mở có hạn mức duyệt chi là `200,000 VND`
WHEN Nhân viên nhập phiếu chi "Sửa bóng đèn quầy" số tiền `350,000 VND`
THEN Hệ thống hiển thị cảnh báo màu cam và nút "Gửi Yêu Cầu Phê Duyệt"
AND Khi gửi, phiếu được tạo với trạng thái `PendingApproval`
AND Tiền lý thuyết $G$ của ca chưa bị trừ `350,000 VND`
AND Số badge trên chuông của Chủ tăng thêm 1

---

### Requirement: REQ-POS-OWNER-04 Drawer phê duyệt của Chủ cửa hàng và Xác nhận Rút két
Chủ cửa hàng MUST có Drawer `OwnerCashApprovalDrawer` truy cập từ icon Chuông trên Header POS để thực hiện:
- Phê duyệt phiếu chi (`Approve`): Chuyển trạng thái sang `Recorded`, trừ số tiền vào quỹ két của ca hiện hành.
- Từ chối phiếu chi (`Reject`): Yêu cầu nhập lý do từ chối (bắt buộc), chuyển trạng thái sang `Rejected`.
- Xác nhận nhận tiền rút két (`CashDrop` / `confirm-drop`): Đánh dấu đã nhận bàn giao tiền mặt từ nhân viên.
- Cài đặt nhanh hạn mức duyệt chi `CashOutApprovalThreshold`.

#### Scenario: Chủ cửa hàng duyệt phiếu chi vượt hạn mức
GIVEN Có 1 phiếu chi `350,000 VND` đang ở trạng thái `PendingApproval`
WHEN Chủ cửa hàng mở Drawer `OwnerCashApprovalDrawer` và bấm "Phê duyệt"
THEN Trạng thái phiếu đổi thành `Recorded`
AND Quỹ tiền mặt lý thuyết trong ca $G$ được trừ đi `350,000 VND`
AND Badge thông báo giảm đi 1

#### Scenario: Chủ cửa hàng từ chối phiếu chi
GIVEN Có 1 phiếu chi đang ở trạng thái `PendingApproval`
WHEN Chủ cửa hàng bấm "Từ chối" và nhập lý do "Chi không hợp lý"
THEN Trạng thái phiếu đổi thành `Rejected` kèm ghi chú
AND Quỹ tiền mặt lý thuyết trong ca $G$ không bị ảnh hưởng

---

### Requirement: REQ-POS-CLOSE-05 Chốt ca kiểm đếm 9 mệnh giá, đối soát và khóa chốt ca
Khi nhân viên thực hiện chốt ca trong `CloseShiftModal`:
- Hệ thống MUST cung cấp bảng kiểm đếm 9 mệnh giá tiền mặt Việt Nam Đồng (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k) để tự động tính tổng tiền mặt thực tế $H$ (`ActualCashCounted`).
- Hệ thống MUST tự động tính toán đối soát: $G = A + B + C - D - E$ và chênh lệch kết ca $\Delta = H - G$.
- Ràng buộc bất biến tiền mặt (Invariant): Hệ thống MUST xác thực $RetainedFloatAmount + DroppedToSafeAmount == H$. Nếu không khớp, hệ thống MUST khóa nút "Chốt Ca & Bàn Giao".
- Khóa chốt ca khi còn phiếu chờ duyệt: Nếu trong ca còn bất kỳ phiếu chi nào ở trạng thái `PendingApproval`, hệ thống MUST khóa thao tác chốt ca và hiển thị danh sách phiếu cần xử lý (yêu cầu Chủ duyệt/từ chối hoặc Nhân viên bấm "Hủy yêu cầu").

#### Scenario: Nhân viên chốt ca hợp lệ
GIVEN Ca đang mở, không còn phiếu chi nào ở trạng thái `PendingApproval`
AND Tổng kiểm đếm thực tế $H = 5,000,000 VND$
WHEN Nhân viên phân bổ `RetainedFloatAmount = 2,000,000 VND` và `DroppedToSafeAmount = 3,000,000 VND`
THEN Hệ thống kiểm tra $2,000,000 + 3,000,000 == 5,000,000$ (Hợp lệ)
AND Nút "Chốt Ca & Bàn Giao" cho phép bấm
AND Sau khi chốt ca thành công, hiển thị modal Z-Report

#### Scenario: Bị chặn chốt ca do còn phiếu chi chờ duyệt
GIVEN Ca đang mở có 1 phiếu chi `PendingApproval`
WHEN Nhân viên mở modal Chốt ca
THEN Nút "Chốt Ca & Bàn Giao" bị vô hiệu hóa
AND Hiển thị thông báo cảnh báo màu đỏ "Còn phiếu chi chưa được duyệt" kèm nút "Hủy yêu cầu" để nhân viên chủ động giải phóng két nếu cần

---

### Requirement: REQ-POS-CONFIG-06 Cài đặt hạn mức phê duyệt thu chi tại Store Settings
Chủ cửa hàng MUST có khả năng cấu hình `CashOutApprovalThreshold` và `CashOutShiftTotalLimit` tại trang cài đặt chi nhánh / thanh toán (`StorePaymentConfigPage.tsx`).
- Giá trị mặc định: `200,000 VND`.
- Nếu cài đặt `0 VND`: Mọi phiếu chi đều chuyển sang `PendingApproval`.

#### Scenario: Chủ cửa hàng thay đổi hạn mức duyệt chi
GIVEN Chủ cửa hàng ở trang Cài đặt thanh toán chi nhánh
WHEN Cập nhật hạn mức phê duyệt chi két thành `500,000 VND` và bấm Lưu
THEN Cấu hình được lưu trữ vào hệ thống
AND Các phiếu chi từ `500,000 VND` trở xuống tại quầy POS sẽ được tự động ghi nhận mà không cần duyệt

---

## Acceptance Checklist
- [ ] Role check hoạt động chuẩn xác: Owner không bị popup chặn, Cashier bị popup chặn nếu chưa mở ca.
- [ ] Header POS hiển thị icon Chuông + badge số lượng pending đối với Owner; hiển thị trạng thái ca + Thu/Chi két đối với Cashier.
- [ ] Modal mở ca hiển thị đúng $A_{expected}$ kế thừa từ ca trước và cho phép nhập $A$.
- [ ] Modal thu chi két tự động kiểm tra ngưỡng 200k; nếu vượt ngưỡng hiển thị cảnh báo và chuyển thành `PendingApproval`.
- [ ] Drawer duyệt chi của Owner cho phép Duyệt, Từ chối kèm lý do, Xác nhận `CashDrop` và chỉnh nhanh hạn mức.
- [ ] Modal chốt ca có bảng 9 mệnh giá tiền mặt, đối soát $G$ vs $H$, ràng buộc $Retained + Dropped = H$, và chặn chốt ca khi còn phiếu `PendingApproval`.
- [ ] Trang cài đặt thanh toán `StorePaymentConfigPage.tsx` có Card cài đặt hạn mức duyệt chi két.
- [ ] Build Frontend (`npm run build`) và Unit Test Backend (`dotnet test`) đều đạt 100% PASS.
