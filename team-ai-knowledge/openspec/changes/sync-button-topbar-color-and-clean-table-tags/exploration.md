# Exploration: sync-button-topbar-color-and-clean-table-tags

## Hiện trạng code
- Nút bấm chính (Primary Buttons):
  - `.admin-btn-primary`, `.admin-table-btn-primary`: Đang set cứng màu `#0066ff`.
  - `.admin-page-btn.active`: Đang set `#0066ff`.
  - Các nút `.btn-primary` trong `supplier.css` và `service-expenses.css`: Đang set `#0066ff`.
  - Trong khi Topbar (`AppTopNav.tsx`) sử dụng `backgroundColor: 'var(--blue-primary)'`, định nghĩa tại `src/index.css` là Deep Teal `#0F766E` (hover `#115E59`, dark `#134E4A`). Điều này gây lệch tông màu giữa thanh điều hướng và các nút hành động.
- Các nhãn text trong bảng dữ liệu:
  - `.admin-subdomain-tag`: Đang có `border: 1px solid var(--border-light); background: var(--bg-soft-blue); padding: 3px 8px; border-radius: 6px;`.
  - `.admin-table-neutral-tag`: Đang có `border: 1px solid #e2e8f0; background: #f8fafc; border-radius: var(--radius-pill);`.
  - `.admin-badge`: Đang có `border: 1px solid #e2e8f0; background: #f1f5f9; border-radius: var(--radius-pill);`.
  - Cả 3 lớp này tạo ra những hộp viền capsule bao bọc lấy từng chữ, khiến bảng dữ liệu bị nặng nề, rối mắt.

## Assumptions & Non-Goals
- **Assumptions**:
  - Dải màu thương hiệu xuyên suốt là Deep Teal (`#0F766E`), hover (`#115E59`), dark (`#134E4A`).
  - Toàn bộ nút chính (Primary) phải ăn khớp 100% với Topbar.
  - Toàn bộ nhãn text trong bảng dữ liệu (Subdomain, Gói cước, Trạng thái) phải bỏ viền `border` và bỏ nền capsule hộp.
- **Non-Goals**:
  - Không thay đổi cấu trúc bảng, layout hay bất kỳ logic dữ liệu nào.
  - Không làm thay đổi hình dáng nút bấm thanh công cụ (vẫn giữ bo góc mềm 6px chuẩn KiotViet).

## Các phương án xử lý
- **Phương án 1 (Sửa cục bộ style inline trong từng file .tsx)**:
  - Nhược điểm: Phân mảnh mã nguồn, dễ sót file, khó bảo trì khi đổi giao diện.
- **Phương án 2 (Chuẩn hóa tập trung qua hệ thống CSS Admin - ĐƯỢC CHỌN)**:
  - Đồng bộ `.admin-btn-primary`, `.admin-table-btn-primary`, `.admin-page-btn.active` về `var(--blue-primary)` (`#0F766E`) và hover `var(--blue-hover)` (`#115E59`).
  - Tinh chỉnh `.admin-subdomain-tag`: `border: none; background: transparent; padding: 0; font-family: var(--font-mono); color: #374151; font-weight: 500;`.
  - Tinh chỉnh `.admin-table-neutral-tag`: `border: none; background: transparent; padding: 0; color: #475569; font-weight: 500;`.
  - Tinh chỉnh `.admin-badge`: `border: none; background: transparent; padding: 0; font-weight: 500;`. Dùng dot tròn nhỏ (nếu có) hoặc màu chữ tự nhiên để thể hiện trạng thái thay vì bọc hộp toàn bộ chữ.
  - Ưu điểm: Áp dụng triệt để cho toàn bộ các bảng, code sạch, đúng chuẩn Clean CSS.

## Rủi ro & Cách giảm thiểu
- Rủi ro tương phản màu khi bỏ nền trạng thái: Giữ nguyên màu chữ trạng thái (`#166534` cho xanh, `#854d0e` cho vàng, `#dc2626` cho đỏ) để đảm bảo độ tương phản cao trên nền trắng `#FFFFFF` theo chuẩn WCAG AA.
