# Đề xuất Refactor: Tối ưu Bố cục Màn hình Bán hàng POS (Màn hình cảm ứng & Giỏ hàng)

## 1. Vấn đề của hiện trạng (Problem Statement)
- **Chế độ Bán thường chèn ép giỏ hàng:** Hiện tại, `PosCatalogGrid` đang được render nằm trực tiếp bên dưới `PosCartTable` trong `.pos-left-column`. Khi bật chế độ Bán thường, lưới danh mục sản phẩm chiếm gần 50% chiều cao khiến bảng giỏ hàng bị co lại, chỉ nhìn được 3-4 mặt hàng.
- **Sức chứa hiển thị giỏ hàng bị hạn chế:** Bảng giỏ hàng `.pos-table-responsive` đang bị giới hạn `max-height: 380px` và đệm dòng lớn, thu ngân thao tác bán lẻ các đơn nhiều mặt hàng thường xuyên phải cuộn chuột, khó kiểm tra tổng thể giỏ hàng.
- **Cột thanh toán bên phải bị hẹp và tràn đáy:** Cột `.pos-right-column` hiện có `width: 390px` quá hẹp so với mật độ thông tin dày đặc (Khách hàng định danh, Hạn mức & số dư nợ, 6 dòng tính tiền hóa đơn, 3 hình thức thanh toán, tiền khách đưa/tiền thừa và nút THANH TOÁN lớn). Điều này khiến các khối bị ép dài xuống dưới, gây tràn màn hình và buộc thu ngân phải cuộn trang liên tục.

## 2. Mục tiêu (Goals)
1. **Chuyển Bán thường thành Popup/Modal tiện lợi:** Đưa toàn bộ lưới sản phẩm danh mục cảm ứng (`PosCatalogGrid`) vào Popup/Modal độc lập. Thu ngân bấm phím tắt `F3` hoặc click nút "Bán thường" để mở popup chọn nhanh món đồ, chọn xong nhấn "Đóng" (✕ / phím `ESC`) là popup đóng lại, trả lại 100% diện tích làm việc cho giỏ hàng.
2. **Mở rộng bảng giỏ hàng hiển thị $\ge$ 7 sản phẩm:** Bảng danh sách mặt hàng tận dụng toàn bộ chiều cao cột trái, tối ưu padding dòng để hiển thị rõ ràng từ 7 đến 8 dòng sản phẩm cùng lúc mà không bị cắt cụt.
3. **Mở rộng và tối ưu chiều rộng cột thanh toán bên phải:** Điều chỉnh chiều rộng `.pos-right-column` (tăng lên ~450px - 460px), tối ưu hóa padding, margin và khoảng cách giữa các khối (Khách hàng, Tính tiền, Hình thức thanh toán) để toàn bộ cụm thanh toán hiển thị gọn gàng trong khung nhìn, không bị thụt tràn xuống đáy màn hình.

## 3. Phạm vi (Scope)
- **Trong phạm vi (In-scope):**
  - Tái cấu trúc layout trong `PosCheckoutPage.tsx`, `pos.css`.
  - Tách/bọc `PosCatalogGrid` vào Modal popup (`PosCatalogModal` hoặc modal wrapper chuẩn MT-GRMS).
  - Tinh chỉnh CSS `.pos-cart-section`, `.pos-table-responsive`, `.pos-cart-table` để đạt sức chứa $\ge 7$ sản phẩm.
  - Tinh chỉnh CSS `.pos-right-column`, `.pos-payment-panel`, các thẻ `fieldset` và bảng tính tiền để giao diện cân đối, chống tràn màn hình.
  - Đảm bảo phím tắt `F3` (toggle catalog popup), `ESC` (đóng popup) hoạt động mượt mà.
- **Ngoài phạm vi (Out-of-scope):**
  - Không thay đổi nghiệp vụ tính tiền, công thức giảm giá, tích điểm hay logic kiểm tra nợ.
  - Không thay đổi API backend hay DB schema.

## 4. Người dùng liên quan (Target Users)
- Thu ngân quầy POS (`CASHIER`) và Chủ cửa hàng (`STORE_OWNER`) trực tiếp thao tác bán hàng tại quầy.

## 5. Tiêu chí thành công (Success Criteria)
1. Khi bấm "Bán thường" hoặc phím `F3`, danh mục sản phẩm cảm ứng mở lên dưới dạng Popup/Modal; thêm món vào giỏ hàng ngay lập tức; đóng popup bằng nút ✕ hoặc phím `ESC`.
2. Bảng giỏ hàng ở màn hình chính hiển thị rõ ràng, thoải mái $\ge 7$ sản phẩm mà không bị che khuất.
3. Cột thanh toán bên phải có chiều rộng thông thoáng, toàn bộ các thông tin từ thông tin quầy, khách hàng, chiết khấu, phương thức thanh toán đến nút THANH TOÁN nằm trọn vẹn trong màn hình.
4. Dự án build thành công (`npm run build`), không có lỗi TypeScript hay xung đột layout.
