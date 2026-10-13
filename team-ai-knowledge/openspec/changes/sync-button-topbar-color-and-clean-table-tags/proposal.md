# Proposal: sync-button-topbar-color-and-clean-table-tags

## Vấn đề
- Màu sắc nút bấm chính (Primary Button: `.admin-btn-primary`, `.admin-table-btn-primary`, nút `Chi tiết`, `Xuất báo cáo`, phân trang active...) đang sử dụng màu `#0066FF`, trong khi thanh điều hướng Topbar của ứng dụng sử dụng màu Deep Teal `#0F766E` (`var(--blue-primary)`). Sự lệch màu này làm giao diện thiếu nhất quán.
- Trong các bảng dữ liệu (UrgentAlertTable, TenantDataTable, SupplierTable...), tất cả các nhãn chữ bao gồm:
  1. Subdomain (`.admin-subdomain-tag`)
  2. Gói Dịch Vụ (`.admin-table-neutral-tag`: Nâng Cao, Cơ Bản, Doanh Nghiệp...)
  3. Trạng Thái (`.admin-badge`: Sắp hết hạn, Hoạt động, Đang ân hạn...)
  đang bị bao bọc bởi các đường viền cứng (`border: 1px solid ...`) và nền capsule. Điều này làm bảng dữ liệu trông rối mắt, cồng kềnh, phân tán sự tập trung. Người dùng yêu cầu loại bỏ hoàn toàn border bao quanh chữ.

## Mục tiêu
- Đồng bộ màu sắc tất cả nút chính (Primary Button) trùng khớp 100% với màu Deep Teal của Topbar (`#0F766E`, hover `#115E59`).
- Loại bỏ hoàn toàn border (`border: none`) và khung nền hộp khỏi TẤT CẢ các nhãn chữ trong bảng dữ liệu (Subdomain, Gói dịch vụ, Trạng thái), chuyển sang hiển thị plain-text tinh gọn, hiện đại và sạch sẽ.

## Phạm vi
- **In scope**:
  - `src/styles/admin.css`:
    - `.admin-btn-primary`, `.admin-table-btn-primary`, `.admin-page-btn.active`: Đổi màu sang Deep Teal `#0F766E` (hover `#115E59`).
    - `.admin-subdomain-tag`: Bỏ border, bỏ background, hiển thị font monospace phẳng gọn.
    - `.admin-table-neutral-tag`: Bỏ border, bỏ background capsule, hiển thị text thuần.
    - `.admin-badge`: Bỏ border, bỏ background capsule; hiển thị text với chấm dot màu trạng thái hoặc text màu tinh tế.
  - `src/styles/admin.css` & `UrgentAlertTable.tsx`, `TenantDataTable.tsx`: Đảm bảo hiển thị không còn viền quanh bất kỳ chữ nào.
  - `src/features/supplier/supplier.css` & `src/features/service-expenses/service-expenses.css`: Đồng bộ các nút primary sang tone Deep Teal `#0F766E`.
- **Out of scope**:
  - Không thay đổi logic dữ liệu, API, router hay chức năng nghiệp vụ.

## Tiêu chí thành công
- [ ] Tất cả nút Primary mang màu Deep Teal `#0F766E`, hover `#115E59`.
- [ ] Tất cả nhãn chữ trong bảng (Subdomain, Gói Dịch Vụ, Trạng Thái) hoàn toàn không có border bao quanh.
- [ ] `npm run build` thành công không lỗi.
- [ ] Kiểm chứng giao diện trực quan trên browser.
