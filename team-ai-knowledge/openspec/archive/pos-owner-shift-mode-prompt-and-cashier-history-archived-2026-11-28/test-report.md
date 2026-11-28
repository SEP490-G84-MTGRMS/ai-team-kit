---
verdict: PASS
date: 2026-11-10
change: pos-owner-shift-mode-prompt-and-cashier-history
capability: pos-shift-management
tester: "@sonnguyenn10"
---

# Báo Cáo Kiểm Thử (Test Report): pos-owner-shift-mode-prompt-and-cashier-history

## 1. Kết Quả Kiểm Thử Theo Yêu Cầu & Kịch Bản (Traceability Matrix)

| Mã REQ | Kịch bản kiểm thử (Scenario) | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| **REQ-OWNER-SHIFT-MODE-01** | Chủ cửa hàng vào POS tại chi nhánh có ca mở | Hiển thị modal `OwnerShiftModeModal` buộc chọn 1 trong 2 chế độ, chặn bấm ngoài backdrop | Modal hiển thị đúng ca, 2 lựa chọn trực quan, chặn click backdrop | **PASS** |
| **REQ-OWNER-SHIFT-MODE-01** | Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy" | Lưu mode `'attach'` vào `sessionStorage`, Header hiển thị badge `🛒 Bán vào ca #...` | Đơn hàng gửi `shiftId = activeShift.id`, badge cập nhật tức thì | **PASS** |
| **REQ-OWNER-SHIFT-MODE-01** | Chủ cửa hàng chọn "Tự giữ / Cất két sắt" | Lưu mode `'shiftless'` vào `sessionStorage`, Header hiển thị badge `🔒 Bán riêng (Két sắt)` | Đơn hàng gửi `shiftId = null`, tiền vào Két sắt | **PASS** |
| **REQ-OWNER-SHIFT-MODE-01** | Chi nhánh không có ca nào đang mở | Tự động chuyển mode `'shiftless'`, hiển thị badge `🔒 Bán riêng (Chưa có ca)`, không hiện popup | Không bật popup, cho phép bán shiftless bình thường | **PASS** |
| **REQ-OWNER-SHIFT-MODE-01** | Ca bị thu ngân đóng giữa chừng khi chủ đang bán chung ca | Tự động fallback về chế độ bán riêng, xóa session mode cũ, toast thông báo | Bắt lỗi `SHIFT_CLOSED_OR_INVALID` / `SHIFT_CLOSING_LOCKDOWN`, chuyển về `'shiftless'` | **PASS** |
| **REQ-OWNER-SHIFT-ROUTING-02** | Validation `request.ShiftId` tại backend | Từ chối đơn hàng nếu ca không tồn tại hoặc đã đóng / kiểm đếm | Ném `BusinessException("SHIFT_CLOSED_OR_INVALID")` hoặc `"SHIFT_CLOSING_LOCKDOWN"` | **PASS** |
| **REQ-OWNER-SHIFT-ROUTING-02** | Đơn hàng tiền mặt gắn ca mở hợp lệ | Tiền vào tài khoản `Till`, phản ánh vào `ExpectedCash` ca, nạp chủ cửa hàng vào `ShiftParticipants` | Dòng tiền ghi nhận `Till`, participant được ghi nhận đầy đủ | **PASS** |
| **REQ-OWNER-SHIFT-ROUTING-02** | Đơn hàng tiền mặt bán riêng (shiftless) | Tiền vào tài khoản `Safe` (két sắt), không ảnh hưởng ca quầy nhân viên | Dòng tiền ghi nhận `Safe`, `ExpectedCash` ca giữ nguyên | **PASS** |
| **REQ-SHIFT-PARTICIPANT-TRACKING-03** | Tự động nạp nhân viên có lịch trực khi mở ca | Nạp toàn bộ nhân viên được xếp ca trong ngày tại chi nhánh vào `ShiftParticipants` | Đã tích hợp qua `GetBranchCashierSchedulesAsync` trong `OpenShiftAsync` | **PASS** |
| **REQ-SHIFT-PARTICIPANT-TRACKING-03** | Hiển thị đầy đủ nhân viên tham gia ca trên UI | Bảng Lịch sử ca và modal Bàn giao quầy hiển thị đầy đủ badges cho mọi người tham gia | Hiển thị danh sách badges phân tách rõ ràng, không bị cắt cụt | **PASS** |
| **REQ-POS-FONT-STANDARDIZATION-04** | Giá tiền trên thẻ sản phẩm POS | Hiển thị số 0 tròn bình thường, không có dấu chấm ở giữa | Áp dụng `var(--font-sans)` + `tabular-nums` trên `.pos-product-price` | **PASS** |
| **REQ-POS-FONT-STANDARDIZATION-04** | Ô nhập tiền mặt tại các modal POS | Sử dụng font số chuẩn tự nhiên `Be Vietnam Pro`, loại bỏ `font-mono` | Đã gỡ `font-mono`, đổi sang `tabular-nums` trên toàn bộ modal inputs | **PASS** |
| **REQ-POS-FONT-STANDARDIZATION-04** | Template in hóa đơn nhiệt ESC/POS K80/K58 | Giữ nguyên font monospace để các cột SL, đơn giá, thành tiền thẳng hàng | `.pos-receipt-paper` được bảo toàn font monospace | **PASS** |

---

## 2. Nhật Ký Lệnh Kiểm Tra & Biên Dịch (Build & Lint Verification)

### 2.1. Frontend Build (`MT_GRMS_FRONTEND`)
- **Lệnh thực hiện**: `npm --prefix MT_GRMS_FRONTEND run build` (`tsc -b && vite build`)
- **Kết quả**:
  ```text
  ✓ 2590 modules transformed.
  ✓ built in 723ms
  Exit code: 0 (Thành công 100%)
  ```

### 2.2. Frontend Linter (`oxlint`)
- **Lệnh thực hiện**: `npx --prefix MT_GRMS_FRONTEND oxlint <modified_files>`
- **Kết quả**:
  ```text
  Found 0 errors. Finished in 71ms.
  ```

### 2.3. Backend Compilation (`MT_GRMS_BACKEND`)
- **Lệnh thực hiện**:
  - `dotnet build MT_GRMS_BACKEND\src\MT_GRMS.Application\MT_GRMS.Application.csproj` -> `0 Error(s)`, `Build succeeded.`
  - `dotnet build MT_GRMS_BACKEND\src\MT_GRMS.Infrastructure\MT_GRMS.Infrastructure.csproj` -> `0 Error(s)`, `Build succeeded.`

---

## 3. Lỗi Tồn Đọng (Known Issues)
- Không có lỗi tồn đọng (Zero blocking issues).
- Hệ thống hoạt động mượt mà, sẵn sàng chuyển sang bước lưu trữ (`/sep-archive`).
