# Design Brief: supplier-store-assignment (Refactor Popup Phân Bổ)

## 1. Visual Hierarchy & Design System
Bám sát 100% phong cách thiết kế của màn hình `http://localhost:5173/store-owner/suppliers/products`:
- **Chủ đề màu sắc**: Teal / Cyan chuẩn KiotViet Brand (`#0f766e`, `#0d9488`, background badge `#f0fdfa`, border `#ccfbf1`).
- **Typography**: Inter / Be Vietnam Pro, font mono cho mã (`font-family: var(--font-mono)`).
- **Control Heights**: 32px - 36px đồng bộ cho các input, select và buttons.
- **Borders & Shadows**: Bo góc 8px cho card, 12px - 16px cho popup modal; shadow hiện đại `0 20px 25px -5px rgba(0, 0, 0, 0.1)`.

---

## 2. Thiết kế Popup Refactor: "Thêm nhà cung cấp cho cửa hàng"

### 2.1. Header Popup
- Tiêu đề: **Thêm nhà cung cấp cho cửa hàng**
- Icon: `<Store size={20} color="#0f766e" />`
- Nút đóng: `✕` góc trên bên phải

### 2.2. Phần 1: Chọn Cửa Hàng / Chi Nhánh (Step 1)
- Nhãn: `1. Chọn cửa hàng / chi nhánh *`
- Dropdown Select Chi Nhánh:
  * Hiển thị: `{branch.code} – {branch.name}` (kèm địa chỉ rút gọn)
  * Khi người dùng thay đổi chi nhánh:
    - Tự động xóa danh sách NCC đã tích chọn trước đó.
    - Kích hoạt tải lại danh sách các NCC khả dụng chưa được gán cho chi nhánh mới chọn.

### 2.3. Phần 2: Chọn Nhà Cung Cấp Khả Dụng (Step 2)
- Nhãn: `2. Chọn nhà cung cấp *`
- **Ô tìm kiếm tức thời**:
  * Placeholder: *"Tìm theo mã hoặc tên nhà cung cấp..."*
  * Icon kính lúp `<Search size={15} />`
  * Hỗ trợ gõ từ khóa tiếng Việt không dấu hoặc có dấu, không phân biệt hoa/thường.
- **Danh sách Nhà Cung Cấp Khả Dụng (Scrollable Container, max-height 320px)**:
  * Mỗi item là một thẻ có viền nhẹ, hover chuyển background `#f8fafc`:
    - Checkbox tùy chọn `[x]` hoặc `[ ]`
    - Mã NCC (`font-mono`, in đậm màu `#0066FF`) – Tên NCC (`font-weight: 600`)
    - Dòng phụ: `{contactPerson || 'Chưa có đầu mối'} · {phone || 'Chưa có SĐT'}`
  * **Quy tắc lọc dữ liệu**:
    - Chỉ hiển thị các NCC có `Status == Active` trên toàn hệ thống.
    - Loại bỏ hoàn toàn các NCC đã được gán `Active` cho chi nhánh đã chọn ở Bước 1.
    - Cho phép hiển thị các NCC đã từng bị `Inactive` để kích hoạt lại quan hệ.
- **Thanh Công Cụ Dưới Danh Sách**:
  * Bên trái: Bộ đếm trạng thái `Đã chọn: X nhà cung cấp` (Badge xanh lá nhẹ).
  * Bên phải: Nút hành động nhanh `Chọn tất cả` / `Bỏ chọn tất cả`.
- **Empty States**:
  * Khi chi nhánh đã được gán hết toàn bộ NCC: *"Tất cả nhà cung cấp đang hoạt động đã được gán cho chi nhánh này."*
  * Khi từ khóa tìm kiếm không có kết quả: *"Không tìm thấy nhà cung cấp phù hợp."*

### 2.4. Footer Modal
- Nút `Hủy` (Ghost / Secondary): Đóng popup, không lưu bất kỳ thay đổi nào.
- Nút `Lưu phân bổ` (Primary `#0f766e` hoặc `#0066FF`):
  * Hiển thị spinner khi đang gửi request.
  * Disable nút khi: chưa chọn chi nhánh, số lượng NCC chọn = 0, hoặc đang trong tiến trình submit.
