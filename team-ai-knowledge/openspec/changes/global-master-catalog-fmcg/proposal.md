# Proposal: Kho Danh mục Hàng hóa Mẫu Toàn Cầu (Global Master Catalog)

## 1. Vấn đề (Problem)
- **Rào cản khởi tạo dữ liệu lớn (Cold-Start Problem)**: Khi một chủ tiệm tạp hóa mới đăng ký tài khoản SaaS MT-GRMS, khó khăn lớn nhất khiến họ nản lòng là phải nhập thủ công 1.500 – 4.000 mặt hàng tiêu dùng nhanh (FMCG) từ mì gói, bánh kẹo, nước giải khát, bia rượu đến hóa mỹ phẩm.
- **Tốn kém thời gian & dễ sai sót**: Việc tự gõ tên sản phẩm, tìm kiếm ảnh trên mạng, tự định nghĩa quy cách đóng gói (Thùng/Lốc/Lon) và nhập mã vạch EAN-13 thường mất hàng tuần, đồng thời dễ phát sinh nhầm lẫn giữa mã vạch lon lẻ và mã vạch trên thùng carton.
- **Thiếu tính chuẩn hóa**: Không có một cơ sở dữ liệu mẫu dùng chung cho toàn bộ các tenant, dẫn đến việc dữ liệu sản phẩm giữa các cửa hàng bị phân mảnh, thiếu chuyên nghiệp và không thể tận dụng sức mạnh dữ liệu của nền tảng SaaS.

## 2. Mục tiêu (Goals)
1. **Xây dựng Thư viện Hàng hóa Mẫu Toàn Cầu (Global FMCG Master Catalog)** tại phân hệ Quản trị Nền tảng (`/admin/master-catalog`):
   - Cho phép Super Admin quản lý thư viện chuẩn gồm hàng nghìn mã vạch EAN-13 hàng FMCG phổ biến nhất Việt Nam kèm tên chuẩn, thương hiệu, hình ảnh HD, thuế suất và quy cách mẫu (VD: 1 Thùng = 30 gói, 1 Lốc = 6 lon).
2. **Hỗ trợ Import danh mục hàng loạt từ file Excel (.xlsx)**:
   - Super Admin có thể tải template Excel chuẩn và import hàng nghìn mặt hàng vào Master Catalog chỉ trong vài giây thông qua engine ClosedXML, có kiểm tra lỗi trùng mã vạch và validation cấu trúc dữ liệu.
3. **Cơ chế Tự động điền (Auto-fill) thông minh cho Tenant**:
   - Khi chủ tiệm hoặc thu ngân tại bất kỳ tenant nào quét mã vạch bằng máy quét USB HID hoặc camera tại màn hình Thêm sản phẩm (`ProductFormModal`) hoặc quầy POS, nếu mã vạch đã có trong Master Catalog, form sẽ tự động nạp toàn bộ Tên + Hình ảnh + Đơn vị cơ bản + Bảng quy cách đơn vị quy đổi mà không cần gõ lại từ đầu.

## 3. Phạm vi (Scope)
### In Scope
- **Backend (`MT_GRMS_BACKEND`)**:
  - Tạo Entity `MasterProduct` & `MasterProductUnit` kế thừa `BaseEntity` (Global-scoped, không thuộc riêng tenant nào).
  - API CRUD Master Catalog cho Super Admin (`/api/admin/master-catalog`), bao gồm phân trang, tìm kiếm, lọc theo ngành hàng/thương hiệu và lấy 4 chỉ số KPI.
  - API Import Excel (`/api/admin/master-catalog/import-excel`) và xuất template Excel mẫu (`/api/admin/master-catalog/export-template`).
  - API tra cứu nhanh Barcode từ Master Catalog dành cho Tenant (`GET /api/products/lookup-master?barcode=...`).
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - Thêm menu điều hướng "Hàng mẫu Toàn cầu" vào `AdminSidebar.tsx` với icon đơn sắc (Monochrome SVG).
  - Xây dựng giao diện trang `/admin/master-catalog` theo chuẩn KiotViet UI (Be Vietnam Pro, Electric Blue `#0066FF`, bo góc 24px, không animation rung lắc/nhún nhảy):
    - 4 thẻ KPI thống kê số liệu.
    - Thanh tìm kiếm và bộ lọc nhanh.
    - Bảng danh sách hàng mẫu hiển thị ảnh, barcode EAN-13, tên, quy cách đóng gói và số lượng tiệm đã clone.
    - Modal/Drawer thêm & sửa sản phẩm mẫu thủ công.
    - Modal kéo thả Import file Excel với xem trước (Preview) và báo cáo lỗi dòng vi phạm.
  - Tích hợp tính năng Auto-lookup barcode trong `ProductFormModal.tsx` của Tenant để tự động gợi ý và điền form.

### Out of Scope
- Tự động thay đổi giá bán hoặc giá vốn của từng tiệm (giá bán và giá vốn do từng tiệm tự quyết định).
- Cho phép Tenant chỉnh sửa trực tiếp vào cơ sở dữ liệu gốc Master Catalog của Super Admin.

## 4. Người dùng & Phân quyền
- **Super Admin (`ADMIN`)**: Toàn quyền xem, thêm, sửa, xóa, tải template và import file Excel vào Master Catalog.
- **Store Owner & Cashier (`STORE_OWNER`, `CASHIER`)**: Quyền đọc (Read-only lookup) thông qua mã vạch để tự động điền form tạo sản phẩm và gợi ý thêm nhanh tại POS/nhập hàng.

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Super Admin có thể xem danh sách, lọc, tìm kiếm và quản lý hàng mẫu tại `/admin/master-catalog`.
- [ ] Super Admin có thể tải file template Excel mẫu và import thành công file danh mục FMCG mẫu (>100 SKU) không xảy ra lỗi.
- [ ] Tại màn hình tạo sản phẩm của Tenant (`ProductFormModal.tsx`), khi quét hoặc gõ mã vạch có trong Master Catalog, form tự động hiển thị gợi ý và nạp đầy đủ Tên, Ảnh, ĐVT cơ bản và danh sách Đơn vị quy đổi khi được chọn.
- [ ] Toàn bộ UI tuân thủ `RULE_UI_DESIGN_SYSTEM.md`: Không có animation nhún nhảy, không dùng emoji làm icon, màu KiotViet Blue `#0066FF`, typography `Be Vietnam Pro` & `JetBrains Mono`.
- [ ] Cả `MT_GRMS_BACKEND` và `MT_GRMS_FRONTEND` đều build và test pass 100%.
