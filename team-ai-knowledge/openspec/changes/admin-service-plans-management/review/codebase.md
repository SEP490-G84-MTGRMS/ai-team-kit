# Codebase Review: admin-service-plans-management

## Kiểm tra sự tương thích với Codebase hiện tại
1. **Kiến trúc thư mục & Componentization**:
   - Tuân thủ cấu trúc feature: `src/features/admin/types/plan.types.ts`, `src/features/admin/data/mockPlanData.ts`, `src/features/admin/components/subscriptions/`.
   - Trang định tuyến: `src/pages/admin/SubscriptionPlanPage.tsx` đặt cùng thư mục với `TenantManagementPage.tsx` và `AdminDashboardPage.tsx`.
   - Đảm bảo tuân thủ nguyên tắc "Mỗi thẻ/modal là 1 component riêng", tuyệt đối không viết mã nguyên khối.
2. **Tái sử dụng Design Tokens & CSS**:
   - Sử dụng 100% CSS class có sẵn trong `src/styles/admin.css` (`.admin-toolbar-card`, `.admin-search-input`, `.admin-data-table`, `.admin-table-card`, `.admin-modal-box`, `.admin-btn`, `.admin-table-btn`).
   - Sử dụng icon đơn sắc Monochrome Lucide React (`Search`, `Plus`, `Edit`, `Eye`, `Power`, `Download`, `Check`, `Layers`, `ShieldCheck`).
3. **Quản lý State & Hiệu năng**:
   - State cục bộ rõ ràng kết hợp React state/React Query, phân trang `TablePagination` dùng chung từ `src/components/common/TablePagination/`.
   - Tìm kiếm debounce tránh render thừa thãi.
4. **Kiểm thử tự động**:
   - Bổ sung unit test kiểm tra tính toán hạn mức quota và logic lọc gói cước để đảm bảo test coverage.

## Kết luận: Chấp nhận
Thiết kế hoàn toàn ăn khớp và đồng bộ với kiến trúc codebase hiện tại của MT-GRMS Frontend.
