# Danh sách công việc (Tasks) — pos-cash-control-and-pos-ux-refinements

- [ ] T1: Backend: Cập nhật `ShiftService.AddCashMovementAsync` kiểm tra số tiền chi `OUT` không được vượt quá số tiền mặt hiện có trong két quầy [REQ-POS-CASH-OUT-VALIDATION-02]
- [ ] T2: Frontend: Xóa nút "Giữ đơn hàng (Recall)" và "In bill gần nhất" trong `PosHeader.tsx` & dọn dẹp các props liên quan trong `PosCheckoutPage.tsx` [REQ-POS-UI-CLEANUP-01]
- [ ] T3: Frontend: Cập nhật `CashMovementModal.tsx` xóa nút "[+] Thu nợ khách hàng", validate số tiền chi không vượt quá tiền mặt hiện có trong két quầy [REQ-POS-CASH-OUT-VALIDATION-02, REQ-POS-CASH-DEBT-REMOVED-03]
- [ ] T4: Frontend: Cập nhật `ReturnExchangeModal.tsx` đổi tên thành "Đổi / Trả Hàng", bổ sung dropdown chọn đơn vị quy đổi từ `ProductUnits`, tự động tính toán giá và số lượng, validate tiền mặt két khi hoàn tiền mặt [REQ-POS-RETURN-UNIT-CONVERSION-04]
- [ ] T5: Frontend: Xóa 3 nút trùng lặp (`Đổi / Trả Hàng`, `Hủy Hóa Đơn Này`, `In Hóa Đơn Nhiệt K80`) trong accordion chi tiết hóa đơn tại `InvoiceManagementPage.tsx` [REQ-POS-INVOICE-ACCORDION-CLEANUP-05]
- [ ] T6: Frontend: Bổ sung guard chặn thanh toán và thêm món hàng trên `PosCheckoutPage.tsx` khi chưa mở ca (`!currentShift`), hiển thị banner/modal yêu cầu mở ca [REQ-POS-SHIFT-GUARD-06]
- [ ] T7: Frontend: Cập nhật `PosShiftPage.tsx` bổ sung modal "Xem chi tiết phiên ca" (Z-Report, lý do chênh lệch, danh sách phiếu thu/chi) và ẩn nút "Nhận ca" đối với vai trò `STORE_OWNER` / `ADMIN` [REQ-POS-SHIFT-DETAILS-MODAL-07, REQ-POS-OWNER-HANDOVER-HIDDEN-08]
- [ ] T8: Frontend: Xóa khối "Ca Làm Việc Chờ Phê Duyệt Bàn Giao" trong `StorePosCashControlPage.tsx` [REQ-POS-CASH-CONTROL-CLEANUP-09]
- [ ] T9: Frontend: Cập nhật `CollectDebtModal.tsx` và `InvoiceManagementPage.tsx` lấy `cashierName` từ `user?.fullName`, ghi nhận tiền thu nợ tiền mặt vào ca mở của thu ngân đang trực quầy [REQ-POS-DEBT-COLLECTION-SHIFT-10]
- [ ] T10: Testing & Verification: Chạy kiểm thử tự động backend (`dotnet test`) và kiểm tra build frontend (`npm run build`) đảm bảo 100% pass và không có lỗi biên dịch [Toàn bộ REQ]
