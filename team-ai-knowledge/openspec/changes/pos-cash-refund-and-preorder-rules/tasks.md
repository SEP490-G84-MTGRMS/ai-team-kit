# Tasks: pos-cash-refund-and-preorder-rules

## Backend / DTOs
- [ ] T1 — Cập nhật ReturnOrderRequest và ReturnOrderItemRequest để hỗ trợ condition ('Restock' | 'Damaged') và reason ('DEFECTIVE' | 'WRONG_ITEM' | 'CHANGE_MIND' | 'EXPIRED_NEAR_DATE' | 'OTHER') (REQ-POS-RETURN-LINE-CONDITION-01, REQ-POS-RETURN-REASON-MANDATORY-02)
- [ ] T2 — Kiểm tra ràng buộc tiền két ca làm việc khi hoàn tiền mặt và ghi nhận chi két CashRefund (REQ-POS-RETURN-UNIT-CONVERSION-04)

## Frontend UI Components
- [ ] T3 — Cập nhật `ReturnExchangeModal.tsx`: Loại bỏ hoàn tiền bằng Chuyển khoản (VietQR) và Cấn trừ sổ nợ; cố định phương thức hoàn là "Tiền mặt từ két quầy" (REQ-POS-RETURN-UNIT-CONVERSION-04)
- [ ] T4 — Kiểm tra số dư két ca (`activeShiftCash`): Nếu số dư < tiền cần hoàn, hiển thị cảnh báo đỏ và khóa nút hoàn tất, gợi ý nạp két (REQ-POS-RETURN-UNIT-CONVERSION-04)
- [ ] T5 — Thêm dropdown chọn tình trạng hàng trả: `Restock` (Nhập lại kho) vs `Damaged` (Hàng hỏng/chờ hủy) cho từng dòng sản phẩm khách trả (REQ-POS-RETURN-LINE-CONDITION-01)
- [ ] T6 — Thêm trường bắt buộc chọn Lý do đổi trả hàng và ghi chú chi tiết trong `ReturnExchangeModal.tsx` (REQ-POS-RETURN-REASON-MANDATORY-02)
- [ ] T7 — Ràng buộc đơn đặt trước đã hoàn thành (Tab 1 Hóa Đơn Bán Lẻ): Chỉ cho phép Đổi hàng (Exchange), chặn Trả hàng hoàn tiền mặt trừ khi lý do là lỗi NSX (REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03)

## Test & Verification
- [ ] T8 — Chạy kiểm thử tự động, build và kiểm tra lint cả 2 repo (dotnet build, npm run build) (REQ-POS-RETURN-UNIT-CONVERSION-04, REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03)
