# Khám Phá (Exploration): Giao Diện Chốt Ca/Mở Ca POS, Phân Quyền Chủ Shop vs Nhân Viên, Duyệt Chi & Cài Đặt Hạn Mức

## 1. Hiện Trạng Codebase (Context & Background)
- **Backend**: Đã hoàn thành các Entity `ShiftZReport`, `ShiftCashMovement`, `Order.ShiftId`, `ShiftService`, `ShiftsController` (8 endpoints cơ bản).
- **Frontend**: Màn hình `PosShiftPage.tsx` hiện tại đang dùng dữ liệu Mock tĩnh, chưa kết nối API thực tế của Backend.
- **Vấn đề cốt lõi**:
  - Chủ cửa hàng (Store Owner) vào POS bán hàng bị vướng popup mở ca và nút chốt ca của nhân viên.
  - Thiếu luồng phê duyệt phiếu chi vượt hạn mức (mặc định 200.000đ) của Chủ.
  - Thiếu giao diện để Chủ xác nhận nhận tiền rút két `CashDrop`.
  - Màn hình chốt ca chưa khóa khi còn phiếu chi `PendingApproval`.

---

## 2. Giả Định (Assumptions) & Ràng Buộc (Constraints)
- **[ASSUMPTION-01]**: Quyền vai trò được xác định qua `useAuthStore().user?.role`:
  - `STORE_OWNER` / `ADMIN`: Chủ cửa hàng.
  - `CASHIER` / `EMPLOYEE`: Nhân viên thu ngân.
- **[ASSUMPTION-02]**: Hạn mức duyệt chi mặc định là **200.000 VNĐ**. Nếu cài đặt `0 VNĐ`, mọi phiếu chi của nhân viên đều chuyển sang `PendingApproval`.
- **[ASSUMPTION-03]**: Phiếu chi chờ duyệt (`PendingApproval`) **không được trừ vào két tiền mặt** (không ảnh hưởng $G$) cho đến khi Chủ bấm Duyệt (`Recorded`).
- **[ASSUMPTION-04]**: Đơn hàng do Chủ tạo khi tại quầy đang có ca nhân viên mở sẽ được gắn `ShiftId` của ca đó (kèm `CreatedBy = Owner`) để tiền mặt không bị lệch thừa khi nhân viên chốt ca.

---

## 3. Phạm Vi & Những Việc Không Làm (Scope & Non-Goals)
### In Scope
- API Client `posShiftApi.ts` kết nối đầy đủ các nghiệp vụ ca POS.
- Backend bổ trợ: API duyệt chi, từ chối chi, hủy phiếu, xác nhận rút két và cấu hình hạn mức chi.
- Frontend:
  - Header POS phân quyền: Chủ có chuông duyệt chi + badge; Nhân viên có trạng thái ca + nút Thu/Chi + Chốt ca.
  - Modal mở ca `OpenShiftModal` (chuỗi tiền ca trước).
  - Modal thu/chi `CashMovementModal` (cảnh báo vượt 200k, đổi nút thành *Gửi yêu cầu*).
  - Drawer duyệt chi cho Chủ `OwnerCashApprovalDrawer` (Duyệt, Từ chối kèm lý do, Xác nhận `CashDrop`, Cài đặt hạn mức nhanh).
  - Modal chốt ca `CloseShiftModal` (kiểm đếm 9 mệnh giá, đối soát $A \to H$, Invariant $Retained + Dropped = H$, chặn chốt ca nếu còn phiếu chờ duyệt).
  - Trang cài đặt hạn mức duyệt chi tại `StorePaymentConfigPage.tsx`.

### Out of Scope (Non-Goals)
- Phân quyền duyệt chi theo nhiều cấp bậc phức tạp (chỉ 1 cấp duy nhất: Chủ duyệt).
- Đính kèm file ảnh hóa đơn chứng từ vào phiếu chi.
- Chế độ offline sync phiếu chi vượt mức khi mất mạng hoàn toàn.

---

## 4. Các Phương Án Kỹ Thuật (Trade-off Analysis)

### Phương Án 1: Tách Thành 2 Trang POS Riêng Biệt Cho Chủ Và Nhân Viên
- **Ưu điểm**: Code cô lập, không sợ if/else vai trò.
- **Nhược điểm**: Nhân đôi code giao diện bán hàng (cart, catalog, barcode, thanh toán VietQR), khó bảo trì khi đổi tính năng bán hàng chung.

### Phương Án 2: Sử Dụng Chung Trang POS Hiện Tại, Điều Khiển Trải Nghiệm Qua Role-Based Conditional Rendering & Drawer Quản Trị (CHỌN)
- **Ưu điểm**:
  - Tái sử dụng 100% logic bán lẻ, giỏ hàng, máy quét mã vạch và cổng thanh toán đã có.
  - Chủ đăng nhập: ẩn popup mở ca, ẩn nút chốt ca, hiển thị icon chuông thông báo duyệt chi.
  - Nhân viên đăng nhập: hiện popup mở ca, hiển thị nút Thu/Chi, Chốt ca.
  - Trải nghiệm liền mạch và nhẹ nhàng, đúng tinh thần *Simplicity First*.
- **Nhược điểm**: Cần kiểm soát chặt chẽ điều kiện render và store trạng thái ca (`useShiftStore`).

---

## 5. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)
1. **Rủi ro rò rỉ quyền**: Client có thể tự gửi `Status = Recorded` để qua mặt hạn mức duyệt.
   - *Biện pháp*: Backend là nơi duy nhất quyết định `Status` dựa trên `Amount` và `CashOutApprovalThreshold`. Client không có quyền can thiệp vào `Status`.
2. **Rủi ro tranh chấp bàn giao tiền**:
   - *Biện pháp*: Bắt buộc Invariant $Retained + Dropped == ActualCashCounted (H)$ ở cả Client và Server. Cho phép người ca sau ghi nhận khiếu nại `DISPUTED` nếu phát hiện thiếu tiền.
3. **Rủi ro treo ca khi chủ vắng mặt**: Nhân viên hết ca nhưng còn phiếu chi chờ duyệt.
   - *Biện pháp*: Cho phép nhân viên chủ động **Hủy yêu cầu chi** của chính mình (`Cancelled`) để giải phóng két và tiến hành chốt ca kịp giờ giao ca.
