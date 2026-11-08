# EXP-2026-11-08-POS-REFUND: Khảo Sát Nghiệp Vụ Hoàn Tiền Tại Két Quầy & Đổi Trả Đơn Đặt Trước

## 1. Problem Statement (Vấn đề)
1. **Hoàn tiền thiếu thực tế**: Modal Đổi / Trả hàng hiện tại hiển thị các hình thức hoàn tiền qua Chuyển khoản hoặc Sổ nợ. Thực tế tại quầy thu ngân tạp hóa:
   - Thu ngân không có tài khoản ngân hàng của chủ shop để chuyển tiền đi.
   - Khách lẻ không có tài khoản nợ để cấn trừ.
   - Dẫn đến nhầm lẫn và tắc nghẽn giao dịch khi thu ngân không biết xử lý dòng tiền ra sao.
2. **Thiếu kiểm soát tình trạng hàng trả**: Khi khách trả lại hàng, hệ thống chưa cho phép phân loại hàng còn nguyên bao bì nhập lại kho (`Restock`) hay hàng hỏng/lỗi/cận hạn không thể bán lại (`Damaged`), gây sai lệch tồn kho khả dụng bán hàng.
3. **Thiếu chuẩn hóa lý do đổi trả**: Chưa có danh mục lý do cụ thể (lỗi NSX, mua nhầm, đổi ý...), gây khó khăn cho việc kiểm soát gian lận thu ngân.
4. **Mơ hồ về chính sách đổi trả / hủy cọc cho Đơn Đặt Trước (Pre-Order)**:
   - Chưa rõ khi nào đơn đặt trước được đổi hàng, khi nào được hoàn tiền cọc, và khi nào mất cọc.
   - Cần đảm bảo tiền cọc không bị tính trùng hai lần vào doanh thu bán hàng khi khách đến nhận hàng.

## 2. Context & Background (Hiện trạng code liên quan)
- Frontend:
  - `ReturnExchangeModal.tsx`: Đang xử lý đổi hàng và hoàn tiền nhưng còn tồn tại các hình thức chuyển khoản / sổ nợ và thiếu phân loại tình trạng hàng trả (`Restock`/`Damaged`).
  - `CreatePreOrderModal.tsx` & `FulfillPreOrderModal.tsx`: Quản lý đơn đặt cọc và bàn giao hàng tại quầy.
  - `InvoiceManagementPage.tsx`: Danh sách hóa đơn và đơn đặt trước.
- Backend:
  - `ShiftService.cs`: Đã có validation kiểm tra xuất quỹ tiền mặt không vượt quá tiền mặt hiện có trong két quầy.
  - `OrderService.cs`: Xử lý tạo hóa đơn và bàn giao đơn đặt trước.

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
1. Két quầy thu ngân là trung tâm quản lý tiền mặt vật lý tại chi nhánh. Mọi khoản hoàn tiền mặt phải ảnh hưởng đến chỉ số `E` (CashRefund) của ca đang mở.
2. Không sử dụng API chi hộ ngân hàng (nằm ngoài phạm vi hệ thống).
3. Không làm lệch tồn kho thực tế và tồn kho khả dụng đối với hàng hỏng/hủy.
4. Tuân thủ Clean Architecture và TypeScript type-safety (0 warning, 0 error).

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Cửa hàng luôn có tiền mặt trong két quầy; nếu thiếu, thu ngân phải lập phiếu Nạp tiền vào két trước khi xuất tiền hoàn trả.
- **[ASSUMPTION-02]**: Hàng đặt trước là hàng giữ kho đặc biệt, khi đã bàn giao chỉ cho phép đổi sang hàng khác, không cho trả lấy lại tiền mặt (trừ trường hợp hàng lỗi do NSX).
- **[ASSUMPTION-03]**: Khách hủy đơn đặt trước do lỗi cửa hàng thì được hoàn 100% tiền cọc; khách tự ý hủy thì mất cọc (thu nhập phạt cọc của cửa hàng).

## 5. Scope & Non-Goals
### In Scope
- Đơn giản hóa hình thức hoàn trả: 100% qua Két tiền mặt quầy thu ngân (`CASH`).
- Cảnh báo nạp tiền két khi số dư tiền mặt không đủ để hoàn trả.
- Bổ sung phân loại tình trạng hàng trả: `Nhập lại kho (Restock)` vs `Hỏng/Hủy (Damaged)`.
- Bổ sung danh mục lý do đổi trả chuẩn hóa kèm ô ghi chú.
- Chính sách đổi trả và hủy cọc cho Đơn đặt trước.

### Non-Goals (Ngoài phạm vi)
- Tích hợp cổng chuyển tiền chi hộ tự động của ngân hàng.
- Xử lý bù trừ sổ nợ phức tạp cho khách sỉ/buôn (`DEBT_OFFSET`).
- Tự động xuất hóa đơn điện tử điều chỉnh VAT.

## 6. Đánh Giá Các Phương Án (Options Comparison)
- **Phương án 1 (Hỗ trợ đa kênh: Tiền mặt + Chuyển khoản chờ chủ duyệt + Sổ nợ)**:
  - *Ưu điểm*: Nhiều lựa chọn trên lý thuyết.
  - *Nhược điểm*: Phức tạp hóa luồng vận hành, thu ngân phải xin STK ngân hàng của khách, giao dịch bị treo chờ chủ duyệt, dễ phát sinh tranh chấp và lệch két.
- **Phương án 2 (Đơn giản hóa tối đa: Hoàn tiền mặt duy nhất từ Két quầy, thiếu thì nạp két)** *(ĐƯỢC CHỌN)*:
  - *Ưu điểm*: Cực kỳ gọn gàng, thực tế 100% với tạp hóa nhỏ. Tiền mặt đối soát tức thì tại quầy, không lo treo đơn. Dòng tiền két luôn chuẩn chỉ vì có guard chặn rút âm.
  - *Nhược điểm*: Khi két thiếu tiền, thu ngân cần thao tác thêm bước Nạp tiền vào két. Tuy nhiên bước này đảm bảo tiền mặt thực tế luôn khớp với sổ sách.

## 7. Rủi Ro & Biện Pháp Giảm Thiểu
- **Rủi ro**: Thu ngân lạm dụng tính năng hoàn tiền mặt để rút tiền két trái phép.
- **Biện pháp**: Bắt buộc chọn Lý do đổi trả từ danh mục chuẩn hóa, lưu đầy đủ audit log nhân viên thực hiện, ca trực, hóa đơn gốc và kiểm tra hạn mức xuất tiền.
