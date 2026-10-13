# EXP-2026-10-13-001: Khảo sát Phương án Kỹ thuật Giao diện Quản lý Danh mục Hàng hóa (Product Management UI)

## 1. Problem Statement (Vấn đề)
Trong hệ thống bán lẻ siêu thị mini và tạp hóa đa tenant (**MT-GRMS**), người dùng (Chủ cửa hàng và Nhân viên thu ngân) quản lý danh mục lớn (800 – 1.000+ SKUs) với các yêu cầu đặc thù:
- Quy cách đóng gói đa tầng (ĐVT cơ sở & ĐVT quy đổi với mã vạch và giá riêng).
- Hàng Combo - Đóng gói ghép từ các sản phẩm thành phần.
- Phân quyền bảo mật tài chính: Nhân viên không được thấy Giá vốn (COGS) theo [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759).
- Ràng buộc bất biến ĐVT cơ sở sau giao dịch theo [BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760) và xóa an toàn [BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763).

Hiện tại khu vực quản trị tại `/dashboard/products` chưa có giao diện hoàn chỉnh để thực hiện các nghiệp vụ này.

---

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Tài liệu căn cứ:** [Report-3 SRS Mục 1 (FE-01)](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L1208) và Mục 4.1 UI Design; [quan ly hang hoa.md](file:///d:/FPT_uni/Sesmester_9_Fall_26/tham%20khao/Quan%20ly%20hang%20hoa/quan%20ly%20hang%20hoa.md).
- **Mẫu thiết kế màn hình:** Thư mục [Screen Design/Product Management](file:///d:/FPT_uni/Sesmester_9_Fall_26/tham%20khao/Screen%20Design/Product%20Management):
  - `product_management.html`: Màn hình danh sách với Sidebar cây nhóm hàng và bảng sản phẩm.
  - `create_product.html`: Form tạo hàng hóa chuẩn (ĐVT cơ sở & bảng quy đổi ĐVT, giá vốn, giá bán, định mức tồn Min/Max, upload ảnh, mô tả).
  - `create_combosproduct.html`: Form tạo Combo đóng gói (chọn hàng thành phần, tự tính giá vốn, định lượng).
  - `category/create_category.html` & `edit_category.html`: Quản lý nhóm hàng.
  - `detail/product_detail.html`: Panel chi tiết 360 độ (Thông tin, Thẻ kho, Tồn kho chi nhánh).
- **Tech Stack Frontend:** Vite, React 19, TypeScript, Ant Design (antd v5), Tailwind CSS v4, TanStack Query v5, Zustand.
- **Tech Stack Backend:** .NET 8 Clean Architecture (API `/api/products`, `/api/categories`).

---

## 3. Constraints (Ràng buộc kỹ thuật & Nghiệp vụ)
1. **Multi-Tenancy:** Mọi truy vấn và thao tác API đều bắt buộc đính kèm `TenantId` từ token phiên làm việc.
2. **Bảo mật quyền hạn ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4759)):** Ẩn hoàn toàn Giá vốn (COGS) trên cả API lẫn giao diện đối với vai trò `Employee/Cashier`.
3. **Bất biến ĐVT cơ sở ([BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760)):** Khóa không cho phép sửa trường Base Unit khi sản phẩm đã có giao dịch lịch sử.
4. **Bảo toàn dữ liệu lịch sử ([BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4763)):** Chuyển Soft Delete sang `Discontinued` nếu sản phẩm đã phát sinh giao dịch kế toán/kho.
5. **Hiệu năng:** Tra cứu debounce dưới 300ms, hỗ trợ phân trang server-side tối ưu cho 1.000+ sản phẩm.

---

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]:** Backend .NET 8 cung cấp đầy đủ các RESTful endpoints: `/api/products` (CRUD, phân trang, lọc), `/api/categories` (cây nhóm hàng), `/api/products/combo` và `/api/media/upload`.
- **[ASSUMPTION-02]:** Dữ liệu xác thực người dùng được lưu trong Zustand auth store (`role`, `branchId`, `tenantId`).
- **[ASSUMPTION-03]:** Chi nhánh làm việc hiện tại được xác định từ session của người dùng để tính toán tồn kho khả dụng.

---

## 5. Scope & Non-Goals (Phạm vi)
### In Scope
- Giao diện Danh sách sản phẩm (`ProductListPage`): Sidebar bộ lọc cây danh mục, bộ lọc tồn kho, tìm kiếm SKU/Barcode/Tên, bảng phân trang, đánh dấu Favorite.
- Modal Tạo/Sửa Hàng hóa chuẩn (`ProductFormModal`): Quản lý ĐVT cơ sở & Bảng quy đổi ĐVT, giá bán, giá vốn, định mức tồn Min/Max, upload ảnh, mô tả.
- Modal Tạo Combo (`ComboFormModal`): Chọn hàng thành phần, tự tính giá vốn, giá bán Combo, tự động trừ kho thành phần khi mô phỏng.
- Slide-over Drawer Xem chi tiết 360 độ (`ProductDetailDrawer`): 4 tabs (Thông tin, Ghi chú, Thẻ kho, Tồn kho chi nhánh), tác vụ Sửa/Xóa/Sao chép/Ngừng bán.
- Modal Quản lý Nhóm hàng (`CategoryModal`): Cây nhóm hàng, tự sinh mã `CAT-xxx`, chặn trùng tên/mã ([BR-CAT-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4764)).
- Tiện ích: Import/Export Excel, In tem mã vạch.

### Out of Scope (Non-Goals)
- Nghiệp vụ kiểm kê, lập phiếu nhập kho nhà cung cấp PO/GRN (thuộc capability `supplier-po`).
- Màn hình bán hàng thu ngân tại quầy POS và tích hợp máy in bill nhiệt K80 (thuộc `pos-checkout`).
- Quản lý điều chuyển hàng giữa các chi nhánh (thuộc `inventory-transfer`).

---

## 6. So sánh các Phương án Kiến trúc UI (Architecture Evaluation)

### Phương án 1: Multi-Page Navigation (Chuyển trang URL riêng biệt)
- Mỗi tác vụ là một route riêng: `/dashboard/products/create`, `/dashboard/products/create-combo`, `/dashboard/products/:id`.
- **Ưu điểm:** Tách biệt code từng trang, URL rõ ràng, bookmark được từng màn hình.
- **Nhược điểm:** Mất ngữ cảnh danh sách và bộ lọc khi quay lại; tốc độ thao tác của chủ cửa hàng tạp hóa bị chậm khi cần thêm nhiều mặt hàng liên tục.

### Phương án 2 (Được chọn): Single Page with Master-Detail Drawer & Dynamic Modal Forms
- Trang danh sách `/dashboard/products` là trung tâm. Thao tác xem chi tiết dùng **Ant Design Drawer** trượt từ phải sang; thao tác Thêm mới/Sửa dùng **Ant Design Modal** đa khối với tùy chọn `Save & Add Another`.
- **Ưu điểm:**
  - Giữ nguyên trạng thái phân trang, tìm kiếm và bộ lọc đang chọn của người dùng.
  - Phù hợp hoàn hảo với nguyên mẫu thiết kế tại [Screen Design/Product Management](file:///d:/FPT_uni/Sesmester_9_Fall_26/tham%20khao/Screen%20Design/Product%20Management).
  - Tối ưu hóa trải nghiệm bán lẻ: đóng mở nhanh, phản hồi tức thời qua TanStack Query cache.
- **Nhược điểm:** Cần quản lý modal state tốt và tách nhỏ component để tránh re-render thừa.

---

## 7. Rủi ro & Giải pháp Giảm thiểu (Risks & Mitigation)
| Rủi ro | Mức độ | Giải pháp giảm thiểu |
|---|---|---|
| **Lộ giá vốn (COGS) cho nhân viên** | Cao | Áp dụng bảo vệ 2 lớp: Backend không serialize trường `CostPrice` cho role Employee; Frontend kiểm tra quyền `canViewCostPrice` để ẩn cột trên bảng và ẩn ô nhập liệu. |
| **Phá vỡ tính toàn vẹn tồn kho khi sửa ĐVT** | Cao | Khi mở form chỉnh sửa sản phẩm, gọi API kiểm tra cờ `hasTransactions`. Nếu `true`, disable trường Base Unit và hiển thị tooltip giải thích theo [BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4760). |
| **Trùng lặp Barcode khi nhập liệu** | Trung bình | Async validation kiểm tra barcode debounce 400ms trước khi submit; hiển thị thông báo lỗi in-line. |
