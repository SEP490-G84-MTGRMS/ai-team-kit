# Proposal: pos-cash-refund-and-preorder-rules

## Vấn đề
1. Trong màn hình Đổi / Trả hàng, việc đưa ra hình thức chuyển khoản hoặc trừ vào sổ nợ là không sát thực tế: nhân viên thu ngân không có tài khoản ngân hàng của chủ shop để chuyển tiền đi, và khách lẻ không có sổ nợ để cấn trừ.
2. Thiếu quy tắc phân loại tình trạng hàng trả: hàng trả về không phân định rõ giữa hàng còn nguyên vẹn cần nhập lại kho (`Restock`) và hàng hỏng/lỗi/cận hạn cần loại bỏ (`Damaged`), dẫn đến sai lệch số tồn kho khả dụng bán hàng.
3. Thiếu danh mục lý do đổi trả chuẩn hóa để kiểm soát thất thoát và gian lận.
4. Đơn đặt trước (Pre-Order / đặt cọc giữ kho) chưa có chính sách đổi trả / hủy cọc rõ ràng: dễ nhầm lẫn việc cho hoàn tiền mặt tùy tiện với đơn đặt trước, hoặc gây nhân đôi doanh thu giữa tiền cọc và tiền thu thêm lúc bàn giao.

## Mục tiêu
1. Đơn giản hóa và chuẩn hóa 100% hình thức hoàn tiền cho khách qua Két tiền mặt quầy thu ngân (`CASH`). Khi két quầy thiếu tiền mặt, hướng dẫn thu ngân lập phiếu Nạp tiền vào két để đảm bảo dòng tiền vật lý không âm.
2. Bổ sung lựa chọn tình trạng hàng trả (`Restock` vs `Damaged`) cho từng sản phẩm đổi trả.
3. Chuẩn hóa danh mục lý do đổi trả kèm ghi chú bắt buộc.
4. Thiết lập chính sách đổi trả cho đơn đặt trước:
   - Khi chưa nhận hàng: Cho phép đổi sang sản phẩm khác; hủy đơn hoàn cọc (nếu lỗi shop) hoặc mất cọc (nếu khách tự ý hủy ngang).
   - Khi đã bàn giao nhận hàng: Mặc định chỉ cho phép đổi sang sản phẩm khác, không hoàn tiền mặt (trừ trường hợp hàng lỗi/hỏng do nhà sản xuất).

## Phạm vi
### In scope:
- Frontend: Cập nhật `ReturnExchangeModal.tsx` chỉ giữ hình thức hoàn tiền mặt từ két (`CASH`), loại bỏ radio chuyển khoản và sổ nợ.
- Frontend: Bổ sung cảnh báo két thiếu tiền và liên kết nạp tiền két khi số tiền hoàn lớn hơn số dư két.
- Frontend: Bổ sung dropdown danh mục lý do đổi trả và lựa chọn tình trạng hàng trả (`Nhập lại kho` vs `Hỏng/Hủy`).
- Frontend/Backend: Áp dụng quy tắc kiểm soát đơn đặt trước: chỉ cho đổi hàng sau khi đã hoàn tất, không hoàn tiền mặt trừ khi hàng lỗi NSX.
- Backend: Cập nhật API xử lý đổi trả và phiếu cọc nếu cần.

### Out of scope:
- Tự động chi tiền qua cổng API chi hộ của ngân hàng.
- Quy trình cấn trừ công nợ khách buôn phức tạp (`DEBT_OFFSET`).
- Tự động xuất hóa đơn điện tử điều chỉnh.

## Người dùng liên quan
- **Thu ngân (Cashier / Employee)**: Thao tác đổi trả hàng, hoàn tiền mặt tại quầy, lập phiếu nạp két khi thiếu tiền, bàn giao đơn đặt trước.
- **Chủ cửa hàng (Store Owner / Admin)**: Duyệt hủy đơn mất cọc, duyệt phiếu nạp/chi két và theo dõi báo cáo Z-report tiền cọc/hoàn tiền.

## Tiêu chí thành công
- [ ] Giao diện modal Đổi / Trả hàng chỉ còn 1 hình thức hoàn tiền duy nhất: Tiền mặt từ két quầy.
- [ ] Khi két thiếu tiền mặt, hệ thống chặn hoàn tiền và hiển thị hướng dẫn nạp thêm tiền vào két.
- [ ] Từng dòng sản phẩm trả lại có lựa chọn tình trạng: Nhập lại kho (`Restock`) hoặc Hỏng/Hủy (`Damaged`).
- [ ] Bắt buộc chọn lý do đổi trả từ danh mục chuẩn hóa.
- [ ] Đơn hàng xuất phát từ đơn đặt trước khi đem ra đổi trả chỉ cho phép đổi sang món khác, không cho trả lấy tiền mặt trừ khi chọn lý do hàng lỗi NSX.
- [ ] Toàn bộ kiểm thử tự động Frontend và Backend vượt qua 100% không lỗi biên dịch.
