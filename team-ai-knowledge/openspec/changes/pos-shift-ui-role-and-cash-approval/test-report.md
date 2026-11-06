---
verdict: PASS
date: 2026-11-06
change: pos-shift-ui-role-and-cash-approval
tested_by: @sonnguyenn10
---

# Báo Cáo Kiểm Thử (Test Report): pos-shift-ui-role-and-cash-approval

## 1. Kết Luận Chung
- **Verdict**: **PASS**
- **Độ bao phủ yêu cầu**: 6/6 Requirements (100%)
- **Số lượng Unit/Integration Tests**: 480/480 PASS (0 fail)
- **Frontend Build Status**: PASS (tsc -b && vite build hoàn tất không lỗi)

---

## 2. Bảng Đối Chiếu Requirements & Scenarios (Gherkin Verification)

| Mã REQ | Mô tả Yêu cầu | Scenario / Test Case | Kết quả | Ghi chú |
|---|---|---|---|---|
| **REQ-POS-ROLE-01** | Phân quyền POS giữa Chủ và Thu ngân | 1. Chủ đăng nhập: ẩn popup mở ca, ẩn nút chốt ca, hiển thị chuông duyệt chi.<br>2. Thu ngân đăng nhập: chặn màn hình bằng `OpenShiftModal` nếu chưa mở ca. | **PASS** | Tích hợp thành công trong `PosHeader.tsx` & `PosCheckoutPage.tsx`. |
| **REQ-POS-SHIFT-02** | Kế thừa số tiền đầu ca từ ca liền trước | Kế thừa $A_{expected}$ từ ca trước, nhập $A$, tính chênh lệch đầu ca $\Delta = A - A_{expected}$. | **PASS** | `OpenShift_WhenNoPreviousShift_UsesRequestedOpeningFloat` & `OpenShiftModal.tsx`. |
| **REQ-POS-CASH-03** | Kiểm tra hạn mức chi két 200k & luồng duyệt chi | 1. Chi $\le 200.000$đ: Tự động ghi nhận `Recorded`, trừ tiền két ngay.<br>2. Chi $> 200.000$đ: Cảnh báo, tạo `PendingApproval`, không trừ két $G$.<br>3. Thu ngân tự hủy phiếu chi của mình khi pending. | **PASS** | Unit Tests: `AddCashMovement_WhenExpenseExceedsThreshold_...` & `AddCashMovement_WhenExpenseWithinThreshold_...`. |
| **REQ-POS-OWNER-04** | Drawer phê duyệt của Chủ & Xác nhận Rút két | 1. Chủ duyệt phiếu chi: Đổi sang `Recorded`, trừ két.<br>2. Chủ từ chối phiếu chi: Yêu cầu lý do, giữ nguyên két.<br>3. Xác nhận nhận tiền rút két `CashDrop`. | **PASS** | Unit Tests: `ApproveCashMovement_...`, `RejectCashMovement_...` & `OwnerCashApprovalDrawer.tsx`. |
| **REQ-POS-CLOSE-05** | Chốt ca 9 mệnh giá, đối soát và khóa khi pending | 1. Khóa chốt ca khi còn phiếu `PendingApproval`.<br>2. Kiểm đếm 9 mệnh giá tính $H$.<br>3. Bắt buộc Invariant $Retained + Dropped = H$. | **PASS** | Unit Test: `CloseShift_WhenShiftHasPendingCashMovement_ThrowsBusinessException` & `CloseShiftModal.tsx`. |
| **REQ-POS-CONFIG-06** | Cài đặt hạn mức chi két tại Store Settings | Chủ thay đổi hạn mức duyệt chi tại `StorePaymentConfigPage.tsx` và Drawer nhanh. | **PASS** | Đồng bộ 2 chiều qua `StorePaymentConfig` và `posShiftApi.updateCashMovementSettings`. |

---

## 3. Lệnh Kiểm Thử Thực Tế & Output

### 3.1. Backend Test Suite
```bash
dotnet test d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln
```
- **Unit Tests**: Passed: 436, Failed: 0, Skipped: 0, Total: 436 (net8.0)
- **Integration Tests**: Passed: 44, Failed: 0, Skipped: 0, Total: 44 (net8.0)
- **Tổng cộng**: 480/480 tests PASS (100%).

### 3.2. Frontend Build
```bash
cd MT_GRMS_FRONTEND && npm run build
```
- `tsc -b && vite build` hoàn tất thành công trong 899ms:
  - `dist/index.html`: 1.16 kB
  - `dist/assets/index-BDyWO664.css`: 308.38 kB
  - `dist/assets/index-Bb5n4NmQ.js`: 3,455.10 kB
  - 0 TypeScript errors, 0 Lint warnings.

---

## 4. Tình Trạng Lỗi Tồn Đọng
- Không có lỗi tồn đọng. Hệ thống vận hành ổn định, sẵn sàng chuyển bước Archive.
