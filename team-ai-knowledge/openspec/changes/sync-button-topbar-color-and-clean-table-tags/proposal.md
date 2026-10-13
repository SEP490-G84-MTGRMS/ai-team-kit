# Proposal: sync-button-topbar-color-and-clean-table-tags

## Vấn đề
- Màu sắc các nút bấm chính (Primary Button: `.admin-btn-primary`, `.admin-table-btn-primary`, nút `Chi tiết`, `Xuất báo cáo`, nút số trang active...) đang sử dụng màu xanh dương sáng `#0066FF`, trong khi thanh điều hướng Topbar của ứng dụng đang dùng màu Deep Teal `#0F766E` (`var(--blue-primary)`). Sự lệch tông màu này làm giảm tính đồng nhất thị giác giữa thanh điều hướng và các nút hành động.
- Trong các bảng dữ liệu (TenantDataTable, UrgentAlertTable, SupplierTable...), các nhãn phân loại gói dịch vụ (như "Nâng Cao", "Cơ Bản", "Doanh Nghiệp") và trạng thái đang bị đóng khung bằng các đường viền capsule bo tròn (`border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 9999px`), làm bảng dữ liệu bị nặng nề, nhiều ô viền thừa thãi xung quanh chữ, không đạt độ tinh gọn và tối giản mà người dùng yêu cầu.

## Mục tiêu
- Đồng bộ màu sắc nút bấm chính (Primary Button) hoàn toàn ăn khớp với màu Topbar (`#0F766E`, hover `#115E59`, shadow tone Deep Teal).
- Loại bỏ hoàn toàn viền (`border: none`) và khung nền hộp capsule bao quanh các chữ nhãn như Gói dịch vụ ("Nâng Cao", "Cơ Bản", "Doanh Nghiệp") trong bảng dữ liệu; chuyển thành dạng text thuần sạch sẽ, tinh tế.

## Phạm vi
- **In scope**:
  - `src/styles/admin.css`: Cập nhật màu nền, viền và shadow cho `.admin-btn-primary`, `.admin-table-btn-primary`, `.admin-page-btn.active` sang mã màu Deep Teal `#0F766E` (hover `#115E59`).
  - `src/styles/admin.css` & các components bảng (`TenantDataTable.tsx`, `UrgentAlertTable.tsx`): Bỏ viền và khung bọc bao quanh chữ cho `.admin-table-neutral-tag`, `.admin-badge`, `.admin-subdomain-tag`, hiển thị dạng chữ phẳng tự nhiên không đóng hộp.
  - `src/features/supplier/supplier.css` & `src/features/service-expenses/service-expenses.css`: Đồng bộ nút primary sang tone Deep Teal `#0F766E`.
- **Out of scope**:
  - Không thay đổi cấu trúc bảng, logic phân trang, logic bộ lọc hay các hàm nghiệp vụ.
  - Không thay đổi kiểu dáng hình chữ nhật bo góc 6px của các nút thanh công cụ đã chuẩn hóa.

## Người dùng liên quan
- Quản trị viên (Master Admin) & Chủ cửa hàng (Store Owner): giao diện đồng bộ màu sắc thương hiệu, bảng số liệu thanh thoát, thoáng đãng, dễ quét thông tin mà không bị phân tâm bởi các khung viền quanh chữ.

## Tiêu chí thành công
- [ ] Nút bấm chính (Primary Button) trên toàn bộ trang Dashboard, Tenant, Supplier, Expenses mang màu Deep Teal `#0F766E` (hover `#115E59`), trùng khớp 100% với màu thanh Topbar.
- [ ] Chữ "Nâng Cao", "Cơ Bản", "Doanh Nghiệp" và các nhãn phân loại trong bảng dữ liệu không còn viền capsule đóng hộp, hiển thị text phẳng gọn gàng.
- [ ] `npm run build` thành công 100% không phát sinh lỗi TypeScript hay cú pháp CSS.
- [ ] Giao diện được kiểm chứng trực quan trên trình duyệt (Browser Subagent).
