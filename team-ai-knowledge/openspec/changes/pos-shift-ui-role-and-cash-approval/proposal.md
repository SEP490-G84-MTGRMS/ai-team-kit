# Đề Xuất (Proposal): Giao Diện Chốt Ca/Mở Ca POS, Phân Quyền Chủ Shop vs Nhân Viên, Duyệt Chi & Cài Đặt Hạn Mức

## 1. Vấn Đề
1. Giao diện Quản lý Ca POS hiện tại (`PosShiftPage.tsx`) vẫn đang sử dụng dữ liệu Mock tĩnh sơ khai, chưa kết nối với API thực tế của Backend (`/api/pos/shifts`).
2. Chưa phân biệt trải nghiệm giữa **Chủ cửa hàng (Store Owner)** và **Nhân viên thu ngân (Cashier/Employee)**: Chủ cửa hàng khi vào quầy bán hàng vẫn bị vướng các thao tác mở ca / chốt ca rườm rà.
3. Chưa có cơ chế kiểm soát chi phí tiền mặt tại quầy:
   - Phiếu thu (`CashTopUp`) và phiếu chi trong hạn mức cần tự duyệt và có hiệu lực ngay.
   - Phiếu chi vượt hạn mức do Chủ cài đặt (mặc định 200.000đ) chưa có luồng gửi yêu cầu chờ duyệt (`PendingApproval`) và chưa có giao diện cho Chủ duyệt/từ chối.
   - Phiếu rút két nộp chủ (`CashDrop`) chưa có luồng để Chủ xác nhận đã nhận tiền mặt.
4. Màn hình Chốt ca chưa liên kết chặt chẽ ràng buộc toàn vẹn tài chính:
   - Chưa chặn đóng ca khi còn yêu cầu chi đang chờ duyệt.
   - Chưa hỗ trợ Chủ cài đặt mức duyệt chi linh hoạt (`CashOutApprovalThreshold`, `CashOutShiftTotalLimit`).

---

## 2. Mục Tiêu
1. **Phân quyền trải nghiệm POS rõ rệt theo vai trò**:
   - **Chủ cửa hàng (Store Owner)**: Bán hàng tự do, không bắt buộc mở ca, không popup mở ca, ẩn nút Mở ca/Chốt ca/Thu chi trên thanh bán hàng. Có icon chuông thông báo kèm badge đỏ để duyệt nhanh các yêu cầu chi vượt mức và xác nhận rút két.
   - **Nhân viên (Cashier/Employee)**: Bắt buộc mở ca (kế thừa số tiền ca trước), có nút Thu/Chi két, bắt buộc chốt ca kiểm đếm tiền cuối ca.
2. **Cơ chế Thu/Chi két & Phê duyệt chi phí theo hạn mức**:
   - Phiếu thu: Hiệu lực ngay.
   - Phiếu chi $\le$ Hạn mức (mặc định 200.000đ): Tự duyệt, trừ ngay vào két.
   - Phiếu chi $>$ Hạn mức: Trạng thái `PendingApproval`, hiển thị cảnh báo *"Vượt hạn mức X đ, cần chủ duyệt"*, nút chuyển thành *Gửi yêu cầu*, không trừ vào két cho đến khi Chủ duyệt.
   - Nhân viên có quyền hủy yêu cầu của mình khi đang chờ duyệt.
3. **Màn hình Chốt ca & Invariant**:
   - Kiểm đếm 9 mệnh giá tiền mặt ($H$).
   - Đối chiếu $A \to H$, chênh lệch $\Delta = H - G$.
   - Bắt buộc Invariant: $RetainedFloatAmount + DroppedToSafeAmount == ActualCashCounted (H)$.
   - Chặn đóng ca nếu còn yêu cầu chi đang chờ duyệt.
4. **Cấu hình hạn mức duyệt chi cho Chủ**:
   - Cho phép Chủ cài đặt `CashOutApprovalThreshold` (mức chi tối đa nhân viên tự duyệt) và `CashOutShiftTotalLimit` (tùy chọn).

---

## 3. Phạm Vi

### In-scope
- **Tầng API Client Frontend (`posShiftApi.ts`)**:
  - Tích hợp các endpoints Backend: mở ca, ca hiện tại, chi tiết ca, tạo phiếu thu chi, hủy phiếu chờ duyệt, chốt ca, xác nhận bàn giao ca, báo cáo Z-Report, lịch sử ca.
  - Tích hợp các endpoints duyệt chi của Chủ: danh sách chờ duyệt, duyệt chi, từ chối chi, xác nhận rút két `CashDrop`, đọc/cập nhật cấu hình mức duyệt chi.
- **Tầng Backend Cập Nhật Bổ Trợ**:
  - Thêm API cấu hình mức duyệt chi `GET / PUT /api/pos/settings/cash-movement`.
  - Thêm API duyệt/từ chối/hủy phiếu chi `POST /api/pos/cash-movements/{id}/approve`, `reject`, `cancel`, `confirm-drop`.
  - Cập nhật ràng buộc chặn đóng ca nếu còn phiếu `PendingApproval`.
- **Giao diện POS Bán Hàng & Header**:
  - Phân quyền theo vai trò `user.role` (`STORE_OWNER` vs `EMPLOYEE`/`CASHIER`).
  - Modal mở ca `OpenShiftModal`, Modal thu chi `CashMovementModal`, Drawer duyệt chi cho Chủ `OwnerCashApprovalDrawer`.
  - Màn hình Chốt ca `CloseShiftModal` & In báo cáo `ZReportModal`.
  - Thiết lập mức duyệt chi trong `StorePaymentConfigPage.tsx` và popup cài đặt nhanh của Chủ.

### Out-of-scope
- Duyệt chi nhiều cấp / ma trận duyệt nhiều người.
- Đính kèm ảnh hóa đơn chứng từ vào phiếu chi.
- Phân quyền hạn mức chi riêng biệt cho từng nhân viên cụ thể.

---

## 4. Người Dùng Liên Quan
- **Nhân viên thu ngân (Cashier / Employee)**: Mở ca, tạo phiếu thu, tạo phiếu chi trong hạn mức, gửi yêu cầu chi vượt mức, chốt ca và bàn giao ca.
- **Chủ cửa hàng (Store Owner)**: Bán hàng không rào cản, duyệt/từ chối yêu cầu chi vượt hạn mức của nhân viên, xác nhận nhận tiền rút két, cài đặt hạn mức duyệt chi.

---

## 5. Tiêu Chí Thành Công
1. Đăng nhập tài khoản Chủ shop (`STORE_OWNER`) vào POS: Bán hàng bình thường, không có popup mở ca, không thấy nút Thu/Chi/Chốt ca. Có chuông thông báo duyệt chi kèm badge số lượng.
2. Đăng nhập tài khoản Nhân viên (`EMPLOYEE`): Chưa mở ca bị chặn bán; mở ca kế thừa đúng số tiền ca trước để lại ($OpeningFloatExpected$).
3. Nhân viên tạo phiếu chi $\le 200.000$đ ➔ `Recorded` ngay; tạo chi $> 200.000$đ ➔ `PendingApproval`, hiển thị cảnh báo và nút đổi thành *Gửi yêu cầu*. Tiền lý thuyết $G$ không đổi cho đến khi được duyệt.
4. Màn hình Chốt ca: Khóa nút chốt ca nếu còn phiếu chờ duyệt; kiểm soát chặt chẽ $Retained + Dropped = H$.
5. Chủ shop duyệt phiếu chi ➔ Phiếu thành `Recorded`, $G$ giảm đúng số tiền; nếu Từ chối bắt buộc có lý do.
6. Chủ shop xác nhận phiếu rút két `CashDrop` thành công.
7. Chủ shop đổi hạn mức duyệt chi (ví dụ 500k hoặc 0đ) có hiệu lực tức thì cho các phiếu tạo mới.
8. `npm run build` thành công, 0 lỗi TypeScript/Vite; Backend test suites 100% PASS.
