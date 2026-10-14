# Phản biện của Skeptic Persona — pos-inventory-invoice-ui

## 1. Đánh giá Tính khả thi & Rủi ro Kỹ thuật
- **Đồng bộ hóa Trạng thái với POS Checkout**:
  - Khi thu ngân bấm `⚡ Đưa vào giỏ hàng POS` hoặc `✔ Chọn Lô bán POS`, hệ thống cần cơ chế đưa sản phẩm và lô đã chọn vào giỏ hàng POS (thông qua `localStorage` / session hoặc navigation state) để thu ngân quay lại quầy có thể tính tiền ngay mà không cần tìm kiếm lại.
  - *Giải pháp*: Lưu sản phẩm/lô được chọn vào `sessionStorage` key `pos_selected_product_batch` trước khi navigate về `/employee/pos` hoặc `/pos`.
- **Tái sử dụng Component Phân trang `TablePagination`**:
  - Không được tự tạo phân trang nội bộ trong file Page hay dùng thẻ `div` phân trang thủ công.
  - Cần bọc danh sách hóa đơn và lịch sử lô theo state `currentPage` (1-based index) và `pageSize`, truyền đúng interface của `TablePagination`.
- **Loại bỏ Hoàn toàn Thành phần Vận chuyển / Giao hàng**:
  - Trong mẫu wireframe `Quan_Ly_Hoa_Don.html` dòng 374 có tab cũ "Lịch sử giao hàng". Tuy nhiên, theo quy tắc nghiệp vụ cốt lõi của siêu thị bán lẻ MT-GRMS và chỉ đạo rõ ràng của User, cửa hàng không áp dụng giao hàng hay phí vận chuyển.
  - Cần loại bỏ hoàn toàn tab giao hàng, tập trung vào 2 tab: "Thông tin chi tiết mặt hàng" và "Lịch sử thanh toán VietQR / Tiền mặt".
- **Kiến trúc DTO Class**:
  - Đảm bảo toàn bộ model đều là `class ...DTO` có `constructor(init?: Partial<T>) { Object.assign(this, init); }` để thuận tiện export và mapping sang Entity C# Backend.

## 2. Kết luận của Skeptic
Thiết kế và giải pháp đã giải quyết triệt để các góc khuất nghiệp vụ, đáp ứng đầy đủ yêu cầu của dự án. Đủ điều kiện phê duyệt để chuyển sang lập `tasks.md`.
