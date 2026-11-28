---
verdict: PASS
date: 2026-11-08
change: pos-cash-control-and-pos-ux-refinements
schema: bug-fix
tester: Antigravity & @sonnguyenn10
---

# Báo Cáo Kiểm Thử (Test Report) — pos-cash-control-and-pos-ux-refinements

## 1. Kết Luận Chung (Verdict)
- **Kết quả tổng thể**: **PASS**
- **Độ bao phủ**: 10/10 yêu cầu kỹ thuật (REQ-01 đến REQ-10) đều được kiểm thử và xác nhận hoạt động chính xác.
- **Tình trạng lỗi tồn đọng**: Không có (0 regression issues).

---

## 2. Bảng Ma Trận Kiểm Thử Nghiệp Vụ (Requirements Verification Matrix)

| Mã REQ | Kịch bản kiểm thử | Hành vi trước khi sửa | Hành vi sau khi sửa | Kết quả |
|---|---|---|---|---|
| **REQ-POS-UI-CLEANUP-01** | Kiểm tra thanh tiêu đề POS (`PosHeader.tsx`) | Hiển thị 2 nút thừa "Giữ đơn hàng (Recall)" & "In bill gần nhất" gây nhầm lẫn | Đã gỡ bỏ hoàn toàn 2 nút và props thừa, giao diện gọn gàng, trực quan | **PASS** |
| **REQ-POS-CASH-OUT-VALIDATION-02** | Rút tiền / chi vặt vượt quá số tiền mặt trong két quầy | Cho phép xuất quỹ âm tiền mặt két | Backend chặn và quăng lỗi `EXCEED_DRAWER_CASH`; FE hiển thị số dư két và validate chặn bấm xác nhận | **PASS** |
| **REQ-POS-CASH-DEBT-REMOVED-03** | Menu nghiệp vụ trong modal thu chi ca quầy | Hardcode nút `[+] Thu nợ khách hàng` làm thu ngân nhầm lẫn với luồng thanh toán hóa đơn | Đã loại bỏ nút này; luồng thu chi ca chỉ còn nạp tiền lẻ, chi vặt, nộp tiền két | **PASS** |
| **REQ-POS-RETURN-UNIT-CONVERSION-04** | Đổi trả hàng với đơn vị quy đổi và hoàn tiền mặt | Tiêu đề "Chuẩn KiotViet", không có dropdown chọn đơn vị (Unit), không kiểm tra tiền két khi hoàn tiền | Đổi tiêu đề thành "Đổi / Trả Hàng", cho phép chọn đơn vị quy đổi từ `ProductUnits`, tự động tính giá và chặn hoàn tiền mặt nếu két không đủ tiền | **PASS** |
| **REQ-POS-INVOICE-ACCORDION-CLEANUP-05** | Quản lý hóa đơn (`InvoiceManagementPage.tsx`) | Accordion dòng hóa đơn hiển thị lặp 3 nút bấm tác vụ | Đã xóa 3 nút trùng lặp trong accordion chi tiết hóa đơn, thao tác qua nút ở cột ngoài | **PASS** |
| **REQ-POS-SHIFT-GUARD-06** | Màn hình POS khi chưa mở ca (`PosCheckoutPage.tsx`) | Cho phép tạo đơn và thanh toán thành công dù chưa mở ca thu ngân | Chặn hành động thêm món vào giỏ hàng và thanh toán nếu `!currentShift`; hiển thị banner nhắc mở ca | **PASS** |
| **REQ-POS-SHIFT-DETAILS-MODAL-07** | Xem chi tiết ca làm việc (`PosShiftPage.tsx`) | Không có nút xem chi tiết chênh lệch và Z-Report trong bảng lịch sử | Bổ sung nút "Chi tiết" hiển thị modal Z-report đầy đủ doanh thu, phiếu thu/chi và lý do chênh lệch (`differenceReason`) | **PASS** |
| **REQ-POS-OWNER-HANDOVER-HIDDEN-08** | Phân quyền xác nhận nhận ca | Chủ cửa hàng / Admin đăng nhập vẫn thấy nút "Nhận ca" vô nghĩa | Ẩn nút "Nhận ca" đối với vai trò `STORE_OWNER` và `ADMIN`, chỉ hiển thị cho nhân viên thu ngân ca sau | **PASS** |
| **REQ-POS-CASH-CONTROL-CLEANUP-09** | Trang Kiểm Soát Quỹ POS (`StorePosCashControlPage.tsx`) | Hiển thị khối "Ca Làm Việc Chờ Phê Duyệt Bàn Giao" trùng lặp với trang Lịch sử ca | Đã xóa toàn bộ khối trùng lặp và modal khiếu nại bàn giao ca | **PASS** |
| **REQ-POS-DEBT-COLLECTION-SHIFT-10** | Thu nợ khách hàng tại quầy | Thu ngân thu nợ bị hardcode hoặc tiền mặt thu nợ không vào két ca đang trực | Ghi nhận thu ngân hiện tại, tự động tạo `ShiftCashMovement` tăng tiền mặt két ca trực nếu trả bằng tiền mặt, bảo toàn thông tin người tạo đơn gốc | **PASS** |

---

## 3. Kết Quả Kiểm Thử Tự Động (Automated Test Execution)

### 3.1 Backend Unit Tests
- **Lệnh thực hiện**: `dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj`
- **Kết quả**:
  - Test case mới: `AddCashMovement_WhenExpenseExceedsDrawerCash_ThrowsBusinessException` ➔ **PASSED**
  - Tổng số test: **530 Passed, 0 Failed, 0 Skipped** (Duration: 1.0 s)

### 3.2 Backend Integration Tests
- **Lệnh thực hiện**: `dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.IntegrationTests/MT_GRMS.IntegrationTests.csproj`
- **Kết quả**:
  - Tổng số test: **44 Passed, 0 Failed, 0 Skipped** (Duration: 2.0 s)

### 3.3 Frontend Compilation & Type Checking
- **Lệnh thực hiện**: `npm --prefix MT_GRMS_FRONTEND run build` (`tsc -b && vite build`)
- **Kết quả**:
  - Biên dịch thành công 100% không lỗi kiểu dữ liệu (2,579 modules transformed).
  - Production bundle: `dist/assets/index-CN1OW_nI.js` tạo thành công.

---

## 4. Tác Vụ Sau Kiểm Thử
- Backend API daemon đã được khởi động lại thành công phục vụ trải nghiệm của người dùng.
- Hệ thống sẵn sàng lưu trữ (archive).
