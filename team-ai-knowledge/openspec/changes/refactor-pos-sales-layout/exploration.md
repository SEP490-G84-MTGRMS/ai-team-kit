# Khảo sát & Đánh giá Phương án: Tối ưu Bố cục Màn hình Bán hàng POS

## 1. Hiện trạng Code & Bản đồ ảnh hưởng
- **File bị ảnh hưởng chính:**
  - `src/features/pos/pages/PosCheckoutPage.tsx`: Chứa state `salesMode`, việc render điều kiện của `PosCatalogGrid`, các modal và layout split 2 cột.
  - `src/features/pos/components/PosCatalogGrid.tsx`: Lưới sản phẩm cảm ứng, phân trang và bộ lọc danh mục.
  - `src/features/pos/components/PosCartTable.tsx`: Bảng giỏ hàng hiển thị danh sách sản phẩm trong hóa đơn.
  - `src/features/pos/components/PosPaymentPanel.tsx`: Cột thanh toán, tính tiền, chọn phương thức thanh toán.
  - `src/features/pos/pos.css`: Định nghĩa CSS layout `.pos-main-body`, `.pos-left-column`, `.pos-right-column`, `.pos-table-responsive`, `.pos-payment-panel`.

## 2. Giả định & Bất biến (Invariants)
- Giữ nguyên 100% logic thêm sản phẩm vào giỏ (`handleAddToCart`), cập nhật số lượng, chiết khấu, áp dụng coupon và tính tiền hóa đơn.
- Giữ nguyên các phím tắt cốt lõi: `F1` (Thêm tab hóa đơn mới), `F2` (Tìm kiếm barcode/SKU), `F3` (Bật/tắt Bán thường), `F4` (Tìm khách hàng), `F8` (Tiền mặt), `ESC` (Đóng modal).
- Không ảnh hưởng đến dữ liệu mock hoặc API kết nối backend.

## 3. So sánh các Phương án Kỹ thuật

| Tiêu chí | Phương án 1: Modal Dialog Độc lập (Đề xuất) | Phương án 2: Off-canvas Drawer trượt ngang |
|---|---|---|
| **Cơ chế hiển thị** | Bọc `PosCatalogGrid` vào Modal `pos-modal-overlay` trung tâm màn hình, mở khi bấm F3/Bán thường, đóng khi bấm ✕/ESC/Xong. | Dùng Drawer trượt từ cạnh phải hoặc cạnh trái màn hình. |
| **Không gian giỏ hàng** | Cột trái luôn full 100% chiều cao cho giỏ hàng, hiển thị thoải mái $\ge 7$ sản phẩm. | Khi mở Drawer sẽ che khuất giỏ hàng hoặc cột thanh toán. |
| **Trải nghiệm thu ngân** | Cực kỳ trực quan, tập trung chọn hàng nhanh rồi tắt đi, giỏ hàng bên dưới giữ nguyên trạng thái. | Phải đóng mở Drawer bằng vuốt hoặc nút toggle nhỏ, dễ che mất tổng tiền. |
| **Độ phức tạp code** | Thấp, tái sử dụng CSS modal overlay chuẩn có sẵn trong `pos.css`. | Trung bình, phải tính toán animation slide-in/slide-out. |

**Lựa chọn:** Chọn **Phương án 1** vì giải quyết đúng 100% mong muốn của người dùng và tối đa hóa diện tích làm việc của quầy thu ngân.

## 4. Kế hoạch Refactor từng bước
1. **Bước 1:** Tạo component Modal `PosCatalogModal.tsx` bọc `PosCatalogGrid` với header (nút đóng ✕, phím ESC, số lượng mặt hàng) và footer (nút "Xong / Đóng [ESC]").
2. **Bước 2:** Cập nhật `PosCheckoutPage.tsx`: chuyển `salesMode === 'normal'` thành trigger mở `isCatalogModalOpen`, hỗ trợ phím `F3` và `ESC`.
3. **Bước 3:** Tinh chỉnh CSS `pos.css`:
   - `.pos-cart-section`: Cho phép flex chiếm trọn chiều cao cột trái.
   - `.pos-table-responsive`: Tăng chiều cao lên 460px - 500px, giảm padding dòng xuống `6px 10px` để hiển thị $\ge 7$ dòng sản phẩm.
   - `.pos-right-column`: Tăng chiều rộng lên `450px`, tinh chỉnh padding và khoảng cách các fieldset của `pos-payment-panel` để không bị tràn xuống dưới.
4. **Bước 4:** Chạy `npm run build` và test giao diện trên các độ phân giải tiêu chuẩn.
