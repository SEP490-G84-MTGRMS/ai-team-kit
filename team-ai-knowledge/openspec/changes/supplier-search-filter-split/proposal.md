# Proposal: supplier-search-filter-split

## Vấn đề
Màn **Quản lý Nhà cung cấp** (`/store-owner/suppliers`) đang gom nhiều tiêu chí vào **một ô tìm kiếm tổng hợp** (kèm tag/autocomplete chung). Chủ cửa hàng không thấy rõ đang lọc theo mã, tên, người liên hệ hay số điện thoại; dễ nhập nhầm tiêu chí và khó kết hợp điều kiện.

API `GET /api/v1/suppliers` đã nhận từng field (`code`, `name`, `contactPerson`, `phone`, `supplierType`, `status`) nhưng UI không expose đủ các input độc lập có gợi ý.

## Mục tiêu
Refactor **chỉ khu vực bộ lọc** để mỗi tiêu chí có label + input riêng, autocomplete độc lập, highlight phần khớp, trạng thái đã chọn rõ ràng. Kết hợp điều kiện theo **AND** khi bấm Tìm kiếm. Không đổi nghiệp vụ quản lý NCC, không đổi bảng danh sách / phân trang / sort / xuất Excel.

## Phạm vi
- In scope:
  - Tách 4 trường: Mã NCC, Tên NCC, Người liên hệ, Số điện thoại — mỗi trường có label, placeholder, autocomplete, highlight khớp, nút X, trạng thái selected.
  - Giữ select **Phân loại NCC** và **Trạng thái**.
  - Nút Tìm kiếm / Đặt lại; AND giữa các field đã nhập; field trống bỏ qua.
  - Cho phép gõ tự do rồi Tìm kiếm (không bắt buộc chọn dropdown).
  - Debounce gợi ý; phân biệt query đang gõ và giá trị đã chọn.
  - Bàn phím: Arrow Up/Down, Enter, Escape; click ngoài đóng dropdown.
  - Tái sử dụng `SupplierFilterBar`, state filter hiện có, API list hiện có.
- Out of scope:
  - Đổi backend / thêm API mới (trừ khi list hiện tại không đủ gợi ý — ưu tiên lọc client từ dữ liệu đã có hoặc reuse `GET /suppliers`).
  - Đổi bảng danh sách, CRUD NCC, gán cửa hàng, sản phẩm theo NCC, xuất Excel, phân trang.
  - Thiết kế lại toàn trang.
  - Tìm theo sản phẩm trong ô tổng hợp (hành vi tag cũ).

## Người dùng liên quan
- Chủ cửa hàng / Admin (`STORE_OWNER`, `ADMIN`) trên `/store-owner/suppliers`.

## Tiêu chí thành công
- [ ] Không còn ô tìm kiếm tổng hợp trên màn này.
- [ ] 4 input độc lập: nhập một ô không đổi giá trị các ô còn lại.
- [ ] Gõ từ khóa hiện dropdown dưới đúng input; phần khớp được highlight.
- [ ] Chọn gợi ý → đóng dropdown, hiện giá trị + trạng thái selected + nút X.
- [ ] Nhiều field + Phân loại + Trạng thái kết hợp AND khi bấm Tìm kiếm.
- [ ] Đặt lại xóa hết query, selected và select.
- [ ] Phân trang, sort, xuất Excel, CRUD NCC vẫn hoạt động như trước.
